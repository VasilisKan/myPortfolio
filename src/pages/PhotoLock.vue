<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const techStack = [
  {
    name: 'App foundation',
    description: 'Expo-managed React Native app fully typed with shared configs in package.json and tsconfig.json.'
  },
  {
    name: 'Runtime & navigation',
    description: 'Expo SDK 54 on React 19 / React Native 0.81, bootstrapped via expo-router with @react-navigation libraries, expo-dev-client, and OTA releases through expo-updates.'
  },
  {
    name: 'Device capabilities',
    description: 'Expo modules power imaging, secure data, haptics, blur, SF Symbols, system UI control, image picker, and in-app browser experiences.'
  },
  {
    name: 'UI & interactions',
    description: 'Reanimated 4 and Gesture Handler 2 sit under Gorhom Bottom Sheet, Modalize, and the Expo Vector Icons set for fluid motion and micro-interactions.'
  },
  {
    name: 'Data & auth',
    description: 'Supabase JS SDK handles realtime data and auth, backed by secure storage and async storage utilities for tokens.'
  },
  {
    name: 'Media pipeline',
    description: 'AWS S3 client SDK manages photo storage and retrieval for locations and previews.'
  }
]

const flowSteps = [
  {
    title: 'Sign-In & Sign-Up',
    description:
      'Immersive split-screen layouts pair lifestyle photography with focused auth forms, keeping the flow fast whether you are returning or new. Email/password paths include inline checks, while Google OAuth and clear state-driven navigation make the handoff into the app feel effortless.',
    screens: [
      new URL(
        '../assets/photolockPhotos/login_signup/login.webp',
        import.meta.url
      ).href,
      new URL(
        '../assets/photolockPhotos/login_signup/signup.webp',
        import.meta.url
      ).href
    ]
  },
  {
    title: 'Homescreen',
    description:
      "The parallax welcome deck opens with a personal greeting, adaptive light/dark styling, and a hero card nudging your next shoot. Quick actions, curated categories, and spotlight tips sit within thumb's reach so you can jump from inspiration to execution without leaving the landing view.",
    screens: [
      new URL(
        '../assets/photolockPhotos/homeScreen/homescreen_1.webp',
        import.meta.url
      ).href,
      new URL(
        '../assets/photolockPhotos/homeScreen/homescreen_2.webp',
        import.meta.url
      ).href
    ]
  },
  {
    title: 'Feed Page',
    description:
      'A vertical carousel of full-bleed cards showcases each saved location with cinematic imagery, live ratings, and one-tap reviews. It is built for momentum: refresh for new picks, swipe to explore, and drill into details or feedback without losing your scroll context.',
    screens: [
      new URL(
        '../assets/photolockPhotos/Feed/feed_1.webp',
        import.meta.url
      ).href,
      new URL(
        '../assets/photolockPhotos/Feed/feed_2.webp',
        import.meta.url
      ).href
    ]
  },
  {
    title: 'Location & Map Pages',
    description:
      'Detailed spot profiles blend hero media and community reviews, while deep-linking to directions or the specific review thread you care about most. The companion map view keeps a synchronized list, search, and marker highlighting so you can pan the globe, surface exact coordinates, and launch into any location story instantly.',
    screens: [
      new URL(
        '../assets/photolockPhotos/locationPage/location1.webp',
        import.meta.url
      ).href,
      new URL(
        '../assets/photolockPhotos/Map/map.webp',
        import.meta.url
      ).href
    ]
  },
  {
    title: 'Add a Location',
    description:
      'A five-stage creation flow guides contributors from naming the spot to publishing a polished draft. It walks through tagging, photo uploads with cover selection, precise pin placement, and feature toggles, wrapping with a confirmation gate that validates the submission before it goes live.',
    screens: [
      new URL(
        '../assets/photolockPhotos/addLocation/addPlace_1.webp',
        import.meta.url
      ).href,
      new URL(
        '../assets/photolockPhotos/addLocation/addPlace_2.webp',
        import.meta.url
      ).href,
      new URL(
        '../assets/photolockPhotos/addLocation/addPlace_3.webp',
        import.meta.url
      ).href,
      new URL(
        '../assets/photolockPhotos/addLocation/addPlace_4.webp',
        import.meta.url
      ).href,
      new URL(
        '../assets/photolockPhotos/addLocation/addPlace_5.webp',
        import.meta.url
      ).href
    ]
  }
]

