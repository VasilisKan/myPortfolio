import { defineStore } from 'pinia'
import { api } from '../lib/api'

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
        const res = await api.get('/api/auth/me')
        this.user = res.data
        this.isAuthenticated = true
      } catch {
        this.user = null
        this.isAuthenticated = false
      }
    },
    async login(email: string, password: string) {
      await api.post('/api/auth/login', { email, password })
      await this.fetchMe()
    },
    async logout() {
      await api.post('/api/auth/logout', {})
      this.user = null
      this.isAuthenticated = false
    }
  },
  getters: {
    userEmail: (state) => state.user?.email,
    userRole: (state) => state.user?.isAdmin ? 'admin' : 'user',
  }
})
