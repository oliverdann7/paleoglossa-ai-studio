import type { TextSection, Sentence } from '../../types/corpus.js';

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
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

export const GRC_HERODOTUS_1_2: TextSection = {
  id: 'Hdt-1-2',
  textId: 'Hdt',
  sequence: 2,
  label: 'Histories I.2–4 — The Abduction of Io',
  sentences: [
    sent('Hdt-1-2-1', ['ταῦτα', 'μὲν', 'δὴ', 'Πέρσαι', 'τε', 'καὶ', 'Φοίνικες', 'λέγουσι.', 'ἐγὼ', 'δὲ', 'περὶ', 'μὲν', 'τούτων', 'οὐκ', 'ἔρχομαι', 'ἐρέων', 'ὡς', 'οὕτως', 'ἢ', 'ἄλλως', 'κως', 'ταῦτα', 'ἐγένετο,'], 'So much the Persians and Phoenicians say. I, however, am not going to say about these things that they happened thus or otherwise.'),
    sent('Hdt-1-2-2', ['τὸν', 'δὲ', 'οἶδα', 'αὐτὸς', 'πρῶτον', 'ὑπάρξαντα', 'ἀδίκων', 'ἔργων', 'ἐς', 'τοὺς', 'Ἕλληνας,', 'τοῦτον', 'σημήνας', 'προβήσομαι', 'ἐς', 'τὸ', 'προσω', 'τοῦ', 'λόγου,', 'ὁμοίως', 'σμικρὰ', 'καὶ', 'μεγάλα', 'ἄστεα', 'ἀνθρώπων', 'ἐπεξιών.'], 'But I will point out the one I myself know first began unjust acts against the Greeks, then I will proceed further in the account, going through small and great cities alike.'),
    sent('Hdt-1-2-3', ['τὰ', 'γὰρ', 'τὸ', 'πάλαι', 'μεγάλα', 'ἦν,', 'τὰ', 'πολλὰ', 'αὐτῶν', 'σμικρὰ', 'γέγονε·', 'τὰ', 'δὲ', 'ἐπʼ', 'ἐμεῦ', 'ἦν', 'μεγάλα,', 'τὸ', 'πρότερον', 'ἦν', 'σμικρά.', 'τὴν', 'ἀνθρωπηίην', 'ὦν', 'εὐδαιμονίην', 'οὐδαμὰ', 'ἐν', 'τῶν̣τῷ', 'μένουσαν', 'ἐπιγνούς,', 'μνήμην', 'ἀμφοτέρων', 'ὁμοίως', 'ποιήσομαι.'], 'For the cities that were great in the past have for the most part become small, and those that are great in my time were formerly small. So, recognizing that human prosperity never remains constant, I will make mention of both alike.'),
  ],
};

export const GRC_THUCYDIDES_1_2: TextSection = {
  id: 'Thuc-1-2',
  textId: 'Thuc',
  sequence: 2,
  label: 'Peloponnesian War I.2–3 — Early Greece',
  sentences: [
    sent('Thuc-1-2-1', ['φαίνεται', 'γὰρ', 'ἡ', 'νῦν', 'Ἑλλὰς', 'καλουμένη', 'οὐ', 'πάλαι', 'βεβαίως', 'ᾠκημένη,', 'ἀλλὰ', 'μεταναστάσεις', 'τε', 'οὖσαι', 'τὰ', 'πρότερα,', 'καὶ', 'ῥᾳδίως', 'ἕκαστοι', 'τὴν', 'ἑαυτῶν', 'γῆν', 'ἀφιέντες', 'βιαζόμενοι', 'ὑπό', 'τινων', 'ἀεί', 'πλειόνων.'], 'For it is evident that the country now called Greece was not in ancient times firmly settled, but migrations took place readily, each people abandoning their land under pressure from some greater number.'),
    sent('Thuc-1-2-2', ['τῆς', 'γὰρ', 'ἐμπορίας', 'οὐκ', 'οὔσης,', 'οὐδὲ', 'ἐπιμειγνύντες', 'ἀδεῶς', 'ἀλλήλοις', 'οὔτε', 'κατὰ', 'γῆν', 'οὔτε', 'διὰ', 'θαλάσσης,', 'νέμοντές', 'τε', 'καθ\'', 'αὑτοὺς', 'ἕκαστοι', 'τὴν', 'αὑτῶν', 'ὅσον', 'ἀποζῆν', 'καὶ', 'περιουσίαν', 'χρημάτων', 'οὐκ', 'ἔχοντες,', 'οὐδὲ', 'γῆν', 'φυτεύοντες,', 'ἄδηλον', 'ὂν', 'ὁπότε', 'τις', 'ἐπελθὼν', 'καὶ', 'ἄλλοις', 'ἀτειχίστων', 'ἅμα', 'ἐόντων', 'ἐφαρπάσειε,', 'τῆς', 'τε', 'καθ\'', 'ἡμέραν', 'ἀναγκαίας', 'τροφῆς', 'πανταχοῦ', 'ἂν', 'ἡγούμενοι', 'ἐπικρατεῖν,', 'οὐ', 'χαλεπῶς', 'ἀπανίσταντο.'], 'For commerce did not exist, and there was no safe communication by land or sea. Each people cultivated their own land only enough to live on, not having any surplus of wealth nor planting the land, since it was uncertain when some invader might come and seize it—especially as they had no walls. And since they thought they could obtain daily sustenance anywhere, they readily migrated.'),
  ],
};

export const GRC_SOPHOCLES_ANT_2: TextSection = {
  id: 'Soph-Ant-2',
  textId: 'Soph-Ant',
  sequence: 2,
  label: 'Antigone 1–10 — The Burial Decree',
  sentences: [
    sent('Soph-Ant-2-1', ['ὦ', 'κοινὸν', 'αὐτάδελφον', 'Ἰσμήνης', 'κάρα,', 'ἆρʼ', 'οἶσθʼ', 'ὅ', 'Ζεὺς', 'τῶν', 'ἀπʼ', 'Οἰδίπου', 'κακῶν', 'ὁποῖον', 'οὐχὶ', 'νῷν', 'ἔτι', 'ζώσαιν', 'τελεῖ;'], 'O my own sister Ismene, do you know what evil of those from Oedipus Zeus will not accomplish for us two while we still live?'),
    sent('Soph-Ant-2-2', ['οὐδὲν', 'γὰρ', 'οὔτʼ', 'ἀλγεινὸν', 'οὔτʼ', 'ἄτης', 'ἄτερ', 'οὔτʼ', 'αἰσχρὸν', 'οὔτʼ', 'ἄτιμόν', 'ἐσθʼ,', 'ὁποῖον', 'οὐ', 'τῶν', 'σῶν', 'τε', 'κἀμῶν', 'οὐκ', 'ὄπωπʼ', 'ἐγὼ', 'κακῶν.'], 'For there is nothing painful or free from ruin, nothing shameful or dishonored, among your and my evils that I have not seen.'),
    sent('Soph-Ant-2-3', ['καὶ', 'νῦν', 'τί', 'τοῦτʼ', 'αὖ', 'φασι', 'πανδήμῳ', 'πόλει', 'κήρυγμα', 'θεῖναι', 'τὸν', 'στρατηγὸν', 'ἀρτίως;'], 'And now what is this proclamation they say the general has just made to the whole city?'),
  ],
};

export const ALL_GREEK_CLASSICS_EXTENDED_SECTIONS: TextSection[] = [
  GRC_HERODOTUS_1_2,
  GRC_THUCYDIDES_1_2,
  GRC_SOPHOCLES_ANT_2,
];
