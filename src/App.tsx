import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './lib/hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Reader } from './pages/Reader';
import { Library } from './pages/Library';
import { Vocabulary } from './pages/Vocabulary';
import { Import } from './pages/Import';
import { Review } from './pages/Review';
import { Statistics } from './pages/Statistics';
import { Subscription } from './pages/Subscription';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { seedKnowledge } from './lib/data/seeding';

function RequireAuth() {
  const { state } = useAuth();
  const location = useLocation();

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parch2">
        <div className="text-[32px] font-serif text-muted animate-pulse">Paleoglossa</div>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="md:pl-[220px] pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    seedKnowledge();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing (Public) */}
        <Route path="/" element={<Landing />} />
        {/* TODO: Add pricing page if needed, for now point to subscription */}
        <Route path="/pricing" element={<Subscription />} />

        {/* Auth */}
        <Route path="/auth/login" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App Core (Authenticated) */}
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="reader/:textId" element={<Reader />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="review" element={<Review />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="notes" element={<div className="p-8">Notes coming soon</div>} />
            <Route path="settings" element={<Settings />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/import" element={<AppLayout />}>
            <Route index element={<Import />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

