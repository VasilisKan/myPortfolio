<script setup lang="ts">
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
    &nbsp;applications, using <br class="desktop-break"/> a variety of stacks.
  </h1>
</template>

<style>
.intro {
  color: #e0e0e0;
  font-size: 32px;
  text-align: start;
  line-height: 1.6;
  max-width: 60ch;
  margin: auto;
  font-weight: 700;
}

.fancy-word {
  font-weight: bold;
  font-size: 34px;
  display: inline-block;
  min-width: 120px;
}

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


.desktop-break {
    display: block;
  }
  
/* Mobile styles */
@media (max-width: 768px) {  
  .intro {
    font-size: 22px;
    line-height: 1.5;
    padding: 0 0;
    max-width: 100%;
  }
  
  .fancy-word {
    font-size: 24px;
    min-width: 100px;
  }
  .desktop-break {
  display: none;
}

  /* Adjust for very small screens */
  @media (max-width: 400px) {
    .intro {
      font-size: 20px;
    }
    
    .fancy-word {
      font-size: 22px;
      min-width: 0px;
    }
  }
}
</style>