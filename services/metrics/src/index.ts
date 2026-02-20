import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import client from "prom-client";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
const PORT = process.env.METRICS_PORT || 3006;

app.use(cors());
app.use(express.json());

// ── Prometheus setup ─────────────────────────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom counters
const chatRequests = new client.Counter({
  name: "oflyes_chat_requests_total",
  help: "Total chatbot requests",
  labelNames: ["status"],
  registers: [register],
});

const recommendRequests = new client.Counter({
  name: "oflyes_recommend_requests_total",
  help: "Total recommendation requests",
  registers: [register],
});

const tripsSaved = new client.Counter({
  name: "oflyes_trips_saved_total",
  help: "Total trips saved by users",
  registers: [register],
});

const activeUsers = new client.Gauge({
  name: "oflyes_active_users",
  help: "Currently active users (pseudo-metric)",
  registers: [register],
});

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", service: "metrics" }));

// ── Prometheus scrape endpoint ────────────────────────────────────────────────
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ── POST /metrics/event – collect events from other services ──────────────────
app.post("/metrics/event", (req, res) => {
  const { event, status } = req.body;
  switch (event) {
    case "chat_request":
      chatRequests.inc({ status: status || "success" });
      break;
    case "recommend_request":
      recommendRequests.inc();
      break;
    case "trip_saved":
      tripsSaved.inc();
      break;
    case "user_active":
      activeUsers.inc();
      break;
    case "user_inactive":
      activeUsers.dec();
      break;
  }
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`[metrics-service] running on port ${PORT}`));
