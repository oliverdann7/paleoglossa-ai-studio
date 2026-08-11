/**
 * Phase-2 gloss recovery for the served Greek corpus (zero AI).
 *
 * The 2026-08 audit showed the ~50% gloss coverage in grc / merged classical
 * texts is a pure dictionary-lookup miss: the original gloss pass keyed on the
 * token's `normalized` form and (a) kept Greek elision marks (U+1FBD/U+1FBF)
 * so elided forms never matched, (b) had no fold for Ionic iota-adscript
 * spellings (`τωι` vs `τῷ`), and (c) missed keys with glued punctuation.
 *
 * This script rebuilds a surface- and lemma-keyed gloss map from the Macula
 * Greek TSV (Clear-Bible, CC BY 4.0, `.sources/macula-greek.tsv`), adds a
 * hand-curated epic/Ionic function-word list (standard short-lexicon glosses),
 * and FILLS ONLY EMPTY gloss/lemma fields in `public/corpus-data` texts with
 * language `grc` or `grc-koine`. Existing annotations are never overwritten.
 *
 * Usage: npx tsx scripts/corpus/regloss-served-greek.ts [--dry-run]
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const TSV = 'scripts/corpus/ingest/.sources/macula-greek.tsv';
const DIR = 'public/corpus-data';
const dryRun = process.argv.includes('--dry-run');

// ── Normalization ────────────────────────────────────────────────────────────

/** Canonical key: NFD, combining marks stripped, lowercased, elision marks → ', edge punctuation stripped. */
function normKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯͅ]/g, '')
    .toLowerCase()
    .replace(/[’ʼ᾽᾿]/g, "'")
    .replace(/^[^\p{L}']+|[^\p{L}']+$/gu, '')
    .trim();
}

/** Ionic iota-adscript fold: word-final -ωι/-ηι → -ω/-η (τωι → τω matches τῷ's stripped key). */
function foldAdscript(key: string): string {
  return key.replace(/(ω|η)ι$/, '$1');
}

// ── Macula maps ──────────────────────────────────────────────────────────────

interface Entry {
  gloss: string;
  lemma: string;
}

function mostFrequent(counter: Map<string, number>): string {
  let best = '';
  let n = -1;
  for (const [v, c] of counter) if (c > n) ((best = v), (n = c));
  return best;
}

function buildMaculaMaps(): { bySurface: Map<string, Entry>; byLemma: Map<string, string> } {
  const surfTally = new Map<string, Map<string, number>>();
  const lemmaTally = new Map<string, Map<string, number>>();
  const lines = readFileSync(TSV, 'utf-8').split('\n');
  const header = lines[0].split('\t');
  const ci = Object.fromEntries(header.map((h, i) => [h, i]));
  for (let i = 1; i < lines.length; i++) {
    const r = lines[i].split('\t');
    const surface = (r[ci.text] ?? '').trim();
    const gloss = (r[ci.gloss] ?? '').trim();
    const lemma = (r[ci.lemma] ?? '').trim();
    if (!surface || !gloss) continue;
    const sk = normKey(surface);
    if (sk) {
      let t = surfTally.get(sk);
      if (!t) surfTally.set(sk, (t = new Map()));
      const v = JSON.stringify([gloss, lemma]);
      t.set(v, (t.get(v) ?? 0) + 1);
    }
    const lk = normKey(lemma);
    if (lk) {
      let t = lemmaTally.get(lk);
      if (!t) lemmaTally.set(lk, (t = new Map()));
      t.set(gloss, (t.get(gloss) ?? 0) + 1);
    }
  }
  const bySurface = new Map<string, Entry>();
  for (const [k, t] of surfTally) {
    const [gloss, lemma] = JSON.parse(mostFrequent(t)) as [string, string];
    bySurface.set(k, { gloss, lemma });
  }
  const byLemma = new Map<string, string>();
  for (const [k, t] of lemmaTally) byLemma.set(k, mostFrequent(t));
  return { bySurface, byLemma };
}

