import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { initSentry } from './lib/sentry';
import { RootProviders } from './lib/contexts/RootProviders';
import App from './App.tsx';
import './index.css';
import './lib/i18n';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootProviders>
      <App />
    </RootProviders>
  </StrictMode>,
);
