import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  validateCorpus,
  validateTextAnnotations,
  COMPLETE_SHORT_WORKS,
  SHORT_COMPLETE_THRESHOLD,
} from './validation';
import { CorpusDB } from '../corpus';
import { validateSection } from '../../lib/corpus-schema/validateSection';

function actualSentenceCount(textId: string): number {
  const text = CorpusDB.getText(textId);
  return (text?.sectionsPreview ?? []).reduce(
    (sum, p) => sum + (CorpusDB.getSection(p.id)?.sentences.length ?? 0),
    0
  );
}

/**
 * Locks in the production corpus's structural invariants. A "huge import"
 * is coming — without this gate, a malformed entry can land silently and
 * only blow up in the reader at runtime.
 *
 * If a legitimate schema change breaks one of these assertions, fix the
 * underlying data (or update the validator); do NOT loosen the test.
 */
describe('corpus production data', () => {
  /**
   * Known-issue baseline. These predate this test and are out of scope for
   * the schema-lock PR; fixing them belongs to a separate corpus-cleanup
   * change. The point of the baseline is to ensure no NEW errors land —
   * the test fails the moment the set grows.
   *
   * When you fix one of these, REMOVE it from this list. Do not add new
   * entries to silence regressions.
   */
  const KNOWN_VALIDATE_CORPUS_ERRORS = new Set<string>([
    'Text "grc-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "grc-koine-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "lat-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "heb-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "syr-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "cop-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "arc-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "akk-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "hit-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "uga-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "san-vocab" has isSample=false but sourceStatus is "undefined"',
    'Text "egy-vocab" has isSample=false but sourceStatus is "undefined"',
    'Corpus "" referenced by text "uga-vocab" does not exist',
    // Completeness-gate baseline: texts currently marked complete but whose
    // tokens are not fully POS-tagged + glossed. Tracked for systematic
    // backfill — when a text's annotation gap closes, update or remove its
    // entry here. The gate prevents NEW under-annotated texts from landing
    // under sourceStatus: 'complete'.
    //
    // Jn-full was backfilled from Macula Greek (JN_LEX_MACULA in john-full.ts);
    // it now annotates every token and is no longer baselined.
  ]);

  it('introduces no new validateCorpus regressions over the known baseline', () => {
    const errors = validateCorpus();
    const newErrors = errors.filter((e) => !KNOWN_VALIDATE_CORPUS_ERRORS.has(e));
    if (newErrors.length > 0) {
      console.error(
        'New corpus validation errors:\n' + newErrors.map((e) => '  - ' + e).join('\n')
      );
    }
    expect(newErrors).toEqual([]);
  });

  it('keeps the baseline tight: every known error is still reported', () => {
    // If you fix one of the known errors, remove it from the set above;
    // this guards against the baseline silently going stale.
    const errors = new Set(validateCorpus());
    const stale = [...KNOWN_VALIDATE_CORPUS_ERRORS].filter((e) => !errors.has(e));
    expect(stale).toEqual([]);
  });

  it('Jn-full is fully annotated (no POS/gloss/lemma gaps)', () => {
    const text = CorpusDB.getText('Jn-full');
    expect(text).toBeTruthy();
    const sections = (text!.sectionsPreview ?? [])
      .map((p) => CorpusDB.getSection(p.id))
      .filter((s): s is NonNullable<typeof s> => !!s);
    expect(validateTextAnnotations({ id: 'Jn-full' }, sections)).toEqual([]);
  });

  it('remote-section texts match their served corpus-data JSON and pass the completeness gate', () => {
    // validateCorpus skips bundled-section checks for remoteSections texts, so
    // lock the equivalent invariants against the emitted JSON they point at.
    const remoteTexts = CorpusDB.getTexts().filter((t) => t.remoteSections);
    expect(remoteTexts.map((t) => t.id)).toEqual(
      expect.arrayContaining([
        'grc-koine-matthew-full',
        'grc-koine-mark-full',
        'grc-koine-luke-full',
        // Whole Greek NT (Acts–Revelation), Macula-annotated, complete
        'grc-koine-acts-full',
        'grc-koine-revelation-full',
        // Peshitta NT with SEDRA morphology (partial: no gloss layer)
        'syr-peshitta-matthew-full',
        'syr-peshitta-revelation-full',
        // Latin Church Fathers (partial: dictionary glosses only)
        'lat-augustine-confessiones-full',
        'lat-tertullian-apologeticum-full',
      ])
    );
    for (const stub of remoteTexts) {
      const raw = readFileSync(`public/corpus-data/${stub.id}.json`, 'utf-8');
      const { text, sections } = JSON.parse(raw);
      expect(text.id, `${stub.id} served id`).toBe(stub.id);
      // The bundled stub must not overstate the served data: statuses match,
      // and a `complete` claim is re-verified against every served token.
      expect(text.sourceStatus, `${stub.id} served sourceStatus`).toBe(stub.sourceStatus);
      if (stub.sourceStatus === 'complete') {
        // Every token in the served text has real POS + gloss + lemma.
        expect(validateTextAnnotations({ id: stub.id }, sections)).toEqual([]);
      }
      // The bundled stub's previews resolve 1:1 to served sections.
      expect(
        (stub.sectionsPreview ?? []).map((p) => p.id),
        `${stub.id} preview ids`
      ).toEqual(sections.map((s: { id: string }) => s.id));
      const sentenceCount = sections.reduce(
        (n: number, s: { sentences: unknown[] }) => n + s.sentences.length,
        0
      );
      expect(stub.sentenceCount, `${stub.id} sentenceCount`).toBe(sentenceCount);
      const wordCount = sections.reduce(
        (n: number, s: { sentences: { tokens: unknown[] }[] }) =>
          n + s.sentences.reduce((m, sn) => m + sn.tokens.length, 0),
        0
      );
      expect(stub.wordCount, `${stub.id} wordCount`).toBe(wordCount);
    }
  });

  it('Peshitta remote texts carry full morphology (real POS + lemma on every token)', () => {
    // They ship `partial` (no commercial-safe English gloss layer exists for
    // Syriac), but the SEDRA morphology itself must be complete — that is the
    // dataset's contract. Guards against a regression in the syrnt adapter.
    const peshitta = CorpusDB.getTexts().filter(
      (t) => t.remoteSections && t.id.startsWith('syr-peshitta-')
    );
    expect(peshitta.length).toBe(27);
    for (const stub of peshitta) {
      const raw = readFileSync(`public/corpus-data/${stub.id}.json`, 'utf-8');
      const { sections } = JSON.parse(raw) as {
        sections: { sentences: { tokens: { lemma: string; morphology?: { partOfSpeech?: string } }[] }[] }[];
      };
      let bad = 0;
      for (const sec of sections) {
        for (const sent of sec.sentences) {
          for (const tok of sent.tokens) {
            const pos = tok.morphology?.partOfSpeech;
            if (!pos || pos === 'unknown' || !tok.lemma || tok.lemma.trim() === '') bad++;
          }
        }
      }
      expect(bad, `${stub.id} tokens without POS/lemma`).toBe(0);
    }
  });

  it('samples hidden from the Library are exactly those superseded by a surfaced full text', () => {
    // A sample may be libraryHidden ONLY if its whole work is served and
    // surfaced (remoteSections stub or a bundled complete text). Samples whose
    // work has no commercial-safe source (see ingest/REMAINING.md) must stay
    // visible — they are the app's only offering of that work.
    const HIDDEN_TO_FULL: Record<string, string> = {
      'LXX-Gen-1': 'grc-lxx-genesis-full',
      'LXX-Exod-12': 'grc-lxx-exodus-full',
      'LXX-Isa-6': 'grc-lxx-isaiah-full',
      'LXX-Prov-1': 'grc-lxx-proverbs-full',
      'LXX-Jonah-1': 'grc-lxx-jonah-full',
      'Iliad-1': 'grc-homer-iliad-full',
      'Odyssey-1': 'grc-homer-odyssey-full',
      'Anab-1': 'grc-xenophon-anabasis-full',
      'Plato-Apology-1': 'grc-plato-apology-full',
      'Aesop-1': 'grc-aesop-fables-full',
      'Hdt-Hist': 'grc-herodotus-histories-full',
      'Thuc-Hist': 'grc-thucydides-history-full',
      'Soph-Ant': 'grc-sophocles-antigone-full',
      'Plut-Alex': 'grc-plutarch-alexander-full',
      'Lucian-Char': 'grc-lucian-charon-full',
      'Aeneid-1': 'lat-vergil-aeneid-full',
      'Cic-Catilina-1': 'lat-cicero-in-catilinam-full',
      'Ovid-Metamorphoses-1': 'lat-ovid-metamorphoses-full',
      'Livy-AUC': 'lat-livy-ab-urbe-condita-full',
      'Sall-Cat': 'lat-sallust-catilinae-full',
      'Tac-Ann': 'lat-tacitus-annals-full',
      'Lat-Cato': 'lat-disticha-catonis-full',
      'Lat-Vg-Jn': 'lat-vulgate-john-full',
      '1Clem-1': 'grc-patristic-1-clement-full',
      'Did-1': 'grc-patristic-didache-full',
      'Ign-Eph': 'grc-patristic-ignatius-ephesians-full',
      'Polyc-Phil': 'grc-patristic-polycarp-philippians-full',
      'Justin-Apol': 'grc-patristic-justin-apology-full',
      'Hermas-Vis-1': 'grc-patristic-hermas-shepherd-full',
      'Athan-Inc-1': 'grc-patristic-athanasius-incarnation-full',
      'Cop-Jn-1': 'cop-john-full',
      'Arc-Gen-1': 'arc-targum-onkelos-genesis-full',
      'Akk-Gilg-1': 'akk-gilgamesh-full',
      'Akk-Gilg-full': 'akk-gilgamesh-full',
      'San-Gita-1': 'san-bhagavad-gita-full',
      'Syr-Jn-1': 'syr-peshitta-john-full',
      Gen: 'hbo-genesis-full',
    };
    const MUST_STAY_VISIBLE = ['Basil-Hex-1', 'Chrys-Jn-1', 'Egy-Ptah-1', 'Hit-Annals-1', 'Uga-Baal-1'];

    for (const [sampleId, fullId] of Object.entries(HIDDEN_TO_FULL)) {
      const sample = CorpusDB.getText(sampleId);
      expect(sample, `${sampleId} must remain resolvable by id`).toBeTruthy();
      expect(sample?.libraryHidden, `${sampleId} hidden from Library`).toBe(true);
      const full = CorpusDB.getText(fullId);
      expect(full, `${sampleId} hidden but full ${fullId} missing`).toBeTruthy();
      expect(full?.libraryHidden, `${fullId} must be visible`).toBeFalsy();
    }
    for (const id of MUST_STAY_VISIBLE) {
      const t = CorpusDB.getText(id);
      expect(t, `missing ${id}`).toBeTruthy();
      expect(t?.libraryHidden, `${id} has no full counterpart — must stay visible`).toBeFalsy();
    }
    // No stray hidden texts beyond the vetted map.
    const hidden = CorpusDB.getTexts().filter((t) => t.libraryHidden).map((t) => t.id).sort();
    expect(hidden).toEqual(Object.keys(HIDDEN_TO_FULL).sort());
  });

  it('every section reachable via sectionsPreview conforms to the TextSection schema', () => {
    const texts = CorpusDB.getTexts();
    const allIssues: string[] = [];
    for (const text of texts) {
      for (const preview of text.sectionsPreview ?? []) {
        const section = CorpusDB.getSection(preview.id);
        if (!section) continue; // surfaced separately by validateCorpus
        const issues = validateSection(section, `${text.id}/${preview.id}`);
        for (const i of issues) {
          allIssues.push(`${i.path}: ${i.message}`);
        }
      }
    }
    if (allIssues.length > 0) {
      console.error('Section schema issues:\n' + allIssues.map((m) => '  - ' + m).join('\n'));
    }
    expect(allIssues).toEqual([]);
  });
});

