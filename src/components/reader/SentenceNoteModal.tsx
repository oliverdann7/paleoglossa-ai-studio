import { useState, useEffect, useRef } from 'react';
import { X, StickyNote, Loader2 } from 'lucide-react';
import { NotebookService } from '../../lib/services/notebookService.js';
import type { ReaderSentence } from '../../types/reader.js';

export interface SentenceNoteModalProps {
  sentence: ReaderSentence;
  sentenceIndex: number;
  textId: string;
  languageId: string;
  initialContent?: string;
  onSaved: (sentenceId: string, content: string) => void;
  onClose: () => void;
}

export function SentenceNoteModal({
  sentence,
  sentenceIndex,
  textId,
  languageId,
  initialContent = '',
  onSaved,
  onClose,
}: SentenceNoteModalProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const sentenceText = sentence._cachedText ?? sentence.tokens.map((t) => t.text).join(' ');

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await NotebookService.createNote({
        content: content.trim(),
        textId,
        languageId,
        sentenceRange: [sentenceIndex, sentenceIndex],
        source: 'reader',
        tags: [],
        visibility: 'private',
      });
      onSaved(sentence.id, content.trim());
      onClose();
    } catch {
      // If note creation fails, still close — note is lost but UX remains smooth
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-parch rounded-xl shadow-2xl border border-bdr flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-bdr">
          <StickyNote className="w-4 h-4 text-gold shrink-0" />
          <span className="text-sm font-semibold text-ink flex-1">Note for this sentence</span>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sentence preview */}
        <div className="px-4 py-3 bg-parch2 border-b border-bdr">
          <p className="text-[13px] text-ink2 leading-relaxed line-clamp-3" dir="auto">
            {sentenceText}
          </p>
        </div>

        {/* Textarea */}
        <div className="px-4 py-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here…"
            rows={4}
            className="w-full resize-none rounded-lg border border-bdr bg-parch text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/30 p-3 leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 px-4 pb-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-ink2 hover:bg-parch3 transition-colors border border-bdr"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}