const activeStrips = new WeakSet<HTMLElement>()
const stripCleanups: Array<() => void> = []
const lightboxImage = ref<{ src: string; alt: string } | null>(null)

const openLightbox = (src: string, alt: string) => {
  lightboxImage.value = { src, alt }
}

const closeLightbox = () => {
  lightboxImage.value = null
}

const enableDragScroll = (el: HTMLElement) => {
  let isPointerActive = false
  let isDragging = false
  let pointerId: number | null = null
  let startX = 0
  let startScrollLeft = 0
  let hasCapture = false
  const dragThreshold = 10

  const isAllowedPointer = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') {
      return event.button === 0
    }
    return event.pointerType === 'touch' || event.pointerType === 'pen'
  }

  const onPointerDown = (event: PointerEvent) => {
    if (!el.classList.contains('journey-media--strip')) {
      return
    }
    if (!isAllowedPointer(event)) {
      return
    }

    isPointerActive = true
    isDragging = false
    pointerId = event.pointerId
    startX = event.clientX
    startScrollLeft = el.scrollLeft
    hasCapture = false
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!isPointerActive || pointerId === null || event.pointerId !== pointerId) {
      return
    }
    const deltaX = event.clientX - startX
    if (!isDragging && Math.abs(deltaX) > dragThreshold) {
      isDragging = true
      el.classList.add('is-dragging')
      if (!hasCapture) {
        try {
          el.setPointerCapture(pointerId)
          hasCapture = true
        } catch (error) {
          hasCapture = false
        }
      }
    }
    if (isDragging) {
      el.scrollLeft = startScrollLeft - deltaX
      event.preventDefault()
    }
  }

  const endPointer = (event: PointerEvent) => {
    if (!isPointerActive || pointerId === null || event.pointerId !== pointerId) {
      return
    }
    if (hasCapture && el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId)
    }
    hasCapture = false
    isPointerActive = false
    pointerId = null
    if (isDragging) {
      requestAnimationFrame(() => el.classList.remove('is-dragging'))
    }
    isDragging = false
  }

  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', endPointer)
  el.addEventListener('pointercancel', endPointer)
  el.addEventListener('pointerleave', endPointer)

  return () => {
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerup', endPointer)
    el.removeEventListener('pointercancel', endPointer)
    el.removeEventListener('pointerleave', endPointer)
  }
}

