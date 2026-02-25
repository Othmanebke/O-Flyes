import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
const PORT = process.env.PORT || process.env.NOTIF_PORT || 3004;

app.get("/", (req, res) => res.send("AIVANA Notifications Service is running."));

console.log(`[notifications-service] Starting with:`);
console.log(` - PORT: ${PORT}`);
console.log(` - SMTP_HOST: ${process.env.SMTP_HOST || 'Missing'}`);

app.use(cors());
app.use(express.json());

// ── Mailer ───────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// ── Twilio SMS ───────────────────────────────────────────────────────────────
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", service: "notifications" }));

// ── POST /notify/email ────────────────────────────────────────────────────────
app.post("/notify/email", async (req, res) => {
  const { to, subject, html, template, data } = req.body;

  let finalHtml = html;
  let finalSubject = subject;

  if (template === "SYNC_CONFIRMATION") {
    finalSubject = `Nouveau voyage synchronisé ! ✈️`;
    finalHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #d4af37;">Bonne nouvelle !</h1>
        <p>Nous avons détecté et ajouté un nouveau voyage à votre dashboard :</p>
        <div style="background: #f9f7f4; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <strong>${data.title}</strong><br/>
          Prestataire : ${data.provider}<br/>
          Prix : ${data.price} ${data.currency}
        </div>
        <p>Retrouvez tous les détails sur votre <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard">Dashboard AIVANA</a>.</p>
      </div>
    `;
  } else if (template === "TRIP_REMINDER") {
    finalSubject = `Rappel : Votre voyage approche ! 🌍`;
    finalHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #d4af37;">C'est bientôt le départ !</h1>
        <p>Votre réservation pour <strong>${data.title}</strong> commence dans moins de 24 heures.</p>
        <p>Avez-vous tout préparé ?</p>
        <div style="background: #f9f7f4; padding: 15px; border-radius: 10px; margin: 20px 0;">
          Départ : ${new Date(data.start_date).toLocaleString('fr-FR')}<br/>
          Confirmation : ${data.confirmation_number || 'N/A'}
        </div>
        <p>Bon voyage avec AIVANA !</p>
      </div>
    `;
  }

  if (!to || (!finalSubject && !template)) return res.status(400).json({ error: "Missing fields" });

  try {
    await transporter.sendMail({
      from: `"AIVANA" <${process.env.SMTP_USER}>`,
      to,
      subject: finalSubject,
      html: finalHtml
    });
    res.json({ sent: true });
  } catch (err: any) {
    console.error("[notifications-service] Send failed:", err.message);
    // Silent fail in dev if SMTP is not configured
    if (process.env.NODE_ENV !== "production") {
      console.log("MOCK EMAIL SENT TO:", to);
      console.log("SUBJECT:", finalSubject);
      return res.json({ sent: true, mock: true });
    }
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`[notifications-service] running on port ${PORT}`));
