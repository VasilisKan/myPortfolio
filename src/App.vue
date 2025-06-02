<script setup lang="ts">
</script>
<template>
  <main class="main">
      <router-view />
  </main>
</template>

<style>

html,
body {
  margin: 0;
  width: 100vw;
  overflow-x: hidden;
}

main{
  width: 100%;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  width: 100%;
  /* margin: 0 auto; */
}

.main {
  width: 100%;
}

</style>
