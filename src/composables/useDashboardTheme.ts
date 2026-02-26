import { ref } from 'vue';

const STORAGE_KEY = 'dashboard-theme';

export type DashboardTheme = 'light' | 'dark';

function getStoredTheme(): DashboardTheme {
  if (typeof localStorage === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as DashboardTheme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return 'light';
}

const theme = ref<DashboardTheme>(getStoredTheme());

export function useDashboardTheme() {
  function setTheme(value: DashboardTheme) {
    theme.value = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light');
  }

  return { theme, setTheme, toggleTheme };
}
