const express = require('express');
const cors = require('cors');
const { LumaAI } = require('@lumai/sdk');

const app = express();

app.use(cors());
app.use(express.json());

app.all('*', async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(200).json({ status: "Backend Luma attivo" });
    }

    const apiKey = (process.env.LUMA_API_KEY || '').trim();
    if (!apiKey) {
        return res.status(500).json({ error: "LUMA_API_KEY non configurata su Vercel" });
    }

    try {
        // Inizializza il client ufficiale Luma con la tua chiave da platform.lumalabs.ai
        const client = new LumaAI({ authToken: apiKey });

        // Avvia la generazione sulla piattaforma Luma
        const generation = await client.generations.create({
            prompt: "Photorealistic 3D interior architecture room 360 degree orbit view",
            aspect_ratio: "16:9"
        });

        console.log("Generazione avviata con successo su Luma:", generation.id);
        return res.status(200).json(generation);
    } catch (err) {
        console.error("Errore SDK Luma:", err);
        return res.status(err.status || 500).json({
            error: err.message,
            dettagli: err.body || null
        });
    }
});

module.exports = app;
