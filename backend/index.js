import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import trackRoute from './routes/track.js';
import analyticsRoute from './routes/analytics.js';
import cohortsRoute from './routes/cohorts.js';
import db from './db/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Abuse Protection
const ingestionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute for tracking
    message: { error: 'Too many events from this IP, please try again later.' }
});

const analyticsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Increased for dev/dashboard polling
    message: { error: 'Excessive analytics requests.' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '64kb' })); // Guard payload size

// Routes
app.use('/v1/track', ingestionLimiter, trackRoute);
app.use('/v1/analytics', analyticsLimiter, analyticsRoute);
app.use('/v1/cohorts', cohortsRoute);

// Health check
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', environment: process.env.NODE_ENV || 'production', timestamp: new Date() });
    } catch (err) {
        console.error('Health check DB error:', err);
        res.status(503).json({ status: 'error', database: 'disconnected', environment: process.env.NODE_ENV || 'production', timestamp: new Date() });
    }
});

app.listen(PORT, () => {
    console.log(`[Pulse-Track] Production Server running on port ${PORT}`);
});
