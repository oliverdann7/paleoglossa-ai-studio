/**
 * Curated cross-language cognate pairs for common roots in Paleoglossa's corpus.
 *
 * Each entry maps a normalised lemma in one language to related lemmas in others.
 * Lookup is by {languageId}:{lemma.toLowerCase()}. Results are grouped by shared root.
 *
 * Coverage: Ancient Greek (grc), Latin (lat), Biblical Hebrew (hbo),
 *   Koine Greek (grc-koine), Sanskrit (san), Syriac (arc/syr).
 */

export interface CognateEntry {
  /** The root or etymological concept linking the group. */
  root: string;
  /** Optional brief note on the shared etymology. */
  note?: string;
  /** All related lemmas across languages. The lookup lemma itself is included. */
  cognates: { languageId: string; lemma: string; gloss: string }[];
}

/** Lookup key: `${languageId}:${lemma.toLowerCase()}` */
type LookupKey = string;

const RAW_GROUPS: CognateEntry[] = [
  // ── λόγος / logos / verbum / דָּבָר / वाच् ─────────────────────────────
  {
    root: '*leg- / *wekw-',
    note: 'PIE root for speech, reason, word',
    cognates: [
      { languageId: 'grc', lemma: 'λόγος', gloss: 'word, reason, account' },
      { languageId: 'grc', lemma: 'λέγω', gloss: 'to say, to speak' },
      { languageId: 'lat', lemma: 'verbum', gloss: 'word' },
      { languageId: 'lat', lemma: 'loquor', gloss: 'to speak' },
      { languageId: 'hbo', lemma: 'דָּבָר', gloss: 'word, thing' },
      { languageId: 'san', lemma: 'vāc', gloss: 'speech, word' },
    ],
  },
  // ── θεός / deus / אֱלֹהִים ───────────────────────────────────────────────
  {
    root: '*dhes-',
    note: 'PIE root for divine, sacred',
    cognates: [
      { languageId: 'grc', lemma: 'θεός', gloss: 'god' },
      { languageId: 'lat', lemma: 'deus', gloss: 'god' },
      { languageId: 'lat', lemma: 'divus', gloss: 'divine' },
      { languageId: 'hbo', lemma: 'אֵל', gloss: 'God, mighty one' },
      { languageId: 'hbo', lemma: 'אֱלֹהִים', gloss: 'God (plural of majesty)' },
    ],
  },
  // ── ψυχή / anima / נֶפֶשׁ ────────────────────────────────────────────────
  {
    root: '*bh(e)us- / *ane-',
    note: 'breath-life-soul concept across traditions',
    cognates: [
      { languageId: 'grc', lemma: 'ψυχή', gloss: 'soul, life, breath' },
      { languageId: 'grc', lemma: 'πνεῦμα', gloss: 'spirit, wind, breath' },
      { languageId: 'lat', lemma: 'anima', gloss: 'soul, breath, life' },
      { languageId: 'lat', lemma: 'spiritus', gloss: 'breath, spirit' },
      { languageId: 'hbo', lemma: 'נֶפֶשׁ', gloss: 'soul, life, person' },
      { languageId: 'hbo', lemma: 'רוּחַ', gloss: 'spirit, wind, breath' },
    ],
  },
  // ── ἀγάπη / amor / אַהֲבָה ───────────────────────────────────────────────
  {
    root: 'love / affection',
    note: 'semantic equivalents, not etymological cognates',
    cognates: [
      { languageId: 'grc', lemma: 'ἀγάπη', gloss: 'love (selfless)' },
      { languageId: 'grc', lemma: 'ἔρως', gloss: 'love (passionate)' },
      { languageId: 'grc', lemma: 'φιλία', gloss: 'love (friendship)' },
      { languageId: 'lat', lemma: 'amor', gloss: 'love' },
      { languageId: 'lat', lemma: 'caritas', gloss: 'charity, love' },
      { languageId: 'hbo', lemma: 'אַהֲבָה', gloss: 'love' },
    ],
  },
  // ── πατήρ / pater / אָב / pitar ─────────────────────────────────────────
  {
    root: '*ph₂tér-',
    note: 'PIE word for father',
    cognates: [
      { languageId: 'grc', lemma: 'πατήρ', gloss: 'father' },
      { languageId: 'lat', lemma: 'pater', gloss: 'father' },
      { languageId: 'hbo', lemma: 'אָב', gloss: 'father' },
      { languageId: 'san', lemma: 'pitṛ', gloss: 'father' },
    ],
  },
  // ── μήτηρ / mater / אֵם / mātar ─────────────────────────────────────────
  {
    root: '*méh₂tēr',
    note: 'PIE word for mother',
    cognates: [
      { languageId: 'grc', lemma: 'μήτηρ', gloss: 'mother' },
      { languageId: 'lat', lemma: 'mater', gloss: 'mother' },
      { languageId: 'hbo', lemma: 'אֵם', gloss: 'mother' },
      { languageId: 'san', lemma: 'mātar', gloss: 'mother' },
    ],
  },
  // ── ἄνθρωπος / homo / אָדָם / manuṣya ───────────────────────────────────
  {
    root: 'human being',
    note: 'key anthropological terms across languages',
    cognates: [
      { languageId: 'grc', lemma: 'ἄνθρωπος', gloss: 'human being, person' },
      { languageId: 'lat', lemma: 'homo', gloss: 'human being, man' },
      { languageId: 'lat', lemma: 'vir', gloss: 'man (as distinct from woman)' },
      { languageId: 'hbo', lemma: 'אָדָם', gloss: 'man, humankind' },
      { languageId: 'hbo', lemma: 'אִישׁ', gloss: 'man, person' },
    ],
  },
  // ── γῆ / terra / אֶרֶץ / pṛthvī ─────────────────────────────────────────
  {
    root: '*dʰéǵʰōm / *ters-',
    note: 'earth, land, ground',
    cognates: [
      { languageId: 'grc', lemma: 'γῆ', gloss: 'earth, land' },
      { languageId: 'grc', lemma: 'χθών', gloss: 'earth, ground' },
      { languageId: 'lat', lemma: 'terra', gloss: 'earth, land' },
      { languageId: 'lat', lemma: 'humus', gloss: 'ground, soil' },
      { languageId: 'hbo', lemma: 'אֶרֶץ', gloss: 'earth, land' },
      { languageId: 'hbo', lemma: 'אֲדָמָה', gloss: 'ground, soil' },
    ],
  },
  // ── οὐρανός / caelum / שָׁמַיִם ──────────────────────────────────────────
  {
    root: 'heaven / sky',
    note: 'celestial / divine realm',
    cognates: [
      { languageId: 'grc', lemma: 'οὐρανός', gloss: 'heaven, sky' },
      { languageId: 'lat', lemma: 'caelum', gloss: 'sky, heaven' },
      { languageId: 'hbo', lemma: 'שָׁמַיִם', gloss: 'heavens, sky' },
    ],
  },
  // ── νόμος / lex / תּוֹרָה ─────────────────────────────────────────────────
  {
    root: 'law / instruction',
    note: 'foundational legal-religious concepts',
    cognates: [
      { languageId: 'grc', lemma: 'νόμος', gloss: 'law, custom' },
      { languageId: 'lat', lemma: 'lex', gloss: 'law' },
      { languageId: 'lat', lemma: 'ius', gloss: 'law, right' },
      { languageId: 'hbo', lemma: 'תּוֹרָה', gloss: 'law, instruction, Torah' },
      { languageId: 'hbo', lemma: 'מִצְוָה', gloss: 'commandment' },
    ],
  },
  // ── βασιλεύς / rex / מֶלֶךְ ──────────────────────────────────────────────
  {
    root: '*h₃rḗǵs',
    note: 'king / ruler',
    cognates: [
      { languageId: 'grc', lemma: 'βασιλεύς', gloss: 'king' },
      { languageId: 'lat', lemma: 'rex', gloss: 'king' },
      { languageId: 'hbo', lemma: 'מֶלֶךְ', gloss: 'king' },
      { languageId: 'san', lemma: 'rājan', gloss: 'king, ruler' },
    ],
  },
  // ── ἀλήθεια / veritas / אֱמֶת ────────────────────────────────────────────
  {
    root: 'truth / faithfulness',
    note: 'truth as philosophical / theological concept',
    cognates: [
      { languageId: 'grc', lemma: 'ἀλήθεια', gloss: 'truth, reality' },
      { languageId: 'lat', lemma: 'veritas', gloss: 'truth' },
      { languageId: 'hbo', lemma: 'אֱמֶת', gloss: 'truth, faithfulness' },
    ],
  },
  // ── φῶς / lux / אוֹר ─────────────────────────────────────────────────────
  {
    root: '*lewk-',
    note: 'PIE root for light',
    cognates: [
      { languageId: 'grc', lemma: 'φῶς', gloss: 'light' },
      { languageId: 'lat', lemma: 'lux', gloss: 'light' },
      { languageId: 'lat', lemma: 'lumen', gloss: 'light, lamp' },
      { languageId: 'hbo', lemma: 'אוֹר', gloss: 'light' },
    ],
  },
  // ── ἄρτος / panis / לֶחֶם ────────────────────────────────────────────────
  {
    root: 'bread / food',
    note: 'daily bread — central to liturgy',
    cognates: [
      { languageId: 'grc', lemma: 'ἄρτος', gloss: 'bread, loaf' },
      { languageId: 'lat', lemma: 'panis', gloss: 'bread' },
      { languageId: 'hbo', lemma: 'לֶחֶם', gloss: 'bread, food' },
    ],
  },
  // ── σῴζω / salvo / יָשַׁע ─────────────────────────────────────────────────
  {
    root: 'salvation / to save',
    note: 'salvation terminology',
    cognates: [
      { languageId: 'grc', lemma: 'σῴζω', gloss: 'to save, rescue' },
      { languageId: 'grc', lemma: 'σωτηρία', gloss: 'salvation' },
      { languageId: 'lat', lemma: 'salvo', gloss: 'to save' },
      { languageId: 'lat', lemma: 'salus', gloss: 'salvation, health, safety' },
      { languageId: 'hbo', lemma: 'יָשַׁע', gloss: 'to save, deliver' },
      { languageId: 'hbo', lemma: 'יְשׁוּעָה', gloss: 'salvation' },
    ],
  },
  // ── εἰρήνη / pax / שָׁלוֹם ───────────────────────────────────────────────
  {
    root: 'peace / wholeness',
    note: 'peace as completeness and right relationship',
    cognates: [
      { languageId: 'grc', lemma: 'εἰρήνη', gloss: 'peace' },
      { languageId: 'lat', lemma: 'pax', gloss: 'peace' },
      { languageId: 'hbo', lemma: 'שָׁלוֹם', gloss: 'peace, wholeness, wellbeing' },
    ],
  },
];

// ── Build lookup table ─────────────────────────────────────────────────────────

const _lookup = new Map<LookupKey, CognateEntry>();

for (const group of RAW_GROUPS) {
  for (const { languageId, lemma } of group.cognates) {
    const key: LookupKey = `${languageId}:${lemma.toLowerCase()}`;
    _lookup.set(key, group);
  }
}

/**
 * Look up cognates for a given lemma in a given language.
 * Returns the group (excluding the lookup lemma itself), or null if not found.
 */
export function getCognates(
  lemma: string,
  languageId: string
): { entry: CognateEntry; others: CognateEntry['cognates'] } | null {
  const key: LookupKey = `${languageId}:${lemma.toLowerCase()}`;
  const entry = _lookup.get(key);
  if (!entry) return null;
  const others = entry.cognates.filter(
    (c) => !(c.languageId === languageId && c.lemma.toLowerCase() === lemma.toLowerCase())
  );
  return { entry, others };
}
