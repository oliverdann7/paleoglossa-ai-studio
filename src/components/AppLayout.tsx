import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { AuthGuard } from './AuthGuard.js';
import { useSettings } from '../lib/hooks/useSettings.js';
import { AuthProvider } from '../lib/contexts/AuthContext.js';
import { ActiveLanguageProvider } from '../lib/contexts/ActiveLanguageContext.js';
import { SubscriptionProvider } from '../lib/contexts/SubscriptionContext.js';

function AppLayoutContent() {
  useSettings();

  return (
    <div className="min-h-screen">
      <Navbar />
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
          <AppLayoutContent />
        </SubscriptionProvider>
      </ActiveLanguageProvider>
    </AuthProvider>
  );
}
