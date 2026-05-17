import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { initSentry } from './lib/sentry.js';
import { initAnalytics } from './lib/analytics.js';
import { RootProviders } from './lib/contexts/RootProviders.js';
import App from './App.tsx';
import './index.css';
import './lib/i18n';

initSentry();
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootProviders>
      <App />
    </RootProviders>
  </StrictMode>,
);
