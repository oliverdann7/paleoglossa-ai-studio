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

export const GRC_MARK_2: TextSection = {
  id: 'GrcMk-2',
  textId: 'GrcMk-Full',
  sequence: 2,
  label: 'Mark 2:1–12 — Healing of the Paralytic',
  sentences: [
    sent('GrcMk-2-1', ['Καὶ', 'εἰσῆλθεν', 'πάλιν', 'εἰς', 'Καφαρναοὺμ', 'διʼ', 'ἡμερῶν', 'καὶ', 'ἠκούσθη', 'ὅτι', 'ἐν', 'οἴκῳ', 'ἐστίν.'], 'And he entered again into Capernaum after some days, and it was noised that he was in the house.'),
    sent('GrcMk-2-2', ['καὶ', 'συνήχθησαν', 'πολλοὶ', 'ὥστε', 'μηκέτι', 'χωρεῖν', 'μηδὲ', 'τὰ', 'πρὸς', 'τὴν', 'θύραν,', 'καὶ', 'ἐλάλει', 'αὐτοῖς', 'τὸν', 'λόγον.'], 'And many were gathered together, so that there was no room to receive them, no, not so much as about the door: and he preached the word unto them.'),
    sent('GrcMk-2-3', ['καὶ', 'ἔρχονται', 'φέροντες', 'πρὸς', 'αὐτὸν', 'παραλυτικὸν', 'αἰρόμενον', 'ὑπὸ', 'τεσσάρων.'], 'And they come unto him, bringing one sick of the palsy, which was borne of four.'),
    sent('GrcMk-2-4', ['καὶ', 'μὴ', 'δυνάμενοι', 'προσενέγκαι', 'αὐτῷ', 'διὰ', 'τὸν', 'ὄχλον', 'ἀπεστέγασαν', 'τὴν', 'στέγην', 'ὅπου', 'ἦν,', 'καὶ', 'ἐξορύξαντες', 'χαλῶσι', 'τὸν', 'κράβαττον', 'ὅπου', 'ὁ', 'παραλυτικὸς', 'κατέκειτο.'], 'And when they could not come nigh unto him for the press, they uncovered the roof where he was: and when they had broken it up, they let down the bed wherein the sick of the palsy lay.'),
    sent('GrcMk-2-5', ['ἰδὼν', 'δὲ', 'ὁ', 'Ἰησοῦς', 'τὴν', 'πίστιν', 'αὐτῶν', 'λέγει', 'τῷ', 'παραλυτικῷ,', 'Τέκνον,', 'ἀφίενταί', 'σου', 'αἱ', 'ἁμαρτίαι.'], 'When Jesus saw their faith, he said unto the sick of the palsy, Son, thy sins be forgiven thee.'),
    sent('GrcMk-2-6', ['ἦσαν', 'δέ', 'τινες', 'τῶν', 'γραμματέων', 'ἐκεῖ', 'καθήμενοι', 'καὶ', 'διαλογιζόμενοι', 'ἐν', 'ταῖς', 'καρδίαις', 'αὐτῶν,', 'Τί', 'οὗτος', 'οὕτως', 'λαλεῖ;', 'βλασφημεῖ·', 'τίς', 'δύναται', 'ἀφιέναι', 'ἁμαρτίας', 'εἰ', 'μὴ', 'εἷς', 'ὁ', 'θεός;'], 'But there were certain of the scribes sitting there, and reasoning in their hearts, Why doth this man thus speak? He blasphemeth: who can forgive sins but God only?'),
    sent('GrcMk-2-7', ['καὶ', 'εὐθὺς', 'ἐπιγνοὺς', 'ὁ', 'Ἰησοῦς', 'τῷ', 'πνεύματι', 'αὐτοῦ', 'ὅτι', 'οὕτως', 'διαλογίζονται', 'ἐν', 'ἑαυτοῖς,', 'λέγει', 'αὐτοῖς,', 'Τί', 'ταῦτα', 'διαλογίζεσθε', 'ἐν', 'ταῖς', 'καρδίαις', 'ὑμῶν;'], 'And immediately when Jesus perceived in his spirit that they so reasoned within themselves, he said unto them, Why reason ye these things in your hearts?'),
    sent('GrcMk-2-8', ['τί', 'ἐστιν', 'εὐκοπώτερον,', 'εἰπεῖν', 'τῷ', 'παραλυτικῷ,', 'Ἀφίενταί', 'σου', 'αἱ', 'ἁμαρτίαι,', 'ἢ', 'εἰπεῖν,', 'Ἔγειρε', 'καὶ', 'ἆρον', 'τὸν', 'κράβαττόν', 'σου', 'καὶ', 'περιπάτει;'], 'Whether is it easier to say to the sick of the palsy, Thy sins be forgiven thee; or to say, Arise, and take up thy bed, and walk?'),
    sent('GrcMk-2-9', ['ἵνα', 'δὲ', 'εἰδῆτε', 'ὅτι', 'ἐξουσίαν', 'ἔχει', 'ὁ', 'υἱὸς', 'τοῦ', 'ἀνθρώπου', 'ἀφιέναι', 'ἁμαρτίας', 'ἐπὶ', 'τῆς', 'γῆς', 'λέγει', 'τῷ', 'παραλυτικῷ,'], 'But that ye may know that the Son of man hath power on earth to forgive sins, (he saith to the sick of the palsy,)'),
    sent('GrcMk-2-10', ['Σοὶ', 'λέγω,', 'ἔγειρε', 'ἆρον', 'τὸν', 'κράβαττόν', 'σου', 'καὶ', 'ὕπαγε', 'εἰς', 'τὸν', 'οἶκόν', 'σου.'], 'I say unto thee, Arise, and take up thy bed, and go thy way into thine house.'),
    sent('GrcMk-2-11', ['καὶ', 'ἠγέρθη,', 'καὶ', 'εὐθὺς', 'ἄρας', 'τὸν', 'κράβαττον', 'ἐξῆλθεν', 'ἐναντίον', 'πάντων,', 'ὥστε', 'ἐξίστασθαι', 'πάντας', 'καὶ', 'δοξάζειν', 'τὸν', 'θεὸν', 'λέγοντας', 'ὅτι', 'Οὕτως', 'οὐδέποτε', 'εἴδομεν.'], 'And immediately he arose, took up the bed, and went forth before them all; so that they were all amazed, and glorified God, saying, We never saw it on this fashion.'),
  ],
};

