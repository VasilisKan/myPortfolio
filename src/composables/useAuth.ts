import { ref, computed } from 'vue';

const API_BASE = import.meta.env.VITE_BACKEND_URL as string;

interface MeResponse { userId: string; isAdmin: boolean }

const user = ref<MeResponse | null>(null);
const isLoggedIn = computed(() => user.value !== null);

export function useAuth() {
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

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/Auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text || `Login failed (${res.status})`);
    }
    await fetchMe();
  }

  async function logout() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Accept': '*/*' },
      body: '',
      credentials: 'include', 
    };
  
    console.log('Sending logout request:', `${API_BASE}/api/Auth/logout`, requestOptions);
    debugger; // Pause here for inspection in DevTools
  
    const res = await fetch(`${API_BASE}/api/Auth/logout`, requestOptions);
  
    if (!res.ok) {
      console.warn(`Logout failed with status ${res.status}`);
    }
  
    user.value = null;
  }

  return { user, isLoggedIn, fetchMe, login, logout };
}