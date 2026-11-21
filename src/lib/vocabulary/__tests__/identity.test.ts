import { describe, it, expect } from 'vitest';
import {
  GREEK_DISTINCT_HOMOGRAPH_FORMS,
  MAX_SHORT_DOC_ID,
  legacyLemmaKey,
  legacyVocabDocId,
  normalizeLemma,
  parseVocabKey,
  vocabDocId,
  vocabKey,
} from '../identity.js';

describe('vocabKey — language scoping', () => {
  it('keeps the same spelling in two languages apart', () => {
    // מֶלֶךְ is "king" in both Biblical Hebrew and Aramaic; λόγος in Attic and Koine.
    expect(vocabKey('מֶלֶךְ', 'hbo')).not.toBe(vocabKey('מֶלֶךְ', 'arc'));
    expect(vocabKey('λόγος', 'grc')).not.toBe(vocabKey('λόγος', 'grc-koine'));
    expect(vocabDocId('מֶלֶךְ', 'hbo')).not.toBe(vocabDocId('מֶלֶךְ', 'arc'));
  });

  it('round-trips through parseVocabKey', () => {
    expect(parseVocabKey(vocabKey('λόγος', 'grc-koine'))).toEqual({
      languageId: 'grc-koine',
      normalized: 'λογος',
    });
    expect(parseVocabKey(vocabKey('amo')).languageId).toBe('unknown');
  });

  it('is idempotent for every language', () => {
    const samples: [string, string][] = [
      ['εἷς', 'grc'],
      ['Καὶ', 'grc-koine'],
      ['Jūlius', 'lat'],
      ['בְּרֵאשִׁ֖ית', 'hbo'],
      ['מַלְכָּא', 'arc'],
      ['ܡܠܟܐ', 'syr'],
      ['ḥr', 'egy'],
    ];
    for (const [lemma, lang] of samples) {
      const once = normalizeLemma(lemma, lang);
      expect(normalizeLemma(once, lang)).toBe(once);
      expect(once.length).toBeGreaterThan(0);
    }
  });
});

describe('Greek', () => {
  it('matches accented and unaccented spellings of one lemma (the corpus mixes both)', () => {
    for (const lang of ['grc', 'grc-koine']) {
      expect(vocabKey('καί', lang)).toBe(vocabKey('και', lang));
      expect(vocabKey('καὶ', lang)).toBe(vocabKey('καί', lang)); // grave ≡ acute
      expect(vocabKey('Λόγος', lang)).toBe(vocabKey('λόγος', lang));
      expect(vocabKey('οὔ', lang)).toBe(vocabKey('οὐ', lang));
    }
  });

  it('separates lemmas distinguished only by diacritics', () => {
    expect(vocabKey('εἷς', 'grc-koine')).not.toBe(vocabKey('εἰς', 'grc-koine'));
    expect(vocabKey('εἶμι', 'grc')).not.toBe(vocabKey('εἰμί', 'grc'));
    expect(vocabKey('τίς', 'grc-koine')).not.toBe(vocabKey('τις', 'grc-koine'));
    expect(vocabKey('ἦ', 'grc')).not.toBe(vocabKey('ἤ', 'grc'));
    expect(vocabKey('οὗ', 'grc')).not.toBe(vocabKey('οὐ', 'grc'));
  });

  it('recognises a homograph however it is encoded', () => {
    const key = vocabKey('εἷς', 'grc');
    expect(vocabKey('εἷς'.normalize('NFD'), 'grc')).toBe(key);
    expect(vocabKey('Εἷς', 'grc')).toBe(key);
    expect(vocabKey(' εἷς, ', 'grc')).toBe(key);
  });

  it('sends unaccented input to the commoner word, so existing data keeps its meaning', () => {
    expect(vocabKey('εις', 'grc-koine')).toBe(vocabKey('εἰς', 'grc-koine'));
    expect(vocabDocId('εἰς', 'grc-koine')).toBe(legacyVocabDocId('εἰς', 'grc-koine'));
  });

  it('every listed homograph really collides with a partner without its diacritics', () => {
    for (const form of GREEK_DISTINCT_HOMOGRAPH_FORMS) {
      expect(normalizeLemma(form, 'grc')).toBe(form);
      expect(legacyLemmaKey(form)).not.toBe(form);
    }
    expect(new Set(GREEK_DISTINCT_HOMOGRAPH_FORMS).size).toBe(
      GREEK_DISTINCT_HOMOGRAPH_FORMS.length
    );
  });

  it('does not apply Greek homograph rules to other languages', () => {
    expect(vocabKey('εἷς', 'cop')).toBe('cop:εις');
  });
});

