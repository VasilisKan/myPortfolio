<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUsersStore } from '@/stores/usersStore'
import { useDashboardTheme } from '@/composables/useDashboardTheme'
import {
  useShowcaseStore,
  slugFromTitle,
  uploadShowcaseImage,
  type ShowcaseItem,
  type ShowcaseType,
} from '@/stores/showcaseStore'

const { user } = useAuth()
const usersStore = useUsersStore()
const showcaseStore = useShowcaseStore()
const { theme: dashboardTheme } = useDashboardTheme()

const isAdmin = computed(() => !!user.value?.isAdmin)

const typeFilter = ref<'all' | 'site' | 'gallery'>('all')
const filteredItems = computed(() => {
  if (typeFilter.value === 'all') return showcaseStore.items
  return showcaseStore.items.filter((i) => i.type === typeFilter.value)
})

const viewingGallery = ref<ShowcaseItem | null>(null)
const galleryLightboxIndex = ref<number | null>(null)

const viewingGalleryImages = computed(() => {
  const g = viewingGallery.value
  if (!g || g.type !== 'gallery') return []
  if (g.imageUrls?.length) return g.imageUrls
  if (g.imageUrl) return [g.imageUrl]
  return []
})

function openGalleryView(item: ShowcaseItem) {
  if (item.type !== 'gallery') return
  viewingGallery.value = item
  galleryLightboxIndex.value = null
}

function closeGalleryView() {
  viewingGallery.value = null
  galleryLightboxIndex.value = null
}

function openGalleryLightbox(index: number) {
  galleryLightboxIndex.value = index
}

function closeGalleryLightbox() {
  galleryLightboxIndex.value = null
}

function onGalleryKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && galleryLightboxIndex.value !== null) {
    closeGalleryLightbox()
  }
}

const showCreate = ref(false)
const createStep = ref(1)
const createType = ref<ShowcaseType>('site')
const createTitle = ref('')
const createSlug = ref('')
const createHtml = ref('')
const createImageUrls = ref<string[]>([])
const createImageUrlInput = ref('')
const createUserIds = ref<string[]>([])
const createSaving = ref(false)
const createError = ref<string | null>(null)
const userSearchQuery = ref('')
const uploadLoading = ref(false)
const uploadError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const CREATE_STEPS = 4

function openCreateModal() {
  showCreate.value = true
  createStep.value = 1
  createError.value = null
}

function nextStep() {
  if (createStep.value === 1) {
    createError.value = null
    createStep.value = 2
    return
  }
  if (createStep.value === 2) {
    if (!createTitle.value.trim()) {
      createError.value = 'Title is required'
      return
    }
    createError.value = null
    createStep.value = 3
    return
  }
  if (createStep.value === 3) {
    if (createType.value === 'gallery' && createImageUrls.value.length === 0) {
      createError.value = 'Add at least one image to the gallery'
      return
    }
    createError.value = null
    createStep.value = 4
    return
  }
}

function prevStep() {
  createError.value = null
  if (createStep.value > 1) createStep.value -= 1
}

function closeCreateModal() {
  showCreate.value = false
  resetCreateForm()
  createStep.value = 1
}

watch(createTitle, (t) => {
  if (!createSlug.value || createSlugTouched.value === false) {
    createSlug.value = slugFromTitle(t)
  }
})
const createSlugTouched = ref(false)

function getItemUrl(slug: string) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/showcase/${encodeURIComponent(slug)}`
}

function previewHtml(html: string): string {
  if (!html || !html.trim()) return '<p style="color:#999;padding:1rem;">No content</p>'
  const trimmed = html.trim()
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
    return trimmed
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:8px;font-size:12px;}</style></head><body>${trimmed}</body></html>`
}

