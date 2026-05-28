/**
 * Build TextVocabProfile from a corpus Text or ImportedText.
 *
 * Pure: no I/O, no caching. Callers cache the result.
 *
 * Lemma normalisation mirrors the vocabulary path (normalizeLemmaKey from
 * `lib/utils/lemmaUtils`) so a token tagged with lemma "λέγω" matches a user
 * who marked "Λέγω" as known. When a token has no lemma, the normalized
 * surface form is used as a fall-back — same convention vocab uses.
 */

import { normalizeLemmaKey } from '../utils/lemmaUtils.js';
import type { Text, Token } from '../../types/corpus.js';
import type { ImportedText, ImportedToken } from '../../types/firestore.js';
import type { TextVocabProfile } from './score.js';

function isWordToken(t: { type?: string; surface?: string; text?: string }): boolean {
  if (t.type && t.type !== 'word') return false;
  const s = (t as any).surface ?? (t as any).text ?? '';
  return typeof s === 'string' && s.length > 0;
}

function tokenLemma(
  t: Pick<Token, 'lemma' | 'normalized' | 'surface'> & Partial<ImportedToken>
): string {
  const raw =
    (t.lemma && t.lemma.length > 0 ? t.lemma : null) ??
    (t.normalized && t.normalized.length > 0 ? t.normalized : null) ??
    (t.surface ?? (t as any).text ?? '');
  return normalizeLemmaKey(String(raw));
}

/**
 * Build a profile from a fully-loaded curated corpus Text (with sections + tokens).
 * Texts in src/data/corpus.ts come in two shapes — some have inline `sections`,
 * others only carry `sectionsPreview` metadata. This helper takes the already-
 * resolved sentence list so it works for either shape.
 */
export function buildProfileFromSentences(
  textId: string,
  sentences: Array<{ tokens: Array<Token | ImportedToken> }>,
  meta: Pick<TextVocabProfile, 'cefrLevel' | 'languageId'> = {}
): TextVocabProfile {
  const lemmaCounts: Record<string, number> = {};
  let totalTokens = 0;

  for (const sentence of sentences) {
    for (const tok of sentence.tokens) {
      if (!isWordToken(tok as any)) continue;
      const lemma = tokenLemma(tok as any);
      if (!lemma) continue;
      lemmaCounts[lemma] = (lemmaCounts[lemma] ?? 0) + 1;
      totalTokens++;
    }
  }

  return {
    textId,
    lemmaCounts,
    totalTokens,
    uniqueLemmas: Object.keys(lemmaCounts).length,
    cefrLevel: meta.cefrLevel,
    languageId: meta.languageId,
  };
}

export function buildProfileFromImportedText(t: ImportedText): TextVocabProfile {
  return buildProfileFromSentences(t.id ?? t.title, t.sentences, {
    languageId: t.languageId,
  });
}

/**
 * Aggregate corpus-wide lemma frequency for cold-start onboarding.
 * Returns the top-N lemmas across all profiles for the given language.
 */
export function topLemmasForLanguage(
  profiles: TextVocabProfile[],
  languageId: string,
  limit = 50
): Array<{ lemma: string; count: number }> {
  const totals: Record<string, number> = {};
  for (const p of profiles) {
    if (p.languageId && p.languageId !== languageId) continue;
    for (const [lemma, count] of Object.entries(p.lemmaCounts)) {
      totals[lemma] = (totals[lemma] ?? 0) + count;
    }
  }
  return Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([lemma, count]) => ({ lemma, count }));
}

/** Convenience: extract language id from the corpus Text shape used in the repo. */
export function textLanguage(text: Text): string {
  return (text as any).languageId ?? text.language;
}

/** Sentence list resolver for a curated corpus Text — returns [] if not inlined. */
export function sentencesOf(text: Text & { sections?: { sentences: any[] }[] }): Array<{
  tokens: Token[];
}> {
  if (Array.isArray((text as any).sections)) {
    const out: Array<{ tokens: Token[] }> = [];
    for (const section of (text as any).sections) {
      if (Array.isArray(section?.sentences)) out.push(...section.sentences);
    }
    return out;
  }
  return [];
}
