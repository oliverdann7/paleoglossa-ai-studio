/**
 * Akkadian Extended Corpus — Gilgamesh (later tablets) and Code of Hammurabi.
 * All texts in normalized transliteration; original cuneiform shown via the
 * ScriptLab page. Translations adapted from public-domain sources
 * (Hammurabi: King 1915 / public domain; Gilgamesh: George 2003 paraphrased).
 */

import type { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: normalized,
        gloss: '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

// ─── Gilgamesh Tablet II — The Coming of Enkidu ──────────────────────────────

export const AKK_GILGAMESH_2: TextSection = {
  id: 'Akk-Gilg-2',
  textId: 'Akk-Gilg-full',
  sequence: 2,
  label: 'Tablet II — Enkidu Comes to Uruk',
  sentences: [
    sent('Akk-Gilg-2-1', ['Enkidu', 'wašib', 'maḫar-ša', 'iqbi', 'ana', 'ḫarīmtim'], 'Enkidu sat before her; he spoke to the harlot.'),
    sent('Akk-Gilg-2-2', ['Šamḫat', 'lā', 'tagaššīma', 'pīka', 'liššima', 'awâtikī'], 'Shamhat, do not be silent! Let your mouth open; let me hear your words.'),
    sent('Akk-Gilg-2-3', ['šī', 'iqbâššu', 'ana', 'Enkidu', 'pānū-ki', 'damqū'], 'She spoke to him, to Enkidu: Your face is fair.'),
    sent('Akk-Gilg-2-4', ['atta', 'kīma', 'ili', 'ammīni', 'itti', 'nammaštê', 'tarappud', 'ṣēram'], 'You are like a god — why do you roam the steppe with the wild creatures?'),
    sent('Akk-Gilg-2-5', ['alka', 'lūbilka', 'ana', 'Uruk', 'supūri'], 'Come, let me lead you to ramparted Uruk.'),
    sent('Akk-Gilg-2-6', ['ana', 'bīt', 'ellim', 'mūšab', 'Ani', 'u', 'Ištar'], 'To the holy temple, the dwelling of Anu and Ishtar.'),
    sent('Akk-Gilg-2-7', ['ašar', 'Gilgameš', 'gitmālu', 'emūqi'], 'Where Gilgamesh, perfect in strength, dwells.'),
    sent('Akk-Gilg-2-8', ['kīma', 'rīmi', 'ugdašširū', 'eli', 'eṭlūtim'], 'Like a wild bull he lords it over the men.'),
  ],
};

// ─── Gilgamesh Tablet VI — The Bull of Heaven ────────────────────────────────

export const AKK_GILGAMESH_6: TextSection = {
  id: 'Akk-Gilg-6',
  textId: 'Akk-Gilg-full',
  sequence: 3,
  label: 'Tablet VI — Ishtar and the Bull of Heaven',
  sentences: [
    sent('Akk-Gilg-6-1', ['imsi', 'malêšu', 'ubbib', 'tillēšu'], 'He washed his filthy hair, he cleaned his weapons.'),
    sent('Akk-Gilg-6-2', ['ana', 'dumqi', 'Gilgameš', 'īnāša', 'iššâ', 'rubūtu', 'Ištar'], 'On the beauty of Gilgamesh, princely Ishtar lifted her eyes.'),
    sent('Akk-Gilg-6-3', ['alka', 'Gilgameš', 'lū', 'ḫâʾiri-ma'], 'Come, Gilgamesh, be my husband.'),
    sent('Akk-Gilg-6-4', ['inbīka', 'yâši', 'qīšam', 'qīšma'], 'Grant me your fruit as a gift.'),
    sent('Akk-Gilg-6-5', ['Gilgameš', 'pâšu', 'īpušamma', 'iqabbi', 'ana', 'rubūti', 'Ištar'], 'Gilgamesh opened his mouth and spoke; he said to princely Ishtar:'),
    sent('Akk-Gilg-6-6', ['mīnâ', 'lušqâkimma', 'ḫīrāt-ka', 'ša', 'lū', 'aššatu'], 'What shall I give you if I take you in marriage?'),
    sent('Akk-Gilg-6-7', ['attī', 'kanūnū', 'ša', 'ina', 'kuṣṣi', 'ibellû'], 'You are a brazier whose fire goes out in the cold.'),
  ],
};

// ─── Gilgamesh Tablet X — Meeting Utnapishtim ───────────────────────────────

export const AKK_GILGAMESH_10: TextSection = {
  id: 'Akk-Gilg-10',
  textId: 'Akk-Gilg-full',
  sequence: 4,
  label: 'Tablet X — The Search for Eternal Life',
  sentences: [
    sent('Akk-Gilg-10-1', ['Gilgameš', 'ana', 'šâšu', 'izzakkar', 'ana', 'Utnapištim', 'rūqi'], 'Gilgamesh said to him, to Utnapishtim the distant:'),
    sent('Akk-Gilg-10-2', ['ana', 'pānī-ka', 'akli', 'aššum', 'baltūti', 'allik'], 'Before your face I have come, because of the matter of the living.'),
    sent('Akk-Gilg-10-3', ['Enkidu', 'ibrī', 'ša', 'arāmu', 'dannīš', 'illik', 'ana', 'šīmti', 'amēlūti'], 'Enkidu, my friend whom I greatly loved, has gone to the fate of mankind.'),
    sent('Akk-Gilg-10-4', ['urri', 'u', 'mūši', 'bakâku', 'elīšu'], 'Day and night I weep over him.'),
    sent('Akk-Gilg-10-5', ['mūtu', 'eppēš-ma', 'amâtu', 'ḫâliqu'], 'I am afraid of death; I will perish.'),
    sent('Akk-Gilg-10-6', ['Utnapištim', 'iqâbi', 'ana', 'Gilgameš', 'ammīni', 'tagdamir', 'pakkīka'], 'Utnapishtim said to Gilgamesh: Why have you exhausted yourself?'),
    sent('Akk-Gilg-10-7', ['ša', 'mūti', 'lā', 'illebbū', 'mussa'], 'Of death no man knows the form.'),
  ],
};

// ─── Code of Hammurabi — Prologue ────────────────────────────────────────────

export const AKK_HAMMURABI_1: TextSection = {
  id: 'Akk-Ham-1',
  textId: 'Akk-Ham',
  sequence: 1,
  label: 'Prologue — When Anum the Lofty',
  sentences: [
    sent('Akk-Ham-1-1', ['inūma', 'Anum', 'ṣīrum', 'šar', 'Anunnaki', 'Enlil', 'bēl', 'šamê', 'u', 'erṣetim'], 'When lofty Anum, king of the Anunnaki, and Enlil, lord of heaven and earth...'),
    sent('Akk-Ham-1-2', ['ana', 'Marduk', 'mārim', 'rēštîm', 'ša', 'Ea', 'enūt', 'kiššat', 'nišī', 'išīm-šum'], '...assigned to Marduk, the firstborn son of Ea, dominion over the totality of mankind.'),
    sent('Akk-Ham-1-3', ['ina', 'Bābilim', 'šubat-su', 'ṣīrtim', 'ukinnū-šum'], 'In Babylon they established for him an exalted dwelling.'),
    sent('Akk-Ham-1-4', ['inūmīšu', 'Ḫammurabi', 'rubâm', 'naʾdam', 'pāliḫ', 'ilī'], 'At that time, me, Hammurabi, the reverent prince, who fears the gods —'),
    sent('Akk-Ham-1-5', ['ana', 'mīšarim', 'ina', 'mātim', 'ana', 'šūpîm'], '— to cause justice to appear in the land...'),
    sent('Akk-Ham-1-6', ['raggam', 'u', 'ṣēnam', 'ana', 'ḫulluqim'], '...to destroy the wicked and the evil...'),
    sent('Akk-Ham-1-7', ['dannum', 'enšam', 'ana', 'lā', 'ḫabālim'], '...so that the strong might not oppress the weak,'),
    sent('Akk-Ham-1-8', ['Anum', 'u', 'Enlil', 'ana', 'šīr', 'nišī', 'ṭubbim', 'šumī', 'ibbû'], 'Anum and Enlil called my name for the well-being of the people.'),
  ],
};

// ─── Code of Hammurabi — Selected Laws ───────────────────────────────────────

export const AKK_HAMMURABI_2: TextSection = {
  id: 'Akk-Ham-2',
  textId: 'Akk-Ham',
  sequence: 2,
  label: 'Selected Laws (§1, §3, §5)',
  sentences: [
    sent('Akk-Ham-2-1', ['šumma', 'awīlum', 'awīlam', 'ubbiramma', 'nērtam', 'elīšu', 'iddi'], 'If a man has accused another man and laid a charge of murder against him...'),
    sent('Akk-Ham-2-2', ['u', 'lā', 'uktīn-šu', 'mubbir-šu', 'iddâk'], '...but cannot prove it, his accuser shall be put to death.'),
    sent('Akk-Ham-2-3', ['šumma', 'awīlum', 'ina', 'dīnim', 'ana', 'šībūt', 'sarrātim', 'ūṣiamma'], 'If a man in a lawsuit has come forward with false testimony...'),
    sent('Akk-Ham-2-4', ['u', 'awât', 'iqbû', 'lā', 'uktīn', 'dīnum', 'šū', 'dīn', 'napištim'], '...and the testimony he gave cannot be verified, if the case is a capital case, that man shall be put to death.'),
    sent('Akk-Ham-2-5', ['šumma', 'dayyānum', 'dīnam', 'idīn', 'purussâm', 'iprus'], 'If a judge has rendered a verdict, decided a case...'),
    sent('Akk-Ham-2-6', ['kunukkam', 'ušēzib', 'warkânum', 'dīn-šu', 'ītēni'], '...and sealed a tablet, and afterwards alters his judgment...'),
    sent('Akk-Ham-2-7', ['dayyānam', 'šuati', 'ina', 'dīn', 'idīnu', 'ukannūšu-ma'], '...they shall convict that judge of changing the verdict that he gave...'),
    sent('Akk-Ham-2-8', ['ina', 'puḫrim', 'ina', 'kussî', 'dayyānūti-šu', 'ušetbû-šu'], '...and they shall remove him from his judge’s seat in the assembly.'),
  ],
};

export const ALL_AKKADIAN_EXTENDED_SECTIONS: TextSection[] = [
  AKK_GILGAMESH_2,
  AKK_GILGAMESH_6,
  AKK_GILGAMESH_10,
  AKK_HAMMURABI_1,
  AKK_HAMMURABI_2,
];
