<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons'

library.add(faEnvelopeOpenText)

const name = ref('')
const email = ref('')
const role = ref('')
const message = ref('')

const roles = [
  '🌟 Curious human',
  '🧑‍💼 Recruiter',
  '🤝 Collaborator',
  '🧠 Startup dreamer'
]

const handleSubmit = () => {
  alert(`Thanks ${name.value}! I’ll be in touch ✌️`)
}
</script>

<template>
    <div class="contact-card">
        <h2 class="form-title">
      <font-awesome-icon :icon="['fas', 'envelope-open-text']" class="form-icon" />
      Let’s Connect
    </h2>
    <div class="contact-form">
    <form @submit.prevent="handleSubmit" class="form-wrapper">
      <label>
        <span>Hey! What do your friends call you?</span>
        <input type="text" v-model="name" placeholder="Batman? Ironman?" required />
      </label>

      <label>
        <span>Drop your email so I can actually reply </span>
        <input type="email" v-model="email" placeholder="you@cooldomain.com" required />
      </label>

      <label>
        <span>You are a...</span>
        <select v-model="role" required>
          <option disabled value="">Choose wisely 👀</option>
          <option v-for="option in roles" :key="option">{{ option }}</option>
        </select>
      </label>

      <label>
        <span>Spill the beans 🍵</span>
        <textarea v-model="message" placeholder="Tell me something cool..." rows="4"></textarea>
      </label>

      <button type="submit">Let’s Chat 🚀</button>
    </form>
  </div>
        </div>
</template>

<style scoped>
.contact-card {
margin-top: 100px 50px;
border-top: 1px solid #ffffff22;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
 

.form-icon {
  font-size: 22px;
  color: #00c9ff;
}


.form-title {
  margin: 40px  20px;
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

.contact-form{
    justify-self: left;
    width: 70%;
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

button:hover {
  box-shadow: 0 0 10px rgba(0, 201, 255, 0.25);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .contact-card {
    padding: 24px;
  }

  .form-title {
    font-size: 22px;
  }
}
</style>

