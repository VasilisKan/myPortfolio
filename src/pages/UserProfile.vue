<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSun, faMoon, faUser } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { RouterLink } from 'vue-router'
import UserDashboardSidebar from '../components/UserDashboardSidebar.vue'
import { useDashboardTheme } from '@/composables/useDashboardTheme'
import { useAuth } from '@/composables/useAuth'

library.add(faSun, faMoon, faUser)

const { theme, toggleTheme } = useDashboardTheme()
const { user, fetchMe, updateMe } = useAuth()

const email = ref('')
const name = ref('')
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const hasChanges = computed(() => {
  const u = user.value
  return (u && (email.value !== (u.email ?? ''))) || (name.value !== (u?.name ?? ''))
})

onMounted(async () => {
  await fetchMe()
  if (user.value) {
    email.value = user.value.email ?? ''
    name.value = user.value.name ?? ''
  }
})

async function save() {
  if (!user.value) return
  error.value = null
  success.value = false
  saving.value = true
  try {
    await updateMe({ email: email.value.trim() || undefined, name: name.value.trim() || undefined })
    success.value = true
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to update profile'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="user-dashboard profile-page" :data-theme="theme">
    <nav class="dashboard-nav">
      <UserDashboardSidebar />
    </nav>

    <main class="dashboard-main">
      <header class="dashboard-header">
        <h1 class="dashboard-title">
          <font-awesome-icon :icon="['fas', 'user']" class="title-icon" />
          Account
        </h1>
        <div class="dashboard-header-actions">
          <button
            type="button"
            class="theme-toggle"
            :aria-label="theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
            @click="toggleTheme"
          >
            <font-awesome-icon :icon="theme === 'light' ? ['fas', 'moon'] : ['fas', 'sun']" />
          </button>
          <RouterLink to="/" class="dashboard-back">← Back to site</RouterLink>
        </div>
      </header>

      <section class="dashboard-content">
        <div v-if="!user" class="profile-loading">Loading…</div>
        <div v-else class="profile-card">
          <h2 class="profile-section-title">Your data</h2>
          <dl class="profile-read-only">
            <dt>User ID</dt>
            <dd>{{ user.userId }}</dd>
            <dt>Role</dt>
            <dd>{{ user.isAdmin ? 'Admin' : 'User' }}</dd>
          </dl>

          <h2 class="profile-section-title">Edit profile</h2>
          <form class="profile-form" @submit.prevent="save">
            <p v-if="error" class="profile-error">{{ error }}</p>
            <p v-if="success" class="profile-success">Profile updated.</p>
            <div class="form-group">
              <label for="profile-email">Email</label>
              <input
                id="profile-email"
                v-model="email"
                type="email"
                autocomplete="email"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="profile-name">Name</label>
              <input
                id="profile-name"
                v-model="name"
                type="text"
                autocomplete="name"
                class="form-input"
                placeholder="Optional"
              />
            </div>
            <button
              type="submit"
              class="btn-save"
              :disabled="saving || !hasChanges"
            >
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </form>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.profile-page {
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

.profile-page[data-theme='dark'] {
  --dashboard-bg: #0f0f0f;
  --dashboard-nav: #161616;
  --dashboard-card: #1a1a1a;
  --dashboard-border: #2a2a2a;
  --dashboard-text: #e4e4e4;
  --dashboard-text-muted: #a0a0a0;
  --dashboard-accent: #58a6ff;
  --dashboard-accent-bg: #1a2d4a;
  --dashboard-hover: #252525;
  --dashboard-input-bg: #252525;
  --dashboard-input-border: #3a3a3a;
}

.user-dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--dashboard-bg);
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  opacity: 0.9;
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
}

.dashboard-back:hover {
  color: var(--dashboard-accent);
}

.dashboard-content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}

.profile-loading {
  color: var(--dashboard-text-muted);
}

.profile-card {
  max-width: 420px;
  padding: 1.5rem;
  background: var(--dashboard-card);
  border: 1px solid var(--dashboard-border);
  border-radius: 12px;
}

.profile-section-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dashboard-text);
}

.profile-read-only {
  margin: 0 0 1.5rem;
  padding: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1.5rem;
}

.profile-read-only dt {
  color: var(--dashboard-text-muted);
  font-size: 0.875rem;
}

.profile-read-only dd {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--dashboard-text);
}

.profile-form {
  margin-top: 0.5rem;
}

.profile-error {
  margin: 0 0 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
  border-radius: 6px;
  font-size: 0.875rem;
}

.profile-success {
  margin: 0 0 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(25, 135, 84, 0.15);
  color: #198754;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dashboard-text);
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  border: 1px solid var(--dashboard-input-border);
  border-radius: 8px;
  background: var(--dashboard-input-bg);
  color: var(--dashboard-text);
}

.form-input:focus {
  outline: none;
  border-color: var(--dashboard-accent);
}

.btn-save {
  margin-top: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fff;
  background: var(--dashboard-accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
