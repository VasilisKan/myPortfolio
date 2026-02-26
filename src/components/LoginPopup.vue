<template>
  <div class="login-overlay" @click.self="close()">
    <div class="login-popup-wrapper">
      <button class="close-btn" @click="close()">×</button>
      <div class="logo">VK</div>

      <!-- Sign in -->
      <template v-if="mode === 'signin'">
        <h2>Welcome back</h2>
        <p class="subtitle">Sign in to continue</p>
        <form @submit.prevent="onSignIn">
          <div class="input-group">
            <input v-model="email" type="email" placeholder=" " required />
            <label>Email</label>
          </div>
          <div class="input-group">
            <input v-model="password" type="password" placeholder=" " required />
            <label>Password</label>
          </div>
          <button type="submit" class="signin-btn" :disabled="loading">
            <span v-if="loading">Signing in…</span>
            <span v-else>Sign In</span>
          </button>
          <p v-if="error" class="error">{{ error }}</p>
        </form>
        <p class="footer-text">
          <a href="#" @click.prevent="mode = 'forgot'">Forgot password?</a>
        </p>
      </template>

      <!-- Forgot password -->
      <template v-else-if="mode === 'forgot'">
        <h2>Reset password</h2>
        <p class="subtitle">Enter your email to receive a reset link</p>
        <form v-if="!forgotSuccess" @submit.prevent="onForgotPassword">
          <div class="input-group">
            <input v-model="email" type="email" placeholder=" " required />
            <label>Email</label>
          </div>
          <button type="submit" class="signin-btn" :disabled="loading">
            <span v-if="loading">Sending…</span>
            <span v-else>Send reset link</span>
          </button>
          <p v-if="error" class="error">{{ error }}</p>
        </form>
        <template v-else>
          <p class="success-msg">
            If an account exists for this email, you will receive a password reset link shortly.
          </p>
          <p class="success-msg success-hint">Check your inbox and use the link to set a new password.</p>
        </template>
        <p class="footer-text">
          <a href="#" @click.prevent="switchToSignIn">Back to sign in</a>
        </p>
      </template>

      <!-- Reset password (from email link with ?token=...) – usually opened via /reset-password page -->
      <template v-else-if="mode === 'reset'">
        <h2>Set new password</h2>
        <p class="subtitle">Enter the token and your new password</p>
        <form @submit.prevent="onResetPassword">
          <div class="input-group">
            <input v-model="resetToken" type="text" placeholder=" " required />
            <label>Reset token</label>
          </div>
          <div class="input-group">
            <input v-model="newPassword" type="password" placeholder=" " required />
            <label>New password</label>
          </div>
          <button type="submit" class="signin-btn" :disabled="loading">
            <span v-if="loading">Updating…</span>
            <span v-else>Set new password</span>
          </button>
          <p v-if="error" class="error">{{ error }}</p>
        </form>
        <p class="footer-text">
          <a href="#" @click.prevent="switchToSignIn">Back to sign in</a>
        </p>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

type Mode = 'signin' | 'forgot' | 'reset'

const emit = defineEmits<{
  (e: 'close'): void;
}>()

const router = useRouter()
const { login, forgotPassword, resetPassword, user } = useAuth()

const mode = ref<Mode>('signin')
const email = ref('')
const password = ref('')
const newPassword = ref('')
const resetToken = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const forgotSuccess = ref(false)

function close() {
  emit('close')
  error.value = null
  email.value = ''
  password.value = ''
  newPassword.value = ''
  resetToken.value = ''
  forgotSuccess.value = false
  mode.value = 'signin'
}

function switchToSignIn() {
  mode.value = 'signin'
  error.value = null
  forgotSuccess.value = false
  resetToken.value = ''
  newPassword.value = ''
}

async function onSignIn() {
  loading.value = true
  error.value = null
  try {
    await login(email.value, password.value)
    close()
    if (user.value?.isAdmin) {
      router.push('/admin')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed. Please try again.'
  } finally {
    loading.value = false
  }
}

async function onForgotPassword() {
  loading.value = true
  error.value = null
  try {
    await forgotPassword(email.value)
    forgotSuccess.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Request failed. Please try again.'
  } finally {
    loading.value = false
  }
}

async function onResetPassword() {
  if (!resetToken.value.trim() || !newPassword.value) {
    error.value = 'Token and new password are required.'
    return
  }
  loading.value = true
  error.value = null
  try {
    await resetPassword(resetToken.value.trim(), newPassword.value)
    switchToSignIn()
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Password reset failed. Token may be expired.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-overlay {
  position: fixed; top:0; left:0;
  width:100%; height:100%;
  background: rgba(0,0,0,0.85);
  display:flex; align-items:center; justify-content:center;
  z-index:999;
}
.login-popup-wrapper {
  position:relative;
  background:#1a1a1a; padding:2rem;
  border-radius:8px; width:350px; max-width:80%;
  text-align:center;
}
.close-btn {
  position:absolute; top:.5rem; right:.5rem;
  background:transparent; border:none;
  font-size:1.2rem; color:#aaa; cursor:pointer;
}
.logo {
  font-size:1.8rem; font-weight:700; color:#fff;
  margin-bottom:1.25rem;
}
h2 {
  margin-bottom:.5rem; font-size:1.5rem;
  color:#fff; font-weight:500;
}
.subtitle {
  color:#aaa; margin-bottom:1.5rem; font-size:.9rem;
}
.input-group {
  position:relative; margin-bottom:1.25rem; text-align:left;
}
.input-group input {
  width:100%; padding:.85rem;
  background:#2a2a2a; border:1px solid #333; border-radius:4px;
  color:#fff; font-size:.95rem; box-sizing:border-box;
}
.input-group input:focus {
  outline:none;
  background: linear-gradient(#1a1a1a,#1a1a1a) padding-box,
              linear-gradient(to right,#00c9ff,#92fe9d) border-box;
  border:1px solid transparent;
}
.input-group input[readonly] {
  opacity: 0.9;
}
.input-group label {
  position:absolute; top:.85rem; left:.85rem;
  color:#777; font-size:.95rem; transition:.2s;
}
.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top:-0.6rem; left:.7rem; font-size:.75rem;
  background:#1a1a1a; padding:0 .3rem; color:#92fe9d;
}
.signin-btn {
  width:100%; padding:.85rem;
  background:linear-gradient(to right,#00c9ff,#92fe9d);
  color:#111; border:none; border-radius:4px;
  font-weight:600; cursor:pointer; margin:.5rem 0;
  transition:opacity .2s;
}
.signin-btn:disabled {
  opacity:.6; cursor:not-allowed;
}
.error {
  color:#f88; margin-top:.5rem; font-size:.9rem;
}
.success-msg {
  color:#9d9; margin-bottom:0.5rem; font-size:.9rem;
}
.success-hint {
  color:#888; font-size:.85rem; margin-bottom:1rem;
}
.footer-text {
  margin-top:1rem; color:#666; font-size:.85rem;
}
.footer-text a {
  color:#00c9ff; text-decoration:none; transition:.2s;
}
.footer-text a:hover {
  color:#92fe9d;
  background-color: transparent;
}
</style>
