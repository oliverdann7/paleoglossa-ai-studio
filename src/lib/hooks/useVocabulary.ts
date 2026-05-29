import { useState, useEffect, useCallback, useRef } from 'react';
import { WordState } from '../constants/wordStates.js';
import {
  VocabularyService,
  KnowledgeMap,
  WordInfo,
  SRSData,
} from '../services/vocabularyService.js';
import { STORAGE_KEYS } from '../constants/storage.js';
import { useAuth } from './useAuth.js';
import { normalizeLemmaKey } from '../utils/lemmaUtils.js';
import type { ReadingContext } from '../review/readingContext.js';

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
  // Update the ref when knowledge changes
  useEffect(() => {
    knowledgeRef.current = knowledge;
  }, [knowledge]);

  // Bump the version counter whenever knowledge changes so ReadingPane
  // knows to re-render its token list (each ReaderToken.memo then only
  // re-renders if its specific wordInfo reference changed).
  const bumpVersion = useCallback(() => setKnowledgeVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      setIsLoading(true);
      setError(null);
      // V-2: Run migrations in a separate try/catch so a migration failure
      // never prevents the vocabulary from loading.
      if (userId) {
        try {
          await VocabularyService.migrateToLemmaKeys(userId);

          const localKnowledge = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
          if (localKnowledge) {
            const hasData = Object.keys(JSON.parse(localKnowledge)).length > 0;
            if (hasData) {
              await VocabularyService.migrateLocalStorage(userId);
            }
          }
        } catch (migrationErr) {
          // Log but do not abort — always proceed to load vocabulary below
          console.error('[useVocabulary] migration error (non-fatal):', migrationErr);
        }
      }

      try {
        const dbVocab = await VocabularyService.getVocabulary(userId);
        if (!active) return;
        setKnowledge(dbVocab);
      } catch (e: any) {
        console.error('useVocabulary init error:', e);
        setError(e.message || 'Failed to load vocabulary');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [userId]);

  const setWordState = useCallback(
    (lemma: string, state: WordState, languageId: string = 'unknown', context?: string, extra?: Partial<ReadingContext>) => {
      const normKey = normalizeLemmaKey(lemma);
      const current = knowledgeRef.current[normKey];

      // Compute initial SRS here so we can pass it to VocabularyService (Firestore
      // needs nextReview written so the due-items query can find this word).
      let initialSrs: SRSData | undefined;
      if (state === WordState.LEARNING && !current?.srs) {
        initialSrs = {
          lastReviewed: null,
          nextReview: new Date().toISOString(),
          interval: 0,
          ease: 2.5,
          step: 0,
        };
      }

      setKnowledge((prev) => {
        const curr = prev[normKey] || { addedAt: new Date().toISOString() };
        const info: WordInfo = { ...curr, state, languageId };
        if (context && (!info.contexts || !info.contexts.includes(context))) {
          info.contexts = [...(info.contexts || []), context].slice(-5);
        }
        if (initialSrs) info.srs = initialSrs;
        if (extra) {
          if (extra.surface) info.surface = extra.surface;
          if (extra.morphology) info.morphology = extra.morphology;
          if (extra.transliteration) info.transliteration = extra.transliteration;
          if (extra.textId) info.textId = extra.textId;
          if (extra.sentenceIndex !== undefined) info.sentenceIndex = extra.sentenceIndex;
          if (extra.sentenceTranslation) info.sentenceTranslation = extra.sentenceTranslation;
        }
        return { ...prev, [normKey]: info };
      });
      bumpVersion();
      VocabularyService.setWordState(userId, lemma, state, languageId, initialSrs, extra)
        .catch((e) => console.error('[useVocabulary] setWordState failed:', e));
    },
    [userId, bumpVersion]
  );

  const updateWordSRS = useCallback(
    (lemma: string, srs: SRSData, state: WordState, languageId: string = 'unknown') => {
      const normKey = normalizeLemmaKey(lemma);
      setKnowledge((prev) => {
        const current = prev[normKey] || { addedAt: new Date().toISOString() };
        return { ...prev, [normKey]: { ...current, srs, state, languageId } };
      });
      bumpVersion();
      VocabularyService.updateSRS(userId, lemma, srs, state, languageId)
        .catch((e) => console.error('[useVocabulary] updateSRS failed:', e));
    },
    [userId, bumpVersion]
  );

  // Stable reference — safe to pass as a prop or dep without causing re-renders.
  // Returns the same object reference per lemma unless that word's state changed,
  // so memo(ReaderToken) skips re-renders for unchanged words.
  const getWordInfo = useCallback((lemma: string): WordInfo => {
    return knowledgeRef.current[normalizeLemmaKey(lemma)] ?? NEW_WORD_INFO;
  }, []);

  const markPageAsSeen = useCallback(
    (tokens: any[]) => {
      const newTokens = tokens.filter((token) => {
        if (!token.lemma) return false;
        const info = knowledgeRef.current[normalizeLemmaKey(token.lemma)];
        const state = info
          ? typeof info === 'object'
            ? (info as any).state
            : info
          : WordState.NEW;
        return state === WordState.NEW;
      });
      if (newTokens.length === 0) return;

      setKnowledge((prev) => {
        const next = { ...prev };
        newTokens.forEach((token) => {
          const normKey = normalizeLemmaKey(token.lemma);
          const current = next[normKey] || { addedAt: new Date().toISOString() };
          next[normKey] = {
            ...current,
            state: WordState.KNOWN,
            languageId: token.languageId || 'unknown',
          } as any;
        });
        return next;
      });
      bumpVersion();

      newTokens.forEach((token) => {
        VocabularyService.setWordState(
          userId,
          token.lemma,
          WordState.KNOWN,
          token.languageId || 'unknown'
        ).catch((e) => console.error('[useVocabulary] markPageAsSeen setWordState failed:', e));
      });
    },
    [userId, bumpVersion]
  );

  const setWordNote = useCallback(
    (lemma: string, notes: string, languageId: string = 'unknown') => {
      const normKey = normalizeLemmaKey(lemma);
      setKnowledge((prev) => {
        const current = prev[normKey] || {
          state: WordState.NEW,
          addedAt: new Date().toISOString(),
          languageId,
        };
        return { ...prev, [normKey]: { ...current, notes } };
      });
      bumpVersion();
      VocabularyService.setWordNote(userId, lemma, notes, languageId)
        .catch((e) => console.error('[useVocabulary] setWordNote failed:', e));
    },
    [userId, bumpVersion]
  );

  const setWordContext = useCallback(
    (lemma: string, context: string, languageId: string = 'unknown') => {
      const normKey = normalizeLemmaKey(lemma);
      setKnowledge((prev) => {
        const current = prev[normKey] || {
          state: WordState.NEW,
          addedAt: new Date().toISOString(),
          languageId,
        };
        const contexts = current.contexts || [];
        if (contexts.includes(context)) return prev;
        return { ...prev, [normKey]: { ...current, contexts: [...contexts, context].slice(-5) } };
      });
      bumpVersion();
      // setWordContext uses the write queue — not async, so no .catch needed
      VocabularyService.setWordContext(userId, lemma, context, languageId);
    },
    [userId, bumpVersion]
  );

  const incrementEncounter = useCallback(
    (lemma: string, languageId: string = 'unknown') => {
      VocabularyService.incrementEncounter(userId, lemma, languageId);
    },
    [userId]
  );

  const updateGloss = useCallback(
    (lemma: string, gloss: string, languageId: string = 'unknown') => {
      const normKey = normalizeLemmaKey(lemma);
      setKnowledge((prev) => {
        const current = prev[normKey] || {
          state: WordState.NEW,
          addedAt: new Date().toISOString(),
          languageId,
        };
        return { ...prev, [normKey]: { ...current, userGloss: gloss } as any };
      });
      bumpVersion();
      VocabularyService.updateGloss(userId, lemma, gloss, languageId)
        .catch((e) => console.error('[useVocabulary] updateGloss failed:', e));
    },
    [userId, bumpVersion]
  );

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
    error,
  };
};
