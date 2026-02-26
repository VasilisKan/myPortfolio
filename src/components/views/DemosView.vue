<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUsersStore } from '@/stores/usersStore'
import { useDemosStore, slugFromTitle, type Demo } from '@/stores/demosStore'

const { user } = useAuth()
const usersStore = useUsersStore()
const demosStore = useDemosStore()

const isAdmin = computed(() => !!user.value?.isAdmin)

const showCreate = ref(false)
const createTitle = ref('')
const createSlug = ref('')
const createHtml = ref('')
const createUserIds = ref<string[]>([])
const createSaving = ref(false)
const createError = ref<string | null>(null)
const userSearchQuery = ref('')

watch(createTitle, (t) => {
  if (!createSlug.value || createSlugTouched.value === false) {
    createSlug.value = slugFromTitle(t)
  }
})
const createSlugTouched = ref(false)

function getDemoUrl(slug: string) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/demos/${encodeURIComponent(slug)}`
}

function previewHtml(html: string): string {
  if (!html || !html.trim()) return '<p style="color:#999;padding:1rem;">No content</p>'
  const trimmed = html.trim()
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
    return trimmed
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:8px;font-size:12px;}</style></head><body>${trimmed}</body></html>`
}

async function submitCreate() {
  if (!createTitle.value.trim()) {
    createError.value = 'Title is required'
    return
  }
  createError.value = null
  createSaving.value = true
  try {
    await demosStore.createDemo({
      title: createTitle.value.trim(),
      slug: createSlug.value.trim() || undefined,
      htmlContent: createHtml.value,
      userIds: createUserIds.value,
    })
    showCreate.value = false
    createTitle.value = ''
    createSlug.value = ''
    createHtml.value = ''
    createUserIds.value = []
    userSearchQuery.value = ''
  } catch (err: any) {
    createError.value = err?.message ?? 'Failed to create demo'
  } finally {
    createSaving.value = false
  }
}

const filteredUsersForAssign = computed(() => {
  const q = userSearchQuery.value.trim().toLowerCase()
  if (!q) return usersStore.users
  return usersStore.users.filter(
    (u) =>
      u.email.toLowerCase().includes(q) ||
      (u.username ?? '').toLowerCase().includes(q)
  )
})

function toggleUserForCreate(userId: string) {
  const i = createUserIds.value.indexOf(userId)
  if (i >= 0) createUserIds.value = createUserIds.value.filter((_, j) => j !== i)
  else createUserIds.value = [...createUserIds.value, userId]
}

async function deleteDemo(d: Demo) {
  if (!confirm(`Delete demo "${d.title}"?`)) return
  try {
    await demosStore.deleteDemo(d.id)
  } catch (err: any) {
    demosStore.error = err?.message ?? 'Failed to delete'
  }
}

onMounted(() => {
  if (isAdmin.value) {
    usersStore.loadAllUsers()
    demosStore.loadDemos()
  }
})
</script>

<template>
  <div class="demos-view">
    <template v-if="!isAdmin">
      <p class="view-placeholder">You need admin access to manage demos.</p>
    </template>

    <template v-else>
      <div class="demos-header">
        <button
          type="button"
          class="btn-primary"
          :disabled="demosStore.loading"
          @click="showCreate = true"
        >
          New demo
        </button>
      </div>

      <div v-if="demosStore.loading" class="loading-message">Loading demos…</div>
      <p v-else-if="demosStore.error" class="panel-error">{{ demosStore.error }}</p>
      <div v-else class="demos-grid-wrapper">
        <div v-if="demosStore.demos.length === 0" class="no-demos-message">
          No demos yet. Create one to share an HTML page with specific users.
        </div>
        <div v-else class="demos-grid">
          <article v-for="d in demosStore.demos" :key="d.id" class="demo-card">
            <div class="demo-card-preview">
              <iframe
                :title="`Preview: ${d.title}`"
                :srcdoc="previewHtml(d.htmlContent)"
                sandbox="allow-same-origin"
                class="demo-preview-iframe"
              />
            </div>
            <div class="demo-card-footer">
              <h3 class="demo-card-title">{{ d.title }}</h3>
              <p class="demo-card-meta">{{ d.userIds.length }} user(s) · {{ d.slug }}</p>
              <a :href="getDemoUrl(d.slug)" target="_blank" rel="noopener noreferrer" class="demo-card-url">
                {{ getDemoUrl(d.slug) }}
              </a>
              <div class="demo-card-actions">
                <a :href="getDemoUrl(d.slug)" target="_blank" rel="noopener noreferrer" class="card-btn card-btn-primary">
                  View
                </a>
                <button type="button" class="card-btn card-btn-danger" @click="deleteDemo(d)">
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Create modal -->
      <Teleport to="body">
        <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
          <div class="modal-card">
            <header class="modal-header">
              <h2>Create demo</h2>
              <button type="button" class="modal-close" aria-label="Close" @click="showCreate = false">×</button>
            </header>
            <form class="modal-form" @submit.prevent="submitCreate">
              <div class="modal-body">
              <p v-if="createError" class="panel-error">{{ createError }}</p>
              <div class="form-group">
                <label for="demo-title">Title</label>
                <input id="demo-title" v-model="createTitle" type="text" required placeholder="My demo" class="form-input" />
              </div>
              <div class="form-group">
                <label for="demo-slug">URL slug</label>
                <input
                  id="demo-slug"
                  v-model="createSlug"
                  type="text"
                  placeholder="my-demo"
                  class="form-input"
                  @focus="createSlugTouched = true"
                />
                <span class="form-hint">URL: {{ getDemoUrl(createSlug.trim() || 'slug') }}</span>
              </div>
              <div class="form-group">
                <label for="demo-html">HTML content</label>
                <textarea
                  id="demo-html"
                  v-model="createHtml"
                  rows="8"
                  placeholder="<h1>Hello</h1><p>Content here.</p>"
                  class="form-textarea"
                />
              </div>
              <div class="form-group">
                <label>Assign to users (only they and admins can open the URL)</label>
                <input
                  v-model="userSearchQuery"
                  type="search"
                  placeholder="Search by email or username..."
                  class="form-input user-search-input"
                  aria-label="Search users by email or username"
                />
                <div class="user-checkboxes">
                  <label v-for="u in filteredUsersForAssign" :key="u.id" class="checkbox-label">
                    <input
                      type="checkbox"
                      :checked="createUserIds.includes(u.id)"
                      @change="toggleUserForCreate(u.id)"
                    />
                    {{ u.email }}
                  </label>
                  <p v-if="filteredUsersForAssign.length === 0" class="user-search-empty">
                    No users match your search.
                  </p>
                </div>
              </div>
              </div>
              <footer class="modal-footer">
                <p v-if="createError" class="footer-error">{{ createError }}</p>
                <div class="footer-buttons">
                  <button
                    type="button"
                    class="btn-primary btn-create"
                    :disabled="createSaving"
                    @click="submitCreate"
                  >
                    {{ createSaving ? 'Creating…' : 'Create demo' }}
                  </button>
                  <button type="button" class="btn-secondary" @click="showCreate = false">Cancel</button>
                </div>
              </footer>
            </form>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<style scoped>
