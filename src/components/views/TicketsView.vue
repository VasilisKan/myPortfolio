<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useTicketStore } from './../../stores/ticketsStore'
import type { Ticket, TicketDetail } from './../../stores/ticketsStore'
import { useDashboardTheme } from '@/composables/useDashboardTheme'
import { useAuth } from '@/composables/useAuth'
import TicketDetailPanel from '../TicketDetailPanel.vue'

library.add(faPen)

const props = withDefaults(
  defineProps<{ userMode?: boolean }>(),
  { userMode: false }
)

const { theme } = useDashboardTheme()
const { user } = useAuth()
const ticketStore = useTicketStore()
const selectedTicketId = ref<string | null>(null)
const editingTicket = ref<TicketDetail | null>(null)
const isAdmin = computed(() => !props.userMode && !!user.value?.isAdmin)

const nameFilter = ref('')
const categoryFilter = ref('')
type StatusFilter = 'open' | 'resolved' | 'all'
const statusFilter = ref<StatusFilter>('open')

const today = new Date()
today.setHours(23, 59, 59, 999)
const defaultStartDate = new Date(2025, 0, 1)
defaultStartDate.setHours(0, 0, 0, 0)
const dateRangeFilter = ref<[Date, Date]>([defaultStartDate, today])

onMounted(() => {
  if (props.userMode) {
    ticketStore.loadMyTickets()
  } else {
    ticketStore.loadOpenTickets()
  }
})

const selectRow = (ticketId: string) => {
  selectedTicketId.value = ticketId
}

const uniqueCategories = computed(() => {
  const categories = new Set<string>()
  ticketStore.tickets.forEach(ticket => categories.add(ticket.category))
  return Array.from(categories).sort()
})

const uniqueNames = computed(() => {
  const names = new Set<string>()
  ticketStore.tickets.forEach(ticket => names.add(ticket.userEmail))
  return Array.from(names).sort()
})

const filteredTickets = computed(() => {
  return ticketStore.tickets.filter(ticket => {
    if (statusFilter.value === 'open' && ticket.isResolved) return false
    if (statusFilter.value === 'resolved' && !ticket.isResolved) return false
    if (nameFilter.value && !ticket.userEmail.toLowerCase().includes(nameFilter.value.toLowerCase())) {
      return false
    }
    if (categoryFilter.value && ticket.category !== categoryFilter.value) {
      return false
    }
    if (dateRangeFilter.value[0] || dateRangeFilter.value[1]) {
      const ticketDate = new Date(ticket.createdAt)
      const [startDate, endDate] = dateRangeFilter.value
      if (startDate && ticketDate < startDate) return false
      if (endDate && ticketDate > endDate) return false
    }
    return true
  })
})

const clearFilters = () => {
  nameFilter.value = ''
  categoryFilter.value = ''
  statusFilter.value = 'open'
  dateRangeFilter.value = [defaultStartDate, today]
}

function openTicketDetail(ticket: Ticket | TicketDetail, e: Event) {
  e.stopPropagation()
  editingTicket.value = ticket
}

function closeTicketDetail() {
  editingTicket.value = null
}

function onTicketUpdated(updated: TicketDetail) {
  editingTicket.value = updated
}
</script>

