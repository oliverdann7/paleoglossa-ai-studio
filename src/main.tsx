import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { RootProviders } from './lib/contexts/RootProviders';
import App from './App.tsx';
import './index.css';
import './lib/i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootProviders>
      <App />
    </RootProviders>
  </StrictMode>,
);
