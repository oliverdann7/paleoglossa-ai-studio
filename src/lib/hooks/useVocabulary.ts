import { useState, useEffect, useCallback, useRef } from 'react';
import { WordState } from '../constants/wordStates';
import { VocabularyService, KnowledgeMap, WordInfo, SRSData } from '../services/vocabularyService';
import { STORAGE_KEYS } from '../constants/storage';
import { useAuth } from './useAuth';

// Stable singleton returned for any lemma not yet in the vocabulary.
// Avoids creating a new object on every getWordInfo call for unknown words,
// which would cause every NEW ReaderToken to re-render on each version bump.
const NEW_WORD_INFO: WordInfo = { state: WordState.NEW, addedAt: '' };

export const useVocabulary = () => {
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [knowledge, setKnowledge] = useState<KnowledgeMap>({});
  const [knowledgeVersion, setKnowledgeVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Always-current reference to knowledge — used by stable callbacks so they
  // never need to close over the changing state object.
  const knowledgeRef = useRef<KnowledgeMap>(knowledge);
  knowledgeRef.current = knowledge;

  // Bump the version counter whenever knowledge changes so ReadingPane
  // knows to re-render its token list (each ReaderToken.memo then only
  // re-renders if its specific wordInfo reference changed).
  const bumpVersion = useCallback(() => setKnowledgeVersion(v => v + 1), []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dbVocab = await VocabularyService.getVocabulary(userId);
        if (!active) return;
        setKnowledge(dbVocab);

        if (userId) {
          const localKnowledge = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
          if (localKnowledge) {
            const hasData = Object.keys(JSON.parse(localKnowledge)).length > 0;
            if (hasData) {
              const count = await VocabularyService.migrateLocalStorage(userId);
              if (count > 0) {
                const updatedVocab = await VocabularyService.getVocabulary(userId);
                setKnowledge(updatedVocab);
              }
            }
          }
        }
      } catch (e: any) {
        console.error("useVocabulary init error:", e);
        setError(e.message || "Failed to load vocabulary");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    init();
    return () => { active = false; };
  }, [userId]);

  const setWordState = useCallback((lemma: string, state: WordState, languageId: string = "unknown", context?: string) => {
    setKnowledge(prev => {
      const current = prev[lemma] || { addedAt: new Date().toISOString() };
      const info: WordInfo = { ...current, state, languageId };
      if (context && (!info.contexts || !info.contexts.includes(context))) {
        info.contexts = [...(info.contexts || []), context].slice(-5);
      }
      if (state === WordState.LEARNING && !info.srs) {
        info.srs = {
          lastReviewed: null,
          nextReview: new Date().toISOString(),
          interval: 0,
          ease: 2.5,
          step: 0
        };
      }
      return { ...prev, [lemma]: info };
    });
    bumpVersion();
    VocabularyService.setWordState(userId, lemma, state, languageId);
  }, [userId, bumpVersion]);

  const updateWordSRS = useCallback((lemma: string, srs: SRSData, state: WordState, languageId: string = "unknown") => {
    setKnowledge(prev => {
      const current = prev[lemma] || { addedAt: new Date().toISOString() };
      return { ...prev, [lemma]: { ...current, srs, state, languageId } };
    });
    bumpVersion();
    VocabularyService.updateSRS(userId, lemma, srs, state, languageId);
  }, [userId, bumpVersion]);

  // Stable reference — safe to pass as a prop or dep without causing re-renders.
  // Returns the same object reference per lemma unless that word's state changed,
  // so memo(ReaderToken) skips re-renders for unchanged words.
  const getWordInfo = useCallback((lemma: string): WordInfo => {
    return knowledgeRef.current[lemma] ?? NEW_WORD_INFO;
  }, []);

  const markPageAsSeen = useCallback((tokens: any[]) => {
    const newTokens = tokens.filter(token => {
      if (!token.lemma) return false;
      const info = knowledgeRef.current[token.lemma];
      const state = info ? (typeof info === "object" ? (info as any).state : info) : WordState.NEW;
      return state === WordState.NEW;
    });
    if (newTokens.length === 0) return;

    setKnowledge(prev => {
      const next = { ...prev };
      newTokens.forEach(token => {
        const current = next[token.lemma] || { addedAt: new Date().toISOString() };
        next[token.lemma] = { ...current, state: WordState.KNOWN, languageId: token.languageId || "unknown" } as any;
      });
      return next;
    });
    bumpVersion();

    newTokens.forEach(token => {
      VocabularyService.setWordState(userId, token.lemma, WordState.KNOWN, token.languageId || "unknown");
    });
  }, [userId, bumpVersion]);

  const setWordNote = useCallback((lemma: string, notes: string, languageId: string = "unknown") => {
    setKnowledge(prev => {
      const current = prev[lemma] || { state: WordState.NEW, addedAt: new Date().toISOString(), languageId };
      return { ...prev, [lemma]: { ...current, notes } };
    });
    bumpVersion();
    VocabularyService.setWordNote(userId, lemma, notes, languageId);
  }, [userId, bumpVersion]);

  const setWordContext = useCallback((lemma: string, context: string, languageId: string = "unknown") => {
    setKnowledge(prev => {
      const current = prev[lemma] || { state: WordState.NEW, addedAt: new Date().toISOString(), languageId };
      const contexts = current.contexts || [];
      if (contexts.includes(context)) return prev;
      return { ...prev, [lemma]: { ...current, contexts: [...contexts, context].slice(-5) } };
    });
    bumpVersion();
    VocabularyService.setWordContext(userId, lemma, context, languageId);
  }, [userId, bumpVersion]);

  const incrementEncounter = useCallback((lemma: string, languageId: string = "unknown") => {
    VocabularyService.incrementEncounter(userId, lemma, languageId);
  }, [userId]);

  const updateGloss = useCallback((lemma: string, gloss: string, languageId: string = "unknown") => {
    setKnowledge(prev => {
      const current = prev[lemma] || { state: WordState.NEW, addedAt: new Date().toISOString(), languageId };
      return { ...prev, [lemma]: { ...current, userGloss: gloss } as any };
    });
    bumpVersion();
    VocabularyService.updateGloss(userId, lemma, gloss, languageId);
  }, [userId, bumpVersion]);

  return {
    knowledge,
    knowledgeVersion,
    getWordInfo,
    setWordState,
    updateWordSRS,
    setWordNote,
    setWordContext,
    incrementEncounter,
    updateGloss,
    markPageAsSeen,
    isLoading,
    error
  };
};
