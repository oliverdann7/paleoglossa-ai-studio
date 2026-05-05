import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Reader } from './pages/Reader';
import { Library } from './pages/Library';
import { Vocabulary } from './pages/Vocabulary';
import { Onboarding } from './pages/Onboarding';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedText, setSelectedText] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleOnboardingComplete = (lang: string) => {
    setActiveTab('dashboard');
  };

  const isAuthScreen = ['signin', 'signup', 'forgot-password', 'reset-password'].includes(activeTab);
  const isFullScreen = activeTab === 'landing' || activeTab === 'onboarding' || isAuthScreen;

  return (
    <div className={cn("min-h-screen", isDarkMode && "dark")}>
      {!isFullScreen && (
        <Navbar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}
      
      <main className={!isFullScreen ? "pl-72" : ""}>
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
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
              transition={{ duration: 0.5 }}
            >
              <SignIn 
                onNavigate={setActiveTab} 
                onSuccess={() => setActiveTab('onboarding')} 
              />
            </motion.div>
          )}

          {activeTab === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SignUp 
                onNavigate={setActiveTab} 
                onSuccess={() => setActiveTab('onboarding')} 
              />
            </motion.div>
          )}

          {activeTab === 'forgot-password' && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
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
              transition={{ duration: 0.5 }}
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
              transition={{ duration: 0.5 }}
            >
              <Onboarding onComplete={handleOnboardingComplete} />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Dashboard onSelectText={handleTextSelect} />
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Library onSelectText={handleTextSelect} />
            </motion.div>
          )}

          {activeTab === 'vocabulary' && (
            <motion.div
              key="vocabulary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Vocabulary />
            </motion.div>
          )}

          {activeTab === 'reader' && (
            <motion.div
              key="reader"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Reader text={selectedText} onBack={() => setActiveTab('library')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
