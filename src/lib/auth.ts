
let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

export type AccessTokenResult = {
    token: string | null;
    reason?: string;
};

/**
 * Common helper to get a fresh access token from the local OAuth proxy
 */
export async function getAccessToken(): Promise<string | null> {
    const result = await getAccessTokenWithReason();
    return result.token;
}

/**
 * Returns access token + diagnostic reason when unavailable.
 */
export async function getAccessTokenWithReason(): Promise<AccessTokenResult> {
    // Check if we have a valid cached token
    if (cachedAccessToken && Date.now() < tokenExpiry) {
        return { token: cachedAccessToken };
    }

    try {
        // Use relative path for production (served by unified express server)
        // For local vite development, we might need the full URL if running on different ports
        const isDev = import.meta.env.DEV;
        const apiBase = isDev ? 'http://localhost:3001' : '';

        const response = await fetch(`${apiBase}/api/token`).catch(() => {
            console.error('DEBUG: OAuth API is not reachable.');
            throw new Error('OAuth API is not reachable. If running locally, please run RUN_LOCAL.bat.');
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('DEBUG: No refresh token found. User needs to authenticate.');
                const data = await response.json().catch(() => ({}));
                return {
                    token: null,
                    reason: data?.error || 'No refresh token found. Please connect Google Drive first.'
                };
            }
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || `Proxy error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.access_token) {
            return { token: null, reason: 'Token endpoint did not return access token.' };
        }

        cachedAccessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
        return { token: cachedAccessToken };
    } catch (error) {
        console.error('DEBUG: getAccessToken Error:', error);
        return {
            token: null,
            reason: error instanceof Error ? error.message : 'Failed to get access token.'
        };
    }
}
