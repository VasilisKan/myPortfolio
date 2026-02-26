import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL

interface User {
  email: string
  isAdmin: boolean
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
  }),
  actions: {
    async fetchMe() {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true })
        this.user = res.data
        this.isAuthenticated = true
      } catch {
        this.user = null
        this.isAuthenticated = false
      }
    },
    async login(email: string, password: string) {
      await axios.post(`${API_BASE}/api/auth/login`, { email, password }, { withCredentials: true })
      await this.fetchMe()
    },
    async logout() {
      await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true })
      this.user = null
      this.isAuthenticated = false
    }
  },
  getters: {
    userEmail: (state) => state.user?.email,
    userRole: (state) => state.user?.isAdmin ? 'admin' : 'user',
  }
})
