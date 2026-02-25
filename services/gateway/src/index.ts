import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';

import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'oflyes_secret';

// Config URLs services (Publiques par défaut pour garantir la stabilité)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'https://auth-service-8x7w.onrender.com';
const DB_SERVICE_URL = process.env.DB_SERVICE_URL || 'https://database-service-uybo.onrender.com';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://ai-service-qfvv.onrender.com';
const TRAVEL_ENGINE_URL = process.env.TRAVEL_ENGINE_URL || 'https://travel-engine-7tk8.onrender.com';
const METRICS_SERVICE_URL = process.env.METRICS_SERVICE_URL || 'http://metrics-service:3009';
const NOTIF_SERVICE_URL = process.env.NOTIF_SERVICE_URL || 'https://notifications-service-a7f6.onrender.com';

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[Gateway DEBUG] Incoming: ${req.method} ${req.url}`);
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
        console.error(`[Gateway AUTH] Token invalid for secret: ${JWT_SECRET.slice(0, 3)}...`);
        return res.status(401).json({ error: 'Token invalide' });
    }
};

// ── API ROUTER (Gère le préfixe /api) ─────────────────────────────────────
const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'gateway', env: process.env.NODE_ENV });
});

// 🔐 AUTH (Login, Register)
apiRouter.use('/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth', '^/auth': '/auth' },
    onProxyReq: fixRequestBody,
    proxyTimeout: 60000,
    timeout: 60000,
    onError: (err, req, res) => {
        console.error(`[Gateway] Error to Auth:`, err.message);
        res.status(504).json({ error: "Auth Service Timeout", details: err.message });
    }
}));

// 🤖 CHAT
apiRouter.use('/chat/message', createProxyMiddleware({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/chat/message': '/chat', '^/chat/message': '/chat' },
    onProxyReq: fixRequestBody,
}));

apiRouter.use('/chat/history', authenticate, (req: any, res: Response, next: NextFunction) => {
    return createProxyMiddleware({
        target: DB_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/api/chat/history': '/chat/history', '^/chat/history': '/chat/history' },
    })(req, res, next);
});

// 🌍 EXPLORE
apiRouter.use('/explore', createProxyMiddleware({
    target: TRAVEL_ENGINE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/explore': '/explore', '^/explore': '/explore' },
}));

// 📦 BOOKINGS
apiRouter.use('/bookings', authenticate, (req: any, res: Response, next: NextFunction) => {
    return createProxyMiddleware({
        target: DB_SERVICE_URL,
        changeOrigin: true,
        onProxyReq: fixRequestBody,
    })(req, res, next);
});

// 🧳 TRIPS
apiRouter.use('/trips', authenticate, (req: any, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && (req.path === '/' || req.path === '')) {
        return createProxyMiddleware({
            target: DB_SERVICE_URL,
            changeOrigin: true,
            pathRewrite: () => `/trips/user/${req.user.id}`,
        })(req, res, next);
    }
    return createProxyMiddleware({
        target: DB_SERVICE_URL,
        changeOrigin: true,
        onProxyReq: fixRequestBody,
    })(req, res, next);
});

// �️ DATABASE
apiRouter.use('/db', createProxyMiddleware({
    target: DB_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/db': '', '^/db': '' },
    onProxyReq: fixRequestBody,
}));

// Montage du routeur sur /api et aussi à la racine pour plus de flexibilité
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Root fallback
app.get('/', (req, res) => res.json({ message: "AIVANA API Gateway is running." }));

app.listen(PORT, () => {
    console.log(`[Gateway] running on port ${PORT}`);
    console.log(`  AUTH_SERVICE_URL: ${AUTH_SERVICE_URL}`);
    console.log(`  DB_SERVICE_URL: ${DB_SERVICE_URL}`);
    console.log(`  AI_SERVICE_URL: ${AI_SERVICE_URL}`);
    console.log(`  METRICS_SERVICE_URL: ${METRICS_SERVICE_URL}`);
});
