import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AuthGuard } from './AuthGuard';
import { useSettings } from '../lib/hooks/useSettings';

export function AppLayout() {
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
