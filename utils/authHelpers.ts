/**
 * Detects the current base URL (origin) for Supabase Auth redirection.
 * Following best practices for environment-awareness and multi-environment support.
 */
export const getAuthRedirectUrl = (path: string = 'auth/callback') => {
    // 1. Try environment variables (Vite pattern)
    const metaEnv = (import.meta as any).env || {};

    // Check if we are running in production on Vercel or locally
    const isProd = metaEnv.PROD || metaEnv.MODE === 'production';

    let url =
        metaEnv.VITE_SITE_URL ??
        (isProd ? metaEnv.VITE_VERCEL_URL : '') ??
        '';

    // 2. Fallback to runtime origin if variables aren't set (Dynamic Detection)
    if (!url && typeof window !== 'undefined') {
        url = window.location.origin;
    }

    // 3. Fallback for static builds if everything else fails
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

    // Log with clear identification for debugging recurring issues
    console.log('--- [AUTH] Redirect Handler ---');
    console.log('Context:', isProd ? 'PRODUCTION' : 'DEVELOPMENT');
    console.log('Source Origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
    console.log('Target URL:', finalUrl);

    return finalUrl;
};

