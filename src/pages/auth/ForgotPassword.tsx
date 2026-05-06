import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const ForgotPassword = ({ 
  onNavigate 
}: { 
  onNavigate: (page: string) => void 
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vellum-50 dark:bg-obsidian-950 p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-white/5 p-8 sm:p-12 rounded-[32px] premium-shadow border border-black/5 dark:border-white/5"
        >
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gold-500 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <span className="text-vellum-50 font-serif font-bold text-3xl">P</span>
            </div>
          </div>

          <h3 className="text-3xl font-serif font-bold mb-2 text-center">Reset Password</h3>
          <p className="text-obsidian-900/60 dark:text-vellum-100/60 mb-8 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center text-center gap-3 text-green-700 dark:text-green-400"
            >
              <CheckCircle2 className="w-10 h-10 mb-2" />
              <h4 className="font-bold text-lg">Check your email</h4>
              <p className="text-sm font-medium opacity-80">
                We've sent a password reset link to {email}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
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

              <button 
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <button 
              onClick={() => onNavigate('signin')}
              className="inline-flex items-center gap-2 text-sm font-bold text-obsidian-900/60 dark:text-vellum-100/60 hover:text-obsidian-900 dark:hover:text-vellum-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
