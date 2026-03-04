process.env.IS_MONOLITH = "true";
// Force local URLs so any axios calls land back on this exactly same process!
process.env.DB_URL = `http://localhost:${process.env.PORT || 3000}`;
process.env.AI_URL = `http://localhost:${process.env.PORT || 3000}`;
process.env.NOTIF_URL = `http://localhost:${process.env.PORT || 3000}`;
process.env.METRICS_URL = `http://localhost:${process.env.PORT || 3000}`;
process.env.AUTH_SERVICE_URL = `http://localhost:${process.env.PORT || 3000}`;
