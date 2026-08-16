import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'kinipos_logo.png',
        'robots.txt',
        'apple-touch-icon.png',
        'bell.png',
        'bin.png',
        'calendar.png',
        'cash.png',
        'cashier-machine.png',
        'check.png',
        'edit.png',
        'logout.png',
        'menu.png',
        'no-sound.png',
        'omset.png',
        'qr-code.png',
        'search-interface-symbol.png',
        'settings.png',
        'shopping-cart.png',
        'sounds.png',
        'streetbooth.jpg',
        'volume.png',
        'wallet.png',
        'whatsapp.png'
      ],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,mp3,wav}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-media-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
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
