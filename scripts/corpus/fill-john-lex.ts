#!/usr/bin/env tsx
/**
 * Generate the gap-filling lexicon for the bundled Gospel of John (`Jn-full`,
 * src/data/corpus/john-full.ts).
 *
 * `Jn-full` ships the full Greek text but ~1745 distinct word-forms had no gloss
 * / POS (they fell through the hand-authored JN_LEX), so the text was marked
 * `complete` while failing the completeness gate (validateTextAnnotations) and
 * was carried as a known-error baseline. This script closes that gap WITHOUT
 * bulk-expanding the bundle: it only adds a lexicon map, not new sentences.
 *
 * Source of meanings: Macula Greek (Clear-Bible, CC BY 4.0) — the same
 * scholar-grade data the ingestion pipeline uses — keyed by the identical
 * normalization john-full.ts applies in `sent()` (NFD, strip combining marks,
 * lowercase). A small curated RESIDUAL map covers SBLGNT spelling/elision
 * variants absent from the Nestle1904 Macula keys (e.g. Σαμαρ-, Πιλᾶτος, δ’).
 *
 * Run: tsx scripts/corpus/fill-john-lex.ts
 * Requires the Macula Greek TSV at scripts/corpus/ingest/.sources/macula-greek.tsv
 * (fetch per scripts/corpus/ingest/README.md). Writes the emitted TS object to
 * scripts/corpus/.john-lex-macula.generated.ts for review; paste it into
 * john-full.ts as `JN_LEX_MACULA` and add it to the `sent()` lookup chain.
 */
import { readFileSync, writeFileSync } from 'fs';
import { CorpusDB } from '../../src/data/corpus.js';

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const POS: Record<string, string> = {
  noun: 'noun', verb: 'verb', adj: 'adjective', adv: 'adverb',
  det: 'determiner', art: 'article', conj: 'conjunction', prep: 'preposition',
  ptcl: 'particle', pron: 'pronoun', intj: 'interjection', num: 'numeral',
};

const TSV_PATH = 'scripts/corpus/ingest/.sources/macula-greek.tsv';

interface Combo { lemma: string; gloss: string; pos: string; n: number }

function buildMaculaMap(): Map<string, Map<string, Combo>> {
  const tsv = readFileSync(TSV_PATH, 'utf-8');
  const lines = tsv.split(/\r?\n/);
  const header = lines[0].split('\t');
  const ci = (n: string) => header.indexOf(n);
  const cText = ci('text');
  const cLemma = ci('lemma');
  const cGloss = ci('gloss');
  const cClass = ci('class');
  const map = new Map<string, Map<string, Combo>>();
  for (let i = 1; i < lines.length; i++) {
    const r = lines[i].split('\t');
    if (r.length <= cText) continue;
    const text = (r[cText] || '').trim();
    if (!text) continue;
    const key = norm(text);
    if (!key) continue;
    const lemma = (r[cLemma] || '').trim();
    const gloss = (r[cGloss] || '').trim();
    if (!gloss || !lemma) continue;
    const pos = POS[(r[cClass] || '').trim()] || (r[cClass] || '').trim() || 'unknown';
    const combo = `${lemma} ${gloss} ${pos}`;
    if (!map.has(key)) map.set(key, new Map());
    const inner = map.get(key)!;
    const ex = inner.get(combo);
    if (ex) ex.n++;
    else inner.set(combo, { lemma, gloss, pos, n: 1 });
  }
  return map;
}

