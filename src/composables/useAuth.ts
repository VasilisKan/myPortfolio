import { ref, computed } from 'vue';

const API_BASE = (import.meta.env.VITE_BACKEND_URL as string) 

interface MeResponse { userId: string }

const user = ref<MeResponse | null>(null);
const isLoggedIn = computed(() => user.value !== null);

export function useAuth() {
  // Fetch /me but suppress the 401 noise
  async function fetchMe() {
    try {
      const res = await fetch(`${API_BASE}/api/Auth/me`, {
        credentials: 'include',
      });
      if (!res.ok) {
        user.value = null;
        return;
      }
      user.value = await res.json();
    } catch {
      user.value = null;
    }
  }

  // Login: POST /login (sets HttpOnly cookie), then re-fetch /me
  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/Auth/login`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ email, passwordHash: password }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text || `Login failed (${res.status})`);
    }
    await fetchMe();
  }

  // Logout: POST /logout (clears cookie), then clear local state
  async function logout() {
    await fetch('https://localhost:5001/api/Auth/logout', {
      method:      'POST',
      credentials: 'include',
    });
    user.value = null;
  }

  return { user, isLoggedIn, fetchMe, login, logout };
}
