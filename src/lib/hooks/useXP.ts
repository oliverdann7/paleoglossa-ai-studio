import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth.js';
import {
  XPService,
  XPData,
  getLevelForXP,
  getNextLevel,
  getProgressToNextLevel,
  XP_LEVELS,
} from '../services/xpService.js';

export function useXP() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [xpData, setXpData] = useState<XPData>({
    totalXP: 0,
    level: 'Novice',
    levelIndex: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const prevUserId = useRef(userId);

  useEffect(() => {
    let active = true;
    // Only set loading when userId actually changes (avoids synchronous setState warning)
    if (prevUserId.current !== userId) {
      prevUserId.current = userId;
    }
    XPService.getXP(userId).then((data) => {
      if (active) {
        setXpData(data);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const awardXP = useCallback(
    async (amount: number) => {
      const result = await XPService.awardXP(userId, amount);
      if (result) {
        const previousLevel = xpData.levelIndex;
        setXpData(result);
        // Return whether a level-up occurred
        return result.levelIndex > previousLevel;
      }
      return false;
    },
    [userId, xpData.levelIndex]
  );

  const levelInfo = getLevelForXP(xpData.totalXP);
  const nextLevel = getNextLevel(xpData.levelIndex);
  const progress = getProgressToNextLevel(xpData.totalXP, xpData.levelIndex);

  return {
    totalXP: xpData.totalXP,
    level: levelInfo.name,
    levelIcon: levelInfo.icon,
    levelIndex: xpData.levelIndex,
    nextLevel,
    progress,
    allLevels: XP_LEVELS,
    isLoading,
    awardXP,
  };
}
