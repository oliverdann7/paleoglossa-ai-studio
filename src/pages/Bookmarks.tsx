import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, Loader2, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BookmarkService, type Bookmark as BookmarkType } from '../lib/services/bookmarkService.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { getLanguageDisplayName } from '../lib/constants/languages.js';

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export const Bookmarks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await BookmarkService.list();
      setBookmarks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await BookmarkService.delete(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <Bookmark className="w-12 h-12 text-muted mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-[24px] font-serif text-ink mb-2">Sign in to view bookmarks</h2>
        <p className="text-muted text-[14px]">
          Bookmark sentences while reading to save them for later study or citation.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2 flex items-center gap-3">
          <Bookmark className="w-7 h-7 text-amber" strokeWidth={1.5} />
          {t('bookmarks.title', 'Saved Sentences')}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t('bookmarks.subtitle', 'Sentences bookmarked while reading for study or citation')}
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </div>
      )}

      {error && <div className="text-red-600 text-[14px] py-4">{error}</div>}

      {!loading && !error && bookmarks.length === 0 && (
        <div className="text-center py-16">
          <Bookmark className="w-10 h-10 text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[15px] text-muted font-body italic">
            {t(
              'bookmarks.empty',
              'No bookmarks yet. While reading, hover over a sentence and click the bookmark icon to save it here.'
            )}
          </p>
        </div>
      )}

      {!loading && bookmarks.length > 0 && (
        <div className="space-y-4">
          {bookmarks.map((bm) => (
            <div key={bm.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[17px] text-ink leading-relaxed mb-2">
                    {bm.sentenceText}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap text-[12px] text-ink3">
                    {bm.textTitle && <span className="font-medium">{bm.textTitle}</span>}
                    {bm.textTitle && <span>·</span>}
                    <span>{getLanguageDisplayName(bm.languageId) || bm.languageId}</span>
                    {bm.createdAt && (
                      <>
                        <span>·</span>
                        <span>{formatDate(bm.createdAt)}</span>
                      </>
                    )}
                  </div>
                  {bm.note && (
                    <p className="mt-2 text-[13px] text-ink2 italic bg-parch2 px-3 py-1.5 rounded-lg border border-bdr/40">
                      {bm.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {bm.textId && bm.textId !== 'unknown' && (
                    <button
                      onClick={() => navigate(`/app/reader/${bm.textId}`)}
                      title="Open text"
                      className="p-2 text-muted hover:text-blue rounded-lg hover:bg-blue/5 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(bm.id)}
                    disabled={deletingId === bm.id}
                    title="Remove bookmark"
                    className="p-2 text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    {deletingId === bm.id ? (
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

export default Bookmarks;
