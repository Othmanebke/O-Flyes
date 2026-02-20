import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// ── Google OAuth Strategy ───────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.OAUTH_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.OAUTH_CALLBACK_URL || "",
    },
    (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      // TODO: upsert user in DB via database-service
      return done(null, profile);
    }
  )
);

// ── Routes ──────────────────────────────────────────────────────────────────

/** GET /health */
app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth" }));

/** GET /auth/google – redirect to Google */
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/** GET /auth/callback – Google callback */
app.get(
  "/auth/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign(
      { id: user.id, email: user.emails?.[0]?.value, name: user.displayName },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    // Redirect frontend with token as query param (or use cookie)
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/success?token=${token}`);
  }
);

/** POST /auth/register – local email/password */
app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  // TODO: call database-service to create user
  res.status(201).json({ message: "User created (stub)", email, name });
});

/** POST /auth/login – local email/password */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  // TODO: call database-service to verify user & compare hash
  const token = jwt.sign({ email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
  res.json({ token });
});

/** POST /auth/verify – verify a JWT */
app.post("/auth/verify", (req, res) => {
  const { token } = req.body;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
});

app.listen(PORT, () => console.log(`[auth-service] running on port ${PORT}`));
