import { describe, it, expect } from 'vitest';
import { MANIFEST } from '../manifest.js';
import { ATTRIBUTIONS } from '../../../../src/data/attributions.js';
import { CorpusDB } from '../../../../src/data/corpus.js';

/**
 * The manifest is the durable plan for completing every bundled excerpt/sample
 * to its whole work via the ingestion pipeline (never the single-chunk bundle).
 * These tests keep that plan honest and prevent silent coverage regressions.
 */

describe('ingestion manifest — integrity', () => {
  it('every entry references an attribution that exists', () => {
    for (const e of MANIFEST) {
      expect(ATTRIBUTIONS[e.attribution], `${e.textId} → ${e.attribution}`).toBeDefined();
    }
  });

  it('textIds are unique', () => {
    const ids = MANIFEST.map((e) => e.textId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('active non-work entries declare a source file; blocked entries explain why', () => {
    for (const e of MANIFEST) {
      if (e.status === 'blocked') {
        expect(e.blockedReason, `${e.textId} blocked without reason`).toBeTruthy();
        continue;
      }
      if (e.source === 'macula' || e.source === 'macula-hebrew') {
        expect(e.book, `${e.textId} macula entry missing book`).toBeTruthy();
        expect(e.file, `${e.textId} macula entry missing file`).toBeTruthy();
      } else if (e.source !== 'work') {
        expect(e.file, `${e.textId} (${e.source}) missing source file`).toBeTruthy();
      }
    }
  });

  it('only commercially-usable attributions are active (blocked otherwise)', () => {
    for (const e of MANIFEST) {
      if (e.status !== 'active') continue;
      const attr = ATTRIBUTIONS[e.attribution];
      expect(attr.allowsCommercialUse, `${e.textId} active on non-commercial source`).toBe(true);
      expect(attr.allowsModification, `${e.textId} active on no-derivatives source`).toBe(true);
    }
  });
});

describe('ingestion manifest — coverage of bundled excerpts', () => {
  // Every bundled literary/LXX/patristic/ANE selection that is a SLICE of a
  // larger work must have a `*-full` target whose notes say `supersedes <id>`.
  // Bible excerpts (Jn-1, GrcMk, Gen, …) are covered by the Macula book tables
  // by ref, not by a supersedes note, so they are listed separately.
  const SUPERSEDED_BY_NOTE = [
    // Septuagint
    'LXX-Gen-1', 'LXX-Exod-12', 'LXX-Isa-6', 'LXX-Prov-1', 'LXX-Jonah-1',
    // Greek classics
    'Iliad-1', 'Odyssey-1', 'Anab-1', 'Aesop-1',
    'Hdt-Hist', 'Thuc-Hist', 'Soph-Ant', 'Plut-Alex', 'Lucian-Char',
    // Latin classics
    'Aeneid-1', 'Livy-AUC',
    'Sall-Cat', 'Tac-Ann', 'Lat-Cato', 'Lat-Vg-Jn',
    // Patristics
    '1Clem-1', 'Did-1', 'Ign-Eph', 'Polyc-Phil', 'Justin-Apol',
    'Hermas-Vis-1', 'Chrys-Jn-1', 'Basil-Hex-1', 'Athan-Inc-1',
    // Ancient Near Eastern / other
    'Cop-Jn-1', 'Arc-Gen-1', 'Hit-Annals-1', 'Uga-Baal-1', 'Egy-Ptah-1', 'Akk-Gilg-1',
  ];

  const allNotes = MANIFEST.map((e) => `${e.notes ?? ''}\n${e.blockedReason ?? ''}`).join('\n');

  it.each(SUPERSEDED_BY_NOTE)('bundled "%s" has a superseding full-text target', (id) => {
    expect(allNotes).toContain(`Supersedes ${id}`);
  });

  it('every superseded id is a real bundled text', () => {
    for (const id of SUPERSEDED_BY_NOTE) {
      expect(CorpusDB.getText(id), `${id} not found in bundle`).toBeTruthy();
    }
  });

  // These bundled excerpts were deleted outright (inauthentic content); their
  // ids survive only as Reader redirects. The manifest still records the
  // supersedes note, but the ids must NOT resolve as bundled texts.
  const RETIRED_TO_REDIRECT = ['Plato-Apology-1', 'Cic-Catilina-1', 'Ovid-Metamorphoses-1'];

  it.each(RETIRED_TO_REDIRECT)('retired "%s" has a superseding full-text target', (id) => {
    expect(allNotes).toContain(`Supersedes ${id}`);
  });

  it('retired ids are redirected, not bundled', async () => {
    const { TEXT_ID_REDIRECTS } = await import('../../../../src/lib/constants/textRedirects.js');
    for (const id of RETIRED_TO_REDIRECT) {
      expect(CorpusDB.getText(id), `${id} must stay deleted`).toBeFalsy();
      expect(TEXT_ID_REDIRECTS[id], `${id} missing a Reader redirect`).toBeTruthy();
    }
  });
});
