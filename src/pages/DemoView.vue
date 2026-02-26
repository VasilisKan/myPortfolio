<script lang="ts" setup>
import { computed, watch, ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDemosStore } from '@/stores/demosStore'

const route = useRoute()
const { user } = useAuth()
const demosStore = useDemosStore()

const slug = computed(() => (route.params.slug as string) ?? '')

const loading = computed(() => demosStore.currentDemoLoading)
const error = computed(() => demosStore.currentDemoError)
const demo = computed(() => demosStore.currentDemo)

const iframeRef = ref<HTMLIFrameElement | null>(null)

function renderHtmlInIframe(html: string) {
  if (!iframeRef.value) return
  const doc = iframeRef.value.contentDocument
  if (!doc) return
  doc.open()
  doc.write(html)
  doc.close()
}

watch(
  () => demo.value?.htmlContent,
  async (content) => {
    if (content) {
      await nextTick()
      renderHtmlInIframe(content)
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (slug.value) {
    demosStore.getDemoBySlug(slug.value)
  }
})

watch(slug, (newSlug) => {
  if (newSlug) demosStore.getDemoBySlug(newSlug)
})
</script>

<template>
  <div class="demo-view-page">
    <div v-if="loading" class="demo-loading">Loading demo…</div>
    <div v-else-if="error" class="demo-error">
      <h1>Access restricted</h1>
      <p>{{ error }}</p>
      <p class="demo-hint">Only the assigned user(s) and admins can view this demo.</p>
    </div>
    <template v-else-if="demo">
      <iframe
        ref="iframeRef"
        class="demo-iframe"
        title="Demo content"
        sandbox="allow-scripts allow-same-origin"
      />
    </template>
  </div>
</template>

<style scoped>
.demo-view-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.demo-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 1rem;
  color: #666;
}

.demo-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.demo-error h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #333;
}

.demo-error p {
  margin: 0.25rem 0;
  color: #666;
}

.demo-hint {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #999;
}

.demo-iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
