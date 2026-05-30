/**
 * Ancient Greek classics — Herodotus, Thucydides, Sophocles, Plutarch, Lucian
 * All texts are public domain.
 */

import { TextSection, Sentence } from '../../types/corpus.js';
import { LXX_LEX } from './lxx-septuagint.js';
import { MINI_LEX } from './greek-mini-stories.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–·]+|[\s.,;:!?()"«»—–·]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ᷀-᷿⃐-⃿]/g, '').toLowerCase();
      const hit = LXX_LEX[normalized] || MINI_LEX[normalized];
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

// ─── Herodotus, Histories I.1–5 ──────────────────────────────────────────────

export const GRC_HERODOTUS_1: TextSection = {
  id: 'Hdt-1-1',
  textId: 'Hdt-Hist',
  sequence: 1,
  label: 'I.1–5 — Proem and the mythic origins of the Persian Wars',
  sentences: [
    sent('Hdt-1-1-1',
      ['Ἡροδότου', 'Ἁλικαρνησσέος', 'ἱστορίης', 'ἀπόδεξις', 'ἥδε,'],
      'This is the display of the inquiry of Herodotus of Halicarnassus,'),
    sent('Hdt-1-1-2',
      ['ὡς', 'μήτε', 'τὰ', 'γενόμενα', 'ἐξ', 'ἀνθρώπων', 'τῷ', 'χρόνῳ', 'ἐξίτηλα', 'γένηται,'],
      'so that what has come to pass among men may not become faded by time,'),
    sent('Hdt-1-1-3',
      ['μήτε', 'ἔργα', 'μεγάλα', 'τε', 'καὶ', 'θωμαστά,', 'τὰ', 'μὲν', 'Ἕλλησι', 'τὰ', 'δὲ', 'βαρβάροισι', 'ἀποδεχθέντα,', 'ἀκλεᾶ', 'γένηται,'],
      'and that great and wondrous deeds, some displayed by Hellenes, others by barbarians, may not lack renown,'),
    sent('Hdt-1-1-4',
      ['τά', 'τε', 'ἄλλα', 'καὶ', 'δι᾽', 'ἣν', 'αἰτίην', 'ἐπολέμησαν', 'ἀλλήλοισι.'],
      'among other things and especially the reason why they made war against each other.'),
    sent('Hdt-1-2-1',
      ['Φοίνικες', 'μέν', 'νυν', 'αἴτιοί', 'φασι', 'ἑωυτοὺς', 'γενέσθαι', 'τῆς', 'διαφορῆς.'],
      'The Phoenicians, then, say that they themselves were the cause of the quarrel.'),
    sent('Hdt-1-3-1',
      ['Τὴν', 'μὲν', 'δὴ', 'ἁρπαγὴν', 'ταύτην', 'ἀντὶ', 'ἁρπαγῆς', 'δικαιεῦν', 'εἶναι:'],
      'This abduction, then, they regard as fair requital for the abduction:'),
    sent('Hdt-1-4-1',
      ['μέχρι', 'μὲν', 'γὰρ', 'τούτου', 'ἁρπαγὰς', 'μούνας', 'εἶναι', 'παρ᾽', 'ἀλλήλων,'],
      'for up to this point there had been only mutual abductions from each other,'),
    sent('Hdt-1-5-1',
      ['Ἐγὼ', 'δὲ', 'περὶ', 'μὲν', 'τούτων', 'οὐκ', 'ἔρχομαι', 'ἐρέων', 'ὡς', 'οὕτως', 'ἢ', 'ἄλλως', 'κως', 'ταῦτα', 'ἐγένετο,'],
      'I myself shall not say concerning these things that they happened thus or otherwise,'),
    sent('Hdt-1-5-2',
      ['τὸν', 'δὲ', 'οἶδα', 'αὐτὸς', 'πρῶτον', 'ὑπάρξαντα', 'ἀδίκων', 'ἔργων', 'ἐς', 'τοὺς', 'Ἕλληνας,', 'τοῦτον', 'σημήνας', 'προβήσομαι', 'ἐς', 'τὸ', 'πρόσω', 'τοῦ', 'λόγου.'],
      'but I shall point out the one whom I myself know first began unjust deeds against the Hellenes, and then proceed forward in my account.'),
    sent('Hdt-1-5-3',
      ['Κροῖσος', 'ἦν', 'Λυδὸς', 'μὲν', 'γένος,', 'παῖς', 'δὲ', 'Ἀλυάττεω,', 'τύραννος', 'δὲ', 'ἐθνέων', 'τῶν', 'ἐντὸς', 'Ἅλυος', 'ποταμοῦ.'],
      'Croesus was Lydian by birth, son of Alyattes, tyrant of the nations within the river Halys.'),
  ],
};

