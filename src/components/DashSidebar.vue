<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTicket, faCalendar, faUser, faHome, faCog, faImages } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faTicket, faCalendar, faUser, faHome, faCog, faImages);

export default {
  name: 'DashboardSidebar',
  components: { FontAwesomeIcon },
  emits: ['update-active'],
  data() {
    return {
      activeItem: 'Dashboard',
      items: [
        { name: 'Dashboard', icon: ['fas', 'calendar'] },
        { name: 'Tickets', icon: ['fas', 'ticket'] },
        { name: 'Users', icon: ['fas', 'user'] },
        { name: 'Showcase', icon: ['fas', 'images'] },
        { name: 'Settings', icon: ['fas', 'cog'] },
      ],
    };
  },
  methods: {
    setActive(itemName: string) {
      this.activeItem = itemName;
      this.$emit('update-active', itemName);
    },
  },
};
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <img src="../assets/logoMainTransparent.webp" alt="Logo" />
    </div>
    <nav class="sidebar-nav">
      <button
        v-for="item in items"
        :key="item.name"
        type="button"
        :class="['nav-item', { active: activeItem === item.name }]"
        @click="setActive(item.name)"
      >
        <font-awesome-icon :icon="item.icon" class="nav-icon" />
        <span>{{ item.name }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.25rem 0;
}

.sidebar-logo {
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid var(--dashboard-border);
  margin-bottom: 1rem;
}

.sidebar-logo img {
  width: 56px;
  height: auto;
  display: block;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: var(--dashboard-hover);
  color: var(--dashboard-text);
}

.nav-item.active {
  background: var(--dashboard-accent-bg);
  color: var(--dashboard-accent);
}

.nav-icon {
  font-size: 1rem;
  width: 1.25rem;
  opacity: 0.85;
}
</style>
