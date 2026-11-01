const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

async function gestisciChiamata(req, res) {
    const rawKey = (process.env.LUMA_API_KEY || '').trim();

    if (!rawKey) {
        return res.status(500).json({ error: "LUMA_API_KEY mancante nelle variabili Vercel." });
    }

    // Normalizza la chiave rimuovendo eventuali "Bearer " duplicati
    const token = rawKey.replace(/^Bearer\s+/i, '');

    // Headers standard per Luma
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    try {
        // Tentativo A: Endpoint ufficiale Dream Machine Generations
        let lumaRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                prompt: "Photorealistic 3D interior architecture room floor plan"
            })
        });

        // Tentativo B: Se risponde 401 o 403, fallback automatico sull'endpoint Genie 3D
        if (lumaRes.status === 401 || lumaRes.status === 403) {
            console.log("Tentativo primario rifiutato, provo endpoint Genie 3D...");
            lumaRes = await fetch('https://genie.lumalabs.ai/api/v1/generations', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    prompt: "Photorealistic 3D interior architecture room floor plan"
                })
            });
        }

        const testo = await lumaRes.text();
        let payload;
        try {
            payload = JSON.parse(testo);
        } catch (_) {
            payload = { raw: testo };
        }

        return res.status(lumaRes.status).json(payload);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

app.post('/', gestisciChiamata);
app.post('/api', gestisciChiamata);

app.get('*', (req, res) => {
    res.json({ status: "Backend Luma attivo" });
});

module.exports = app;
