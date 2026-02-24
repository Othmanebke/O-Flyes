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

// ── Auto-initialisation du schéma ────────────────────────────────────────────
async function initSchema() {
  try {
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
  const { user_id, destination_id, title, start_date, end_date, budget, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trips (user_id, destination_id, title, start_date, end_date, budget, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [user_id, destination_id || null, title, start_date, end_date, budget, status || 'planned']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create trip" });
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
app.post("/bookings", async (req, res) => {
  const { trip_id, type, title, provider, confirmation_number, start_date, end_date, price, currency, status, external_url, raw_data } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookings (trip_id, type, title, provider, confirmation_number, start_date, end_date, price, currency, status, external_url, raw_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *`,
      [trip_id, type, title, provider, confirmation_number, start_date, end_date, price, currency || 'EUR', status || 'confirmed', external_url || null, raw_data || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create booking" });
  }
});

app.get("/bookings/trip/:tripId", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM bookings WHERE trip_id = $1 ORDER BY start_date ASC",
    [req.params.tripId]
  );
  res.json(result.rows);
});

app.delete("/bookings/:id", async (req, res) => {
  await pool.query("DELETE FROM bookings WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// ── Email Credentials ────────────────────────────────────────────────────────
app.post("/email-credentials", async (req, res) => {
  const { user_id, email, provider, access_token, refresh_token, expires_at, scope } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO email_credentials (user_id, email, provider, access_token, refresh_token, expires_at, scope, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id, email) DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         expires_at = EXCLUDED.expires_at,
         updated_at = NOW()
       RETURNING *`,
      [user_id, email, provider, access_token, refresh_token, expires_at, scope]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save email credentials" });
  }
});

app.get("/email-credentials/user/:userId", async (req, res) => {
  const result = await pool.query("SELECT id, user_id, email, provider, scope, updated_at FROM email_credentials WHERE user_id = $1", [req.params.userId]);
  res.json(result.rows);
});

app.get("/email-credentials/all", async (_req, res) => {
  // Used by sync-worker (internal only ideally)
  const result = await pool.query("SELECT * FROM email_credentials");
  res.json(result.rows);
});

// ── Processed Emails ────────────────────────────────────────────────────────
app.post("/processed-emails", async (req, res) => {
  const { user_id, message_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO processed_emails (user_id, message_id, sync_date)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, message_id) DO NOTHING
       RETURNING *`,
      [user_id, message_id]
    );
    res.status(201).json(result.rows[0] || { message: "Already exists" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not track processed email" });
  }
});

app.get("/processed-emails/user/:userId", async (req, res) => {
  const result = await pool.query("SELECT message_id FROM processed_emails WHERE user_id = $1", [req.params.userId]);
  res.json(result.rows.map((r: any) => r.message_id));
});

// ── Chat (saved conversations) ───────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { user_id, role, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO chat_messages (user_id, role, content, created_at)
         VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [user_id, role, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
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
