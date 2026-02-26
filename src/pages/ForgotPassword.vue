<script lang="ts" setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { forgotPassword } = useAuth()

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

async function onSubmit() {
  const trimmed = email.value.trim()
  if (!trimmed) {
    error.value = 'Please enter your email address.'
    return
  }

  loading.value = true
  error.value = null
  success.value = false

  try {
    await forgotPassword(trimmed)
    success.value = true
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Request failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="forgot-page">
    <div class="forgot-card">
      <h1>Forgot password</h1>
      <p class="subtitle">Enter your email and we'll send you a link to reset your password.</p>

      <template v-if="success">
        <p class="success-msg">
          If an account exists for this email, you will receive a password reset link shortly.
        </p>
        <p class="success-hint">Check your inbox and use the link to set a new password.</p>
      </template>

      <form v-else @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="submit-btn" :disabled="loading || !email.trim()">
          {{ loading ? 'Sending…' : 'Send reset link' }}
        </button>
      </form>

      <p class="footer-link">
        <router-link to="/">← Back to home</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: #111;
}

.forgot-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #333;
}

.forgot-card h1 {
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
  margin: 0 0 0.5rem;
  padding: 0.75rem;
  background: rgba(25, 135, 84, 0.2);
  color: #9d9;
  border-radius: 6px;
  font-size: 0.95rem;
}

.success-hint {
  margin: 0 0 1rem;
  color: #888;
  font-size: 0.9rem;
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

.footer-link {
  margin-top: 1.5rem;
  text-align: center;
}

.footer-link a {
  color: #00c9ff;
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-link a:hover {
  color: #92fe9d;
}
</style>
