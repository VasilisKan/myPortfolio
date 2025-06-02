<template>
  <div class="login-overlay" @click.self="close()">
    <div class="login-popup-wrapper">
      <button class="close-btn" @click="close()">×</button>
      <div class="logo">VK</div>
      <h2>Welcome back</h2>
      <p class="subtitle">Sign in to continue</p>

      <form @submit.prevent="onSubmit">
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
        New here? <a href="#">Create account</a>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAuthStore } from './../stores/authStore'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  (e: 'close'): void;
}>()

const router = useRouter()
const authStore = useAuthStore()

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref<string|null>(null)

function close() {
  emit('close')
  error.value = null
}

async function onSubmit() {
  loading.value = true
  error.value = null

  try {
    await authStore.login(email.value, password.value)

    // Refresh to homepage
    close()
    router.push('/').then(() => {
      window.location.reload()
    })
  } catch (e: any) {
    error.value = e.message
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
.footer-text {
  margin-top:1.5rem; color:#666; font-size:.85rem;
}
.footer-text a {
  color:#00c9ff; text-decoration:none; transition:.2s;
}
.footer-text a:hover {
  color:#92fe9d;
  background-color: transparent;
}
</style>