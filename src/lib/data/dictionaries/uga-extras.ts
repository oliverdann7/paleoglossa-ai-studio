/**
 * Ugaritic gap-filler dictionary — Baal cycle vocabulary in both
 * cuneiform Unicode (U+10380–1039F) and standard ASCII transliteration
 * (with plain apostrophe for glottal/ʿayin). Merged in index.ts after
 * UGA_DICTIONARY so curated glosses win on collision.
 */
export const UGA_EXTRAS: Record<string, string> = {
  // Cuneiform script (Unicode U+10380–1039F)
  '𐎁𐎓𐎍': 'Baal (storm god); lord',
  '𐎛𐎍': 'El (supreme god); god',
  '𐎎𐎍𐎋': 'king; to rule',
  '𐎁𐎐': 'son',
  '𐎃𐎐': 'grace; favor',
  '𐎖𐎍': 'voice; word',
  '𐎂𐎁𐎗': 'man; warrior',
  '𐎋𐎒𐎀': 'throne; chair',
  '𐎜𐎄𐎐': 'lord; master',
  '𐎊𐎄': 'hand',
  '𐎌𐎁𐎓': 'seven',
  '𐎋𐎁𐎄': 'heavy; honored',
  '𐎎𐎅': 'water',
  '𐎌𐎐𐎀': 'enemy; hatred',
  '𐎂𐎗': 'mountain; great',

  // ASCII transliteration (corpus form, plain ASCII apostrophe)
  "b'l": 'Baal (storm god); lord',
  "db'l": 'of Baal',
  zbl: 'prince, lord',
  aliyn: 'mighty (epithet of Baal)',
  "'ab": 'father',
  "y'n": 'he answered',
  ql: 'voice; word',
  "btš'": 'in striking; in defeat',
  atrt: 'Athirat (mother goddess)',
  prm: 'fruits; offerings',
  qlt: 'lightness; insult',

  // Prefix-style transliteration entries
  'w-': 'and',
  'l-': 'to, for; not',
  'b-': 'in, with',
  'k-': 'as, like',
  'm-': 'from',

  // Common vocabulary
  ks: 'cup',
  yṯb: 'sat, dwelt',
  yqḥ: 'took',
  yʿn: 'answered',
  ymlk: 'reigned',
  ybʿl: 'was lord; possessed',
  bn: 'son',
  bt: 'house; daughter',
  ab: 'father',
  um: 'mother',
  aḫ: 'brother',
  aḫt: 'sister',
  mlk: 'king; to rule',
  bʿl: 'lord, master; Baal',
  ʿl: 'upon, over',
  ʿd: 'unto, until',
  ʿm: 'with; people',
  ym: 'sea; day; Yamm',
  arṣ: 'earth, land',
  šmm: 'heavens',
  šmš: 'sun',
  yrḫ: 'moon',
  ʿpr: 'dust',
  ḥy: 'living; life',
  mt: 'dead; man; Mot',
  npš: 'soul, throat',
  rgm: 'word; to speak',
  qal: 'voice',
  yd: 'hand',
  pn: 'face',
  rʾš: 'head',
  ʿyn: 'eye',
};
