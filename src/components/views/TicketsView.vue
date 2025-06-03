<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useTicketStore } from './../../stores/ticketsStore'

const ticketStore = useTicketStore()
const selectedTicketId = ref<number | null>(null)

onMounted(() => {
  ticketStore.loadOpenTickets()
})

const selectRow = (ticketId: number) => {
  selectedTicketId.value = ticketId
}
</script>

<template>
  <div class="tickets-view">
    <div class="filters-wrapper">
      <h2>Filters</h2>
    </div>
    <div v-if="ticketStore.loading">Loading ...</div>
    <div v-else-if="ticketStore.error">{{ ticketStore.error }}</div>
    <table v-else class="tickets-table">
      <thead>
        <tr>
          <th>A/A</th>
          <th>Name</th>
          <th>Title</th>
          <th>Category</th>
          <th>Created Date</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(ticket, index) in ticketStore.tickets" 
          :key="ticket.id" 
          :class="{'selected-row': selectedTicketId === ticket.id}"
          @click="selectRow(ticket.id)"
        >
          <td>{{ index + 1 }}</td> <!-- Auto-incrementing number -->
          <td>{{ ticket.name }}</td>
          <td>{{ ticket.title }}</td>
          <td>{{ ticket.category }}</td>
          <td>{{ ticket.createdDate }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
.tickets-view {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
}

.filters-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    height: 100px;
    background-color: #2e373e;
    margin-bottom: 3em;
}

.tickets-table {
    width: 95%;
    margin: 0 auto;
    border-collapse: collapse;
    background-color: #2e373e;
    color: white;
}

.tickets-table th,
.tickets-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #444;
}

.tickets-table thead {
    background-color: #1f2933;
}

.tickets-table tbody tr {
    background-color: #2e373e;
    cursor: pointer;
}

.tickets-table tbody tr.selected-row {
    background-color: #4b565f !important; 
}
</style>