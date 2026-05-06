import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle } from 'lucide-react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const ResetPassword = ({ 
  onSuccess 
}: { 
  onSuccess: () => void 
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const oobCode = urlParams.get('oobCode');
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, password);
        onSuccess();
      } else {
        throw new Error('Invalid or missing action code (oobCode).');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
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

          <h3 className="text-3xl font-serif font-bold mb-2 text-center">New Password</h3>
          <p className="text-obsidian-900/60 dark:text-vellum-100/60 mb-8 text-center">
            Enter your new password below to regain access to your account.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-obsidian-900/60 dark:text-vellum-100/60 mb-2">
                New Password
              </label>
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
              className="w-full px-8 py-4 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
