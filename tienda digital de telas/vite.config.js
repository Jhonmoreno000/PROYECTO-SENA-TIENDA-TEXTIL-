import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: false,
    open: true,
    allowedHosts: true,
    proxy: {
      '/uploads': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('react-globe.gl')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/gsap') || id.includes('@gsap/react')) {
            return 'gsap-vendor';
          }
          if (id.includes('node_modules/recharts')) {
            return 'recharts-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
})