// ─── Thucydides, I.1–3 ────────────────────────────────────────────────────────

export const GRC_THUCYDIDES_1: TextSection = {
  id: 'Thuc-1-1',
  textId: 'Thuc-Hist',
  sequence: 1,
  label: 'I.1–3 — Introduction: the greatest war',
  sentences: [
    sent('Thuc-1-1-1',
      ['Θουκυδίδης', 'Ἀθηναῖος', 'ξυνέγραψε', 'τὸν', 'πόλεμον', 'τῶν', 'Πελοποννησίων', 'καὶ', 'Ἀθηναίων,'],
      'Thucydides the Athenian wrote the war of the Peloponnesians and Athenians,'),
    sent('Thuc-1-1-2',
      ['ὡς', 'ἐπολέμησαν', 'πρὸς', 'ἀλλήλους,'],
      'how they waged war against each other,'),
    sent('Thuc-1-1-3',
      ['ἀρξάμενος', 'εὐθὺς', 'καθισταμένου', 'καὶ', 'ἐλπίσας', 'μέγαν', 'τε', 'ἔσεσθαι', 'καὶ', 'ἀξιολογώτατον', 'τῶν', 'προγεγενημένων.'],
      'beginning at once when it was forming and expecting it would be great and most noteworthy of all that had come before.'),
    sent('Thuc-1-1-4',
      ['τεκμαιρόμενος', 'ὅτι', 'ἀκμάζοντές', 'τε', 'ᾖσαν', 'ἐς', 'αὐτὸν', 'ἀμφότεροι', 'παρασκευῇ', 'τῇ', 'πάσῃ,'],
      'He inferred this because both sides were at their height in every sort of preparation as they entered it,'),
    sent('Thuc-1-2-1',
      ['δηλοῖ', 'δέ', 'μοι', 'τόδε', 'τῶν', 'παλαιῶν', 'ἀσθένειαν', 'οὐχ', 'ἥκιστα.'],
      'This shows me most clearly the weakness of earlier times.'),
    sent('Thuc-1-2-2',
      ['φαίνεται', 'γὰρ', 'ἡ', 'νῦν', 'Ἑλλὰς', 'καλουμένη', 'οὐ', 'πάλαι', 'βεβαίως', 'οἰκουμένη.'],
      'For the land now called Hellas appears to have been not long ago permanently settled.'),
    sent('Thuc-1-3-1',
      ['σημεῖον', 'δέ·', 'οἰκίαι', 'γὰρ', 'πρότερον', 'οὐκ', 'ἦσαν', 'ἐν', 'ταύτῃ', 'μόνιμοι,', 'ἀλλ᾽', 'ἀεί', 'τι', 'μετανίστανται,'],
      'Evidence of this: there were previously no permanent settlements in it, but they were always moving,'),
    sent('Thuc-1-3-2',
      ['ῥᾳδίως', 'δὲ', 'τὰς', 'κατοικίσεις', 'ἐποιοῦντο.'],
      'and they established their settlements easily.'),
  ],
};

// ─── Sophocles, Antigone 1–99 ─────────────────────────────────────────────────

