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
  const { trip_id, type, title, provider, confirmation_number, start_date, end_date, price, currency, status, external_url, raw_data } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookings (trip_id, type, title, provider, confirmation_number, start_date, end_date, price, currency, status, external_url, raw_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *`,
      [trip_id, type, title, provider, confirmation_number, start_date, end_date, price, currency || 'EUR', status || 'confirmed', external_url || null, raw_data || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/trips/:id/bookings", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM bookings WHERE trip_id = $1 ORDER BY start_date ASC",
    [req.params.id]
  );
  res.json(result.rows);
});

app.post("/trips/:id/bookings", async (req, res) => {
  const { type, title, provider, confirmation_number, start_date, end_date, price, currency, status, external_url, raw_data } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookings (trip_id, type, title, provider, confirmation_number, start_date, end_date, price, currency, status, external_url, raw_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *`,
      [req.params.id, type, title, provider, confirmation_number, start_date, end_date, price, currency || 'EUR', status || 'confirmed', external_url || null, raw_data || null]
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
