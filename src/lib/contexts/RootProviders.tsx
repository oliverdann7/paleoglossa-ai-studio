import { ReactNode } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary.js';
import { ToastProvider } from './ToastProvider.js';
import { PersistenceErrorToast } from '../../components/PersistenceErrorToast.js';
import { AuthProvider } from './AuthContext.js';
import { ActiveLanguageProvider } from './ActiveLanguageContext.js';
import { SubscriptionProvider } from './SubscriptionContext.js';
import { SyncStatusProvider } from './SyncStatusContext.js';
import { ReaderStateProvider } from './ReaderContext.js';
import { VocabLimitProvider } from './VocabLimitContext.js';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PersistenceErrorToast />
      <ErrorBoundary>
        <AuthProvider>
          <ActiveLanguageProvider>
            <SubscriptionProvider>
              <SyncStatusProvider>
                <VocabLimitProvider>
                  <ReaderStateProvider>{children}</ReaderStateProvider>
                </VocabLimitProvider>
              </SyncStatusProvider>
            </SubscriptionProvider>
          </ActiveLanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}
