import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import client from "prom-client";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
const PORT = process.env.METRICS_PORT || 3006;

console.log(`[metrics-service] Starting with:`);
console.log(` - PORT: ${PORT}`);

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

const affiliateClicks = new client.Counter({
  name: "oflyes_affiliate_clicks_total",
  help: "Total affiliate link clicks",
  labelNames: ["type"],
  registers: [register],
});

const activeUsers = new client.Gauge({
  name: "oflyes_active_users",
  help: "Currently active users (pseudo-metric)",
  registers: [register],
});

// Cache for internal simple analytics
const internalStats = {
  clicks: { flight: 0, hotel: 0, activity: 0 },
  syncs: 0
};

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", service: "metrics" }));

// ── GET /analytics/summary ───────────────────────────────────────────────────
app.get("/analytics/summary", (_req, res) => {
  res.json({
    clicks: internalStats.clicks,
    total_clicks: internalStats.clicks.flight + internalStats.clicks.hotel + internalStats.clicks.activity,
    successful_syncs: internalStats.syncs,
    conversion_rate: internalStats.syncs > 0 ? (internalStats.syncs / (internalStats.clicks.flight + internalStats.clicks.hotel + internalStats.clicks.activity + 1) * 100).toFixed(2) : 0
  });
});

// ── Prometheus scrape endpoint ────────────────────────────────────────────────
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ── POST /metrics/event – collect events from other services ──────────────────
app.post("/metrics/event", (req, res) => {
  const { event, type, status } = req.body;
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
    case "affiliate_click":
      affiliateClicks.inc({ type: type || "unknown" });
      if (type && internalStats.clicks[type as keyof typeof internalStats.clicks] !== undefined) {
        internalStats.clicks[type as keyof typeof internalStats.clicks]++;
      }
      break;
    case "email_sync_success":
      internalStats.syncs++;
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