export const GRC_SOPHOCLES_ANT: TextSection = {
  id: 'Soph-Ant-1',
  textId: 'Soph-Ant',
  sequence: 1,
  label: 'Lines 1–99 — Antigone and Ismene; Creon\'s edict',
  sentences: [
    sent('Soph-Ant-1',
      ['Ὦ', 'κοινὸν', 'αὐτάδελφον', 'Ἰσμήνης', 'κάρα,'],
      'O Ismene, my own dear sister,'),
    sent('Soph-Ant-2',
      ['ἆρ᾽', 'οἶσθ᾽', 'ὅ', 'τι', 'Ζεὺς', 'τῶν', 'ἀπ᾽', 'Οἰδίπου', 'κακῶν', 'ὁποῖον', 'οὐχὶ', 'νῷν', 'ἔτι', 'ζώσαιν', 'τελεῖ;'],
      'do you know of any ill from Oedipus that Zeus will not fulfill upon us two while we live?'),
    sent('Soph-Ant-3',
      ['οὐδὲν', 'γὰρ', 'οὔτ᾽', 'ἀλγεινὸν', 'οὔτ᾽', 'ἄτης', 'ἄτερ', 'οὔτ᾽', 'αἰσχρὸν', 'οὔτ᾽', 'ἄτιμόν', 'ἐσθ᾽,', 'ὁποῖον', 'οὐκ', 'ἐγὼ', 'τῶν', 'σῶν', 'τε', 'κἀμῶν', 'οὐκ', 'ὄπωπ᾽', 'ἀτῶν.'],
      'For nothing painful, nothing ruinous, nothing shameful, nothing dishonourable is there that I have not seen among your sorrows and mine.'),
    sent('Soph-Ant-4',
      ['καὶ', 'νῦν', 'τί', 'τοῦτ᾽', 'αὖ', 'φασι', 'πανδήμῳ', 'πόλει', 'κήρυγμα', 'θεῖναι', 'τὸν', 'στρατηγὸν', 'ἀρτίως;'],
      'And now what is this new proclamation they say the general has just laid upon all the city?'),
    sent('Soph-Ant-5',
      ['ἦ', 'καὶ', 'προσήκεις', 'καὶ', 'δεδήλωσαί', 'τί', 'μοι;'],
      'Have you heard, and does it concern you and me?'),
    sent('Soph-Ant-6',
      ['τὸν', 'μὲν', 'προτίσας,', 'τὸν', 'δ᾽', 'ἀτιμάσας', 'ἔχει.'],
      'The one he has honoured, the other he has dishonoured.'),
    sent('Soph-Ant-7',
      ['Ἐτεοκλέα', 'μέν,', 'ὡς', 'λέγουσι,', 'σὺν', 'δίκῃ', 'χρησθέντα', 'καὶ', 'νόμῳ', 'κατὰ', 'χθονὸς', 'ἔκρυψε', 'τοῖς', 'ἔνερθεν', 'ἔντιμον', 'νεκροῖς.'],
      'Eteocles, so they say, with just dealing and law he has buried beneath the earth honoured among the dead below.'),
    sent('Soph-Ant-8',
      ['τὸν', 'δ᾽', 'ἀθλίως', 'θανόντα', 'Πολυνείκους', 'νέκυν', 'ἀστοῖσί', 'φασι', 'κηρύξαι', 'τινα', 'μήτε', 'κρύπτειν', 'ἐν', 'τάφῳ', 'μήτε', 'κωκύσαί', 'τινα,'],
      'But the corpse of Polynices, who died miserably, they say he has proclaimed to the citizens that no one shall cover in a tomb or mourn,'),
    sent('Soph-Ant-9',
      ['ἐᾶν', 'δ᾽', 'ἄθαπτον', 'καὶ', 'πρὸς', 'οἰωνῶν', 'δέμας', 'καὶ', 'πρὸς', 'κυνῶν', 'ἐδεστὸν', 'αἰκισθέν', 'τ᾽', 'ἰδεῖν.'],
      'but to leave unburied, a sweet treasure for birds as they look for food, and for dogs.'),
    sent('Soph-Ant-10',
      ['τοιαῦτα', 'φασὶ', 'τὸν', 'ἀγαθὸν', 'Κρέοντα', 'σοί', 'τε', 'κἀμοὶ', '—', 'λέγω', 'γάρ', 'κἀμέ', '—', 'κηρύσσειν', 'ἔχειν.'],
      'Such is what they say noble Creon has proclaimed to you and me — for I include myself — and is coming to announce.'),
  ],
};

