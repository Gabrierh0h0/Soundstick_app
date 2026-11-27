import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      disable: process.env.NATIVE === '1', // la app Android no usa service worker
      registerType: 'autoUpdate',
      manifest: {
        name: 'Soundstick',
        short_name: 'Soundstick',
        description: 'Stickers con sonido para WhatsApp. Sticker with sound maker for WhatsApp.',
        theme_color: '#4b1a8c',
        background_color: '#7d5fb5',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Las guías son páginas HTML propias: no deben caer en la app.
        navigateFallbackDenylist: [/^\/en\//, /^\/como-hacer-/, /^\/sticker-con-/],
        runtimeCaching: [
          {
            // El motor de video pesa ~30 MB: se guarda la primera vez que se usa, no antes.
            urlPattern: /\.wasm$/,
            handler: 'CacheFirst',
            options: { cacheName: 'ffmpeg-wasm', expiration: { maxEntries: 2 } },
          },
        ],
      },
    }),
  ],
  optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
})
