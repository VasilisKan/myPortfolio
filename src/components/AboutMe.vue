<script setup>
import * as L from 'leaflet'
import mapboxgl from 'mapbox-gl'          
import 'leaflet/dist/leaflet.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'mapbox-gl-leaflet'               
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false
    }).setView([39.0742, 21.8243], 3.5)

    const glLayer = L.mapboxGL({
      style: 'mapbox://styles/vasiliskan01/cm9g7m9q300l301qu9fnl9tn2', 
      accessToken: 'pk.eyJ1IjoidmFzaWxpc2thbjAxIiwiYSI6ImNtOWc3aG1pODA5ZjYyanNobXowc3h6MmUifQ.kI_E7JgPGzAdcrYoY86v0g'
    })
    glLayer.addTo(map)

    const dotIcon = L.divIcon({
      className: 'custom-dot',
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    })
    L.marker([39.0742, 21.8243], { icon: dotIcon }).addTo(map)
  })
})
</script>


<template>
  <div class="about-me-container">
    <div class="aboutMeWrapper">
    <h2 class="aboutTitle">But who is <span>Vassilis..</span></h2>
    <p class="aboutMeText">
      I am a full-stack developer with over three years of hands-on experience in designing, developing, and delivering reliable software solutions. My work spans both backend systems and modern frontend frameworks, with a strong focus on performance, uptime, and security. In previous roles, I automated ERP integrations, optimized GPS logistics, and built scalable applications using technologies such as React, Node.js, Python, MySQL, and Azure.
    </p>
    <p class="aboutMeText">
      In my free time, I work on personal full-stack projects that aim to solve real problems through practical solutions. I value continuous learning and effective collaboration to address my everyday challenges.
    </p>
  </div>
  <div class="aboutMe-Widgets">
    <!-- Left Column: Map -->
    <div class="globe-wrapper section-box">
      <!-- New section title for Map -->
      <h3 class="section-title">Located in </h3>
      <div class="map-header">
        <span class="dot"></span>
        Greece
      </div>
      <div id="map"></div>
    </div>

    <!-- Right Column: Personal Details -->
    <div class="personalDetails section-box">
      <!-- New section title for Personal Details -->
      <h3 class="section-title">Personal Details</h3>
      <div class="section-header">Personal Details</div>
      <ul class="details-list">
        <li><strong>Name:</strong> Vassilis Kanellos</li>
        <li><strong>Role:</strong> Full-Stack Developer</li>
        <li><strong>Location:</strong> Greece</li>
        <li><strong>Experience:</strong> 3+ years</li>
      </ul>
    </div>
  </div>  
  </div>
</template>

<style scoped>
.about-me-container{
  border-top: 1px solid #ffffff22;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.aboutMeWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;

}

/* Main title styles */
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

/* About me paragraph texts */
.aboutMeText {
  margin: 0 20px;
  text-align: left;
  font-size: 18px;
  color: #e0e0e0;
  font-weight: 400;
  line-height: 1.6;
  padding-bottom: 30px;
}

/* Widgets wrapper: holds the map and personal details sections */
.aboutMe-Widgets {
  margin: 40px 0;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  flex-wrap: wrap;
}

/* Box styles for each section in the widgets area */
.section-box {
  flex: 1;
  background-color: #0d0d0d;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 3px rgba(255, 255, 255, 0.08);
  padding-bottom: 20px;
}

/* Header for sections inside the boxes */
.section-header {
  color: #e0e0e0;
  font-size: 16px;
  padding: 12px 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background-color: #101010;
}

/* List style for personal details */
.details-list {
  padding: 16px;
  list-style: none;
  color: #ccc;
  font-size: 14px;
  line-height: 1.8;
}

/* Map header (includes the colored dot and location text) */
.map-header {
  color: #e0e0e0;
  font-size: 14px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-weight: 500;
}

/* Map container styling */
#map {
  width: 100%;
  height: 300px;
  border-radius: 0 0 14px 14px;
  background-color: #0d0d0d;
}

/* Styles for the small colored dot in the map header */
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #00c9ff;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(0, 201, 255, 0.7);
}

/* Custom marker styling for the map's pin */
.custom-dot {
  background-color: #00c9ff;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

/* New Section Titles for each container with a low opacity underline */
.section-title {
  font-size: 20px;
  font-weight: 600;
  position: relative;
  margin: 16px 20px;
  color: #e0e0e0;
}
.section-title::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 50px;
  height: 2px;
  background-color: currentColor;
  opacity: 0.3;
}
</style>