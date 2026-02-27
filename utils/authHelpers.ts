/**
 * Detects the current base URL (origin) for Supabase Auth redirection.
 * Following best practices for environment-awareness and multi-environment support.
 */
export const getAuthRedirectUrl = (path: string = 'auth/callback') => {
    // 1. Detect if we are in development/local mode
    const isDev = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // 2. Try environment variables
    const metaEnv = (import.meta as any).env || {};
    const isProd = metaEnv.PROD || metaEnv.MODE === 'production';

    let url = '';

    // If we are local, ALWAYS prioritize the current window origin to avoid Vercel redirects
    if (isDev) {
        url = window.location.origin;
    } else {
        url = metaEnv.VITE_SITE_URL ??
            (isProd ? metaEnv.VITE_VERCEL_URL : '') ??
            '';
    }

    // 3. Fallback to runtime origin if variables aren't set
    if (!url && typeof window !== 'undefined') {
        url = window.location.origin;
    }

    // 4. Final fallback
    if (!url) url = 'http://localhost:3000';

    // Best Practice Logic: Ensure the URL ends with a single /
    // If it starts with https://, ensure it doesn't have a double protocol
    if (url.startsWith('https://https://')) {
        url = url.substring(8);
    }

    let baseUrl = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

    // Ensure path doesn't start with / to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const finalUrl = `${baseUrl}${cleanPath}`;



    return finalUrl;
};

