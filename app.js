// server.js - Backend simplificado para obtener API keys
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
}));
app.use(express.json());

// Rate limiting básico
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // 50 requests por IP
    message: { error: 'Demasiadas peticiones' }
});
app.use(limiter);

// Validación simple por header (opcional)
const validateRequest = (req, res, next) => {
    const bundleId = req.headers['x-bundle-id'];
    console.log(bundleId);
    const expectedBundleId = process.env.EXPECTED_BUNDLE_ID;
    console.log(expectedBundleId);
    if (expectedBundleId && bundleId !== expectedBundleId) {
        console.log("Son iguales")
        return res.status(403).json({ error: 'Bundle ID no autorizado' });
    }
    next();
};

// Endpoint genérico para cualquier API key
app.get('/api/keys/:service', validateRequest, (req, res) => {
    const { service } = req.params;
    
    // Mapeo de servicios a variables de entorno
    const serviceMap = {
        'supabase-larocaplay': process.env.LAROCAPLAY_SB_ANON_KEY,
        'stripe': process.env.STRIPE_PUBLISHABLE_KEY,
    };
    
    const apiKey = serviceMap[service];
    
    if (!apiKey) {
        return res.status(404).json({ 
            error: `API key para '${service}' no encontrada` 
        });
    }
    
    res.json({ 
        key: apiKey,
        service: service
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(PORT, () => {
    console.log(`🔑 API Keys server running on port ${PORT}`);
});

module.exports = app;