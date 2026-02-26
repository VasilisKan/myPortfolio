import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'

function rewriteCookiesForProxy(proxyRes: { headers: Record<string, string | string[] | undefined> }) {
  const setCookie = proxyRes.headers['set-cookie']
  if (!setCookie) return
  proxyRes.headers['set-cookie'] = (Array.isArray(setCookie) ? setCookie : [setCookie]).map((c: string) =>
    c
      .replace(/;\s*Domain=[^;]+/gi, '')
      .replace(/;\s*Secure/gi, '')
      .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
      .replace(/\s*;\s*$/, '')
  )
}
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            rewriteCookiesForProxy(proxyRes)
          })
        },
      },
      '/ticket': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            rewriteCookiesForProxy(proxyRes)
          })
        },
      },
    },
  },
})
