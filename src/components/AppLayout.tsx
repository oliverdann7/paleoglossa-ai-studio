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
      {/* Skip navigation link — visible only on focus for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-blue focus:text-white focus:rounded-lg focus:text-[13px] focus:font-bold"
      >
        Skip to main content
      </a>
      <DemoModeBanner />
      <Navbar />
      <MigrationModal />
      <main id="main-content" className="md:pl-[220px] pb-20 md:pb-0 min-h-screen">
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
