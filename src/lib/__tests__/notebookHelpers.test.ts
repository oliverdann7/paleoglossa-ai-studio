import { describe, it, expect } from 'vitest';
import { ResearchNote, ResearchNoteSource } from '../../types/modules';
import { CreateNoteInput } from '../services/notebookService';

// ── Pure helper functions (no I/O) tested here ──────────────────────────────

/** Builds the minimal required payload for a research note. */
function buildNotePayload(input: CreateNoteInput): CreateNoteInput {
  return {
    content: input.content.trim(),
    languageId: input.languageId,
    textId: input.textId,
    chunkId: input.chunkId,
    token: input.token,
    lemma: input.lemma,
    grammarTag: input.grammarTag,
    source: input.source ?? 'manual',
    tags: input.tags ?? [],
    notebookId: input.notebookId,
    visibility: input.visibility ?? 'private',
  };
}

/** Returns true if the given string is a valid ResearchNoteSource. */
function isValidSource(s: string): s is ResearchNoteSource {
  return ['reader', 'word-analysis', 'tutor', 'manual'].includes(s);
}

/** Filters notes by lemma. */
function notesByLemma(notes: ResearchNote[], lemma: string): ResearchNote[] {
  return notes.filter((n) => n.lemma === lemma);
}

/** Filters notes by language. */
function notesByLanguage(notes: ResearchNote[], languageId: string): ResearchNote[] {
  return notes.filter((n) => n.languageId === languageId);
}

/** Sorts notes newest-first by createdAt ISO string. */
function sortNotesNewestFirst(notes: ResearchNote[]): ResearchNote[] {
  return [...notes].sort((a, b) => {
    const ta = typeof a.createdAt === 'string' ? a.createdAt : '';
    const tb = typeof b.createdAt === 'string' ? b.createdAt : '';
    return tb.localeCompare(ta);
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('buildNotePayload', () => {
  it('trims whitespace from content', () => {
    const result = buildNotePayload({ content: '  my note  ' });
    expect(result.content).toBe('my note');
  });

  it('defaults source to manual when not provided', () => {
    const result = buildNotePayload({ content: 'note' });
    expect(result.source).toBe('manual');
  });

  it('preserves explicit source', () => {
    const result = buildNotePayload({ content: 'note', source: 'word-analysis' });
    expect(result.source).toBe('word-analysis');
  });

  it('defaults tags to empty array', () => {
    const result = buildNotePayload({ content: 'note' });
    expect(result.tags).toEqual([]);
  });

  it('preserves provided tags', () => {
    const result = buildNotePayload({ content: 'note', tags: ['λύω', 'verb'] });
    expect(result.tags).toEqual(['λύω', 'verb']);
  });

  it('defaults visibility to private', () => {
    const result = buildNotePayload({ content: 'note' });
    expect(result.visibility).toBe('private');
  });

  it('carries through all context fields', () => {
    const result = buildNotePayload({
      content: 'Accusative of motion toward',
      languageId: 'grc',
      textId: 'iliad_1',
      chunkId: 'iliad_1_ch1',
      token: 'πόλεμον',
      lemma: 'πόλεμος',
      grammarTag: 'accusative of motion',
      source: 'reader',
    });
    expect(result.languageId).toBe('grc');
    expect(result.textId).toBe('iliad_1');
    expect(result.chunkId).toBe('iliad_1_ch1');
    expect(result.token).toBe('πόλεμον');
    expect(result.lemma).toBe('πόλεμος');
    expect(result.grammarTag).toBe('accusative of motion');
    expect(result.source).toBe('reader');
  });
});

describe('isValidSource', () => {
  it('accepts all defined sources', () => {
    const sources: ResearchNoteSource[] = ['reader', 'word-analysis', 'tutor', 'manual'];
    sources.forEach((s) => expect(isValidSource(s)).toBe(true));
  });

  it('rejects unknown sources', () => {
    expect(isValidSource('unknown')).toBe(false);
    expect(isValidSource('')).toBe(false);
    expect(isValidSource('bookmark')).toBe(false);
  });
});

describe('notesByLemma', () => {
  const notes = [
    {
      id: '1',
      lemma: 'λύω',
      content: 'a',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
    {
      id: '2',
      lemma: 'λόγος',
      content: 'b',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-01-02',
      updatedAt: '2025-01-02',
    },
    {
      id: '3',
      lemma: 'λύω',
      content: 'c',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-01-03',
      updatedAt: '2025-01-03',
    },
  ] as ResearchNote[];

  it('returns only notes matching lemma', () => {
    const result = notesByLemma(notes, 'λύω');
    expect(result).toHaveLength(2);
    expect(result.every((n) => n.lemma === 'λύω')).toBe(true);
  });

  it('returns empty array when lemma not found', () => {
    expect(notesByLemma(notes, 'ἀγαθός')).toHaveLength(0);
  });
});

describe('notesByLanguage', () => {
  const notes = [
    {
      id: '1',
      languageId: 'grc',
      content: 'a',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
    {
      id: '2',
      languageId: 'lat',
      content: 'b',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-01-02',
      updatedAt: '2025-01-02',
    },
    {
      id: '3',
      languageId: 'grc',
      content: 'c',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-01-03',
      updatedAt: '2025-01-03',
    },
  ] as ResearchNote[];

  it('filters by languageId', () => {
    expect(notesByLanguage(notes, 'grc')).toHaveLength(2);
    expect(notesByLanguage(notes, 'lat')).toHaveLength(1);
  });

  it('returns empty when language not present', () => {
    expect(notesByLanguage(notes, 'hbo')).toHaveLength(0);
  });
});

describe('sortNotesNewestFirst', () => {
  const notes = [
    {
      id: '1',
      content: 'oldest',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
    {
      id: '2',
      content: 'newest',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-03-01',
      updatedAt: '2025-03-01',
    },
    {
      id: '3',
      content: 'middle',
      userId: 'u',
      tags: [],
      visibility: 'private',
      createdAt: '2025-02-01',
      updatedAt: '2025-02-01',
    },
  ] as ResearchNote[];

  it('sorts newest first', () => {
    const sorted = sortNotesNewestFirst(notes);
    expect(sorted[0].content).toBe('newest');
    expect(sorted[1].content).toBe('middle');
    expect(sorted[2].content).toBe('oldest');
  });

  it('does not mutate the original array', () => {
    const original = [...notes];
    sortNotesNewestFirst(notes);
    expect(notes[0].id).toBe(original[0].id);
  });
});
