import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
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

// Log incoming requests & Handle /api prefix from frontend
app.use((req: Request, res: Response, next: NextFunction) => {
    const oldPath = req.url;
    if (req.url.startsWith('/api')) {
        req.url = req.url.replace(/^\/api/, '');
        if (req.url === '') req.url = '/';
        console.log(`[Gateway] REWRITE: ${oldPath} -> ${req.url}`);
    } else {
        console.log(`[Gateway] ${req.method} ${req.url}`);
    }
    next();
});

// Middleware d'authentification
const authenticate = (req: any, res: Response, next: NextFunction) => {
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
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'gateway' });
});

// 🔐 AUTH (Login, Register, verification)
app.use('/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/auth': '/auth' },
    onProxyReq: fixRequestBody,
}));

// 🤖 CHAT
// POST /chat/message -> AI Service (Assistant logic)
app.use('/chat/message', (req: Request, res: Response, next: NextFunction) => {
    return createProxyMiddleware({
        target: AI_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/chat/message': '/chat' }, // Rewrite to internal /chat
        onProxyReq: fixRequestBody,
    })(req, res, next);
});

// GET /chat/history/:tripId -> DB Service (Messages persistence)
app.use('/chat/history', authenticate, (req: any, res: Response, next: NextFunction) => {
    return createProxyMiddleware({
        target: DB_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: (path: string) => path.replace('/chat/history', '/chat/history'),
    })(req, res, next);
});

// 🌍 EXPLORE
app.use('/explore', createProxyMiddleware({
    target: TRAVEL_ENGINE_URL,
    changeOrigin: true,
    pathRewrite: { '^/explore': '/explore' },
}));

// 📦 BOOKINGS
app.use('/bookings', authenticate, (req: any, res: Response, next: NextFunction) => {
    return createProxyMiddleware({
        target: DB_SERVICE_URL,
        changeOrigin: true,
        onProxyReq: fixRequestBody,
    })(req, res, next);
});

// 🧳 TRIPS (Auth Required)
app.use('/trips', authenticate, (req: any, res: Response, next: NextFunction) => {
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
        onProxyReq: fixRequestBody,
    })(req, res, next);
});

// 📊 METRICS
app.use('/metrics', createProxyMiddleware({
    target: METRICS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/metrics': '' },
}));

// 🗄️ DATABASE (Generic proxy to support legacy /api/db/ calls)
app.use('/db', createProxyMiddleware({
    target: DB_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/db': '' },
    onProxyReq: fixRequestBody,
}));

app.listen(PORT, () => {
    console.log(`[Gateway] running on port ${PORT}`);
    console.log(`  AUTH_SERVICE_URL: ${AUTH_SERVICE_URL}`);
    console.log(`  DB_SERVICE_URL: ${DB_SERVICE_URL}`);
    console.log(`  AI_SERVICE_URL: ${AI_SERVICE_URL}`);
    console.log(`  METRICS_SERVICE_URL: ${METRICS_SERVICE_URL}`);
});
