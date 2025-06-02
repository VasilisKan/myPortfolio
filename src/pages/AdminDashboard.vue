<script lang="ts" setup>
import { ref, computed } from 'vue';
import DashboardSidebar from './../components/DashSidebar.vue';

// Import your category view components
import DashboardView from './../components/views/DashboardView.vue';
import TicketsView from './../components/views/TicketsView.vue';
import UsersView from './../components/views/UsersView.vue';
import SettingsView from './../components/views/SettingsView.vue';

const activeCategory = ref('Dashboard');

// Map active category to component
const activeComponent = computed(() => {
  switch (activeCategory.value) {
    case 'Dashboard':
      return DashboardView;
    case 'Tickets':
      return TicketsView;
    case 'Users':
      return UsersView;
    case 'Settings':
      return SettingsView;
    default:
      return DashboardView; 
  }
});
</script>
<template>
  <div class="admin-dashboard-wrapper">
    <article class="sidebar-wrapper">
      <DashboardSidebar @update-active="activeCategory = $event" />
    </article>

    <div class="dashboard-main-wrapper">
      <header class="dashboard-header">
        <h1 class="categoryName">{{ activeCategory }}</h1>
        <div class="loged-in-user">
          <img src="./../assets/profileIcons/wolverin.webp" alt="">
          <span>Super Admin</span>
        </div>
      </header>
      <component :is="activeComponent" />
    </div>
  </div>
</template>
<style scoped>  
.admin-dashboard-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #25282d;
}
.sidebar-wrapper {
  width: clamp( 250px, 20vw, 300px);
  background-color: #2e363f;
  height: 100%;
}

.dashboard-main-wrapper{
  flex:1 ;
}
.dashboard-header{
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.dashboard-main-wrapper .categoryName{
  font-size: 1.8em;
  font-weight: 700;
  color: #f0f0f0;
}
.loged-in-user{
  display: inline-flex;
  border: 1px solid #3a3f45;
  border-radius: 1em;
  align-items: center;
  gap: 10px;
  padding: 10px;
}
.loged-in-user span{
  color: white;
  font-size: 16px;
  font-weight: 700;
}
.loged-in-user img {
  width: 30px;
  height: auto;
}
</style>