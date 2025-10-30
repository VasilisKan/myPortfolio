
<script lang="ts" setup>
import { defineAsyncComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import AnimatedText from './../components/AnimatedText.vue'
import Header from './../components/Header.vue' 
import Sidebar from './../components/Sidebar.vue' 

const StacksCarousel = defineAsyncComponent(() =>
  import('./../components/StacksCarousel.vue')
)
const AboutMe = defineAsyncComponent(() =>
  import('./../components/AboutMe.vue')
)
const ContactMe = defineAsyncComponent(() =>
  import('./../components/ContactMe.vue')
)
const Projects = defineAsyncComponent(() =>
  import('./../components/ProjectsList.vue')
)
const FooterComp = defineAsyncComponent(() =>
  import('./../components/FooterComp.vue')
)

const stacksSection = ref<HTMLElement | null>(null)
const aboutSection = ref<HTMLElement | null>(null)
const projectsSection = ref<HTMLElement | null>(null)
const contactSection = ref<HTMLElement | null>(null)

const stacksVisible = ref(false)
const aboutVisible = ref(false)
const projectsVisible = ref(false)
const contactVisible = ref(false)

let observer: IntersectionObserver | null = null

const revealAll = () => {
  stacksVisible.value = true
  aboutVisible.value = true
  projectsVisible.value = true
  contactVisible.value = true
}

onMounted(() => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    revealAll()
    return
  }

  const targets = new Map<Element, { reveal: () => void }>()
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const item = targets.get(entry.target)
          if (item) {
            item.reveal()
            observer?.unobserve(entry.target)
          }
        }
      })
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.2 }
  )

  const register = (
    elRef: typeof stacksSection,
    reveal: () => void
  ) => {
    if (elRef.value) {
      targets.set(elRef.value, { reveal })
      observer?.observe(elRef.value)
    }
  }

  register(stacksSection, () => {
    stacksVisible.value = true
  })
  register(aboutSection, () => {
    aboutVisible.value = true
  })
  register(projectsSection, () => {
    projectsVisible.value = true
  })
  register(contactSection, () => {
    contactVisible.value = true
  })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

defineOptions({
  name: 'MyHomepage'
})
</script>

<template>
  <div class="homepage-container">
  <div class="topGradient" aria-hidden="true">
    <img src="./../assets/gradient.webp" alt="" decoding="async" loading="lazy" />
  </div>
  <Sidebar />
  <header>
    <Header/>
  </header>
  <div class="introContainer">
    <div class="custom-animated-text">
      <AnimatedText />
      <h4 class="timeZone">Patras, Greece • UTC/GMT +2</h4>
    </div>
    <div class="personalPhoto">
      <img src="../assets/vasilis-kanellos.webp" alt="Vasilis Kanellos" loading="lazy" decoding="async" />
    </div>
  </div>
  <div class="stacksCarousel" ref="stacksSection">
    <StacksCarousel v-if="stacksVisible" />
  </div>
  <div class="about-me-container" id="about" ref="aboutSection">
    <AboutMe v-if="aboutVisible" />
  </div>

  <div class="projects-container" id="projects" ref="projectsSection">
    <Projects v-if="projectsVisible"/> 
  </div>

  <div class="contact-container" id="contact" ref="contactSection">
    <ContactMe v-if="contactVisible"/> 
  </div>
  <footer aria-label="Site footer">
    <FooterComp/>
    <div class="bottomGradient" aria-hidden="true">
    <img src="./../assets/gradient.webp" alt="" loading="lazy" decoding="async" />
  </div>
  </footer>
  </div>
</template>

<style src="../assets/styles/homepage.css"></style>
