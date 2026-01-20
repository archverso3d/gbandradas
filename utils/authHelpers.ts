/**
 * Detects the current base URL (origin) for Supabase Auth redirection.
 * Following best practices for environment-awareness and multi-environment support.
 */
export const getAuthRedirectUrl = (path: string = 'auth/callback') => {
    // 1. Try environment variables (Vite pattern)
    // Using any cast to avoid TS errors in environments with strict ImportMeta typing
    const metaEnv = (import.meta as any).env || {};

    let url =
        metaEnv.VITE_SITE_URL ??
        metaEnv.VITE_VERCEL_URL ??
        '';

    // 2. Fallback to runtime origin if variables aren't set (Dynamic Detection)
    if (!url && typeof window !== 'undefined') {
        url = window.location.origin;
    }

    // 3. Fallback for static builds if everything else fails
    if (!url) url = 'http://localhost:3000';

    // Best Practice Logic: Ensure the URL ends with a single /
    let baseUrl = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

    // Ensure path doesn't start with / to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    const finalUrl = `${baseUrl}${cleanPath}`;

    // Log with clear identification of the project being used
    console.log('--- AUTH REDIRECT DEBUG ---');
    console.log('Project ID (URL prefix):', metaEnv.VITE_SUPABASE_URL?.split('.')[0]?.split('//')[1] || 'Unknown');
    console.log('Detected Origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
    console.log('Final Redirect Target:', finalUrl);

    return finalUrl;
};
