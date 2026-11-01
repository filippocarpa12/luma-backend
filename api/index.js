const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

async function gestisciChiamata(req, res) {
    const LUMA_API_KEY = process.env.LUMA_API_KEY;

    if (!LUMA_API_KEY) {
        return res.status(500).json({ error: 'Chiave API non configurata su Vercel' });
    }

    try {
        // Endpoint ufficiale attivo di Luma AI
        const lumaRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LUMA_API_KEY}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                prompt: "A realistic 3D interior room architecture model, floor plan style",
                aspect_ratio: "16:9"
            })
        });

        const testoRisposta = await lumaRes.text();
        console.log("Risposta grezza Luma:", testoRisposta);

        let data;
        try {
            data = JSON.parse(testoRisposta);
        } catch (e) {
            data = { raw: testoRisposta };
        }

        return res.status(lumaRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

app.post('/', gestisciChiamata);
app.post('/api', gestisciChiamata);

app.get('*', (req, res) => {
    res.json({ status: 'Server attivo e pronto' });
});

module.exports = app;
