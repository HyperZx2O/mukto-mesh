import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    // ponytail: SW generation disabled — workbox's path parser chokes on apostrophes
    // in the project directory name ('26 July Hackathon). SW will be re-enabled in
    // Phase 9 after the project is moved to a path without special characters.
    VitePWA({
      registerType: 'autoUpdate',
      selfDestroying: true,
      manifest: {
        name: 'Mukto Mesh',
        short_name: 'MuktoMesh',
        description: 'Stay connected when they cut the cord.',
        theme_color: '#006A4E',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/ws': { target: 'ws://localhost:3000', ws: true }
    }
  }
})
