import { useCallback } from 'react';
import { StatsService } from '../services/statsService.js';
import { useAuth } from './useAuth.js';

export const useReadingProgress = (languageId?: string) => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;

  const fetchTextProgress = useCallback(
    async (textId: string) => {
      return StatsService.getTextProgress(userId, textId);
    },
    [userId]
  );

  const saveTextProgress = useCallback(
    async (progress: any) => {
      return StatsService.setTextProgress(userId, { ...progress, languageId });
    },
    [userId, languageId]
  );

  const getAllProgress = useCallback(async () => {
    return StatsService.getAllProgress(userId, languageId);
  }, [userId, languageId]);

  return { fetchTextProgress, saveTextProgress, getAllProgress };
};
