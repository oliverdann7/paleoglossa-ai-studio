import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Reader } from './pages/Reader';
import { Library } from './pages/Library';
import { Vocabulary } from './pages/Vocabulary';
import { Import } from './pages/Import';
import { Review } from './pages/Review';
import { Subscription } from './pages/Subscription';
import { Onboarding } from './pages/Onboarding';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedText, setSelectedText] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && activeTab === 'landing') {
        setActiveTab('dashboard'); // could also be onboarding if new
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    // Check for password reset hash in URL
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setActiveTab('reset-password');
    }
  }, []);

  const handleTextSelect = (text: any) => {
    setSelectedText(text);
    setActiveTab('reader');
  };

  const handleOnboardingComplete = () => {
    setActiveTab('dashboard');
  };

  const isAuthScreen = ['signin', 'signup', 'forgot-password', 'reset-password'].includes(activeTab);
  const isFullScreen = activeTab === 'landing' || activeTab === 'onboarding' || isAuthScreen;

  return (
    <div className="min-h-screen">
      {!isFullScreen && (
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      
      <main className={!isFullScreen ? "md:pl-[220px] pb-20 md:pb-0 min-h-screen" : "min-h-screen"}>
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Landing onEnter={() => setActiveTab('signin')} />
            </motion.div>
          )}

          {activeTab === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <SignIn onNavigate={setActiveTab} onSuccess={() => setActiveTab('onboarding')} />
            </motion.div>
          )}

          {activeTab === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <SignUp onNavigate={setActiveTab} onSuccess={() => setActiveTab('onboarding')} />
            </motion.div>
          )}

          {activeTab === 'forgot-password' && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <ForgotPassword onNavigate={setActiveTab} />
            </motion.div>
          )}

          {activeTab === 'reset-password' && (
            <motion.div
              key="reset-password"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <ResetPassword onSuccess={() => setActiveTab('dashboard')} />
            </motion.div>
          )}

          {activeTab === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Onboarding onComplete={handleOnboardingComplete} />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Dashboard onSelectText={handleTextSelect} />
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Library onSelectText={handleTextSelect} />
            </motion.div>
          )}

          {activeTab === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Import />
            </motion.div>
          )}

          {activeTab === 'subscription' && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Subscription />
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Review onBack={() => setActiveTab('dashboard')} />
            </motion.div>
          )}

          {activeTab === 'vocabulary' && (
            <motion.div
              key="vocabulary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Vocabulary />
            </motion.div>
          )}

          {activeTab === 'reader' && (
            <motion.div
              key="reader"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Reader text={selectedText} onBack={() => setActiveTab('library')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
