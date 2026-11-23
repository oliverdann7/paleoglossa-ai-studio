import { describe, it, expect } from 'vitest';
import { cleanSections, isJunkToken, repairMojibake } from '../clean.js';
import { segmentWork } from '../segment.js';

/** Read UTF-8 as Latin-1, the way the Latin Library fetcher once did. */
const misdecode = (s: string): string => Buffer.from(s, 'utf8').toString('latin1');

/** One section from sentences written as plain strings. */
function section(...sentences: string[]) {
  return {
    sentences: sentences.map((src) => ({
      tokens: src.split(' ').map((surface) => ({ surface, normalized: '', lemma: '', gloss: '', punctAfter: ' ' })),
    })),
  };
}
const text = (s: { sentences: Array<{ tokens: Array<{ surface: string }> }> }): string[] =>
  s.sentences.map((sentence) => sentence.tokens.map((t) => t.surface).join(' '));

function clean(...sentences: string[]): string[] {
  const s = section(...sentences);
  cleanSections([s], 'lat');
  return text(s);
}

describe('isJunkToken', () => {
  it('drops section numbers however they are wrapped', () => {
    for (const s of ['12', '[1]', '[5.6]', '(18)', '24;', '3.', '5)', '[F3]', '22a', 'l0.']) {
      expect(isJunkToken(s, 'lat'), s).toBe(true);
    }
  });

  it('keeps words, bracketed words and numerals written as words', () => {
    for (const s of ['[vero]', '(nam', 'est),', 'qu[i]a', 'XII', 'L.', 'es1', 'O', 'lO']) {
      expect(isJunkToken(s, 'lat'), s).toBe(false);
    }
  });
});

describe('repairMojibake', () => {
  it('restores UTF-8 that was decoded as Latin-1', () => {
    expect(repairMojibake(misdecode('canō'))).toBe('canō');
    expect(repairMojibake(misdecode('Ītaliam,'))).toBe('Ītaliam,');
    expect(repairMojibake(misdecode('–'))).toBe('–');
  });

  it('leaves correctly decoded text alone, including characters outside Latin-1', () => {
    for (const s of ['cano', 'canō', 'café', 'Argis—', 'λόγος', 'בְּרֵאשִׁית']) expect(repairMojibake(s)).toBe(s);
    expect(repairMojibake(`${misdecode('Argīs')}—`)).toBe('Argīs—');
  });
});

describe('cleanSections — mis-decoded tokens', () => {
  it('respells the token, drops its macrons, and clears what was derived from the damage', () => {
    const s = {
      sentences: [
        {
          tokens: [
            // What the tokenizer made of `ōrīs`: `«` taken for punctuation, a lemma guessed from `ara«s`.
            { surface: misdecode('ōrīs'), normalized: 'ara«s', lemma: 'ara', gloss: 'altar', lemmaSource: 'whitaker', punctAfter: ' ' },
            { surface: misdecode('quī'), normalized: 'qua', lemma: 'qua', gloss: 'where', glossSource: 'whitaker-words', punctAfter: '« ' },
            { surface: misdecode('canō,'), normalized: 'cana', lemma: '', gloss: '', punctAfter: ', ' },
            { surface: 'Arma', normalized: 'arma', lemma: 'arma', gloss: 'arms', punctAfter: ' ' },
          ],
        },
      ],
    };
    const stats = cleanSections([s], 'lat');
    expect(s.sentences[0].tokens).toEqual([
      { surface: 'oris', normalized: 'oris', lemma: '', gloss: '', punctAfter: ' ' },
      { surface: 'qui', normalized: 'qui', lemma: '', gloss: '', punctAfter: ' ' },
      { surface: 'cano,', normalized: 'cano', lemma: '', gloss: '', punctAfter: ', ' },
      { surface: 'Arma', normalized: 'arma', lemma: 'arma', gloss: 'arms', punctAfter: ' ' },
    ]);
    expect(stats).toEqual({ tokensRemoved: 0, sentencesRemoved: 0, tokensRepaired: 3 });
  });

  it('turns a dash that became a token back into punctuation', () => {
    const s = section(`eiciebam ${misdecode('–')} non enim iam vereor`);
    cleanSections([s], 'lat');
    expect(text(s)).toEqual(['eiciebam non enim iam vereor']);
    expect(s.sentences[0].tokens[0].punctAfter).toBe(' – ');
  });

  it('cuts off a verse number run onto the end of a word', () => {
    expect(clean('inhonoratis me.50 Ego autem', 'Abraham vidisti?"58 Dixit eis')).toEqual([
      'inhonoratis me. Ego autem',
      'Abraham vidisti?" Dixit eis',
    ]);
  });

  it('corrects a known misprint of the source', () => {
    const s = section('tamen hanc sufferre molestum es1');
    s.sentences[0].tokens[4].lemma = 'es1';
    expect(cleanSections([s], 'lat').tokensRepaired).toBe(1);
    expect(s.sentences[0].tokens[4]).toMatchObject({ surface: 'est', normalized: 'est', lemma: '' });
  });

  it('does not strip macrons from text that was decoded correctly', () => {
    expect(clean('Arma virumque canō')).toEqual(['Arma virumque canō']);
  });
});

