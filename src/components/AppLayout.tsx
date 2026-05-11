import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AuthGuard } from './AuthGuard';
import { useSettings } from '../lib/hooks/useSettings';
import { AuthProvider } from '../lib/contexts/AuthContext';

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
      <AppLayoutContent />
    </AuthProvider>
  );
}
