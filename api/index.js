const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Gestore comune per la richiesta POST a Luma
async function gestisciChiamata(req, res) {
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
}

// Accetta sia la rotta radice che /api
app.post('/', gestisciChiamata);
app.post('/api', gestisciChiamata);

// Controllo per le verifiche GET
app.get('*', (req, res) => {
    res.json({ status: 'Server attivo e pronto' });
});

module.exports = app;
