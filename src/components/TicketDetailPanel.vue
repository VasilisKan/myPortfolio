<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark, faPen, faTrash, faCheckCircle, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useDashboardTheme } from '@/composables/useDashboardTheme'
import { useTicketStore } from '@/stores/ticketsStore'
import type { Ticket, TicketDetail } from '@/stores/ticketsStore'

library.add(faXmark, faPen, faTrash, faCheckCircle, faRotateLeft)

const { theme } = useDashboardTheme()
const ticketStore = useTicketStore()

const props = defineProps<{
  ticket: TicketDetail | null
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated', ticket: TicketDetail): void
}>()

const replyMessage = ref('')
const replySending = ref(false)
const replyError = ref<string | null>(null)
const showEdit = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editCategory = ref('')
const editSaving = ref(false)
const deleteConfirm = ref(false)
const deleteSending = ref(false)
const closeSending = ref(false)
const reopenSending = ref(false)

watch(
  () => props.ticket,
  async (ticket) => {
    if (ticket) {
      document.body.style.overflow = 'hidden'
      replyMessage.value = ''
      replyError.value = null
      showEdit.value = false
      deleteConfirm.value = false
      editTitle.value = ticket.title
      editDescription.value = ticket.description ?? ''
      editCategory.value = ticket.category ?? ''
      ticketStore.clearReplies()
      try {
        await ticketStore.getReplies(String(ticket.id))
      } catch {
      }
    } else {
      document.body.style.overflow = ''
      ticketStore.clearReplies()
    }
  },
  { immediate: true }
)

const chatHistory = computed(() => {
  if (!props.ticket) return []
  const list: Array<{ id?: string; sender?: string; text: string; createdAt?: string; isAdmin?: boolean }> = []
  const desc = props.ticket.description
  if (desc != null && String(desc).trim() !== '') {
    list.push({
      text: String(desc),
      sender: props.ticket.userEmail,
      createdAt: props.ticket.createdAt,
      isAdmin: false,
    })
  }
  ticketStore.replies.forEach((r) => {
    list.push({
      id: r.id,
      text: r.message,
      sender: r.userEmail,
      createdAt: r.createdAt,
      isAdmin: false,
    })
  })
  return list.sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return da - db
  })
})

