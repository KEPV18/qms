function getBaseUrl(req) {
    const forwardedHost = req.headers['x-forwarded-host'];
    const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || req.headers.host || 'localhost:3001';

    const forwardedProto = req.headers['x-forwarded-proto'];
    let proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto);
    if (!proto) {
        proto = host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
    }

    return `${proto}://${host}`;
}

function pickRedirectUri(req) {
    const configured = process.env.REDIRECT_URI_CANDIDATES || process.env.REDIRECT_URI || '';
    const candidates = configured
        .split(',')
        .map(u => u.trim())
        .filter(Boolean);

    const dynamic = `${getBaseUrl(req)}/api/auth/callback`;
    if (candidates.length === 0) return dynamic;

    const currentBase = getBaseUrl(req);
    const match = candidates.find(u => u.startsWith(currentBase));
    return match || candidates[0];
}

export default async function handler(req, res) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    // Health check logic inside the auth handler for debugging env vars
    if (req.query.health === 'true') {
        return res.json({
            status: 'ok',
            hasClientId: !!GOOGLE_CLIENT_ID,
            hasClientSecret: !!GOOGLE_CLIENT_SECRET,
            hasRedirectUri: !!REDIRECT_URI,
            resolvedRedirectUri: pickRedirectUri(req),
            requestBaseUrl: getBaseUrl(req),
            envKeys: Object.keys(process.env).filter(k => !k.startsWith('VERCEL_')),
        });
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error('Missing Env Vars:', {
            hasClientId: !!GOOGLE_CLIENT_ID,
            hasClientSecret: !!GOOGLE_CLIENT_SECRET
        });
        return res.status(500).send('Configuration Error: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in Vercel Environment Variables.');
    }

    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];
    const encodedScopes = encodeURIComponent(SCOPES.join(' '));
    const finalRedirectUri = pickRedirectUri(req);
    const state = encodeURIComponent(JSON.stringify({ redirectUri: finalRedirectUri }));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&response_type=code&scope=${encodedScopes}&access_type=offline&prompt=consent&state=${state}`;

    res.redirect(authUrl);
}