async function submitCreate() {
  if (!createTitle.value.trim()) {
    createError.value = 'Title is required'
    return
  }
  if (createType.value === 'gallery' && createImageUrls.value.length === 0) {
    createError.value = 'Add at least one image to the gallery'
    return
  }
  createError.value = null
  createSaving.value = true
  try {
    await showcaseStore.createItem({
      type: createType.value,
      title: createTitle.value.trim(),
      slug: createSlug.value.trim() || undefined,
      htmlContent: createType.value === 'site' ? createHtml.value : undefined,
      imageUrls: createType.value === 'gallery' ? createImageUrls.value : undefined,
      userIds: createUserIds.value,
    })
    closeCreateModal()
  } catch (err: any) {
    createError.value = err?.message ?? 'Failed to create item'
  } finally {
    createSaving.value = false
  }
}

function resetCreateForm() {
  createTitle.value = ''
  createSlug.value = ''
  createHtml.value = ''
  createImageUrls.value = []
  createImageUrlInput.value = ''
  createUserIds.value = []
  userSearchQuery.value = ''
  createType.value = 'site'
  uploadError.value = null
}

function triggerUpload() {
  uploadError.value = null
  fileInputRef.value?.click()
}

async function onFileSelected(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const valid = /^image\//.test(file.type)
  if (!valid) {
    uploadError.value = 'Please choose an image file (e.g. JPG, PNG)'
    return
  }
  uploadLoading.value = true
  uploadError.value = null
  try {
    const url = await uploadShowcaseImage(file)
    createImageUrls.value = [...createImageUrls.value, url]
  } catch (err: any) {
    uploadError.value = err?.message ?? 'Upload failed'
  } finally {
    uploadLoading.value = false
  }
}

function addImageByUrl() {
  const url = createImageUrlInput.value.trim()
  if (!url) return
  createImageUrls.value = [...createImageUrls.value, url]
  createImageUrlInput.value = ''
}

function removeGalleryImage(index: number) {
  createImageUrls.value = createImageUrls.value.filter((_, i) => i !== index)
}

const filteredUsersForAssign = computed(() => {
  const q = userSearchQuery.value.trim().toLowerCase()
  if (!q) return usersStore.users
  return usersStore.users.filter(
    (u) =>
      u.email.toLowerCase().includes(q) ||
      (u.username ?? '').toLowerCase().includes(q)
  )
})

function toggleUserForCreate(userId: string) {
  const i = createUserIds.value.indexOf(userId)
  if (i >= 0) createUserIds.value = createUserIds.value.filter((_, j) => j !== i)
  else createUserIds.value = [...createUserIds.value, userId]
}

async function deleteItem(item: ShowcaseItem) {
  if (!confirm(`Delete "${item.title}"?`)) return
  try {
    await showcaseStore.deleteItem(item.id)
  } catch (err: any) {
    showcaseStore.error = err?.message ?? 'Failed to delete'
  }
}

onMounted(() => {
  if (isAdmin.value) {
    usersStore.loadAllUsers()
    showcaseStore.loadItems()
  }
  window.addEventListener('keydown', onGalleryKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onGalleryKeydown)
})
</script>

