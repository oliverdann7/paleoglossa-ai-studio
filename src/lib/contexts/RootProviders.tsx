import { ReactNode } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ToastProvider } from './ToastProvider';
import { AuthProvider } from './AuthContext';
import { ActiveLanguageProvider } from './ActiveLanguageContext';
import { SubscriptionProvider } from './SubscriptionContext';
import { ReaderStateProvider } from './ReaderContext';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ActiveLanguageProvider>
            <SubscriptionProvider>
              <ReaderStateProvider>
                {children}
              </ReaderStateProvider>
            </SubscriptionProvider>
          </ActiveLanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}
