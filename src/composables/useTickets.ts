import { ref } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
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
        withCredentials: true // Ensures cookies are sent, if needed for auth
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
