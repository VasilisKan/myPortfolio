<script setup>
import AnimatedText from './../components/AnimatedText.vue'
import StacksCarousel from './../components/StacksCarousel.vue'
import AboutMe from './../components/AboutMe.vue'
import ContactMe from './../components/ContactMe.vue'
</script>

<template>
  <div class="introContainer">
    <div class="custom-animated-text" >
      <AnimatedText/>
      <h4 class="timeZone">Patras, Greece • UTC/GMT +2</h4>
    </div>
    <div class="personalPhoto">
      <img src="../assets/vasilis-kanellos.jpeg" alt="Vasilis Kanellos" />
    </div>
  </div>
  <div class="stacksCarousel">
    <StacksCarousel />
  </div>
  <div class="about-me-container">
    <AboutMe />
  </div>
  <div class="contact-container">
    <ContactMe/> 
  </div>
</template>

<style src="../assets/styles/homepage.css"></style>