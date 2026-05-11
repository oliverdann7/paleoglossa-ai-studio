import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

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
      react(), 
      tailwindcss(),
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
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
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
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
