require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Proxy for Render/Nginx
app.set('trust proxy', 1);

app.use(cors({
    origin: [
        "https://githubroast2-0-frontend.onrender.com",
        "http://localhost:3000"
    ],
    credentials: true
}));

// Basic Security Headers
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';");
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
        success: true,
        status: 'ok',
        service: 'AI Developer Roast Lab',
        timestamp: new Date().toISOString()
    });
});

// Catch-all 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        code: 404,
        error: 'Endpoint not found'
    });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandle Error:", err);
    
    if (err.name === 'MulterError') {
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Max limit is 5MB.' : `Upload error: ${err.message}`;
        return res.status(400).json({
            success: false,
            code: 400,
            error: message
        });
    }

    res.status(500).json({
        success: false,
        code: 500,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});


app.listen(PORT, () => console.log(`Server running on ${PORT}`));
