
<script lang="ts" setup>
import AnimatedText from './../components/AnimatedText.vue'
import StacksCarousel from './../components/StacksCarousel.vue'
import AboutMe from './../components/AboutMe.vue'
import ContactMe from './../components/ContactMe.vue'
import Projects from './../components/ProjectsList.vue' 
import Header from './../components/Header.vue' 
import FooterComp from './../components/FooterComp.vue' 
defineOptions({
  name: 'MyHomepage'
})
</script>

<template>
  <div class="homepage-container">
    <div class="topGradient">
    <img src="./../assets/gradient.webp" alt="" />
  </div>
  <header>
    <Header/>
  </header>
  <div class="introContainer">
    <div class="custom-animated-text">
      <AnimatedText />
      <h4 class="timeZone">Patras, Greece • UTC/GMT +2</h4>
    </div>
    <div class="personalPhoto">
      <img src="../assets/vasilis-kanellos.webp" alt="Vasilis Kanellos" />
    </div>
  </div>
  <div class="stacksCarousel">
    <StacksCarousel />
  </div>
  <div class="about-me-container" id="about">
    <AboutMe />
  </div>

  <div class="projects-container" id="projects">
    <Projects/> 
  </div>

  <div class="contact-container" id="contact">
    <ContactMe/> 
  </div>
  <footer>
    <FooterComp/>
    <div class="bottomGradient">
    <img src="./../assets/gradient.webp" alt="" />
  </div>
  </footer>
  </div>
</template>

<style src="../assets/styles/homepage.css"></style>
