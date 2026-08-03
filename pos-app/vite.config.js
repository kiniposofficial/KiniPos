import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'kinipos_logo.png', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Kini Pos',
        short_name: 'KiniPos',
        description: 'Point of Sale (POS) Modern, Cepat, dan Handal',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'kinipos_logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'kinipos_logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'kinipos_logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
