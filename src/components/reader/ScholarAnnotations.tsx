import { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, Trash2, Plus, Loader2, MessageSquareQuote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnotationService, TokenAnnotation } from '@/lib/services/annotationService';

interface Props {
  lemma: string;
  wordText: string;
  languageId: string;
  currentUserId?: string | null;
}

export function ScholarAnnotations({ lemma, wordText, languageId, currentUserId }: Props) {
  const [annotations, setAnnotations] = useState<TokenAnnotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!lemma || !languageId) return;
    setLoading(true);
    try {
      const list = await AnnotationService.list(lemma, languageId);
      setAnnotations(list);
    } catch {
      // Silently degrade — not critical
    } finally {
      setLoading(false);
    }
  }, [lemma, languageId]);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const handleCreate = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await AnnotationService.create(lemma, wordText, languageId, draft.trim());
      setAnnotations((prev) => [created, ...prev]);
      setDraft('');
      setShowForm(false);
    } catch (e: any) {
      setError(e.message || 'Could not save annotation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await AnnotationService.delete(id);
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      const result = await AnnotationService.upvote(id);
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                upvotes: result.upvotes,
                upvotedBy: result.upvoted
                  ? [...(a.upvotedBy || []), currentUserId || '']
                  : (a.upvotedBy || []).filter((u) => u !== currentUserId),
              }
            : a
        )
      );
    } catch {
      // ignore
    }
  };

  const alreadyAnnotated = currentUserId
    ? annotations.some((a) => a.authorUid === currentUserId)
    : false;

  return (
    <div className="mt-6 pt-6 border-t border-bdr/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-3.5 h-3.5 text-muted" />
          <span className="eyebrow opacity-60">Scholar Annotations</span>
          {annotations.length > 0 && (
            <span className="text-[10px] font-bold text-muted bg-parch3 rounded-full px-1.5 py-0.5">
              {annotations.length}
            </span>
          )}
        </div>
        {currentUserId && !alreadyAnnotated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-blue hover:text-blue/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add gloss
          </button>
        )}
      </div>

      {/* Add gloss form */}
      {showForm && (
        <div className="mb-4 p-3 bg-blue/5 rounded-xl border border-blue/20">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your scholarly gloss for this word… (e.g., 'here used in the sense of divine messenger')"
            maxLength={400}
            rows={3}
            className="w-full text-[13px] bg-transparent resize-none outline-none text-ink placeholder:text-muted/60 font-sans"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted">{draft.length}/400</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setDraft('');
                  setError(null);
                }}
                className="px-3 py-1 text-[11px] font-bold text-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!draft.trim() || saving}
                className="px-3 py-1.5 bg-blue text-white text-[11px] font-bold rounded-lg disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                Publish
              </button>
            </div>
          </div>
          {error && <p className="text-[11px] text-ruby mt-1">{error}</p>}
        </div>
      )}

      {/* Annotations list */}
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="w-4 h-4 animate-spin text-muted" />
        </div>
      ) : annotations.length === 0 ? (
        <p className="text-[12px] text-muted italic">
          No annotations yet. Be the first scholar to gloss this word.
        </p>
      ) : (
        <div className="space-y-3">
          {annotations.map((ann) => {
            const voted = currentUserId ? (ann.upvotedBy || []).includes(currentUserId) : false;
            return (
              <div key={ann.id} className="p-3 bg-parch/40 rounded-xl border border-bdr/20">
                <p className="text-[13px] font-serif text-ink leading-snug mb-2">{ann.gloss}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ann.authorAvatarUrl ? (
                      <img
                        src={ann.authorAvatarUrl}
                        alt={ann.authorName}
                        className="w-4 h-4 rounded-full"
                      />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-parch3 flex items-center justify-center text-[9px] font-bold text-muted">
                        {ann.authorName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-muted">{ann.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUserId && (
                      <button
                        onClick={() => handleUpvote(ann.id)}
                        className={cn(
                          'flex items-center gap-1 text-[10px] font-bold transition-colors',
                          voted ? 'text-blue' : 'text-muted hover:text-blue'
                        )}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {ann.upvotes > 0 && ann.upvotes}
                      </button>
                    )}
                    {currentUserId === ann.authorUid && (
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="text-muted hover:text-ruby transition-colors"
                        title="Delete annotation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
