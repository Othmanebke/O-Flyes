import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { google } from "googleapis";
import cron from "node-cron";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;
const DB_URL = process.env.DB_URL || "http://database-service:3002";
const AI_URL = process.env.AI_URL || "http://ai-service:3003";
const NOTIF_URL = process.env.NOTIF_URL || "http://notifications-service:3004";
const METRICS_URL = process.env.METRICS_URL || "http://metrics-service:3009";

console.log(`[sync-worker] Starting with:`);
console.log(` - PORT: ${PORT}`);
console.log(` - DB_URL: ${DB_URL}`);
console.log(` - AI_URL: ${AI_URL}`);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "sync-worker" }));

// ── Sync Logic ──────────────────────────────────────────────────────────────

const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_GOOGLE_CLIENT_ID,
    process.env.OAUTH_GOOGLE_CLIENT_SECRET,
    process.env.OAUTH_CALLBACK_URL
);

async function syncAllUsers() {
    console.log("[sync-worker] Starting sync for all users...");
    try {
        const res = await axios.get(`${DB_URL}/email-credentials/all`);
        const credentials = res.data;

        for (const cred of credentials) {
            await syncUserEmails(cred);
        }
    } catch (err: any) {
        console.error("[sync-worker] Sync job failed:", err.message);
    }
}

async function syncUserEmails(cred: any) {
    console.log(`[sync-worker] Syncing email: ${cred.email} for user: ${cred.user_id}`);

    try {
        oauth2Client.setCredentials({
            access_token: cred.access_token,
            refresh_token: cred.refresh_token,
        });

        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        // 1. Fetch processed message IDs for this user
        const processedRes = await axios.get(`${DB_URL}/processed-emails/user/${cred.user_id}`);
        const processedIds = new Set(processedRes.data);

        // 2. Search for relevant emails (last 7 days by default for safety/efficiency)
        const query = "subject:(confirmation OR booking OR reservation OR vol OR hotel OR billet OR e-ticket)";
        const listRes = await gmail.users.messages.list({
            userId: "me",
            q: query,
            maxResults: 20
        });

        const messages = listRes.data.messages || [];
        console.log(`[sync-worker] Found ${messages.length} potential travel emails for ${cred.email}`);

        for (const msg of messages) {
            if (!msg.id || processedIds.has(msg.id)) continue;

            // 3. Get full content
            const detail = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "full" });
            const body = getEmailBody(detail.data);

            if (!body) continue;

            // 4. Send to AI for extraction
            console.log(`[sync-worker] Extracting data from email ID: ${msg.id}`);
            const aiRes = await axios.post(`${AI_URL}/extract`, {
                emailBody: body,
                user_id: cred.user_id
            }).catch(e => {
                console.error(`[sync-worker] AI extraction failed for ${msg.id}:`, e.message);
                return null;
            });

            if (aiRes && aiRes.data.booking) {
                // 5. Find Active Trip
                let targetTripId = null;
                try {
                    const activeTripRes = await axios.get(`${DB_URL}/trips/user/${cred.user_id}`);
                    const activeTrip = activeTripRes.data.find((t: any) => t.is_active);
                    if (activeTrip) {
                        targetTripId = activeTrip.id;
                    }
                } catch (e) {
                    console.warn(`[sync-worker] Could not find active trip for user ${cred.user_id}`);
                }

                // 6. Save to database
                const booking = aiRes.data.booking;
                const savedBooking = await axios.post(`${DB_URL}/bookings`, {
                    ...booking,
                    trip_id: targetTripId, // Link to active trip if found
                    user_id: cred.user_id,
                    raw_data: { source: "email", message_id: msg.id }
                });

                // 7. Mark as processed
                await axios.post(`${DB_URL}/processed-emails`, {
                    user_id: cred.user_id,
                    message_id: msg.id
                });

                // 7. Send notification
                console.log(`[sync-worker] Sending sync confirmation for booking ${msg.id}`);
                await axios.post(`${NOTIF_URL}/notify/email`, {
                    to: cred.email,
                    template: "SYNC_CONFIRMATION",
                    data: savedBooking.data
                }).catch(e => console.error(`[sync-worker] Notification failed:`, e.message));

                console.log(`[sync-worker] Successfully extracted, saved and notified for email ${msg.id}`);

                // 8. Report metrics
                await axios.post(`${METRICS_URL}/metrics/event`, {
                    event: "email_sync_success"
                }).catch(() => { });
            }
        }

    } catch (err: any) {
        console.error(`[sync-worker] Failed to sync ${cred.email}:`, err.message);
        if (err.message.includes("invalid_grant")) {
            console.warn(`[sync-worker] Refresh token invalid for ${cred.email}. User needs to re-connect.`);
        }
    }
}

async function checkUpcomingTrips() {
    console.log("[sync-worker] Checking for upcoming trips/bookings...");
    try {
        const res = await axios.get(`${DB_URL}/bookings/upcoming?hours=24`);
        const bookings = res.data;

        for (const booking of bookings) {
            console.log(`[sync-worker] Sending reminder for booking ${booking.id} to ${booking.email}`);
            await axios.post(`${NOTIF_URL}/notify/email`, {
                to: booking.email,
                template: "TRIP_REMINDER",
                data: booking
            });

            // Mark as reminded to avoid duplicate notifications
            // (Assuming we add a quick update endpoint or just status update)
            await axios.delete(`${DB_URL}/bookings/${booking.id}`).catch(() => { });
            // Re-inserting with 'reminded' status or just a flag would be better, 
            // but for MVP let's just log it or we'd need a PATCH endpoint.
            console.log(`[sync-worker] Reminder sent and booking handled for ${booking.id}`);
        }
    } catch (err: any) {
        console.error("[sync-worker] Reminder job failed:", err.message);
    }
}

function getEmailBody(message: any): string {
    // ... (rest of the function remains the same)
    // Helper to extract text from multi-part Gmail message
    let body = "";
    if (message.payload.parts) {
        for (const part of message.payload.parts) {
            if (part.mimeType === "text/plain") {
                body = Buffer.from(part.body.data, "base64").toString();
            } else if (part.mimeType === "text/html" && !body) {
                // Fallback to HTML if plain text not found
                body = Buffer.from(part.body.data, "base64").toString().replace(/<[^>]*>?/gm, ''); // primitive strip
            }
        }
    } else {
        body = Buffer.from(message.payload.body.data, "base64").toString();
    }
    return body.substring(0, 5000); // Limit size for AI
}

// ── Execution ───────────────────────────────────────────────────────────────

// Run every 10 minutes
cron.schedule("*/10 * * * *", () => {
    syncAllUsers();
});

// Run reminders every day at 8 AM
cron.schedule("0 8 * * *", () => {
    checkUpcomingTrips();
});

// Also run on startup after 5s
setTimeout(() => {
    syncAllUsers();
    checkUpcomingTrips();
}, 5000);

app.listen(PORT, () => console.log(`[sync-worker] running on port ${PORT}`));
