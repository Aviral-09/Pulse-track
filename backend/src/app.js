const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const trackRoutes = require('./routes/track.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const identityRoutes = require('./routes/identity.routes');

const app = express();

// Security & Abuse Protection
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, 
    message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '64kb' }));
app.use(apiLimiter);

// Strip /api prefix if it exists (for Vercel routing)
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        req.url = req.url.slice(4);
    }
    next();
});

// Routes
app.use('/v1/track', trackRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/v1/identity', identityRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
