<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import UserDashboardSidebar from '../components/UserDashboardSidebar.vue'
import { useTicketStore } from '../stores/ticketsStore'
import { useDashboardTheme } from '@/composables/useDashboardTheme'

library.add(faSun, faMoon)

const router = useRouter()
const ticketStore = useTicketStore()
const { theme, toggleTheme } = useDashboardTheme()

const title = ref('')
const description = ref('')
const category = ref('Bug')
const loading = ref(false)
const error = ref<string | null>(null)

const categories = ['Bug', 'Support', 'Feature', 'Other']

async function onSubmit(e: Event) {
  e.preventDefault()
  if (!title.value.trim() || !description.value.trim()) {
    error.value = 'Title and description are required.'
    return
  }
  error.value = null
  loading.value = true
  try {
    const ticketId = await ticketStore.submitTicket({
      title: title.value.trim(),
      description: description.value.trim(),
      category: category.value,
    })
    router.push({
      path: `/ticket/${ticketId}`,
      state: {
        initialTitle: title.value.trim(),
        initialDescription: description.value.trim(),
        initialCategory: category.value,
      },
    })
  } catch (err: any) {
    error.value = err.response?.data ?? err.message ?? 'Failed to create ticket'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="ticket-create-page" :data-theme="theme">
    <nav class="dashboard-nav">
      <UserDashboardSidebar />
    </nav>

    <main class="dashboard-main">
      <header class="dashboard-header">
        <h1 class="dashboard-title">New ticket</h1>
        <div class="dashboard-header-actions">
          <button
            type="button"
            class="theme-toggle"
            :aria-label="theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
            @click="toggleTheme"
          >
            <font-awesome-icon :icon="theme === 'light' ? ['fas', 'moon'] : ['fas', 'sun']" />
          </button>
          <RouterLink to="/dashboard" class="dashboard-back">← My tickets</RouterLink>
        </div>
      </header>

      <section class="dashboard-content">
        <div class="ticket-create-content">
          <p class="page-subtitle">Describe your issue and we’ll get back to you.</p>

          <form class="ticket-form" @submit="onSubmit">
            <div class="form-group">
              <label for="title">Title</label>
              <input
                id="title"
                v-model="title"
                type="text"
                required
                placeholder="Short summary"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="category">Category</label>
              <select id="category" v-model="category" class="form-input">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="description"
                required
                rows="5"
                placeholder="Describe your issue in detail…"
                class="form-input"
              />
            </div>
            <p v-if="error" class="form-error">{{ error }}</p>
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Submitting…' : 'Submit ticket' }}
              </button>
              <RouterLink to="/dashboard" class="btn-link">Cancel</RouterLink>
            </div>
          </form>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ticket-create-page {
  --dashboard-bg: #0d0d0d;
  --dashboard-nav: #161616;
  --dashboard-card: #1a1a1a;
  --dashboard-border: #2a2a2a;
  --dashboard-text: #e4e4e4;
  --dashboard-text-muted: #a0a0a0;
  --dashboard-accent: #00c9ff;
  --dashboard-accent-bg: rgba(0, 201, 255, 0.15);
  --dashboard-hover: #252525;
  --dashboard-input-bg: #252525;
  --dashboard-input-border: #3a3a3a;
}

.ticket-create-page[data-theme='light'] {
  --dashboard-bg: #f8f9fa;
  --dashboard-nav: #fff;
  --dashboard-card: #fff;
  --dashboard-border: #e9ecef;
  --dashboard-text: #212529;
  --dashboard-text-muted: #495057;
  --dashboard-accent: #1971c2;
  --dashboard-accent-bg: #e7f5ff;
  --dashboard-hover: #f1f3f5;
  --dashboard-input-bg: #fff;
  --dashboard-input-border: #dee2e6;
}

.ticket-create-page {
  display: flex;
  min-height: 100vh;
  background: var(--dashboard-bg);
  color: var(--dashboard-text);
}

.dashboard-nav {
  width: 220px;
  flex-shrink: 0;
  background: var(--dashboard-nav);
  border-right: 1px solid var(--dashboard-border);
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--dashboard-nav);
  border-bottom: 1px solid var(--dashboard-border);
}

.dashboard-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dashboard-text);
}

.dashboard-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--dashboard-border);
  border-radius: 8px;
  background: var(--dashboard-card);
  color: var(--dashboard-text-muted);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.theme-toggle:hover {
  color: var(--dashboard-accent);
  background: var(--dashboard-hover);
  border-color: var(--dashboard-accent);
}

.dashboard-back {
  font-size: 0.875rem;
  color: var(--dashboard-text-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.dashboard-back:hover {
  color: var(--dashboard-accent);
}

.dashboard-content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}

.ticket-create-content {
  max-width: 560px;
}

.page-subtitle {
  margin: 0 0 1.5rem;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dashboard-text-muted);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--dashboard-input-border);
  border-radius: 8px;
  background: var(--dashboard-input-bg);
  color: var(--dashboard-text);
  font-size: 0.9375rem;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--dashboard-accent);
}

.form-input::placeholder {
  color: var(--dashboard-text-muted);
  opacity: 0.7;
}

textarea.form-input {
  resize: vertical;
  min-height: 120px;
}

.form-error {
  margin: 0;
  padding: 0.75rem 1rem;
  background: rgba(200, 0, 0, 0.15);
  color: #f88;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
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

.btn-link {
  color: var(--dashboard-accent);
  font-size: 0.9375rem;
  text-decoration: none;
  transition: color 0.2s;
}

.btn-link:hover {
  color: #92fe9d;
}
</style>