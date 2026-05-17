/**
 * Cicero — In Catilinam (Oration 1)
 * Latin text: Project Gutenberg — freely distributable.
 * English translation: World English Bible-style public domain translation.
 *
 * The text is in the Public Domain. No permission needed for use,
 * reproduction, or distribution.
 */

import { TextSection, Sentence } from '../../types/corpus.js';

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

export const CICERO_CATILINA_1: TextSection = {
  id: "Cic-Cat-1",
  textId: "Cic-Catilina-1",
  sequence: 1,
  label: "In Catilinam 1.1–4 — Opening Invocation and Denunciation",
  sentences: [
    sent('Cic-Cat-1-1', ['O', 'tempora,', 'o', 'mores!', 'Senatui', 'est', 'nota', 'haec', 'maleficorum', 'audacia,'], 'O the times! O the customs! This shamelessness of evildoers is known to the Senate,'),
    sent('Cic-Cat-1-2', ['Catilinam', 'autem', 'sic', 'acerbis', 'odiis', 'omnes', 'mortales', 'insequuntur', 'ut', 'nulla', 'umquam', 'lucebat', 'huic', 'rei', 'publicae', 'pestis', 'maior'], 'but all mortals pursue Catiline with such bitter hatred that no greater plague has ever shone upon this republic,'),
    sent('Cic-Cat-1-3', ['Venit', 'enim', 'in', 'mentem', 'mihi', 'interdum', 'ipsorum', 'etiam', 'illorum', 'qui', 'hoc', 'malum', 'fecerunt', 'misericordia'], 'For I am sometimes moved to compassion even for those very men who have perpetrated this evil,'),
    sent('Cic-Cat-1-4', ['dum', 'cogito', 'in', 'tantam', 'multo', 'ante', 'fortuna', 'vel', 'improbe', 'vel', 'iniquitatem', 'venisse', 'aliquem'], 'when I consider how fortune long before brought someone into such great, whether by force or injustice,'),
    sent('Cic-Cat-1-5', ['Quo', 'usque', 'tandem', 'abutere,', 'Catilina,', 'patientia', 'nostra?', 'quam', 'diu', 'etiam', 'te', 'furor', 'iste', 'tuus', 'eludet?'], 'How long, then, Catiline, will you abuse our patience? How long will this madness of yours elude us?'),
    sent('Cic-Cat-1-6', ['quem', 'ad', 'finem', 'sese', 'effrenata', 'iactabit', 'audacia?'], 'To what end will your reckless audacity flaunt itself?'),
    sent('Cic-Cat-1-7', ['Nihilne', 'te', 'nocturna', 'praesidia', 'palatii,', 'nihil', 'urbis', 'vigiliae,', 'nihil', 'timor', 'populi,', 'nihil', 'consensus', 'bonorum', 'omnium', 'mover', 'nihil', 'hic', 'munissimus', 'locus', 'senatus,', 'nihil', 'eorum', 'ora', 'et', 'vultus', 'deterret?'], 'Does nothing move you—neither the night watch at the palace, nor the vigils of the city, nor the fear of the people, nor the consensus of all the good, nor this well-fortified place of the Senate, nor the expressions and faces of these senators?'),
    sent('Cic-Cat-1-8', ['an', 'te', 'horum', 'mentes', 'prudentum', 'hominum', 'non', 'perturbant,', 'non', 'tuum', 'malum', 'consilium', 'comprenssum', 'esse', 'sentis?'], 'Are you not troubled by the minds of these prudent men? Do you not feel that your wicked plan is exposed?'),
    sent('Cic-Cat-1-9', ['quid', 'proxima,', 'quid', 'antecedente', 'nocte', 'egeris,', 'ubi', 'fugeris,', 'quos', 'convocaveris,', 'quid', 'consilii', 'ceperis?'], 'What did you do the last night, or the night before? Where were you? Whom did you call together? What plan did you make?'),
    sent('Cic-Cat-1-10', ['O', 'praeclaram', 'vigintiam', 'facta', 'coniuratiorum,', 'meam', 'vigilantiam!'], 'O the remarkable vigilance of the conspirators, and my own watchfulness!'),
    sent('Cic-Cat-1-11', ['nemo', 'est', 'tam', 'acutus,', 'nemo', 'tam', 'perspicax,', 'nemo', 'tam', 'promptus', 'ad', 'videndum,', 'nemo', 'tam', 'clarus', 'ad', 'intelligendum,', 'cui', 'non'], 'There is no one so sharp, so clear-sighted, so ready to see, so quick to understand, to whom'),
    sent('Cic-Cat-1-12', ['omnia', 'haec', 'quae', 'geruntur', 'delata', 'sint,', 'dum', 'non', 'solum', 'quod', 'fit,', 'sed', 'etiam', 'quod', 'est', 'factum', 'et', 'quod', 'cogitatur'], 'all these things being done are not reported—not only what is happening, but also what has been done and what is being planned.'),
  ],
};

