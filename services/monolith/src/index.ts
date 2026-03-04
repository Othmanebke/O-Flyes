import './setup';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const PORT = process.env.PORT || 3000;

// Import all service routers/apps
// To avoid path resolution issues with nested TS files, we use the tsconfig paths
// But since we are inside services/monolith/src, we can just use relative paths
import authApp from '../../auth/src/index';
// Import initSchema from DB as well to initialize the DB on startup
import dbApp, { initSchema } from '../../database/src/index';
import aiApp from '../../ai/src/index';
import travelEngineApp from '../../travel-engine/src/index';
import notifApp from '../../notifications/src/index';
import metricsApp from '../../metrics/src/index';
import partnerApp from '../../partner-service/src/index';
import paymentsApp from '../../payments/src/index';

// Importing sync-worker will automatically trigger its cron schedules
import syncWorkerApp from '../../sync-worker/src/index';

const app = express();

app.use(cors());

// --- Gateway Request Logging ---
app.use((req, res, next) => {
    console.log(`[MONOLITH] Incoming: ${req.method} ${req.url}`);
    next();
});

// Health check for the entire Monolith
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'aivana-monolith', env: process.env.NODE_ENV });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'aivana-monolith', env: process.env.NODE_ENV });
});

// ==========================================
// MOUNTING MICROSERVICES
// ==========================================

// 1. Auth Service
// The auth service natively defines routes like /auth/google, /auth/login
app.use('/auth', authApp);
app.use('/api/auth', authApp); // To maintain backward compatibility with gateway

// 2. Chat & AI Service
// Original Gateway: pathRewrite: { '^/api/chat/message': '/chat' }
// and pathRewrite: { '^/api/ai': '' }
app.use('/chat', aiApp);
app.use('/api/chat/message', (req, res, next) => {
    req.url = '/chat';
    aiApp(req, res, next);
});
app.use('/ai', aiApp);
app.use('/api/ai', aiApp);

// 3. Database & Trips & Chat History
// Original Gateway: pathRewrite: { '^/api/chat/history': '/chat/history' }
// Original Gateway: /bookings -> DB, /trips -> DB, /db -> DB
app.use('/chat/history', dbApp);
app.use('/api/chat/history', dbApp);

app.use('/bookings', dbApp);
app.use('/api/bookings', dbApp);

app.use('/trips', dbApp);
app.use('/api/trips', dbApp);

app.use('/db', dbApp);
app.use('/api/db', dbApp);

// Since /users and other root endpoints of database might be queried:
app.use('/', dbApp);

// 4. Explore (Travel Engine)
// Original Gateway: pathRewrite: { '^/api/explore': '/explore' } -> Engine exports /explore
app.use('/explore', travelEngineApp);
app.use('/api/explore', travelEngineApp);

// 5. Notifications
app.use('/notifications', notifApp);
app.use('/api/notifications', notifApp);

// 6. Partner Service
// Original Gateway: pathRewrite: { '^/api/partner': '' }
app.use('/partner', partnerApp);
app.use('/api/partner', (req, res, next) => {
    // If request comes to /api/partner/..., rewrite it to /... for partnerApp
    req.url = req.url.replace(/^\/api\/partner/, '') || '/';
    partnerApp(req, res, next);
});

// 7. Metrics
app.use('/metrics', metricsApp);
app.use('/api/metrics', metricsApp);

// 8. Payments
app.use('/payments', paymentsApp);
app.use('/api/payments', paymentsApp);

// 9. Sync Worker (exports /health basically, but we still mount it)
app.use('/sync', syncWorkerApp);

// Fallback
app.get('/', (req, res) => res.json({ message: "AIVANA Monolith is running." }));

app.listen(PORT, async () => {
    console.log(`🚀 [AIVANA MONOLITH] Server running on port ${PORT}`);
    console.log(`[AIVANA MONOLITH] Environment: ${process.env.NODE_ENV || 'development'}`);

    // Initialize DB Schema safely
    try {
        await initSchema();
        console.log(`[AIVANA MONOLITH] Database schema initialized.`);
    } catch (e: any) {
        console.warn(`[AIVANA MONOLITH] DB Schema init skipped: ${e.message}`);
    }
});
