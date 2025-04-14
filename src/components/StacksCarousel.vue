<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub, faVuejs, faReact, faJs, faNode } from '@fortawesome/free-brands-svg-icons'

library.add(faGithub, faVuejs, faReact, faJs, faNode)

const stacks = [
  { icon: ['fab', 'github'] },
  { icon: ['fab', 'vuejs'] },
  { icon: ['fab', 'react'] },
  { icon: ['fab', 'js'] },
  { icon: ['fab', 'node'] },
  { icon: ['fab', 'github'] },
  { icon: ['fab', 'vuejs'] },
  { icon: ['fab', 'react'] },
  { icon: ['fab', 'js'] },
  { icon: ['fab', 'node'] }
]
</script>

<template>
  <!-- Title -->
  <h2 class="stacksTitle">Tech stack</h2>
  
  <!-- Carousel Wrapper -->
  <div class="carousel-wrapper">
    <div class="carousel">
      <ul class="stack-list">
        <!-- Duplicate the array so it scrolls infinitely -->
        <li v-for="(stack, index) in stacks.concat(stacks)" :key="index">
          <font-awesome-icon :icon="stack.icon" class="stack-icon" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
/* Minimal styling for the Tech Stack title */
.stacksTitle {
  margin: 40px  20px;
    text-align: center;
    font-size: 32px;
    color: #e0e0e0;
    font-weight: 700;
    position: relative;
}

/* Subtle line under the title */
.stacksTitle::after {
  content: "";
  display: block;
  margin: 0.4rem auto 0; 
  width: 60px;
  height: 2px;
  background-color: #ffffff22; 
}

.carousel-wrapper {
  padding: 25px 0;
  display: flex;
  justify-content: center;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 12px;
}

.carousel {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.stack-list {
  display: flex;
  gap: 30px;
  animation: scroll 12s linear infinite;
  list-style: none;
  padding: 0;
  margin: 0;
  width: max-content;
}

.stack-icon {
  color: white;
  font-size: 45px;
  transition: transform 0.3s;
}

.stack-icon:hover {
  transform: scale(1.4);
  z-index: 9000;
  overflow: visible;
}

/* Infinite horizontal scroll animation */
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* Pauses the carousel animation on hover */
.carousel-wrapper:hover .stack-list {
  animation-play-state: paused;
}
</style>