<template>
  <div class="tickets-view">
    <div class="filters-wrapper">
      <div v-if="!userMode" class="filter-group">
        <label for="name-filter">Name:</label>
        <select id="name-filter" v-model="nameFilter">
          <option value="">All Names</option>
          <option v-for="name in uniqueNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label for="category-filter">Category:</label>
        <select id="category-filter" v-model="categoryFilter">
          <option value="">All Categories</option>
          <option v-for="category in uniqueCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="status-filter">Status:</label>
        <select id="status-filter" v-model="statusFilter">
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="all">All</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Date:</label>
        <Datepicker
          v-model="dateRangeFilter"
          range
          :enable-time-picker="false"
          :clearable="true"
          :dark="theme === 'dark'"
          placeholder="Select date range"
          input-class="date-input"
        />
      </div>

      <button class="clear-filters" @click="clearFilters">
        Clear Filters
      </button>
    </div>

    <div v-if="ticketStore.loading">Loading ...</div>
    <div v-else-if="ticketStore.error">{{ ticketStore.error }}</div>
    <div v-else class="table-container">
      <div v-if="filteredTickets.length === 0" class="no-tickets-message">
        No tickets found for the selected filters.
      </div>
      <table v-else class="tickets-table">
        <thead>
          <tr>
            <th>A/A</th>
            <th v-if="!userMode">Name</th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Created Date</th>
            <th class="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(ticket, index) in filteredTickets"
            :key="ticket.id"
            :class="{ 'selected-row': selectedTicketId === ticket.id }"
            @click="selectRow(ticket.id)"
          >
            <td>{{ index + 1 }}</td>
            <td v-if="!userMode">{{ ticket.userEmail }}</td>
            <td>{{ ticket.title }}</td>
            <td>{{ ticket.category }}</td>
            <td>
              <span :class="['status-badge', { 'status-resolved': ticket.isResolved }]">
                {{ ticket.isResolved ? 'Resolved' : 'Open' }}
              </span>
            </td>
            <td>{{ new Date(ticket.createdAt).toLocaleDateString() }}</td>
            <td class="td-actions">
              <button
                type="button"
                class="edit-btn"
                aria-label="View ticket details"
                @click="openTicketDetail(ticket, $event)"
              >
                <font-awesome-icon :icon="['fas', 'pen']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <TicketDetailPanel
      :ticket="editingTicket"
      :is-admin="isAdmin"
      @close="closeTicketDetail"
      @updated="onTicketUpdated"
    />
  </div>
</template>

<style scoped>
.tickets-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 100%;
}

.filters-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--dashboard-card);
  border: 1px solid var(--dashboard-border);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: var(--dashboard-text-muted);
  font-weight: 500;
}

.filter-group select {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-input-border);
  background: var(--dashboard-input-bg);
  color: var(--dashboard-text);
  font-size: 0.875rem;
  min-width: 160px;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--dashboard-accent);
}

.date-input {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-input-border);
  background: var(--dashboard-input-bg);
  color: var(--dashboard-text);
  font-size: 0.875rem;
}

.clear-filters {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-border);
  background: var(--dashboard-card);
  color: var(--dashboard-text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  margin-left: auto;
}

.clear-filters:hover {
  background: var(--dashboard-hover);
}

.table-container {
  background: var(--dashboard-card);
  border: 1px solid var(--dashboard-border);
  border-radius: 8px;
  overflow: hidden;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.tickets-table th,
.tickets-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--dashboard-border);
  color: var(--dashboard-text);
}

.tickets-table th {
  background: var(--dashboard-hover);
  color: var(--dashboard-text-muted);
  font-weight: 600;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.tickets-table tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}

.tickets-table tbody tr:hover {
  background: var(--dashboard-hover);
}

.tickets-table tbody tr.selected-row {
  background: var(--dashboard-accent-bg);
}

.tickets-table tbody tr:last-child td {
  border-bottom: none;
}

.th-actions {
  width: 80px;
  text-align: center;
}

.td-actions {
  text-align: center;
  vertical-align: middle;
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dashboard-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.edit-btn:hover {
  background: var(--dashboard-accent-bg);
  color: var(--dashboard-accent);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--dashboard-accent-bg);
  color: var(--dashboard-accent);
}

.status-badge.status-resolved {
  background: rgba(130, 223, 139, 0.2);
  color: #2d8a3e;
}

.no-tickets-message {
  padding: 2rem;
  text-align: center;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

@media (max-width: 768px) {
  .filters-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-group select,
  .date-input {
    min-width: 0;
    width: 100%;
  }
  .clear-filters {
    margin-left: 0;
  }
}
</style>
