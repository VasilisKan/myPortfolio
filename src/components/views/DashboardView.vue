<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import Chart from 'primevue/chart'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faChartLine,
  faShieldHalved,
  faEye,
  faUsers,
  faServer,
  faInbox,
  faCircleCheck,
  faFolderOpen,
  faPercent,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useCloudflareStore } from '@/stores/cloudflareStore'
import { useTicketStore } from '@/stores/ticketsStore'
import type { Ticket } from '@/stores/ticketsStore'

library.add(
  faChartLine,
  faShieldHalved,
  faEye,
  faUsers,
  faServer,
  faInbox,
  faCircleCheck,
  faFolderOpen,
  faPercent,
  faTag
)

const cloudflare = useCloudflareStore()
const ticketStore = useTicketStore()

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

function fetchLast24h() {
  const until = new Date()
  const since = new Date(until.getTime() - ONE_DAY_MS)
  cloudflare.fetchDashboard({
    since: since.toISOString(),
    until: until.toISOString(),
  })
}

onMounted(() => {
  fetchLast24h()
  ticketStore.loadOpenTickets()
})

function formatBandwidth(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

const requestsChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Request volume',
      font: { size: 14, weight: '500' },
    },
  },
  scales: {
    x: {
      ticks: { maxTicksLimit: 10, maxRotation: 45, font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      ticks: { font: { size: 11 } },
    },
  },
}))

const bandwidthChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Data transferred',
      font: { size: 14, weight: '500' },
    },
  },
  scales: {
    x: {
      ticks: { maxTicksLimit: 10, maxRotation: 45, font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      ticks: {
        font: { size: 11 },
        callback(value: number) {
          if (value === 0) return '0'
          return formatBandwidth(value)
        },
      },
    },
  },
}))

const requestsChartData = computed(() => {
  const cd = cloudflare.chartData
  return {
    labels: cd.map((d) => {
      try {
        const date = new Date(d.date)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' })
      } catch {
        return d.date
      }
    }),
    datasets: [
      {
        label: 'Requests',
        data: cd.map((d) => d.requests),
        borderColor: 'rgb(25, 113, 194)',
        backgroundColor: 'rgba(25, 113, 194, 0.1)',
        fill: true,
        tension: 0.2,
      },
    ],
  }
})

const bandwidthChartData = computed(() => {
  const cd = cloudflare.chartData
  return {
    labels: cd.map((d) => {
      try {
        const date = new Date(d.date)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' })
      } catch {
        return d.date
      }
    }),
    datasets: [
      {
        label: 'Bandwidth',
        data: cd.map((d) => d.bandwidth),
        borderColor: 'rgb(88, 166, 255)',
        backgroundColor: 'rgba(88, 166, 255, 0.1)',
        fill: true,
        tension: 0.2,
      },
    ],
  }
})

const lastMonthStart = computed(() => new Date(Date.now() - ONE_MONTH_MS))

const ticketsLastMonthReceived = computed(() => {
  const start = lastMonthStart.value.getTime()
  return ticketStore.tickets.filter((t) => new Date(t.createdAt).getTime() >= start).length
})

const ticketsLastMonthResolved = computed(() => {
  const start = lastMonthStart.value.getTime()
  return ticketStore.tickets.filter(
    (t) => t.isResolved && new Date(t.updatedAt).getTime() >= start
  ).length
})

const ticketsOpenNow = computed(() => ticketStore.tickets.filter((t) => !t.isResolved).length)

const ticketsResolutionRate = computed(() => {
  const total = ticketStore.tickets.length
  const resolved = ticketStore.tickets.filter((t) => t.isResolved).length
  if (total === 0) return 0
  return Math.round((resolved / total) * 100)
})

function topCategoryLastMonth(tickets: Ticket[]): string {
  const start = lastMonthStart.value.getTime()
  const lastMonth = tickets.filter((t) => new Date(t.createdAt).getTime() >= start)
  if (lastMonth.length === 0) return '—'
  const byCat: Record<string, number> = {}
  lastMonth.forEach((t) => {
    const c = t.category || 'Other'
    byCat[c] = (byCat[c] ?? 0) + 1
  })
  const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  return entries[0]?.[0] ?? '—'
}

