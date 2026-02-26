<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { resetPassword } = useAuth()

const token = computed(() => {
  const t = route.query.token
  return typeof t === 'string' ? t.trim() : ''
})

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const canSubmit = computed(() => {
  return (
    token.value &&
    newPassword.value.length >= 6 &&
    newPassword.value === confirmPassword.value
  )
})

onMounted(() => {
  if (!token.value) {
    error.value = 'Invalid or missing reset link. Please request a new one.'
  }
})

async function onSubmit() {
  if (!canSubmit.value) return
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }

  loading.value = true
  error.value = null
  try {
    await resetPassword(token.value, newPassword.value)
    success.value = true
    setTimeout(() => router.push('/'), 2000)
  } catch (e: any) {
    error.value = e?.message ?? 'Reset failed. The link may have expired. Request a new one.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="reset-page">
    <div class="reset-card">
      <h1>Set new password</h1>
      <p class="subtitle">Enter your new password below</p>

      <template v-if="!token">
        <p class="error-msg">{{ error }}</p>
        <router-link to="/" class="back-link">← Back to home</router-link>
      </template>

      <template v-else-if="success">
        <p class="success-msg">Your password has been updated. Redirecting you to the home page…</p>
      </template>

      <form v-else @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="new-password">New password</label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            required
            minlength="6"
            placeholder="At least 6 characters"
          />
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            minlength="6"
            placeholder="Same as above"
          />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="submit-btn" :disabled="loading || !canSubmit">
          {{ loading ? 'Updating…' : 'Set new password' }}
        </button>
      </form>

      <p class="footer-link">
        <router-link to="/">← Back to home</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: #111;
}

.reset-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #333;
}

.reset-card h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
}

.subtitle {
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  color: #999;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #ccc;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #fff;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #00c9ff;
}

.error-msg {
  margin: 0 0 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(220, 53, 69, 0.2);
  color: #f88;
  border-radius: 6px;
  font-size: 0.9rem;
}

.success-msg {
  margin: 0 0 1rem;
  padding: 0.75rem;
  background: rgba(25, 135, 84, 0.2);
  color: #9d9;
  border-radius: 6px;
  font-size: 0.95rem;
}

.submit-btn {
  width: 100%;
  padding: 0.85rem;
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  background: linear-gradient(to right, #00c9ff, #92fe9d);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.95;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-link,
.footer-link a {
  color: #00c9ff;
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-link {
  margin-top: 1.5rem;
  text-align: center;
}

.back-link:hover,
.footer-link a:hover {
  color: #92fe9d;
}
</style>
