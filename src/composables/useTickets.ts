import { ref } from 'vue'
import axios from 'axios'

import { API_BASE } from '../config'

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  userEmail: string
}

export function useTickets() {
  const tickets = ref<Ticket[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadTickets() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_BASE}/ticket/TicketSubmit/get`, {
        withCredentials: true 
      })
      tickets.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Error fetching tickets'
    } finally {
      loading.value = false
    }
  }

  return { tickets, loading, error, loadTickets }
}
