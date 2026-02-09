import axios from 'axios';

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

function readRedirectUriFromState(rawState) {
    if (!rawState || typeof rawState !== 'string') return undefined;

    try {
        const decoded = decodeURIComponent(rawState);
        const parsed = JSON.parse(decoded);
        return typeof parsed?.redirectUri === 'string' ? parsed.redirectUri : undefined;
    } catch {
        return undefined;
    }
}

function isValidCallbackUri(uri) {
    try {
        const parsed = new URL(uri);
        return parsed.pathname === '/api/auth/callback';
    } catch {
        return false;
    }
}

function pickRedirectUri(req) {
    const configured = process.env.REDIRECT_URI_CANDIDATES || process.env.REDIRECT_URI || '';
    const candidates = configured
        .split(',')
        .map(u => u.trim())
        .filter(Boolean)
        .filter(isValidCallbackUri);

    const dynamic = `${getBaseUrl(req)}/api/auth/callback`;
    if (candidates.length === 0) return dynamic;

    const currentBase = getBaseUrl(req);
    const match = candidates.find((u) => {
        try {
            return new URL(u).origin === currentBase;
        } catch {
            return false;
        }
    });

    return match || dynamic;
}

export default async function handler(req, res) {
    const { code, state } = req.query;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUriFromState = readRedirectUriFromState(state);
    const REDIRECT_URI = redirectUriFromState || pickRedirectUri(req);

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
        });

        const newRefreshToken = response.data.refresh_token;

        if (newRefreshToken) {
            res.send(`
                <div style="font-family: sans-serif; padding: 20px; max-width: 800px; line-height: 1.6; direction: rtl; text-align: right;">
                    <h1 style="color: #0f5132;">✅ تم استخراج التوكن بنجاح!</h1>
                    <p>بما أنك تستخدم Vercel (Serverless)، لا يمكننا حفظ التوكن تلقائياً.</p>
                    <p><strong>يرجى نسخ هذا الكود وإضافته إلى متغيرات البيئة (Environment Variables) في إعدادات مشروع Vercel:</strong></p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px; overflow-x: auto; margin: 20px 0;">
                        <strong>Key:</strong> GOOGLE_REFRESH_TOKEN<br>
                        <strong>Value:</strong><br>
                        <code style="background: #e9ecef; padding: 5px; display: block; margin-top: 5px; word-break: break-all;">${newRefreshToken}</code>
                    </div>

                    <p>بعد إضافة المتغير، قم بإعادة نشر المشروع (Redeploy) ليعمل بشكل صحيح.</p>
                </div>
            `);
        } else {
            res.send('<h1>⚠️ Warning</h1><p>Auth successful but no refresh token returned. Try removing the app permissions from your Google account and trying again.</p>');
        }
    } catch (error) {
        const errorData = error.response?.data || {};
        console.error('OAuth callback error:', errorData);
        res.status(500).send(`
            <h1>❌ Token Exchange Failed</h1>
            <p>Error: ${errorData.error || error.message}</p>
            <p>Redirect URI used: ${REDIRECT_URI}</p>
            <hr>
            <a href="/api/auth">Try again</a>
        `);
    }
}
