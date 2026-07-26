import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.js';
import { SettingsService } from '../services/settingsService.js';
import { syncStatusBarWithTheme } from '../services/statusBarService.js';
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
  /** Preferred dictionary source id per study language, e.g. { grc: 'logeion' }. */
  preferredDictionaryByLang: Record<string, string>;
  aiEnabled: boolean;
  onboardingProfile?: {
    completed: boolean;
    languageId: string;
    level: 'absolute-beginner' | 'knows-alphabet' | 'intermediate' | 'advanced';
    goal: 'biblical' | 'classical' | 'research' | 'vocab' | 'grammar';
    dailyCommitment: number;
  };
}

const DEFAULT_SETTINGS: Settings = {
  // Matches settingsService DEFAULT_SETTINGS — a reachable goal for slow,
  // lookup-heavy ancient-language reading (was 500, which nobody hit).
  dailyGoalWords: 50,
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
  preferredDictionaryByLang: {},
  aiEnabled: true,
  onboardingProfile: {
    completed: false,
    languageId: 'grc',
    level: 'absolute-beginner',
    goal: 'biblical',
    dailyCommitment: 15,
  },
};

export const useSettings = () => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const load = async () => {
      const dbSettings = await SettingsService.getSettings(userId);
      setSettings((prev) => ({ ...prev, ...dbSettings }));
    };
    load();
  }, [userId]);

  useEffect(() => {
    document.documentElement.className = `theme-${settings.theme}`;
    syncStatusBarWithTheme(settings.theme);
  }, [settings.theme]);

  const updateSettings = useCallback(
    async (updates: Partial<Settings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await SettingsService.saveSettings(userId, newSettings);
    },
    [userId, settings]
  );

  return { settings, updateSettings };
};
