import { defineStore } from 'pinia'
import { api } from '../lib/api'

const TICKET_BASE = '/ticket/TicketSubmit'
const MY_TICKETS_PATH = 'my-tickets'

export interface TicketReply {
  id: string
  ticketId: string
  userId: string
  userEmail: string
  message: string
  createdAt: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: string
  createdAt: string
  updatedAt: string
  isResolved: boolean
  userEmail: string
}

export interface TicketDetail extends Omit<Ticket, 'description'> {
  description?: string
}

function normalizeTicket(raw: Record<string, unknown>): Ticket {
  return {
    id: String(raw.id ?? raw.Id ?? ''),
    title: String(raw.title ?? raw.Title ?? ''),
    description: String(raw.description ?? raw.Description ?? ''),
    category: String(raw.category ?? raw.Category ?? ''),
    createdAt: String(raw.createdAt ?? raw.created_at ?? raw.CreatedAt ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? raw.UpdatedAt ?? ''),
    isResolved: Boolean(raw.isResolved ?? raw.is_resolved ?? raw.IsResolved ?? false),
    userEmail: String(raw.userEmail ?? raw.user_email ?? raw.UserEmail ?? ''),
  }
}

function toTicketArray(data: unknown): Ticket[] {
  let arr: unknown[] = []
  if (Array.isArray(data)) arr = data
  else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    const maybe = obj.tickets ?? obj.data ?? obj.items ?? obj.result
    if (Array.isArray(maybe)) arr = maybe
  }
  return arr
    .filter((t): t is Record<string, unknown> => t != null && typeof t === 'object')
    .map(normalizeTicket)
}

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    tickets: [] as Ticket[],
    loading: false,
    error: null as string | null,
    replies: [] as TicketReply[],
    repliesLoading: false,
    repliesError: null as string | null,
  }),

  actions: {
    async loadOpenTickets() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get<unknown>(`${TICKET_BASE}/get`, {})
        this.tickets = toTicketArray(data ?? [])
      } catch (err: any) {
        this.error = err.response?.data ?? err.message ?? 'Failed to load tickets'
      } finally {
        this.loading = false
      }
    },

    async submitTicket(payload: { title: string; description: string; category: string }) {
      const { data } = await api.post<{ message?: string; ticketId?: string }>(
        `${TICKET_BASE}/submit`,
        payload,
        {}
      )
      const ticketId = data?.ticketId
      if (ticketId == null || ticketId === '') {
        throw new Error(data?.message ?? 'Server did not return a ticket ID')
      }
      return String(ticketId)
    },

    clearReplies() {
      this.replies = []
      this.repliesError = null
    },

    async getReplies(ticketId: string) {
      this.repliesLoading = true
      this.repliesError = null
      try {
        const { data } = await api.get<TicketReply[]>(
          `${TICKET_BASE}/${ticketId}/replies`,
          {}
        )
        this.replies = data ?? []
        return this.replies
      } catch (err: any) {
        this.repliesError = err.response?.data ?? err.message ?? 'Failed to load replies'
        this.replies = []
        throw err
      } finally {
        this.repliesLoading = false
      }
    },

    async replyToTicket(ticketId: string, message: string) {
      await api.post<{ message: string; replyId: string }>(
        `${TICKET_BASE}/${ticketId}/reply`,
        { message },
        {}
      )
      await this.getReplies(ticketId)
    },

    async updateTicket(
      id: string,
      payload: { title: string; description: string; category: string }
    ) {
      await api.put(`${TICKET_BASE}/update/${id}`, payload, {})
      await this.loadOpenTickets()
    },

    async resolveTicket(id: string) {
      await api.put(`${TICKET_BASE}/resolve/${id}`, null, {})
      await this.loadOpenTickets()
    },

    async reopenTicket(id: string) {
      await api.put(`${TICKET_BASE}/reopen/${id}`, null, {})
      await this.loadOpenTickets()
    },

    async loadMyTickets() {
      this.loading = true
      this.error = null
      this.tickets = []
      const config = {}

      try {
        try {
          const { data } = await api.get<unknown>(`${TICKET_BASE}/${MY_TICKETS_PATH}`, config)
          this.tickets = toTicketArray(data)
          return
        } catch (first: any) {
          if (first.response?.status === 404) {
            const { data } = await api.get<unknown>(`${TICKET_BASE}/get`, config)
            this.tickets = toTicketArray(data)
            return
          }
          throw first
        }
      } catch (err: any) {
        const res = err.response
        const msg = res?.data
        this.error =
          typeof msg === 'string'
            ? msg
            : msg?.message ?? res?.statusText ?? err.message ?? 'Failed to load your tickets'
      } finally {
        this.loading = false
      }
    },

    async deleteTicket(id: string) {
      await api.delete(`${TICKET_BASE}/delete/${id}`, {})
      await this.loadOpenTickets()
    },
  },
})
