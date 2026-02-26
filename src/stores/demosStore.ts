import { defineStore } from 'pinia'

const API_BASE = import.meta.env.VITE_BACKEND_URL
const DEMOS_BASE = `${API_BASE}/api/demos`
const fetchConfig = { credentials: 'include' as RequestCredentials }

export interface Demo {
  id: string
  title: string
  slug: string
  htmlContent: string
  userIds: string[]
  createdAt?: string
}

function normalizeDemo(raw: Record<string, unknown>): Demo {
  const userIds = raw.userIds ?? raw.user_ids ?? raw.userIds
  return {
    id: String(raw.id ?? raw.Id ?? ''),
    title: String(raw.title ?? raw.Title ?? ''),
    slug: String(raw.slug ?? raw.Slug ?? ''),
    htmlContent: String(raw.htmlContent ?? raw.html_content ?? raw.HtmlContent ?? ''),
    userIds: Array.isArray(userIds) ? userIds.map(String) : [],
    createdAt: raw.createdAt != null ? String(raw.createdAt) : raw.created_at != null ? String(raw.created_at) : undefined,
  }
}

function toDemoArray(data: unknown): Demo[] {
  if (!Array.isArray(data)) {
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>
      const maybe = obj.demos ?? obj.data ?? obj.items
      if (Array.isArray(maybe)) return maybe.filter((t): t is Record<string, unknown> => t != null && typeof t === 'object').map(normalizeDemo)
    }
    return []
  }
  return data
    .filter((t): t is Record<string, unknown> => t != null && typeof t === 'object')
    .map(normalizeDemo)
}

export function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'demo'
}

export const useDemosStore = defineStore('demos', {
  state: () => ({
    demos: [] as Demo[],
    loading: false,
    error: null as string | null,
    currentDemo: null as Demo | null,
    currentDemoLoading: false,
    currentDemoError: null as string | null,
  }),

  actions: {
    async loadDemos() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(DEMOS_BASE, fetchConfig)
        let text = await res.text()
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
        text = text.trim()
        let raw: unknown = null
        if (text) {
          try {
            raw = JSON.parse(text)
          } catch {
            this.error = 'Invalid JSON from server'
            this.demos = []
            return
          }
        }
        if (!res.ok) {
          const msg = typeof raw === 'object' && raw !== null && 'message' in (raw as object)
            ? (raw as { message?: string }).message
            : typeof raw === 'object' && raw !== null && 'error' in (raw as object)
              ? (raw as { error?: string }).error
              : res.statusText
          this.error = msg ?? `Failed to load demos (${res.status})`
          this.demos = []
          return
        }
        this.demos = toDemoArray(raw ?? [])
      } catch (err: any) {
        this.error = err?.message ?? 'Failed to load demos'
        this.demos = []
      } finally {
        this.loading = false
      }
    },

    async getDemoBySlug(slug: string) {
      this.currentDemo = null
      this.currentDemoError = null
      this.currentDemoLoading = true
      try {
        const res = await fetch(`${DEMOS_BASE}/slug/${encodeURIComponent(slug)}`, fetchConfig)
        let text = await res.text()
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
        text = text.trim()
        let raw: unknown = null
        if (text) {
          try {
            raw = JSON.parse(text)
          } catch {
            this.currentDemoError = 'Invalid JSON from server'
            return
          }
        }
        if (!res.ok) {
          this.currentDemoError =
            (typeof raw === 'object' && raw !== null && 'message' in (raw as object)
              ? (raw as { message?: string }).message
              : res.status === 403
                ? 'You do not have access to this demo.'
                : res.status === 404
                  ? 'Demo not found.'
                  : `Failed to load demo (${res.status})`) ?? null
          return
        }
        if (raw != null && typeof raw === 'object') {
          this.currentDemo = normalizeDemo(raw as Record<string, unknown>)
        }
      } catch (err: any) {
        this.currentDemoError = err?.message ?? 'Failed to load demo'
      } finally {
        this.currentDemoLoading = false
      }
    },

    async createDemo(payload: { title: string; slug?: string; htmlContent: string; userIds: string[] }) {
      const slug = (payload.slug && payload.slug.trim()) || slugFromTitle(payload.title)
      const body = JSON.stringify({
        title: payload.title.trim(),
        slug: slug.trim() || undefined,
        htmlContent: payload.htmlContent,
        userIds: payload.userIds,
      })
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      let res: Response
      try {
        res = await fetch(DEMOS_BASE, {
          method: 'POST',
          ...fetchConfig,
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: controller.signal,
        })
      } catch (err: any) {
        clearTimeout(timeoutId)
        if (err?.name === 'AbortError') throw new Error('Request timed out. Is the backend running?')
        throw new Error(err?.message ?? 'Network error. Check that the backend is running (POST /api/demos).')
      }
      clearTimeout(timeoutId)
      let text = await res.text()
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
      text = text.trim()
      let raw: unknown = null
      if (text) {
        try {
          raw = JSON.parse(text)
        } catch {
          throw new Error('Invalid JSON from server')
        }
      }
      if (!res.ok) {
        const msg = typeof raw === 'object' && raw !== null && 'message' in (raw as object)
          ? (raw as { message?: string }).message
          : res.statusText
        throw new Error(msg ?? `Create failed (${res.status})`)
      }
      await this.loadDemos()
    },

    async deleteDemo(id: string) {
      const res = await fetch(`${DEMOS_BASE}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        ...fetchConfig,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let msg: string
        try {
          const data = text ? JSON.parse(text) : {}
          msg = data.message ?? data.error ?? res.statusText
        } catch {
          msg = res.statusText
        }
        throw new Error(msg ?? `Delete failed (${res.status})`)
      }
      await this.loadDemos()
    },
  },
})
