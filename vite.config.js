import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-update the service worker silently on new deployment
      registerType: 'autoUpdate',
      
      // Inject the service worker registration into index.html
      injectRegister: 'auto',

      // Tell workbox which files to precache
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        
        // Network-first for navigation (ensures fresh HTML on every visit)
        navigationPreload: true,
        runtimeCaching: [
          {
            // API calls — always network, no caching
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // JS/CSS assets — cache-first (they have hashed filenames)
            urlPattern: /\.(?:js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leka-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Fonts — long-lived cache
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },

      // Web App Manifest
      manifest: {
        name: 'Leka POS',
        short_name: 'Leka POS',
        description: 'Leka Point of Sale — fast billing for your business',
        theme_color: '#5F259F',
        background_color: '#EFF4F8',
        display: 'standalone',        // Full-screen, no browser chrome
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // Dev options — enable PWA in development for testing
      devOptions: {
        enabled: true,   // set to true temporarily to test SW in dev
        type: 'module',
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
})
