import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();

const app = express();
const PORT = process.env.NOTIF_PORT || 3004;

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
  const { to, subject, html } = req.body;
  if (!to || !subject) return res.status(400).json({ error: "Missing fields" });
  try {
    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
    res.json({ sent: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /notify/sms ──────────────────────────────────────────────────────────
app.post("/notify/sms", async (req, res) => {
  const { to, body } = req.body;
  if (!twilioClient) return res.status(503).json({ error: "Twilio not configured" });
  try {
    await twilioClient.messages.create({ body, from: process.env.TWILIO_FROM_NUMBER, to });
    res.json({ sent: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /notify/welcome ──────────────────────────────────────────────────────
app.post("/notify/welcome", async (req, res) => {
  const { email, name } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Bienvenue sur O-Flyes ✈️",
      html: `<h1>Bonjour ${name} !</h1><p>Bienvenue sur <strong>O-Flyes</strong>, votre assistant voyage intelligent. Commencez à explorer vos prochaines aventures dès maintenant.</p>`,
    });
    res.json({ sent: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`[notifications-service] running on port ${PORT}`));
