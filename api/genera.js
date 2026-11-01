module.exports = async (req, res) => {
    // Gestione CORS per consentire le chiamate da StackBlitz
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metodo non consentito' });
    }

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
};
