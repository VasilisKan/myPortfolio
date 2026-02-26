<script lang="ts" setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Header from '../components/Header.vue'
import { useTicketStore } from '../stores/ticketsStore'

const ticketStore = useTicketStore()

onMounted(() => {
  ticketStore.loadMyTickets()
})

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}
</script>

<template>
  <div class="ticket-list-page">
    <Header />
    <div class="ticket-list-content">
      <div class="page-header">
        <h1 class="page-title">My tickets</h1>
        <p class="page-subtitle">View and manage your support tickets.</p>
        <RouterLink to="/ticket/create" class="btn-primary">New ticket</RouterLink>
      </div>

      <div v-if="ticketStore.loading" class="loading">Loading your tickets…</div>
      <p v-else-if="ticketStore.error" class="panel-error">{{ ticketStore.error }}</p>
      <div v-else-if="ticketStore.tickets.length === 0" class="empty-state">
        <p>You don’t have any tickets yet.</p>
        <RouterLink to="/ticket/create" class="btn-primary">Create your first ticket</RouterLink>
      </div>
      <div v-else class="ticket-list">
        <RouterLink
          v-for="ticket in ticketStore.tickets"
          :key="ticket.id"
          :to="`/ticket/${ticket.id}`"
          class="ticket-card"
        >
          <div class="ticket-card-header">
            <span class="ticket-title">{{ ticket.title }}</span>
            <span :class="['ticket-status', { resolved: ticket.isResolved }]">
              {{ ticket.isResolved ? 'Resolved' : 'Open' }}
            </span>
          </div>
          <p class="ticket-meta">{{ ticket.category }} · {{ formatDate(ticket.createdAt) }}</p>
          <p v-if="ticket.description" class="ticket-preview">{{ ticket.description.slice(0, 120) }}{{ ticket.description.length > 120 ? '…' : '' }}</p>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-list-page {
  min-height: 100vh;
  background: #0d0d0d;
  color: #e4e4e4;
}

.ticket-list-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 600;
}

.page-subtitle {
  margin: 0 0 1.5rem;
  color: #a0a0a0;
  font-size: 0.9375rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, #00c9ff, #92fe9d);
  color: #111;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #a0a0a0;
}

.panel-error {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  background: rgba(200, 0, 0, 0.15);
  color: #f88;
  border-radius: 8px;
  font-size: 0.875rem;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
}

.empty-state p {
  margin: 0 0 1rem;
  color: #a0a0a0;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ticket-card {
  display: block;
  padding: 1rem 1.25rem;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}

.ticket-card:hover {
  border-color: #00c9ff;
  background: #1f1f1f;
}

.ticket-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.ticket-title {
  font-weight: 600;
  font-size: 1rem;
}

.ticket-status {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: rgba(0, 201, 255, 0.15);
  color: #00c9ff;
}

.ticket-status.resolved {
  background: rgba(130, 223, 139, 0.15);
  color: #82df8b;
}

.ticket-meta {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  color: #868e96;
}

.ticket-preview {
  margin: 0;
  font-size: 0.875rem;
  color: #a0a0a0;
  line-height: 1.4;
}
</style>
