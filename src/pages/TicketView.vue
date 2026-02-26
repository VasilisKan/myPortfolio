<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import Header from '../components/Header.vue'
import { useTicketStore } from '../stores/ticketsStore'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()
const { user } = useAuth()

const ticketId = computed(() => route.params.id as string)
const replyMessage = ref('')
const replySending = ref(false)
const error = ref<string | null>(null)

const initialTicket = computed(() => {
  const s = history.state as { initialTitle?: string; initialDescription?: string; initialCategory?: string } | undefined
  return s && (s.initialTitle != null || s.initialDescription != null)
    ? { title: s.initialTitle ?? '', description: s.initialDescription ?? '', category: s.initialCategory ?? '' }
    : null
})

const currentUserEmail = computed(() => user.value?.email ?? null)

const chatHistory = computed(() => {
  const list: Array<{ sender?: string; text: string; createdAt?: string; isInitial?: boolean }> = []
  if (initialTicket.value?.description) {
    list.push({
      sender: 'You',
      text: initialTicket.value.description,
      createdAt: undefined,
      isInitial: true,
    })
  }
  ticketStore.replies.forEach((r) => {
    list.push({
      sender: r.userEmail,
      text: r.message,
      createdAt: r.createdAt,
      isInitial: false,
    })
  })
  return list.sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : (a.isInitial ? 0 : 1)
    const db = b.createdAt ? new Date(b.createdAt).getTime() : (b.isInitial ? 0 : 1)
    return da - db
  })
})

function isFromCurrentUser(msg: { sender?: string; isInitial?: boolean }) {
  if (msg.isInitial) return true
  const email = currentUserEmail.value
  return email != null && msg.sender === email
}

function formatDate(value: string | undefined) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

async function loadReplies() {
  if (!ticketId.value) return
  error.value = null
  try {
    await ticketStore.getReplies(ticketId.value)
  } catch (err: any) {
    error.value = err.response?.data ?? err.message ?? 'Failed to load replies'
  }
}

onMounted(() => {
  loadReplies()
})

watch(ticketId, (newId, oldId) => {
  if (newId !== oldId) {
    ticketStore.clearReplies()
  }
  loadReplies()
})

async function submitReply(e: Event) {
  e.preventDefault()
  if (!ticketId.value || !replyMessage.value.trim()) return
  replySending.value = true
  error.value = null
  try {
    await ticketStore.replyToTicket(ticketId.value, replyMessage.value.trim())
    replyMessage.value = ''
  } catch (err: any) {
    error.value = err.response?.data ?? err.message ?? 'Failed to send reply'
  } finally {
    replySending.value = false
  }
}
</script>

<template>
  <div class="ticket-view-page">
    <Header />
    <div class="ticket-view-content">
      <div class="page-header">
        <RouterLink to="/" class="back-link">← Back to home</RouterLink>
        <h1 class="page-title">{{ initialTicket?.title ? initialTicket.title : `Ticket #${ticketId}` }}</h1>
        <p class="page-subtitle">
          {{ initialTicket ? 'Your request and replies appear below.' : 'View and reply to this support ticket.' }}
        </p>
        <p class="ticket-id-hint">Ticket ID: {{ ticketId }}</p>
        <RouterLink to="/ticket/create" class="secondary-link">Submit another ticket</RouterLink>
      </div>

      <p v-if="error" class="panel-error">{{ error }}</p>
      <div v-if="ticketStore.repliesLoading && chatHistory.length === 0" class="loading">
        Loading…
      </div>

      <section v-else class="chat-section">
        <h2 class="chat-heading">Replies</h2>
        <div v-if="chatHistory.length === 0" class="chat-empty">No replies yet. Be the first to reply.</div>
        <div v-else class="chat-list">
          <div
            v-for="(msg, idx) in chatHistory"
            :key="idx"
            :class="['chat-message', { 'message-initial': msg.isInitial, 'from-me': isFromCurrentUser(msg) }]"
          >
            <div class="message-meta">
              <span class="message-sender">{{ msg.sender ?? 'User' }}</span>
              <span v-if="msg.createdAt" class="message-date">{{ formatDate(msg.createdAt) }}</span>
              <span v-else-if="msg.isInitial" class="message-badge">Initial request</span>
            </div>
            <div class="message-text">{{ msg.text }}</div>
          </div>
        </div>

        <form class="reply-form" @submit="submitReply">
          <label for="reply">Your reply</label>
          <textarea
            id="reply"
            v-model="replyMessage"
            placeholder="Type your reply…"
            rows="3"
            class="reply-input"
            :disabled="replySending"
          />
          <button type="submit" class="btn-primary" :disabled="replySending || !replyMessage.trim()">
            {{ replySending ? 'Sending…' : 'Send reply' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ticket-view-page {
  min-height: 100vh;
  background: #0d0d0d;
  color: #e4e4e4;
}

.ticket-view-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.page-header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #00c9ff;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #92fe9d;
}

.page-title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.page-subtitle {
  margin: 0;
  color: #a0a0a0;
  font-size: 0.9375rem;
}

.ticket-id-hint {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  color: #666;
}

.secondary-link {
  display: inline-block;
  margin-top: 1rem;
  color: #00c9ff;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
}

.secondary-link:hover {
  color: #92fe9d;
}

.panel-error {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  background: rgba(200, 0, 0, 0.15);
  color: #f88;
  border-radius: 8px;
  font-size: 0.875rem;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #a0a0a0;
}

.chat-section {
  border-top: 1px solid #2a2a2a;
  padding-top: 1.5rem;
}

.chat-heading {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.chat-empty {
  padding: 1.5rem;
  text-align: center;
  color: #868e96;
  background: #1a1a1a;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.chat-message {
  padding: 1rem 1.25rem;
  background: #1a1a1a;
  border-radius: 10px;
  border-left: 4px solid #00c9ff;
}

.chat-message.message-initial {
  border-left-color: #82df8b;
}

.chat-message.from-me {
  border-left: none;
  border-right: 4px solid #00c9ff;
}

.message-badge {
  font-size: 0.75rem;
  color: #82df8b;
  font-weight: 500;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  margin-bottom: 0.5rem;
}

.message-sender {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #00c9ff;
}

.message-date {
  font-size: 0.75rem;
  color: #868e96;
}

.message-text {
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-form label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #c0c0c0;
}

.reply-input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: #1a1a1a;
  color: #e4e4e4;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
}

.reply-input:focus {
  outline: none;
  border-color: #00c9ff;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, #00c9ff, #92fe9d);
  color: #111;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
