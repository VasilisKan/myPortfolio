<script lang="ts" setup>
import { computed, watch, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useShowcaseStore } from '@/stores/showcaseStore'

const route = useRoute()
const showcaseStore = useShowcaseStore()

const slug = computed(() => (route.params.slug as string) ?? '')

const loading = computed(() => showcaseStore.currentItemLoading)
const error = computed(() => showcaseStore.currentItemError)
const item = computed(() => showcaseStore.currentItem)

const galleryImages = computed(() => {
  const i = item.value
  if (!i || i.type !== 'gallery') return []
  if (i.imageUrls?.length) return i.imageUrls
  if (i.imageUrl) return [i.imageUrl]
  return []
})

const iframeRef = ref<HTMLIFrameElement | null>(null)

const lightboxIndex = ref<number | null>(null)

function openLightbox(index: number) {
  lightboxIndex.value = index
}

function closeLightbox() {
  lightboxIndex.value = null
}

function previewHtml(html: string): string {
  if (!html || !html.trim()) return '<p style="color:#999;padding:1rem;">No content</p>'
  const trimmed = html.trim()
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
    return trimmed
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:8px;}</style></head><body>${trimmed}</body></html>`
}

function renderHtmlInIframe(html: string) {
  if (!iframeRef.value) return
  const doc = iframeRef.value.contentDocument
  if (!doc) return
  doc.open()
  doc.write(html)
  doc.close()
}

watch(
  () => (item.value?.type === 'site' ? item.value?.htmlContent : null),
  async (content) => {
    if (content != null && content !== '') {
      await nextTick()
      renderHtmlInIframe(previewHtml(content))
    }
  },
  { immediate: true }
)

function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && lightboxIndex.value !== null) {
    closeLightbox()
  }
}

onMounted(() => {
  if (slug.value) {
    showcaseStore.getItemBySlug(slug.value)
  }
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

watch(slug, (newSlug) => {
  if (newSlug) showcaseStore.getItemBySlug(newSlug)
})
</script>

<template>
  <div class="showcase-item-page">
    <RouterLink to="/" class="showcase-back-to-site" aria-label="Back to site">
      ← Back to site
    </RouterLink>
    <div v-if="loading" class="item-loading">Loading…</div>
    <div v-else-if="error" class="item-error">
      <h1>Access restricted</h1>
      <p>{{ error }}</p>
      <p class="item-hint">Only the assigned client(s) and admins can view this.</p>
    </div>
    <template v-else-if="item">
      <!-- Site: full-page iframe -->
      <template v-if="item.type === 'site'">
        <iframe
          ref="iframeRef"
          class="item-iframe"
          :title="item.title"
          sandbox="allow-scripts allow-same-origin"
        />
      </template>
      <!-- Gallery: grid of images -->
      <template v-else>
        <div class="item-gallery-wrap">
          <div v-if="galleryImages.length" class="item-gallery-grid">
            <img
              v-for="(url, i) in galleryImages"
              :key="i"
              :src="url"
              :alt="`${item.title} – ${i + 1}`"
              class="item-gallery-img"
              loading="lazy"
              role="button"
              tabindex="0"
              @click="openLightbox(i)"
              @keydown.enter="openLightbox(i)"
              @keydown.space.prevent="openLightbox(i)"
            />
          </div>
          <p v-else class="item-no-image">No images</p>
        </div>

        <!-- Lightbox: zoomed image + exit -->
        <Teleport to="body">
          <div
            v-if="lightboxIndex !== null"
            class="lightbox-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed image"
            @click.self="closeLightbox"
          >
            <button
              type="button"
              class="lightbox-close"
              aria-label="Close"
              @click="closeLightbox"
            >
              Exit
            </button>
            <img
              v-if="galleryImages[lightboxIndex]"
              :src="galleryImages[lightboxIndex]"
              :alt="`${item.title} – ${lightboxIndex + 1}`"
              class="lightbox-img"
              @click.stop
            />
          </div>
        </Teleport>
      </template>
    </template>
  </div>
</template>

<style scoped>
.showcase-item-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #111;
}

.showcase-back-to-site {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.showcase-back-to-site:hover {
  background: rgba(0, 0, 0, 0.75);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}

.item-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 1rem;
  color: #999;
}

.item-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: #fff;
}

.item-error h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #333;
}

.item-error p {
  margin: 0.25rem 0;
  color: #666;
}

.item-hint {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #999;
}

.item-iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.item-gallery-wrap {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.item-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.item-gallery-img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
  background: #222;
  cursor: pointer;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.lightbox-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.item-no-image {
  margin: 0;
  color: #666;
  font-size: 1rem;
}
</style>
