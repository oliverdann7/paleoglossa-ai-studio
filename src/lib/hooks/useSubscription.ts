import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

export type Plan = 'free' | 'fellowship';

const AI_DAILY_FREE_LIMIT = 5;
const USAGE_KEY = 'paleoglossa_ai_usage';

interface DailyUsage {
  date: string;
  count: number;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getAiUsageToday(): DailyUsage {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { date: getTodayStr(), count: 0 };
    const parsed: DailyUsage = JSON.parse(raw);
    if (parsed.date !== getTodayStr()) return { date: getTodayStr(), count: 0 };
    return parsed;
  } catch {
    return { date: getTodayStr(), count: 0 };
  }
}

export function incrementAiUsage(): DailyUsage {
  const current = getAiUsageToday();
  const next = { date: getTodayStr(), count: current.count + 1 };
  localStorage.setItem(USAGE_KEY, JSON.stringify(next));
  return next;
}

export function useSubscription() {
  const { user, isDemoMode } = useAuth();
  const [plan, setPlan] = useState<Plan>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || isDemoMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    const profileRef = doc(db, 'users', user.uid);
    getDoc(profileRef)
      .then(snap => {
        if (snap.exists()) {
          setPlan((snap.data().currentPlan as Plan) || 'free');
        }
      })
      .catch(() => setPlan('free'))
      .finally(() => setIsLoading(false));
  }, [user, isDemoMode]);

  const isPro = plan === 'fellowship';

  const canUseAi = (): boolean => {
    if (isPro) return true;
    const usage = getAiUsageToday();
    return usage.count < AI_DAILY_FREE_LIMIT;
  };

  const aiUsageRemaining = (): number => {
    if (isPro) return Infinity;
    return Math.max(0, AI_DAILY_FREE_LIMIT - getAiUsageToday().count);
  };

  return { plan, isPro, isLoading, canUseAi, aiUsageRemaining };
}