const registerStrip = (el: Element | null) => {
  if (!(el instanceof HTMLElement) || activeStrips.has(el)) {
    return
  }
  activeStrips.add(el)
  const cleanup = enableDragScroll(el)
  if (cleanup) {
    stripCleanups.push(cleanup)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeLightbox()
  }
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

watch(lightboxImage, (value) => {
  if (typeof document === 'undefined') {
    return
  }
  if (value) {
    document.body.style.setProperty('overflow', 'hidden')
  } else {
    document.body.style.removeProperty('overflow')
  }
})

onBeforeUnmount(() => {
  stripCleanups.forEach((cleanup) => cleanup())
  stripCleanups.length = 0
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
  if (typeof document !== 'undefined') {
    document.body.style.removeProperty('overflow')
  }
})
</script>

<template>
  <main class="photolock-page">
    <section class="hero">
      <p class="eyebrow">Featured project</p>
      <h1>PhotoLock</h1>
      <div class="subtitle">
        <p>
          PhotoLock is a platform built for photographers and travelers who love exploring new places. The app allows users to
          share their favorite photoshoot spots and discover new ones nearby, complete with location details, tags,
          and preview photos.
        </p>
        <p>
          Built with React and Supabase, PhotoLock offers an easy-to-use experience for both hobbyists and
          professionals looking to plan their next shoot. Each user can post new locations, browse community
          submissions, and save spots to revisit later.
        </p>
        <p>
          The idea behind PhotoLock is to make it easier for everybody to find inspiration through real
          locations, fostering a community that collaborates and shares creative ideas visually.
        </p>
      </div>
      <div class="hero-divider" role="presentation"></div>
    </section>

    <section class="journey-section" id="walkthrough">
      <h2>Walkthrough</h2>
      <div class="journey-list">
        <article
          v-for="(step, index) in flowSteps"
          :key="step.title"
          class="journey-panel"
        >
          <header class="journey-header">
            <span class="journey-label">{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ step.title }}</h3>
          </header>
          <div class="journey-copy">
            <p>{{ step.description }}</p>
          </div>
          <div
            v-if="step.screens && step.screens.length"
            class="journey-media"
            :class="{ 'journey-media--strip': step.screens.length > 2 }"
            :ref="el => { if (step.screens.length > 2) registerStrip(el) }"
          >
            <img
              v-for="(screen, screenIndex) in step.screens"
              :key="screen"
              :src="screen"
              :alt="`${step.title} screen ${screenIndex + 1}`"
              class="journey-shot"
              loading="lazy"
              decoding="async"
              draggable="false"
              role="button"
              tabindex="0"
              @click="openLightbox(screen, `${step.title} screen ${screenIndex + 1}`)"
              @keydown.enter.prevent="openLightbox(screen, `${step.title} screen ${screenIndex + 1}`)"
              @keydown.space.prevent="openLightbox(screen, `${step.title} screen ${screenIndex + 1}`)"
            />
          </div>
        </article>
      </div>
    </section>

    <section class="tech-section">
      <h2>Tech stack</h2>
      <div class="tech-wrapper">
        <ul class="tech-list">
          <li v-for="tech in techStack" :key="tech.name">
            <span class="tech-name">{{ tech.name }}</span>
            <span class="tech-description">{{ tech.description }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="cta-section">
      <h2>Join the Private Alpha</h2>
      <p class="cta-description">
        I'm inviting a small whitelist of creative teams, producers, and scouts to test PhotoLock in alpha. Request
        access and I'll send over the TestFlight build plus onboarding notes tuned to how you work.
      </p>
      <a
        class="primary-cta primary-cta--compact"
        href="mailto:vasilis@kanellos.me?subject=PhotoLock%20Alpha%20Access&body=Hello%20Vasilis%2C%0A%0AI'm%20interested%20in%20joining%20the%20PhotoLock%20alpha%20and%20would%20love%20to%20be%20added%20to%20your%20whitelist.%20Let%20me%20know%20the%20next%20steps.%0A%0AThanks!"
      >
        Request alpha invite
      </a>
    </section>
    <div
      v-if="lightboxImage"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="lightboxImage.alt"
      @click.self="closeLightbox"
    >
      <div class="lightbox__content">
        <button
          type="button"
          class="lightbox__close"
          @click="closeLightbox"
          aria-label="Close image preview"
        >
          ×
        </button>
        <img
          :src="lightboxImage.src"
          :alt="lightboxImage.alt"
          class="lightbox__image"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.photolock-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 120px 24px 160px;
  color: #f7fbff;
  display: flex;
  flex-direction: column;
  gap: 120px;
  line-height: 1.7;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: center;
}

.eyebrow {
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
}

