<script lang="ts" setup>
import { ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import emailjs from 'emailjs-com'

library.add(faEnvelopeOpenText)

const SERVICE_ID   = import.meta.env.VITE_EMAILJS_SERVICE_ID   as string
const TEMPLATE_ID  = import.meta.env.VITE_EMAILJS_TEMPLATE_ID  as string
const PUBLIC_KEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY   as string

const name         = ref('')
const email        = ref('')
const role         = ref('')
const message      = ref('')
const isSubmitting = ref(false)
const submitSuccess= ref(false)
const submitError  = ref('')

const roles = [
  '🌟 Curious human',
  '🧑‍💼 Recruiter',
  '🤝 Collaborator',
  '🧠 Startup dreamer'
]

const handleSubmit = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true
  submitError.value   = ''

  try {
    emailjs.init(PUBLIC_KEY)

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        from_name:  name.value,
        from_email: email.value,
        role:       role.value,
        message:    message.value
      }
    )

    if (response.status === 200) {
      submitSuccess.value = true
      name.value    = ''
      email.value   = ''
      role.value    = ''
      message.value = ''
    } else {
      throw new Error(response.text)
    }

  } catch (err:any) {
    console.error('EmailJS error:', err)
    submitError.value = err.message || 'Failed to send message'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="contact-card">
    <h2 class="form-title">
      <font-awesome-icon
        :icon="['fas', 'envelope-open-text']"
        class="form-icon"
      />
      Let’s Connect
    </h2>

    <div class="contact-form">
      <form @submit.prevent="handleSubmit" class="form-wrapper">
        <div v-if="submitSuccess" class="success-message">
          Thanks for reaching out! I’ll get back to you soon. ✨
        </div>

        <div v-if="submitError" class="error-message">
          {{ submitError }}
        </div>

        <label>
          <span>Hey! What do your friends call you?</span>
          <input
            type="text"
            v-model="name"
            placeholder="Batman? Ironman?"
            required
          />
        </label>

        <label>
          <span>Drop your email so I can actually reply</span>
          <input
            type="email"
            v-model="email"
            placeholder="you@cooldomain.com"
            required
          />
        </label>

        <label>
          <span>You are a…</span>
          <select v-model="role" required>
            <option disabled value="">Choose wisely 👀</option>
            <option
              v-for="option in roles"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </label>

        <label>
          <span>I’m all ears…</span>
          <textarea
            v-model="message"
            placeholder="Tell me something cool…"
            rows="4"
            required
          />
        </label>

        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending…' : "Let’s Chat 🚀" }}
        </button>
      </form>
    </div>

    <div class="rounded-arrow">
      <img
        src="@/assets/curved-arrow.webp"
        alt="Decorative arrow"
        class="rounded-arrow-svg"
      />
    </div>
  </div>
</template>


<style scoped>

.contact-card {
  position: relative;
  margin: 100px 50px;
  border-top: 1px solid #ffffff22;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.form-icon {
  font-size: 22px;
  color: #00c9ff;
}

.form-title {
  margin: 40px 20px;
  text-align: center;
  font-size: 32px;
  color: #e0e0e0;
  font-weight: 700;
  position: relative;
}

.form-title::after {
  content: "";
  display: block;
  margin: 0.4rem auto 0;
  width: 60px;
  height: 2px;
  background-color: #ffffff22;
}

.contact-form {
  justify-self: left;
  width: 70%;
  margin: 0 auto;
}

.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 700px;
  margin: 60px auto;
  padding: 32px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 3px rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  transition: box-shadow 0.3s ease;
}

label span {
  display: block;
  font-size: 14px;
  color: #aaa;
  margin-bottom: 6px;
}

input,
select,
textarea {
  width: 100%;
  background-color: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #fff;
  transition: border 0.2s, box-shadow 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #00c9ff;
  box-shadow: 0 0 8px rgba(0, 201, 255, 0.25);
  outline: none;
}

button {
  background: linear-gradient(to right, #00c9ff, #92fe9d);
  color: #121212;
  padding: 14px;
  font-weight: 600;
  font-size: 15px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

button:hover:not(:disabled) {
  box-shadow: 0 0 10px rgba(0, 201, 255, 0.25);
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-message {
  background-color: rgba(0, 201, 255, 0.1);
  border: 1px solid #00c9ff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
  color: #00c9ff;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
  color: #ff0000;
}

.rounded-arrow {
  position: absolute;
  bottom: -15em;
  right: -9em;
  z-index: -1;
}

.rounded-arrow img {
  width: 450px;
  height: auto;
}

@media (max-width: 768px) {
  .contact-card {
    margin: 100px 0px 50px;
  }
  
  .contact-form {
    width: 90%;
  }
  
  .form-wrapper {
    padding: 24px;
    margin: 40px auto;
  }
  
  .form-title {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .contact-card {
    margin: 80px 0px 40px;
  }
  
  .form-wrapper {
    padding: 20px;
    margin: 30px auto;
  }
  
  .form-title {
    font-size: 24px;
    margin: 30px 15px;
  }
  
  .rounded-arrow {
  position: absolute;
  bottom: -12em;
  right: 0;
  z-index: -1;
}

.rounded-arrow img {
  width: 250px;
  height: auto;
}
}
</style>