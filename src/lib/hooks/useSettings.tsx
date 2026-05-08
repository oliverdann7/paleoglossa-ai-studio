import { useState, useEffect } from 'react';

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
  activeLanguages: ['grc', 'hbo', 'lat', 'syr']
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('paleoglossa_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('paleoglossa_settings', JSON.stringify(settings));
    document.documentElement.className = `theme-${settings.theme}`;
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
};
