<script setup lang="ts">
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'mapbox-gl-leaflet'
import { onMounted, nextTick } from 'vue'

import macbook      from './../assets/equipmentPhoto/macbook.webp'
import iphone       from './../assets/equipmentPhoto/iphone14plus.webp'
import mxmaster     from './../assets/equipmentPhoto/mxmaster3s.webp'
import mxmechanical from './../assets/equipmentPhoto/mxmechanicalmini.webp'

// ← Make sure you have defined this in .env.local as VITE_MAPBOX_TOKEN
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

onMounted(() => {
  nextTick(() => {
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false
    }).setView([38.2466, 21.7346], 3.4)

    // pass the token via the `accessToken` property:
    const glLayer = (L as any).mapboxGL({
      style:  'mapbox://styles/vasiliskan01/cm9g7rm1100me01s4b0lh7yg0',
      accessToken: MAPBOX_TOKEN
    })
    glLayer.addTo(map)

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
      iconSize:   [14, 14],
      iconAnchor: [7, 7]
    })

    L.marker([38.2466, 21.7346], { icon: dotIcon }).addTo(map)
  })
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
      <!-- Left Column: Map -->
      <div class="widget-container">
        <div class="section-header">
          <span class="dot"></span>
          Greece - Patras
        </div>
        <div id="map" class="widget-content"></div>
      </div>

      <!-- Right Column: Equipment -->
      <div class="widget-container">
        <div class="section-header">My Equipment</div>
        <div class="widget-content equipment-grid">
          <div class="equipment-item">
            <img :src="macbook" alt="MacBook Air M3" class="equipment-image" />
            <div class="equipment-info">
              <h3>MacBook Air M3</h3>
            </div>
          </div>
          <div class="equipment-item">
            <img :src="iphone" alt="iPhone 14 Plus" class="equipment-image" />
            <div class="equipment-info">
              <h3>iPhone 14 Plus</h3>
            </div>
          </div>
          <div class="equipment-item">
            <img :src="mxmechanical" alt="Logitech MX Mechanical" class="equipment-image" />
            <div class="equipment-info">
              <h3>MX Mechanical</h3>
            </div>
          </div>
          <div class="equipment-item">
            <img :src="mxmaster" alt="Logitech MX Master 3S" class="equipment-image" />
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
  margin-bottom: 40px;
}

.aboutTitle {
  margin: 40px 20px;
  text-align: center;
  font-size: 32px;
  color: #e0e0e0;
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
  margin: 0.4rem auto 0;
  width: 60px;
  height: 2px;
  background-color: #ffffff22;
}

.aboutMeText {
  text-align: left;
  font-size: 18px;
  color: #e0e0e0;
  font-weight: 400;
  line-height: 1.6;
  padding-bottom: 30px;
  max-width: 800px;
}

.aboutMe-Widgets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.widget-container {
  background-color: #0d0d0d;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 3px rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  height: 380px;
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

#map {
  width: 100%;
  height: 100%;
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
    font-size: 28px;
  }
  
  .aboutMe-Widgets {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .widget-container {
    height: 350px;
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
    height: 320px;
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