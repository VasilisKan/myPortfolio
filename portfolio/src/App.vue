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
      <img src="./assets/gradient.png" alt="">
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
    </footer>
</template>

<style>
html, body {
  margin: 0;
  width: 100vw;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  width: 100%;
  max-width: min(70%,1200px);
  margin: 0 auto;
}

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

.footer{
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
  z-index: -1;}

.topGradient img {
  width: 100%;
  object-fit: cover;
  pointer-events: none;
  display: block;
}

</style>