/**
 * API base URL. Uses VITE_BACKEND_URL at build time, with fallback for production
 * when the env var is missing (e.g. old build or misconfigured deploy).
 */
export const API_BASE =
  (import.meta.env.VITE_BACKEND_URL as string) || 'https://api.kanellos.me'
