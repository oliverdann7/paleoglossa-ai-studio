import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ChevronDown,
  Edit2,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  ScanLine,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/services/apiFetch';
import { LANGUAGES } from '@/lib/constants/languages';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Manuscript {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  transcription: string;
  languageId: string;
  source: string;
  date: string;
  tags: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

type FormData = Omit<Manuscript, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  imageUrl: '',
  transcription: '',
  languageId: '',
  source: '',
  date: '',
  tags: [],
};

// ─── Image pan/zoom viewer ────────────────────────────────────────────────────

interface ViewerState {
  scale: number;
  x: number;
  y: number;
}

function ImageViewer({ imageUrl, title }: { imageUrl: string; title: string }) {
  const [state, setState] = useState<ViewerState>({ scale: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clampScale = (s: number) => Math.min(8, Math.max(0.25, s));

  const zoom = useCallback((delta: number) => {
    setState((prev) => ({ ...prev, scale: clampScale(prev.scale + delta) }));
  }, []);

  const reset = useCallback(() => setState({ scale: 1, x: 0, y: 0 }), []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setState((prev) => ({
      ...prev,
      scale: clampScale(prev.scale - e.deltaY * 0.001),
    }));
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, ox: state.x, oy: state.y };
    },
    [state.x, state.y]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !dragStart.current) return;
      setState((prev) => ({
        ...prev,
        x: dragStart.current!.ox + (e.clientX - dragStart.current!.x),
        y: dragStart.current!.oy + (e.clientY - dragStart.current!.y),
      }));
    },
    [dragging]
  );

  const onMouseUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  const onDoubleClick = useCallback(() => reset(), [reset]);

  if (!imageUrl || imgError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-parch2/60 border border-bdr/40 rounded-lg">
        <div className="text-center text-muted p-8">
          <ScanLine className="w-12 h-12 mx-auto mb-3 text-muted/40" />
          <p className="text-[13px]">No image attached</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col',
        fullscreen
          ? 'fixed inset-0 z-50 bg-ink/95'
          : 'flex-1 min-h-0 border border-bdr/40 rounded-lg bg-ink/5'
      )}
    >
      {/* Controls */}
      <div
        className={cn(
          'flex items-center gap-1 px-3 py-2 border-b border-bdr/40',
          fullscreen ? 'bg-ink/80 text-white' : 'bg-parch2/60'
        )}
      >
        <span className="text-[12px] text-muted flex-1 truncate">{title}</span>
        <button
          onClick={() => zoom(0.25)}
          className="p-1 hover:bg-bdr/20 rounded"
          title="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => zoom(-0.25)}
          className="p-1 hover:bg-bdr/20 rounded"
          title="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button onClick={reset} className="p-1 hover:bg-bdr/20 rounded" title="Reset view">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] text-muted w-10 text-center">
          {Math.round(state.scale * 100)}%
        </span>
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="p-1 hover:bg-bdr/20 rounded ml-1"
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Viewport */}
      <div
        ref={containerRef}
        className={cn(
          'overflow-hidden flex-1',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
          fullscreen ? 'h-full' : 'min-h-0'
        )}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ transform: `translate(${state.x}px, ${state.y}px)` }}
        >
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImgError(true)}
            draggable={false}
            className="max-w-none select-none"
            style={{ transform: `scale(${state.scale})`, transformOrigin: 'center' }}
          />
        </div>
      </div>

      {fullscreen && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setFullscreen(false)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Transcription panel ──────────────────────────────────────────────────────

function TranscriptionPanel({ text, isRtl }: { text: string; isRtl: boolean }) {
  const lines = text.split('\n');

  if (!text.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-[13px] italic">
        No transcription provided.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed">
      {lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            'flex gap-3 px-4 py-0.5 hover:bg-parch2/60 transition-colors',
            isRtl && 'flex-row-reverse'
          )}
        >
          <span className="text-muted/50 select-none w-8 shrink-0 text-right text-[11px] pt-0.5">
            {i + 1}
          </span>
          <span
            className={cn('text-ink flex-1 whitespace-pre-wrap break-words', isRtl && 'text-right')}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {line || ' '}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Manuscript form ──────────────────────────────────────────────────────────

function ManuscriptForm({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormData>(initial);
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-ink/40 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-parch w-full max-w-2xl rounded-xl shadow-2xl border border-bdr/60 m-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bdr/40">
          <h3 className="text-[18px] font-bold text-ink font-sans">
            {initial.title ? t('manuscripts.edit', 'Edit Manuscript') : t('manuscripts.new', 'New Manuscript')}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-bdr/20 rounded">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
              {t('manuscripts.form.title', 'Title')} *
            </label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('manuscripts.form.titlePlaceholder', 'e.g. Chester Beatty P46 — Romans 1')}
              className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[14px] text-ink focus:outline-none focus:border-blue/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
                {t('manuscripts.form.language', 'Language')}
              </label>
              <select
                value={form.languageId}
                onChange={(e) => set('languageId', e.target.value)}
                className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[14px] text-ink focus:outline-none focus:border-blue/60"
              >
                <option value="">{t('manuscripts.form.languageAny', 'Select language…')}</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
                {t('manuscripts.form.date', 'Date / Period')}
              </label>
              <input
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                placeholder={t('manuscripts.form.datePlaceholder', 'e.g. 3rd century CE')}
                className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[14px] text-ink focus:outline-none focus:border-blue/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
              {t('manuscripts.form.source', 'Manuscript / Source')}
            </label>
            <input
              value={form.source}
              onChange={(e) => set('source', e.target.value)}
              placeholder={t('manuscripts.form.sourcePlaceholder', 'e.g. Codex Sinaiticus, fol. 38r')}
              className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[14px] text-ink focus:outline-none focus:border-blue/60"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
              {t('manuscripts.form.imageUrl', 'Manuscript Image URL')}
            </label>
            <input
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[13px] text-ink font-mono focus:outline-none focus:border-blue/60"
            />
            <p className="text-[11px] text-muted mt-1">
              {t('manuscripts.form.imageNote', 'Paste a direct URL to a public image (JPEG, PNG, TIFF, WebP).')}
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
              {t('manuscripts.form.transcription', 'Diplomatic Transcription')}
            </label>
            <textarea
              value={form.transcription}
              onChange={(e) => set('transcription', e.target.value)}
              rows={8}
              placeholder={t(
                'manuscripts.form.transcriptionPlaceholder',
                'Paste the transcription here, one line per manuscript line. Use [...] for lacunae.'
              )}
              className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[13px] text-ink font-mono focus:outline-none focus:border-blue/60 resize-y"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((a) => !a)}
            className="flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors"
          >
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAdvanced && 'rotate-180')} />
            {t('manuscripts.form.advanced', 'Advanced')}
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  {t('manuscripts.form.description', 'Notes / Description')}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  placeholder={t('manuscripts.form.descriptionPlaceholder', 'Scholarly notes, context, bibliography…')}
                  className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[13px] text-ink focus:outline-none focus:border-blue/60 resize-y"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  {t('manuscripts.form.tags', 'Tags')}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder={t('manuscripts.form.tagPlaceholder', 'Add tag…')}
                    className="flex-1 px-3 py-1.5 bg-parch2 border border-bdr/60 rounded-lg text-[13px] text-ink focus:outline-none focus:border-blue/60"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-1.5 bg-blue/10 text-blue text-[13px] font-semibold rounded-lg hover:bg-blue/20"
                  >
                    Add
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-gold text-[11px] font-semibold rounded-full"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-bdr/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-semibold text-ink hover:bg-bdr/20 rounded-lg transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            disabled={saving || !form.title.trim()}
            onClick={() => onSave(form)}
            className="px-5 py-2 bg-blue text-white text-[14px] font-semibold rounded-lg hover:bg-blue/90 disabled:opacity-50 transition-colors"
          >
            {saving ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Manuscript card ──────────────────────────────────────────────────────────

function ManuscriptCard({
  manuscript,
  onClick,
}: {
  manuscript: Manuscript;
  onClick: () => void;
}) {
  const lang = LANGUAGES.find((l) => l.id === manuscript.languageId);

  return (
    <button
      onClick={onClick}
      className="card p-0 overflow-hidden text-left hover:shadow-md transition-all group cursor-pointer w-full"
    >
      {manuscript.imageUrl ? (
        <div className="h-36 bg-ink/5 overflow-hidden">
          <img
            src={manuscript.imageUrl}
            alt={manuscript.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-parch2 to-bdr/20 flex items-center justify-center">
          <ScanLine className="w-10 h-10 text-muted/30" />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-[15px] font-bold text-ink font-sans mb-1 line-clamp-1 group-hover:text-blue transition-colors">
          {manuscript.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
          {lang && (
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              {lang.name}
            </span>
          )}
          {manuscript.date && (
            <span className="text-[11px] text-muted">{manuscript.date}</span>
          )}
        </div>
        {manuscript.source && (
          <p className="text-[12px] text-ink3 italic line-clamp-1">{manuscript.source}</p>
        )}
        {manuscript.transcription && (
          <p className="text-[12px] text-muted mt-2 line-clamp-2 font-mono leading-snug">
            {manuscript.transcription}
          </p>
        )}
        {manuscript.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {manuscript.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gold/10 text-gold text-[10px] font-semibold rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Detail view ─────────────────────────────────────────────────────────────

function ManuscriptDetail({
  manuscript,
  onBack,
  onEdit,
  onDelete,
}: {
  manuscript: Manuscript;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const lang = LANGUAGES.find((l) => l.id === manuscript.languageId);
  const isRtl = ['hbo', 'arc', 'syr', 'egy'].includes(manuscript.languageId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-shrink-0">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-bdr/20 rounded-lg transition-colors mt-0.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-muted" />
          </button>
          <div>
            <h2 className="text-[22px] font-serif font-light text-ink">{manuscript.title}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {lang && (
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  {lang.name}
                </span>
              )}
              {manuscript.date && <span className="text-[12px] text-ink3">{manuscript.date}</span>}
              {manuscript.source && (
                <span className="text-[12px] text-ink3 italic">{manuscript.source}</span>
              )}
            </div>
            {manuscript.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {manuscript.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gold/10 text-gold text-[11px] font-semibold rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {manuscript.description && (
              <p className="text-[13px] text-ink3 mt-2 max-w-2xl leading-relaxed">
                {manuscript.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-bdr/20 rounded-lg border border-bdr/60 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {t('common.edit', 'Edit')}
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-red-600 font-semibold">
                {t('manuscripts.confirmDelete', 'Delete?')}
              </span>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                {t('common.yes', 'Yes')}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-[13px] font-semibold text-muted hover:bg-bdr/20 rounded-lg transition-colors"
              >
                {t('common.no', 'No')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title={t('common.delete', 'Delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Split view */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Image viewer */}
        <div className="flex flex-col flex-1 min-w-0 min-h-[400px]">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
            {t('manuscripts.imagePanel', 'Manuscript Image')}
          </div>
          <ImageViewer imageUrl={manuscript.imageUrl} title={manuscript.title} />
        </div>

        {/* Transcription */}
        <div className="flex flex-col w-80 xl:w-96 shrink-0 border border-bdr/40 rounded-lg bg-parch overflow-hidden">
          <div className="px-4 py-2.5 border-b border-bdr/40 bg-parch2/60">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              {t('manuscripts.transcription', 'Diplomatic Transcription')}
            </span>
          </div>
          <TranscriptionPanel text={manuscript.transcription} isRtl={isRtl} />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const Manuscripts = () => {
  const { t } = useTranslation();

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Manuscript | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch<Manuscript[]>('/api/manuscripts')
      .then((data) => {
        if (cancelled) return;
        setManuscripts(data ?? []);
        setLoading(false);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e.message ?? 'Failed to load manuscripts');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  }, []);

  const openNew = () => {
    setFormInitial(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (m: Manuscript) => {
    setFormInitial({
      title: m.title,
      description: m.description,
      imageUrl: m.imageUrl,
      transcription: m.transcription,
      languageId: m.languageId,
      source: m.source,
      date: m.date,
      tags: [...m.tags],
    });
    setEditingId(m.id);
    setFormOpen(true);
  };

  const handleSave = async (data: FormData) => {
    setSaving(true);
    try {
      if (editingId) {
        const updated = await apiFetch<Manuscript>(`/api/manuscripts/${editingId}`, {
          method: 'PATCH',
          body: data,
        });
        setManuscripts((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
        if (selected?.id === editingId) setSelected(updated);
      } else {
        const created = await apiFetch<Manuscript>('/api/manuscripts', {
          method: 'POST',
          body: data,
        });
        setManuscripts((prev) => [created, ...prev]);
        setSelected(created);
      }
      setFormOpen(false);
    } catch (e: any) {
      alert(e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/manuscripts/${id}`, { method: 'DELETE' });
      setManuscripts((prev) => prev.filter((m) => m.id !== id));
      setSelected(null);
    } catch (e: any) {
      alert(e.message ?? 'Failed to delete');
    }
  };

  const content = () => {
    if (selected) {
      return (
        <ManuscriptDetail
          manuscript={selected}
          onBack={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
          onDelete={() => handleDelete(selected.id)}
        />
      );
    }

    if (loading) {
      return (
        <div className="py-24 text-center text-muted text-[14px]">
          {t('common.loading', 'Loading…')}
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-16 text-center">
          <p className="text-red-600 text-[14px] mb-4">{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 bg-blue text-white text-[13px] font-semibold rounded-lg hover:bg-blue/90"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      );
    }

    if (manuscripts.length === 0) {
      return (
        <div className="card p-12 text-center flex flex-col items-center gap-4 border-dashed border-2 border-bdr/40 bg-parch2/50">
          <ScanLine className="w-14 h-14 text-muted/40" />
          <h3 className="text-[18px] font-bold text-ink font-sans">
            {t('manuscripts.empty.heading', 'No manuscripts yet')}
          </h3>
          <p className="text-[14px] text-ink3 max-w-sm leading-relaxed">
            {t(
              'manuscripts.empty.description',
              'Upload manuscript images alongside diplomatic transcriptions to study primary sources side-by-side.'
            )}
          </p>
          <button
            onClick={openNew}
            className="mt-2 px-5 py-2.5 bg-blue text-white text-[14px] font-semibold rounded-lg hover:bg-blue/90 transition-colors"
          >
            {t('manuscripts.addFirst', 'Add your first manuscript')}
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {manuscripts.map((m) => (
          <ManuscriptCard key={m.id} manuscript={m} onClick={() => setSelected(m)} />
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'p-6 md:p-10 font-sans min-h-screen',
        selected ? 'max-w-none flex flex-col' : 'max-w-6xl mx-auto'
      )}
    >
      {!selected && (
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue/10 rounded-lg flex items-center justify-center text-blue">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[28px] font-serif font-light text-ink tracking-tight mb-1">
                  {t('manuscripts.title', 'Manuscript & Epigraphy Lab')}
                </h2>
                <p className="text-xs font-bold text-blue tracking-wider uppercase">
                  {t('manuscripts.badge', 'Experimental')}
                </p>
              </div>
            </div>
            {!loading && !error && (
              <button
                onClick={openNew}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue text-white text-[13px] font-semibold rounded-lg hover:bg-blue/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('manuscripts.new', 'New Manuscript')}
              </button>
            )}
          </div>
          <p className="font-body text-[15px] italic text-ink2 mt-4">
            {t(
              'manuscripts.description',
              'Study manuscript images alongside diplomatic transcriptions and critical apparatus.'
            )}
          </p>
        </header>
      )}

      <div className={cn(selected && 'flex-1 min-h-0')}>{content()}</div>

      {formOpen && (
        <ManuscriptForm
          initial={formInitial}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
          saving={saving}
        />
      )}
    </div>
  );
};