.demos-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 100%;
}

.view-placeholder {
  margin: 0;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.demos-header {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-accent);
  background: var(--dashboard-accent);
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-border);
  background: var(--dashboard-card);
  color: var(--dashboard-text);
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--dashboard-hover);
}

.loading-message {
  padding: 1rem;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.panel-error {
  margin: 0;
  padding: 1rem;
  color: #c00;
  font-size: 0.9375rem;
}

.demos-grid-wrapper {
  width: 100%;
}

.demos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.demo-card {
  aspect-ratio: 1;
  background: var(--dashboard-card, #fff);
  border: 1px solid var(--dashboard-border, #e9ecef);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.demo-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--dashboard-accent, #1971c2);
}

.demo-card-preview {
  flex: 1;
  min-height: 0;
  background: var(--dashboard-hover, #f1f3f5);
  position: relative;
  overflow: hidden;
}

.demo-preview-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  min-width: 200%;
  min-height: 200%;
  border: none;
  pointer-events: none;
  transform: scale(0.5);
  transform-origin: top left;
}

.demo-card-footer {
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.demo-card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dashboard-text, #212529);
  line-height: 1.3;
}

.demo-card-meta {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--dashboard-text-muted, #666);
}

.demo-card-url {
  font-size: 0.75rem;
  color: var(--dashboard-accent, #1971c2);
  word-break: break-all;
  text-decoration: none;
  background: transparent;
  transition: color 0.15s;
}

.demo-card-url:hover {
  color: #0d5aa7;
  background: transparent;
}

.demo-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--dashboard-border, #e9ecef);
}

.card-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.card-btn-primary {
  background: var(--dashboard-accent, #1971c2);
  color: #fff;
  border-color: var(--dashboard-accent, #1971c2);
}

.card-btn-primary:hover {
  opacity: 0.9;
}

.card-btn-danger {
  background: transparent;
  color: var(--dashboard-text-muted, #666);
  border-color: var(--dashboard-border, #dee2e6);
}

.card-btn-danger:hover {
  color: #c00;
  border-color: #c00;
}

.no-demos-message {
  padding: 2rem;
  text-align: center;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: var(--dashboard-card, #fff);
  color: var(--dashboard-text, #212529);
  border: 1px solid var(--dashboard-border, #e9ecef);
  border-radius: 8px;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--dashboard-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--dashboard-text);
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 1.5rem;
  color: var(--dashboard-text-muted);
  cursor: pointer;
  line-height: 1;
}

.modal-close:hover {
  color: var(--dashboard-text);
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dashboard-text);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-input-border);
  background: var(--dashboard-input-bg);
  color: var(--dashboard-text);
  font-size: 0.875rem;
}

.form-textarea {
  font-family: ui-monospace, monospace;
  resize: vertical;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--dashboard-text-muted);
}

.user-search-input {
  margin-bottom: 0.5rem;
}

.user-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-height: 160px;
  overflow-y: auto;
  padding: 0.5rem;
  background: var(--dashboard-hover, #f1f3f5);
  border-radius: 6px;
}

.user-search-empty {
  margin: 0;
  padding: 0.5rem;
  font-size: 0.8125rem;
  color: var(--dashboard-text-muted, #666);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox-label input {
  margin: 0;
}

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--dashboard-border, #e9ecef);
  background: var(--dashboard-card, #fff);
  flex-shrink: 0;
  border-radius: 0 0 8px 8px;
}

.footer-error {
  margin: 0;
  font-size: 0.875rem;
  color: #c00;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.modal-footer .btn-create {
  background: var(--dashboard-accent, #1971c2);
  border-color: var(--dashboard-accent, #1971c2);
  color: #fff;
}
</style>
