import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'oflyes_secret';

// Config URLs services internes (Render private URLs or local)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const DB_SERVICE_URL = process.env.DB_SERVICE_URL || 'http://database-service:3002';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:3003';
const TRAVEL_ENGINE_URL = process.env.TRAVEL_ENGINE_URL || 'http://travel-engine:3005';
const METRICS_SERVICE_URL = process.env.METRICS_SERVICE_URL || 'http://metrics-service:3009';

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.path}`);
    next();
});

// Middleware d'authentification
const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalide' });
    }
};

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'gateway' });
});

// 🔐 AUTH
app.use('/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/auth': '/auth' },
}));

// 🤖 CHAT
// POST /chat/message -> AI Service (Assistant logic)
app.use('/chat/message', (req, res, next) => {
    return createProxyMiddleware({
        target: AI_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/chat/message': '/chat' }, // Rewrite to internal /chat
    })(req, res, next);
});

// GET /chat/history/:tripId -> DB Service (Messages persistence)
app.use('/chat/history', authenticate, (req: any, res: any, next: any) => {
    return createProxyMiddleware({
        target: DB_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace('/chat/history', '/chat/history'), // keep path as is for db-service
    })(req, res, next);
});

// 🌍 EXPLORE
app.use('/explore', createProxyMiddleware({
    target: TRAVEL_ENGINE_URL,
    changeOrigin: true,
    pathRewrite: { '^/explore': '/explore' },
}));

// 📦 BOOKINGS (Auth Required + Trip Context)
app.use('/bookings', authenticate, (req: any, res: any, next: any) => {
    // Note: GET /trips/:id/bookings and POST /trips/:id/bookings are handled via /trips proxy
    // This /bookings route is for direct actions on bookings
    return createProxyMiddleware({
        target: DB_SERVICE_URL,
        changeOrigin: true,
    })(req, res, next);
});

// 🧳 TRIPS (Auth Required)
app.use('/trips', authenticate, (req: any, res: any, next: any) => {
    // Si GET /trips -> redirection interne vers /trips/user/:id
    if (req.method === 'GET' && (req.path === '/' || req.path === '')) {
        return createProxyMiddleware({
            target: DB_SERVICE_URL,
            changeOrigin: true,
            pathRewrite: () => `/trips/user/${req.user.id}`,
        })(req, res, next);
    }

    // Gestion des bookings via /trips/:id/bookings
    const bookingMatch = req.path.match(/^\/([^/]+)\/bookings/);
    if (bookingMatch) {
        const tripId = bookingMatch[1];
        if (req.method === 'POST') {
            req.body.trip_id = tripId;
        }
    }

    // Si POST /trips -> injection du user_id dans le body
    if (req.method === 'POST' && (req.path === '/' || req.path === '')) {
        req.body.user_id = req.user.id;
    }

    return createProxyMiddleware({
        target: DB_SERVICE_URL,
        changeOrigin: true,
    })(req, res, next);
});

// Placeholder for other routes (to be implemented)
// /explore, /bookings, /chat, etc.

app.listen(PORT, () => {
    console.log(`[Gateway] running on port ${PORT}`);
    console.log(`  AUTH_SERVICE_URL: ${AUTH_SERVICE_URL}`);
    console.log(`  DB_SERVICE_URL: ${DB_SERVICE_URL}`);
    console.log(`  METRICS_SERVICE_URL: ${METRICS_SERVICE_URL}`);
});