function formatDate(value: string | undefined) {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

async function submitReply() {
  if (!props.ticket || !replyMessage.value.trim()) return
  replyError.value = null
  replySending.value = true
  try {
    await ticketStore.replyToTicket(String(props.ticket.id), replyMessage.value.trim())
    replyMessage.value = ''
  } catch (err: any) {
    replyError.value = err.response?.data ?? err.message ?? 'Failed to send reply'
  } finally {
    replySending.value = false
  }
}

function startEdit() {
  if (!props.ticket) return
  editTitle.value = props.ticket.title
  editDescription.value = props.ticket.description ?? ''
  editCategory.value = props.ticket.category ?? ''
  showEdit.value = true
}

function cancelEdit() {
  showEdit.value = false
}

async function saveEdit() {
  if (!props.ticket) return
  editSaving.value = true
  try {
    await ticketStore.updateTicket(String(props.ticket.id), {
      title: editTitle.value.trim(),
      description: editDescription.value.trim(),
      category: editCategory.value.trim(),
    })
    emit('updated', {
      ...props.ticket,
      title: editTitle.value.trim(),
      description: editDescription.value.trim(),
      category: editCategory.value.trim(),
    })
    showEdit.value = false
  } catch (err: any) {
    replyError.value = err.response?.data ?? err.message ?? 'Failed to update ticket'
  } finally {
    editSaving.value = false
  }
}

async function confirmDelete() {
  if (!props.ticket) return
  deleteSending.value = true
  try {
    await ticketStore.deleteTicket(String(props.ticket.id))
    emit('close')
  } catch (err: any) {
    replyError.value = err.response?.data ?? err.message ?? 'Failed to delete ticket'
  } finally {
    deleteSending.value = false
    deleteConfirm.value = false
  }
}

async function closeTicket() {
  if (!props.ticket || props.ticket.isResolved) return
  closeSending.value = true
  replyError.value = null
  try {
    await ticketStore.resolveTicket(String(props.ticket.id))
    emit('updated', { ...props.ticket, isResolved: true })
  } catch (err: any) {
    replyError.value = err.response?.data ?? err.message ?? 'Failed to resolve ticket'
  } finally {
    closeSending.value = false
  }
}

async function reopenTicket() {
  if (!props.ticket || !props.ticket.isResolved) return
  reopenSending.value = true
  replyError.value = null
  try {
    await ticketStore.reopenTicket(String(props.ticket.id))
    emit('updated', { ...props.ticket, isResolved: false })
  } catch (err: any) {
    replyError.value = err.response?.data ?? err.message ?? 'Failed to reopen ticket'
  } finally {
    reopenSending.value = false
  }
}

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="ticket" class="panel-overlay" :data-theme="theme" @click.self="emit('close')">
        <aside class="ticket-panel">
          <header class="panel-header">
            <h2 class="panel-title">Ticket #{{ ticket.id }}</h2>
            <button type="button" class="panel-close" aria-label="Close" @click="emit('close')">
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
          </header>

          <div class="panel-body">
            <p v-if="ticketStore.repliesError" class="panel-error">
              {{ ticketStore.repliesError }}
            </p>

            <section class="ticket-info">
              <div v-if="isAdmin && !showEdit" class="ticket-info-actions">
                <button type="button" class="btn-icon" aria-label="Edit ticket" @click="startEdit">
                  <font-awesome-icon :icon="['fas', 'pen']" /> Edit
                </button>
                <button
                  v-if="!ticket.isResolved"
                  type="button"
                  class="btn-icon btn-close-ticket"
                  aria-label="Close ticket"
                  :disabled="closeSending"
                  @click="closeTicket"
                >
                  <font-awesome-icon :icon="['fas', 'check-circle']" /> {{ closeSending ? 'Closing…' : 'Close ticket' }}
                </button>
                <button
                  v-if="ticket.isResolved"
                  type="button"
                  class="btn-icon btn-reopen-ticket"
                  aria-label="Reopen ticket"
                  :disabled="reopenSending"
                  @click="reopenTicket"
                >
                  <font-awesome-icon :icon="['fas', 'rotate-left']" /> {{ reopenSending ? 'Reopening…' : 'Reopen ticket' }}
                </button>
                <button
                  v-if="!deleteConfirm"
                  type="button"
                  class="btn-icon btn-danger"
                  aria-label="Delete ticket"
                  @click="deleteConfirm = true"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" /> Delete
                </button>
                <template v-else>
                  <span class="confirm-label">Delete?</span>
                  <button type="button" class="btn-icon btn-danger" :disabled="deleteSending" @click="confirmDelete">
                    Yes
                  </button>
                  <button type="button" class="btn-icon" @click="deleteConfirm = false">No</button>
                </template>
              </div>
              <template v-if="!showEdit">
                <dl class="info-grid">
                  <dt>Title</dt>
                  <dd>{{ ticket.title }}</dd>
                  <dt>From</dt>
                  <dd>{{ ticket.userEmail }}</dd>
                  <dt>Category</dt>
                  <dd>{{ ticket.category ?? '—' }}</dd>
                  <dt>Status</dt>
                  <dd>{{ ticket.isResolved ? 'Resolved' : 'Open' }}</dd>
                  <dt>Created</dt>
                  <dd>{{ formatDate(ticket.createdAt) }}</dd>
                </dl>
              </template>
              <form v-else class="edit-form" @submit.prevent="saveEdit">
                <div class="form-group">
                  <label>Title</label>
                  <input v-model="editTitle" type="text" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea v-model="editDescription" rows="3" class="form-input"></textarea>
                </div>
                <div class="form-group">
                  <label>Category</label>
                  <input v-model="editCategory" type="text" class="form-input" />
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary" :disabled="editSaving">
                    {{ editSaving ? 'Saving…' : 'Save' }}
                  </button>
                  <button type="button" class="btn-secondary" @click="cancelEdit">Cancel</button>
                </div>
              </form>
            </section>

            <section class="chat-section">
              <h3 class="chat-heading">Chat history</h3>
              <div v-if="ticketStore.repliesLoading && chatHistory.length === 0" class="chat-loading">
                Loading…
              </div>
              <template v-else>
                <div class="chat-list">
                  <div
                    v-for="(msg, idx) in chatHistory"
                    :key="msg.id ?? idx"
                    :class="['chat-message', { admin: msg.isAdmin, 'from-owner': msg.sender === ticket?.userEmail }]"
                  >
                    <div class="message-meta">
                      <span class="message-sender">{{ msg.sender ?? 'User' }}</span>
                      <span v-if="msg.createdAt" class="message-date">{{ formatDate(msg.createdAt) }}</span>
                    </div>
                    <div class="message-text">{{ msg.text }}</div>
                  </div>
                  <p v-if="chatHistory.length === 0" class="chat-empty">No messages yet.</p>
                </div>

                <form class="reply-form" @submit.prevent="submitReply">
                  <textarea
                    v-model="replyMessage"
                    placeholder="Type your reply…"
                    rows="2"
                    class="reply-input"
                    :disabled="replySending"
                  />
                  <p v-if="replyError" class="reply-error">{{ replyError }}</p>
                  <button type="submit" class="btn-primary" :disabled="replySending || !replyMessage.trim()">
                    {{ replySending ? 'Sending…' : 'Send reply' }}
                  </button>
                </form>
              </template>
            </section>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.panel-overlay {
  --panel-bg: #f8f9fa;
  --panel-card: #fff;
  --panel-border: #e9ecef;
  --panel-text: #212529;
  --panel-text-muted: #495057;
  --panel-accent: #1971c2;
  --panel-accent-bg: #e7f5ff;
  --panel-hover: #f1f3f5;
}

.panel-overlay[data-theme='dark'] {
  --panel-bg: #0f0f0f;
  --panel-card: #1a1a1a;
  --panel-border: #2a2a2a;
  --panel-text: #e4e4e4;
  --panel-text-muted: #a0a0a0;
  --panel-accent: #58a6ff;
  --panel-accent-bg: #1a2d4a;
  --panel-hover: #252525;
}

.panel-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}

