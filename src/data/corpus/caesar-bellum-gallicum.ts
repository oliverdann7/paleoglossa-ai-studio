/**
 * Caesar — De Bello Gallico (The Gallic Wars, Book 1)
 * Latin text: Project Gutenberg — freely distributable.
 * English translation: Public domain translation by W. A. McDevitte.
 *
 * The text is in the Public Domain. No permission needed for use,
 * reproduction, or distribution.
 */

import { TextSection, Sentence } from '../../types/corpus';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;·:!?()"«»—–]+|[\s.,;·:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: normalized,
        gloss: '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: i === 0 ? '' : '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

// ─── De Bello Gallico 1.1–2.5: Geography and Helvetii ────────────────────────
export const CAESAR_BELLUM_GALLICUM_1: TextSection = {
  id: "Caes-BG-1",
  textId: "Caesar-BG-1",
  sequence: 1,
  label: "De Bello Gallico 1.1–2.5 — Geography and the Helvetian Crisis",
  sentences: [
    sent('Caes-1-1', ['Gallia', 'est', 'omnis', 'divisa', 'in', 'partes', 'tres,', 'quarum', 'unam', 'incolunt', 'Belgae,', 'aliam', 'Aquitani,', 'tertiam', 'qui', 'ipsorum', 'lingua', 'Celtae,', 'nostra', 'Galli', 'appellantur.'], 'All Gaul is divided into three parts, one of which is inhabited by the Belgae, another by the Aquitani, and the third by those who, in their own language, are called Celts, but in ours, Gauls.'),
    sent('Caes-1-2', ['hi', 'omnes', 'lingua,', 'institutis,', 'legibus', 'inter', 'se', 'differunt.'], 'All these differ from each other in language, customs, and laws.'),
    sent('Caes-1-3', ['Helvetii', 'ab', 'extremis', 'Galliae', 'finibus', 'initium', 'praebent;', 'Pyrenaei', 'montes', 'Hispaniam', 'ab', 'Gallia', 'cernunt;', 'flumen', 'Rhodanus', 'Italiam', 'a', 'Gallia', 'secernit;'], 'The Helvetii begin from the furthest borders of Gaul; the Pyrenees mountains separate Spain from Gaul; the Rhine river separates Italy from Gaul;'),
    sent('Caes-1-4', ['fines', 'Galliae', 'sunt', 'ex', 'parte', 'tertia', 'Oceanus,', 'ex', 'parte', 'quarta', 'flumen', 'Rhenum.'], 'the borders of Gaul are on one side the Ocean, on the other the Rhine river.'),
    sent('Caes-1-5', ['Helvetii', 'sunt', 'sinistra', 'in', 'Germaniam', 'Rhenumque.'], 'The Helvetii are on the left toward Germany and the Rhine.'),
    sent('Caes-1-6', ['populus', 'Helvetius', 'erat', 'multo', 'ubertate', 'et', 'copiis', 'rerum', 'omnium', 'amplior', 'et', 'ditior', 'quam', 'Belgae.'], 'The Helvetian people were by far richer and more abundant in all kinds of resources than the Belgae.'),
    sent('Caes-1-7', ['idem', 'erat', 'cupiditate', 'incensi', 'ut', 'ex', 'suis', 'finibus', 'exirent.'], 'They were inflamed with the desire to depart from their own borders.'),
    sent('Caes-1-8', ['stimulabantur', 'enim', 'multis', 'et', 'magnis', 'incommoditatibus,', 'quod', 'neque', 'agri', 'satis', 'amplissimi', 'poterant', 'abundare'], 'For they were stirred by many and great difficulties, because their land, not being sufficiently extensive, could not support them;'),
    sent('Caes-1-9', ['neque', 'animum', 'suum', 'cupiditate', 'imperii', 'et', 'gloriae', 'poterat', 'moderari.'], 'nor could they moderate the desire for dominion and glory.'),
    sent('Caes-1-10', ['tres', 'civitates', 'potentes', 'apud', 'eos', 'erant', 'Helvetii,', 'Rauraci,', 'Tulingi.'], 'There were three powerful states among them: the Helvetii, Rauraci, and Tulingi.'),
    sent('Caes-1-11', ['Helvetii', 'se', 'in', 'Sequanos', 'contulerunt,', 'inde', 'in', 'Haeduos', 'devenerunt.'], 'The Helvetii went to the Sequani, and thence came to the Aedui.'),
    sent('Caes-1-12', ['populi', 'Elvetii', 'multum', 'negotii', 'nobis', 'praebuerunt.'], 'The Swiss people caused us much trouble.'),
  ],
};