<template>
  <div class="showcase-view">
    <template v-if="!isAdmin">
      <p class="view-placeholder">You need admin access to manage the showcase.</p>
    </template>

    <template v-else>
      <div class="showcase-header">
        <p class="showcase-intro">
          Share sites, photos, and samples with clients. Only assigned users (and admins) can open each link.
        </p>
        <div class="showcase-header-actions">
          <div class="tabs" role="tablist" aria-label="Filter by type">
            <button
              type="button"
              role="tab"
              :class="['tab', { active: typeFilter === 'all' }]"
              :aria-selected="typeFilter === 'all'"
              @click="typeFilter = 'all'"
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              :class="['tab', { active: typeFilter === 'site' }]"
              :aria-selected="typeFilter === 'site'"
              @click="typeFilter = 'site'"
            >
              Sites
            </button>
            <button
              type="button"
              role="tab"
              :class="['tab', { active: typeFilter === 'gallery' }]"
              :aria-selected="typeFilter === 'gallery'"
              @click="typeFilter = 'gallery'"
            >
              Galleries
            </button>
          </div>
          <button
            type="button"
            class="btn-primary"
            :disabled="showcaseStore.loading"
            @click="openCreateModal()"
          >
            Add item
          </button>
        </div>
      </div>

      <div v-if="showcaseStore.loading" class="loading-message">Loading…</div>
      <p v-else-if="showcaseStore.error" class="panel-error">{{ showcaseStore.error }}</p>
      <!-- Inline gallery view (same place as cards, sidebar stays) -->
      <div v-else-if="viewingGallery" class="showcase-grid-wrapper">
        <div class="gallery-view-toolbar">
          <button type="button" class="btn-back-to-list" @click="closeGalleryView">
            ← Back to list
          </button>
          <h2 class="gallery-view-title">{{ viewingGallery.title }}</h2>
        </div>
        <div v-if="viewingGalleryImages.length" class="gallery-view-grid">
          <img
            v-for="(url, i) in viewingGalleryImages"
            :key="i"
            :src="url"
            :alt="`${viewingGallery.title} – ${i + 1}`"
            class="gallery-view-img"
            loading="lazy"
            role="button"
            tabindex="0"
            @click="openGalleryLightbox(i)"
            @keydown.enter="openGalleryLightbox(i)"
            @keydown.space.prevent="openGalleryLightbox(i)"
          />
        </div>
        <p v-else class="no-items-message">No images in this gallery.</p>
        <!-- Lightbox -->
        <Teleport to="body">
          <div
            v-if="galleryLightboxIndex !== null"
            class="gallery-lightbox-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed image"
            @click.self="closeGalleryLightbox"
          >
            <button type="button" class="gallery-lightbox-close" aria-label="Close" @click="closeGalleryLightbox">
              Exit
            </button>
            <img
              v-if="viewingGalleryImages[galleryLightboxIndex]"
              :src="viewingGalleryImages[galleryLightboxIndex]"
              :alt="`${viewingGallery.title} – ${galleryLightboxIndex + 1}`"
              class="gallery-lightbox-img"
              @click.stop
            />
          </div>
        </Teleport>
      </div>
      <div v-else class="showcase-grid-wrapper">
        <div v-if="filteredItems.length === 0" class="no-items-message">
          {{ typeFilter === 'all' ? 'No items yet.' : typeFilter === 'gallery' ? 'No galleries.' : 'No sites.' }}
          <button type="button" class="link-button" @click="openCreateModal()">Add one</button>
        </div>
        <div v-else class="showcase-grid">
          <article
            v-for="item in filteredItems"
            :key="item.id"
            class="showcase-card"
          >
            <div class="showcase-card-preview">
              <!-- Site: iframe preview -->
              <template v-if="item.type === 'site'">
                <iframe
                  :title="`Preview: ${item.title}`"
                  :srcdoc="previewHtml(item.htmlContent ?? '')"
                  sandbox="allow-same-origin"
                  class="preview-iframe"
                />
              </template>
              <!-- Gallery: first images in grid or placeholder -->
              <template v-else>
                <div v-if="item.imageUrls?.length" class="preview-gallery-grid">
                  <img
                    v-for="(url, i) in item.imageUrls.slice(0, 4)"
                    :key="i"
                    :src="url"
                    :alt="`${item.title} ${i + 1}`"
                    loading="lazy"
                  />
                </div>
                <div v-else class="preview-placeholder">No images</div>
              </template>
            </div>
            <div class="showcase-card-footer">
              <span :class="['type-badge', item.type]">{{ item.type === 'site' ? 'Site' : 'Gallery' }}</span>
              <h3 class="showcase-card-title">{{ item.title }}</h3>
              <p class="showcase-card-meta">{{ item.userIds.length }} client(s) · {{ item.slug }}</p>
              <a :href="getItemUrl(item.slug)" target="_blank" rel="noopener noreferrer" class="showcase-card-url">
                {{ getItemUrl(item.slug) }}
              </a>
              <div class="showcase-card-actions">
                <template v-if="item.type === 'gallery'">
                  <button type="button" class="card-btn card-btn-primary" @click="openGalleryView(item)">
                    View
                  </button>
                </template>
                <a
                  v-else
                  :href="getItemUrl(item.slug)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="card-btn card-btn-primary"
                >
                  View
                </a>
                <button type="button" class="card-btn card-btn-danger" @click="deleteItem(item)">
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Create modal -->
      <Teleport to="body">
        <div v-if="showCreate" class="add-item-modal-theme" :data-theme="dashboardTheme">
        <div class="modal-overlay" @click.self="closeCreateModal">
          <div class="modal-card" role="dialog" aria-labelledby="modal-title" aria-modal="true">
            <header class="modal-header">
              <div class="modal-header-top">
                <h2 id="modal-title" class="modal-title">Add to showcase</h2>
                <button type="button" class="modal-close" aria-label="Close" @click="closeCreateModal">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <p class="modal-step-indicator">Step {{ createStep }} of {{ CREATE_STEPS }}</p>
            </header>
            <form class="modal-form" @submit.prevent="submitCreate">
              <div class="modal-body">
                <div v-if="createError" class="alert alert-error" role="alert">
                  {{ createError }}
                </div>

                <!-- Step 1: Type -->
                <section v-show="createStep === 1" class="form-section form-step">
                  <h3 class="form-section-title">What are you adding?</h3>
                  <div class="type-options">
                    <button
                      type="button"
                      :class="['type-option', { active: createType === 'site' }]"
                      @click="createType = 'site'"
                    >
                      <span class="type-option-icon">◉</span>
                      <span class="type-option-label">Website</span>
                      <span class="type-option-desc">HTML page or demo</span>
                    </button>
                    <button
                      type="button"
                      :class="['type-option', { active: createType === 'gallery' }]"
                      @click="createType = 'gallery'"
                    >
                      <span class="type-option-icon">▣</span>
                      <span class="type-option-label">Gallery</span>
                      <span class="type-option-desc">Multiple photos</span>
                    </button>
                  </div>
                </section>

                <!-- Step 2: Details -->
                <section v-show="createStep === 2" class="form-section form-step">
                  <h3 class="form-section-title">Details</h3>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="item-title">Title</label>
                      <input
                        id="item-title"
                        v-model="createTitle"
                        type="text"
                        required
                        placeholder="e.g. Wedding gallery"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label for="item-slug">URL slug</label>
                      <input
                        id="item-slug"
                        v-model="createSlug"
                        type="text"
                        placeholder="wedding-gallery"
                        class="form-input"
                        @focus="createSlugTouched = true"
                      />
                      <span class="form-hint">{{ getItemUrl(createSlug.trim() || 'slug') }}</span>
                    </div>
                  </div>
                </section>

                <!-- Step 3: Content (HTML or Gallery images) -->
                <section v-show="createStep === 3" class="form-section form-step">
                  <h3 v-if="createType === 'site'" class="form-section-title">HTML content</h3>
                  <h3 v-else class="form-section-title">Gallery images</h3>
                  <template v-if="createType === 'site'">
                    <div class="form-group">
                      <textarea
                        id="item-html"
                        v-model="createHtml"
                        rows="6"
                        placeholder="<h1>Hello</h1><p>Your content.</p>"
                        class="form-textarea"
                      />
                    </div>
                  </template>
                  <template v-else>
                    <p class="form-hint form-hint-block">Add images by uploading or pasting URLs. You can add multiple.</p>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/*"
                      class="sr-only"
                      aria-label="Upload image"
                      @change="onFileSelected"
                    />
                    <div class="image-upload-row">
                      <button
                        type="button"
                        class="btn-upload"
                        :disabled="uploadLoading"
                        @click="triggerUpload"
                      >
                        {{ uploadLoading ? 'Uploading…' : 'Upload image' }}
                      </button>
                      <span class="form-hint-inline">or add URL:</span>
                    </div>
                    <div class="form-group form-group-inline">
                      <input
                        id="item-image"
                        v-model="createImageUrlInput"
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        class="form-input"
                        @keydown.enter.prevent="addImageByUrl()"
                      />
                      <button type="button" class="btn-secondary" @click="addImageByUrl()">Add URL</button>
                    </div>
                    <p v-if="uploadError" class="alert alert-warning">{{ uploadError }}</p>
                    <div v-if="createImageUrls.length" class="gallery-list">
                      <div v-for="(url, idx) in createImageUrls" :key="idx" class="gallery-list-item">
                        <img :src="url" alt="" class="gallery-list-thumb" />
                        <button type="button" class="gallery-list-remove" title="Remove" @click="removeGalleryImage(idx)">×</button>
                      </div>
                    </div>
                  </template>
                </section>

                <!-- Step 4: Share with clients -->
                <section v-show="createStep === 4" class="form-section form-step">
                  <h3 class="form-section-title">Share with clients</h3>
                  <p class="form-section-desc">Only these users (and admins) can open the link.</p>
                  <div class="form-group">
                    <input
                      v-model="userSearchQuery"
                      type="search"
                      placeholder="Search by email or username…"
                      class="form-input user-search-input"
                      aria-label="Search users"
                    />
                  </div>
                  <div class="user-checkboxes">
                    <label v-for="u in filteredUsersForAssign" :key="u.id" class="checkbox-label">
                      <input
                        type="checkbox"
                        :checked="createUserIds.includes(u.id)"
                        @change="toggleUserForCreate(u.id)"
                      />
                      {{ u.email }}
                    </label>
                    <p v-if="filteredUsersForAssign.length === 0" class="user-search-empty">No users match.</p>
                  </div>
                </section>
              </div>
              <footer class="modal-footer">
                <div class="footer-buttons">
                  <button type="button" class="btn-cancel" @click="closeCreateModal">
                    Cancel
                  </button>
                  <button
                    v-if="createStep > 1"
                    type="button"
                    class="btn-back"
                    @click="prevStep"
                  >
                    Back
                  </button>
                  <button
                    v-if="createStep < CREATE_STEPS"
                    type="button"
                    class="btn-next"
                    @click="nextStep"
                  >
                    Next step
                  </button>
                  <button
                    v-if="createStep === CREATE_STEPS"
                    type="submit"
                    class="btn-submit"
                    :disabled="createSaving"
                  >
                    {{ createSaving ? 'Adding…' : 'Create' }}
                  </button>
                </div>
              </footer>
            </form>
          </div>
        </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<style scoped>
.showcase-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 100%;
}

.view-placeholder {
  margin: 0;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.showcase-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.showcase-intro {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--dashboard-text-muted);
  max-width: 56ch;
}

.showcase-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: var(--dashboard-hover, #f1f3f5);
  border-radius: 8px;
}

.tab {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dashboard-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tab:hover {
  color: var(--dashboard-text);
}

.tab.active {
  background: var(--dashboard-card, #fff);
  color: var(--dashboard-accent, #1971c2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.btn-primary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-accent);
  background: var(--dashboard-accent);
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-border);
  background: var(--dashboard-card);
  color: var(--dashboard-text);
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--dashboard-hover);
}

.loading-message {
  padding: 1rem;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.panel-error {
  margin: 0;
  padding: 1rem;
  color: #c00;
  font-size: 0.9375rem;
}

.showcase-grid-wrapper {
  width: 100%;
}

.gallery-view-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.btn-back-to-list {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dashboard-accent);
  background: transparent;
  border: 1px solid var(--dashboard-accent);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.btn-back-to-list:hover {
  color: #fff;
  background: var(--dashboard-accent);
}

.gallery-view-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dashboard-text);
}

.gallery-view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.gallery-view-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  background: var(--dashboard-border);
}

.gallery-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.gallery-lightbox-close {
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

.gallery-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.gallery-lightbox-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.showcase-card {
  aspect-ratio: 1;
  background: var(--dashboard-card, #fff);
  border: 1px solid var(--dashboard-border, #e9ecef);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.showcase-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--dashboard-accent, #1971c2);
}

.showcase-card-preview {
  flex: 1;
  min-height: 0;
  background: var(--dashboard-hover, #f1f3f5);
  position: relative;
  overflow: hidden;
}

.preview-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  min-width: 200%;
  min-height: 200%;
  border: none;
  pointer-events: none;
  transform: scale(0.5);
  transform-origin: top left;
}

.preview-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-gallery-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
}

.preview-gallery-grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: var(--dashboard-text-muted);
}

.showcase-card-footer {
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.type-badge {
  display: inline-block;
  width: fit-content;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.type-badge.site {
  background: var(--dashboard-accent-bg, #e7f5ff);
  color: var(--dashboard-accent, #1971c2);
}

.type-badge.gallery,
.type-badge.photo {
  background: #f3e8ff;
  color: #7c3aed;
}

.showcase-card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dashboard-text, #212529);
  line-height: 1.3;
}

.showcase-card-meta {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--dashboard-text-muted, #666);
}

.showcase-card-url {
  font-size: 0.75rem;
  color: var(--dashboard-accent, #1971c2);
  word-break: break-all;
  text-decoration: none;
  background: transparent;
  transition: color 0.15s;
}

.showcase-card-url:hover {
  color: #0d5aa7;
  background: transparent;
}

.showcase-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--dashboard-border, #e9ecef);
}

.card-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.card-btn-primary {
  background: var(--dashboard-accent, #1971c2);
  color: #fff;
  border-color: var(--dashboard-accent, #1971c2);
}

.card-btn-primary:hover {
  opacity: 0.9;
}

.card-btn-danger {
  background: transparent;
  color: var(--dashboard-text-muted, #666);
  border-color: var(--dashboard-border, #dee2e6);
}

.card-btn-danger:hover {
  color: #c00;
  border-color: #c00;
}

.no-items-message {
  padding: 2rem;
  text-align: center;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.link-button {
  margin-left: 0.5rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--dashboard-accent);
  font-size: inherit;
  cursor: pointer;
  text-decoration: underline;
}

.link-button:hover {
  color: #0d5aa7;
}

.add-item-modal-theme {
  --dashboard-bg: #f8f9fa;
  --dashboard-card: #fff;
  --dashboard-border: #e9ecef;
  --dashboard-text: #212529;
  --dashboard-text-muted: #495057;
  --dashboard-accent: #1971c2;
  --dashboard-accent-bg: #e7f5ff;
  --dashboard-hover: #f1f3f5;
  --dashboard-input-bg: #fff;
  --dashboard-input-border: #dee2e6;
}

.add-item-modal-theme[data-theme='dark'] {
  --dashboard-bg: #0f0f0f;
  --dashboard-card: #1a1a1a;
  --dashboard-border: #2a2a2a;
  --dashboard-text: #e4e4e4;
  --dashboard-text-muted: #a0a0a0;
  --dashboard-accent: #58a6ff;
  --dashboard-accent-bg: #1a2d4a;
  --dashboard-hover: #252525;
  --dashboard-input-bg: #252525;
  --dashboard-input-border: #3a3a3a;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  animation: overlayIn 0.2s ease-out;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: var(--dashboard-card, #fff);
  color: var(--dashboard-text, #1a1a1a);
  border-radius: 16px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);
  animation: modalIn 0.25s ease-out;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.modal-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--dashboard-border, #eee);
  background: var(--dashboard-card, #fff);
}

.modal-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-step-indicator {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--dashboard-text-muted, #666);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dashboard-text, #1a1a1a);
  letter-spacing: -0.02em;
}

.form-step {
  margin-bottom: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--dashboard-text-muted, #666);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.modal-close:hover {
  background: var(--dashboard-hover, #f0f0f0);
  color: var(--dashboard-text, #1a1a1a);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.alert-warning {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section-title {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dashboard-text-muted, #666);
}

.form-section-desc {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  color: var(--dashboard-text-muted, #666);
}

.type-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 1rem;
  border: 2px solid var(--dashboard-border, #e5e5e5);
  border-radius: 12px;
  background: var(--dashboard-card, #fff);
  color: var(--dashboard-text-muted, #666);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
}

.type-option:hover {
  border-color: var(--dashboard-accent, #2563eb);
  background: var(--dashboard-accent-bg, #eff6ff);
  color: var(--dashboard-accent, #2563eb);
}

.type-option.active {
  border-color: var(--dashboard-accent, #2563eb);
  background: var(--dashboard-accent-bg, #eff6ff);
  color: var(--dashboard-accent, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.type-option-icon {
  font-size: 1.25rem;
  opacity: 0.9;
}

.type-option-label {
  font-weight: 600;
  color: inherit;
}

.type-option-desc {
  font-size: 0.75rem;
  opacity: 0.85;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0;
}

.form-group + .form-group {
  margin-top: 1rem;
}

.form-group-inline {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.form-group-inline .form-input {
  flex: 1;
}

.form-hint-block {
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
}

.gallery-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.gallery-list-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--dashboard-border, #e5e5e5);
}

.gallery-list-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-list-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.gallery-list-remove:hover {
  background: #c00;
}

.form-section .form-group:first-of-type {
  margin-top: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dashboard-text, #1a1a1a);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 10px;
  border: 1px solid var(--dashboard-input-border, #e0e0e0);
  background: var(--dashboard-input-bg, #fff);
  color: var(--dashboard-text, #1a1a1a);
  font-size: 0.9375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--dashboard-accent, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.form-textarea {
  font-family: ui-monospace, 'SF Mono', monospace;
  resize: vertical;
  min-height: 120px;
}

.form-hint {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--dashboard-text-muted, #737373);
  word-break: break-all;
}

.form-hint-inline {
  font-size: 0.8125rem;
  color: var(--dashboard-text-muted, #737373);
}

.image-upload-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.btn-upload {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 2px dashed var(--dashboard-border, #d4d4d4);
  background: var(--dashboard-hover, #f5f5f5);
  color: var(--dashboard-text-muted, #666);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.btn-upload:hover:not(:disabled) {
  border-color: var(--dashboard-accent, #2563eb);
  background: var(--dashboard-accent-bg, #eff6ff);
  color: var(--dashboard-accent, #2563eb);
}

.btn-upload:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.image-preview-wrap {
  margin-top: 0.75rem;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--dashboard-border, #e5e5e5);
  max-height: 160px;
  background: var(--dashboard-hover, #f5f5f5);
}

.image-preview {
  width: 100%;
  height: auto;
  max-height: 160px;
  object-fit: contain;
  display: block;
}

.user-search-input {
  margin-bottom: 0.5rem;
}

.user-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-height: 140px;
  overflow-y: auto;
  padding: 0.75rem;
  background: var(--dashboard-hover, #f5f5f5);
  border-radius: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0;
}

.checkbox-label input {
  margin: 0;
  width: 1rem;
  height: 1rem;
}

.user-search-empty {
  margin: 0;
  padding: 0.25rem 0;
  font-size: 0.8125rem;
  color: var(--dashboard-text-muted, #737373);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--dashboard-border, #eee);
  background: var(--dashboard-card, #fff);
  flex-shrink: 0;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--dashboard-border, #e0e0e0);
  background: var(--dashboard-card, #fff);
  color: var(--dashboard-text-muted, #666);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn-cancel:hover {
  background: var(--dashboard-hover, #f5f5f5);
  color: var(--dashboard-text, #1a1a1a);
}

.btn-back {
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--dashboard-border, #e0e0e0);
  background: var(--dashboard-card, #fff);
  color: var(--dashboard-text, #1a1a1a);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn-back:hover {
  background: var(--dashboard-hover, #f5f5f5);
  border-color: var(--dashboard-text-muted, #999);
}

.btn-next {
  padding: 0.625rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: var(--dashboard-accent, #2563eb);
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.btn-next:hover {
  opacity: 0.95;
}

.btn-submit {
  padding: 0.625rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: var(--dashboard-accent, #2563eb);
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
