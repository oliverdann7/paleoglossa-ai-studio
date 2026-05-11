import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Reader } from './pages/Reader';
import { Library } from './pages/Library';
import { Language } from './pages/Language';
import { Vocabulary } from './pages/Vocabulary';
import { Import } from './pages/Import';
import { Review } from './pages/Review';
import { Statistics } from './pages/Statistics';
import { Subscription } from './pages/Subscription';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';
import { Notes } from './pages/Notes';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { seedKnowledge } from './lib/data/seeding';
import { AuthProvider } from './lib/contexts/AuthContext';
import { useAuth } from './lib/hooks/useAuth';
import { useSettings } from './lib/hooks/useSettings';
import { Loader2 } from 'lucide-react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isDemoMode } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parch">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  // Call useSettings here so global dark mode setting takes effect everywhere
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

export default function App() {
  useEffect(() => {
    seedKnowledge();
  }, []);

  return (
    <AuthProvider>
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
            <Route path="language/:langId" element={<Language />} />
            <Route path="reader/:textId" element={<Reader />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="review" element={<Review />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="notes" element={<Notes />} />
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
    </AuthProvider>
  );
}

