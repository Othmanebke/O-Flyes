import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.DB_PORT || 3002;

app.use(cors());
app.use(express.json());

// ── PostgreSQL connection ────────────────────────────────────────────────────
export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || "oflyes",
    password: process.env.POSTGRES_PASSWORD || "oflyes_password",
    database: process.env.POSTGRES_DB || "oflyes_db",
  });

console.log(`[database-service] Starting with:`);
console.log(` - PORT: ${PORT}`);
console.log(` - DATABASE_URL: ${process.env.DATABASE_URL ? '(secret)' : 'using separate fields'}`);

// ── Auto-initialisation du schéma ────────────────────────────────────────────
async function initSchema() {
  try {
    // Drop table to migrate for MVP (User requirement)
    try {
      await pool.query("DROP TABLE IF EXISTS bookings CASCADE;");
      console.log("[database-service] Dropped bookings table for MVP migration ✓");
    } catch (e: any) {
      console.warn("[database-service] Drop table skipped:", e.message);
    }

    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      await pool.query(sql);
      console.log("[database-service] Schema initialized ✓");
    }
  } catch (err: any) {
    console.warn("[database-service] Schema init skipped:", err.message);
  }
}

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", service: "database" });
  } catch {
    res.status(500).json({ status: "error" });
  }
});

