/**
 * Latin classics — Horace, Livy, Sallust, Tacitus
 * All texts are public domain.
 */

import { TextSection, Sentence } from '../../types/corpus.js';
import { LAT_MINI_LEX } from './latin-mini-stories.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const hit = LAT_MINI_LEX[normalized];
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: hit?.lemma || normalized,
        gloss: hit?.gloss || '',
        morphology: { partOfSpeech: hit?.partOfSpeech || 'unknown' },
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

// ─── Horace, Carmina I.1 — Maecenas atavis ───────────────────────────────────

export const LAT_HORACE_ODES_1_1: TextSection = {
  id: 'Hor-1-1',
  textId: 'Hor-Carm',
  sequence: 1,
  label: 'Odes I.1 — Maecenas atavis',
  sentences: [
    sent('Hor-1-1-1',
      ['Maecenas', 'atavis', 'edite', 'regibus,'],
      'Maecenas, descended from ancestral kings,'),
    sent('Hor-1-1-2',
      ['o', 'et', 'praesidium', 'et', 'dulce', 'decus', 'meum:'],
      'O both my protection and my sweet glory:'),
    sent('Hor-1-1-3',
      ['sunt', 'quos', 'curriculo', 'pulverem', 'Olympicum', 'collegisse', 'iuvat'],
      'There are those whom it delights to have gathered Olympic dust on the track'),
    sent('Hor-1-1-4',
      ['metaque', 'fervidis', 'evitata', 'rotis', 'palmaque', 'nobilis'],
      'and the turning-post avoided by smoking wheels, and the noble palm'),
    sent('Hor-1-1-5',
      ['terrarum', 'dominos', 'evehit', 'ad', 'deos;'],
      'lifts them, lords of the earth, to the gods;'),
    sent('Hor-1-1-6',
      ['hunc', 'si', 'mobilium', 'turba', 'Quiritium', 'certat', 'tollere', 'honoribus,'],
      'this one, if the fickle crowd of Romans strives to raise him to office,'),
    sent('Hor-1-1-7',
      ['illum', 'si', 'proprio', 'condidit', 'horreo', 'quidquid', 'de', 'Libycis', 'verritur', 'areis.'],
      'that one, if he has stored in his own granary all that is swept from Libyan threshing-floors.'),
    sent('Hor-1-1-8',
      ['Me', 'doctarum', 'hederae', 'praemia', 'frontium', 'dis', 'miscent', 'superis'],
      'The ivy, prize of learned brows, mingles me with the gods above;'),
    sent('Hor-1-1-9',
      ['me', 'gelidum', 'nemus', 'Nympharumque', 'leves', 'cum', 'Satyris', 'chori', 'secernunt', 'populo'],
      'the cool grove and the light dances of Nymphs with Satyrs set me apart from the crowd'),
    sent('Hor-1-1-10',
      ['si', 'neque', 'tibias', 'Euterpe', 'cohibet', 'nec', 'Polyhymnia', 'Lesboum', 'refugit', 'tendere', 'barbiton.'],
      'if neither Euterpe withholds her flute nor Polyhymnia refuses to tune the Lesbian lyre.'),
  ],
};

// ─── Horace, Carmina I.9 — Vides ut alta ─────────────────────────────────────

export const LAT_HORACE_ODES_1_9: TextSection = {
  id: 'Hor-1-9',
  textId: 'Hor-Carm',
  sequence: 2,
  label: 'Odes I.9 — Vides ut alta',
  sentences: [
    sent('Hor-1-9-1',
      ['Vides', 'ut', 'alta', 'stet', 'nive', 'candidum', 'Soracte,'],
      'Do you see how Soracte stands white with deep snow,'),
    sent('Hor-1-9-2',
      ['nec', 'iam', 'sustineant', 'onus', 'silvae', 'laborantes'],
      'nor do the struggling forests any longer bear their burden'),
    sent('Hor-1-9-3',
      ['geluque', 'flumina', 'constiterint', 'acuto?'],
      'and the rivers have stopped with biting frost?'),
    sent('Hor-1-9-4',
      ['Dissolve', 'frigus', 'ligna', 'super', 'foco', 'large', 'reponens'],
      'Dissolve the cold by piling wood generously on the hearth'),
    sent('Hor-1-9-5',
      ['atque', 'benignius', 'deprome', 'quadrimum', 'Sabina,', 'o', 'Thaliarche,', 'merum', 'diota.'],
      'and bring out more generously, O Thaliarchus, four-year-old wine in a two-handled Sabine jar.'),
    sent('Hor-1-9-6',
      ['Permitte', 'divis', 'cetera,', 'qui', 'simul', 'stravere', 'ventos', 'aequore', 'fervido', 'deproeliantes,'],
      'Leave all else to the gods, who, as soon as they have quelled the winds battling on the seething deep,'),
    sent('Hor-1-9-7',
      ['nec', 'cupressi', 'nec', 'veteres', 'agitantur', 'orni.'],
      'neither the cypresses nor the ancient ash trees are stirred.'),
    sent('Hor-1-9-8',
      ['Quid', 'sit', 'futurum', 'cras', 'fuge', 'quaerere', 'et', 'quem', 'Fors', 'dierum', 'cumque', 'dabit', 'lucro', 'appone.'],
      'Cease to ask what tomorrow will bring, and whatever days Fortune gives, count them as gain.'),
  ],
};

