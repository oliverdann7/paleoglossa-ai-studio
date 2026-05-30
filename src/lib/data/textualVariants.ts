/**
 * Static mini-apparatus for famous NT textual variants.
 * Used by VariantApparatusSection and TCExerciseModal.
 */

export type VariantSignificance = 'minor' | 'moderate' | 'significant';
export type ScribalChangeType = 'omission' | 'addition' | 'substitution' | 'transposition' | 'spelling';

export interface VariantReading {
  reading: string;
  witness: string;
  type: ScribalChangeType;
  notes?: string;
}

export interface TextualVariantEntry {
  lemma: string;
  languageId: string;
  location: string;
  baseText: string;
  variants: VariantReading[];
  significance: VariantSignificance;
  summary: string;
}

export const entries: TextualVariantEntry[] = [
  {
    lemma: 'μονογενής',
    languageId: 'grc',
    location: 'John 1:18',
    baseText: 'μονογενὴς θεός',
    variants: [
      {
        reading: 'μονογενὴς θεός',
        witness: 'P66, P75, Sinaiticus, Vaticanus',
        type: 'substitution',
      },
      {
        reading: 'ὁ μονογενὴς υἱός',
        witness: 'Alexandrinus, Byzantine majority text, most versions',
        type: 'substitution',
      },
    ],
    significance: 'significant',
    summary:
      'The earliest papyri and major Alexandrian manuscripts read "the only-begotten God," while the Byzantine tradition and most versions read "the only-begotten Son." The harder reading "God" is likely original; scribes may have replaced it with the familiar Johannine phrase "only-begotten Son" (cf. John 3:16).',
  },
  {
    lemma: 'θεός',
    languageId: 'grc',
    location: '1 Timothy 3:16',
    baseText: 'ὅς ἐφανερώθη ἐν σαρκί',
    variants: [
      {
        reading: 'ὅς',
        witness: 'Sinaiticus*, Alexandrinus, D, F, G',
        type: 'substitution',
      },
      {
        reading: 'θεός',
        witness: 'Sinaiticus², Byzantine majority, many Fathers',
        type: 'substitution',
      },
    ],
    significance: 'significant',
    summary:
      'A minuscule correction in Codex Sinaiticus changed ΟΣ ("who") to ΘΣ ("God") by adding a crossbar. The earlier reading "who was manifested in the flesh" (referring to Christ) makes excellent sense; the later "God was manifested in the flesh" was influenced by theological interests. This is a classic case of a simple scribal alteration with major dogmatic implications.',
  },
  {
    lemma: 'λόγος',
    languageId: 'grc',
    location: 'John 1:1',
    baseText: 'θεὸς ἦν ὁ λόγος',
    variants: [
      {
        reading: 'θεὸς ἦν ὁ λόγος',
        witness: 'All major Greek manuscripts',
        type: 'spelling',
      },
      {
        reading: 'θεῖος ἦν ὁ λόγος',
        witness: 'Some versional evidence, Origen (reported)',
        type: 'substitution',
      },
    ],
    significance: 'moderate',
    summary:
      'The Greek text is unanimous that John wrote "the Word was God" (θεὸς without the article, predicate position). A minority of versional evidence reflects "the Word was divine" (θεῖος), possibly a theological softening. The Greek manuscript tradition is overwhelmingly uniform here.',
  },
  {
    lemma: 'εἰρήνη',
    languageId: 'grc',
    location: 'Romans 5:1',
    baseText: 'εἰρήνην ἔχομεν',
    variants: [
      {
        reading: 'εἰρήνην ἔχομεν',
        witness: 'P46, B, most witnesses (indicative)',
        type: 'spelling',
      },
      {
        reading: 'εἰρήνην ἔχωμεν',
        witness: 'Sinaiticus, A, C, D (subjunctive)',
        type: 'spelling',
      },
    ],
    significance: 'moderate',
    summary:
      'The difference between ο (indicative "we have peace") and ω (hortatory subjunctive "let us have peace") was invisible in pronunciation by the 2nd century due to itacism. External evidence slightly favors the indicative (statement of fact), while internal contextual considerations have led many interpreters to prefer it as making better Pauline theological sense.',
  },
  {
    lemma: 'πνεῦμα',
    languageId: 'grc',
    location: 'John 7:39',
    baseText: 'οὔπω γὰρ ἦν πνεῦμα',
    variants: [
      {
        reading: 'οὔπω γὰρ ἦν πνεῦμα',
        witness: 'P66, P75, Sinaiticus, B ("Spirit was not yet")',
        type: 'omission',
      },
      {
        reading: 'οὔπω γὰρ ἦν πνεῦμα ἅγιον',
        witness: 'A, most Byzantine texts ("Holy Spirit was not yet")',
        type: 'addition',
      },
      {
        reading: 'οὔπω γὰρ ἦν πνεῦμα ἅγιον δεδομένον',
        witness: 'Some later witnesses ("Holy Spirit was not yet given")',
        type: 'addition',
      },
    ],
    significance: 'moderate',
    summary:
      'The shortest reading ("Spirit was not yet") is attested by the earliest papyri and Alexandrian codices. The phrase is theologically striking — the Spirit was not yet given because Jesus had not yet been glorified. Scribes expanded it to clarify, first adding "Holy" and then "given," demonstrating the tendency toward harmonization and theological smoothing.',
  },
  {
    lemma: 'δόξα',
    languageId: 'grc',
    location: 'Luke 2:14',
    baseText: 'εἰρήνη ἐπὶ γῆς ἐν ἀνθρώποις εὐδοκίας',
    variants: [
      {
        reading: 'ἐν ἀνθρώποις εὐδοκίας',
        witness: 'P75, Sinaiticus*, Vaticanus, D (genitive)',
        type: 'spelling',
      },
      {
        reading: 'ἐν ἀνθρώποις εὐδοκία',
        witness: 'Sinaiticus², A, Byzantine majority (nominative)',
        type: 'spelling',
      },
    ],
    significance: 'significant',
    summary:
      'A single sigma distinguishes "peace among men of goodwill" (genitive εὐδοκίας — God\'s goodwill or favor) from "peace among men; goodwill" (nominative εὐδοκία — a third clause). P75 and the major Alexandrian witnesses support the genitive, which is the harder reading and was familiar from Qumran usage. The nominative reading shaped the traditional three-part carol.',
  },
  {
    lemma: 'ἀνίστημι',
    languageId: 'grc',
    location: 'Mark 16:9–20',
    baseText: 'Ἀναστὰς δὲ πρωῒ πρώτῃ σαββάτου ἐφάνη πρῶτον Μαρίᾳ τῇ Μαγδαληνῇ',
    variants: [
      {
        reading: 'Passage absent',
        witness: 'Sinaiticus, Vaticanus, earliest Syriac and Coptic',
        type: 'omission',
      },
      {
        reading: 'Longer ending (vv. 9–20)',
        witness: 'Alexandrinus, Byzantine majority, most versions',
        type: 'addition',
      },
      {
        reading: 'Shorter ending only',
        witness: 'A few Old Latin and Sahidic manuscripts',
        type: 'addition',
      },
    ],
    significance: 'significant',
    summary:
      'The two oldest Greek manuscripts (Vaticanus and Sinaiticus) end Mark at 16:8 with the women fleeing the tomb in fear. The "longer ending" (vv. 9–20) uses vocabulary and style unusual for Mark and appears to harmonize resurrection accounts from the other Gospels. Most text critics believe it was added in the 2nd century to provide a more satisfying conclusion.',
  },
  {
    lemma: 'ἄγγελος',
    languageId: 'grc',
    location: 'Luke 22:43–44',
    baseText: 'ὤφθη δὲ αὐτῷ ἄγγελος ἀπ᾽ οὐρανοῦ',
    variants: [
      {
        reading: 'Verses present (angel strengthening, bloody sweat)',
        witness: 'Sinaiticus*, D, most minuscules, early Fathers',
        type: 'addition',
      },
      {
        reading: 'Verses absent',
        witness: 'P75, Vaticanus, Sinaiticus², Alexandrinus',
        type: 'omission',
      },
    ],
    significance: 'significant',
    summary:
      'The agony in the garden — including the angel strengthening Jesus and his sweat becoming like drops of blood — is absent from P75, Vaticanus, and several other Alexandrian witnesses. The early Fathers know the passage, and it may have been omitted by some scribes due to theological concerns about Jesus\' apparent weakness. Some scholars view it as an authentic tradition interpolated early.',
  },
];

// O(1) lookup map: "${languageId}:${lemma}" → entries[]
const _lookupMap = new Map<string, TextualVariantEntry[]>();
for (const entry of entries) {
  const key = `${entry.languageId}:${entry.lemma}`;
  const existing = _lookupMap.get(key) ?? [];
  existing.push(entry);
  _lookupMap.set(key, existing);
}

export function getVariantEntries(languageId: string, lemma: string): TextualVariantEntry[] {
  return _lookupMap.get(`${languageId}:${lemma}`) ?? [];
}
