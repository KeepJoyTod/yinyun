import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5200,
    proxy: {
      '/client': {
        target: process.env.VITE_PROXY_TARGET ?? 'https://api.evanshine.me',
        changeOrigin: true,
      },
    },
  },
})
