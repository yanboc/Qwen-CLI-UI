import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4009,
    proxy: {
      '/api': {
        target: 'http://localhost:4008',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:4008',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 