describe('cleanSections — Latin Library page furniture', () => {
  it('drops the title line fused onto the first sentence', () => {
    expect(clean('P.', 'VERGILI MARONIS AENEIDOS LIBER PRIMVS Arma virumque cano', 'Musa, mihi causas memora')).toEqual([
      'Arma virumque cano',
      'Musa, mihi causas memora',
    ]);
    expect(clean('TITI LIVI AB VRBE CONDITA LIBER I [1] Iam primum omnium')).toEqual(['Iam primum omnium']);
    expect(clean('ORATIO IN L.', 'CATILINAM PRIMA [1] I.', 'Quo usque tandem')).toEqual(['Quo usque tandem']);
  });

  it('leaves a praenomen after the title to the text it belongs to', () => {
    expect(clean('CORNELI TACITI ANNALIVM LIBER QVARTVS [1] C.', 'Asinio C.', 'Antistio consulibus')).toEqual([
      'C.',
      'Asinio C.',
      'Antistio consulibus',
    ]);
  });

  it('does not take capitals elsewhere for a title', () => {
    const untouched = [
      ['L.', 'Tarquinius Collatinus consul fuit'],
      ['ipse suos gemitus foliis inscribit, et AI AI flos habet inscriptum'],
      ['SPQR in signis erat'],
    ];
    for (const sentences of untouched) expect(clean(...sentences)).toEqual(sentences);
  });

  it('drops chapter numbers standing alone, but not the numeral of a date', () => {
    expect(clean('ad mortem te duci oportebat.', '[4] II.', 'Decrevit quondam senatus')).toEqual([
      'ad mortem te duci oportebat.',
      'Decrevit quondam senatus',
    ]);
    const date = ['Germanicus Caesar a.', 'd.', 'VII.', 'Kal.', 'Iunias triumphavit'];
    expect(clean(...date)).toEqual(date);
    const praenomen = ['Iunius Brutus et L.', 'Tarquinius Collatinus.', 'C.', 'Asinio consule'];
    expect(clean(...praenomen)).toEqual(praenomen);
  });

  it('drops the English notes and navigation links at the end of a page', () => {
    expect(
      clean(
        'ita enim servabis me, et ero ipse tecum.',
        'Submitted by James J.',
        "O'Donnell (Univ.",
        'of Pennsylvania) from his new edition.',
        'Prof.',
        "O'Donnell's introduction and commentary may be found at the original site:",
        'The Confessions of Augustine:',
        'An Electronic Edition Augustine Christian Latin'
      )
    ).toEqual(['ita enim servabis me, et ero ipse tecum.']);
  });

  it('finds a footer that starts mid-sentence, after a closing quote', () => {
    expect(clean("et dicis, 'currite, ego feram.' Submitted by James J.", "O'Donnell (Univ.", 'Augustine Christian Latin')).toEqual([
      "et dicis, 'currite, ego feram.'",
    ]);
    expect(clean("sustinet angues.' Ovid")).toEqual(["sustinet angues.'"]);
    expect(clean('sensus coniungere binos. Medieval Latin')).toEqual(['sensus coniungere binos.']);
  });

  it('drops a bare author link and a closing FINIS', () => {
    expect(clean('scelerum foedere vivos mortuosque mactabis.', 'Cicero')).toEqual([
      'scelerum foedere vivos mortuosque mactabis.',
    ]);
    expect(clean('posse mori, non posse superari.', 'FINIS St.', 'Jerome Christina Latin')).toEqual([
      'posse mori, non posse superari.',
    ]);
    expect(clean('In principio erat Verbum.', 'The Bible Christian Latin')).toEqual(['In principio erat Verbum.']);
  });

  it('keeps a Latin name that ends a real sentence', () => {
    const real = ['hoc dixit Cicero', 'tum respondit Tacitus'];
    expect(clean(...real)).toEqual(real);
  });

  it('drops stray English words inside the text', () => {
    expect(clean('ut invocent te et liberes eos.', 'commentary on audieram enim ego adhuc puer')).toEqual([
      'ut invocent te et liberes eos.',
      'audieram enim ego adhuc puer',
    ]);
  });

  it('reports what it removed and is idempotent', () => {
    const s = section('P.', 'VERGILI MARONIS AENEIDOS LIBER PRIMVS Arma [1] virumque cano.', 'Vergil');
    expect(cleanSections([s], 'lat')).toEqual({ tokensRemoved: 8, sentencesRemoved: 2, tokensRepaired: 0 });
    expect(text(s)).toEqual(['Arma virumque cano.']);
    expect(cleanSections([s], 'lat')).toEqual({ tokensRemoved: 0, sentencesRemoved: 0, tokensRepaired: 0 });
  });

  it('applies the page rules to Latin only', () => {
    const s = section('THE EPIC OF GILGAMESH', 'sha naqba imuru');
    cleanSections([s], 'akk');
    expect(text(s)).toEqual(['THE EPIC OF GILGAMESH', 'sha naqba imuru']);
  });
});

describe('segmentWork', () => {
  it('cleans page furniture and mis-decoded text at ingest', () => {
    const sections = segmentWork({
      textId: 'lat-test',
      language: 'lat',
      sections: [
        {
          id: 'lat-test-1',
          sequence: 1,
          label: 'Liber I',
          sentences: [
            { id: 'lat-test-1-1', src: 'P.' },
            { id: 'lat-test-1-2', src: `VERGILI MARONIS AENEIDOS LIBER PRIMVS Arma virumque ${misdecode('canō')}, [1] Troiae qui primus ab oris.` },
            { id: 'lat-test-1-3', src: 'Vergil' },
          ],
        },
      ],
    } as Parameters<typeof segmentWork>[0]);
    expect(sections[0].sentences).toHaveLength(1);
    expect(sections[0].sentences[0].tokens.map((t) => t.surface)).toEqual([
      'Arma', 'virumque', 'cano,', 'Troiae', 'qui', 'primus', 'ab', 'oris.',
    ]);
    expect(sections[0].sentences[0].tokens[2].normalized).toBe('cano');
  });
});
