import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Trash2, Pencil, Check, X, BookMarked } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  WordCollectionService,
  type WordCollection,
} from '../lib/services/wordCollectionService.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { findDictionaryEntry } from '../lib/data/dictionary.js';
import { getLanguageDisplayName } from '../lib/constants/languages.js';
import { WordState } from '../lib/constants/wordStates.js';
import { cn } from '../lib/utils.js';

const STATE_COLORS: Record<string, string> = {
  [WordState.NEW]: 'bg-parch3 text-muted',
  [WordState.SEEN]: 'bg-blue/10 text-blue',
  [WordState.LEARNING]: 'bg-amber/10 text-amber',
  [WordState.FAMILIAR]: 'bg-green-100 text-green-700',
  [WordState.KNOWN]: 'bg-green-200 text-green-800',
  [WordState.IGNORED]: 'bg-parch3 text-muted',
};

export const CollectionDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();
  const { user } = useAuth();

  const [collection, setCollection] = useState<WordCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingLemma, setRemovingLemma] = useState<string | null>(null);

  // Rename state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  const { knowledge } = useKnowledge(collection?.languageId);

  const load = useCallback(async () => {
    if (!collectionId || !user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await WordCollectionService.get(collectionId);
      setCollection(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [collectionId, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleRemove = async (lemma: string) => {
    if (!collectionId) return;
    setRemovingLemma(lemma);
    try {
      await WordCollectionService.removeWord(collectionId, lemma);
      setCollection((prev) =>
        prev ? { ...prev, lemmas: prev.lemmas.filter((l) => l !== lemma) } : prev
      );
    } catch {
      // silent
    } finally {
      setRemovingLemma(null);
    }
  };

  const handleSaveName = async () => {
    if (!collectionId || !nameInput.trim() || !collection) return;
    setSavingName(true);
    try {
      await WordCollectionService.update(collectionId, { name: nameInput.trim() });
      setCollection((prev) => (prev ? { ...prev, name: nameInput.trim() } : prev));
      setEditingName(false);
    } catch {
      // silent
    } finally {
      setSavingName(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-red-600 text-[14px]">{error || 'Collection not found'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/app/collections')}
        className="flex items-center gap-1 text-muted hover:text-ink transition-colors text-[13px] mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('collections.backToCollections', 'Word Collections')}
      </button>

      <header className="mb-8">
        <div className="flex items-start gap-3 mb-2">
          <BookMarked className="w-6 h-6 text-blue mt-1 shrink-0" strokeWidth={1.5} />
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 text-[24px] font-serif font-light text-ink border-b border-blue focus:outline-none bg-transparent"
                autoFocus
                maxLength={80}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
              />
              <button onClick={handleSaveName} disabled={savingName} className="text-green-600 hover:text-green-700 p-1">
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => setEditingName(false)} className="text-muted hover:text-ink p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <h2 className="text-[28px] font-serif font-light text-ink tracking-tight">
                {collection.name}
              </h2>
              <button
                onClick={() => { setNameInput(collection.name); setEditingName(true); }}
                className="text-muted hover:text-ink transition-colors p-1 mt-1"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-[13px] text-ink3 pl-9">
          <span>{getLanguageDisplayName(collection.languageId) || collection.languageId}</span>
          <span>·</span>
          <span>
            {collection.lemmas.length}{' '}
            {collection.lemmas.length === 1
              ? t('collections.word', 'word')
              : t('collections.words', 'words')}
          </span>
        </div>
        {collection.description && (
          <p className="pl-9 mt-2 text-[14px] text-ink2 italic">{collection.description}</p>
        )}
      </header>

      {collection.lemmas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[15px] text-muted font-body italic">
            {t(
              'collections.emptyDetail',
              'No words yet. Open a text in the reader and save words here from the word panel.'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {collection.lemmas.map((lemma) => {
            const entry = findDictionaryEntry(lemma, collection.languageId);
            const wordInfo = knowledge[lemma];
            const state = typeof wordInfo === 'object' ? wordInfo?.state : (wordInfo as string | undefined);
            const gloss = typeof wordInfo === 'object' ? wordInfo?.userGloss : undefined;
            const displayGloss = gloss || entry?.shortGloss;

            return (
              <div key={lemma} className="card px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-serif text-[17px] text-ink">{lemma}</span>
                    {state && state !== WordState.NEW && (
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full',
                          STATE_COLORS[state] || 'bg-parch3 text-muted'
                        )}
                      >
                        {state}
                      </span>
                    )}
                  </div>
                  {displayGloss && (
                    <p className="text-[13px] text-ink2 truncate">{displayGloss}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(lemma)}
                  disabled={removingLemma === lemma}
                  className="p-2 text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 shrink-0"
                  title={t('collections.removeWord', 'Remove from collection')}
                >
                  {removingLemma === lemma ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;
