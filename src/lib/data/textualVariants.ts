/**
 * Static mini-apparatus for famous NT Greek textual variants.
 * Keyed by `${languageId}:${lemma}`.
 *
 * Data drawn from publicly-documented apparatus traditions (NA28 / UBS5 /
 * SBLGNT introductions, standard textual criticism literature). This is NOT
 * the full apparatus — it highlights well-known variants to orient the user.
 * For full apparatus, users should consult NA28 or the CNTTS apparatus.
 */

export interface VariantReading {
  witness: string;
  reading: string;
  type: 'omission' | 'addition' | 'substitution' | 'transposition' | 'spelling';
  notes?: string;
}

export interface TextualVariantEntry {
  lemma: string;
  languageId: string;
  location: string;
  baseText: string;
  variants: VariantReading[];
  significance: 'minor' | 'moderate' | 'significant';
  summary: string;
}

const entries: TextualVariantEntry[] = [
  {
    lemma: 'μονογενής',
    languageId: 'grc',
    location: 'John 1:18',
    baseText: 'μονογενὴς θεός',
    variants: [
      {
        witness: 'P66, P75, א, B (earliest papyri + Alexandrian)',
        reading: 'μονογενὴς θεός',
        type: 'substitution',
        notes: 'Reading of the earliest witnesses; supported by Alexandrian tradition.',
      },
      {
        witness: 'A, C, K, most Byzantine MSS',
        reading: 'ὁ μονογενὴς υἱός',
        type: 'substitution',
        notes: 'Harmonization toward John 3:16/18; dominant in later tradition.',
      },
    ],
    significance: 'significant',
    summary:
      'Whether John wrote "the only-begotten God" or "the only-begotten Son" is one of the most theologically charged variants in the NT. The shorter, harder reading (θεός) has stronger early support.',
  },
  {
    lemma: 'θεός',
    languageId: 'grc',
    location: '1 Timothy 3:16',
    baseText: 'ὅς ἐφανερώθη ἐν σαρκί',
    variants: [
      {
        witness: 'א*, A*, C*',
        reading: 'ὅς (who)',
        type: 'substitution',
        notes: 'Relative pronoun; requires antecedent "mystery".',
      },
      {
        witness: 'Later Byzantine MSS, Erasmus',
        reading: 'θεός (God)',
        type: 'substitution',
        notes:
          'Likely arose from itacism (Θ̄C̄ misread as ΘC̄, contracted form of θεός). Supported Trinitarian readings.',
      },
    ],
    significance: 'significant',
    summary:
      'The substitution of θεός for ὅς is a classic itacism-driven variant. Most modern critical editions read ὅς; the KJV tradition follows the Byzantine θεός.',
  },
  {
    lemma: 'λόγος',
    languageId: 'grc',
    location: 'John 1:1',
    baseText: 'ἐν ἀρχῇ ἦν ὁ λόγος',
    variants: [
      {
        witness: 'All major MSS',
        reading: 'ὁ λόγος (the Word)',
        type: 'substitution',
        notes: 'No textual dispute at 1:1 itself; variants occur in v.3–4 boundary.',
      },
    ],
    significance: 'minor',
    summary:
      'The Prologue text of John is remarkably stable. The major variant in the Prologue area concerns the sentence boundary between 1:3–4: "without him nothing was made that has been made. In him was life" vs "without him nothing was made. That which was made in him was life."',
  },
  {
    lemma: 'ἀγαπάω',
    languageId: 'grc',
    location: 'Romans 5:1',
    baseText: 'εἰρήνην ἔχομεν',
    variants: [
      {
        witness: 'P46, B, D, original hand of many MSS',
        reading: 'ἔχωμεν (let us have — subjunctive)',
        type: 'substitution',
        notes: 'Subjunctive gives an exhortation; orthographically identical with indicative in many dialects.',
      },
      {
        witness: 'א, A, many later MSS',
        reading: 'ἔχομεν (we have — indicative)',
        type: 'substitution',
        notes: 'Indicative gives a statement of fact; dominant in Byzantine tradition.',
      },
    ],
    significance: 'moderate',
    summary:
      'The ε/η difference in ἔχομεν/ἔχωμεν was phonologically neutralized in Koine Greek, making this one of the most common types of scribal ambiguity. Context (following "therefore") favors the indicative, but early MSS often show the subjunctive.',
  },
  {
    lemma: 'πνεῦμα',
    languageId: 'grc',
    location: 'John 7:39',
    baseText: 'οὔπω γὰρ ἦν πνεῦμα',
    variants: [
      {
        witness: 'P66, P75, א, A, B',
        reading: 'οὔπω ἦν πνεῦμα (not yet was [the] Spirit)',
        type: 'omission',
        notes: 'Shorter reading; theologically bold — Spirit not yet [given].',
      },
      {
        witness: 'Later witnesses, some Fathers',
        reading: 'οὔπω ἦν πνεῦμα ἅγιον (not yet was the Holy Spirit)',
        type: 'addition',
        notes: 'Addition of ἅγιον to clarify; softens the stark statement.',
      },
    ],
    significance: 'moderate',
    summary:
      'The omission of ἅγιον (Holy) in early witnesses creates a theologically striking statement. Scribes apparently added the adjective to clarify that the Spirit itself was not absent, only the full Pentecostal gift.',
  },
  {
    lemma: 'ἐπί',
    languageId: 'grc',
    location: 'Luke 2:14',
    baseText: 'εὐδοκία',
    variants: [
      {
        witness: 'P75, א*, A², B, D, most early MSS',
        reading: 'εὐδοκίας (genitive: goodwill)',
        type: 'substitution',
        notes:
          'Genitive: "among men of [God\'s] good pleasure/favor." Supported by Dead Sea Scrolls parallels.',
      },
      {
        witness: 'א², A*, W, many Byzantine MSS',
        reading: 'εὐδοκία (nominative: goodwill)',
        type: 'substitution',
        notes: 'Nominative: "peace, goodwill toward men." Classic KJV rendering.',
      },
    ],
    significance: 'significant',
    summary:
      '"Peace on earth, goodwill toward men" (KJV) vs "peace among those whom he favors" (ESV/RSV) comes down to this single sigma. The genitive is now considered the original reading by nearly all textual critics.',
  },
  {
    lemma: 'ἐγείρω',
    languageId: 'grc',
    location: 'Mark 16:9–20',
    baseText: '[Long Ending of Mark]',
    variants: [
      {
        witness: 'א, B, syr-s, syr-p (ms), arm, geo',
        reading: '[Ends at 16:8: καὶ οὐδενὶ οὐδὲν εἶπαν·]',
        type: 'omission',
        notes: 'Earliest and best witnesses end abruptly. A shorter ending also circulated.',
      },
      {
        witness: 'A, C, D, K, most MSS, vg',
        reading: '[Includes 16:9–20 with resurrection appearances]',
        type: 'addition',
        notes: 'The "Long Ending" (Freer Logion included in some MSS). Secondary addition, 2nd century.',
      },
    ],
    significance: 'significant',
    summary:
      'The Long Ending of Mark (16:9–20) is absent from the two oldest and best Greek manuscripts. Most scholars consider it a 2nd-century addition to supply resurrection appearances that seemed theologically necessary.',
  },
  {
    lemma: 'αἷμα',
    languageId: 'grc',
    location: 'Luke 22:43–44',
    baseText: '[Bloody Sweat pericope]',
    variants: [
      {
        witness: 'P69(?), א*, B, some ancient versions',
        reading: '[Verses absent]',
        type: 'omission',
        notes:
          'Absent from major Alexandrian witnesses. May have been omitted to combat Docetism or added for anti-Docetic reasons.',
      },
      {
        witness: 'א², A, D, most MSS',
        reading: '[Verses present: angel strengthening Jesus + sweat like blood]',
        type: 'addition',
        notes: 'Present in most MS traditions. Shows genuine human anguish — possibly authentic but early-floating.',
      },
    ],
    significance: 'significant',
    summary:
      'The "Bloody Sweat" (ἱδρὼς ὡσεὶ θρόμβοι αἵματος) is a floating pericope. Its absence in Alexandrian MSS and inconsistent position in others suggests it may be an authentic tradition inserted at various points.',
  },
];

// Build lookup map: languageId:lemma → entries[]
const _map = new Map<string, TextualVariantEntry[]>();
for (const entry of entries) {
  const key = `${entry.languageId}:${entry.lemma}`;
  const existing = _map.get(key);
  if (existing) {
    existing.push(entry);
  } else {
    _map.set(key, [entry]);
  }
}

export function getVariantEntries(
  languageId: string,
  lemma: string
): TextualVariantEntry[] {
  return _map.get(`${languageId}:${lemma.toLowerCase()}`) ?? _map.get(`${languageId}:${lemma}`) ?? [];
}