// ─── Horace, Carmina I.11 — Carpe diem ───────────────────────────────────────

export const LAT_HORACE_ODES_1_11: TextSection = {
  id: 'Hor-1-11',
  textId: 'Hor-Carm',
  sequence: 3,
  label: 'Odes I.11 — Tu ne quaesieris (Carpe diem)',
  sentences: [
    sent('Hor-1-11-1',
      ['Tu', 'ne', 'quaesieris', '—', 'scire', 'nefas', '—', 'quem', 'mihi,', 'quem', 'tibi', 'finem', 'di', 'dederint,', 'Leuconoe,'],
      'Do not ask — it is forbidden to know — what end the gods have given to me and to you, Leuconoe,'),
    sent('Hor-1-11-2',
      ['nec', 'Babylonios', 'temptaris', 'numeros.'],
      'nor try Babylonian calculations.'),
    sent('Hor-1-11-3',
      ['Ut', 'melius,', 'quidquid', 'erit,', 'pati.'],
      'How much better it is to endure whatever will be.'),
    sent('Hor-1-11-4',
      ['Seu', 'pluris', 'hiemes', 'seu', 'tribuit', 'Iuppiter', 'ultimam,'],
      'Whether Jupiter has given you many winters or the last,'),
    sent('Hor-1-11-5',
      ['quae', 'nunc', 'oppositis', 'debilitat', 'pumicibus', 'mare', 'Tyrrhenum:'],
      'which now wears down the Tyrrhenian sea on opposing rocks:'),
    sent('Hor-1-11-6',
      ['sapias,', 'vina', 'liques', 'et', 'spatio', 'brevi', 'spem', 'longam', 'reseces.'],
      'be wise, strain your wine, and within the brief space cut back far-reaching hope.'),
    sent('Hor-1-11-7',
      ['Dum', 'loquimur,', 'fugerit', 'invida', 'aetas:'],
      'While we speak, envious time will have fled:'),
    sent('Hor-1-11-8',
      ['carpe', 'diem,', 'quam', 'minimum', 'credula', 'postero.'],
      'seize the day, trusting as little as possible in tomorrow.'),
  ],
};

// ─── Livy, Ab Urbe Condita — Praefatio ───────────────────────────────────────

export const LAT_LIVY_PRAEF: TextSection = {
  id: 'Livy-Praef',
  textId: 'Livy-AUC',
  sequence: 1,
  label: 'Praefatio — Preface',
  sentences: [
    sent('Livy-Pr-1',
      ['Facturusne', 'operae', 'pretium', 'sim', 'si', 'a', 'prima', 'origine', 'urbis', 'res', 'populi', 'Romani', 'perscripserim', 'nec', 'satis', 'scio', 'nec,', 'si', 'sciam,', 'dicere', 'ausim.'],
      'Whether I shall accomplish something worth the effort if I write a complete history of the Roman people from the very beginning of the city, I do not know well enough, nor, if I did know, would I dare to say.'),
    sent('Livy-Pr-2',
      ['Vetus', 'res', 'est', 'repetita', 'ab', 'aliis', 'atque', 'inter', 'se', 'contendentibus', 'utrum', 'potiorem', 'laudem', 'scriptores', 'antiqui', 'habeant', 'an', 'recentiores.'],
      'It is an old matter, having been taken up by others, and they contend among themselves whether ancient or more recent writers have the greater praise.'),
    sent('Livy-Pr-3',
      ['Novi', 'semper', 'scriptores', 'aut', 'in', 'rebus', 'certius', 'aliquid', 'allaturos', 'se', 'aut', 'scribendi', 'arte', 'rudem', 'vetustatem', 'superaturos', 'credunt.'],
      'New writers always believe they will contribute something more certain in the facts, or that they will surpass the rough antiquity in the art of writing.'),
    sent('Livy-Pr-4',
      ['Utcumque', 'erit,', 'iuvabit', 'tamen', 'rerum', 'gestarum', 'memoriae', 'principis', 'terrarum', 'populi', 'pro', 'virili', 'parte', 'et', 'ipsum', 'consuluisse.'],
      'Whatever the case, it will nonetheless be satisfying to have contributed one\'s own part to preserving the memory of the deeds of the greatest people on earth.'),
    sent('Livy-Pr-5',
      ['Hoc', 'illud', 'est', 'praecipue', 'in', 'cognitione', 'rerum', 'salubre', 'ac', 'frugiferum,', 'omnis', 'te', 'exempli', 'documenta', 'in', 'inlustri', 'posita', 'monumento', 'intueri.'],
      'This is especially wholesome and fruitful in the study of history: you behold lessons of every kind of example set in a conspicuous monument.'),
    sent('Livy-Pr-6',
      ['Inde', 'tibi', 'tuaeque', 'rei', 'publicae', 'quod', 'imitere', 'capias,', 'inde', 'foedum', 'inceptu', 'foedum', 'exitu', 'quod', 'vites.'],
      'From it you may choose for yourself and for your state what to imitate; from it what to avoid as base in its beginning, base in its outcome.'),
  ],
};

