require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Basic Security Headers to prevent CSP Chrome Extension errors on random 404s
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

app.use(express.json());

// Routes
const roastRoutes = require('./src/routes/roastRoutes');
app.use('/api/roast', roastRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'AI Developer Roast Lab',
        timestamp: new Date().toISOString()
    });
});

// Catch-all 404 handler to return proper JSON rather than default Express HTML string
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        code: 404,
        error: 'Endpoint not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
