import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'logo.png', 'robots.txt'],
      manifest: {
        name: 'Mi Pueblo Cotati · Auténtica comida mexicana',
        short_name: 'Mi Pueblo',
        description: 'Auténtica comida mexicana en Sonoma & Marin desde 1997. Menú, reservas y delivery.',
        theme_color: '#AD0A09',
        background_color: '#F9F0DF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/?source=pwa',
        scope: '/',
        lang: 'es',
        dir: 'ltr',
        categories: ['food', 'lifestyle', 'business'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
        ],
        shortcuts: [
          {
            name: 'Reservar mesa',
            short_name: 'Reservar',
            description: 'Reserva una mesa en menos de 30 segundos',
            url: '/reservar?source=shortcut',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Ver menú',
            short_name: 'Menú',
            description: 'Más de 170 platillos',
            url: '/menu?source=shortcut',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Sucursales',
            short_name: 'Sucursales',
            description: '6 ubicaciones en Sonoma y Marin',
            url: '/sucursales?source=shortcut',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/assets\/.*\.(?:webp|jpg|jpeg|png|avif|svg)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mipueblo-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 }
            }
          },
          {
            urlPattern: /\/api\/public\/(menu|locations|gallery|promotions|awards|reviews)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mipueblo-api',
              networkTimeoutSeconds: 2,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'mipueblo-api-live', networkTimeoutSeconds: 5 }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: { port: 5173, host: true },
  build: { target: 'es2022', sourcemap: false }
})
