<script lang="ts" setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import DashboardSidebar from './../components/DashSidebar.vue';
import DashboardView from './../components/views/DashboardView.vue';
import TicketsView from './../components/views/TicketsView.vue';
import UsersView from './../components/views/UsersView.vue';
import ShowcaseView from './../components/views/ShowcaseView.vue';
import SettingsView from './../components/views/SettingsView.vue';
import { useDashboardTheme } from '@/composables/useDashboardTheme';

library.add(faSun, faMoon);

const { theme, toggleTheme } = useDashboardTheme();
const activeCategory = ref('Dashboard');

const activeComponent = computed(() => {
  switch (activeCategory.value) {
    case 'Dashboard':
      return DashboardView;
    case 'Tickets':
      return TicketsView;
    case 'Users':
      return UsersView;
    case 'Showcase':
      return ShowcaseView;
    case 'Settings':
      return SettingsView;
    default:
      return DashboardView;
  }
});
</script>

<template>
  <div class="admin-dashboard" :data-theme="theme">
    <nav class="dashboard-nav">
      <DashboardSidebar @update-active="activeCategory = $event" />
    </nav>

    <main class="dashboard-main">
      <header class="dashboard-header">
        <div class="dashboard-header-actions">
          <RouterLink to="/" class="btn-back-to-site">Back to site</RouterLink>
          <button
            type="button"
            class="theme-toggle"
            :aria-label="theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
            @click="toggleTheme"
          >
            <font-awesome-icon :icon="theme === 'light' ? ['fas', 'moon'] : ['fas', 'sun']" />
          </button>
          <div class="dashboard-user">
            <img src="./../assets/profileIcons/wolverin.webp" alt="" />
            <span>Admin</span>
          </div>
        </div>
      </header>
      <section class="dashboard-content">
        <component :is="activeComponent" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-dashboard {
  --dashboard-bg: #f8f9fa;
  --dashboard-nav: #fff;
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

.admin-dashboard[data-theme='dark'] {
  --dashboard-bg: #0f0f0f;
  --dashboard-nav: #161616;
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

.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--dashboard-bg);
}

.dashboard-nav {
  width: 220px;
  flex-shrink: 0;
  background: var(--dashboard-nav);
  border-right: 1px solid var(--dashboard-border);
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  background: var(--dashboard-nav);
  border-bottom: 1px solid var(--dashboard-border);
}

.dashboard-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-back-to-site {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dashboard-accent);
  background: transparent;
  border: 1px solid var(--dashboard-accent);
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.btn-back-to-site:hover {
  color: #fff;
  background: var(--dashboard-accent);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--dashboard-border);
  border-radius: 8px;
  background: var(--dashboard-card);
  color: var(--dashboard-text-muted);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.theme-toggle:hover {
  color: var(--dashboard-accent);
  background: var(--dashboard-hover);
  border-color: var(--dashboard-accent);
}

.dashboard-user {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: var(--dashboard-text-muted);
}

.dashboard-user img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.dashboard-content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}
</style>