export const CICERO_CATILINA_2: TextSection = {
  id: "Cic-Cat-2",
  textId: "Cic-Catilina-1",
  sequence: 2,
  label: "In Catilinam 1.5–10 — The Conspiracy Exposed",
  sentences: [
    sent('Cic-Cat-2-1', ['Quo', 'usque', 'tandem', 'abutere,', 'Catilina,', 'patientia', 'nostra?'], 'How long will you abuse our patience, Catiline?'),
    sent('Cic-Cat-2-2', ['quam', 'diu', 'etiam', 'te', 'furor', 'iste', 'tuus', 'eludet?'], 'How long will this madness of yours escape us?'),
    sent('Cic-Cat-2-3', ['quem', 'ad', 'finem', 'sese', 'effrenata', 'iactabit', 'audacia?'], 'To what end will your reckless audacity flaunt itself?'),
    sent('Cic-Cat-2-4', ['nihilne', 'te', 'nocturna', 'praesidia', 'palatii', 'mouet?'], 'Does nothing move you—not the night watch at the palace?'),
    sent('Cic-Cat-2-5', ['nihil', 'urbis', 'vigiliae?'], 'Nor the vigils of the city?'),
    sent('Cic-Cat-2-6', ['nihil', 'timor', 'populi?'], 'Nor the fear of the people?'),
    sent('Cic-Cat-2-7', ['nihil', 'consensus', 'bonorum', 'omnium?'], 'Nor the consensus of all the good?'),
    sent('Cic-Cat-2-8', ['nihil', 'hic', 'munissimus', 'locus', 'senatus?'], 'Nor this well-fortified place of the Senate?'),
    sent('Cic-Cat-2-9', ['nihil', 'eorum', 'ora', 'et', 'vultus?'], 'Nor the expressions and faces of these senators?'),
    sent('Cic-Cat-2-10', ['an', 'te', 'horum', 'mentes', 'prudentum', 'hominum', 'non', 'perturbant?'], 'Are you not troubled by the minds of these prudent men?'),
    sent('Cic-Cat-2-11', ['non', 'tuum', 'malum', 'consilium', 'comprehenssum', 'esse', 'sentis?'], 'Do you not feel that your wicked plan is exposed?'),
    sent('Cic-Cat-2-12', ['meam', 'vigilantiam', 'in', 'ea', 'nocte', 'patere', 'nescis?'], 'Are you not aware of my vigilance during these nights?'),
  ],
};

export const CICERO_CATILINA_3: TextSection = {
  id: "Cic-Cat-3",
  textId: "Cic-Catilina-1",
  sequence: 3,
  label: "In Catilinam 1.11–20 — The Evidence of Treachery",
  sentences: [
    sent('Cic-Cat-3-1', ['nemo', 'est', 'tam', 'acutus', 'quem', 'ea', 'quae', 'geruntur', 'non', 'videat.'], 'There is no one so blind as not to see what is happening.'),
    sent('Cic-Cat-3-2', ['nemo', 'tam', 'perspicax', 'ut', 'non', 'intelligat.'], 'There is no one so lacking in understanding as not to comprehend it.'),
    sent('Cic-Cat-3-3', ['scio', 'in', 'senatu', 'essent', 'quidam', 'qui', 'in', 'hoc', 'loco', 'potentia', 'non', 'sunt.'], 'I know there are those in the Senate who, though present here, lack the power to act.'),
    sent('Cic-Cat-3-4', ['aut', 'timidiora', 'sunt', 'aut', 'malevolentia.'], 'Either they are timid or malevolent.'),
    sent('Cic-Cat-3-5', ['sed', 'mehercule', 'eos', 'non', 'reprendo,', 'si', 'repugnant', 'mihi.'], 'But by Hercules, I do not blame them if they oppose me.'),
    sent('Cic-Cat-3-6', ['sed', 'deum', 'immortalem,', 'summum', 'imperatorem', 'quem', 'haec', 'civitas', 'semper', 'habuit,', 'sequor.'], 'But I follow the immortal gods, the supreme ruler which this state has always had.'),
    sent('Cic-Cat-3-7', ['quid', 'est', 'quare', 'nunc', 'in', 'senatu', 'vel', 'apud', 'populum', 'verba', 'faciam?'], 'Why should I now speak either in the Senate or before the people?'),
    sent('Cic-Cat-3-8', ['cum', 'conscientia', 'peccatorum', 'in', 'animis', 'vestris', 'vobis', 'sentire', 'videantur.'], 'When the consciousness of your sins seems to work in your hearts?'),
    sent('Cic-Cat-3-9', ['adeste', 'igitur', 'mihi', 'et', 'populo', 'vestro', 'et', 'animabus', 'maiorum', 'vestrorum.'], 'Stand with me, then, and with your people and the spirits of your ancestors.'),
    sent('Cic-Cat-3-10', ['omnia', 'templa', 'deorum', 'civium', 'meorum', 'ad', 'summum', 'iudicium', 'referebat', 'pene.'], 'All the temples of the gods and the citizens had brought matters nearly to the final judgment.'),
    sent('Cic-Cat-3-11', ['hostem', 'qui', 'vivit', 'neque', 'est', 'aliquis', 'qui', 'non', 'viderit.'], 'The enemy who lives—there is no one who has not seen it.'),
    sent('Cic-Cat-3-12', ['et', 'tamen', 'deliberamus', 'adhuc', 'de', 'poena', 'eius', 'qui', 'hostem', 'se', 'praefert.'], 'Yet we still deliberate about the punishment of one who reveals himself as an enemy.'),
  ],
};