const ticketTopCategory = computed(() => topCategoryLastMonth(ticketStore.tickets))
</script>

<template>
  <div class="dashboard-view">
    <!-- Web analytics -->
    <section class="analytics-section">
      <header class="section-header">
        <div class="section-titles">
          <h2 class="section-title">Web analytics</h2>
          <p class="section-subtitle">Traffic and security for your zone · Last 24 hours</p>
        </div>
        <div class="section-actions">
          <span class="period-badge">Last 24 hours</span>
          <Button label="Refresh" icon="pi pi-refresh" severity="secondary" size="small" @click="fetchLast24h" />
        </div>
      </header>

      <div v-if="cloudflare.loading" class="loading-skeletons">
        <div class="skeleton-row">
<Skeleton v-for="n in 5" :key="n" height="72px" class="skeleton-tile" />
          </div>
          <Skeleton height="280px" class="skeleton-chart" />
      </div>

      <Message v-else-if="cloudflare.error" severity="error" :closable="false" class="section-message">
        {{ cloudflare.error }}
      </Message>

      <template v-else>
        <div class="stat-grid">
          <div class="stat-tile stat-tile--requests">
            <div class="stat-tile__icon">
              <font-awesome-icon :icon="['fas', 'chart-line']" />
            </div>
            <div class="stat-tile__content">
              <span class="stat-tile__label">Total requests</span>
              <span class="stat-tile__value stat-tile__value--number">{{ cloudflare.totalRequests.toLocaleString() }}</span>
            </div>
          </div>
          <div class="stat-tile stat-tile--bandwidth">
            <div class="stat-tile__icon">
              <font-awesome-icon :icon="['fas', 'server']" />
            </div>
            <div class="stat-tile__content">
              <span class="stat-tile__label">Bandwidth</span>
              <span class="stat-tile__value stat-tile__value--unit">{{ formatBandwidth(cloudflare.totalBandwidth) }}</span>
            </div>
          </div>
          <div class="stat-tile stat-tile--threats">
            <div class="stat-tile__icon">
              <font-awesome-icon :icon="['fas', 'shield-halved']" />
            </div>
            <div class="stat-tile__content">
              <span class="stat-tile__label">Threats blocked</span>
              <span class="stat-tile__value stat-tile__value--number">{{ cloudflare.totalThreats.toLocaleString() }}</span>
            </div>
          </div>
          <div class="stat-tile stat-tile--pageviews">
            <div class="stat-tile__icon">
              <font-awesome-icon :icon="['fas', 'eye']" />
            </div>
            <div class="stat-tile__content">
              <span class="stat-tile__label">Page views</span>
              <span class="stat-tile__value stat-tile__value--number">{{ cloudflare.totalPageviews.toLocaleString() }}</span>
            </div>
          </div>
          <div class="stat-tile stat-tile--uniques">
            <div class="stat-tile__icon">
              <font-awesome-icon :icon="['fas', 'users']" />
            </div>
            <div class="stat-tile__content">
              <span class="stat-tile__label">Unique visitors</span>
              <span class="stat-tile__value stat-tile__value--number">{{ cloudflare.totalUniques.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div v-if="cloudflare.chartData.length" class="charts-section">
          <div class="chart-panel">
            <Chart type="line" :data="requestsChartData" :options="requestsChartOptions" />
          </div>
          <div class="chart-panel">
            <Chart type="line" :data="bandwidthChartData" :options="bandwidthChartOptions" />
          </div>
        </div>

        <Message
          v-else-if="!cloudflare.loading && !cloudflare.error"
          severity="info"
          :closable="false"
          class="section-message"
        >
          No data for the last 24 hours.
        </Message>
      </template>
    </section>

    <!-- Ticket analytics -->
    <section class="analytics-section analytics-section--tickets">
      <header class="section-header">
        <div class="section-titles">
          <h2 class="section-title">Ticket analytics</h2>
          <p class="section-subtitle">Support tickets in the last 30 days</p>
        </div>
      </header>

      <div v-if="ticketStore.loading" class="skeleton-row">
        <Skeleton v-for="n in 5" :key="n" height="72px" class="skeleton-tile" />
      </div>
      <Message v-else-if="ticketStore.error" severity="error" :closable="false" class="section-message">
        {{ ticketStore.error }}
      </Message>
      <div v-else class="stat-grid">
        <div class="stat-tile stat-tile--inbox">
          <div class="stat-tile__icon">
            <font-awesome-icon :icon="['fas', 'inbox']" />
          </div>
          <div class="stat-tile__content">
            <span class="stat-tile__label">Received (30 days)</span>
            <span class="stat-tile__value stat-tile__value--number">{{ ticketsLastMonthReceived }}</span>
          </div>
        </div>
        <div class="stat-tile stat-tile--resolved">
          <div class="stat-tile__icon">
            <font-awesome-icon :icon="['fas', 'circle-check']" />
          </div>
          <div class="stat-tile__content">
            <span class="stat-tile__label">Resolved (30 days)</span>
            <span class="stat-tile__value stat-tile__value--number">{{ ticketsLastMonthResolved }}</span>
          </div>
        </div>
        <div class="stat-tile stat-tile--open">
          <div class="stat-tile__icon">
            <font-awesome-icon :icon="['fas', 'folder-open']" />
          </div>
          <div class="stat-tile__content">
            <span class="stat-tile__label">Open now</span>
            <span class="stat-tile__value stat-tile__value--number">{{ ticketsOpenNow }}</span>
          </div>
        </div>
        <div class="stat-tile stat-tile--rate">
          <div class="stat-tile__icon">
            <font-awesome-icon :icon="['fas', 'percent']" />
          </div>
          <div class="stat-tile__content">
            <span class="stat-tile__label">Resolution rate</span>
            <span class="stat-tile__value stat-tile__value--number">{{ ticketsResolutionRate }}%</span>
          </div>
        </div>
        <div class="stat-tile stat-tile--category">
          <div class="stat-tile__icon">
            <font-awesome-icon :icon="['fas', 'tag']" />
          </div>
          <div class="stat-tile__content">
            <span class="stat-tile__label">Top category (30 days)</span>
            <span class="stat-tile__value stat-tile__value--text">{{ ticketTopCategory }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analytics-section {
  background: var(--dashboard-card);
  border: 1px solid var(--dashboard-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.analytics-section--tickets {
  margin-top: 0;
}

.section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--dashboard-border);
}

.section-titles {
  min-width: 0;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--dashboard-text);
}

.section-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--dashboard-text-muted);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.period-badge {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--dashboard-text-muted);
}

