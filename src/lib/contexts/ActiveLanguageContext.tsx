import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { getLanguageById, getAvailableLanguages } from '../constants/languages.js';
import type { Language } from '../constants/languages.js';

const STORAGE_KEY = 'paleoglossa_active_language';

interface ActiveLanguageContextValue {
  activeLanguageId: string;
  setActiveLanguageId: (id: string) => void;
  currentLanguage: Language | undefined;
  availableLanguages: Language[];
  isLoaded: boolean;
}

const ActiveLanguageContext = createContext<ActiveLanguageContextValue | null>(null);

export function ActiveLanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeLanguageId, setActiveLanguageIdState] = useState<string>('grc');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load active language on mount
  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, `users/${user.uid}/settings`, 'activeLanguage'));
          if (snap.exists()) {
            const data = snap.data();
            if (data.languageId && getLanguageById(data.languageId)) {
              setActiveLanguageIdState(data.languageId);
              setIsLoaded(true);
              return;
            }
          }
        } catch {
          // Fall through to localStorage
        }
      }
      // Guest mode or Firestore miss: try localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && getLanguageById(stored)) {
        setActiveLanguageIdState(stored);
      }
      setIsLoaded(true);
    };
    load();
  }, [user]);

  const setActiveLanguageId = useCallback((id: string) => {
    if (!getLanguageById(id)) return;
    setActiveLanguageIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
    if (user) {
      setDoc(doc(db, `users/${user.uid}/settings`, 'activeLanguage'), {
        languageId: id,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }
  }, [user]);

  const currentLanguage = getLanguageById(activeLanguageId);
  const availableLanguages = getAvailableLanguages();

  return (
    <ActiveLanguageContext.Provider value={{
      activeLanguageId,
      setActiveLanguageId,
      currentLanguage,
      availableLanguages,
      isLoaded,
    }}>
      {children}
    </ActiveLanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActiveLanguage(): ActiveLanguageContextValue {
  const ctx = useContext(ActiveLanguageContext);
  if (!ctx) throw new Error('useActiveLanguage must be used within ActiveLanguageProvider');
  return ctx;
}
