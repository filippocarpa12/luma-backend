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
        // Endpoint aggiornato per i capture video di Luma
        const lumaRes = await fetch('https://api.lumalabs.ai/api/v1.2/captures', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LUMA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: req.body.title || "Scansione Stanza"
            })
        });

        const data = await lumaRes.json();
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