.ticket-panel {
  width: 100%;
  max-width: 520px;
  min-width: 280px;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--panel-card);
  border-left: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--panel-border);
  background: var(--panel-card);
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--panel-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-card);
  color: var(--panel-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.panel-close:hover {
  background: var(--panel-hover);
  color: var(--panel-text);
  border-color: var(--panel-accent);
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.25rem;
}

.panel-error {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  background: #fee;
  color: #c00;
  border-radius: 8px;
  font-size: 0.875rem;
}

.ticket-info {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--panel-hover);
  border-radius: 10px;
  border: 1px solid var(--panel-border);
}

.ticket-info-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  background: var(--panel-card);
  color: var(--panel-text-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-icon:hover:not(:disabled) {
  background: var(--panel-hover);
  color: var(--panel-accent);
}

.btn-icon.btn-danger:hover:not(:disabled) {
  color: #c00;
  border-color: #c00;
}

.btn-icon.btn-close-ticket:hover:not(:disabled) {
  color: var(--panel-accent);
  border-color: var(--panel-accent);
}

.btn-icon.btn-reopen-ticket:hover:not(:disabled) {
  color: var(--panel-accent);
  border-color: var(--panel-accent);
}

.btn-icon:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-label {
  font-size: 0.8125rem;
  color: var(--panel-text-muted);
}

.info-grid {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0.5rem 1rem;
  margin: 0;
  font-size: 0.875rem;
}

.info-grid dt {
  color: var(--panel-text-muted);
  font-weight: 500;
}

.info-grid dd {
  margin: 0;
  color: var(--panel-text);
  word-break: break-word;
}

.edit-form .form-group {
  margin-bottom: 0.75rem;
}

.edit-form label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--panel-text-muted);
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  background: var(--panel-card);
  color: var(--panel-text);
  font-size: 0.875rem;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--panel-accent);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary {
  border: none;
  background: var(--panel-accent);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  border: 1px solid var(--panel-border);
  background: var(--panel-card);
  color: var(--panel-text-muted);
}

.btn-secondary:hover {
  background: var(--panel-hover);
  color: var(--panel-text);
}

.chat-section {
  border-top: 1px solid var(--panel-border);
  padding-top: 1.25rem;
}

.chat-heading {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--panel-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.chat-loading {
  padding: 1rem;
  text-align: center;
  color: var(--panel-text-muted);
  font-size: 0.875rem;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.chat-message {
  padding: 0.875rem 1rem;
  background: var(--panel-hover);
  border-radius: 10px;
  border-left: 4px solid var(--panel-accent);
}

.chat-message.admin {
  border-left-color: var(--panel-text-muted);
}

.chat-message.from-owner {
  border-left: none;
  border-right: 4px solid var(--panel-accent);
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
  color: var(--panel-accent);
}

.chat-message.admin .message-sender {
  color: var(--panel-text-muted);
}

.message-date {
  font-size: 0.75rem;
  color: var(--panel-text-muted);
}

.message-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--panel-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-empty {
  margin: 0;
  padding: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--panel-text-muted);
  background: var(--panel-hover);
  border-radius: 10px;
}

.reply-form {
  margin-top: 1rem;
}

.reply-input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-card);
  color: var(--panel-text);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;
}

.reply-input:focus {
  outline: none;
  border-color: var(--panel-accent);
}

.reply-error {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  color: #c00;
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s ease;
}

.panel-enter-active .ticket-panel,
.panel-leave-active .ticket-panel {
  transition: transform 0.25s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-from .ticket-panel,
.panel-leave-to .ticket-panel {
  transform: translateX(100%);
}
</style>