// ─── Plutarch, Life of Alexander 1–4 ─────────────────────────────────────────

export const GRC_PLUTARCH_ALEX: TextSection = {
  id: 'Plut-Alex-1',
  textId: 'Plut-Alex',
  sequence: 1,
  label: 'Chapters 1–4 — On biography and the battle of Issus',
  sentences: [
    sent('Plut-Alex-1-1',
      ['Ἐν', 'τούτῳ', 'τῷ', 'βιβλίῳ', 'τὸν', 'Ἀλεξάνδρου', 'βίον', 'καὶ', 'τὸν', 'Καίσαρος', 'γράφοντες,'],
      'In this book, writing the life of Alexander and that of Caesar,'),
    sent('Plut-Alex-1-2',
      ['διὰ', 'τὸ', 'πλῆθος', 'τῶν', 'ὑποκειμένων', 'πράξεων', 'οὐδὲν', 'ἄλλο', 'προεροῦμεν', 'ἢ', 'παραιτησόμεθα', 'τοὺς', 'ἀναγινώσκοντας'],
      'on account of the multitude of the subject deeds we shall say nothing else beforehand but beg the readers'),
    sent('Plut-Alex-1-3',
      ['μὴ', 'κατηγορεῖν,', 'ἐὰν', 'μὴ', 'πάντα', 'λέγωμεν', 'μηδὲ', 'καθ᾽', 'ἕκαστον', 'ἐξακριβοῦν', 'τὰ', 'περιβόητα,', 'ἀλλ᾽', 'ἐπιτέμνοντες', 'τὰ', 'πλεῖστα.'],
      'not to object if we do not tell all things nor elaborate each of the famous deeds, but cut short the most of them.'),
    sent('Plut-Alex-1-4',
      ['οὔτε', 'γὰρ', 'ἱστορίας', 'γράφομεν,', 'ἀλλὰ', 'βίους·'],
      'For we are writing lives, not histories;'),
    sent('Plut-Alex-1-5',
      ['οὔτε', 'ταῖς', 'ἐπιφανεστάταις', 'πράξεσι', 'πάντοτε', 'ἔνεστι', 'δήλωσις', 'ἀρετῆς', 'ἢ', 'κακίας,'],
      'nor is virtue or vice always manifest in the most conspicuous actions,'),
    sent('Plut-Alex-1-6',
      ['ἀλλὰ', 'πράγμα', 'βραχὺ', 'πολλάκις', 'καὶ', 'ῥῆμα', 'καὶ', 'παιδιά', 'τις', 'ἔμφασιν', 'ἤθους', 'ἐποίησε', 'μᾶλλον', 'ἢ', 'μάχαι', 'μυριόνεκροι', 'καὶ', 'παρατάξεις', 'αἱ', 'μέγισται', 'καὶ', 'πολιορκίαι', 'πόλεων.'],
      'but often a small thing, a word, or a jest, makes a clearer revelation of character than battles with countless dead and the greatest pitched battles and sieges of cities.'),
    sent('Plut-Alex-2-1',
      ['Ἀλέξανδρος', 'ὁ', 'βασιλεὺς', 'τῶν', 'Μακεδόνων', 'ὢν', 'ἡλικίαν', 'ἕκτης', 'καὶ', 'εἰκοστῆς,', 'ὡς', 'μὲν', 'Ἀριστόβουλος', 'λέγει,', 'τεσσαράκοντα', 'χιλιάδων', 'καὶ', 'τριακοσίων', 'ἐν', 'τοῖς', 'πεζοῖς', 'ἔχων,'],
      'Alexander the king of the Macedonians, being twenty-six years old, as Aristobulus says, having forty thousand three hundred infantry,'),
    sent('Plut-Alex-2-2',
      ['ἐνίκησε', 'τὴν', 'Δαρείου', 'δύναμιν', 'παρὰ', 'τὸν', 'Ἰσσὸν', 'ποταμόν.'],
      'defeated the force of Darius by the river Issus.'),
  ],
};

// ─── Lucian, Charon 1–8 ───────────────────────────────────────────────────────

