import axios from 'axios'
import { API_BASE } from '../config'

/**
 * Axios instance for backend API calls.
 * - baseURL: VITE_BACKEND_URL (production: https://api.kanellos.me)
 * - credentials: 'include' for JWT cookie (access_token)
 * - 401 → redirect to home (login)
 * - 403 → redirect to home with error param (access denied)
 */
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    if (status === 401) {
      window.location.href = '/'
    } else if (status === 403) {
      window.location.href = '/?error=forbidden'
    }
    return Promise.reject(err)
  }
)
