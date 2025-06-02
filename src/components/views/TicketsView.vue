<script lang="ts" setup>
import { onMounted } from 'vue'
import { useTicketStore } from './../../stores/ticketsStore'

const ticketStore = useTicketStore()

onMounted(() => {
  ticketStore.loadOpenTickets()
})
</script>

<template>
  <div class="tickets-view">
    <div class="filters-wrapper">
      <h2>Filters</h2>
    </div>
    <h1>All Tickets</h1>
    <div v-if="ticketStore.loading">Loading ...</div>
    <div v-else-if="ticketStore.error">{{ ticketStore.error }}</div>
    <ul v-else>
      <li v-for="ticket in ticketStore.tickets" :key="ticket.id">
        <strong>{{ ticket.title }}</strong> - {{ ticket.status }}
      </li>
    </ul>
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
.filters-wrapper{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    height: 100px;
    background-color: #2e373e;
}
</style>