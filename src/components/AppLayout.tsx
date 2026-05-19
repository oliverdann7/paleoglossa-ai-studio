import { useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { AuthGuard } from './AuthGuard.js';
import { DemoModeBanner } from './DemoModeBanner.js';
import { MigrationModal } from './MigrationModal.js';
import { useSettings } from '../lib/hooks/useSettings.js';
import { AuthProvider } from '../lib/contexts/AuthContext.js';
import { ActiveLanguageProvider } from '../lib/contexts/ActiveLanguageContext.js';
import { SubscriptionProvider } from '../lib/contexts/SubscriptionContext.js';
import { SyncStatusProvider } from '../lib/contexts/SyncStatusContext.js';
import { useCapacitorAppState } from '../lib/hooks/useCapacitorAppState.js';
import { VocabularyService } from '../lib/services/vocabularyService.js';

function AppLayoutContent() {
  useSettings();

  // Flush pending vocabulary writes when the native app goes to background.
  const onBackground = useCallback(() => {
    VocabularyService.flushPendingWrites();
  }, []);
  useCapacitorAppState(onBackground);

  return (
    <div className="min-h-screen">
      <DemoModeBanner />
      <Navbar />
      <MigrationModal />
      <main className="md:pl-[220px] pb-20 md:pb-0 min-h-screen">
        <AuthGuard>
          <Outlet />
        </AuthGuard>
      </main>
    </div>
  );
}

export function AppLayout() {
  return (
    <AuthProvider>
      <ActiveLanguageProvider>
        <SubscriptionProvider>
          <SyncStatusProvider>
            <AppLayoutContent />
          </SyncStatusProvider>
        </SubscriptionProvider>
      </ActiveLanguageProvider>
    </AuthProvider>
  );
}
