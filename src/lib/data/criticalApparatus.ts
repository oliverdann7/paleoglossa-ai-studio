/**
 * Static critical apparatus entries for NT Greek manuscripts.
 * Each entry covers one textual variation unit (locus).
 * Data derived from publicly available textual criticism scholarship.
 */

export type ScribalChangeType = 'omission' | 'addition' | 'substitution' | 'transposition' | 'spelling' | 'harmonization';

export interface ApparatusWitness {
  siglum: string;
  fullName: string;
  date: string;
  type: 'papyrus' | 'uncial' | 'minuscule' | 'version' | 'father';
}

export interface ApparatusVariant {
  reading: string;
  witnesses: string[];
  changeType: ScribalChangeType;
  significance: 'minor' | 'moderate' | 'significant';
  note?: string;
}

export interface ApparatusLocus {
  reference: string;
  baseText: string;
  baseWitnesses: string[];
  variants: ApparatusVariant[];
  discussionNote: string;
}

export const WITNESSES: Record<string, ApparatusWitness> = {
  'P66': { siglum: 'P⁶⁶', fullName: 'Papyrus 66 (Bodmer II)', date: 'c. 200 CE', type: 'papyrus' },
  'P75': { siglum: 'P⁷⁵', fullName: 'Papyrus 75 (Bodmer XIV-XV)', date: 'c. 175–225 CE', type: 'papyrus' },
  'P46': { siglum: 'P⁴⁶', fullName: 'Papyrus 46 (Chester Beatty II)', date: 'c. 200 CE', type: 'papyrus' },
  'P72': { siglum: 'P⁷²', fullName: 'Papyrus 72 (Bodmer VII-VIII)', date: 'c. 300 CE', type: 'papyrus' },
  'aleph': { siglum: 'א', fullName: 'Codex Sinaiticus', date: '4th century', type: 'uncial' },
  'A': { siglum: 'A', fullName: 'Codex Alexandrinus', date: '5th century', type: 'uncial' },
  'B': { siglum: 'B', fullName: 'Codex Vaticanus', date: '4th century', type: 'uncial' },
  'C': { siglum: 'C', fullName: 'Codex Ephraemi Rescriptus', date: '5th century', type: 'uncial' },
  'D': { siglum: 'D', fullName: 'Codex Bezae', date: '5th century', type: 'uncial' },
  'W': { siglum: 'W', fullName: 'Codex Freerianus', date: '4th–5th century', type: 'uncial' },
  'Theta': { siglum: 'Θ', fullName: 'Codex Koridethi', date: '9th century', type: 'uncial' },
  'f1': { siglum: 'f¹', fullName: 'Family 1 minuscules', date: '11th–15th century', type: 'minuscule' },
  'f13': { siglum: 'f¹³', fullName: 'Family 13 minuscules (Ferrar Group)', date: '11th–15th century', type: 'minuscule' },
  'M': { siglum: '𝔐', fullName: 'Majority Text', date: 'Byzantine', type: 'minuscule' },
  'it': { siglum: 'it', fullName: 'Old Latin versions', date: '2nd–4th century', type: 'version' },
  'vg': { siglum: 'vg', fullName: 'Vulgate', date: '4th–5th century', type: 'version' },
  'syr': { siglum: 'syr', fullName: 'Syriac versions (Peshitta, Harclean)', date: '2nd–7th century', type: 'version' },
  'cop': { siglum: 'cop', fullName: 'Coptic versions (Sahidic, Bohairic)', date: '3rd–4th century', type: 'version' },
  'Origen': { siglum: 'Origen', fullName: 'Origen of Alexandria', date: 'c. 185–254 CE', type: 'father' },
  'Irenaeus': { siglum: 'Irenaeus', fullName: 'Irenaeus of Lyon', date: 'c. 130–202 CE', type: 'father' },
  'Tertullian': { siglum: 'Tertullian', fullName: 'Tertullian', date: 'c. 155–220 CE', type: 'father' },
  'Eusebius': { siglum: 'Eusebius', fullName: 'Eusebius of Caesarea', date: 'c. 260–339 CE', type: 'father' },
};

