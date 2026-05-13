import { ReactNode } from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ToastProvider } from './ToastProvider';
import { AuthProvider } from './AuthContext';
import { ActiveLanguageProvider } from './ActiveLanguageContext';
import { SubscriptionProvider } from './SubscriptionContext';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ActiveLanguageProvider>
            <SubscriptionProvider>
              {children}
            </SubscriptionProvider>
          </ActiveLanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}