export const GRC_LUCIAN_CHARON: TextSection = {
  id: 'Lucian-Char-1',
  textId: 'Lucian-Char',
  sequence: 1,
  label: 'Sections 1–8 — Charon surveys the world of the living',
  sentences: [
    sent('Lucian-Char-1-1',
      ['Χάρων:', 'Ἑρμῆ,', 'τί', 'τοῦτό', 'ἐστιν', 'ὃ', 'γελᾷ', 'ὁ', 'Ζεὺς', 'ἐφ᾽', 'ἡμᾶς;'],
      'Charon: Hermes, what is this that Zeus is laughing about at us?'),
    sent('Lucian-Char-1-2',
      ['ἀπὸ', 'χθὲς', 'ἤδη', 'γελᾷ', 'οὐδὲν', 'εἰπών,', 'ἐμοὶ', 'δέ', 'ἐστιν', 'ὑποψία', 'ὥς', 'τι', 'βούλεται', 'ἡμῖν', 'σημῆναι.'],
      'From yesterday he has been laughing without saying anything, and I suspect that he wants to show us something.'),
    sent('Lucian-Char-2-1',
      ['Ἑρμῆς:', 'Οὐδὲν', 'δεινόν,', 'ὦ', 'Χάρων·', 'ἑώρα', 'γάρ', 'τι', 'τῶν', 'ἐπὶ', 'γῆς', 'γελοίων.'],
      'Hermes: Nothing dreadful, O Charon; for he was looking at something ridiculous among the affairs on earth.'),
    sent('Lucian-Char-2-2',
      ['βούλει', 'οὖν', 'ἀναβάντες', 'πρὸς', 'τὸ', 'ὕψος', 'κἀκεῖθεν', 'κατόπτου', 'λάβωμεν', 'τὰ', 'τῶν', 'ἀνθρώπων', 'πράγματα;'],
      'Do you want, then, to go up to the height and from there look down upon the affairs of men?'),
    sent('Lucian-Char-3-1',
      ['Χάρων:', 'Βουλοίμην', 'ἂν', 'εἴ', 'σοι', 'δοκεῖ,', 'ὦ', 'Ἑρμῆ.'],
      'Charon: I would like to, if it seems good to you, O Hermes.'),
    sent('Lucian-Char-3-2',
      ['πάλαι', 'γάρ', 'ποτε', 'ἐπιθυμία', 'μοι', 'ἦν', 'ἰδεῖν', 'ὁποῖά', 'ἐστι', 'τὰ', 'ἐπὶ', 'γῆς', 'πράγματα·'],
      'For long ago a desire came upon me to see what the affairs on earth are like;'),
    sent('Lucian-Char-4-1',
      ['ἀλλ᾽', 'ὅρα', 'πῶς', 'ἀναβησόμεθα·', 'οὐ', 'γάρ', 'πω', 'εἴθισμαί', 'γε', 'ὑπεράνω', 'γῆς', 'εἶναι.'],
      'But see how we shall go up; for I am not yet accustomed to being above the earth.'),
    sent('Lucian-Char-5-1',
      ['Ἑρμῆς:', 'Δεῦρο', 'τοίνυν·', 'τὴν', 'Ἤπειρον', 'ἄφες', 'πρὸ', 'ποδῶν,', 'εἶτα', 'ἐπὶ', 'τοῦ', 'ὄρους', 'τούτου', 'ἀναβάντες', 'ἐκεῖθεν', 'ἀποσκοπῶμεν.'],
      'Hermes: Come then; leave the mainland below your feet, then climbing this mountain let us look out from there.'),
    sent('Lucian-Char-6-1',
      ['ὁρᾷς', 'τὴν', 'θάλατταν', 'καὶ', 'τὴν', 'γῆν', 'καὶ', 'τὰς', 'πόλεις', 'καὶ', 'τοὺς', 'ἀνθρώπους;'],
      'Do you see the sea and the earth and the cities and the people?'),
  ],
};

export const ALL_GREEK_CLASSICS_SECTIONS = [
  GRC_HERODOTUS_1,
  GRC_THUCYDIDES_1,
  GRC_SOPHOCLES_ANT,
  GRC_PLUTARCH_ALEX,
  GRC_LUCIAN_CHARON,
];
