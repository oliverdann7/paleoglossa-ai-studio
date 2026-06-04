import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  ExternalLink,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  ScanLine,
  Search,
  Scroll,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/services/apiFetch';
import { LANGUAGES } from '@/lib/constants/languages';
import { WITNESSES, getApparatusForManuscript } from '../lib/data/criticalApparatus.js';
import type { ApparatusLocus } from '../lib/data/criticalApparatus.js';
import { CURATED_MANUSCRIPTS } from '../lib/data/manuscriptCatalog.js';
import { useToast } from '../lib/hooks/useToast.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Manuscript {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  iiifManifestUrl: string;
  transcription: string;
  languageId: string;
  source: string;
  date: string;
  tags: string[];
  createdAt: string | null;
  updatedAt: string | null;
  /** Read-only entry seeded from the curated catalog (not user-owned). */
  curated?: boolean;
}

type FormData = Omit<Manuscript, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  imageUrl: '',
  iiifManifestUrl: '',
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
        <button onClick={() => zoom(0.25)} className="p-1 hover:bg-bdr/20 rounded" title="Zoom in">
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
          {fullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
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

// ─── IIIF helpers ─────────────────────────────────────────────────────────────

function extractLabel(label: unknown): string {
  if (!label) return '';
  if (typeof label === 'string') return label;
  if (Array.isArray(label)) return String((label as unknown[])[0] ?? '');
  const values = Object.values(label as Record<string, unknown>)[0];
  if (Array.isArray(values)) return String(values[0] ?? '');
  return '';
}

function buildIIIFImageUrl(serviceOrId: string): string {
  return serviceOrId.replace(/\/info\.json$/, '') + '/full/max/0/default.jpg';
}

function extractIIIFImages(manifest: Record<string, unknown>): { url: string; label: string }[] {
  const ctx = manifest['@context'];
  const isV3 =
    (typeof ctx === 'string' && ctx.includes('/3/')) ||
    (Array.isArray(ctx) && ctx.some((c) => typeof c === 'string' && c.includes('/3/')));

  if (isV3) {
    return ((manifest.items ?? []) as Record<string, unknown>[]).flatMap((canvas) => {
      const label = extractLabel(canvas.label) || `Page`;
      const annotationPages = (canvas.items ?? []) as Record<string, unknown>[];
      const annotations = (annotationPages[0]?.items ?? []) as Record<string, unknown>[];
      const body = annotations[0]?.body as Record<string, unknown> | undefined;
      if (!body) return [];
      const services = (
        Array.isArray(body.service) ? body.service : body.service ? [body.service] : []
      ) as Record<string, unknown>[];
      if (services.length) {
        const svc = services[0];
        const base = String(svc['@id'] ?? svc.id ?? '');
        if (base) return [{ url: buildIIIFImageUrl(base), label }];
      }
      const id = String(body.id ?? body['@id'] ?? '');
      return id ? [{ url: id, label }] : [];
    });
  }

  // IIIF v2
  const sequences = (manifest.sequences ?? []) as Record<string, unknown>[];
  const canvases = (sequences[0]?.canvases ?? []) as Record<string, unknown>[];
  return canvases.flatMap((canvas) => {
    const label = extractLabel(canvas.label) || `Page`;
    const images = (canvas.images ?? []) as Record<string, unknown>[];
    const resource = images[0]?.resource as Record<string, unknown> | undefined;
    if (!resource) return [];
    const svc = resource.service as Record<string, unknown> | undefined;
    if (svc) {
      const base = String(svc['@id'] ?? svc.id ?? '');
      if (base) return [{ url: buildIIIFImageUrl(base), label }];
    }
    const id = String(resource['@id'] ?? resource.id ?? '');
    return id ? [{ url: id, label }] : [];
  });
}

// ─── IIIF viewer ──────────────────────────────────────────────────────────────

function IIIFViewer({ manifestUrl, title }: { manifestUrl: string; title: string }) {
  const [pages, setPages] = useState<{ url: string; label: string }[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!manifestUrl) return;
    let cancelled = false;
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    setError(null);
    fetch(manifestUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} loading manifest`);
        return r.json();
      })
      .then((manifest: Record<string, unknown>) => {
        if (cancelled) return;
        const extracted = extractIIIFImages(manifest);
        if (!extracted.length) {
          setError('No images found in this IIIF manifest.');
        } else {
          setPages(extracted);
          setPage(0);
        }
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError((e as Error).message ?? 'Failed to load IIIF manifest');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-[13px]">
        Loading IIIF manifest…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
        <ScanLine className="w-8 h-8 text-muted/30" />
        <p className="text-[13px] text-red-500 text-center max-w-xs">{error}</p>
        <a
          href={manifestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[12px] text-blue hover:underline"
        >
          Open manifest <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  const current = pages[page];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {pages.length > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-parch2/80 border border-bdr/40 rounded-t-lg border-b-0 shrink-0">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="p-1 hover:bg-bdr/20 rounded disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-muted font-medium">
            {current.label} · {page + 1} / {pages.length}
          </span>
          <button
            disabled={page === pages.length - 1}
            onClick={() => setPage((p) => p + 1)}
            className="p-1 hover:bg-bdr/20 rounded disabled:opacity-30 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      <div
        className={cn(
          'flex flex-col flex-1 min-h-0',
          pages.length > 1 && 'border border-bdr/40 rounded-b-lg border-t-0 overflow-hidden'
        )}
      >
        <ImageViewer imageUrl={current.url} title={`${title} — ${current.label}`} />
      </div>
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

// ─── Critical Apparatus panel ─────────────────────────────────────────────────

const CHANGE_TYPE_COLORS: Record<string, string> = {
  omission: 'bg-red-50 text-red-600 border-red-200',
  addition: 'bg-blue/5 text-blue border-blue/20',
  substitution: 'bg-amber-50 text-amber-700 border-amber-200',
  transposition: 'bg-purple-50 text-purple-600 border-purple-200',
  spelling: 'bg-parch3 text-muted border-bdr',
  harmonization: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const SIGNIFICANCE_COLORS: Record<string, string> = {
  significant: 'text-red-500',
  moderate: 'text-amber-600',
  minor: 'text-muted',
};

function WitnessChip({ siglum }: { siglum: string }) {
  const w = WITNESSES[siglum];
  return (
    <span
      title={w ? `${w.fullName} (${w.date})` : siglum}
      className="inline-block px-1.5 py-0.5 bg-parch3 border border-bdr/60 rounded text-[10px] font-mono font-semibold text-ink2 cursor-help"
    >
      {w?.siglum ?? siglum}
    </span>
  );
}

function ApparatusEntry({ locus }: { locus: ApparatusLocus }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-bdr/40 last:border-0 py-3 px-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-bold text-blue mb-1">{locus.reference}</div>
          <div className="flex flex-wrap gap-1 mb-1.5">
            <span className="text-[11px] font-mono text-ink">{locus.baseText}</span>
            <span className="text-[10px] text-muted italic">base text</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {locus.baseWitnesses.map((w) => (
              <WitnessChip key={w} siglum={w} />
            ))}
          </div>
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 p-1 rounded hover:bg-parch3 transition-colors"
        >
          <ChevronDown
            className={cn('w-3.5 h-3.5 text-muted transition-transform', expanded && 'rotate-180')}
          />
        </button>
      </div>

      {locus.variants.map((v, i) => (
        <div key={i} className="mt-2 ml-2 pl-3 border-l-2 border-bdr/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide',
                CHANGE_TYPE_COLORS[v.changeType] || 'bg-parch3 text-muted border-bdr'
              )}
            >
              {v.changeType}
            </span>
            <span className={cn('text-[10px] font-semibold', SIGNIFICANCE_COLORS[v.significance])}>
              {v.significance}
            </span>
          </div>
          <div className="text-[11px] font-mono text-ink mt-1 italic">{v.reading}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {v.witnesses.map((w) => (
              <WitnessChip key={w} siglum={w} />
            ))}
          </div>
          {v.note && <p className="text-[11px] text-ink2 leading-relaxed mt-1.5">{v.note}</p>}
        </div>
      ))}

      {expanded && (
        <p className="text-[11px] text-ink2 leading-relaxed mt-2 pt-2 border-t border-bdr/40 italic">
          {locus.discussionNote}
        </p>
      )}
    </div>
  );
}

function CriticalApparatusPanel({ languageId, title }: { languageId: string; title: string }) {
  const entries = getApparatusForManuscript(languageId, title);
  if (languageId !== 'grc') {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-6">
        <div>
          <Scroll className="w-7 h-7 text-muted mx-auto mb-2" />
          <p className="text-[13px] text-muted">
            Critical apparatus data is currently available for Ancient Greek manuscripts only.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-bdr/20">
        {entries.map((locus) => (
          <ApparatusEntry key={locus.reference} locus={locus} />
        ))}
      </div>
      <p className="text-[10px] text-muted px-4 pb-4 pt-2">
        Apparatus based on NA28 / UBS5 scholarship. Tap each entry to expand the discussion note.
        Witness abbreviations follow standard NA28 conventions.
      </p>
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

  const set = (key: keyof FormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

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
            {initial.title
              ? t('manuscripts.edit', 'Edit Manuscript')
              : t('manuscripts.new', 'New Manuscript')}
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
              placeholder={t(
                'manuscripts.form.titlePlaceholder',
                'e.g. Chester Beatty P46 — Romans 1'
              )}
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
              placeholder={t(
                'manuscripts.form.sourcePlaceholder',
                'e.g. Codex Sinaiticus, fol. 38r'
              )}
              className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[14px] text-ink focus:outline-none focus:border-blue/60"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
              {t('manuscripts.form.iiifManifestUrl', 'IIIF Manifest URL')}
            </label>
            <input
              value={form.iiifManifestUrl}
              onChange={(e) => set('iiifManifestUrl', e.target.value)}
              placeholder="https://…/manifest.json"
              className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[13px] text-ink font-mono focus:outline-none focus:border-blue/60"
            />
            <p className="text-[11px] text-muted mt-1">
              {t(
                'manuscripts.form.iiifManifestNote',
                'Paste a IIIF Presentation API manifest URL for deep zoom and page navigation. Available from major digital libraries (British Library, Bodleian, BnF, Walters Art Museum, etc.).'
              )}
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
              {t('manuscripts.form.imageUrl', 'Card Preview Image URL')}
            </label>
            <input
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 bg-parch2 border border-bdr/60 rounded-lg text-[13px] text-ink font-mono focus:outline-none focus:border-blue/60"
            />
            <p className="text-[11px] text-muted mt-1">
              {t(
                'manuscripts.form.imageNote',
                'Optional thumbnail shown on the card (JPEG, PNG, WebP). Leave blank if using a IIIF manifest.'
              )}
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
            <ChevronDown
              className={cn('w-3.5 h-3.5 transition-transform', showAdvanced && 'rotate-180')}
            />
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
                  placeholder={t(
                    'manuscripts.form.descriptionPlaceholder',
                    'Scholarly notes, context, bibliography…'
                  )}
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

function ManuscriptCard({ manuscript, onClick }: { manuscript: Manuscript; onClick: () => void }) {
  const lang = LANGUAGES.find((l) => l.id === manuscript.languageId);

  return (
    <button
      onClick={onClick}
      className="card p-0 overflow-hidden text-left hover:shadow-md transition-all group cursor-pointer w-full"
    >
      {manuscript.imageUrl ? (
        <div className="h-36 bg-ink/5 overflow-hidden relative">
          <img
            src={manuscript.imageUrl}
            alt={manuscript.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {manuscript.iiifManifestUrl && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-ink/70 text-white text-[10px] font-bold rounded tracking-wider">
              IIIF
            </span>
          )}
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-parch2 to-bdr/20 flex items-center justify-center relative">
          <ScanLine className="w-10 h-10 text-muted/30" />
          {manuscript.iiifManifestUrl && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue/80 text-white text-[10px] font-bold rounded tracking-wider">
              IIIF
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[15px] font-bold text-ink font-sans line-clamp-1 group-hover:text-blue transition-colors">
            {manuscript.title}
          </h3>
          {manuscript.curated && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
              Curated
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
          {lang && (
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              {lang.name}
            </span>
          )}
          {manuscript.date && <span className="text-[11px] text-muted">{manuscript.date}</span>}
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
  const [rightTab, setRightTab] = useState<'transcription' | 'apparatus'>('transcription');

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

        {manuscript.curated ? (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full self-start">
            {t('manuscripts.curatedReadOnly', 'Curated · read-only')}
          </span>
        ) : (
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
        )}
      </div>

      {/* Split view */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Image / IIIF viewer */}
        <div className="flex flex-col flex-1 min-w-0 min-h-[400px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              {manuscript.iiifManifestUrl
                ? t('manuscripts.iiifPanel', 'IIIF Deep Viewer')
                : t('manuscripts.imagePanel', 'Manuscript Image')}
            </span>
            {manuscript.iiifManifestUrl && (
              <a
                href={manuscript.iiifManifestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[10px] text-blue hover:underline"
                title="Open IIIF manifest"
              >
                manifest <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          {manuscript.iiifManifestUrl ? (
            <IIIFViewer manifestUrl={manuscript.iiifManifestUrl} title={manuscript.title} />
          ) : (
            <ImageViewer imageUrl={manuscript.imageUrl} title={manuscript.title} />
          )}
        </div>

        {/* Transcription / Apparatus */}
        <div className="flex flex-col w-80 xl:w-96 shrink-0 border border-bdr/40 rounded-lg bg-parch overflow-hidden">
          <div className="flex border-b border-bdr/40 bg-parch2/60">
            <button
              onClick={() => setRightTab('transcription')}
              className={cn(
                'flex-1 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors',
                rightTab === 'transcription'
                  ? 'text-blue border-b-2 border-blue -mb-px'
                  : 'text-muted hover:text-ink'
              )}
            >
              {t('manuscripts.transcription', 'Transcription')}
            </button>
            <button
              onClick={() => setRightTab('apparatus')}
              className={cn(
                'flex-1 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1',
                rightTab === 'apparatus'
                  ? 'text-blue border-b-2 border-blue -mb-px'
                  : 'text-muted hover:text-ink'
              )}
            >
              <Scroll className="w-3 h-3" />
              {t('manuscripts.apparatus', 'Apparatus')}
            </button>
          </div>
          {rightTab === 'transcription' ? (
            <TranscriptionPanel text={manuscript.transcription} isRtl={isRtl} />
          ) : (
            <CriticalApparatusPanel languageId={manuscript.languageId} title={manuscript.title} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const Manuscripts = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Manuscript | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Filter state ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const allTags = Array.from(new Set(manuscripts.flatMap((m) => m.tags ?? []))).sort();
  const usedLanguageIds = Array.from(new Set(manuscripts.map((m) => m.languageId).filter(Boolean)));

  const filteredManuscripts = manuscripts.filter((m) => {
    if (
      searchQuery &&
      !m.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.source?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (filterLanguage && m.languageId !== filterLanguage) return false;
    if (filterTag && !m.tags?.includes(filterTag)) return false;
    return true;
  });

  const curated = CURATED_MANUSCRIPTS as unknown as Manuscript[];

  useEffect(() => {
    let cancelled = false;
    apiFetch<Manuscript[]>('/api/manuscripts')
      .then((data) => {
        if (cancelled) return;
        // Curated catalog entries are always shown first, ahead of the
        // user's own manuscripts.
        setManuscripts([...curated, ...(data ?? [])]);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        // Network/auth failure should still leave the curated catalog usable,
        // but log so a server-side list failure isn't completely invisible.
        console.error('[manuscripts] Failed to load user manuscripts:', e);
        setManuscripts([...curated]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      iiifManifestUrl: m.iiifManifestUrl ?? '',
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
      addToast(e.message ?? t('manuscripts.saveFailed', 'Failed to save'), 'error');
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
      addToast(e.message ?? t('manuscripts.deleteFailed', 'Failed to delete'), 'error');
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
      <>
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('manuscripts.filter.search', 'Search manuscripts…')}
              className="w-full pl-8 pr-3 py-2 text-[13px] bg-parch border border-bdr rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {usedLanguageIds.length > 1 && (
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="py-2 pl-3 pr-7 text-[13px] bg-parch border border-bdr rounded-lg text-ink focus:outline-none focus:ring-1 focus:ring-blue/40 appearance-none"
            >
              <option value="">{t('manuscripts.filter.allLanguages', 'All languages')}</option>
              {usedLanguageIds.map((id) => {
                const lang = LANGUAGES.find((l) => l.id === id);
                return (
                  <option key={id} value={id}>
                    {lang?.name ?? id}
                  </option>
                );
              })}
            </select>
          )}
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="py-2 pl-3 pr-7 text-[13px] bg-parch border border-bdr rounded-lg text-ink focus:outline-none focus:ring-1 focus:ring-blue/40 appearance-none"
            >
              <option value="">{t('manuscripts.filter.allTags', 'All tags')}</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
          {(searchQuery || filterLanguage || filterTag) && (
            <span className="text-[12px] text-muted">
              {filteredManuscripts.length} of {manuscripts.length}
            </span>
          )}
        </div>

        {filteredManuscripts.length === 0 ? (
          <div className="py-16 text-center text-muted text-[14px]">
            {t('manuscripts.filter.noResults', 'No manuscripts match your filters.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredManuscripts.map((m) => (
              <ManuscriptCard key={m.id} manuscript={m} onClick={() => setSelected(m)} />
            ))}
          </div>
        )}
      </>
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
