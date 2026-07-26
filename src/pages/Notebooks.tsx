import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Plus, Trash2, ChevronRight } from 'lucide-react';
import { EmptyState } from '../components/ui/index.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { apiFetch } from '../lib/services/apiFetch.js';

interface Notebook {
  id: string;
  title: string;
  description?: string;
  languageId?: string;
  createdAt?: string;
}

export const Notebooks = () => {
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || isDemoMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    apiFetch<Notebook[]>('/api/notebooks')
      .then(setNotebooks)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, isDemoMode]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreateError(null);
    try {
      const nb = await apiFetch<Notebook>('/api/notebooks', {
        method: 'POST',
        body: { title: newTitle.trim(), description: newDesc.trim() },
      });
      setNotebooks((prev) => [...prev, nb]);
      setNewTitle('');
      setNewDesc('');
      setShowCreate(false);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create notebook. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch('/api/notebooks/' + id, { method: 'DELETE' });
      setNotebooks((prev) => prev.filter((n) => n.id !== id));
    } catch {
      /* ignore */
    }
  };

  if (isLoading)
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" />
      </div>
    );

  return (
    <div className="p-6 md:p-12 pt-safe-page max-w-4xl mx-auto font-sans min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[28px] font-serif font-bold text-ink mb-2">Notebooks</h2>
          <p className="text-ink2 text-[15px]">Organize your notes into research notebooks.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-blue text-white font-bold rounded-xl text-[13px] hover:bg-blue/90 transition-all"
        >
          <Plus className="w-4 h-4" /> New Notebook
        </button>
      </div>

      {showCreate && (
        <div className="card p-5 mb-6 space-y-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Notebook title"
            className="w-full px-4 py-2 border border-bdr rounded-lg text-[14px] focus:outline-none focus:border-blue"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-2 border border-bdr rounded-lg text-[14px] focus:outline-none focus:border-blue"
          />
          <button
            onClick={handleCreate}
            disabled={!newTitle.trim()}
            className="px-4 py-2 bg-ink text-white font-bold rounded-lg text-[13px] hover:opacity-90 disabled:opacity-50"
          >
            Create
          </button>
          {createError && (
            <p className="text-[12px] text-ruby mt-1">{createError}</p>
          )}
        </div>
      )}

      {notebooks.length === 0 ? (
        <EmptyState
          illustration="scroll"
          heading="No notebooks yet"
          description="Group your notes and texts into research notebooks to organize your study."
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 bg-ink text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Create your first notebook
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {notebooks.map((nb) => (
            <div
              key={nb.id}
              className="card p-5 flex items-center justify-between hover:border-blue/30 transition-all group"
            >
              <div
                className="flex items-center gap-4 min-w-0 flex-1"
                onClick={() => navigate('/app/notebooks/' + nb.id)}
              >
                <BookOpen className="w-5 h-5 text-blue shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-[16px] font-bold text-ink truncate">{nb.title}</h3>
                  {nb.description && (
                    <p className="text-[13px] text-ink2 truncate">{nb.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate('/app/notebooks/' + nb.id)}
                  className="text-muted hover:text-ink p-1"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(nb.id)}
                  className="text-muted hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
