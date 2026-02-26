import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL
const CLOUDFLARE_BASE = `${API_BASE}/api/cloudflare/analytics`

export interface CloudflareDashboardQuery {
  since?: string
  until?: string
  time_delta?: string
  continuous?: boolean
}

export interface CloudflareTimeseriesPoint {
  since: string
  until: string
  requests?: { all?: number; cached?: number; uncached?: number; [k: string]: unknown }
  bandwidth?: { all?: number; cached?: number; uncached?: number; [k: string]: unknown }
  threats?: { all?: number; [k: string]: unknown }
  pageviews?: { all?: number; [k: string]: unknown }
  uniques?: { all?: number; [k: string]: unknown }
  [k: string]: unknown
}

export interface CloudflareDashboardResponse {
  result?: {
    timeseries?: CloudflareTimeseriesPoint[]
    totals?: CloudflareTimeseriesPoint
  }
  query?: CloudflareDashboardQuery
  success?: boolean
  errors?: unknown[]
}

export interface CloudflareGraphQLAdaptiveGroup {
  count: number
  dimensions: { datetimeHour: string }
  sum: { edgeResponseBytes: number; visits: number }
}

export interface CloudflareGraphQLResponse {
  data?: {
    viewer?: {
      zones?: Array<{ httpRequestsAdaptiveGroups?: CloudflareGraphQLAdaptiveGroup[] }>
    }
  }
  errors?: unknown[] | null
}

function isGraphQLResponse(raw: unknown): raw is CloudflareGraphQLResponse {
  const r = raw as CloudflareGraphQLResponse
  return Array.isArray(r?.data?.viewer?.zones)
}

function normalizeGraphQLResponse(raw: CloudflareGraphQLResponse): CloudflareDashboardResponse {
  const groups =
    raw.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups ?? []
  const timeseries: CloudflareTimeseriesPoint[] = groups.map((g) => {
    const hour = g.dimensions?.datetimeHour ?? ''
    return {
      since: hour,
      until: hour,
      requests: { all: g.count ?? 0 },
      bandwidth: { all: g.sum?.edgeResponseBytes ?? 0 },
      threats: { all: 0 },
      pageviews: { all: g.count ?? 0 },
      uniques: { all: g.sum?.visits ?? 0 },
    }
  })
  const totals: CloudflareTimeseriesPoint = {
    since: '',
    until: '',
    requests: {
      all: groups.reduce((acc, g) => acc + (g.count ?? 0), 0),
    },
    bandwidth: {
      all: groups.reduce((acc, g) => acc + (g.sum?.edgeResponseBytes ?? 0), 0),
    },
    threats: { all: 0 },
    pageviews: {
      all: groups.reduce((acc, g) => acc + (g.count ?? 0), 0),
    },
    uniques: {
      all: groups.reduce((acc, g) => acc + (g.sum?.visits ?? 0), 0),
    },
  }
  return { result: { timeseries, totals } }
}

function getRequestsTotal(point: CloudflareTimeseriesPoint | undefined): number {
  if (!point?.requests) return 0
  const r = point.requests
  if (typeof r.all === 'number') return r.all
  if (typeof r === 'object' && 'all' in r) return Number((r as { all?: number }).all) || 0
  return 0
}

function getBandwidthTotal(point: CloudflareTimeseriesPoint | undefined): number {
  if (!point?.bandwidth) return 0
  const b = point.bandwidth
  if (typeof b.all === 'number') return b.all
  if (typeof b === 'object' && 'all' in b) return Number((b as { all?: number }).all) || 0
  return 0
}

function getThreatsTotal(point: CloudflareTimeseriesPoint | undefined): number {
  if (!point?.threats) return 0
  const t = point.threats
  if (typeof t.all === 'number') return t.all
  if (typeof t === 'object' && 'all' in t) return Number((t as { all?: number }).all) || 0
  return 0
}

function getPageviewsTotal(point: CloudflareTimeseriesPoint | undefined): number {
  if (!point?.pageviews) return 0
  const p = point.pageviews
  if (typeof p.all === 'number') return p.all
  if (typeof p === 'object' && 'all' in p) return Number((p as { all?: number }).all) || 0
  return 0
}

function getUniquesTotal(point: CloudflareTimeseriesPoint | undefined): number {
  if (!point?.uniques) return 0
  const u = point.uniques
  if (typeof u.all === 'number') return u.all
  if (typeof u === 'object' && 'all' in u) return Number((u as { all?: number }).all) || 0
  return 0
}

export const useCloudflareStore = defineStore('cloudflare', {
  state: () => ({
    data: null as CloudflareDashboardResponse | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    timeseries(state): CloudflareTimeseriesPoint[] {
      return state.data?.result?.timeseries ?? []
    },
    totals(state): CloudflareTimeseriesPoint | undefined {
      return state.data?.result?.totals
    },
    totalRequests(state): number {
      return getRequestsTotal(state.data?.result?.totals)
    },
    totalBandwidth(state): number {
      return getBandwidthTotal(state.data?.result?.totals)
    },
    totalThreats(state): number {
      return getThreatsTotal(state.data?.result?.totals)
    },
    totalPageviews(state): number {
      return getPageviewsTotal(state.data?.result?.totals)
    },
    totalUniques(state): number {
      return getUniquesTotal(state.data?.result?.totals)
    },
    chartData(state): { date: string; requests: number; bandwidth: number }[] {
      const ts = state.data?.result?.timeseries ?? []
      return ts.map((p) => ({
        date: p.until ?? p.since ?? '',
        requests: getRequestsTotal(p),
        bandwidth: getBandwidthTotal(p),
      }))
    },
  },

  actions: {
    async fetchDashboard(params?: { since?: string; until?: string; continuous?: boolean }) {
      this.loading = true
      this.error = null
      try {
        const { data: raw } = await axios.get<CloudflareDashboardResponse | CloudflareGraphQLResponse>(
          `${CLOUDFLARE_BASE}/dashboard`,
          {
            params: params ?? {},
            withCredentials: true,
          }
        )
        if (raw && isGraphQLResponse(raw)) {
          this.data = normalizeGraphQLResponse(raw)
        } else {
          this.data = (raw as CloudflareDashboardResponse) ?? null
        }
      } catch (err: unknown) {
        const ax = err as { response?: { data?: unknown }; message?: string }
        this.error =
          typeof ax.response?.data === 'string'
            ? ax.response.data
            : (ax.response?.data as { message?: string })?.message ?? ax.message ?? 'Failed to load Cloudflare analytics'
      } finally {
        this.loading = false
      }
    },
  },
})
