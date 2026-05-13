import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { SettingsService } from '../services/settingsService';
export interface Settings {
  dailyGoalWords: number;
  dailyGoalMinutes: number;
  fontSize: number;
  showTranslit: boolean;
  showParallelDefault: boolean;
  highlightIntensity: 'subtle' | 'normal' | 'strong';
  audioSpeedDefault: number;
  theme: 'parchment' | 'sepia' | 'dark';
  activeLanguages: string[];
  showGlossTooltip: boolean;
  glossTooltipForKnown: boolean;
  interlinearMode: boolean;
  swipePageMovesToKnown: boolean;
  activeDictionaries: string[];
}

const DEFAULT_SETTINGS: Settings = {
  dailyGoalWords: 500,
  dailyGoalMinutes: 30,
  fontSize: 24,
  showTranslit: false,
  showParallelDefault: false,
  highlightIntensity: 'normal',
  audioSpeedDefault: 1.0,
  theme: 'parchment',
  activeLanguages: ['grc', 'hbo', 'lat', 'syr'],
  showGlossTooltip: true,
  glossTooltipForKnown: false,
  interlinearMode: false,
  swipePageMovesToKnown: true,
  activeDictionaries: ['strongs-greek', 'strongs-hebrew', 'liddell-scott', 'whitakers-words'],
};

export const useSettings = () => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const load = async () => {
      const dbSettings = await SettingsService.getSettings(userId);
      setSettings(prev => ({ ...prev, ...dbSettings }));
    };
    load();
  }, [userId]);

  useEffect(() => {
    document.documentElement.className = `theme-${settings.theme}`;
  }, [settings.theme]);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await SettingsService.saveSettings(userId, newSettings);
  }, [userId, settings]);

  return { settings, updateSettings };
};
