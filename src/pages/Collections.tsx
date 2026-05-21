import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Plus, Trash2, Loader2, ChevronRight, BookMarked } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  WordCollectionService,
  type WordCollection,
} from '../lib/services/wordCollectionService.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { getLanguageDisplayName } from '../lib/constants/languages.js';

export const Collections = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeLanguageId } = useActiveLanguage();

  const [collections, setCollections] = useState<WordCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await WordCollectionService.list();
      setCollections(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await WordCollectionService.create({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        languageId: activeLanguageId || 'unknown',
      });
      setCollections((prev) => [created, ...prev]);
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
    } catch {
      // silent — user can retry
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await WordCollectionService.delete(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <Library className="w-12 h-12 text-muted mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-[24px] font-serif text-ink mb-2">Sign in to use word collections</h2>
        <p className="text-muted text-[14px]">
          Organise vocabulary into named lists for focused study or sharing.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2 flex items-center gap-3">
            <BookMarked className="w-7 h-7 text-blue" strokeWidth={1.5} />
            {t('collections.title', 'Word Collections')}
          </h2>
          <p className="font-body text-[15px] italic text-ink2">
            {t('collections.subtitle', 'Named vocabulary lists for focused study or sharing')}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-xl text-[13px] font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('collections.new', 'New List')}
        </button>
      </header>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="card p-5 mb-6 border-blue/30 bg-blue/5"
        >
          <h3 className="text-[14px] font-bold text-ink mb-4">
            {t('collections.createTitle', 'Create new collection')}
          </h3>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('collections.namePlaceholder', 'Collection name (e.g. "NT Greek verbs")')}
            className="w-full border border-bdr rounded-lg px-3 py-2 text-[14px] bg-parch text-ink mb-3 focus:outline-none focus:ring-2 focus:ring-blue/30"
            autoFocus
            maxLength={80}
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder={t('collections.descPlaceholder', 'Optional description')}
            className="w-full border border-bdr rounded-lg px-3 py-2 text-[14px] bg-parch text-ink mb-4 focus:outline-none focus:ring-2 focus:ring-blue/30"
            maxLength={200}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="px-4 py-2 bg-blue text-white rounded-lg text-[13px] font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {t('collections.create', 'Create')}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); }}
              className="px-4 py-2 text-[13px] text-muted hover:text-ink transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </div>
      )}

      {error && <div className="text-red-600 text-[14px] py-4">{error}</div>}

      {!loading && !error && collections.length === 0 && (
        <div className="text-center py-16">
          <BookMarked className="w-10 h-10 text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[15px] text-muted font-body italic">
            {t(
              'collections.empty',
              'No collections yet. Create one and add words while reading.'
            )}
          </p>
        </div>
      )}

      {!loading && collections.length > 0 && (
        <div className="space-y-3">
          {collections.map((col) => (
            <div key={col.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/app/collections/${col.id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif text-[17px] text-ink truncate">{col.name}</span>
                    <span className="text-[11px] text-muted bg-parch3 px-2 py-0.5 rounded-full border border-bdr shrink-0">
                      {getLanguageDisplayName(col.languageId) || col.languageId}
                    </span>
                  </div>
                  {col.description && (
                    <p className="text-[13px] text-ink2 italic truncate">{col.description}</p>
                  )}
                  <p className="text-[12px] text-muted mt-1">
                    {col.lemmas.length}{' '}
                    {col.lemmas.length === 1
                      ? t('collections.word', 'word')
                      : t('collections.words', 'words')}
                  </p>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/app/collections/${col.id}`)}
                    className="p-2 text-muted hover:text-ink rounded-lg hover:bg-parch3 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(col.id)}
                    disabled={deletingId === col.id}
                    className="p-2 text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    {deletingId === col.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Collections;