export const APPARATUS: ApparatusLocus[] = [
  {
    reference: 'John 1:18',
    baseText: 'μονογενὴς θεός',
    baseWitnesses: ['P66', 'P75', 'aleph', 'B'],
    variants: [
      {
        reading: 'μονογενὴς υἱός',
        witnesses: ['A', 'C', 'f13', 'M', 'vg', 'syr'],
        changeType: 'substitution',
        significance: 'significant',
        note: 'The substitution of υἱός ("Son") for θεός ("God") harmonizes with John 3:16 and may be an early theological simplification.',
      },
    ],
    discussionNote: 'The reading μονογενὴς θεός ("the only-begotten God") has strong early papyrus and uncial support. The variant μονογενὴς υἱός ("the only-begotten Son") is more widespread but likely arose through harmonization with Johannine idiom elsewhere.',
  },
  {
    reference: '1 Timothy 3:16',
    baseText: 'ὃς ἐφανερώθη',
    baseWitnesses: ['aleph', 'A*', 'C*', 'f1', 'it', 'vg', 'cop', 'Origen'],
    variants: [
      {
        reading: 'θεὸς ἐφανερώθη',
        witnesses: ['A²', 'C²', 'D', 'Theta', 'M', 'syr'],
        changeType: 'substitution',
        significance: 'significant',
        note: 'The substitution of θεός for ὅς was facilitated by the visual similarity of ΘΣ (nomen sacrum for "God") and ΟΣ (ὅς = "who"). The original ὅς was altered by a corrector in key manuscripts.',
      },
    ],
    discussionNote: 'A classic case where a nomen sacrum abbreviation (ΘΣ = θεός) was confused with a relative pronoun (ΟΣ = ὅς) by scribal correction. Metzger called this one of the clearest examples of accidental alteration via itacism and abbreviation.',
  },
  {
    reference: 'John 7:53–8:11',
    baseText: '[Pericope Adulterae — present]',
    baseWitnesses: ['D', 'f1', 'f13', 'M'],
    variants: [
      {
        reading: '[Pericope Adulterae — absent]',
        witnesses: ['P66', 'P75', 'aleph', 'B', 'A', 'C', 'W', 'Theta', 'cop', 'syr'],
        changeType: 'addition',
        significance: 'significant',
        note: 'The pericope is absent from the earliest and most reliable witnesses. Its style and vocabulary differ markedly from John. Some manuscripts place it after Luke 21:38.',
      },
    ],
    discussionNote: 'The Pericope Adulterae (John 7:53–8:11) is absent from nearly all early manuscripts and the best uncials. It appears to be a floating tradition inserted at various points in the gospels. Most scholars regard it as non-Johannine.',
  },
  {
    reference: 'Romans 5:1',
    baseText: 'ἔχωμεν',
    baseWitnesses: ['aleph', 'B', 'C', 'D', 'vg'],
    variants: [
      {
        reading: 'ἔχομεν',
        witnesses: ['A', 'M'],
        changeType: 'spelling',
        significance: 'moderate',
        note: 'The difference between subjunctive ἔχωμεν ("let us have") and indicative ἔχομεν ("we have") was easily confused due to itacism (ω/ο sounded alike in later Greek).',
      },
    ],
    discussionNote: 'A subtle but theologically significant variation. If subjunctive (ἔχωμεν), Paul urges readers to maintain peace; if indicative (ἔχομεν), he declares a present reality. External evidence slightly favors the subjunctive, but the indicative suits the flow of Romans 5.',
  },
  {
    reference: 'Mark 1:1',
    baseText: 'υἱοῦ θεοῦ',
    baseWitnesses: ['aleph', 'B', 'D', 'L', 'W'],
    variants: [
      {
        reading: '[omit υἱοῦ θεοῦ]',
        witnesses: ['Theta', 'f1', '28'],
        changeType: 'omission',
        significance: 'significant',
        note: 'A small but important group of witnesses lack "Son of God" at the opening of Mark, possibly due to homoeoteleuton or early theological caution.',
      },
    ],
    discussionNote: 'The phrase "Son of God" has strong external support for inclusion, but its absence in some witnesses raises questions about whether it was an early scribal addition to heighten the christological claim at Mark\'s opening.',
  },
  {
    reference: 'Luke 22:43–44',
    baseText: '[Angel and sweat of blood — present]',
    baseWitnesses: ['D', 'f1', 'it', 'vg', 'Irenaeus'],
    variants: [
      {
        reading: '[Angel and sweat of blood — absent]',
        witnesses: ['P69', 'P75', 'aleph', 'A', 'B', 'N', 'W', 'T'],
        changeType: 'addition',
        significance: 'significant',
        note: 'Absent from the best Greek manuscripts. The passage may have been added to combat early docetism by emphasizing Christ\'s human suffering.',
      },
    ],
    discussionNote: 'Luke 22:43–44 (angel strengthens Jesus; sweating blood) is absent from the earliest papyri and best uncials. Origen did not know the passage in some manuscripts. The content fits Luke\'s theological interests but the external evidence suggests secondary addition.',
  },
  {
    reference: 'Romans 8:28',
    baseText: 'πάντα συνεργεῖ εἰς ἀγαθόν',
    baseWitnesses: ['aleph', 'B', 'cop'],
    variants: [
      {
        reading: 'πάντα συνεργεῖ ὁ θεὸς εἰς ἀγαθόν',
        witnesses: ['A', 'D', 'vg', 'M'],
        changeType: 'addition',
        significance: 'moderate',
        note: 'The addition of ὁ θεός makes God the explicit subject of "works together for good," clarifying an ambiguous Greek construction.',
      },
    ],
    discussionNote: 'Without ὁ θεός, the subject of "all things work together" is ambiguous — it could be "all things" themselves (working together) or "God" implied. The addition of the explicit subject is a natural scribal clarification but may not be original.',
  },
  {
    reference: '1 John 5:7–8',
    baseText: 'ὅτι τρεῖς εἰσιν οἱ μαρτυροῦντες, τὸ πνεῦμα καὶ τὸ ὕδωρ καὶ τὸ αἷμα',
    baseWitnesses: ['aleph', 'A', 'B', 'P72', 'vg'],
    variants: [
      {
        reading: '[Comma Johanneum] ἐν τῷ οὐρανῷ, ὁ Πατήρ, ὁ Λόγος, καὶ τὸ Ἅγιον Πνεῦμα· καὶ οὗτοι οἱ τρεῖς ἕν εἰσιν',
        witnesses: ['61', '88mg', '221mg', 'it', 'vg(ms)'],
        changeType: 'addition',
        significance: 'significant',
        note: 'The Comma Johanneum is a later Latin interpolation absent from all early Greek manuscripts. It first appears in Latin texts of the 4th–5th century and entered the Greek tradition via late manuscripts.',
      },
    ],
    discussionNote: 'The Comma Johanneum (trinitarian formula in 1 John 5:7) is one of the clearest cases of a late interpolation. It is absent from all early Greek papyri, all early uncials, all early versions (Syriac, Coptic, Armenian), and the earliest church fathers. Its Greek text is likely translated from the Latin.',
  },
];

/** Get apparatus entries relevant to a manuscript's language and title */
export function getApparatusForManuscript(languageId: string, title: string): ApparatusLocus[] {
  if (languageId !== 'grc') return [];
  const titleLower = title.toLowerCase();
  // Return NT entries if the manuscript seems NT-related, otherwise all entries
  const ntKeywords = ['john', 'luke', 'mark', 'matthew', 'romans', 'timothy', 'corinthians', 'nt', 'new testament', 'gospel', 'epistl'];
  const isNT = ntKeywords.some((k) => titleLower.includes(k));
  return isNT ? APPARATUS : APPARATUS.slice(0, 4);
}
