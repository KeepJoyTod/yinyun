import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const releaseId = process.env.VITE_STUDIO_RELEASE_ID ?? `local-${Date.now()}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    assetsDir: `assets/${releaseId}`,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](?:vue|vue-router|@vue)[\\/]/.test(id)) return 'framework-vendor'
          return undefined
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5190,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
      '/actuator': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