.section-message {
  margin-bottom: 1rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-tile {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--dashboard-bg);
  border-radius: 10px;
  border-left: 3px solid var(--stat-accent, var(--dashboard-accent));
  transition: background 0.15s, border-color 0.15s;
}

.stat-tile:hover {
  background: var(--dashboard-hover);
}

.stat-tile--requests { --stat-accent: #1971c2; }
.stat-tile--bandwidth { --stat-accent: #2f9e44; }
.stat-tile--threats { --stat-accent: #e03131; }
.stat-tile--pageviews { --stat-accent: #9c36b5; }
.stat-tile--uniques { --stat-accent: #0ca678; }
.stat-tile--inbox { --stat-accent: #1971c2; }
.stat-tile--resolved { --stat-accent: #2f9e44; }
.stat-tile--open { --stat-accent: #f59f00; }
.stat-tile--rate { --stat-accent: #9c36b5; }
.stat-tile--category { --stat-accent: #0ca678; }

.stat-tile__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: var(--stat-accent);
  background: color-mix(in srgb, var(--stat-accent) 18%, transparent);
}

.stat-tile__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-tile__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--dashboard-text-muted);
}

.stat-tile__value {
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--dashboard-text);
  line-height: 1.2;
}

.stat-tile__value--number {
  font-variant-numeric: tabular-nums;
}

.stat-tile__value--unit {
  white-space: nowrap;
}

.stat-tile__value--text {
  font-size: 1.0625rem;
}

.loading-skeletons {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.skeleton-tile {
  border-radius: 10px;
}

.skeleton-chart {
  border-radius: 12px;
  margin-top: 0.5rem;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.chart-panel {
  height: 280px;
  padding: 1.25rem;
  background: var(--dashboard-bg);
  border-radius: 10px;
  border: 1px solid var(--dashboard-border);
}

@media (min-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .analytics-section--tickets .stat-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
