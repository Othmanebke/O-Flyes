import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();
const PORT = process.env.DB_PORT || 3002;

app.use(cors());
app.use(express.json());

// ── PostgreSQL connection ────────────────────────────────────────────────────
export const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || "oflyes",
  password: process.env.POSTGRES_PASSWORD || "changeme",
  database: process.env.POSTGRES_DB || "oflyes_db",
});

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
  const { user_id, destination_id, start_date, end_date, budget } = req.body;
  const result = await pool.query(
    `INSERT INTO trips (user_id, destination_id, start_date, end_date, budget, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [user_id, destination_id, start_date, end_date, budget]
  );
  res.status(201).json(result.rows[0]);
});

app.get("/trips/user/:userId", async (req, res) => {
  const result = await pool.query(
    "SELECT t.*, d.name as destination_name, d.country FROM trips t JOIN destinations d ON d.id = t.destination_id WHERE t.user_id = $1 ORDER BY t.created_at DESC",
    [req.params.userId]
  );
  res.json(result.rows);
});

app.listen(PORT, () => console.log(`[database-service] running on port ${PORT}`));