// SBLGNT spelling/elision variants not present as Nestle1904 Macula keys.
const RESIDUAL: Record<string, { lemma: string; gloss: string; pos: string }> = {
  ακολουθησωσιν: { lemma: 'ἀκολουθέω', gloss: 'they may follow', pos: 'verb' },
  ανεκυψεν: { lemma: 'ἀνακύπτω', gloss: 'straightened up', pos: 'verb' },
  ανηγγειλεν: { lemma: 'ἀναγγέλλω', gloss: 'announced', pos: 'verb' },
  αυτοφωρω: { lemma: 'αὐτόφωρος', gloss: 'in the very act', pos: 'adjective' },
  γενησονται: { lemma: 'γίνομαι', gloss: 'they will become', pos: 'verb' },
  διατι: { lemma: 'διατί', gloss: 'why?', pos: 'adverb' },
  'δ’': { lemma: 'δέ', gloss: 'but, and', pos: 'conjunction' },
  εγκαινια: { lemma: 'ἐγκαίνια', gloss: 'Feast of Dedication', pos: 'noun' },
  ελεγε: { lemma: 'λέγω', gloss: 'was saying', pos: 'verb' },
  ελυε: { lemma: 'λύω', gloss: 'was loosing', pos: 'verb' },
  ηλιας: { lemma: 'Ἠλίας', gloss: 'Elijah', pos: 'noun' },
  ηρε: { lemma: 'αἴρω', gloss: 'took up', pos: 'verb' },
  ιεροσολυμιτων: { lemma: 'Ἱεροσολυμίτης', gloss: 'of the people of Jerusalem', pos: 'noun' },
  ισραηλιτης: { lemma: 'Ἰσραηλίτης', gloss: 'Israelite', pos: 'noun' },
  καιτοιγε: { lemma: 'καίτοιγε', gloss: 'although indeed', pos: 'conjunction' },
  κατακυψας: { lemma: 'κατακύπτω', gloss: 'having stooped down', pos: 'verb' },
  κατεγραφεν: { lemma: 'καταγράφω', gloss: 'was writing', pos: 'verb' },
  κατειληπται: { lemma: 'καταλαμβάνω', gloss: 'has overtaken', pos: 'verb' },
  λευιτας: { lemma: 'Λευίτης', gloss: 'Levites', pos: 'noun' },
  λιθαζειν: { lemma: 'λιθάζω', gloss: 'to stone', pos: 'verb' },
  μηποτε: { lemma: 'μήποτε', gloss: 'lest, perhaps', pos: 'conjunction' },
  'ουδ᾽': { lemma: 'οὐδέ', gloss: 'not even, nor', pos: 'conjunction' },
  πιλατον: { lemma: 'Πιλᾶτος', gloss: 'Pilate (acc.)', pos: 'noun' },
  πιλατω: { lemma: 'Πιλᾶτος', gloss: 'Pilate (dat.)', pos: 'noun' },
  πυθεσθαι: { lemma: 'πυνθάνομαι', gloss: 'to inquire', pos: 'verb' },
  ραββουνι: { lemma: 'ῥαββουνί', gloss: 'Rabboni (my teacher)', pos: 'noun' },
  σαμαρειας: { lemma: 'Σαμάρεια', gloss: 'of Samaria', pos: 'noun' },
  σαμαριται: { lemma: 'Σαμαρίτης', gloss: 'Samaritans', pos: 'noun' },
  σαμαριταις: { lemma: 'Σαμαρίτης', gloss: 'to the Samaritans', pos: 'noun' },
  σαμαριτης: { lemma: 'Σαμαρίτης', gloss: 'a Samaritan', pos: 'noun' },
  σαμαριτιδος: { lemma: 'Σαμαρῖτις', gloss: 'Samaritan woman (gen.)', pos: 'noun' },
  σαμαριτις: { lemma: 'Σαμαρῖτις', gloss: 'Samaritan woman', pos: 'noun' },
  σαμαριτων: { lemma: 'Σαμαρίτης', gloss: 'of the Samaritans', pos: 'noun' },
  συγχρωνται: { lemma: 'συγχράομαι', gloss: 'associate with', pos: 'verb' },
  συμμαθηταις: { lemma: 'συμμαθητής', gloss: 'to fellow disciples', pos: 'noun' },
  συσταυρωθεντος: { lemma: 'συσταυρόω', gloss: 'having been crucified with', pos: 'verb' },
  τεσσαρα: { lemma: 'τέσσαρες', gloss: 'four', pos: 'numeral' },
};

function main(): void {
  const map = buildMaculaMap();
  const best = (key: string): Combo | null => {
    const inner = map.get(key);
    if (!inner) return null;
    return [...inner.values()].sort((a, b) => b.n - a.n)[0];
  };

  const t = CorpusDB.getText('Jn-full');
  if (!t) throw new Error('Jn-full not found');
  const sections = (t.sectionsPreview || [])
    .map((p) => CorpusDB.getSection(p.id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const gaps = new Set<string>();
  for (const s of sections)
    for (const sen of s.sentences)
      for (const tok of sen.tokens) {
        const noGloss = !tok.gloss || !tok.gloss.trim();
        const noPos = !tok.morphology || tok.morphology.partOfSpeech === 'unknown';
        const noLemma = !tok.lemma || !tok.lemma.trim();
        if (noGloss || noPos || noLemma) gaps.add(tok.normalized);
      }

  const out: Record<string, { lemma: string; gloss: string; pos: string }> = {};
  const stillMissing: string[] = [];
  for (const g of [...gaps].sort((a, b) => a.localeCompare(b))) {
    if (RESIDUAL[g]) {
      out[g] = RESIDUAL[g];
      continue;
    }
    const c = best(g);
    if (c) out[g] = { lemma: c.lemma, gloss: c.gloss, pos: c.pos };
    else stillMissing.push(g);
  }
  console.log(`gaps=${gaps.size} filled=${Object.keys(out).length} stillMissing=${stillMissing.length}`);
  if (stillMissing.length) console.log('STILL MISSING:', stillMissing.join('  '));

  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const keys = Object.keys(out).sort((a, b) => a.localeCompare(b));
  let ts = '';
  ts += '// Gap-filling lexicon — generated by scripts/corpus/fill-john-lex.ts from\n';
  ts += '// Macula Greek (Clear-Bible, CC BY 4.0) + curated SBLGNT spelling variants.\n';
  ts += '// Completes every token in this text that the hand-authored JN_LEX missed,\n';
  ts += '// so Jn-full passes the corpus completeness gate. Do not hand-edit; regenerate.\n';
  ts += 'const JN_LEX_MACULA: Record<string, { lemma: string; gloss: string; partOfSpeech?: string }> = {\n';
  for (const k of keys) {
    const v = out[k];
    const key = /^[α-ωΑ-Ω]+$/.test(k) ? k : `'${esc(k)}'`;
    ts += `  ${key}: { lemma: '${esc(v.lemma)}', gloss: '${esc(v.gloss)}', partOfSpeech: '${esc(v.pos)}' },\n`;
  }
  ts += '};\n';
  const outPath = 'scripts/corpus/.john-lex-macula.generated.ts';
  writeFileSync(outPath, ts, 'utf-8');
  console.log(`Emitted ${keys.length} entries to ${outPath}`);
}

main();
