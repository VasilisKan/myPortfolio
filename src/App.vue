<script setup lang="ts">
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import Homepage from './pages/Homepage.vue';
</script>

<template>
  <header class="header">
    <Header />
  </header>
  <div class="topGradient">
    <img src="./assets/gradient.webp" alt="" />
  </div>
  <Sidebar />
  <main class="main">
    <div class="main-wrapper">
      <Homepage />
    </div>
  </main>
  <footer class="footer">
    <p>© 2025 Vasilis Kanellos. All rights reserved.</p>
    <p>Designed and developed by Vasilis Kanellos</p>
    <div class="bottomGradient">
      <img src="./assets/gradient.webp" alt="" />
    </div>
  </footer>
</template>

<style>
html,
body {
  margin: 0;
  width: 100vw;
  overflow-x: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  width: 100%;
  max-width: min(70%, 1200px);
  margin: 0 auto;
}

/* These rules affect the main layout */
.header,
.main,
.footer {
  width: 100%;
}

.main {
  margin-top: 130px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: 100px;
  position: relative;
  color: aliceblue;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.topGradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1;
}

.topGradient img {
  width: 100%;
  object-fit: cover;
  pointer-events: none;
  display: block;
}

.bottomGradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: -1;
  transform: rotate(180deg);
}

.bottomGradient img {
  width: 100%;
  object-fit: cover;
  pointer-events: none;
  display: block;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  #app {
    max-width: 100%;
    padding: 0 25px;
  }



  .main {
    margin-top: 80px;
  }

  .footer {
    margin-top: 50px;
    padding: 15px;
    text-align: center;
  }

  .sidebar {
    display: none;
  }
}
</style>
