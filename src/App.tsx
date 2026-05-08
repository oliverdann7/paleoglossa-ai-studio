import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// Apply saved theme before first render to avoid flash
try {
  const saved = localStorage.getItem('paleoglossa_settings');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.theme) document.documentElement.className = `theme-${parsed.theme}`;
  }
} catch { /* ignore */ }

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
        <Route path="/pricing" element={<Subscription />} />

        {/* Auth */}
        <Route path="/auth/login" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App Core (Authenticated) */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
