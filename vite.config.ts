import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import fs from 'fs';
import {loadEnv, defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  // Load Firebase config: prefer the AI Studio-injected JSON, fall back to VITE_* env vars
  let fbJson: Record<string, string> = {};
  const fbJsonPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(fbJsonPath)) {
    try { fbJson = JSON.parse(fs.readFileSync(fbJsonPath, 'utf-8')); } catch { /* ignore */ }
  }
  const firebaseDefine = {
    projectId:         fbJson.projectId         || env.VITE_FIREBASE_PROJECT_ID          || '',
    appId:             fbJson.appId             || env.VITE_FIREBASE_APP_ID              || '',
    apiKey:            fbJson.apiKey            || env.VITE_FIREBASE_API_KEY             || '',
    authDomain:        fbJson.authDomain        || env.VITE_FIREBASE_AUTH_DOMAIN         || '',
    storageBucket:     fbJson.storageBucket     || env.VITE_FIREBASE_STORAGE_BUCKET      || '',
    messagingSenderId: fbJson.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    measurementId:     fbJson.measurementId     || env.VITE_FIREBASE_MEASUREMENT_ID      || '',
    firestoreDatabaseId: fbJson.firestoreDatabaseId || env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
  };

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', {}]],
        },
      }),
      tailwindcss(),
      VitePWA({
        // 'prompt' instead of 'autoUpdate': a new SW must never reload the app
        // mid-reading-session — the user opts in via the UpdatePrompt toast.
        registerType: 'prompt',
        includeAssets: ['icon.svg', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'PalæoGlossa',
          short_name: 'PalæoGlossa',
          description: 'Ancient & Classical Languages Reader',
          theme_color: '#1E3D6E',
          background_color: '#FDFBF7',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          // The file-served corpus (full works, some tens of MB) must NOT be
          // precached — it's fetched on demand and would blow the precache.
          globIgnores: ['**/corpus-data/**'],
          runtimeCaching: [
            {
              // Completed full texts served as static assets — cache on demand.
              urlPattern: /\/corpus-data\/.*\.json$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'corpus-data-cache',
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache read-only API routes (corpus texts, dictionary lookups) for offline use
              urlPattern: /\/api\/(corpus|texts|dictionary)\//i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'api-read-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      }),
      mode === 'analyze' && visualizer({
        filename: 'dist/bundle-report.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
      {
        name: 'replace-fetch-assignment',
        enforce: 'pre',
        transform(code, id) {
          if (id.includes('node_modules') && code.includes('fetch =')) {
            return {
              code: code.replace(/window\.fetch\s*=\s*/g, 'window.__dummy = ')
                        .replace(/globalThis\.fetch\s*=\s*/g, 'globalThis.__dummy = ')
                        .replace(/global\.fetch\s*=\s*/g, 'global.__dummy = ')
                        .replace(/self\.fetch\s*=\s*/g, 'self.__dummy = '),
              map: null
            };
          }
        }
      }
    ],
    define: {
      '__FIREBASE_CONFIG__': JSON.stringify(firebaseDefine),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'whatwg-fetch': path.resolve(__dirname, './empty.js'),
        'cross-fetch': path.resolve(__dirname, './empty.js'),
        'node-fetch': path.resolve(__dirname, './empty.js'),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: 'remove-fetch-assignment',
            setup(build) {
              build.onLoad({ filter: /\.js$/ }, async (args) => {
                let code = await fs.promises.readFile(args.path, 'utf8');
                if (code.includes('fetch =')) {
                  code = code.replace(/window\.fetch\s*=\s*/g, 'window.__dummy = ')
                             .replace(/globalThis\.fetch\s*=\s*/g, 'globalThis.__dummy = ')
                             .replace(/global\.fetch\s*=\s*/g, 'global.__dummy = ')
                             .replace(/self\.fetch\s*=\s*/g, 'self.__dummy = ');
                  return { contents: code, loader: 'js' };
                }
                return null;
              });
            }
          }
        ]
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Keep the entire corpus in a single chunk. The corpus sub-modules
            // in src/data/corpus/ cross-import each other's lexicons (MINI_LEX,
            // LXX_LEX, LAT_MINI_LEX, …) and read them *eagerly* at module-eval
            // time inside their sent() builders. The broader corpus graph also
            // contains a cycle (corpus.ts ↔ mockTexts.ts), so splitting these
            // files across separate chunks let Rollup emit a chunk load order
            // that evaluates a consumer before its lexicon dependency — causing
            // a "Cannot access '…' before initialization" TDZ crash in prod.
            // A single chunk preserves correct intra-chunk evaluation order.
            if (id.includes('/src/data/corpus/') || id.includes('/src/data/corpus.')) {
              return 'corpus';
            }
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('/firebase/')) return 'vendor-firebase';
            if (id.includes('/react-markdown/') || id.includes('/remark-') || id.includes('/rehype-') || id.includes('/micromark') || id.includes('/mdast') || id.includes('/hast') || id.includes('/unified') || id.includes('/vfile')) return 'vendor-markdown';
            if (id.includes('/react') || id.includes('/react-dom') || id.includes('/react-router-dom')) return 'vendor-react';
            if (id.includes('/motion/')) return 'vendor-motion';
            if (id.includes('/recharts/') || id.includes('/victory-') || id.includes('/d3-')) return 'vendor-charts';
            if (id.includes('/date-fns/')) return 'vendor-datefns';
            return undefined;
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test-setup.ts'],
      url: 'http://localhost',
      exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**', 'tests/**', '.claude/**'],
    },
  };
});