// ─── Livy, Ab Urbe Condita I.1 ────────────────────────────────────────────────

export const LAT_LIVY_1_1: TextSection = {
  id: 'Livy-1-1',
  textId: 'Livy-AUC',
  sequence: 2,
  label: 'Book I.1 — The origins of Rome',
  sentences: [
    sent('Livy-1-1-1',
      ['Iam', 'primum', 'omnium', 'satis', 'constat', 'Troia', 'capta', 'in', 'ceteros', 'saevitum', 'esse', 'Troianos;'],
      'First of all it is generally agreed that when Troy was taken, savage punishment was inflicted on the other Trojans;'),
    sent('Livy-1-1-2',
      ['duobus,', 'Aeneae', 'Antenorique,', 'et', 'vetusti', 'iure', 'hospitii', 'et', 'quia', 'pacis', 'reddendaeque', 'Helenae', 'semper', 'auctores', 'fuerant,', 'omne', 'ius', 'belli', 'Achivos', 'abstinuisse.'],
      'but from two, Aeneas and Antenor, the Achaeans had refrained from all rights of war, both by reason of long-standing guest-friendship and because they had always favored peace and the return of Helen.'),
    sent('Livy-1-1-3',
      ['Antenorem', 'cum', 'multis', 'milibus', 'Enetum,', 'qui', 'seditione', 'ex', 'Paphlagonia', 'pulsi', 'et', 'sedes', 'et', 'ducem', 'rege', 'Pylaemene', 'ad', 'Troiam', 'amisso', 'quaerebant,', 'venisse', 'in', 'intimum', 'maris', 'Hadriatici', 'sinum.'],
      'Antenor came with many thousands of the Veneti, who had been driven out of Paphlagonia by a revolution and were seeking both a home and a leader after losing their king Pylaemenes at Troy, into the inmost recess of the Adriatic sea.'),
    sent('Livy-1-1-4',
      ['Aeneas', 'profugus', 'ex', 'eadem', 'clade', 'primum', 'in', 'Macedoniam', 'venit,', 'inde', 'in', 'Siciliam', 'quaerentem', 'sedes', 'delatus', 'est;'],
      'Aeneas, a fugitive from the same disaster, came first to Macedonia, then was carried to Sicily in search of a home;'),
    sent('Livy-1-1-5',
      ['ab', 'Sicilia', 'classe', 'ad', 'Laurentem', 'agrum', 'tenet.'],
      'from Sicily he makes for the Laurentine territory with his fleet.'),
    sent('Livy-1-1-6',
      ['Locus', 'Troia', 'vocatur.', 'Ibi', 'egressi', 'Troiani', 'ut', 'quibus', 'ab', 'immenso', 'prope', 'errore', 'nihil', 'praeter', 'arma', 'et', 'naves', 'erat,', 'cum', 'praedatum', 'in', 'agros', 'proximos', 'irent,', 'Latinus', 'rex', 'Aboriginesque', 'ad', 'arcendam', 'vim', 'advenarum', 'armati', 'occurrunt.'],
      'The place is called Troy. There the Trojans disembarked, and as men who had nothing left after their nearly boundless wandering but arms and ships, when they were going to plunder the nearest lands, King Latinus and the Aborigines came armed to repel the force of the strangers.'),
  ],
};

