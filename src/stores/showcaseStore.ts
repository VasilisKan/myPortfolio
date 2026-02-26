import { defineStore } from 'pinia'

const API_BASE = import.meta.env.VITE_BACKEND_URL
const SHOWCASE_BASE =
  typeof import.meta.env.VITE_SHOWCASE_API_URL === 'string' &&
  import.meta.env.VITE_SHOWCASE_API_URL !== ''
    ? import.meta.env.VITE_SHOWCASE_API_URL
    : `${API_BASE}/api/showcase`
const fetchConfig = { credentials: 'include' as RequestCredentials }

export type ShowcaseType = 'site' | 'gallery'

export interface ShowcaseItem {
  id: string
  type: ShowcaseType
  title: string
  slug: string
  htmlContent?: string
  /** @deprecated use imageUrls for gallery */
  imageUrl?: string
  /** Gallery: multiple image URLs. For legacy single photo, we normalize to [imageUrl]. */
  imageUrls: string[]
  userIds: string[]
  createdAt?: string
}

function normalizeItem(raw: Record<string, unknown>): ShowcaseItem {
  const userIds = raw.userIds ?? raw.user_ids
  const type = (raw.type ?? raw.Type ?? 'site') as string
  const isGallery = type === 'gallery' || type === 'photo'
  const imageUrlsRaw = raw.imageUrls ?? raw.image_urls
  let imageUrls: string[] = []
  if (Array.isArray(imageUrlsRaw)) {
    imageUrls = imageUrlsRaw.map((u) => String(u)).filter(Boolean)
  }
  if (imageUrls.length === 0) {
    const single = raw.imageUrl ?? raw.image_url
    if (single != null && String(single).trim()) imageUrls = [String(single)]
  }
  return {
    id: String(raw.id ?? raw.Id ?? ''),
    type: isGallery ? 'gallery' : 'site',
    title: String(raw.title ?? raw.Title ?? ''),
    slug: String(raw.slug ?? raw.Slug ?? ''),
    htmlContent: raw.htmlContent != null ? String(raw.htmlContent) : raw.html_content != null ? String(raw.html_content) : undefined,
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : raw.image_url != null ? String(raw.image_url) : undefined,
    imageUrls,
    userIds: Array.isArray(userIds) ? userIds.map(String) : [],
    createdAt: raw.createdAt != null ? String(raw.createdAt) : raw.created_at != null ? String(raw.created_at) : undefined,
  }
}

function toItemArray(data: unknown): ShowcaseItem[] {
  if (!Array.isArray(data)) {
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>
      const maybe = obj.items ?? obj.showcase ?? obj.data ?? obj.demos
      if (Array.isArray(maybe)) return maybe.filter((t): t is Record<string, unknown> => t != null && typeof t === 'object').map(normalizeItem)
    }
    return []
  }
  return data
    .filter((t): t is Record<string, unknown> => t != null && typeof t === 'object')
    .map(normalizeItem)
}

export function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'item'
}

export async function uploadShowcaseImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${SHOWCASE_BASE}/upload`, {
    method: 'POST',
    credentials: fetchConfig.credentials,
    body: form,
  })
  let text = await res.text()
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  text = text.trim()
  let raw: unknown = null
  if (text) {
    try {
      raw = JSON.parse(text)
    } catch {
      throw new Error('Invalid response from server')
    }
  }
  if (!res.ok) {
    const msg = typeof raw === 'object' && raw !== null && 'message' in (raw as object)
      ? (raw as { message?: string }).message
      : res.status === 404
        ? 'Upload not available. Add image via URL or implement POST /api/showcase/upload.'
        : res.statusText
    throw new Error(msg ?? `Upload failed (${res.status})`)
  }
  const url = typeof raw === 'object' && raw !== null && 'url' in (raw as object)
    ? (raw as { url?: string }).url
    : null
  if (typeof url !== 'string' || !url) throw new Error('Server did not return an image URL')
  return url
}

export const useShowcaseStore = defineStore('showcase', {
  state: () => ({
    items: [] as ShowcaseItem[],
    loading: false,
    error: null as string | null,
    currentItem: null as ShowcaseItem | null,
    currentItemLoading: false,
    currentItemError: null as string | null,
  }),

  actions: {
    async loadItems() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(SHOWCASE_BASE, fetchConfig)
        let text = await res.text()
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
        text = text.trim()
        let raw: unknown = null
        if (text) {
          try {
            raw = JSON.parse(text)
          } catch {
            this.error = 'Invalid JSON from server'
            this.items = []
            return
          }
        }
        if (!res.ok) {
          const msg = typeof raw === 'object' && raw !== null && 'message' in (raw as object)
            ? (raw as { message?: string }).message
            : typeof raw === 'object' && raw !== null && 'error' in (raw as object)
              ? (raw as { error?: string }).error
              : res.statusText
          this.error = msg ?? `Failed to load showcase (${res.status})`
          this.items = []
          return
        }
        this.items = toItemArray(raw ?? [])
      } catch (err: any) {
        this.error = err?.message ?? 'Failed to load showcase'
        this.items = []
      } finally {
        this.loading = false
      }
    },

    async getItemBySlug(slug: string) {
      this.currentItem = null
      this.currentItemError = null
      this.currentItemLoading = true
      try {
        const res = await fetch(`${SHOWCASE_BASE}/slug/${encodeURIComponent(slug)}`, fetchConfig)
        let text = await res.text()
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
        text = text.trim()
        let raw: unknown = null
        if (text) {
          try {
            raw = JSON.parse(text)
          } catch {
            this.currentItemError = 'Invalid JSON from server'
            return
          }
        }
        if (!res.ok) {
          this.currentItemError =
            (typeof raw === 'object' && raw !== null && 'message' in (raw as object)
              ? (raw as { message?: string }).message
              : res.status === 403
                ? 'You do not have access to this item.'
                : res.status === 404
                  ? 'Not found.'
                  : `Failed to load (${res.status})`) ?? null
          return
        }
        if (raw != null && typeof raw === 'object') {
          this.currentItem = normalizeItem(raw as Record<string, unknown>)
        }
      } catch (err: any) {
        this.currentItemError = err?.message ?? 'Failed to load'
      } finally {
        this.currentItemLoading = false
      }
    },

    async createItem(payload: {
      type: ShowcaseType
      title: string
      slug?: string
      htmlContent?: string
      imageUrls?: string[]
      userIds: string[]
    }) {
      const slug = (payload.slug && payload.slug.trim()) || slugFromTitle(payload.title)
      const body: Record<string, unknown> = {
        type: payload.type,
        title: payload.title.trim(),
        slug: slug.trim() || undefined,
        userIds: payload.userIds,
      }
      if (payload.type === 'site') body.htmlContent = payload.htmlContent ?? ''
      if (payload.type === 'gallery') body.imageUrls = payload.imageUrls ?? []
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      let res: Response
      try {
        res = await fetch(SHOWCASE_BASE, {
          method: 'POST',
          ...fetchConfig,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
      } catch (err: any) {
        clearTimeout(timeoutId)
        if (err?.name === 'AbortError') throw new Error('Request timed out. Is the backend running?')
        throw new Error(err?.message ?? 'Network error. Check that the backend is running (POST /api/showcase).')
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
      await this.loadItems()
    },

    async uploadImage(file: File): Promise<string> {
      return uploadShowcaseImage(file)
    },

    async deleteItem(id: string) {
      const res = await fetch(`${SHOWCASE_BASE}/${encodeURIComponent(id)}`, {
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
      await this.loadItems()
    },
  },
})
