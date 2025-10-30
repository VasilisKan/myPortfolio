<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Keep the image imports as they are small.
import macbook from './../assets/equipmentPhoto/macbook.webp'
import iphone from './../assets/equipmentPhoto/iphone14plus.webp'
import mxmaster from './../assets/equipmentPhoto/mxmaster3s.webp'
import mxmechanical from './../assets/equipmentPhoto/mxmechanicalmini.webp'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

// A ref to hold the map container div from the template.
const mapContainer = ref<HTMLDivElement | null>(null)
const mapError = ref<string | null>(null)

let mapInitialized = false
let observer: IntersectionObserver | null = null

// This async function will now hold all our map logic.
const initializeMap = async () => {
  if (mapInitialized) return

  const container = mapContainer.value
  if (!container) {
    throw new Error('Map container missing')
  }

  mapError.value = null

  try {
    const [mapboxModule, leafletModule] = await Promise.all([
      import('mapbox-gl'),
      import('leaflet')
    ])

    const mapboxgl = (mapboxModule as any).default ?? mapboxModule
    const L = (leafletModule as any).default ?? leafletModule

    const token = MAPBOX_TOKEN?.trim()
    if (!token) {
      mapError.value = 'Map configuration missing.'
      return
    }

    mapboxgl.accessToken = token
    ;(window as any).mapboxgl = mapboxgl

    await Promise.all([
      import('leaflet/dist/leaflet.css'),
      import('mapbox-gl/dist/mapbox-gl.css'),
      import('mapbox-gl-leaflet')
    ])

    if (typeof (L as any).mapboxGL !== 'function') {
      console.warn('Leaflet MapboxGL plugin unavailable; map skipped.')
      return
    }

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true
    }).setView([38.2466, 21.7346], 3.4)

    const glLayer = (L as any).mapboxGL({
      style: 'mapbox://styles/vasiliskan01/cm9g7rm1100me01s4b0lh7yg0',
      accessToken: mapboxgl.accessToken
    })
    glLayer.addTo(map)

    map.whenReady(() => {
      setTimeout(() => {
        map.invalidateSize()
      }, 50)
    })

    const dotIcon = L.divIcon({
      html: `
        <div
          style="
            width:14px;
            height:14px;
            background:#00c9ff;
            border-radius:50%;
            border:2px solid #fff;
            box-shadow:0 0 6px rgba(0,201,255,0.7);
          "
        ></div>`,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })

    L.marker([38.2466, 21.7346], { icon: dotIcon }).addTo(map)
    mapInitialized = true
  } catch (error) {
    console.error('Failed to initialise Mapbox map:', error)
    mapError.value = 'Unable to load the map right now.'
  }
}

onMounted(() => {
  const container = mapContainer.value
  if (!container) return

  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    void initializeMap()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          void initializeMap()
          observer?.disconnect()
          observer = null
        }
      })
    },
    { rootMargin: '120px', threshold: 0.25 }
  )

  observer.observe(container)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="about-me-container" id="about">
    <div class="aboutMeWrapper">
      <h2 class="aboutTitle">But who is <span>Vassilis..</span></h2>
      <p class="aboutMeText">
        I am a full-stack developer with over three years of hands-on experience in designing, developing, and delivering reliable software solutions. My work spans both backend systems and modern frontend frameworks, with a strong focus on performance, uptime, and security. In previous roles, I automated ERP integrations, optimized logistics GPS, and built scalable applications using technologies such as React, Node.js, Python, MySQL, and Azure.
      </p>
      <p class="aboutMeText">
        In my free time, I work on personal full-stack projects that aim to solve real problems through practical solutions. I value continuous learning and effective collaboration to address my everyday challenges.
      </p>
    </div>
    <div class="aboutMe-Widgets">
      <div class="widget-container">
        <div class="section-header">
          <span class="dot"></span>
          Greece - Patras
        </div>
        <div class="widget-content map-widget">
          <div
            ref="mapContainer"
            class="map-canvas"
            aria-label="Interactive map of Patras, Greece"
            role="presentation"
          ></div>
          <p v-if="mapError" class="map-error">{{ mapError }}</p>
        </div>
      </div>

      <div class="widget-container">
        <div class="section-header">My Equipment</div>
        <div class="widget-content equipment-grid">
          <div class="equipment-item">
            <img :src="macbook" alt="MacBook Air M3" class="equipment-image" loading="lazy" decoding="async" />
            <div class="equipment-info">
              <h3>MacBook Air M3</h3>
            </div>
          </div>
          <div class="equipment-item">
            <img :src="iphone" alt="iPhone 14 Plus" class="equipment-image" loading="lazy" decoding="async" />
            <div class="equipment-info">
              <h3>iPhone 14 Plus</h3>
            </div>
          </div>
          <div class="equipment-item">
            <img :src="mxmechanical" alt="Logitech MX Mechanical" class="equipment-image" loading="lazy" decoding="async" />
            <div class="equipment-info">
              <h3>MX Mechanical</h3>
            </div>
          </div>
          <div class="equipment-item">
            <img :src="mxmaster" alt="Logitech MX Master 3S" class="equipment-image" loading="lazy" decoding="async" />
            <div class="equipment-info">
              <h3>MX Master 3S</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-me-container {
  justify-self: center;
  margin-top: 80px;
  max-width: 1200px;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  scroll-margin-top: 80px;
}

.aboutMeWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  margin-bottom: 48px;
  gap: 16px;
}

.aboutTitle {
  margin: 40px 24px 8px;
  text-align: center;
  font-size: 36px;
  color: #f2f4f8;
  font-weight: 700;
  position: relative;
}
.aboutTitle span {
  background: linear-gradient(to right, #00c9ff, #92fe9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 201, 255, 0.5);
}
.aboutTitle::after {
  content: "";
  display: block;
  margin: 0.6rem auto 0;
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, rgba(0, 201, 255, 0.4), rgba(146, 254, 157, 0.4));
}

.aboutMeText {
  text-align: left;
  font-size: 20px;
  color: #eef3f8;
  font-weight: 400;
  line-height: 1.75;
  padding-bottom: 20px;
  max-width: 840px;
}

.aboutMe-Widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 360px));
  gap: 28px;
  width: 100%;
  justify-content: center;
}

.widget-container {
  background-color: #0d0d0d;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 16px rgba(0, 201, 255, 0.08);
  display: flex;
  flex-direction: column;
  aspect-ratio: 1;
  min-height: 320px;
  max-width: 360px;
}

.section-header {
  color: #e0e0e0;
  font-size: 16px;
  padding: 12px 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background-color: #101010;
  display: flex;
  align-items: center;
  gap: 8px;
}

.widget-content {
  flex: 1;
  padding: 0;
}

.map-widget {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  height: 100%;
}

.map-canvas {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 260px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: rgba(10, 10, 10, 0.6);
}

.map-error {
  font-size: 13px;
  color: #ff9393;
}


.equipment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  height: 100%;
  overflow: auto;

}

.equipment-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.equipment-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 201, 255, 0.15);
}

.equipment-image {
  width: 100%;
  height: 80px;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  flex: 1;
}

.equipment-info {
  padding: 12px;
  background: rgba(20, 20, 20, 0.7);
  text-align: center;
}

.equipment-info h3 {
  color: #00c9ff;
  font-size: 14px;
  margin: 0;
  font-weight: 600;

}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #00c9ff;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(0, 201, 255, 0.7);
}

/* Responsive adjustments */
@media (max-width: 768px) {

  .about-me-container {
    margin-top: 60px;
    scroll-margin-top: 60px;
    justify-self: center;
    width: 100%;
    padding: 0 20px;
  }

  .aboutTitle {
    font-size: 30px;
  }

  .aboutMe-Widgets {
    grid-template-columns: 1fr;
    gap: 20px;
    justify-content: stretch;
  }

  .widget-container {
    aspect-ratio: auto;
    min-height: 340px;
    max-width: none;
  }

  .map-widget {
    padding: 12px;
  }

  .map-canvas {
    min-height: 240px;
  }

  .equipment-image {
    height: 100px;
  }
}

@media (max-width: 480px) {
  .about-me-container {
    margin-top: 40px;
    scroll-margin-top: 40px;
    justify-self: center;
    width: 100%;
    padding: 0 20px;
  }


  .aboutTitle {
    font-size: 28px;
    margin: 0px 0;
    margin-bottom: 30px;
  }

  .aboutMeText {
    font-size: 16px;
    padding-bottom: 20px;
  }

  .widget-container {
    aspect-ratio: auto;
    min-height: 300px;
    max-width: none;
  }

  .map-canvas {
    min-height: 220px;
  }

  .equipment-image {
    height: 80px;
    padding: 8px;
  }

  .equipment-info h3 {
    font-size: 13px;
  }
}
</style>