// ─── Sallust, Bellum Catilinae I–III ─────────────────────────────────────────

export const LAT_SALLUST_CAT: TextSection = {
  id: 'Sall-Cat-1',
  textId: 'Sall-Cat',
  sequence: 1,
  label: 'Chapters 1–3 — On the nature of man and glory',
  sentences: [
    sent('Sall-Cat-1-1',
      ['Omnis', 'homines,', 'qui', 'sese', 'student', 'praestare', 'ceteris', 'animalibus,', 'summa', 'ope', 'niti', 'decet', 'ne', 'vitam', 'silentio', 'transeant', 'veluti', 'pecora,', 'quae', 'natura', 'prona', 'atque', 'ventri', 'oboedientia', 'finxit.'],
      'All men who desire to excel the other animals ought to strive with the utmost effort not to pass through life in silence, like cattle, which nature has fashioned prone and obedient to the belly.'),
    sent('Sall-Cat-1-2',
      ['Sed', 'nostra', 'omnis', 'vis', 'in', 'animo', 'et', 'corpore', 'sita', 'est;', 'animi', 'imperio,', 'corporis', 'servitio', 'magis', 'utimur;'],
      'But all our power is located in mind and body; we use the command of the mind and the service of the body rather more.'),
    sent('Sall-Cat-1-3',
      ['alterum', 'nobis', 'cum', 'dis,', 'alterum', 'cum', 'beluis', 'commune', 'est.'],
      'The one we share with the gods, the other with the beasts.'),
    sent('Sall-Cat-2-1',
      ['Igitur', 'initio', 'reges', '—', 'nam', 'in', 'terris', 'nomen', 'imperi', 'id', 'primum', 'fuit', '—', 'divorsi', 'pars', 'ingenium,', 'alii', 'corpus', 'exercebant:'],
      'In the beginning, therefore, kings — for that was the first title of power on earth — were divided; some exercised their intellect, others their body:'),
    sent('Sall-Cat-2-2',
      ['etiam', 'tum', 'vita', 'hominum', 'sine', 'cupiditate', 'agitabatur;', 'sua', 'cuique', 'satis', 'placebant.'],
      'Even then the life of men was conducted without greed; one\'s own was enough for each.'),
    sent('Sall-Cat-3-1',
      ['Sed', 'profecto', 'fortuna', 'in', 'omni', 're', 'dominatur;', 'ea', 'res', 'cunctas', 'ex', 'lubidine', 'magis', 'quam', 'ex', 'vero', 'celebratque', 'obscuratque.'],
      'But fortune, it is certain, holds dominion in every matter; it glorifies and obscures all things more according to caprice than truth.'),
    sent('Sall-Cat-3-2',
      ['Atheniensium', 'res', 'gestae,', 'sicuti', 'ego', 'aestumo,', 'satis', 'amplae', 'magnificaeque', 'fuere,', 'verum', 'aliquanto', 'minores', 'tamen', 'quam', 'fama', 'feruntur.'],
      'The deeds of the Athenians, as I estimate, were great and splendid enough, yet somewhat less, however, than they are reported by fame.'),
    sent('Sall-Cat-3-3',
      ['Sed', 'quia', 'provenere', 'ibi', 'scriptorum', 'magna', 'ingenia,', 'per', 'terrarum', 'orbem', 'Atheniensium', 'facta', 'pro', 'maximis', 'celebrantur.'],
      'But because there arose there great geniuses of writers, the deeds of the Athenians are celebrated throughout the world as the greatest.'),
    sent('Sall-Cat-3-4',
      ['Ita', 'eorum', 'qui', 'ea', 'fecere', 'virtus', 'tanta', 'habetur', 'quantum', 'eam', 'verbis', 'potuere', 'extollere', 'praeclara', 'ingenia.'],
      'Thus the excellence of those who did those deeds is valued as high as brilliant minds could extol it in words.'),
    sent('Sall-Cat-3-5',
      ['At', 'populo', 'Romano', 'numquam', 'ea', 'copia', 'fuit,', 'quia', 'prudentissumus', 'quisque', 'negotiosus', 'maxume', 'erat.'],
      'But the Roman people never had that abundance, because every very wise man was most occupied with business.'),
  ],
};

// ─── Tacitus, Annals I.1–3 ────────────────────────────────────────────────────

