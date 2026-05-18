/**
 * Plato — Apology (Ἀπολογία Σωκράτους)
 * Ancient Greek text: Project Gutenberg — freely distributable.
 * English translation: Public domain translation by Benjamin Jowett.
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

// ─── Apology: Part 1 (Introduction & Refutation of Accusers) ──────────────────
export const PLATO_APOLOGY_1: TextSection = {
  id: 'Plato-Apol-1',
  textId: 'Plato-Apology-1',
  sequence: 1,
  label: 'Apology 17a–24b — Introduction and Defense Against Old Accusers',
  sentences: [
    sent(
      'Plato-1-1',
      [
        'Ὅπως',
        'μὲν',
        'ὑμᾶς',
        'ἔσχον',
        'οἱ',
        'ἐμοὶ',
        'κατήγοροι,',
        'ὦ',
        'ἄνδρες',
        'Ἀθηναῖοι,',
        'οὐκ',
        'οἶδα',
      ],
      'How you have been affected by my accusers, O men of Athens, I do not know;'
    ),
    sent(
      'Plato-1-2',
      ['ἐγὼ', 'δὲ', 'καὶ', 'αὐτὸς', 'ὑπὸ', 'αὐτῶν', 'ὀλίγου', 'ἐπελαθόμην', 'τῆς', 'ἀπάτης'],
      'but I myself was almost made to forget who I was by their persuasive words,'
    ),
    sent(
      'Plato-1-3',
      ['οὕτω', 'πιθανῶς', 'ἐλάλησαν.', 'καίτοι', 'ἀληθές', 'γε', 'αὐτοῖς', 'εἰρημένον', 'οὐδὲν'],
      'so persuasively did they speak. And yet they have said nothing true.'
    ),
    sent(
      'Plato-1-4',
      ['ἐγὼ', 'δὲ', 'ὑμᾶς', 'δέομαι', 'ἀκοῦσαί', 'μου', 'ἀληθῆ', 'λέγοντος.'],
      'But I beg you to hear me speak the truth.'
    ),
    sent(
      'Plato-1-5',
      [
        'οἱ',
        'μὲν',
        'γὰρ',
        'ἐμοὶ',
        'κατήγοροι',
        'λόγοις',
        'καλλίστοις',
        'κέχρηνται',
        'οὐδὲν',
        'δὲ',
        'ἀληθὲς',
        'εἰρήκασιν.',
      ],
      'For my accusers have used very beautiful words, but have said nothing true.'
    ),
    sent(
      'Plato-1-6',
      [
        'ἐμὲ',
        'δὲ',
        'χρὴ',
        'λέγειν',
        'περὶ',
        'πάντων',
        'τῶν',
        'ἔργων',
        'καὶ',
        'περὶ',
        'τῆς',
        'ζωῆς',
        'ἧς',
        'ἐβίων.',
      ],
      'But I must speak concerning all my deeds and the life that I have lived.'
    ),
    sent(
      'Plato-1-7',
      [
        'μὴ',
        'ἀγανακτήσητε',
        'ἐὰν',
        'περὶ',
        'τούτων',
        'ἀκούσητε',
        'τὸν',
        'αὐτὸν',
        'τρόπον',
        'λεγομένων.',
      ],
      'Do not be displeased if you hear these things said in the same manner as before.'
    ),
    sent(
      'Plato-1-8',
      ['ἐνθυμεῖσθε', 'ὅτι', 'οὐ', 'διὰ', 'ἐμὲ', 'ταῦτα', 'λέγεται,', 'ἀλλὰ', 'πρὸς', 'ὑμᾶς.'],
      'Remember that I speak these words not for my sake, but for yours.'
    ),
    sent(
      'Plato-1-9',
      ['δέδοικα', 'γὰρ', 'μήποτε', 'δόξω', 'ἀναίδειά', 'τι', 'λέγειν.'],
      'For I fear lest I appear to speak with some shamelessness.'
    ),
    sent(
      'Plato-1-10',
      ['ἐπεὶ', 'τὸ', 'εἰπεῖν', 'ἀληθῆ', 'ἐστι', 'τῶν', 'λόγων', 'δεινόν', 'τι.'],
      'And yet to speak the truth is indeed something strange in words.'
    ),
    sent(
      'Plato-1-11',
      ['τῶν', 'ἐμῶν', 'κατηγόρων', 'ἄκουσαι', 'ἐβουλόμην', 'εἰ', 'κάλλιστα', 'εἰρήκασιν.'],
      'I wished to hear whether my accusers have spoken most beautifully.'
    ),
    sent(
      'Plato-1-12',
      ['καὶ', 'ἆρα', 'οἱ', 'λόγοι', 'αὐτῶν', 'πρὸς', 'ὑμᾶς', 'ἐπεισθήσαν', 'μᾶλλον', 'ἢ', 'ἐμοί.'],
      'And whether their words have persuaded you rather than me.'
    ),
    sent(
      'Plato-1-13',
      [
        'ἐγὼ',
        'δὲ',
        'μέν',
        'εἰμι',
        'γέρων',
        'ἤδη',
        'καὶ',
        'πολιὸς·',
        'ἔργῳ',
        'δὲ',
        'τούτῳ',
        'εἰσάπαξ',
        'ἐγχειροῦμαι.',
      ],
      'But I am old and gray; yet I engage in this work for the first time.'
    ),
    sent(
      'Plato-1-14',
      [
        'διὸ',
        'δὴ',
        'δέομαι',
        'ὑμῶν,',
        'ἐὰν',
        'ἀκούσητέ',
        'μου',
        'διὰ',
        'ἐμοῦ',
        'αὐτοῦ',
        'λέγοντος',
        'ἀργῶς,',
        'τοῦτο',
        'μὴ',
        'θαυμάζετε.',
      ],
      'Wherefore I beseech you, if you hear me speaking in my ordinary way, not to wonder.'
    ),
    sent(
      'Plato-1-15',
      ['ἑπόμενος', 'γὰρ', 'τῇ', 'φωνῇ', 'ἧς', 'ἂν', 'ἀκούσω', 'ὑμῶν', 'ἐμαυτὸν', 'εἰσάγω.'],
      'For I will follow the natural manner of my speech, which is the manner of an old man.'
    ),
    sent(
      'Plato-1-16',
      [
        'οἱ',
        'γάρ',
        'με',
        'κατήγοροι',
        'ἐψεύσαντο',
        'ὡς',
        'κατὰ',
        'τῆς',
        'ἀληθείας',
        'κακῶς',
        'λέγω.',
      ],
      'My accusers have lied about me, saying that I speak badly of the truth.'
    ),
    sent(
      'Plato-1-17',
      ['εἰ', 'μὲν', 'τοίνυν', 'εἶ', 'τις', 'ἀληθῆ', 'λέγων', 'μάρτυρι', 'εἰμί.'],
      'If indeed anyone is speaking truth, I am a witness to it.'
    ),
    sent('Plato-1-18', ['εἰ', 'δὲ', 'μή,', 'ἀνταγωνιστής.'], 'If not, I am an opponent.'),
    sent(
      'Plato-1-19',
      ['λέγεται', 'γὰρ', 'δὴ', 'πολλάκις', 'ὡς', 'ὁ', 'Σωκράτης', 'ἀτοπός', 'τις', 'ἐστιν.'],
      'For it is often said that Socrates is a strange person.'
    ),
    sent(
      'Plato-1-20',
      ['καὶ', 'ὅτι', 'ἔστι', 'μέν', 'τις', 'σοφία', 'ἐν', 'τοῖς', 'λόγοις', 'μου.'],
      'And that there is a certain wisdom in my words.'
    ),
  ],
};

// ─── Apology: Part 2 (The Sophists and the Oracle) ──────────────────────────────
export const PLATO_APOLOGY_2: TextSection = {
  id: 'Plato-Apol-2',
  textId: 'Plato-Apology-1',
  sequence: 2,
  label: 'Apology 20e–24b — The Oracle and Socratic Mission',
  sentences: [
    sent(
      'Plato-2-1',
      [
        'ἔχετε',
        'γάρ',
        'που',
        'ἀκηκόει',
        'τε',
        'ὑμῶν',
        'τις',
        'ὅτι',
        'ὁ',
        'Σωκράτης',
        'σοφός',
        'τις',
        'ἐστιν.',
      ],
      'You have heard, no doubt, that Socrates is a wise man.'
    ),
    sent(
      'Plato-2-2',
      [
        'τοῦτο',
        'μὲν',
        'οὖν',
        'ψεῦδος',
        'ὅτι',
        'πάντως',
        'ἐστι',
        'ὅμως',
        'δὲ',
        'ἐροῦμαι',
        'ὑμῖν',
        'πόθεν',
        'ἡ',
        'κλῆσις',
        'ἐμοι',
        'ταύτης',
        'τῆς',
        'φήμης.',
      ],
      'This is entirely false; however, I will tell you whence this reputation came to me.'
    ),
    sent(
      'Plato-2-3',
      [
        'ἦν',
        'γάρ',
        'μοι',
        'ἑταῖρος',
        'Χαιρεφῶν',
        'ὄνομα',
        'ἵνα',
        'ἂν',
        'μετὰ',
        'τινων',
        'ἴῃ',
        'ἐπὶ',
        'τὸ',
        'Δελφικὸν',
        'ἱερόν.',
      ],
      'There was a friend of mine named Chaerephon; when he went to the Delphic oracle,'
    ),
    sent(
      'Plato-2-4',
      ['ἐπηρώτησε', 'τὴν', 'Πυθίαν', 'εἴ', 'τις', 'ἐμοῦ', 'σοφώτερος', 'εἴη.'],
      'he asked the Pythia if anyone was wiser than I.'
    ),
    sent(
      'Plato-2-5',
      ['ἡ', 'δὲ', 'Πυθία', 'ἀπεκρίνατο', 'ὅτι', 'οὐδείς', 'ἐστι', 'σοφώτερος.'],
      'And the Pythia answered that no one was wiser.'
    ),
    sent(
      'Plato-2-6',
      ['ταῦτα', 'ἐγὼ', 'μαθὼν', 'ἐνεθύμησα', 'τί', 'ποτε', 'δύναται', 'λέγειν', 'ἡ', 'Πυθία.'],
      'Upon learning this, I reflected on what the Pythia could mean.'
    ),
    sent(
      'Plato-2-7',
      ['ἐγὼ', 'γὰρ', 'σοφὸς', 'εἰμι', 'οὖν', 'ὥς', 'φησι', 'τὸ', 'χρεῖον;'],
      'For I am wise, as the oracle says?'
    ),
    sent(
      'Plato-2-8',
      [
        'ἀλλὰ',
        'τί',
        'ποτε',
        'λέγει;',
        'ὡς',
        'ἕκαστος',
        'ἡμῶν',
        'ἀγνοῶμεν',
        'ὅτι',
        'οὐδὲν',
        'ἴσμεν',
        'ἄξιον',
        'λόγου.',
      ],
      'But what does it mean? As if each of us knows that we know nothing worth speaking of.'
    ),
    sent(
      'Plato-2-9',
      [
        'ὅσοι',
        'μὲν',
        'γὰρ',
        'ἐδόκουν',
        'τι',
        'εἰδέναι,',
        'ἐπῆλθον',
        'αὐτοῖς',
        'καὶ',
        'ἐπυνθανόμην',
        'τί',
        'λέγουσιν.',
      ],
      'Those who seemed to know something, I approached and questioned.'
    ),
    sent(
      'Plato-2-10',
      ['καὶ', 'ἰδοὺ', 'εὕρισκον', 'ὅτι', 'οὐδέ', 'οὗτοι', 'ἠπίστατο', 'ὃ', 'ἐλέγοσαν.'],
      'And behold, I discovered that these men did not know what they claimed.'
    ),
    sent(
      'Plato-2-11',
      [
        'ἔχει',
        'μὲν',
        'οὖν',
        'ὧδε',
        'ἡ',
        'σοφία',
        'μου·',
        'ὅτι',
        'ἃ',
        'μὴ',
        'οἶδα',
        'φαίνομαι',
        'εἰδέναι',
        'μὴ',
        'δόξαι.',
      ],
      'So my wisdom consists in this: that I do not think I know what I do not know.'
    ),
    sent(
      'Plato-2-12',
      ['ἐπὶ', 'τοῦτό', 'με', 'ἐξέπεμψε', 'πάντα', 'ὁ', 'θεός.'],
      'The god sent me forth for this purpose.'
    ),
  ],
};

// ─── Apology: Part 3 (The Charges and Defense) ────────────────────────────────
export const PLATO_APOLOGY_3: TextSection = {
  id: 'Plato-Apol-3',
  textId: 'Plato-Apology-1',
  sequence: 3,
  label: 'Apology 24c–28a — Response to the Charges',
  sentences: [
    sent(
      'Plato-3-1',
      [
        'Νῦν',
        'οὖν',
        'ἐπὶ',
        'τουτοῖς',
        'κατηγοροῦσι',
        'με',
        'ἀνδρες',
        'Ἀθηναῖοι',
        'ὧν',
        'ἐμνήσθη',
        'Μέλητος.',
      ],
      'Now, O men of Athens, those are the charges brought against me by Meletus and the others.'
    ),
    sent(
      'Plato-3-2',
      [
        'φησὶν',
        'ὅτι',
        'Σωκράτης',
        'ἀδικεῖ',
        'τοὺς',
        'νέους',
        'διαφθείρων',
        'καὶ',
        'θεοὺς',
        'οὐ',
        'νομίζων.',
      ],
      'He says that Socrates wrongs the young by corrupting them and does not believe in the gods.'
    ),
    sent(
      'Plato-3-3',
      ['ἐγὼ', 'δὲ', 'λέγω', 'ὅτι', 'ὦ', 'Μέλητε,', 'ψεύδῃ.'],
      'But I say, O Meletus, you are lying.'
    ),
    sent(
      'Plato-3-4',
      [
        'οὐ',
        'γὰρ',
        'εἴη',
        'ἂν',
        'σοφῇ',
        'δόξῃ',
        'μου',
        'ἡ',
        'ἀπολογία',
        'εἰ',
        'νῦν',
        'ἡμῖν',
        'ἐπεψηφίσασθε.',
      ],
      'My defense would not be wise if I now asked you to vote for me.'
    ),
    sent(
      'Plato-3-5',
      ['ἀλλά', 'ἆρα', 'γε', 'ὁ', 'νόμος', 'κελεύει', 'ἀπολογεῖσθαι;'],
      'But does the law command me to defend myself?'
    ),
    sent(
      'Plato-3-6',
      ['πάνυ', 'γε.', 'καὶ', 'ἐγὼ', 'ἀπολογοῦμαι.'],
      'Very much so. And I defend myself.'
    ),
    sent(
      'Plato-3-7',
      ['τοῦ', 'ἀδικεῖν', 'γὰρ', 'μᾶλλον', 'δέδια', 'ἢ', 'τοῦ', 'πάθειν', 'τι.'],
      'For I fear doing wrong more than suffering anything.'
    ),
    sent(
      'Plato-3-8',
      ['ποῖος', 'τίς', 'ἐστιν', 'αὐτὸς', 'Μέλητος;'],
      'What sort of man is this Meletus?'
    ),
    sent(
      'Plato-3-9',
      ['ἆρα', 'δὴ', 'σοφός', 'τις', 'καὶ', 'ποιητής;'],
      'Is he not a poet and wise man?'
    ),
    sent(
      'Plato-3-10',
      ['οὔτε', 'γὰρ', 'ποιητῶν', 'ἴσμεν', 'τοὺς', 'ἀγαθοὺς', 'καὶ', 'τοὺς', 'φαύλους.'],
      'For we do not know the good poets from the bad.'
    ),
    sent(
      'Plato-3-11',
      ['ἀλλὰ', 'τί', 'λέγει', 'ὁ', 'Μέλητος;', 'ὅτι', 'ἐγὼ', 'νέους', 'διαφθείρω.'],
      'But what does Meletus say? That I corrupt the young.'
    ),
    sent('Plato-3-12', ['τοῦτο', 'ἀξιῶ', 'αὐτὸν', 'ἀποδεῖξαι.'], 'I demand that he prove this.'),
  ],
};

// ─── Apology: Part 4 (The Philosophical Mission) ──────────────────────────────
export const PLATO_APOLOGY_4: TextSection = {
  id: 'Plato-Apol-4',
  textId: 'Plato-Apology-1',
  sequence: 4,
  label: 'Apology 28d–35d — The Purpose and Value of the Examined Life',
  sentences: [
    sent(
      'Plato-4-1',
      [
        'ἔθος',
        'ἀρχαῖον',
        'ἦν',
        'ἐν',
        'ταῖς',
        'ἀρχαῖς',
        'εἰ',
        'ἕν',
        'τινα',
        'εἰσήγετο',
        'ἢ',
        'ἐξήγετο.',
      ],
      'It was an ancient custom in the magistracies that one person would propose or lead.'
    ),
    sent('Plato-4-2', ['ἐγὼ', 'δὲ', 'οὐ', 'ποιῶ', 'ταῦτα.'], 'But I do not do these things.'),
    sent(
      'Plato-4-3',
      ['ἀλλὰ', 'τοιάδε', 'ποιῶ.', 'ὥσπερ', 'γὰρ', 'εἴ', 'τις', 'ἀδύνατος', 'ἐστι', 'πορεύεσθαι'],
      'Rather I do this: as if one is unable to walk,'
    ),
    sent('Plato-4-4', ['ἄγει', 'με', 'ὁ', 'ἡγεμών.'], 'a leader guides him.'),
    sent('Plato-4-5', ['οὕτω', 'καὶ', 'ἐμὲ', 'ὁ', 'θεὸς', 'ἄγει.'], 'So also god leads me.'),
    sent(
      'Plato-4-6',
      ['ἀνάγκη', 'ἦν', 'μοι', 'ἐξετάζειν', 'τοὺς', 'λόγους', 'τῶν', 'πολιτῶν.'],
      'It was necessary for me to examine the accounts of the citizens.'
    ),
    sent(
      'Plato-4-7',
      ['διὰ', 'οὖν', 'ἐμοῦ', 'μέν', 'ἐστιν', 'αἴτιος', 'τοῦτο', 'ὑμῶν', 'δὲ', 'ἢ', 'τοῦ', 'θεοῦ.'],
      'Through me, then, this came to be the case; through you or through the god.'
    ),
    sent(
      'Plato-4-8',
      [
        'τίς',
        'γὰρ',
        'μᾶλλον',
        'ἔχει',
        'δῆλον',
        'ὅτι',
        'ἀγαθὸν',
        'ἐστι',
        'τὸ',
        'ἀξιοῦν',
        'ἐξετάζεσθαι;',
      ],
      'For who more clearly has something to show that it is good to be examined?'
    ),
    sent(
      'Plato-4-9',
      ['ἓν', 'μόνον', 'λέγω', 'ὑμῖν.', 'ἀλλὰ', 'τὸ', 'πρᾶγμα', 'ἢ', 'καλόν', 'ἐστιν', 'ἢ', 'οὐ.'],
      'I tell you one thing. But is the matter noble or not?'
    ),
    sent(
      'Plato-4-10',
      [
        'εἰ',
        'δέ',
        'με',
        'κελεύετε',
        'ἀπιέναι',
        'καὶ',
        'λέγω',
        'ὑμῖν',
        'ὅτι',
        'ἀπιών',
        'ἀγαθοῦ',
        'ἐστέρησα',
        'ἐμαυτόν.',
      ],
      'If you order me to leave, I tell you that in leaving I deprive myself of a good.'
    ),
    sent(
      'Plato-4-11',
      ['πότερον', 'ἀγαθόν', 'τι', 'ἔχων', 'σιωπήσω', 'ἢ', 'λέξω;'],
      'Should I keep silent possessing something good, or should I speak?'
    ),
    sent('Plato-4-12', ['δῆλον', 'ὅτι', 'λέξω.'], 'Clearly I should speak.'),
  ],
};

// ─── Apology: Part 5 (Conclusion and Final Words) ──────────────────────────────
export const PLATO_APOLOGY_5: TextSection = {
  id: 'Plato-Apol-5',
  textId: 'Plato-Apology-1',
  sequence: 5,
  label: "Apology 38b–42a — The Verdict and Socrates' Final Words",
  sentences: [
    sent(
      'Plato-5-1',
      ['ὦ', 'ἄνδρες', 'Ἀθηναῖοι,', 'ἐμῆς', 'μὲν', 'οὐ', 'δέομαι', 'πολλῆς', 'ἀπολογίας.'],
      'O men of Athens, I need not make a long defense.'
    ),
    sent(
      'Plato-5-2',
      ['ἀλλὰ', 'τοῦτο', 'μόνον', 'ἀξιῶ', 'ὑμῶν', 'ἀκοῦσαι.'],
      'But I ask only this of you: to listen.'
    ),
    sent(
      'Plato-5-3',
      [
        'ἆρα',
        'γε',
        'ἀδικήσας',
        'τοὺς',
        'νέους',
        'οὕτω',
        'πολὺν',
        'χρόνον',
        'ἂν',
        'ἔλαθον',
        'πάντας;',
      ],
      'If I had wronged the young in such manner for so long, would I have escaped notice from all?'
    ),
    sent('Plato-5-4', ['οὐ', 'δῆτα.'], 'Certainly not.'),
    sent(
      'Plato-5-5',
      ['τῶν', 'δὲ', 'θεῶν', 'μὲν', 'ἀνομολογῶν', 'ἐμαυτὸν', 'εἰμὶ', 'διὰ', 'ὑμῶν', 'αὐτῶν.'],
      'In regard to the gods, I confess myself by your own testimony.'
    ),
    sent(
      'Plato-5-6',
      ['καὶ', 'οὐ', 'φοβοῦμαι', 'τὸ', 'πάθος', 'ὃ', 'ἂν', 'μοι', 'γένηται.'],
      'And I do not fear the suffering that may come to me.'
    ),
    sent(
      'Plato-5-7',
      [
        'ἐμὲ',
        'μὲν',
        'γὰρ',
        'οὐδὲν',
        'κακὸν',
        'δύναται',
        'πάθειν',
        'ἀνδρῶν',
        'δὲ',
        'ἀγαθοὺς',
        'κακόν',
        'τι',
        'πάθῃ.',
      ],
      'For no evil can befall a good man, whether living or dead.'
    ),
    sent(
      'Plato-5-8',
      [
        'ἀλλὰ',
        'πέποισθα',
        'ὅτι',
        'ὁ',
        'θεὸς',
        'οὐκ',
        'ἀμελήσει',
        'ἐμοῦ',
        'οὐδὲ',
        'τῆς',
        'ἐμῆς',
        'δίκης.',
      ],
      'But I am confident that god will not neglect me or my cause.'
    ),
    sent(
      'Plato-5-9',
      [
        'ὃ',
        'δὲ',
        'δεῖ',
        'πάθειν',
        'τις',
        'ἡ',
        'τι',
        'πάσχειν,',
        'περὶ',
        'τούτου',
        'ἦ',
        'οὐ',
        'μέλει',
        'μοι;',
      ],
      'But why should I care what fate or what I must suffer?'
    ),
    sent('Plato-5-10', ['οὐδαμῶς.'], 'Not at all.'),
    sent(
      'Plato-5-11',
      [
        'καλῶς',
        'γὰρ',
        'εἴρηκέ',
        'τι',
        'λόγος',
        'ὡς',
        'ὃ',
        'ἂν',
        'ἀγαθὸν',
        'ὑμῖν',
        'ἔσται',
        'τοῦτο',
        'κακὸν',
        'ἐμοὶ.',
      ],
      'For in some sense it is true that what is good for you will be evil for me.'
    ),
    sent(
      'Plato-5-12',
      ['ἀλλὰ', 'δέδοκται', 'μοι', 'ὅτι', 'χρὴ', 'ἀποθνῄσκειν', 'ὑμῖν.'],
      'But it is decided that I must die with you.'
    ),
  ],
};
