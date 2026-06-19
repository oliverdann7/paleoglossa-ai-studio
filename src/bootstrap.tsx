import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initSentry } from './lib/sentry.js';
import { initAnalytics } from './lib/analytics.js';
import { OfflineService } from './lib/services/offlineService.js';
import { RootProviders } from './lib/contexts/RootProviders.js';
import { CookieConsent } from './components/CookieConsent.js';
import { PWAInstallBanner } from './components/PWAInstallBanner.js';
import App from './App.tsx';
import './index.css';
import './lib/i18n';

initSentry();
initAnalytics();
// One-time migration of legacy localStorage offline payloads into IndexedDB.
// Non-blocking: a failure here must never delay or break app boot.
void OfflineService.migrateLegacyPayloads();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootProviders>
      <App />
      <CookieConsent />
      <PWAInstallBanner />
    </RootProviders>
  </StrictMode>
);