export const GRC_MARK_3: TextSection = {
  id: 'GrcMk-3',
  textId: 'GrcMk-Full',
  sequence: 3,
  label: 'Mark 4:1–9 — Parable of the Sower',
  sentences: [
    sent('GrcMk-3-1', ['Καὶ', 'πάλιν', 'ἤρξατο', 'διδάσκειν', 'παρὰ', 'τὴν', 'θάλασσαν·', 'καὶ', 'συνάγεται', 'πρὸς', 'αὐτὸν', 'ὄχλος', 'πλεῖστος,', 'ὥστε', 'αὐτὸν', 'εἰς', 'πλοῖον', 'ἐμβάντα', 'καθῆσθαι', 'ἐν', 'τῇ', 'θαλάσσῃ,', 'καὶ', 'πᾶς', 'ὁ', 'ὄχλος', 'πρὸς', 'τὴν', 'θάλασσαν', 'ἐπὶ', 'τῆς', 'γῆς', 'ἦσαν.'], 'And he began again to teach by the sea side: and there was gathered unto him a great multitude, so that he entered into a ship, and sat in the sea; and the whole multitude was by the sea on the land.'),
    sent('GrcMk-3-2', ['καὶ', 'ἐδίδασκεν', 'αὐτοὺς', 'ἐν', 'παραβολαῖς', 'πολλὰ', 'καὶ', 'ἔλεγεν', 'αὐτοῖς', 'ἐν', 'τῇ', 'διδαχῇ', 'αὐτοῦ,'], 'And he taught them many things by parables, and said unto them in his doctrine,'),
    sent('GrcMk-3-3', ['Ἀκούετε·', 'ἰδοὺ', 'ἐξῆλθεν', 'ὁ', 'σπείρων', 'σπεῖραι.'], 'Hearken; Behold, there went out a sower to sow:'),
    sent('GrcMk-3-4', ['καὶ', 'ἐγένετο', 'ἐν', 'τῷ', 'σπείρειν', 'ὃ', 'μὲν', 'ἔπεσεν', 'παρὰ', 'τὴν', 'ὁδόν,', 'καὶ', 'ἦλθεν', 'τὰ', 'πετεινὰ', 'καὶ', 'κατέφαγεν', 'αὐτό.'], 'And it came to pass, as he sowed, some fell by the way side, and the fowls of the air came and devoured it up.'),
    sent('GrcMk-3-5', ['καὶ', 'ἄλλο', 'ἔπεσεν', 'ἐπὶ', 'τὸ', 'πετρῶδες', 'ὅπου', 'οὐκ', 'εἶχεν', 'γῆν', 'πολλήν,', 'καὶ', 'εὐθὺς', 'ἐξανέτειλεν', 'διὰ', 'τὸ', 'μὴ', 'ἔχειν', 'βάθος', 'γῆς·'], 'And some fell on stony ground, where it had not much earth; and immediately it sprang up, because it had no depth of earth:'),
    sent('GrcMk-3-6', ['καὶ', 'ὅτε', 'ἀνέτειλεν', 'ὁ', 'ἥλιος', 'ἐκαυματίσθη,', 'καὶ', 'διὰ', 'τὸ', 'μὴ', 'ἔχειν', 'ῥίζαν', 'ἐξηράνθη.'], 'But when the sun was up, it was scorched; and because it had no root, it withered away.'),
    sent('GrcMk-3-7', ['καὶ', 'ἄλλο', 'ἔπεσεν', 'εἰς', 'τὰς', 'ἀκάνθας,', 'καὶ', 'ἀνέβησαν', 'αἱ', 'ἄκανθαι', 'καὶ', 'συνέπνιξαν', 'αὐτό,', 'καὶ', 'καρπὸν', 'οὐκ', 'ἔδωκεν.'], 'And some fell among thorns, and the thorns grew up, and choked it, and it yielded no fruit.'),
    sent('GrcMk-3-8', ['καὶ', 'ἄλλο', 'ἔπεσεν', 'εἰς', 'τὴν', 'γῆν', 'τὴν', 'καλήν,', 'καὶ', 'ἐδίδου', 'καρπὸν', 'ἀναβαίνοντα', 'καὶ', 'αὐξανόμενα,', 'καὶ', 'ἔφερεν', 'ἓν', 'τριάκοντα', 'καὶ', 'ἓν', 'ἑξήκοντα', 'καὶ', 'ἓν', 'ἑκατόν.'], 'And other fell on good ground, and did yield fruit that sprang up and increased; and brought forth, some thirty, and some sixty, and some an hundred.'),
    sent('GrcMk-3-9', ['καὶ', 'ἔλεγεν,', 'Ὃς', 'ἔχει', 'ὦτα', 'ἀκούειν', 'ἀκουέτω.'], 'And he said unto them, He that hath ears to hear, let him hear.'),
  ],
};

export const ALL_GREEK_NT_EXTENDED_SECTIONS: TextSection[] = [
  GRC_MARK_2,
  GRC_MARK_3,
];
