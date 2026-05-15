import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Reader = lazy(() => import('./pages/Reader').then(module => ({ default: module.Reader })));
const Library = lazy(() => import('./pages/Library').then(module => ({ default: module.Library })));
const Language = lazy(() => import('./pages/Language').then(module => ({ default: module.Language })));
const Vocabulary = lazy(() => import('./pages/Vocabulary').then(module => ({ default: module.Vocabulary })));
const Dictionary = lazy(() => import('./pages/Dictionary').then(module => ({ default: module.Dictionary })));
const Import = lazy(() => import('./pages/Import').then(module => ({ default: module.Import })));
const Review = lazy(() => import('./pages/Review').then(module => ({ default: module.Review })));
const Statistics = lazy(() => import('./pages/Statistics').then(module => ({ default: module.Statistics })));
const Subscription = lazy(() => import('./pages/Subscription').then(module => ({ default: module.Subscription })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(module => ({ default: module.Onboarding })));
const Notes = lazy(() => import('./pages/Notes').then(module => ({ default: module.Notes })));
const SearchPage = lazy(() => import('./pages/Search').then(module => ({ default: module.SearchPage })));
const Grammar = lazy(() => import('./pages/Grammar').then(module => ({ default: module.Grammar })));
const Tutor = lazy(() => import('./pages/Tutor').then(module => ({ default: module.Tutor })));
const Syntax = lazy(() => import('./pages/Syntax').then(module => ({ default: module.Syntax })));
const Notebooks = lazy(() => import('./pages/Notebooks').then(module => ({ default: module.Notebooks })));
const Manuscripts = lazy(() => import('./pages/Manuscripts').then(module => ({ default: module.Manuscripts })));
const Courses = lazy(() => import('./pages/Courses').then(module => ({ default: module.Courses })));
const AudioLab = lazy(() => import('./pages/AudioLab').then(module => ({ default: module.AudioLab })));
const ProfilePage = lazy(() => import('./pages/Profile').then(module => ({ default: module.ProfilePage })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(module => ({ default: module.AdminDashboard })));
const SignIn = lazy(() => import('./pages/auth/SignIn').then(module => ({ default: module.SignIn })));
const SignUp = lazy(() => import('./pages/auth/SignUp').then(module => ({ default: module.SignUp })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(module => ({ default: module.ResetPassword })));
const AppLayout = lazy(() => import('./components/AppLayout').then(module => ({ default: module.AppLayout })));
import { RequireAdmin } from './components/RequireAdmin';

const PageFallback = () => (
  <div className="min-h-screen bg-parch flex items-center justify-center text-ink2 font-sans">
    <div className="card px-6 py-4 text-sm font-medium">Loading...</div>
  </div>
);

export default function App() {
  return (
      <Suspense fallback={<PageFallback />}>
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
            <Route path="dictionary" element={<Dictionary />} />
            <Route path="dictionary/:languageId/:lemma" element={<Dictionary />} />
            <Route path="review" element={<Review />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="notes" element={<Notes />} />
            <Route path="notebooks" element={<Notebooks />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="grammar" element={<Grammar />} />
            <Route path="tutor" element={<Tutor />} />
            <Route path="syntax" element={<Syntax />} />
            <Route path="manuscripts" element={<Manuscripts />} />
            <Route path="courses" element={<Courses />} />
            <Route path="audio-lab" element={<AudioLab />} />
            <Route path="import" element={<Import />} />
            <Route path="settings" element={<Settings />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/import" element={<AppLayout />}>
            <Route index element={<Import />} />
          </Route>
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AppLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </Suspense>
  );
}
