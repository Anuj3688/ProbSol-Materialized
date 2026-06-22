import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const googleAppsScriptUrl =
    env.VITE_GOOGLE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbzazDgvK9JdDrtkBAiFR7-Glxkgc2xT3pSK3HMJULuutduAxeRwCkk7XIcm_7pjJaOg7g/exec'

  return {
    server: {
      proxy: {
        '/api': {
          target: googleAppsScriptUrl,
          changeOrigin: true,
          secure: true,
          followRedirects: true,
          rewrite: () => '',
        },
      },
    },
    build: {
      cssMinify: 'esbuild',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        devOptions: {
          enabled: true,
          type: 'module',
        },
        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'maskable-icon-512x512.png',
        ],
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          navigateFallback: '/index.html',
        },
        manifest: {
          name: 'ProbSol Materialised',
          short_name: 'ProbSol',
          description: 'Capture problems and solutions in a focused mobile-first workspace.',
          theme_color: '#4f46e5',
          background_color: '#f7f8fb',
          display: 'standalone',
          display_override: ['standalone', 'minimal-ui', 'browser'],
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['productivity', 'utilities'],
          screenshots: [
            {
              src: '/favicon.svg',
              sizes: '192x192',
              form_factor: 'narrow',
              type: 'image/svg+xml',
            },
            {
              src: '/favicon.svg',
              sizes: '512x512',
              form_factor: 'wide',
              type: 'image/svg+xml',
            },
          ],
          icons: [
            {
              src: '/favicon.svg',
              sizes: '48x48',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
      }),
    ],
  }
})