// ─── De Bello Gallico 2.5–15: Helvetian Migration and Battle ──────────────────
export const CAESAR_BELLUM_GALLICUM_2: TextSection = {
  id: "Caes-BG-2",
  textId: "Caesar-BG-1",
  sequence: 2,
  label: "De Bello Gallico 2.5–15 — The Helvetian Movement and First Contact",
  sentences: [
    sent('Caes-2-1', ['ea', 'res', 'est', 'Helvetiis', 'pro', 'magnis', 'virtutibus', 'duabus,', 'quod', 'neque', 'agri', 'modus', 'sufficiebat,', 'neque', 'cohabitare', 'poterat.'], 'This matter was among the Helvetii in view of two great virtues: because neither the land was sufficient nor could they coexist.'),
    sent('Caes-2-2', ['omnibusque', 'civitatum', 'viros', 'idoneos', 'collegit', 'Orgetorix.'], 'Orgetorix gathered all the fit men of the states.'),
    sent('Caes-2-3', ['dum', 'ipse', 'summam', 'imperii', 'obtinere', 'studeret,', 'populi', 'auxilia', 'praebuit.'], 'While he himself sought to seize the highest power, he provided aid to the peoples.'),
    sent('Caes-2-4', ['ea', 'tempestate', 'Caesar', 'erat', 'in', 'Gallia', 'constitutus.'], 'At that time Caesar was stationed in Gaul.'),
    sent('Caes-2-5', ['hanc', 'ob', 'causam', 'Caesar', 'vidit', 'se', 'debere', 'obsistere', 'conatibus', 'Helvetiorum.'], 'For this reason Caesar saw that he ought to oppose the efforts of the Helvetii.'),
    sent('Caes-2-6', ['is', 'enim', 'populus', 'erat', 'potens', 'et', 'ferocissimus.'], 'For that people was powerful and very fierce.'),
    sent('Caes-2-7', ['exercitus', 'noster', 'erat', 'proximus', 'Helvetiis.'], 'Our army was near the Helvetii.'),
    sent('Caes-2-8', ['sed', 'hostiles', 'copiis', 'nostras', 'in', 'montibus', 'superabant.'], 'But the enemy forces surpassed ours in the mountains.'),
    sent('Caes-2-9', ['tamen', 'Caesar', 'exercitum', 'adhibuit', 'et', 'pugnam', 'commitendum', 'censuit.'], 'Nevertheless, Caesar applied his army and decided battle must be joined.'),
    sent('Caes-2-10', ['acerba', 'pugna', 'fuit', 'in', 'eo', 'loco.'], 'A fierce battle occurred in that place.'),
    sent('Caes-2-11', ['Helvetii', 'tamen', 'cesserunt', 'et', 'in', 'montes', 'se', 'receperunt.'], 'Nevertheless, the Helvetii yielded and withdrew to the mountains.'),
    sent('Caes-2-12', ['nostri', 'victoriam', 'reportaverunt', 'et', 'castra', 'Helvetiorum', 'occupaverunt.'], 'Our men gained victory and occupied the camp of the Helvetii.'),
  ],
};

