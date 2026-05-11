import { useCallback } from 'react';
import { StatsService } from '../services/statsService';
import { useAuth } from './useAuth';

export const useReadingProgress = () => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;

  const fetchTextProgress = useCallback(async (textId: string) => {
    return StatsService.getTextProgress(userId, textId);
  }, [userId]);

  const saveTextProgress = useCallback(async (progress: any) => {
    return StatsService.setTextProgress(userId, progress);
  }, [userId]);

  const getAllProgress = useCallback(async () => {
    return StatsService.getAllProgress(userId);
  }, [userId]);

  return { fetchTextProgress, saveTextProgress, getAllProgress };
};
