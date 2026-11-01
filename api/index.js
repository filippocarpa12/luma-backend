const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();

app.use(cors());
app.use(express.json());

// Funzione helper HTTPS nativa per evitare crash di fetch su Vercel
function inviaRichiestaLuma(apiKey, payload) {
    return new Promise((resolve, reject) => {
        const bodyString = JSON.stringify(payload);
        
        const options = {
            hostname: 'api.lumalabs.ai',
            port: 443,
            path: '/dream-machine/v1/generations',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(bodyString)
            },
            timeout: 25000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch (_) {
                    parsed = { raw: data };
                }
                resolve({ statusCode: res.statusCode, body: parsed });
            });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout durante la connessione ai server Luma'));
        });

        req.write(bodyString);
        req.end();
    });
}

app.all('*', async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(200).json({ status: "Backend Luma attivo" });
    }

    let apiKey = (process.env.LUMA_API_KEY || '').trim();
    if (!apiKey) {
        return res.status(500).json({ error: "LUMA_API_KEY non trovata su Vercel" });
    }

    if (apiKey.toLowerCase().startsWith('bearer ')) {
        apiKey = apiKey.slice(7).trim();
    }

    try {
        const rispostaLuma = await inviaRichiestaLuma(apiKey, {
            prompt: "Architectural realistic room 3D floor plan orbit view",
            aspect_ratio: "16:9"
        });

        return res.status(rispostaLuma.statusCode).json(rispostaLuma.body);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = app;
