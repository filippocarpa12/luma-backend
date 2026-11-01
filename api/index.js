const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

async function gestisciChiamata(req, res) {
    const key = (process.env.LUMA_API_KEY || '').trim();

    // Diagnostica: controlliamo se la chiave esiste e come inizia/finisce
    if (!key) {
        return res.status(500).json({ 
            errore: "Variabile LUMA_API_KEY assente o vuota su Vercel." 
        });
    }

    try {
        const lumaRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                prompt: "3D model interior room floor plan",
                aspect_ratio: "16:9"
            })
        });

        const data = await lumaRes.json();
        
        // Se Luma risponde con errore, mostriamo anche i dettagli della chiave letta
        if (!lumaRes.ok) {
            return res.status(lumaRes.status).json({
                luma_response: data,
                chiave_lunghezza: key.length,
                chiave_anteprima: `${key.slice(0, 4)}...${key.slice(-4)}`
            });
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

app.post('/', gestisciChiamata);
app.post('/api', gestisciChiamata);

app.get('*', (req, res) => {
    res.json({ status: 'Server pronto' });
});

module.exports = app;
