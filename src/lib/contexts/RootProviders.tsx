import { ReactNode } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary.js';
import { ToastProvider } from './ToastProvider.js';
import { AuthProvider } from './AuthContext.js';
import { ActiveLanguageProvider } from './ActiveLanguageContext.js';
import { SubscriptionProvider } from './SubscriptionContext.js';
import { SyncStatusProvider } from './SyncStatusContext.js';
import { ReaderStateProvider } from './ReaderContext.js';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ActiveLanguageProvider>
            <SubscriptionProvider>
              <SyncStatusProvider>
                <ReaderStateProvider>{children}</ReaderStateProvider>
              </SyncStatusProvider>
            </SubscriptionProvider>
          </ActiveLanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}