export const CICERO_CATILINA_4: TextSection = {
  id: "Cic-Cat-4",
  textId: "Cic-Catilina-1",
  sequence: 4,
  label: "In Catilinam 1.21–33 — The Final Warning",
  sentences: [
    sent('Cic-Cat-4-1', ['o patria,', 'patria!', 'o Roma,', 'o domicilium',], 'O fatherland! O Rome, O dwelling place'),
    sent('Cic-Cat-4-2', ['vides', 'haec', 'dum', 'te', 'quaerunt', 'omnium', 'hominum', 'furorem.'], 'Do you see these things while all men seek your madness?'),
    sent('Cic-Cat-4-3', ['civium', 'interitus', 'dum', 'non', 'dubitam', 'tam', 'cruentam', 'coniurationem.'], 'The destruction of citizens while I do not hesitate before such a bloody conspiracy.'),
    sent('Cic-Cat-4-4', ['deorum', 'templa,', 'civium', 'domos', 'flammam', 'esse', 'putabam', 'imminentem.'], 'The temples of gods, the homes of citizens—I thought destruction was imminent.'),
    sent('Cic-Cat-4-5', ['sed', 'mehercule', 'audacia', 'vel', 'dementia', 'vel', 'utriusque', 'est', 'in', 'coniuratos.'], 'But by Hercules, it is audacity, madness, or both that is in the conspirators.'),
    sent('Cic-Cat-4-6', ['quod', 'nisi', 'haec', 'civitas', 'defendissem', 'semper', 'iam', 'viribus', 'et', 'consilio.'], 'Unless this state, which I have always defended with force and counsel,'),
    sent('Cic-Cat-4-7', ['ut', 'decuit', 'defensorem', 'rei', 'publicae.'], 'as was fitting for a defender of the republic.'),
    sent('Cic-Cat-4-8', ['itaque', 'abeundum', 'est', 'Catilina', 'ex', 'urbe', 'vel', 'morte', 'solvendum.'], 'Therefore Catiline must depart from the city or be released by death.'),
    sent('Cic-Cat-4-9', ['dum', 'vivis', 'constitutum', 'mihi', 'est', 'animam', 'tuam', 'carcerem', 'habere.'], 'While you live, I am resolved that your soul shall have the prison.'),
    sent('Cic-Cat-4-10', ['nec', 'haec', 'civitas', 'tibi', 'locus', 'potest', 'esse', 'umquam.'], 'Nor can this city ever be a place for you.'),
    sent('Cic-Cat-4-11', ['animum', 'induere', 'debes', 'etiam', 'si', 'corpus', 'teneas', 'in', 'urbe.'], 'You must cast off that spirit even if you keep your body in the city.'),
    sent('Cic-Cat-4-12', ['nihil', 'agis', 'nihil', 'molaris', 'nihil', 'cogitas', 'quod', 'non', 'audiamus.'], 'You do nothing, you plan nothing, you think nothing that we do not hear.'),
  ],
};
