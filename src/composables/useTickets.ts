import { ref } from 'vue'
import { api } from '../lib/api'

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
      const response = await api.get('/ticket/TicketSubmit/get')
      tickets.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Error fetching tickets'
    } finally {
      loading.value = false
    }
  }

  return { tickets, loading, error, loadTickets }
}
