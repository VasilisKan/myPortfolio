<script lang="ts" setup>
import { useRoute, RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTicket } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(faTicket)

const route = useRoute()
const isTicketsTab = () => route.path === '/dashboard'
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <img src="../assets/logoMainTransparent.webp" alt="Logo" />
    </div>
    <nav class="sidebar-nav">
      <RouterLink to="/dashboard" class="nav-item nav-link" :class="{ active: isTicketsTab() }">
        <font-awesome-icon :icon="['fas', 'ticket']" class="nav-icon" />
        <span>My tickets</span>
      </RouterLink>
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
  transition: background 0.15s, color 0.15s;
}

.nav-item.active {
  background: var(--dashboard-accent-bg);
  color: var(--dashboard-accent);
}

.nav-link {
  text-decoration: none;
  cursor: pointer;
}

.nav-link:hover {
  background: var(--dashboard-hover);
  color: var(--dashboard-text);
}

.nav-icon {
  font-size: 1rem;
  width: 1.25rem;
  opacity: 0.85;
}
</style>
