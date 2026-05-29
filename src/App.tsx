import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { features } from './lib/features.js';

const TutorDirectory = lazy(() =>
  import('./pages/marketplace/TutorDirectory.js').then((m) => ({ default: m.TutorDirectory }))
);
const TutorProfilePage = lazy(() =>
  import('./pages/marketplace/TutorProfilePage.js').then((m) => ({ default: m.TutorProfilePage }))
);
const TutorOnboarding = lazy(() =>
  import('./pages/marketplace/TutorOnboarding.js').then((m) => ({ default: m.TutorOnboarding }))
);

const Landing = lazy(() =>
  import('./pages/Landing.js').then((module) => ({ default: module.Landing }))
);
const Privacy = lazy(() =>
  import('./pages/legal/Privacy.js').then((module) => ({ default: module.Privacy }))
);
const Terms = lazy(() =>
  import('./pages/legal/Terms.js').then((module) => ({ default: module.Terms }))
);
const Support = lazy(() =>
  import('./pages/legal/Support.js').then((module) => ({ default: module.Support }))
);
const Refund = lazy(() =>
  import('./pages/legal/Refund.js').then((module) => ({ default: module.Refund }))
);
const DeleteAccount = lazy(() =>
  import('./pages/DeleteAccount.js').then((module) => ({ default: module.DeleteAccount }))
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard.js').then((module) => ({ default: module.Dashboard }))
);
const Reader = lazy(() =>
  import('./pages/Reader.js').then((module) => ({ default: module.Reader }))
);
const Library = lazy(() =>
  import('./pages/Library.js').then((module) => ({ default: module.Library }))
);
const Language = lazy(() =>
  import('./pages/Language.js').then((module) => ({ default: module.Language }))
);
const ScriptLab = lazy(() =>
  import('./pages/ScriptLab.js').then((module) => ({ default: module.ScriptLab }))
);
const BeginnerHub = lazy(() =>
  import('./pages/BeginnerHub.js').then((module) => ({ default: module.BeginnerHub }))
);
const Vocabulary = lazy(() =>
  import('./pages/Vocabulary.js').then((module) => ({ default: module.Vocabulary }))
);
const Dictionary = lazy(() =>
  import('./pages/Dictionary.js').then((module) => ({ default: module.Dictionary }))
);
const Import = lazy(() =>
  import('./pages/Import.js').then((module) => ({ default: module.Import }))
);
const Review = lazy(() =>
  import('./pages/Review.js').then((module) => ({ default: module.Review }))
);
const Statistics = lazy(() =>
  import('./pages/Statistics.js').then((module) => ({ default: module.Statistics }))
);
const Subscription = lazy(() =>
  import('./pages/Subscription.js').then((module) => ({ default: module.Subscription }))
);
const Settings = lazy(() =>
  import('./pages/Settings.js').then((module) => ({ default: module.Settings }))
);
const Onboarding = lazy(() =>
  import('./pages/Onboarding.js').then((module) => ({ default: module.Onboarding }))
);
const Notes = lazy(() => import('./pages/Notes.js').then((module) => ({ default: module.Notes })));
const BookmarksPage = lazy(() =>
  import('./pages/Bookmarks.js').then((module) => ({ default: module.Bookmarks }))
);
const SearchPage = lazy(() =>
  import('./pages/Search.js').then((module) => ({ default: module.SearchPage }))
);
const Grammar = lazy(() =>
  import('./pages/Grammar.js').then((module) => ({ default: module.Grammar }))
);
const GrammarPathways = lazy(() =>
  import('./pages/GrammarPathways.js').then((module) => ({ default: module.GrammarPathways }))
);
const Tutor = lazy(() => import('./pages/Tutor.js').then((module) => ({ default: module.Tutor })));
const Syntax = lazy(() =>
  import('./pages/Syntax.js').then((module) => ({ default: module.Syntax }))
);
const Notebooks = lazy(() =>
  import('./pages/Notebooks.js').then((module) => ({ default: module.Notebooks }))
);
const NotebookDetail = lazy(() =>
  import('./pages/NotebookDetail.js').then((module) => ({ default: module.NotebookDetail }))
);
const Manuscripts = lazy(() =>
  import('./pages/Manuscripts.js').then((module) => ({ default: module.Manuscripts }))
);
const More = lazy(() => import('./pages/More.js').then((module) => ({ default: module.More })));
const Courses = lazy(() =>
  import('./pages/Courses.js').then((module) => ({ default: module.Courses }))
);
const AudioLab = lazy(() =>
  import('./pages/AudioLab.js').then((module) => ({ default: module.AudioLab }))
);
const ProfilePage = lazy(() =>
  import('./pages/Profile.js').then((module) => ({ default: module.ProfilePage }))
);
const CommunityPage = lazy(() =>
  import('./pages/Community.js').then((module) => ({ default: module.CommunityPage }))
);
const ChallengesPage = lazy(() =>
  import('./pages/Challenges.js').then((module) => ({ default: module.Challenges }))
);
const Discover = lazy(() =>
  import('./pages/Discover.js').then((module) => ({ default: module.Discover }))
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/Dashboard.js').then((module) => ({ default: module.AdminDashboard }))
);
const FirebaseDebug = lazy(() =>
  import('./pages/admin/FirebaseDebug.js').then((module) => ({ default: module.FirebaseDebug }))
);
const SignIn = lazy(() =>
  import('./pages/auth/SignIn.js').then((module) => ({ default: module.SignIn }))
);
const SignUp = lazy(() =>
  import('./pages/auth/SignUp.js').then((module) => ({ default: module.SignUp }))
);
const ForgotPassword = lazy(() =>
  import('./pages/auth/ForgotPassword.js').then((module) => ({ default: module.ForgotPassword }))
);
const ResetPassword = lazy(() =>
  import('./pages/auth/ResetPassword.js').then((module) => ({ default: module.ResetPassword }))
);
const AuthAction = lazy(() =>
  import('./pages/auth/AuthAction.js').then((module) => ({ default: module.AuthAction }))
);
const AppLayout = lazy(() =>
  import('./components/AppLayout.js').then((module) => ({ default: module.AppLayout }))
);
import { RequireAdmin } from './components/RequireAdmin.js';

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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/support" element={<Support />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/account-deletion" element={<DeleteAccount />} />

          {/* Auth */}
          <Route path="/auth/login" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/action" element={<AuthAction />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* App Core (Authenticated) */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="beginner-hub" element={<BeginnerHub />} />
            <Route path="language/:langId" element={<Language />} />
            <Route path="language/:langId/script-lab" element={<ScriptLab />} />
            <Route path="reader/:textId" element={<Reader />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="dictionary" element={<Dictionary />} />
            <Route path="dictionary/:languageId/:lemma" element={<Dictionary />} />
            <Route path="review" element={<Review />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="notes" element={<Notes />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="notebooks" element={<Notebooks />} />
            <Route path="notebooks/:notebookId" element={<NotebookDetail />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="grammar" element={<Grammar />} />
            <Route path="grammar/pathways" element={<GrammarPathways />} />
            <Route path="grammar/pathways/:pathwayId" element={<GrammarPathways />} />
            <Route path="tutor" element={<Tutor />} />
            <Route path="syntax" element={<Syntax />} />
            <Route path="manuscripts" element={<Manuscripts />} />
            <Route path="courses" element={<Courses />} />
            <Route path="audio-lab" element={<AudioLab />} />
            <Route path="more" element={<More />} />
            <Route path="discover" element={<Discover />} />
            <Route path="import" element={<Import />} />
            <Route path="settings" element={<Settings />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
            {features.isCommunityEnabled() && (
              <Route path="community" element={<CommunityPage />} />
            )}
            {features.isCommunityEnabled() && (
              <Route path="challenges" element={<ChallengesPage />} />
            )}
            {features.isMarketplaceEnabled() && (
              <Route path="tutors" element={<TutorDirectory />} />
            )}
            {features.isMarketplaceEnabled() && (
              <Route path="tutors/:uid" element={<TutorProfilePage />} />
            )}
            {features.isMarketplaceEnabled() && (
              <Route path="teach" element={<TutorOnboarding />} />
            )}
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
            <Route path="firebase-debug" element={<FirebaseDebug />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}