export const LAT_TACITUS_ANN: TextSection = {
  id: 'Tac-Ann-1',
  textId: 'Tac-Ann',
  sequence: 1,
  label: 'I.1–3 — From kings to Augustus',
  sentences: [
    sent('Tac-Ann-1-1',
      ['Urbem', 'Romam', 'a', 'principio', 'reges', 'habuere;'],
      'The city of Rome was governed from the beginning by kings.'),
    sent('Tac-Ann-1-2',
      ['libertatem', 'et', 'consulatum', 'L.', 'Brutus', 'instituit.'],
      'Liberty and the consulship were established by Lucius Brutus.'),
    sent('Tac-Ann-1-3',
      ['Dictaturae', 'ad', 'tempus', 'sumebantur;', 'neque', 'decemviralis', 'potestas', 'ultra', 'biennium', 'neque', 'tribunorum', 'militum', 'consulare', 'ius', 'diu', 'valuit.'],
      'Dictatorships were assumed for a limited time; the decemviral power lasted no longer than two years, nor did the consular authority of military tribunes long prevail.'),
    sent('Tac-Ann-1-4',
      ['Non', 'Cinnae,', 'non', 'Sullae', 'longa', 'dominatio;', 'et', 'Pompei', 'Crassique', 'potentia', 'cito', 'in', 'Caesarem,', 'Lepidi', 'atque', 'Antonii', 'arma', 'in', 'Augustum', 'cessere.'],
      'The domination of neither Cinna nor Sulla was lasting; the power of Pompey and Crassus quickly yielded to Caesar, and the arms of Lepidus and Antony to Augustus.'),
    sent('Tac-Ann-1-5',
      ['qui', 'cuncta', 'discordiis', 'civilibus', 'fessa', 'nomine', 'principis', 'sub', 'imperium', 'accepit.'],
      'He received under his rule all things exhausted by civil discords under the title of princeps.'),
    sent('Tac-Ann-2-1',
      ['Sed', 'veteris', 'populi', 'Romani', 'prospera', 'vel', 'adversa', 'claris', 'scriptoribus', 'memorata', 'sunt;', 'temporibusque', 'Augusti', 'dicendis', 'non', 'defuere', 'decora', 'ingenia.'],
      'But the prosperous or adverse affairs of the ancient Roman people have been recorded by brilliant writers; and for the times of Augustus there was no lack of distinguished intellects to describe them.'),
    sent('Tac-Ann-3-1',
      ['Inde', 'consilium', 'mihi', 'pauca', 'de', 'Augusto', 'et', 'suprema', 'tradere,', 'mox', 'Tiberii', 'principatum', 'et', 'cetera,', 'sine', 'ira', 'et', 'studio,', 'quorum', 'causas', 'procul', 'habeo.'],
      'Hence my purpose to record a few things about Augustus and his end, then the principate of Tiberius and the rest, without anger or bias, from which I stand remote.'),
    sent('Tac-Ann-3-2',
      ['Postquam', 'Bruto', 'et', 'Cassio', 'caesis', 'nulla', 'iam', 'publica', 'arma,', 'Pompeius', 'apud', 'Siciliam', 'oppressus', 'exutoque', 'Lepido,', 'interfecto', 'Antonio', 'ne', 'Iulianis', 'quidem', 'partibus', 'nisi', 'Caesar', 'dux', 'reliquus,', 'posito', 'triumviri', 'nomine', 'consulem', 'se', 'ferens', 'et', 'ad', 'tuendam', 'plebem', 'tribunicio', 'iure', 'contentum', 'ubi', 'militem', 'donis,', 'populum', 'annona,', 'cunctos', 'dulcedine', 'otii', 'pellexit,', 'insurgere', 'paulatim,', 'munia', 'senatus', 'magistratuum', 'legum', 'in', 'se', 'trahere.'],
      'After Brutus and Cassius were slain, and there were no more public armies, Pompey had been crushed near Sicily, Lepidus stripped of his power, Antony killed, and even among the Julian faction no leader remained but Caesar — laying aside the name of triumvir, presenting himself as consul and satisfied with tribunician power to protect the plebs — when he had attracted the soldiers with gifts, the people with grain, and everyone with the sweetness of peace, he began gradually to rise and to draw into his hands the functions of senate, magistrates, and laws.'),
  ],
};

export const ALL_LATIN_CLASSICS_SECTIONS = [
  LAT_HORACE_ODES_1_1, LAT_HORACE_ODES_1_9, LAT_HORACE_ODES_1_11,
  LAT_LIVY_PRAEF, LAT_LIVY_1_1,
  LAT_SALLUST_CAT,
  LAT_TACITUS_ANN,
];
