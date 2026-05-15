import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Crown, LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth';
import { useSubscription } from '../lib/contexts/SubscriptionContext';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage';
import { useVocabulary } from '../lib/hooks/useVocabulary';

import { getPlanById } from '../lib/constants/plans';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

function getReadingLevel(knownWords: number): string {
  if (knownWords >= 7000) return 'Scholar';
  if (knownWords >= 3000) return 'Advanced';
  if (knownWords >= 1000) return 'Intermediate';
  if (knownWords >= 250) return 'Elementary';
  return 'Beginner';
}

export function UserProfileCard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { subscription, isAdmin } = useSubscription();
  const { activeLanguageId, currentLanguage } = useActiveLanguage();
  const { knowledge } = useVocabulary();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const knownWords = Object.values(knowledge).filter((i: any) => {
    const state = typeof i === 'object' ? i.state : i;
    const lang = typeof i === 'object' ? (i as any).languageId || '' : '';
    return (state === 'KNOWN' || state === 3) && (!lang || lang === activeLanguageId);
  }).length;

  const plan = getPlanById(subscription.currentPlan);
  const planLabel = isAdmin ? 'Admin' : plan.name;
  const planStatus = subscription.subscriptionStatus === 'active' ? 'Active' : 'Free';

  const displayName = profile?.nickname
    ? `@${profile.nickname}`
    : profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Guest';

  const avatarUrl = profile?.avatarUrl ?? user?.photoURL;
  const rawName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const initials = rawName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full p-2 hover:bg-parch3 rounded-lg transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[11px] font-bold text-blue">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[12.5px] font-bold font-sans text-ink truncate">{displayName}</div>
          <div className="text-[9px] font-sans text-muted truncate">
            {isAdmin ? 'Admin' : planLabel} · {planStatus}
          </div>
        </div>
        <ChevronDown className={cn("w-3 h-3 text-muted shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-bdr rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2">
              {/* Reading Level */}
              <div className="px-3 py-2 border-b border-bdr/40 mb-1">
                <div className="text-[10px] text-muted uppercase tracking-wider font-bold">
                  {currentLanguage?.shortName || 'Language'} · {getReadingLevel(knownWords)}
                </div>
                <div className="text-[11px] text-ink3 font-medium">{knownWords} known words</div>
                <div className="mt-1 h-1 w-full bg-parch3 rounded-full overflow-hidden">
                  <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${Math.min(100, (knownWords / 7000) * 100)}%` }} />
                </div>
              </div>

              <button onClick={() => { setOpen(false); navigate(`/app/profile/${user?.uid}`); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] text-ink2 hover:bg-parch2 transition-all text-left">
                <User className="w-4 h-4 text-muted" /> {t("profile.viewProfile", "My Profile")}
              </button>
              <button onClick={() => { setOpen(false); navigate('/app/settings'); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] text-ink2 hover:bg-parch2 transition-all text-left">
                <Settings className="w-4 h-4 text-muted" /> {t("profile.settings", "Settings")}
              </button>
              <button onClick={() => { setOpen(false); navigate('/app/subscription'); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] text-ink2 hover:bg-parch2 transition-all text-left">
                <Crown className="w-4 h-4 text-muted" /> {t("profile.subscription", "Subscription")}
              </button>
              <button onClick={() => { setOpen(false); navigate('/auth/logout'); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] text-red-500 hover:bg-red-50 transition-all text-left">
                <LogOut className="w-4 h-4" /> {t("profile.signOut", "Sign Out")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
