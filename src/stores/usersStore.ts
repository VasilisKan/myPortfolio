import { defineStore } from 'pinia'
import axios from 'axios'

import { API_BASE } from '../config'
const AUTH_USERS =
  typeof import.meta.env.VITE_AUTH_USERS_URL === 'string' &&
  import.meta.env.VITE_AUTH_USERS_URL !== ''
    ? import.meta.env.VITE_AUTH_USERS_URL
    : `${API_BASE}/api/auth/users`
const fetchConfig = { credentials: 'include' as RequestCredentials }

export interface AppUser {
  id: string
  email: string
  username?: string
  isAdmin: boolean
  createdAt?: string
  updatedAt?: string
}

function normalizeUser(raw: Record<string, unknown>): AppUser {
  return {
    id: String(raw.id ?? raw.Id ?? ''),
    email: String(raw.email ?? raw.Email ?? ''),
    username: raw.username != null ? String(raw.username) : raw.Username != null ? String(raw.Username) : undefined,
    isAdmin: Boolean(raw.isAdmin ?? raw.is_admin ?? raw.IsAdmin ?? false),
    createdAt: raw.createdAt != null ? String(raw.createdAt) : raw.created_at != null ? String(raw.created_at) : undefined,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : raw.updated_at != null ? String(raw.updated_at) : undefined,
  }
}

function toUserArray(data: unknown): AppUser[] {
  if (Array.isArray(data)) {
    return data
      .filter((t): t is Record<string, unknown> => t != null && typeof t === 'object')
      .map(normalizeUser)
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    const maybe = obj.users ?? obj.data ?? obj.items ?? obj.result
    if (Array.isArray(maybe)) {
      return maybe
        .filter((t): t is Record<string, unknown> => t != null && typeof t === 'object')
        .map(normalizeUser)
    }
  }
  return []
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as AppUser[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadAllUsers() {
      this.loading = true
      this.error = null
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      try {
        const res = await fetch(AUTH_USERS, { ...fetchConfig, signal: controller.signal })
        clearTimeout(timeoutId)
        let text = await res.text()
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
        text = text.trim()
        let raw: unknown = null
        if (text !== '') {
          try {
            raw = JSON.parse(text)
          } catch {
            this.error = 'Invalid JSON from server'
            this.users = []
            return
          }
        }
        if (!res.ok) {
          const msg =
            typeof raw === 'object' && raw !== null && 'message' in (raw as object)
              ? (raw as { message?: string }).message
              : typeof raw === 'object' && raw !== null && 'error' in (raw as object)
                ? (raw as { error?: string }).error
                : res.statusText
          this.error = msg ?? `Failed to load users (${res.status})`
          this.users = []
          return
        }
        this.users = toUserArray(raw ?? [])
      } catch (err: any) {
        clearTimeout(timeoutId)
        if (err?.name === 'AbortError') {
          this.error = 'Request timed out'
        } else {
          this.error = err?.message ?? 'Failed to load users'
        }
        this.users = []
      } finally {
        this.loading = false
      }
    },

    async updateUser(
      id: string,
      payload: { username?: string; email?: string; isAdmin?: boolean }
    ) {
      await axios.put(`${AUTH_USERS}/${id}`, payload, {
        withCredentials: true,
      })
      await this.loadAllUsers()
    },
  },
})
