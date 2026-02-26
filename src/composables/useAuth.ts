import { ref, computed } from 'vue';

const API_BASE = import.meta.env.VITE_BACKEND_URL as string;

export interface MeResponse { userId: string; isAdmin: boolean; email?: string; name?: string; username?: string }

const user = ref<MeResponse | null>(null);

function normalizeMe(raw: Record<string, unknown>): MeResponse {
  return {
    userId: String(raw.userId ?? raw.user_id ?? ''),
    isAdmin: Boolean(raw.isAdmin ?? raw.is_admin),
    email: raw.email != null ? String(raw.email) : undefined,
    name: raw.name != null ? String(raw.name) : undefined,
    username: raw.username != null ? String(raw.username) : raw.user_name != null ? String(raw.user_name) : undefined,
  };
}
const isLoggedIn = computed(() => user.value !== null);

export function useAuth() {
  async function fetchMe() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
      });
      if (!res.ok) {
        user.value = null;
        return;
      }
      const data = await res.json();
      user.value = normalizeMe(typeof data === 'object' && data !== null ? data : {});
    } catch {
      user.value = null;
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
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

  async function register(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text || `Registration failed (${res.status})`);
    }
    await fetchMe();
  }

  async function forgotPassword(email: string): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `Request failed (${res.status})`);
      }
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          throw new Error('Request timed out. The server may be slow or unreachable. Please try again.');
        }
        throw e;
      }
      throw e;
    }
  }

  async function resetPassword(token: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!res.ok) {
      let message = `Reset failed (${res.status})`;
      try {
        const json = await res.json();
        if (json?.message && typeof json.message === 'string') {
          message = json.message;
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) message = text;
      }
      throw new Error(message);
    }
  }

  async function logout() {
    const res = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Accept': '*/*' },
      body: '',
      credentials: 'include' as RequestCredentials,
    });
    if (!res.ok) {
      console.warn(`Logout failed with status ${res.status}`);
    }
    user.value = null;
  }

  async function updateMe(payload: { email?: string; name?: string; username?: string }) {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text || `Update failed (${res.status})`);
    }
    await fetchMe();
  }

  return { user, isLoggedIn, fetchMe, login, logout, register, forgotPassword, resetPassword, updateMe };
}