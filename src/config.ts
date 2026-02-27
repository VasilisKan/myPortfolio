const RAW = import.meta.env.VITE_BACKEND_URL as string | undefined
const PRODUCTION_FALLBACK = 'https://api.kanellos.me'

/**
 * API base URL. Uses VITE_BACKEND_URL at build time.
 * Fallback for production when env is missing or literal "undefined" (Docker build cache).
 */
export const API_BASE =
  RAW && RAW !== 'undefined' ? RAW : PRODUCTION_FALLBACK
