import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Ganti ke 127.0.0.1
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Remove /api prefix
      }
    }
  }
})