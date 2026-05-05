import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const SignIn = ({ 
  onNavigate, 
  onSuccess 
}: { 
  onNavigate: (page: string) => void,
  onSuccess: () => void 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // In a real app with valid keys, this would work.
    // For preview purposes, we'll simulate success if keys are placeholders.
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setTimeout(() => onSuccess(), 1000);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  const handleGoogleSignIn = async () => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      onSuccess();
      return;
    }
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-vellum-50 dark:bg-obsidian-950">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-obsidian-900">
        <img 
          src="https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=1600" 
          alt="Ancient Manuscript" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent" />
        <div className="relative z-10 p-16 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <span className="text-vellum-50 font-serif font-bold text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tighter text-vellum-50">Paleoglossa</h1>
          </div>
          
          <div>
            <h2 className="text-5xl font-serif font-bold text-vellum-50 leading-tight mb-6">
              Return to <br />
              <span className="text-gold-500 italic">Paleoglossa.</span>
            </h2>
            <p className="text-vellum-50/60 text-lg max-w-md">
              Continue your journey through the ancient world. Your library and progress await.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:hidden flex items-center gap-3 mb-12">
              <div className="w-8 h-8 bg-gold-500 rounded-sm flex items-center justify-center">
                <span className="text-vellum-50 font-serif font-bold text-xl">P</span>
              </div>
              <h1 className="text-xl font-serif font-bold tracking-tight">Paleoglossa</h1>
            </div>

            <h3 className="text-3xl font-serif font-bold mb-2">Sign In</h3>
            <p className="text-obsidian-900/60 dark:text-vellum-100/60 mb-8">
              Enter your details to access your account.
            </p>

            <button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
              <span className="text-xs font-bold uppercase tracking-widest text-obsidian-900/40 dark:text-vellum-100/40">Or</span>
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-obsidian-900/60 dark:text-vellum-100/60 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-900/40 dark:text-vellum-100/40" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                    placeholder="scholar@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-obsidian-900/60 dark:text-vellum-100/60">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => onNavigate('reset-password')}
                    className="text-xs font-bold text-gold-600 hover:text-gold-500 transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-900/40 dark:text-vellum-100/40" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full group relative px-8 py-4 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-xl font-bold overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 mt-4"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Signing In...' : 'Sign In'}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-obsidian-900/60 dark:text-vellum-100/60">
              Don't have an account?{' '}
              <button 
                onClick={() => onNavigate('signup')}
                className="font-bold text-obsidian-900 dark:text-vellum-100 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
              >
                Sign Up
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
