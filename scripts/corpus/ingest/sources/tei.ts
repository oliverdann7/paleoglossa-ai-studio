/**
 * Source adapter — generic TEI XML → {@link WorkInput}.
 *
 * Serves text-only TEI corpora (Digital Syriac Corpus, Coptic SCRIPTORIUM, and
 * many public-domain editions). It produces RAW source strings only; the
 * pipeline's segment → glossFill stages then tokenise and resolve meanings, so
 * such texts ship `partial` until their AI gloss cache is human-reviewed.
 *
 * Like {@link parseProielXml}, we avoid a full XML dependency — TEI varies
 * wildly between projects, and a pragmatic regex scan that extracts the textual
 * units is both lighter and easier to tune per-corpus than a strict parser.
 *
 * Strategy:
 *   - drop <teiHeader>, <note>, comments (apparatus / editorial, not the text);
 *   - work within <body> when present;
 *   - treat <l> (verse line), else <s>, else <ab>, else <p> as the SENTENCE unit;
 *   - group consecutive units under the most recently opened <div> as a SECTION,
 *     labelled from the div's @n / @type / @subtype.
 *
 * If a corpus needs different unit/section elements, pass them via opts.
 */

import type { RawSectionInput, RawSentenceInput, WorkInput } from '../types.js';

export interface TeiParseOptions {
  textId: string;
  language: string;
  title: string;
  author?: string;
  /** Sentence-unit element names, in priority order. */
  unitElements?: string[];
  /** Section-grouping element name. */
  sectionElement?: string;
}

const DEFAULT_UNIT_ELEMENTS = ['l', 's', 'ab', 'p'];

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&');
}

/** Inner text of a TEI unit: keep <w> content, strip every other tag. */
function unitText(inner: string): string {
  return decodeEntities(
    inner
      .replace(/<note\b[^>]*>[\s\S]*?<\/note>/gi, '')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`));
  return m ? m[1] : undefined;
}

function stripNonText(xml: string): string {
  return xml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<teiHeader\b[\s\S]*?<\/teiHeader>/gi, '')
    .replace(/<note\b[^>]*>[\s\S]*?<\/note>/gi, '');
}

function bodyOf(xml: string): string {
  const m = xml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1] : xml;
}

/** Pick the first unit element that actually occurs in the body. */
function chooseUnitElement(body: string, candidates: string[]): string | null {
  for (const el of candidates) {
    if (new RegExp(`<${el}\\b`, 'i').test(body)) return el;
  }
  return null;
}

interface DivMark {
  pos: number;
  label: string;
}

function divMarks(body: string, sectionElement: string): DivMark[] {
  const re = new RegExp(`<${sectionElement}\\b([^>]*)>`, 'gi');
  const marks: DivMark[] = [];
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(body)) !== null) {
    n++;
    const tag = m[1];
    const label = attr(tag, 'n') || attr(tag, 'subtype') || attr(tag, 'type') || `Section ${n}`;
    marks.push({ pos: m.index, label });
  }
  return marks;
}

export function parseTeiWork(xml: string, opts: TeiParseOptions): WorkInput {
  const sectionElement = opts.sectionElement ?? 'div';
  const body = bodyOf(stripNonText(xml));
  const unitEl = chooseUnitElement(body, opts.unitElements ?? DEFAULT_UNIT_ELEMENTS);

  const marks = divMarks(body, sectionElement);
  const labelAt = (pos: number): { idx: number; label: string } => {
    let idx = -1;
    for (let i = 0; i < marks.length; i++) {
      if (marks[i].pos <= pos) idx = i;
      else break;
    }
    return { idx, label: idx >= 0 ? marks[idx].label : opts.title };
  };

  // Collect (sectionIdx, text) units in document order.
  const units: { sectionIdx: number; label: string; text: string }[] = [];
  if (unitEl) {
    const re = new RegExp(`<${unitEl}\\b[^>]*>([\\s\\S]*?)<\\/${unitEl}>`, 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
      const text = unitText(m[1]);
      if (!text) continue;
      const { idx, label } = labelAt(m.index);
      units.push({ sectionIdx: idx, label, text });
    }
  } else {
    // No structural unit elements — fall back to sentence-ish splitting of the
    // whole body so the work is still ingestible.
    const flat = unitText(body);
    flat
      .split(/(?<=[.;:!?·।])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((text) => units.push({ sectionIdx: -1, label: opts.title, text }));
  }

  // Group consecutive units that share a section index into RawSectionInputs.
  const sections: RawSectionInput[] = [];
  let current: RawSectionInput | null = null;
  let currentKey = Number.NaN;
  let seq = 0;
  units.forEach((u, i) => {
    if (u.sectionIdx !== currentKey || current === null) {
      seq++;
      current = {
        id: `${opts.textId}-${seq}`,
        sequence: seq,
        label: u.label,
        sentences: [],
      };
      sections.push(current);
      currentKey = u.sectionIdx;
    }
    const sentence: RawSentenceInput = {
      id: `${opts.textId}-${seq}-${current.sentences.length + 1}`,
      src: u.text,
    };
    current.sentences.push(sentence);
    void i;
  });

  // Wire next/previous links.
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
