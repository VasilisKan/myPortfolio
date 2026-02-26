<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSun, faMoon, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { RouterLink } from 'vue-router'
import UserDashboardSidebar from '../components/UserDashboardSidebar.vue'
import TicketsView from '../components/views/TicketsView.vue'
import { useDashboardTheme } from '@/composables/useDashboardTheme'
import { useAuth } from '@/composables/useAuth'

library.add(faSun, faMoon, faUserCircle)

const { theme, toggleTheme } = useDashboardTheme()
const { user, fetchMe, updateMe } = useAuth()

const showProfilePopup = ref(false)
const profileEmail = ref('')
const profileName = ref('')
const profileSaving = ref(false)
const profileError = ref<string | null>(null)
const profileSuccess = ref(false)

const displayName = computed(() => {
  const u = user.value
  if (!u) return 'Account'
  return u.username?.trim() || u.name?.trim() || u.email || 'Account'
})

const hasProfileChanges = computed(() => {
  const u = user.value
  const currentName = u?.username ?? u?.name ?? ''
  return (u && profileEmail.value !== (u.email ?? '')) || (profileName.value !== currentName)
})

onMounted(() => {
  fetchMe()
})

function openProfilePopup() {
  showProfilePopup.value = true
  profileError.value = null
  profileSuccess.value = false
  if (user.value) {
    profileEmail.value = user.value.email ?? ''
    profileName.value = user.value.username ?? user.value.name ?? ''
  }
}

function closeProfilePopup() {
  showProfilePopup.value = false
}

async function saveProfile() {
  if (!user.value) return
  profileError.value = null
  profileSuccess.value = false
  profileSaving.value = true
  try {
    const nameVal = profileName.value.trim() || undefined
    await updateMe({ email: profileEmail.value.trim() || undefined, name: nameVal, username: nameVal })
    profileSuccess.value = true
  } catch (e: any) {
    profileError.value = e?.message ?? 'Failed to update profile'
  } finally {
    profileSaving.value = false
  }
}
</script>

