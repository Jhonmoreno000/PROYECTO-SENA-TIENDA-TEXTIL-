import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: './',
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
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@studio-freight/lenis') || id.includes('node_modules/lenis')) {
            return 'lenis-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    cssMinify: 'esbuild',
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: false,
    sourcemap: false,
    reportCompressedSize: false,
  },
})

