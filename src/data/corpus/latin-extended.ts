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

export const LAT_HORACE_ODES_2_10: TextSection = {
  id: 'Hor-2-10',
  textId: 'Hor-Carm',
  sequence: 2,
  label: 'Odes II.10 — Auream quisquis mediocritatem',
  sentences: [
    sent('Hor-2-10-1', ['Rectius', 'vives,', 'Licini,', 'neque', 'altum', 'semper', 'urgendo', 'neque,', 'dum', 'procellas', 'cautus', 'horrescis,', 'nimium', 'premendo', 'litus', 'iniquum.'], 'You will live more rightly, Licinius, by neither always pressing out to deep sea, nor while you cautiously dread storms, hugging too much the dangerous shore.'),
    sent('Hor-2-10-2', ['Auream', 'quisquis', 'mediocritatem', 'diligit,', 'tutus', 'caret', 'obsoleti', 'sordibus', 'tecti,', 'caret', 'invidenda', 'sobrius', 'aula.'], 'Whoever loves the golden mean, safely avoids the filth of a dingy house, and soberly avoids an enviable court.'),
  ],
};

export const LAT_LIVY_1_2: TextSection = {
  id: 'Livy-1-2',
  textId: 'Livy',
  sequence: 2,
  label: 'Ab Urbe Condita I.2 — Aeneas and Ascanius',
  sentences: [
    sent('Livy-1-2-1', ['Iam', 'primum', 'omnium', 'satis', 'constat', 'Troia', 'capta', 'in', 'ceteros', 'saevitum', 'esse', 'Troianos,', 'duobus,', 'Aeneae', 'Antenorique,', 'et', 'vetusti', 'iure', 'hospitii', 'et', 'quia', 'pacis', 'reddendaeque', 'Helenae', 'semper', 'auctores', 'fuerant,', 'omne', 'ius', 'belli', 'Achivos', 'abstinuisse;'], 'It is generally agreed that after Troy was taken, the anger of the Greeks was vented upon the other Trojans, but that two, Aeneas and Antenor, were spared all the rights of war—both because of ancient ties of hospitality and because they had always been advocates of peace and of restoring Helen.'),
    sent('Livy-1-2-2', ['Aenean', 'cum', 'Penatibus', 'ac', 'magnis', 'dis', 'sedem', 'quaerere', 'profugum', 'in', 'Italiam', 'venisse.'], 'That Aeneas, driven from home, came to Italy seeking a new home for his household gods and the great gods.'),
    sent('Livy-1-2-3', ['Aborigines', 'Turnoque', 'rudi', 'atque', 'agresti', 'adversus', 'eum', 'arma', 'ceperant.'], 'The Aborigines and Turnus had taken up arms against him.'),
  ],
};

export const LAT_SALLUST_CAT_2: TextSection = {
  id: 'Sall-Cat-2',
  textId: 'Sall-Cat',
  sequence: 2,
  label: 'Chapters 4–5 — Character of Catiline',
  sentences: [
    sent('Sall-Cat-2-1', ['L.', 'Catilinam,', 'nobili', 'genere', 'natum,', 'fuisse', 'magnam', 'vim', 'et', 'animi', 'et', 'corporis,', 'sed', 'ingenio', 'malo', 'pravove.'], 'Lucius Catiline, born of noble lineage, had great strength of both mind and body, but with a wicked and depraved nature.'),
    sent('Sall-Cat-2-2', ['Huic', 'ab', 'adulescentia', 'bella', 'intestina,', 'caedes,', 'rapinae,', 'discordia', 'civilis', 'grata;', 'ibique', 'iuventutem', 'suam', 'exercuit.'], 'From youth onward, civil wars, murders, plunder, and civil discord were pleasing to him; and there he exercised his youth.'),
    sent('Sall-Cat-2-3', ['Corpus', 'patiens', 'inediae,', 'vigiliae,', 'algoris', 'supra', 'quam', 'cuiquam', 'credibile', 'est.'],
      'His body was capable of enduring hunger, cold, and lack of sleep beyond what is believable for anyone.'),
  ],
};

export const LAT_TACITUS_ANN_2: TextSection = {
  id: 'Tac-Ann-2',
  textId: 'Tac-Ann',
  sequence: 2,
  label: 'Annals XV.38 — The Great Fire of Rome',
  sentences: [
    sent('Tac-Ann-2-1', ['Sequitur', 'clades,', 'forte', 'an', 'dolo', 'principis', 'incertum—', 'nam', 'utrumque', 'auctores', 'prodiderunt—', 'sed', 'omnibus', 'quae', 'huic', 'urbi', 'per', 'violentiam', 'ignium', 'acciderunt', 'gravior', 'atque', 'horribilior.'], 'A disaster followed—whether by chance or by the treachery of the emperor is uncertain, for authors have handed down both accounts—but it was more grievous and terrible than all that has ever happened to this city through the violence of fires.'),
    sent('Tac-Ann-2-2', ['Principio', 'in', 'ea', 'parte', 'circi', 'ortum', 'incendium', 'quae', 'Palatio', 'Caelioque', 'coniungitur;', 'inde', 'per', 'eminentia', 'et', 'adnexa', 'domibus', 'vicisque', 'quae', 'continuo', 'tractu', 'et', 'muro', 'crebrisque', 'insulis', 'densisque', 'in', 'ora', 'ardor', 'prolatus,', 'longo', 'et', 'nigro', 'fumo', 'cuncta', 'obtexens.'], 'The fire began in that part of the Circus which adjoins the Palatine and Caelian hills; then, spreading through the prominent and adjoining buildings, it swept through the houses and streets—an unbroken stretch of structures, walls, and dense tenements—with a long and black smoke covering everything.'),
    sent('Tac-Ann-2-3', ['Vastatumque', 'dehinc', 'et', 'circum', 'Iovem', 'Statoris', 'et', 'inferias', 'ad', 'hanc', 'diem', 'sacras', 'aedes', 'Plautii', 'Lamia', 'totamque', 'urbem', 'flamma', 'coeperat.'], 'Then the fire spread, laying waste to the area around the Temple of Jupiter Stator and the sacred buildings dedicated to the dead—the house of Plautius Lamia—and the entire city was seized by the flames.'),
  ],
};

export const ALL_LATIN_EXTENDED_SECTIONS: TextSection[] = [
  LAT_HORACE_ODES_2_10,
  LAT_LIVY_1_2,
  LAT_SALLUST_CAT_2,
  LAT_TACITUS_ANN_2,
];
