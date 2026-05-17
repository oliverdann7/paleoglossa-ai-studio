/**
 * Cicero — In Catilinam (Oration 1)
 * Latin text: Project Gutenberg — freely distributable.
 * English translation: World English Bible-style public domain translation.
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

export const CICERO_CATILINA_1: TextSection = {
  id: "Cic-Cat-1",
  textId: "Cic-Catilina-1",
  sequence: 1,
  label: "In Catilinam 1",
  sentences: [
    sent('Cic-Cat-1-1', ['O', 'tempora,', 'o', 'mores!', 'Senatui', 'est', 'nota', 'haec', 'maleficorum', 'audacia,'], 'O the times! O the customs! This shamelessness of evildoers is known to the Senate,'),
    sent('Cic-Cat-1-2', ['Catilinam', 'autem', 'sic', 'acerbis', 'odiis', 'omnes', 'mortales', 'insequuntur', 'ut', 'nulla', 'umquam', 'lucebat', 'huic', 'rei', 'publicae', 'pestis', 'maior'], 'but all mortals pursue Catiline with such bitter hatred that no greater plague has ever shone upon this republic,'),
    sent('Cic-Cat-1-3', ['Venit', 'enim', 'in', 'mentem', 'mihi', 'interdum', 'ipsorum', 'etiam', 'illorum', 'qui', 'hoc', 'malum', 'fecerunt', 'misericordia'], 'For I am sometimes moved to compassion even for those very men who have perpetrated this evil,'),
    sent('Cic-Cat-1-4', ['dum', 'cogito', 'in', 'tantam', 'multo', 'ante', 'fortuna', 'vel', 'improbe', 'vel', 'iniquitatem', 'venisse', 'aliquem'], 'when I consider how fortune long before brought someone into such great, whether by force or injustice,'),
    sent('Cic-Cat-1-5', ['Quo', 'usque', 'tandem', 'abutere,', 'Catilina,', 'patientia', 'nostra?', 'quam', 'diu', 'etiam', 'te', 'furor', 'iste', 'tuus', 'eludet?'], 'How long, then, Catiline, will you abuse our patience? How long will this madness of yours elude us?'),
    sent('Cic-Cat-1-6', ['quem', 'ad', 'finem', 'sese', 'effrenata', 'iactabit', 'audacia?'], 'To what end will your reckless audacity flaunt itself?'),
    sent('Cic-Cat-1-7', ['Nihilne', 'te', 'nocturna', 'praesidia', 'palatii,', 'nihil', 'urbis', 'vigiliae,', 'nihil', 'timor', 'populi,', 'nihil', 'consensus', 'bonorum', 'omnium', 'mover', 'nihil', 'hic', 'munissimus', 'locus', 'senatus,', 'nihil', 'eorum', 'ora', 'et', 'vultus', 'deterret?'], 'Does nothing move you—neither the night watch at the palace, nor the vigils of the city, nor the fear of the people, nor the consensus of all the good, nor this well-fortified place of the Senate, nor the expressions and faces of these senators?'),
  ],
};
