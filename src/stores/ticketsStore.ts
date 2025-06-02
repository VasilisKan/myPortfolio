// src/stores/ticketStore.ts
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    tickets: [] as any[], 
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async loadOpenTickets() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`${API_BASE}/ticket/TicketSubmit/get`, {
          withCredentials: true 
        })
        this.tickets = response.data
      } catch (err: any) {
        this.error = err.message || 'Failed to load tickets'
      } finally {
        this.loading = false
      }
    },
  },
})