.hero h1 {
  font-size: clamp(2.8rem, 6vw, 4.2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(120deg, #92fe9d 0%, #00c9ff 60%, #4d9dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  display: grid;
  gap: 0.9rem;
  font-size: clamp(1.05rem, 2.2vw, 1.3rem);
  color: rgba(230, 242, 255, 0.82);
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.hero-divider {
  width: clamp(60px, 12vw, 110px);
  height: 2px;
  margin: clamp(28px, 6vw, 40px) auto 0;
  background: linear-gradient(90deg, rgba(146, 254, 157, 0.4), rgba(0, 201, 255, 0.7), rgba(146, 254, 157, 0.4));
  border-radius: 999px;
  opacity: 0.8;
}

.primary-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 26px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 15px;
  transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.primary-cta {
  background: linear-gradient(120deg, #00c9ff, #7effb2);
  color: #0a101a;
  box-shadow: 0 12px 24px rgba(0, 201, 255, 0.2);
}

.primary-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(0, 201, 255, 0.28);
}

.primary-cta--compact {
  font-size: 0.82rem;
  padding: 10px 24px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  width: clamp(220px, 40vw, 280px);
  align-self: center;
  justify-self: center;
}

.journey-section {
  display: grid;
  gap: 32px;
  text-align: center;
}

.journey-section h2 {
  font-size: clamp(2rem, 4vw, 2.6rem);
}

.journey-intro {
  max-width: 640px;
  margin: 0 auto;
  color: rgba(230, 242, 255, 0.78);
}

.journey-list {
  display: grid;
  gap: clamp(3rem, 9vw, 5.5rem);
}

.journey-panel {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.4rem);
  align-content: start;
  text-align: left;
  padding-bottom: clamp(2rem, 6vw, 3.5rem);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.journey-panel:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.journey-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.journey-label {
  font-size: clamp(0.75rem, 1vw, 0.9rem);
  font-weight: 600;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(146, 254, 157, 0.75);
}

.journey-copy {
  display: grid;
  gap: 0.75rem;
  color: rgba(235, 245, 255, 0.82);
}

.journey-panel h3 {
  font-size: clamp(1.6rem, 2.6vw, 2.1rem);
  letter-spacing: -0.01em;
}

.journey-media {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.75rem, 2.5vw, 1.5rem);
  justify-content: flex-start;
  align-items: flex-start;
  padding-top: 6px;
  margin-top: -6px;
}

.journey-media--strip {
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: visible;
  padding-bottom: 10px;
  margin-right: -6px;
  padding-right: 6px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  position: relative;
  cursor: grab;
  user-select: none;
  overscroll-behavior-x: contain;
}

.journey-media--strip::-webkit-scrollbar {
  display: none;
}

.journey-media--strip.is-dragging {
  cursor: grabbing;
}

.journey-media--strip.is-dragging .journey-shot {
  pointer-events: none;
}

.journey-media--strip .journey-shot {
  scroll-snap-align: start;
}

.journey-media--strip::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 10px;
  width: clamp(40px, 10vw, 90px);
  pointer-events: none;
  background: linear-gradient(to right, rgba(9, 14, 22, 0) 0%, rgba(9, 14, 22, 0.85) 100%);
}

.journey-shot {
  flex: 1 0 clamp(160px, 28vw, 220px);
  max-width: 220px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 201, 255, 0.18);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s ease;
  width: 100%;
  height: auto;
  display: block;
  cursor: zoom-in;
  will-change: transform;
}

.journey-shot:hover {
  transform: translateY(-2px) scale(1.02);
}

.journey-shot:focus-visible {
  outline: 3px solid rgba(146, 254, 157, 0.8);
  outline-offset: 4px;
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 18, 0.78);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 24px;
}

.lightbox__content {
  position: relative;
  max-width: min(90vw, 520px);
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox__image {
  width: 100%;
  height: auto;
  border-radius: 16px;
  border: 1px solid rgba(0, 201, 255, 0.2);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.45);
}

.lightbox__close {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(12, 18, 28, 0.85);
  color: #f5faff;
  font-size: 1.6rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.lightbox__close:hover {
  transform: scale(1.08);
  background: rgba(12, 18, 28, 0.95);
}

.lightbox__close:focus-visible {
  outline: 2px solid rgba(0, 201, 255, 0.8);
  outline-offset: 4px;
}

.tech-section,
.cta-section {
  display: grid;
  gap: 24px;
  text-align: center;
  width: 100%;
}

.tech-section h2,
.cta-section h2 {
  font-size: clamp(2rem, 4vw, 2.6rem);
}

.tech-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.tech-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: clamp(1rem, 2.5vw, 1.75rem);
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  width: min(100%, 900px);
  justify-items: stretch;
}

.tech-list li {
  position: relative;
  display: grid;
  gap: 12px;
  padding: 28px 26px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(12, 19, 31, 0.88), rgba(20, 35, 54, 0.6));
  border: 1px solid rgba(0, 201, 255, 0.12);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  text-align: left;
  overflow: hidden;
  transition: transform 0.25s ease, border 0.25s ease, box-shadow 0.25s ease;
}

.tech-list li::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at top left, rgba(86, 255, 214, 0.22), transparent 55%);
  opacity: 0.8;
  pointer-events: none;
}

.tech-list li:hover {
  transform: translateY(-6px);
  border-color: rgba(86, 255, 214, 0.35);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.32);
}

.tech-name {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(146, 254, 157, 0.85);
}

.tech-description {
  font-size: 0.98rem;
  line-height: 1.6;
  color: rgba(237, 245, 255, 0.85);
}

.cta-description {
  max-width: clamp(560px, 70vw, 760px);
  margin: 0 auto;
  color: rgba(235, 245, 255, 0.78);
}

@media (max-width: 900px) {
  .photolock-page {
    padding-top: 100px;
    gap: 80px;
  }

  .tech-list {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 600px) {
  .primary-cta {
    width: 100%;
  }

  .tech-list li {
    padding: 22px 20px;
  }
}
</style>
