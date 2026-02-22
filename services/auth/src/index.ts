import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createClient } from "redis";
import nodemailer from "nodemailer";
import crypto from "crypto";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
const PORT = process.env.AUTH_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "oflyes_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// ── Redis ───────────────────────────────────────────────────────────────────
const redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
redis.connect().catch((err) => console.warn("[auth] Redis not connected:", err.message));

// ── Nodemailer ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(to: string, token: string, name: string) {
  // Link goes to the BACKEND auth service which processes the token then redirects to frontend
  const authServiceUrl = `http://localhost:${process.env.AUTH_PORT || 3001}`;
  const link = `${authServiceUrl}/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"O-Flyes ✈" <${process.env.SMTP_USER}>`,
    to,
    subject: "Confirmez votre adresse email — O-Flyes",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #faf9f6; border-radius: 16px;">
        <h1 style="font-size: 28px; color: #1a1a1a; margin-bottom: 8px;">Bienvenue, ${name} ✈</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
          Merci de vous être inscrit sur <strong>O-Flyes</strong>. Confirmez votre adresse email en cliquant sur le bouton ci-dessous.
        </p>
        <a href="${link}"
          style="display: inline-block; background: #C9A84C; color: #fff; text-decoration: none;
                 font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 12px;">
          Confirmer mon email
        </a>
        <p style="color: #aaa; font-size: 12px; margin-top: 28px;">
          Ce lien expire dans 24 heures. Si vous n&apos;avez pas créé de compte, ignorez cet email.
        </p>
      </div>`,
  });
}

// ── Helpers Redis keys ───────────────────────────────────────────────────────
const userKey = (email: string) => `user:${email}`;
const verifyKey = (token: string) => `verify:${token}`;
const resetKey = (token: string) => `reset:${token}`;

// ── Google OAuth ─────────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.OAUTH_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.OAUTH_CALLBACK_URL || "",
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        const existing = await redis.get(userKey(email));
        if (!existing) {
          // Auto-create user from Google (already verified)
          const user = {
            email,
            name: profile.displayName,
            passwordHash: "",
            emailVerified: true,
            provider: "google",
            createdAt: Date.now(),
          };
          await redis.set(userKey(email), JSON.stringify(user));
        }
        return done(null, profile);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// ── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth" }));

/** GET /auth/google */
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/** GET /auth/callback */
app.get(
  "/auth/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/auth/login?error=google` }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign(
      { email: user.emails?.[0]?.value, name: user.displayName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${FRONTEND_URL}/auth/success?token=${token}`);
  }
);

/** POST /auth/register */
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit faire au moins 8 caractères." });
    }

    // Check if user already exists
    const existing = await redis.get(userKey(email));
    if (existing) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Store user (not verified yet)
    const user = {
      email,
      name,
      passwordHash,
      emailVerified: false,
      provider: "local",
      createdAt: Date.now(),
    };
    await redis.set(userKey(email), JSON.stringify(user));

    // Generate verification token (expires 24h)
    const token = crypto.randomBytes(32).toString("hex");
    await redis.set(verifyKey(token), email, { EX: 86400 });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, token, name).catch((err) =>
      console.error("[auth] Email send error:", err.message)
    );

    return res.status(201).json({ message: "Compte créé. Vérifiez votre email." });
  } catch (err: any) {
    console.error("[auth/register]", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

/** GET /auth/verify-email?token=xxx */
app.get("/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.redirect(`${FRONTEND_URL}/auth/verify-email?error=invalid`);
    }

    const email = await redis.get(verifyKey(token));
    if (!email) {
      return res.redirect(`${FRONTEND_URL}/auth/verify-email?error=expired`);
    }

    // Mark user as verified
    const raw = await redis.get(userKey(email));
    if (!raw) return res.redirect(`${FRONTEND_URL}/auth/verify-email?error=notfound`);

    const user = JSON.parse(raw);
    user.emailVerified = true;
    await redis.set(userKey(email), JSON.stringify(user));
    await redis.del(verifyKey(token));

    return res.redirect(`${FRONTEND_URL}/auth/login?verified=1`);
  } catch (err) {
    console.error("[auth/verify-email]", err);
    return res.redirect(`${FRONTEND_URL}/auth/verify-email?error=server`);
  }
});

/** POST /auth/login */
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const raw = await redis.get(userKey(email));
    if (!raw) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const user = JSON.parse(raw);

    // Google users can't login with password
    if (user.provider === "google" && !user.passwordHash) {
      return res.status(400).json({ error: "Ce compte utilise la connexion Google." });
    }

    // Check email verified
    if (!user.emailVerified) {
      return res.status(403).json({ error: "Vérifiez votre email avant de vous connecter.", code: "EMAIL_NOT_VERIFIED" });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      { email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    console.error("[auth/login]", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

/** POST /auth/resend-verification */
app.post("/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requis." });

    const raw = await redis.get(userKey(email));
    if (!raw) return res.status(404).json({ error: "Compte introuvable." });

    const user = JSON.parse(raw);
    if (user.emailVerified) return res.status(400).json({ error: "Email déjà vérifié." });

    const token = crypto.randomBytes(32).toString("hex");
    await redis.set(verifyKey(token), email, { EX: 86400 });

    await sendVerificationEmail(email, token, user.name);
    return res.json({ message: "Email de vérification renvoyé." });
  } catch (err) {
    console.error("[auth/resend]", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

/** POST /auth/verify */
app.post("/auth/verify", (req, res) => {
  const { token } = req.body;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
});

app.listen(PORT, () => console.log(`[auth-service] running on port ${PORT}`));