<template>
  <div class="user-dashboard" :data-theme="theme">
    <nav class="dashboard-nav">
      <UserDashboardSidebar />
    </nav>

    <main class="dashboard-main">
      <header class="dashboard-header">
        <div class="dashboard-header-actions">
          <RouterLink to="/ticket/create" class="btn-new-ticket">New ticket</RouterLink>
          <button
            type="button"
            class="theme-toggle"
            :aria-label="theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
            @click="toggleTheme"
          >
            <font-awesome-icon :icon="theme === 'light' ? ['fas', 'moon'] : ['fas', 'sun']" />
          </button>
          <RouterLink to="/" class="dashboard-back">← Back to site</RouterLink>
          <button
            type="button"
            class="profile-trigger"
            aria-label="Edit profile"
            @click="openProfilePopup"
          >
            <font-awesome-icon :icon="['fas', 'user-circle']" class="profile-trigger-icon" />
            <span class="profile-trigger-name">{{ displayName }}</span>
          </button>
        </div>
      </header>

      <!-- Edit profile popup -->
      <Teleport to="body">
        <div v-if="showProfilePopup" class="profile-popup-theme" :data-theme="theme">
        <div class="profile-popup-overlay" @click.self="closeProfilePopup">
          <div class="profile-popup" role="dialog" aria-labelledby="profile-popup-title" aria-modal="true">
            <header class="profile-popup-header">
              <h2 id="profile-popup-title">Edit profile</h2>
              <button type="button" class="profile-popup-close" aria-label="Close" @click="closeProfilePopup">×</button>
            </header>
            <form class="profile-popup-form" @submit.prevent="saveProfile">
              <div class="profile-popup-body">
                <p v-if="profileError" class="profile-popup-error">{{ profileError }}</p>
                <p v-if="profileSuccess" class="profile-popup-success">Profile updated.</p>
                <div class="form-group">
                  <label for="popup-email">Email</label>
                  <input
                    id="popup-email"
                    v-model="profileEmail"
                    type="email"
                    autocomplete="email"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label for="popup-name">Name / Username</label>
                  <input
                    id="popup-name"
                    v-model="profileName"
                    type="text"
                    autocomplete="name"
                    class="form-input"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <footer class="profile-popup-footer">
                <button type="button" class="btn-cancel" @click="closeProfilePopup">Cancel</button>
                <button type="submit" class="btn-save" :disabled="profileSaving || !hasProfileChanges">
                  {{ profileSaving ? 'Saving…' : 'Save' }}
                </button>
              </footer>
            </form>
          </div>
        </div>
        </div>
      </Teleport>
      <section class="dashboard-content">
        <TicketsView :user-mode="true" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.user-dashboard {
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

.user-dashboard[data-theme='dark'] {
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
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  background: var(--dashboard-nav);
  border-bottom: 1px solid var(--dashboard-border);
}

.dashboard-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-new-ticket {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: var(--dashboard-accent);
  border: none;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.btn-new-ticket:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
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

.profile-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--dashboard-border);
  border-radius: 8px;
  background: var(--dashboard-card);
  color: var(--dashboard-text);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.profile-trigger:hover {
  background: var(--dashboard-hover);
  border-color: var(--dashboard-accent);
}

.profile-trigger-icon {
  font-size: 1.25rem;
  color: var(--dashboard-accent);
}

.profile-trigger-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-popup-theme {
  --popup-bg: #f8f9fa;
  --popup-card: #fff;
  --popup-border: #e9ecef;
  --popup-text: #212529;
  --popup-text-muted: #495057;
  --popup-accent: #1971c2;
  --popup-hover: #f1f3f5;
  --popup-input-bg: #fff;
  --popup-input-border: #dee2e6;
}

.profile-popup-theme[data-theme='dark'] {
  --popup-bg: #0f0f0f;
  --popup-card: #1a1a1a;
  --popup-border: #2a2a2a;
  --popup-text: #e4e4e4;
  --popup-text-muted: #a0a0a0;
  --popup-accent: #58a6ff;
  --popup-hover: #252525;
  --popup-input-bg: #252525;
  --popup-input-border: #3a3a3a;
}

.profile-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.profile-popup {
  background: var(--popup-card);
  color: var(--popup-text);
  border-radius: 12px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
  max-width: 420px;
  width: 100%;
  overflow: hidden;
}

.profile-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--popup-border);
}

.profile-popup-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--popup-text);
}

.profile-popup-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--popup-text-muted);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.profile-popup-close:hover {
  background: var(--popup-hover);
  color: var(--popup-text);
}

.profile-popup-body {
  padding: 1.5rem;
}

.profile-popup-form .form-group {
  margin-bottom: 1rem;
}

.profile-popup-form .form-group:last-child {
  margin-bottom: 0;
}

.profile-popup-form label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--popup-text);
}

.profile-popup-form .form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  border: 1px solid var(--popup-input-border);
  border-radius: 8px;
  background: var(--popup-input-bg);
  color: var(--popup-text);
}

.profile-popup-form .form-input:focus {
  outline: none;
  border-color: var(--popup-accent);
}

.profile-popup-error {
  margin: 0 0 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
  border-radius: 6px;
  font-size: 0.875rem;
}

.profile-popup-success {
  margin: 0 0 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(25, 135, 84, 0.15);
  color: #198754;
  border-radius: 6px;
  font-size: 0.875rem;
}

.profile-popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--popup-border);
}

.profile-popup-footer .btn-cancel {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--popup-text-muted);
  background: transparent;
  border: 1px solid var(--popup-border);
  border-radius: 8px;
  cursor: pointer;
}

.profile-popup-footer .btn-cancel:hover {
  background: var(--popup-hover);
  color: var(--popup-text);
}

.profile-popup-footer .btn-save {
  padding: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fff;
  background: var(--popup-accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.profile-popup-footer .btn-save:hover:not(:disabled) {
  filter: brightness(1.1);
}

.profile-popup-footer .btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dashboard-content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}
</style>
