<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUsersStore } from '@/stores/usersStore'

const { user } = useAuth()
const usersStore = useUsersStore()

const isAdmin = computed(() => !!user.value?.isAdmin)
const searchQuery = ref('')

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return usersStore.users
  return usersStore.users.filter((u) => {
    if (u.email.toLowerCase().includes(q)) return true
    if (u.username?.toLowerCase().includes(q)) return true
    if ((u.isAdmin ? 'admin' : 'user').includes(q)) return true
    return false
  })
})

function formatDate(value: string | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  const dateStr = d.toLocaleDateString(undefined, { dateStyle: 'short' })
  const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `${dateStr} ${timeStr}`
}

onMounted(() => {
  if (isAdmin.value) {
    usersStore.loadAllUsers()
  }
})
</script>

<template>
  <div class="users-view">
    <template v-if="!isAdmin">
      <p class="view-placeholder">You need admin access to view users.</p>
    </template>

    <template v-else>
      <div class="filters-wrapper">
        <div class="filter-group">
          <label for="users-search">Search</label>
          <input
            id="users-search"
            v-model="searchQuery"
            type="search"
            placeholder="Username, email or role..."
            class="search-input"
          />
        </div>
      </div>

      <div v-if="usersStore.loading" class="loading-message">Loading users…</div>
      <p v-else-if="usersStore.error" class="panel-error">{{ usersStore.error }}</p>
      <div v-else class="table-container">
        <div v-if="filteredUsers.length === 0" class="no-users-message">
          {{ searchQuery.trim() ? 'No users match your search.' : 'No users found.' }}
        </div>
        <table v-else class="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, index) in filteredUsers" :key="u.id">
              <td>{{ index + 1 }}</td>
              <td>{{ u.username ?? '—' }}</td>
              <td>{{ u.email }}</td>
              <td>
                <span :class="['role-badge', { 'role-admin': u.isAdmin }]">
                  {{ u.isAdmin ? 'Admin' : 'User' }}
                </span>
              </td>
              <td>{{ formatDate(u.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.users-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 100%;
}

.view-placeholder {
  margin: 0;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.filters-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--dashboard-card);
  border: 1px solid var(--dashboard-border);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: var(--dashboard-text-muted);
  font-weight: 500;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--dashboard-input-border);
  background: var(--dashboard-input-bg);
  color: var(--dashboard-text);
  font-size: 0.875rem;
  min-width: 220px;
}

.search-input:focus {
  outline: none;
  border-color: var(--dashboard-accent);
}

.loading-message {
  padding: 1rem;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

.panel-error {
  margin: 0;
  padding: 1rem;
  color: #c00;
  font-size: 0.9375rem;
}

.table-container {
  background: var(--dashboard-card);
  border: 1px solid var(--dashboard-border);
  border-radius: 8px;
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.users-table th,
.users-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--dashboard-border);
  color: var(--dashboard-text);
}

.users-table th {
  background: var(--dashboard-hover);
  color: var(--dashboard-text-muted);
  font-weight: 600;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.users-table tbody tr:hover {
  background: var(--dashboard-hover);
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--dashboard-accent-bg);
  color: var(--dashboard-accent);
}

.role-badge.role-admin {
  background: rgba(130, 223, 139, 0.2);
  color: #2d8a3e;
}

.no-users-message {
  padding: 2rem;
  text-align: center;
  color: var(--dashboard-text-muted);
  font-size: 0.9375rem;
}

@media (max-width: 768px) {
  .search-input {
    min-width: 0;
    width: 100%;
  }
}
</style>
