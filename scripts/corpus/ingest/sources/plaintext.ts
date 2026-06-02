/**
 * Source adapter — normalized plain text → {@link WorkInput}.
 *
 * For GRETIL Sanskrit and public-domain editions that are available as clean
 * UTF-8 text (no markup). Like the TEI adapter it produces RAW source strings;
 * segment → glossFill then tokenise and resolve meanings, so these texts ship
 * `partial` until their AI gloss cache is human-reviewed.
 *
 * Conventions (deliberately minimal so any cleaned text "just works"):
 *   - A line beginning with `## ` starts a new SECTION; the rest of the line is
 *     its label (e.g. `## Chapter 2`).
 *   - Every other non-empty line is one SENTENCE.
 *   - Blank lines are ignored.
 *   - If there are no `## ` markers, the whole text is a single section.
 *
 * This matches the common "one verse / one pāda per line" shape of GRETIL and
 * many digitised editions, and is trivial to pre-format anything else into.
 */

import type { RawSectionInput, RawSentenceInput, WorkInput } from '../types.js';

export interface PlaintextParseOptions {
  textId: string;
  language: string;
  title: string;
  author?: string;
}

const SECTION_MARKER = /^##\s+(.*)$/;

export function parsePlaintextWork(raw: string, opts: PlaintextParseOptions): WorkInput {
  const lines = raw.split(/\r?\n/);
  const sections: RawSectionInput[] = [];
  let current: RawSectionInput | null = null;
  let seq = 0;

  const startSection = (label: string) => {
    seq++;
    current = { id: `${opts.textId}-${seq}`, sequence: seq, label, sentences: [] };
    sections.push(current);
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const marker = trimmed.match(SECTION_MARKER);
    if (marker) {
      startSection(marker[1].trim() || `Section ${seq + 1}`);
      continue;
    }
    if (!current) startSection(opts.title);
    const sentence: RawSentenceInput = {
      id: `${current!.id}-${current!.sentences.length + 1}`,
      src: trimmed,
    };
    current!.sentences.push(sentence);
  }

  for (let i = 0; i < sections.length; i++) {
    if (i > 0) sections[i].previousSectionId = sections[i - 1].id;
    if (i < sections.length - 1) sections[i].nextSectionId = sections[i + 1].id;
  }

  return {
    textId: opts.textId,
    language: opts.language,
    meta: { title: opts.title, author: opts.author },
    sections,
  };
}
