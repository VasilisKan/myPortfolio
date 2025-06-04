<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useTicketStore } from './../../stores/ticketsStore'

const ticketStore = useTicketStore()
const selectedTicketId = ref<number | null>(null)

const nameFilter = ref('')
const categoryFilter = ref('')
const dateRangeFilter = ref<[Date | null, Date | null]>([null, null])

onMounted(() => {
  ticketStore.loadOpenTickets()
})

const selectRow = (ticketId: number) => {
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
  dateRangeFilter.value = [null, null]
}
</script>

<template>
  <div class="tickets-view">
    <div class="filters-wrapper">
      <div class="filter-group">
        <label for="name-filter">Filter by Name:</label>
        <select id="name-filter" v-model="nameFilter">
          <option value="">All Names</option>
          <option v-for="name in uniqueNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label for="category-filter">Filter by Category:</label>
        <select id="category-filter" v-model="categoryFilter">
          <option value="">All Categories</option>
          <option v-for="category in uniqueCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Date Range:</label>
        <div class="date-range-inputs">
          <input 
            type="date" 
            v-model="dateRangeFilter[0]" 
            placeholder="From date"
            class="date-input"
          >
          <span>to</span>
          <input 
            type="date" 
            v-model="dateRangeFilter[1]" 
            placeholder="To date"
            class="date-input"
          >
        </div>
      </div>
      
      <button class="clear-filters" @click="clearFilters">
        Clear Filters
      </button>
    </div>
    
    <div v-if="ticketStore.loading">Loading ...</div>
    <div v-else-if="ticketStore.error">{{ ticketStore.error }}</div>
    <div v-else class="table-container">
      <table class="tickets-table">
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
            v-for="(ticket, index) in filteredTickets" 
            :key="ticket.id" 
            :class="{'selected-row': selectedTicketId === ticket.id}"
            @click="selectRow(ticket.id)"
          >
            <td>{{ index + 1 }}</td> 
            <td>{{ ticket.userEmail }}</td>
            <td>{{ ticket.title }}</td>
            <td>{{ ticket.category }}</td>
            <td>{{ new Date(ticket.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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
    align-items: center;
    gap: 1.5rem;
    width: 95%;
    padding: 1.5rem;
    margin: 20px auto;
    border-radius: 12px;
    background-color: #2b2b2b;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-group label {
    font-size: 14px;
    color: #a0a0a0;
    font-weight: 500;
}

.filter-group select {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid #3d3d3d;
    background-color: #1f1f1f;
    color: #f0f0f0;
    font-size: 14px;
    min-width: 180px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.filter-group select:hover {
    border-color: #4d4d4d;
}

.filter-group select:focus {
    outline: none;
    border-color: #5d5d5d;
    box-shadow: 0 0 0 2px rgba(93, 93, 93, 0.3);
}

.date-range-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.date-input {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #3d3d3d;
    background-color: #1f1f1f;
    color: #f0f0f0;
    font-size: 14px;
}

.date-input:focus {
    outline: none;
    border-color: #5d5d5d;
}

.clear-filters {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    background-color: #3d3d3d;
    color: #f0f0f0;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: auto;
    align-self: flex-end;
}

.clear-filters:hover {
    background-color: #4d4d4d;
}

.table-container {
    width: 95%;
    margin: 0 auto 20px auto;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  color: #f0f0f0;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  font-size: 16px;
}

.tickets-table th,
.tickets-table td {
  font-family: Arial, Helvetica, sans-serif;
  padding: 25px 20px;
  text-align: left;
  border: none;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.tickets-table thead {
  background-color: #3d3d3d;
  color: #ffffff;
  text-transform: uppercase;
  font-size: 16px;
  border-radius: 12px;
}

.tickets-table tbody tr {
  background-color: #2b2b2b;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.tickets-table tbody tr:hover {
  background-color: #3d3d3d;
  color: #ffffff;
  border-radius: 12px;
}

.tickets-table tbody tr.selected-row {
  background-color: #3d3d3d !important;
  font-weight: bold;
  color: #ffffff;
}

.tickets-table tbody tr td:first-child {
  font-weight: 600;
  font-size: 18px;
  color: #ffffff; 
}

@media (max-width: 768px) {
  .filters-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .clear-filters {
    margin-left: 0;
    align-self: stretch;
  }
  
  .tickets-table th,
  .tickets-table td {
    padding: 15px 10px;
    font-size: 14px;
  }
}
</style>