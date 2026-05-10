import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserSettings } from '../../types/firestore';

const STORAGE_KEY = 'paleoglossa_settings';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'sepia',
  fontSize: 18,
  transliterationMode: 'phonetic',
  targetLanguage: 'grc',
  uiLanguage: 'en',
  showParallelDefault: true
};

export class SettingsService {
  static async getSettings(userId: string | null): Promise<UserSettings> {
    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    }

    try {
      const snap = await getDoc(doc(db, `users/${userId}/settings`, 'main'));
      return snap.exists() ? snap.data() as UserSettings : DEFAULT_SETTINGS;
    } catch (e) {
      console.error("Settings Fetch Error:", e);
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(userId: string | null, settings: UserSettings) {
    if (!userId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return;
    }

    try {
      await setDoc(doc(db, `users/${userId}/settings`, 'main'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Settings Save Error:", e);
    }
  }
}
