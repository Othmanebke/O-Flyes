import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createClient } from "redis";
import nodemailer from "nodemailer";
import crypto from "crypto";
import axios from "axios";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const app = express();
const PORT = process.env.PORT || process.env.AUTH_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "oflyes_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://aivanaflyes.vercel.app";
const DB_URL = process.env.DB_URL || process.env.NEXT_PUBLIC_API_DB || "https://database-service-uybo.onrender.com";

console.log(`[auth-service] Starting with:`);
console.log(` - PORT: ${PORT}`);
console.log(` - FRONTEND_URL: ${FRONTEND_URL}`);
console.log(` - DB_URL: ${DB_URL}`);

// Log all requests
app.use((req, res, next) => {
  console.log(`[auth-service] ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

// Robust CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Be permissive during debug
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// ── Redis ───────────────────────────────────────────────────────────────────
let isRedisConnected = false;
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 5000, // Fail fast (5s) instead of hanging
  }
});

redis.on("error", (err) => {
  console.error("[auth] Redis Error:", err.message);
  isRedisConnected = false;
});

redis.connect()
  .then(() => {
    isRedisConnected = true;
    console.log("[auth] Redis connected successfully.");
  })
  .catch((err) => {
    isRedisConnected = false;
    console.error("[auth] Redis connection failed! Auth will work in degraded mode (In-memory mock).");
    console.error("[auth] Error details:", err.message);
  });

// Mock Redis simple pour éviter les plantages si Redis est HS
const redisMock = {
  get: async () => null,
  set: async () => "OK",
  del: async () => 1,
};

const getRedis = () => isRedisConnected ? redis : redisMock;

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
  const authServiceUrl = process.env.AUTH_SERVICE_URL || "https://auth-service-8x7w.onrender.com";
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
if (process.env.OAUTH_GOOGLE_CLIENT_ID && process.env.OAUTH_GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.OAUTH_CALLBACK_URL || "",
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const existing = await getRedis().get(userKey(email));
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
            await getRedis().set(userKey(email), JSON.stringify(user));
          }
          // Pass tokens in the info object
          return done(null, profile, { accessToken, refreshToken });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
} else {
  console.warn("[auth] Google OAuth credentials missing. Google login will be disabled.");
}

// ── Microsoft (Outlook) OAuth ───────────────────────────────────────────────
if (process.env.OAUTH_MICROSOFT_CLIENT_ID && process.env.OAUTH_MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.OAUTH_MICROSOFT_CLIENT_ID,
        clientSecret: process.env.OAUTH_MICROSOFT_CLIENT_SECRET,
        callbackURL: process.env.OAUTH_MICROSOFT_CALLBACK_URL || "http://localhost:3001/auth/microsoft/callback",
        scope: ["user.read", "email", "offline_access"]
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value || profile.userPrincipalName || "";
          const existing = await getRedis().get(userKey(email));
          if (!existing) {
            const user = {
              email,
              name: profile.displayName,
              passwordHash: "",
              emailVerified: true,
              provider: "microsoft",
              createdAt: Date.now(),
            };
            await getRedis().set(userKey(email), JSON.stringify(user));
          }
          return done(null, profile, { accessToken, refreshToken });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
} else {
  console.warn("[auth] Microsoft OAuth credentials missing. Outlook login will be disabled.");
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth" }));

/** GET /auth/google - Normal login */
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/** GET /auth/microsoft - Outlook login */
app.get("/auth/microsoft", passport.authenticate("microsoft"));

/** GET /auth/google/sync - Specific for email sync permissions */
app.get("/auth/google/sync", passport.authenticate("google", {
  scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
  accessType: "offline",
  prompt: "consent"
}));

/** GET /auth/callback */
app.get(
  "/auth/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/auth/login?error=google` }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const email = user.emails?.[0]?.value;
      const name = user.displayName;

      // Extract tokens (passed by passport-google-oauth20 if requested)
      // Note: we need to modify the strategy to capture these or use a custom callback
      const tokens = (req as any).authInfo || {};

      // Sync with Postgres to get the UUID
      const dbRes = await axios.post(`${DB_URL}/users`, { email, name, password_hash: "", provider: "google" });
      const dbId = dbRes.data.id;

      // Persist email sync tokens if present
      if (tokens.refreshToken) {
        console.log(`[auth/callback] Saving email credentials for user ${dbId} and email ${email}`);
        await axios.post(`${DB_URL}/email-credentials`, {
          user_id: dbId,
          email,
          provider: "google",
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // Roughly 1h
          scope: "https://www.googleapis.com/auth/gmail.readonly"
        }).catch(err => {
          console.error("[auth/callback] Failed to save email-credentials:", err.message);
        });
      }

      const token = jwt.sign(
        { id: dbId, email, name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.redirect(`${FRONTEND_URL}/auth/success?token=${token}`);
    } catch (err) {
      console.error("[auth/callback] Postgres sync error:", err);
      res.redirect(`${FRONTEND_URL}/auth/login?error=server`);
    }
  }
);

/** GET /auth/microsoft/callback */
app.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", { session: false, failureRedirect: `${FRONTEND_URL}/auth/login?error=microsoft` }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const email = user.emails?.[0]?.value || user.userPrincipalName;
      const name = user.displayName;

      // Sync with Postgres
      const dbRes = await axios.post(`${DB_URL}/users`, { email, name, password_hash: "", provider: "microsoft" });
      const dbId = dbRes.data.id;

      const token = jwt.sign(
        { id: dbId, email, name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.redirect(`${FRONTEND_URL}/auth/success?token=${token}`);
    } catch (err) {
      console.error("[auth/microsoft/callback] Postgres sync error:", err);
      res.redirect(`${FRONTEND_URL}/auth/login?error=server`);
    }
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
    const existing = await getRedis().get(userKey(email));
    if (existing) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Store user
    const isDev = process.env.NODE_ENV === "development" || !process.env.SMTP_USER;
    const user = {
      email,
      name,
      passwordHash,
      emailVerified: isDev, // Auto-verify in dev or if no SMTP
      provider: "local",
      createdAt: Date.now(),
    };
    await getRedis().set(userKey(email), JSON.stringify(user));

    if (isDev) {
      console.log(`[auth] Dev mode: Auto-verified user ${email}`);
      return res.status(201).json({ message: "Compte créé et auto-vérifié (mode dev)." });
    }

    // Generate verification token (expires 24h)
    const token = crypto.randomBytes(32).toString("hex");
    await getRedis().set(verifyKey(token), email, { EX: 86400 });

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

    // Sync with Postgres to get the UUID
    let dbId: string;
    try {
      const dbRes = await axios.post(`${DB_URL}/users`, { email: user.email, name: user.name, password_hash: user.passwordHash, provider: user.provider });
      dbId = dbRes.data.id;
    } catch (err: any) {
      console.error("[auth/login] Postgres sync error:", err.message);
      if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({ error: "Le service de base de données est injoignable (Postgres)." });
      }
      return res.status(500).json({ error: "Erreur serveur lors de la synchronisation BDD." });
    }

    const token = jwt.sign(
      { id: dbId, email: user.email, name: user.name },
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
    await getRedis().set(verifyKey(token), email, { EX: 86400 });

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