describe('Latin', () => {
  it('folds case, macrons, i/j, u/v and ligatures', () => {
    expect(vocabKey('Rōmānus', 'lat')).toBe(vocabKey('romanus', 'lat'));
    expect(vocabKey('jam', 'lat')).toBe(vocabKey('iam', 'lat'));
    expect(vocabKey('uidi', 'lat')).toBe(vocabKey('vidi', 'lat'));
    expect(vocabKey('SECVNDVS', 'lat')).toBe(vocabKey('secundus', 'lat'));
    expect(vocabKey('cælum', 'lat')).toBe(vocabKey('caelum', 'lat'));
    expect(vocabKey('pœna', 'lat')).toBe(vocabKey('poena', 'lat'));
  });

  it('leaves u/v alone outside Latin', () => {
    expect(normalizeLemma('vir', 'unknown')).toBe('vir');
  });
});

describe('Hebrew and Aramaic', () => {
  it('keeps vowel points — they distinguish lexemes', () => {
    // דָּבָר word · דֶּבֶר plague
    expect(vocabKey('דָּבָר', 'hbo')).not.toBe(vocabKey('דֶּבֶר', 'hbo'));
    expect(vocabKey('מַלְכָּא', 'arc')).not.toBe(vocabKey('מלכא', 'arc'));
  });

  it('drops cantillation, meteg and edge punctuation', () => {
    expect(vocabKey('בְּרֵאשִׁ֖ית', 'hbo')).toBe(vocabKey('בְּרֵאשִׁית', 'hbo'));
    expect(vocabKey('הָֽאָרֶץ׃', 'hbo')).toBe(vocabKey('הָאָרֶץ', 'hbo'));
    expect(vocabKey('כּוֹכְבַיָּא:', 'arc')).toBe(vocabKey('כּוֹכְבַיָּא', 'arc'));
  });

  it('is insensitive to the order points were typed in', () => {
    const dageshFirst = 'דָּבר';
    const vowelFirst = 'דָּבר';
    expect(vocabKey(dageshFirst, 'hbo')).toBe(vocabKey(vowelFirst, 'hbo'));
  });
});

describe('Syriac', () => {
  it('keeps the unvocalised lemmas the corpus uses, unchanged from the previous key', () => {
    expect(normalizeLemma('ܡܠܟܐ', 'syr')).toBe(legacyLemmaKey('ܡܠܟܐ'));
    expect(vocabDocId('ܡܠܟܐ', 'syr')).toBe(legacyVocabDocId('ܡܠܟܐ', 'syr'));
  });

  it('does not collide with Aramaic in square script', () => {
    expect(vocabKey('ܡܠܟܐ', 'syr')).not.toBe(vocabKey('מלכא', 'arc'));
  });
});

describe('transliterated languages', () => {
  it('keeps phonemic diacritics that the old key erased', () => {
    // Egyptian ḥr "face" · ẖr "under" · ḫr "with" all used to become "hr".
    const keys = ['ḥr', 'ẖr', 'ḫr', 'hr'].map((l) => vocabKey(l, 'egy'));
    expect(new Set(keys).size).toBe(4);
    expect(vocabKey('šarrum', 'akk')).not.toBe(vocabKey('sarrum', 'akk'));
    expect(vocabKey('ṣēru', 'akk')).not.toBe(vocabKey('šēru', 'akk'));
  });
});

describe('vocabDocId', () => {
  it('is byte-identical to the previous ID for ordinary lemmas', () => {
    const unchanged: [string, string][] = [
      ['λόγος', 'grc-koine'],
      ['καί', 'grc'],
      ['amo', 'lat'],
      ['דָּבָר', 'hbo'],
      ['ܡܠܟܐ', 'syr'],
      ['ϫⲱ', 'cop'],
    ];
    for (const [lemma, lang] of unchanged) {
      expect(vocabDocId(lemma, lang)).toBe(legacyVocabDocId(lemma, lang));
    }
  });

  it('no longer collides for long words sharing a prefix', () => {
    const a = 'ταπεινοφροσύνη';
    const b = 'ταπεινοφροσύνης';
    expect(legacyVocabDocId(a, 'grc-koine')).toBe(legacyVocabDocId(b, 'grc-koine'));
    expect(vocabDocId(a, 'grc-koine')).not.toBe(vocabDocId(b, 'grc-koine'));
  });

  it('no longer collides for saved sentences with the same opening', () => {
    const a = 'καὶ εἶπεν αὐτοῖς ὁ Ἰησοῦς Δεῦτε ὀπίσω μου';
    const b = 'καὶ εἶπεν αὐτοῖς Ὑμεῖς δὲ τίνα με λέγετε εἶναι';
    expect(legacyVocabDocId(a, 'grc-koine')).toBe(legacyVocabDocId(b, 'grc-koine'));
    expect(vocabDocId(a, 'grc-koine')).not.toBe(vocabDocId(b, 'grc-koine'));
  });

  it('produces valid, bounded Firestore IDs', () => {
    const long = 'λόγος '.repeat(400);
    const id = vocabDocId(long, 'grc');
    expect(id.length).toBeLessThanOrEqual(MAX_SHORT_DOC_ID);
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(vocabDocId(long, 'grc')).toBe(id);
  });
});