describe('complete vs excerpt labeling', () => {
  it('reports no "marked complete but too short" errors over the real corpus', () => {
    const offenders = validateCorpus().filter((e) => /marked complete but only has/.test(e));
    if (offenders.length > 0) {
      console.error('Short-complete offenders:\n' + offenders.map((e) => '  - ' + e).join('\n'));
    }
    expect(offenders).toEqual([]);
  });

  it('every short "complete" text is an explicitly vetted whole work', () => {
    // Lock the invariant directly: any complete text under the threshold MUST be
    // in the allowlist. A new short "complete" text fails here until vetted.
    const violations = CorpusDB.getTexts()
      .filter((t) => t.isComplete || t.sourceStatus === 'complete')
      // Remote-section texts bundle no sections — their real sentence counts
      // are locked against the served JSON in the remote-section test above.
      .filter((t) => !t.remoteSections)
      .filter((t) => actualSentenceCount(t.id) < SHORT_COMPLETE_THRESHOLD)
      .filter((t) => !COMPLETE_SHORT_WORKS.has(t.id))
      .map((t) => t.id);
    expect(violations).toEqual([]);
  });

  it('keeps an allowlisted short work (Psalm 23) as complete', () => {
    const ps23 = CorpusDB.getText('Ps-23');
    expect(ps23?.sourceStatus).toBe('complete');
    expect(ps23?.isComplete).toBe(true);
    expect(actualSentenceCount('Ps-23')).toBeLessThan(SHORT_COMPLETE_THRESHOLD);
  });

  it('reclassifies opening-selection excerpts of larger works as excerpt + sample', () => {
    const reclassified = [
      // Biblical chapter/book excerpts
      'Gen',
      'Anab-1',
      'Iliad-1',
      'Aeneid-1',
      'LXX-Gen-1',
      'LXX-Exod-12',
      'LXX-Isa-6',
      'LXX-Prov-1',
      'LXX-Jonah-1',
      // Classics — opening selections of huge works
      'Livy-AUC',
      'Sall-Cat',
      'Tac-Ann',
      'Hdt-Hist',
      'Thuc-Hist',
      'Soph-Ant',
      'Plut-Alex',
      'Lucian-Char',
      'Aesop-1',
      // Patristics / beginner — opening sections of larger works
      '1Clem-1',
      'Did-1',
      'Athan-Inc-1',
      'Chrys-Jn-1',
      'Hermas-Vis-1',
      'Basil-Hex-1',
      'Ign-Eph',
      'Justin-Apol',
      'Polyc-Phil',
      'Lat-Vg-Jn',
      'Lat-Cato',
    ];
    for (const id of reclassified) {
      const t = CorpusDB.getText(id);
      expect(t, `missing text ${id}`).toBeTruthy();
      expect(t?.sourceStatus, `${id} sourceStatus`).toBe('excerpt');
      expect(t?.isComplete, `${id} isComplete`).not.toBe(true);
      expect(t?.isSample, `${id} isSample`).toBe(true);
    }
  });

  it('derives sentenceCount from real sections (no declared/actual drift)', () => {
    for (const t of CorpusDB.getTexts()) {
      const actual = actualSentenceCount(t.id);
      if (actual > 0) {
        expect(t.sentenceCount, `${t.id} sentenceCount`).toBe(actual);
      }
    }
  });
});