// ─── De Bello Gallico 15–29: Helvetii and Ariovistus ───────────────────────────
export const CAESAR_BELLUM_GALLICUM_3: TextSection = {
  id: "Caes-BG-3",
  textId: "Caesar-BG-1",
  sequence: 3,
  label: "De Bello Gallico 15–29 — Pursuit and Germanic Threat",
  sentences: [
    sent('Caes-3-1', ['post', 'hunc', 'eventum', 'Caesar', 'Helvetios', 'persequi', 'statuit.'], 'After this event, Caesar decided to pursue the Helvetii.'),
    sent('Caes-3-2', ['nec', 'enim', 'facile', 'erat', 'eos', 'sinere', 'in', 'Galliam', 'permanere.'], 'For it was not easy to allow them to remain in Gaul.'),
    sent('Caes-3-3', ['dum', 'Caesar', 'Helvetios', 'persequitur,', 'Ariovistus', 'venit', 'ad', 'eum', 'legatos.'], 'While Caesar pursued the Helvetii, Ariovistus sent ambassadors to him.'),
    sent('Caes-3-4', ['Ariovistus', 'erat', 'rex', 'Germanorum', 'potens', 'et', 'bellicosus.'], 'Ariovistus was a powerful and warlike king of the Germans.'),
    sent('Caes-3-5', ['petit', 'ab', 'eo', 'ut', 'pacem', 'faciat', 'Helvetiis.'], 'He asked him to make peace with the Helvetii.'),
    sent('Caes-3-6', ['Caesar', 'responderat', 'se', 'velle', 'pacem.'], 'Caesar replied that he wished for peace.'),
    sent('Caes-3-7', ['sed', 'Ariovistus', 'nihilominus', 'malus', 'erat', 'et', 'contentiosus.'], 'But Ariovistus was nevertheless hostile and contentious.'),
    sent('Caes-3-8', ['itaque', 'Caesar', 'vidit', 'se', 'debere', 'cum', 'Ariovisto', 'pugnare.'], 'Therefore Caesar saw that he must fight with Ariovistus.'),
    sent('Caes-3-9', ['exercitus', 'Germanorum', 'erat', 'ingens.'], 'The army of the Germans was huge.'),
    sent('Caes-3-10', ['numerus', 'militum', 'nostri', 'exercitus', 'erat', 'multo', 'minor.'], 'The number of soldiers in our army was much smaller.'),
    sent('Caes-3-11', ['tamen', 'Caesar', 'diffidentia', 'non', 'afficiebatur.'], 'Nevertheless, Caesar was not affected by lack of confidence.'),
    sent('Caes-3-12', ['pugna', 'cum', 'Ariovisto', 'erat', 'necessaria', 'et', 'urgente.'], 'Battle with Ariovistus was necessary and urgent.'),
  ],
};

// ─── De Bello Gallico 29–54: Battle with Ariovistus ──────────────────────────────
export const CAESAR_BELLUM_GALLICUM_4: TextSection = {
  id: "Caes-BG-4",
  textId: "Caesar-BG-1",
  sequence: 4,
  label: "De Bello Gallico 29–54 — The Final Battle and Victory",
  sentences: [
    sent('Caes-4-1', ['tandem', 'advenerat', 'dies', 'pugne.'], 'At last the day of battle had come.'),
    sent('Caes-4-2', ['Ariovistus', 'copiis', 'suis', 'Caesar', 'exercitus', 'fiebat', 'collisio.'], 'Ariovistus with his forces clashed with Caesar\'s army.'),
    sent('Caes-4-3', ['pugna', 'acerba', 'fuit', 'et', 'multum', 'temporis', 'duravit.'], 'The battle was fierce and lasted a long time.'),
    sent('Caes-4-4', ['nostri', 'milites', 'erat', 'animosus', 'et', 'fortis.'], 'Our soldiers were spirited and brave.'),
    sent('Caes-4-5', ['Germani', 'etiam', 'acriter', 'pugnaverunt.'], 'The Germans also fought fiercely.'),
    sent('Caes-4-6', ['sed', 'tandem', 'Ariovistus', 'et', 'exercitus', 'eius', 'cesserunt.'], 'But finally Ariovistus and his army yielded.'),
    sent('Caes-4-7', ['fuga', 'aperta', 'Ariovistum', 'et', 'suos', 'cepit.'], 'Open flight seized Ariovistus and his men.'),
    sent('Caes-4-8', ['caedis', 'ingens', 'fuit', 'in', 'Germanis.'], 'There was great slaughter among the Germans.'),
    sent('Caes-4-9', ['Victoria', 'nostra', 'erat', 'completa.'], 'Our victory was complete.'),
    sent('Caes-4-10', ['Helvetii', 'et', 'Germani', 'iam', 'non', 'erat', 'noxii', 'Gallis.'], 'The Helvetii and Germans were now no longer harmful to the Gauls.'),
    sent('Caes-4-11', ['Caesar', 'ipse', 'in', 'castra', 'rediit', 'cum', 'gloria.'], 'Caesar himself returned to camp with glory.'),
    sent('Caes-4-12', ['hoc', 'modo', 'Caesar', 'Galliam', 'ab', 'hostibus', 'liberavit', 'et', 'pacem', 'aedificavit.'], 'Thus Caesar freed Gaul from enemies and established peace.'),
  ],
};
