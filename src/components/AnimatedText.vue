<script setup>
import { ref, onMounted } from 'vue'

// Word list with beautiful blue tones
const headerWords = [
  { text: "Scalable", color: "#00C9FF" },
  { text: "Reliable", color: "#2F80ED" },
  { text: "Responsive", color: "#1F6FEB" }
]

const currentIndex = ref(0)

onMounted(() => {
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % headerWords.length
  }, 3000)
}) 
</script>

<template>
  <h1 class="intro">
    I&apos;m Vasilis, a Full Stack Engineer building&nbsp;
    <transition name="fade-scale" mode="out-in">
      <span
        :key="headerWords[currentIndex].text"
        :style="{ color: headerWords[currentIndex].color }"
        class="fancy-word"
      >
        {{ headerWords[currentIndex].text }}
      </span>
    </transition>
    &nbsp;applications, using a variety of stacks.
  </h1>
</template>

<style>
.intro {
  color: #e0e0e0;
  font-size: 32px;
  text-align: start;
  line-height: 1.6;
  max-width: 58ch;
  margin: auto;
  font-weight:700;
}

.fancy-word {
  font-weight: bold;
  font-size: 34px;
  display: inline-block;
  min-width: 120px;
}

/* Smooth fade/scale animation */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.7s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-10px);
}
</style>
