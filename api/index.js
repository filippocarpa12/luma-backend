const express = require('express');
const cors = require('cors');

const app = express();

// Abilita CORS per qualsiasi origine
app.use(cors());
app.use(express.json());

app.post('/api/genera', async (req, res) => {
    const LUMA_API_KEY = process.env.LUMA_API_KEY;

    if (!LUMA_API_KEY) {
        return res.status(500).json({ error: 'Chiave API non configurata su Vercel' });
    }

    try {
        const lumaRes = await fetch('https://api.lumalabs.ai/api/v1/capture', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LUMA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await lumaRes.json();
        return res.status(lumaRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Esporta l'app per Vercel
module.exports = app;
