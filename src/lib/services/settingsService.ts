import { db } from '../firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserSettings } from '../../types/firestore.js';
import { STORAGE_KEYS } from '../constants/storage.js';

const STORAGE_KEY = STORAGE_KEYS.SETTINGS;

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'parchment',
  fontSize: 24,
  showParallelDefault: false,
  dailyGoalWords: 50,
  dailyGoalMinutes: 15,
  showTranslit: false,
  highlightIntensity: 'normal',
  audioSpeedDefault: 1.0,
  activeLanguages: [],
  transliterationMode: 'phonetic',
  targetLanguage: 'grc',
  uiLanguage: 'en',
  swipePageMovesToKnown: true,
  activeDictionaries: ['strongs-greek', 'strongs-hebrew', 'liddell-scott', 'whitakers-words'],
};

export class SettingsService {
  static async getSettings(userId: string | null): Promise<UserSettings> {
    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    }

    try {
      const snap = await getDoc(doc(db, `users/${userId}/settings`, 'main'));
      return snap.exists() ? (snap.data() as UserSettings) : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Settings Fetch Error:', e);
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(userId: string | null, settings: Partial<UserSettings>) {
    if (!userId) {
      const existing = localStorage.getItem(STORAGE_KEY);
      const merged = existing
        ? { ...JSON.parse(existing), ...settings }
        : { ...DEFAULT_SETTINGS, ...settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return;
    }

    try {
      const ref = doc(db, `users/${userId}/settings`, 'main');
      const existing = (await getDoc(ref)).data() as UserSettings | undefined;
      await setDoc(ref, {
        ...DEFAULT_SETTINGS,
        ...existing,
        ...settings,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('Settings Save Error:', e);
    }
  }
}