// ── Curated epic / Ionic function words ──────────────────────────────────────
// Standard short glosses (LSJ / Autenrieth style) for high-frequency Homeric
// and Herodotean forms that never occur in the NT. Keys are canonical
// (normKey output: accentless, lowercase, elision mark = ').
const CURATED: Record<string, Entry> = {
  // Elided particles / pronouns (epic)
  "τ'": { gloss: 'and', lemma: 'τε' },
  "δ'": { gloss: 'but; and', lemma: 'δέ' },
  "θ'": { gloss: 'and', lemma: 'τε' },
  "ρ'": { gloss: 'then; as you know', lemma: 'ἄρα' },
  "αρ'": { gloss: 'then; as you know', lemma: 'ἄρα' },
  "μ'": { gloss: 'me', lemma: 'ἐγώ' },
  "σ'": { gloss: 'you', lemma: 'σύ' },
  "γ'": { gloss: 'at least; indeed', lemma: 'γε' },
  "ουδ'": { gloss: 'and not; nor', lemma: 'οὐδέ' },
  "μηδ'": { gloss: 'and not; nor', lemma: 'μηδέ' },
  "ηδ'": { gloss: 'and', lemma: 'ἠδέ' },
  "καθ'": { gloss: 'down; according to', lemma: 'κατά' },
  "μεθ'": { gloss: 'with; after', lemma: 'μετά' },
  "εφ'": { gloss: 'on; upon', lemma: 'ἐπί' },
  "υφ'": { gloss: 'under; by', lemma: 'ὑπό' },
  "ανθ'": { gloss: 'instead of; in return for', lemma: 'ἀντί' },
  // Epic particles
  κεν: { gloss: '(conditional particle, = ἄν)', lemma: 'κεν' },
  κε: { gloss: '(conditional particle, = ἄν)', lemma: 'κεν' },
  νυ: { gloss: 'now; then (enclitic)', lemma: 'νυ' },
  ρα: { gloss: 'then; as you know', lemma: 'ἄρα' },
  αρα: { gloss: 'then; therefore', lemma: 'ἄρα' },
  αυταρ: { gloss: 'but; moreover', lemma: 'αὐτάρ' },
  αταρ: { gloss: 'but; yet', lemma: 'ἀτάρ' },
  ηδε: { gloss: 'and', lemma: 'ἠδέ' },
  ημεν: { gloss: 'both … (with ἠδέ)', lemma: 'ἠμέν' },
  ηυτε: { gloss: 'as; like', lemma: 'ἠΰτε' },
  οφρα: { gloss: 'until; so that', lemma: 'ὄφρα' },
  τοφρα: { gloss: 'so long; meanwhile', lemma: 'τόφρα' },
  ενθα: { gloss: 'there; then', lemma: 'ἔνθα' },
  ενθεν: { gloss: 'from there; whence', lemma: 'ἔνθεν' },
  αιψα: { gloss: 'quickly; at once', lemma: 'αἶψα' },
  ωκα: { gloss: 'swiftly', lemma: 'ὦκα' },
  εισοκε: { gloss: 'until', lemma: 'εἰσόκε' },
  // Epic pronouns / articles
  μιν: { gloss: 'him; her; it', lemma: 'μιν' },
  σφι: { gloss: 'to them', lemma: 'σφεῖς' },
  σφιν: { gloss: 'to them', lemma: 'σφεῖς' },
  σφισι: { gloss: 'to them', lemma: 'σφεῖς' },
  σφεας: { gloss: 'them', lemma: 'σφεῖς' },
  σφεων: { gloss: 'of them', lemma: 'σφεῖς' },
  τοι: { gloss: 'to you; you know (enclitic)', lemma: 'τοι' },
  τοισι: { gloss: 'to the; to these', lemma: 'ὁ' },
  τῃσι: { gloss: 'to the; to these (fem.)', lemma: 'ὁ' },
  τησι: { gloss: 'to the; to these (fem.)', lemma: 'ὁ' },
  // Ionic (Herodotus)
  ων: { gloss: 'then; therefore (Ionic = οὖν)', lemma: 'οὖν' },
  εων: { gloss: 'being (Ionic ptc. of εἰμί)', lemma: 'εἰμί' },
  εουσα: { gloss: 'being (fem., Ionic)', lemma: 'εἰμί' },
  εοντες: { gloss: 'being (pl., Ionic)', lemma: 'εἰμί' },
  εοντα: { gloss: 'being (Ionic)', lemma: 'εἰμί' },
  εωυτου: { gloss: 'of himself (Ionic)', lemma: 'ἑαυτοῦ' },
  εωυτον: { gloss: 'himself (Ionic)', lemma: 'ἑαυτοῦ' },
  εωυτων: { gloss: 'of themselves (Ionic)', lemma: 'ἑαυτοῦ' },
  κως: { gloss: 'somehow; in any way (Ionic)', lemma: 'πως' },
  κοτε: { gloss: 'ever; at some time (Ionic)', lemma: 'ποτέ' },
  κου: { gloss: 'somewhere; I suppose (Ionic)', lemma: 'που' },
  οκως: { gloss: 'how; in order that (Ionic)', lemma: 'ὅπως' },
  ουτω: { gloss: 'thus; so', lemma: 'οὕτως' },
  ωδε: { gloss: 'thus; in this way', lemma: 'ὧδε' },
  ενθαυτα: { gloss: 'there; then (Ionic)', lemma: 'ἐνταῦθα' },
  εντευθεν: { gloss: 'from there; thereupon', lemma: 'ἐντεῦθεν' },
  εμεωυτου: { gloss: 'of myself (Ionic)', lemma: 'ἐμαυτοῦ' },
  ουδαμα: { gloss: 'never (Ionic)', lemma: 'οὐδαμά' },
  ουδαμως: { gloss: 'in no way', lemma: 'οὐδαμῶς' },
};

