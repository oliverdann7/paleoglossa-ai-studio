/**
 * Plato — Apology (Ἀπολογία Σωκράτους)
 * Ancient Greek text: Project Gutenberg — freely distributable.
 * English translation: Public domain translation by Benjamin Jowett.
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

export const PLATO_APOLOGY_1: TextSection = {
  id: "Plato-Apol-1",
  textId: "Plato-Apology-1",
  sequence: 1,
  label: "Apology",
  sentences: [
    sent('Plato-1-1', ['Ὅπως', 'μὲν', 'ὑμᾶς', 'ἔσχον', 'οἱ', 'ἐμοὶ', 'κατήγοροι,', 'ὦ', 'ἄνδρες', 'Ἀθηναῖοι,', 'οὐκ', 'οἶδα·'], 'How you have been affected by my accusers, O men of Athens, I do not know;'),
    sent('Plato-1-2', ['ἐγὼ', 'δὲ', 'καὶ', 'αὐτὸς', 'ὑπὸ', 'αὐτῶν', 'ὀλίγου', 'ἐπελαθόμην', 'τῆς', 'ἀπάτης'], 'but I myself was almost made to forget who I was by their persuasive words,'),
    sent('Plato-1-3', ['οὕτω', 'πιθανῶς', 'ἐλάλησαν.', 'καίτοι', 'ἀληθές', 'γε', 'αὐτοῖς', 'εἰρημένον', 'οὐδὲν'], 'so persuasively did they speak. And yet they have said nothing true.'),
    sent('Plato-1-4', ['ἐγὼ', 'δὲ', 'ὑμᾶς', 'δέομαι', 'ἀκοῦσαί', 'μου', 'ἀληθῆ', 'λέγοντος.'], 'But I beg you to hear me speak the truth.'),
    sent('Plato-1-5', ['οἱ', 'μὲν', 'γὰρ', 'ἐμοὶ', 'κατήγοροι', 'λόγοις', 'καλλίστοις', 'κέχρηνται', 'οὐδὲν', 'δὲ', 'ἀληθὲς', 'εἰρήκασιν.'], 'For my accusers have used very beautiful words, but have said nothing true.'),
    sent('Plato-1-6', ['ἐμὲ', 'δὲ', 'χρὴ', 'λέγειν', 'περὶ', 'πάντων', 'τῶν', 'ἔργων', 'καὶ', 'περὶ', 'τῆς', 'ζωῆς', 'ἧς', 'ἐβίων.'], 'But I must speak concerning all my deeds and the life that I have lived.'),
  ],
};