// ── Users ────────────────────────────────────────────────────────────────────
app.post("/users", async (req, res) => {
  const { email, name, password_hash, provider } = req.body;
  const result = await pool.query(
    `INSERT INTO users (email, name, password_hash, provider, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [email, name, password_hash, provider || "local"]
  );
  res.status(201).json(result.rows[0]);
});

app.get("/users/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: "Not found" });
  res.json(result.rows[0]);
});

app.post("/users/:id/upgrade", async (req, res) => {
  const { role } = req.body;
  try {
    const result = await pool.query("UPDATE users SET role = $1 WHERE id = $2 RETURNING *", [role || 'premium', req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Destinations ─────────────────────────────────────────────────────────────
app.get("/destinations", async (req, res) => {
  const { climate, min_budget, max_budget, period } = req.query;
  let query = "SELECT * FROM destinations WHERE 1=1";
  const params: any[] = [];
  let i = 1;
  if (climate) { query += ` AND climate = $${i++}`; params.push(climate); }
  if (min_budget) { query += ` AND avg_daily_budget >= $${i++}`; params.push(Number(min_budget)); }
  if (max_budget) { query += ` AND avg_daily_budget <= $${i++}`; params.push(Number(max_budget)); }
  if (period) { query += ` AND best_periods @> ARRAY[$${i++}]`; params.push(period); }
  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.get("/destinations/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM destinations WHERE id = $1", [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: "Not found" });
  res.json(result.rows[0]);
});

// ── Trips (saved trips per user) ─────────────────────────────────────────────
app.post("/trips", async (req, res) => {
  const { user_id, destination_id, title, start_date, end_date, budget, status, is_active, preferences } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trips (user_id, destination_id, title, start_date, end_date, budget, status, is_active, preferences, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
      [user_id, destination_id || null, title, start_date, end_date, budget, status || 'planned', is_active || false, preferences || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/trips/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT t.*, d.name as destination_name, d.country, d.image_url FROM trips t LEFT JOIN destinations d ON d.id = t.destination_id WHERE t.id = $1",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Trip not found" });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/trips/:id", async (req, res) => {
  const { title, start_date, end_date, budget, status, is_active, preferences } = req.body;
  try {
    const result = await pool.query(
      `UPDATE trips 
       SET title = COALESCE($1, title), 
           start_date = COALESCE($2, start_date), 
           end_date = COALESCE($3, end_date), 
           budget = COALESCE($4, budget), 
           status = COALESCE($5, status),
           is_active = COALESCE($6, is_active),
           preferences = COALESCE($7, preferences)
       WHERE id = $8 RETURNING *`,
      [title, start_date, end_date, budget, status, is_active, preferences, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Trip not found" });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/trips/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM trips WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Trip not found" });
    res.json({ message: "Trip deleted", id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/trips/:id/activate", async (req, res) => {
  try {
    // Deactivate all other trips for this user
    const tripRes = await pool.query("SELECT user_id FROM trips WHERE id = $1", [req.params.id]);
    if (!tripRes.rows.length) return res.status(404).json({ error: "Trip not found" });

    const userId = tripRes.rows[0].user_id;
    await pool.query("UPDATE trips SET is_active = false WHERE user_id = $1", [userId]);

    // Activate this one
    const result = await pool.query("UPDATE trips SET is_active = true WHERE id = $1 RETURNING *", [req.params.id]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/trips/user/:userId", async (req, res) => {
  const result = await pool.query(
    "SELECT t.*, d.name as destination_name, d.country, d.image_url as img FROM trips t LEFT JOIN destinations d ON d.id = t.destination_id WHERE t.user_id = $1 ORDER BY t.created_at DESC",
    [req.params.userId]
  );
  res.json(result.rows);
});

app.delete("/trips/:id", async (req, res) => {
  await pool.query("DELETE FROM trips WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// ── Bookings ─────────────────────────────────────────────────────────────────
// Legacy /bookings POST (kept for internal use)
app.post("/bookings", async (req, res) => {
  const { trip_id, type, title, provider, confirmation_number, start_datetime, end_datetime, price, currency, location, status, external_url, external_reference, booking_url, raw_data } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO bookings (trip_id, type, title, provider, confirmation_number, start_datetime, end_datetime, price, currency, location, status, external_url, external_reference, booking_url, raw_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW()) RETURNING *`,
      [
        trip_id, type, title, provider, confirmation_number,
        start_datetime || null, end_datetime || null, price || 0, currency || 'EUR',
        location || null, status || 'pending', external_url || null,
        external_reference || null, booking_url || null,
        raw_data ? JSON.stringify(raw_data) : null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Scenarios MOCK (Phase B) ──────────────────────────────────────────────────
app.post("/trips/:id/seed-mock-scenario", async (req, res) => {
  const tripId = req.params.id;
  const { scenario } = req.body; // 'A', 'B', or 'C'

  try {
    // 1. Delete existing bookings for a clean slate
    await pool.query("DELETE FROM bookings WHERE trip_id = $1", [tripId]);

    // Format dates based on current date for realistic testing
    const now = new Date();
    const dPlus = (days: number, hours: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      d.setHours(hours, 0, 0, 0);
      return d.toISOString();
    };

    interface MockBooking {
      type: string;
      title: string;
      provider: string;
      start: string;
      end: string;
      price: number;
      location: string;
      status: string;
      ex_ref: string | null;
      raw: Record<string, any>;
    }

    let newBookings: MockBooking[] = [];

    if (scenario === 'A') {
      // SCENARIO A: Perfect Trip (Flight + Hotel + Activities)
      newBookings = [
        {
          type: 'flight', title: 'Vol Aller CDG-FCO', provider: 'Air France',
          start: dPlus(10, 8), end: dPlus(10, 10), price: 150,
          location: 'CDG -> FCO', status: 'confirmed', ex_ref: 'AF-1029',
          raw: { flight_number: "AF123", duration_minutes: 120, cabin_class: "Economy", departure_airport: "CDG", arrival_airport: "FCO" }
        },
        {
          type: 'flight', title: 'Vol Retour FCO-CDG', provider: 'Air France',
          start: dPlus(14, 18), end: dPlus(14, 20), price: 150,
          location: 'FCO -> CDG', status: 'confirmed', ex_ref: 'AF-1030',
          raw: { flight_number: "AF124", duration_minutes: 120, cabin_class: "Economy", departure_airport: "FCO", arrival_airport: "CDG" }
        },
        {
          type: 'hotel', title: 'Grand Hotel Roma', provider: 'Booking.com',
          start: dPlus(10, 15), end: dPlus(14, 11), price: 600,
          location: 'Via Veneto, Rom', status: 'confirmed', ex_ref: 'BKG-9922',
          raw: { address: "Via Veneto, Roma", room_type: "Double Superior", stars: 4, rating: 4.8, nights_count: 4 }
        },
        {
          type: 'activity', title: 'Visite Colisée VIP', provider: 'GetYourGuide',
          start: dPlus(11, 10), end: dPlus(11, 13), price: 45,
          location: 'Colosseum, Roma', status: 'confirmed', ex_ref: 'GYG-11',
          raw: { duration_minutes: 180, meeting_point: "Arch of Constantine", ticket_type: "Skip-the-line" }
        }
      ];
    } else if (scenario === 'B') {
      // SCENARIO B: Incomplete Trip (Only outbound flight, missing 1 night hotel, pending prices)
      newBookings = [
        {
          type: 'flight', title: 'Vol Aller Aéroport', provider: 'EasyJet',
          start: dPlus(10, 9), end: dPlus(10, 11), price: 0, // Pending price
          location: 'Paris -> Rome', status: 'pending', ex_ref: null,
          raw: { flight_number: "U2-404" }
        },
        {
          type: 'hotel', title: 'AirBnb Rome Centre', provider: 'Airbnb',
          start: dPlus(10, 16), end: dPlus(13, 10), price: 300, // Missing the final night (leaves on 14th)
          location: 'Trastevere', status: 'confirmed', ex_ref: 'ABNB-XYZ',
          raw: { address: "Trastevere", nights_count: 3 }
        }
      ];
    } else if (scenario === 'C') {
      // SCENARIO C: Incoherent Trip (Activity before arrival, overlapping flights)
      newBookings = [
        {
          type: 'flight', title: 'Vol Aller', provider: 'Ryanair',
          start: dPlus(10, 14), end: dPlus(10, 16), price: 80, // Arrives at 16:00
          location: 'ORY -> CIA', status: 'confirmed', ex_ref: 'RY-1',
          raw: {}
        },
        {
          type: 'activity', title: 'Tour Gastronomique', provider: 'Viator',
          start: dPlus(10, 12), end: dPlus(10, 15), price: 90, // Starts at 12:00 (Before flight arrives!)
          location: 'Rome Center', status: 'confirmed', ex_ref: 'VIA-99',
          raw: {}
        }
      ];
    }

    // Insert all
    const inserted = [];
    for (const b of newBookings) {
      const resBooking = await pool.query(
        `INSERT INTO bookings (trip_id, type, title, provider, start_datetime, end_datetime, price, currency, location, status, external_reference, raw_data, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'EUR', $8, $9, $10, $11, NOW()) RETURNING *`,
        [tripId, b.type, b.title, b.provider, b.start, b.end, b.price, b.location, b.status, b.ex_ref, JSON.stringify(b.raw)]
      );
      inserted.push(resBooking.rows[0]);
    }

    // Also update trip budget to ensure realistic calculations
    await pool.query("UPDATE trips SET budget = 1000 WHERE id = $1", [tripId]);

    res.status(201).json({ message: `Scenario ${scenario} injecté avec succès`, bookings: inserted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/trips/:id/bookings", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM bookings WHERE trip_id = $1 ORDER BY start_datetime ASC",
    [req.params.id]
  );
  res.json(result.rows);
});

app.post("/trips/:id/bookings", async (req, res) => {
  const { type, title, provider, confirmation_number, start_datetime, end_datetime, price, currency, location, status, external_url, external_reference, booking_url, raw_data } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO bookings(trip_id, type, title, provider, confirmation_number, start_datetime, end_datetime, price, currency, location, status, external_url, external_reference, booking_url, raw_data, created_at)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW()) RETURNING * `,
      [
        req.params.id, type, title, provider, confirmation_number,
        start_datetime || null, end_datetime || null, price || 0, currency || 'EUR',
        location || null, status || 'pending', external_url || null,
        external_reference || null, booking_url || null,
        raw_data ? JSON.stringify(raw_data) : null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/bookings/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query("UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Booking not found" });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/bookings/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM bookings WHERE id = $1 RETURNING id", [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: "Booking not found" });
  res.status(204).end();
});

// ── Trip Analysis (Dashboard Brain) ──────────────────────────────────────────
app.get("/trips/:id/analysis", async (req, res) => {
  try {
    const tripId = req.params.id;

    // 1. Fetch trip details
    const tripRes = await pool.query("SELECT * FROM trips WHERE id = $1", [tripId]);
    if (!tripRes.rows.length) return res.status(404).json({ error: "Trip not found" });
    const trip = tripRes.rows[0];

    // 2. Fetch all bookings for this trip
    const bookingsRes = await pool.query("SELECT * FROM bookings WHERE trip_id = $1 ORDER BY start_datetime ASC", [tripId]);
    const bookings = bookingsRes.rows;

    // --- Budget Tracking ---
    const totalBudget = parseFloat(trip.budget) || 0;
    const usedBudget = bookings.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
    const budgetPercentage = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0;

    // --- Coverage & Empty Days ---
    let missingHotelNights = 0;
    let missingReturnFlight = true;
    let missingOutboundFlight = true;
    let emptyDays: string[] = [];
    let hasActivity = false;
    let firstFlightArrival: Date | null = null;
    const warnings: string[] = [];

    // Parse dates to handle logic
    let tripStart = trip.start_date ? new Date(trip.start_date) : null;
    let tripEnd = trip.end_date ? new Date(trip.end_date) : null;

    if (tripStart && tripEnd) {
      // Create a set of dates covered by activities/flights
      const coveredDates = new Set<string>();
      let totalNights = Math.round((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
      if (totalNights <= 0) totalNights = 1;

      let coveredHotelNights = 0;

      bookings.forEach(b => {
        const bStart = b.start_datetime ? new Date(b.start_datetime) : null;
        const bEnd = b.end_datetime ? new Date(b.end_datetime) : null;

        if (b.type === "activity" || b.type === "flight" || b.type === "transport") {
          if (b.type === "activity") hasActivity = true;

          // Register dates active
          if (bStart) {
            coveredDates.add(bStart.toISOString().split('T')[0]);
            if (bEnd) {
              coveredDates.add(bEnd.toISOString().split('T')[0]);
            }
          }
        }

        if (b.type === "hotel" && bStart && bEnd) {
          const nights = Math.round((bEnd.getTime() - bStart.getTime()) / (1000 * 60 * 60 * 24));
          coveredHotelNights += (nights > 0 ? nights : 1);
        }

        if (b.type === "flight") {
          // Basic heuristics: if flight is close to start date => outbound. Close to end => return.
          if (bStart) {
            const daysFromStart = Math.abs((bStart.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
            const daysFromEnd = Math.abs((bStart.getTime() - tripEnd.getTime()) / (1000 * 60 * 60 * 24));

            if (daysFromStart <= 2) {
              missingOutboundFlight = false;
              // If this is the outbound flight, store its end date (arrival time)
              if (bEnd && (!firstFlightArrival || bEnd < firstFlightArrival)) {
                firstFlightArrival = bEnd;
              }
            }
            if (daysFromEnd <= 2) missingReturnFlight = false;
          }
        }
      });

      // Pass 2: Check for Incoherent Schedules
      bookings.forEach(b => {
        if (b.type === "activity" && b.start_datetime && firstFlightArrival) {
          const actStart = new Date(b.start_datetime);
          if (actStart < firstFlightArrival) {
            warnings.push(`Incohérence: '${b.title}' commence avant l'arrivée prévue de votre vol aller.`);
          }
        }
      });

      missingHotelNights = Math.max(0, totalNights - coveredHotelNights);

      // Find empty days
      for (let d = new Date(tripStart); d <= tripEnd; d.setDate(d.getDate() + 1)) {
        const dStr = d.toISOString().split('T')[0];
        if (!coveredDates.has(dStr)) {
          emptyDays.push(dStr);
        }
      }
    } else {
      // Cannot calculate coverage properly without dates
      missingHotelNights = -1; // Unknown
    }

    // --- Generate Warnings ---
    if (missingOutboundFlight && tripStart) warnings.push("Aucun vol d'aller détecté / planifié.");
    if (missingReturnFlight && tripEnd) warnings.push("Aucun vol de retour détecté / planifié.");
    if (missingHotelNights > 0) warnings.push(`Il manque ${missingHotelNights} nuit(s) d'hôtel ou de logement.`);
    if (emptyDays.length > 0) warnings.push(`${emptyDays.length} jour(s) sans activité détecté(s).`);
    if (totalBudget > 0 && budgetPercentage > 100) warnings.push(`Budget dépassé (${budgetPercentage}%).`);

    // --- Scoring (/100) ---
    // +30 si vol aller, +30 si vol retour, +20 si hôtel couvre toutes les nuits, +10 si au moins 1 activité, +10 si budget respecté
    let score = 0;
    if (!missingOutboundFlight) score += 30;
    if (!missingReturnFlight) score += 30;
    if (missingHotelNights === 0) score += 20;
    if (hasActivity) score += 10;
    if (totalBudget === 0 || budgetPercentage <= 100) score += 10;

    res.json({
      budget: {
        total: totalBudget,
        used: usedBudget,
        percentage: budgetPercentage
      },
      coverage: {
        missingHotelNights,
        missingOutboundFlight,
        missingReturnFlight,
        emptyDays,
        hasActivity
      },
      warnings,
      score
    });

  } catch (err: any) {
    console.error("[database/analysis]", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Chat (saved conversations) ───────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { user_id, trip_id, role, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO chat_messages (user_id, trip_id, role, content, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [user_id, trip_id || null, role, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/chat/history/:tripId", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM chat_messages WHERE trip_id = $1 ORDER BY created_at ASC",
    [req.params.tripId]
  );
  res.json(result.rows);
});

app.get("/chat/user/:userId", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC",
    [req.params.userId]
  );
  res.json(result.rows);
});

app.listen(PORT, async () => {
  console.log(`[database-service] running on port ${PORT}`);
  await initSchema();
});