// ── Fill pass ────────────────────────────────────────────────────────────────

interface ServedToken {
  surface: string;
  normalized: string;
  lemma: string;
  gloss: string;
}
interface ServedRecord {
  text: { id: string; language: string };
  sections: { sentences: { tokens: ServedToken[] }[] }[];
}

const { bySurface, byLemma } = buildMaculaMaps();
console.log(`Macula maps: ${bySurface.size} surface keys, ${byLemma.size} lemma keys`);

function resolve(token: ServedToken): Entry | undefined {
  const candidates = [normKey(token.normalized), normKey(token.surface)];
  // Macula stores elided forms bare (the mark lives in its `after` column), so
  // δι᾽ must also be tried as δι.
  const bare = candidates.map((k) => k.replace(/'+$/, ''));
  for (const key of [...candidates, ...candidates.map(foldAdscript), ...bare]) {
    if (!key) continue;
    const cur = CURATED[key];
    if (cur) return cur;
    const hit = bySurface.get(key);
    if (hit) return hit;
  }
  // Last resort: the token's own lemma (when present) against Macula lemmas.
  if (token.lemma) {
    const lg = byLemma.get(normKey(token.lemma));
    if (lg) return { gloss: lg, lemma: token.lemma };
  }
  return undefined;
}

let grandTokens = 0;
let grandFilled = 0;
for (const file of readdirSync(DIR).sort()) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const path = join(DIR, file);
  const record = JSON.parse(readFileSync(path, 'utf-8')) as ServedRecord;
  if (record.text.language !== 'grc' && record.text.language !== 'grc-koine') continue;

  let tokens = 0;
  let empty = 0;
  let filled = 0;
  for (const section of record.sections) {
    for (const sentence of section.sentences) {
      for (const token of sentence.tokens) {
        tokens++;
        if (token.gloss && token.gloss.trim() !== '') continue;
        empty++;
        const hit = resolve(token);
        if (!hit) continue;
        token.gloss = hit.gloss;
        if (!token.lemma || token.lemma.trim() === '') {
          token.lemma = hit.lemma || token.normalized;
        }
        filled++;
      }
    }
  }
  grandTokens += tokens;
  grandFilled += filled;
  if (filled > 0 && !dryRun) writeFileSync(path, JSON.stringify(record), 'utf-8');
  if (empty > 0) {
    console.log(
      `${record.text.id}: filled ${filled}/${empty} empty (coverage ${(
        ((tokens - empty + filled) / tokens) * 100
      ).toFixed(1)}%)`
    );
  }
}
console.log(
  `\nTotal: +${grandFilled} glosses across ${grandTokens} Greek tokens${dryRun ? ' (dry run)' : ''}`
);
