import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { VocabLimitInfo } from '../hooks/useVocabLimit.js';

/** Default (safe) state before any knowledge has been loaded. */
const DEFAULT_INFO: VocabLimitInfo = {
  languageId: '',
  count: 0,
  limit: 25,
  isFull: false,
  isEnabled: false,
};

interface VocabLimitContextValue {
  info: VocabLimitInfo;
  /** Called by useKnowledge whenever its vocabLimit changes. */
  publish: (info: VocabLimitInfo) => void;
}

const VocabLimitContext = createContext<VocabLimitContextValue>({
  info: DEFAULT_INFO,
  publish: () => undefined,
});

export function VocabLimitProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<VocabLimitInfo>(DEFAULT_INFO);
  const publish = useCallback((next: VocabLimitInfo) => setInfo(next), []);
  return (
    <VocabLimitContext.Provider value={{ info, publish }}>{children}</VocabLimitContext.Provider>
  );
}

/**
 * Read the latest vocabulary-limit info published by the active knowledge hook.
 * Safe to call in components that do not themselves call useKnowledge (e.g. Navbar).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useVocabLimitContext(): VocabLimitInfo {
  return useContext(VocabLimitContext).info;
}

/**
 * Used by useKnowledge to push its vocabLimit into the shared context.
 * @internal
 */
// eslint-disable-next-line react-refresh/only-export-components
export function usePublishVocabLimit(): (info: VocabLimitInfo) => void {
  return useContext(VocabLimitContext).publish;
}
