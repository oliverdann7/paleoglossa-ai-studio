import type { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string, lemmaGloss?: Record<string, { lemma: string; gloss: string }>): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const mapped = lemmaGloss?.[clean];
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: mapped?.lemma || normalized,
        gloss: mapped?.gloss || '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

const SAN_GLOSS: Record<string, { lemma: string; gloss: string }> = {
  'तं': { lemma: 'तद्', gloss: 'him' },
  'तथा': { lemma: 'तथा', gloss: 'thus, so' },
  'कृपया': { lemma: 'कृपा', gloss: 'with pity, compassion' },
  'आविष्टम्': { lemma: 'आविष्ट', gloss: 'overcome, filled' },
  'अश्रुपूर्णाकुलम्': { lemma: 'अश्रुपूर्णाकुल', gloss: 'with eyes full of tears' },
  'ईक्षणम्': { lemma: 'ईक्षण', gloss: 'eyes' },
  'विषीदन्तम्': { lemma: 'विषीदत्', gloss: 'despondent, despairing' },
  'इदम्': { lemma: 'इदम्', gloss: 'this' },
  'वाक्यम्': { lemma: 'वाक्य', gloss: 'word, speech' },
  'उवाच': { lemma: 'वच्', gloss: 'said, spoke' },
  'हृषीकेशः': { lemma: 'हृषीकेश', gloss: 'Hrishikesha (Krishna)' },
  'कुतस्': { lemma: 'कुतः', gloss: 'whence, from where' },
  'त्वा': { lemma: 'त्वद्', gloss: 'you (acc.)' },
  'कश्मलम्': { lemma: 'कश्मल', gloss: 'stain, dirt' },
  'विषमे': { lemma: 'विषम', gloss: 'in this critical hour' },
  'समुपस्थितम्': { lemma: 'समुपस्थित', gloss: 'come upon, arrived' },
  'अनार्यजुष्टम्': { lemma: 'अनार्यजुष्ट', gloss: 'not fit for an honorable person' },
  'अस्वर्ग्यम्': { lemma: 'अस्वर्ग्य', gloss: 'not heaven-winning' },
  'अकीर्तिकरम्': { lemma: 'अकीर्तिकर', gloss: 'causing infamy' },
  'अर्जुन': { lemma: 'अर्जुन', gloss: 'Arjuna' },
  'क्लैब्यम्': { lemma: 'क्लैब्य', gloss: 'unmanliness, impotence' },
  'मा': { lemma: 'मा', gloss: 'do not' },
  'स्म': { lemma: 'स्म', gloss: '(emphatic particle)' },
  'गमः': { lemma: 'गम्', gloss: 'go, yield' },
  'पार्थ': { lemma: 'पार्थ', gloss: 'Partha (Arjuna)' },
  'एतत्': { lemma: 'एतद्', gloss: 'this' },
  'त्वयि': { lemma: 'त्वद्', gloss: 'in you' },
  'उपपद्यते': { lemma: 'उपपद्', gloss: 'befits, is proper' },
  'क्षुद्रम्': { lemma: 'क्षुद्र', gloss: 'petty, small' },
  'हृदयदौर्बल्यम्': { lemma: 'हृदयदौर्बल्य', gloss: 'faint-heartedness' },
  'त्यक्त्वा': { lemma: 'त्यज्', gloss: 'having abandoned' },
  'उत्तिष्ठ': { lemma: 'उत्-स्था', gloss: 'arise, stand up' },
  'परन्तप': { lemma: 'परन्तप', gloss: 'scorcher of enemies' },
  'ज्यायसी': { lemma: 'ज्यायस्', gloss: 'superior' },
  'चेत्': { lemma: 'चेत्', gloss: 'if' },
  'कर्मणः': { lemma: 'कर्मन्', gloss: 'than action' },
  'ते': { lemma: 'त्वद्', gloss: 'your' },
  'मताः': { lemma: 'मन्', gloss: 'considered' },
  'बुद्धिः': { lemma: 'बुद्धि', gloss: 'wisdom, intellect' },
  'जनार्दन': { lemma: 'जनार्दन', gloss: 'Janardana (Krishna)' },
  'तत्': { lemma: 'तद्', gloss: 'then, that' },
  'किम्': { lemma: 'किम्', gloss: 'why' },
  'कर्मणि': { lemma: 'कर्मन्', gloss: 'in action' },
  'घोरे': { lemma: 'घोर', gloss: 'terrible' },
  'माम्': { lemma: 'अहम्', gloss: 'me (acc.)' },
  'नियोजयसि': { lemma: 'नि-युज्', gloss: 'you engage, impel' },
  'केशव': { lemma: 'केशव', gloss: 'Kesava (Krishna)' },
  'व्यामिश्रेण': { lemma: 'व्यामिश्र', gloss: 'ambiguous, confused' },
  'इव': { lemma: 'इव', gloss: 'like, as if' },
  'बुद्धिम्': { lemma: 'बुद्धि', gloss: 'intellect, understanding' },
  'मोहयसि': { lemma: 'मुह्', gloss: 'you confuse, delude' },
  'मे': { lemma: 'अहम्', gloss: 'my (gen.)' },
  'एकम्': { lemma: 'एक', gloss: 'one' },
  'वद': { lemma: 'वद्', gloss: 'tell, speak' },
  'निश्चित्य': { lemma: 'निस्-चि', gloss: 'having decided' },
  'येन': { lemma: 'यद्', gloss: 'by which' },
  'श्रेयः': { lemma: 'श्रेयस्', gloss: 'what is good, better' },
  'अहम्': { lemma: 'अहम्', gloss: 'I' },
  'आप्नुयाम्': { lemma: 'आप्', gloss: 'I may attain' },
  'कर्मणाम्': { lemma: 'कर्मन्', gloss: 'of actions' },
  'अनारम्भात्': { lemma: 'अनारम्भ', gloss: 'from non-beginning' },
  'नैष्कर्म्यम्': { lemma: 'नैष्कर्म्य', gloss: 'freedom from action' },
  'पुरुषः': { lemma: 'पुरुष', gloss: 'person, man' },
  'अश्नुते': { lemma: 'अश्', gloss: 'attains, reaches' },
  'च': { lemma: 'च', gloss: 'and' },
  'संन्यसनात्': { lemma: 'संन्यसन', gloss: 'from renunciation' },
  'एव': { lemma: 'एव', gloss: 'indeed, only' },
  'सिद्धिम्': { lemma: 'सिद्धि', gloss: 'perfection, success' },
  'समधिगच्छति': { lemma: 'सम-धि-गम्', gloss: 'attains fully' },
  'परोपकारार्थम्': { lemma: 'परोपकारार्थ', gloss: 'for the benefit of others' },
  'शरीरम्': { lemma: 'शरीर', gloss: 'body' },
  'परार्थम्': { lemma: 'परार्थ', gloss: 'for the sake of others' },
  'अर्थम्': { lemma: 'अर्थ', gloss: 'wealth' },
  'अपि': { lemma: 'अपि', gloss: 'even, also' },
  'धर्मम्': { lemma: 'धर्म', gloss: 'righteousness, duty' },
  'त्यजेत्': { lemma: 'त्यज्', gloss: 'should abandon' },
  'प्राणाः': { lemma: 'प्राण', gloss: 'life, lives' },
  'बुद्धिमताम्': { lemma: 'बुद्धिमत्', gloss: 'of the wise' },
  'भवन्ति': { lemma: 'भू', gloss: 'are, exist' },
  'इति': { lemma: 'इति', gloss: 'thus, so' },
  'उक्तम्': { lemma: 'वच्', gloss: 'it is said' },
  'तेषाम्': { lemma: 'तद्', gloss: 'of them' },

  'उत्तमाः': { lemma: 'उत्तम', gloss: 'the best' },
  'ये': { lemma: 'यद्', gloss: 'who' },
  'स्वार्थम्': { lemma: 'स्वार्थ', gloss: 'selfishness' },
  'प्रवर्तन्ते': { lemma: 'प्र-वृत्', gloss: 'they act, proceed' },
  'धर्मार्थकाममोक्षेषु': { lemma: 'धर्मार्थकाममोक्ष', gloss: 'in dharma, artha, kama, moksha' },
  'प्रवृत्तिः': { lemma: 'प्रवृत्ति', gloss: 'engagement, activity' },
  'क्रमशः': { lemma: 'क्रमशः', gloss: 'in sequence' },
  'नृणाम्': { lemma: 'नृ', gloss: 'of men' },
  'चतुर्णाम्': { lemma: 'चतुर्', gloss: 'of four' },
  'अन्त्यः': { lemma: 'अन्त्य', gloss: 'the last' },
  'मुख्यः': { lemma: 'मुख्य', gloss: 'the chief' },
  'धारणा': { lemma: 'धारणा', gloss: 'conclusion, belief' },
};

export const SAN_GITA_2: TextSection = {
  id: 'San-Gita-2',
  textId: 'San-Gita-1',
  sequence: 2,
  label: 'Chapter 2.1–10 — Arjuna\'s Grief',
  sentences: [
    sent(
      'San-Gita-2-1',
      ['तं', 'तथा', 'कृपया', 'आविष्टम्', 'अश्रुपूर्णाकुलम्', 'ईक्षणम्', 'विषीदन्तम्', 'इदम्', 'वाक्यम्', 'उवाच', 'हृषीकेशः'],
      'To him thus overcome by pity, his eyes filled with tears and troubled, and despondent, Hrishikesha spoke these words.',
      SAN_GLOSS
    ),
    sent(
      'San-Gita-2-2',
      ['कुतस्', 'त्वा', 'कश्मलम्', 'इदम्', 'विषमे', 'समुपस्थितम्', 'अनार्यजुष्टम्', 'अस्वर्ग्यम्', 'अकीर्तिकरम्', 'अर्जुन'],
      'Whence has this stain come upon you at this critical hour, Arjuna? It is not fit for an honorable person, nor is it heaven-winning, and it causes infamy.',
      SAN_GLOSS
    ),
    sent(
      'San-Gita-2-3',
      ['क्लैब्यम्', 'मा', 'स्म', 'गमः', 'पार्थ', 'न', 'एतत्', 'त्वयि', 'उपपद्यते', 'क्षुद्रम्', 'हृदयदौर्बल्यम्', 'त्यक्त्वा', 'उत्तिष्ठ', 'परन्तप'],
      'Do not yield to unmanliness, O son of Pritha. It does not befit you. Shake off this petty faint-heartedness and arise, O scorcher of enemies.',
      SAN_GLOSS
    ),
  ],
};

export const SAN_GITA_3: TextSection = {
  id: 'San-Gita-3',
  textId: 'San-Gita-1',
  sequence: 3,
  label: 'Chapter 3.1–5 — The Yoga of Action',
  sentences: [
    sent(
      'San-Gita-3-1',
      ['ज्यायसी', 'चेत्', 'कर्मणः', 'ते', 'मताः', 'बुद्धिः', 'जनार्दन', 'तत्', 'किम्', 'कर्मणि', 'घोरे', 'माम्', 'नियोजयसि', 'केशव'],
      'If you consider wisdom superior to action, O Janardana, why do you engage me in this terrible action, O Kesava?',
      SAN_GLOSS
    ),
    sent(
      'San-Gita-3-2',
      ['व्यामिश्रेण', 'इव', 'वाक्येन', 'बुद्धिम्', 'मोहयसि', 'इव', 'मे', 'तत्', 'एकम्', 'वद', 'निश्चित्य', 'येन', 'श्रेयः', 'अहम्', 'आप्नुयाम्'],
      'With these ambiguous words you seem to confound my understanding. Therefore tell me decisively that one path by which I may attain what is good.',
      SAN_GLOSS
    ),
    sent(
      'San-Gita-3-3',
      ['न', 'कर्मणाम्', 'अनारम्भात्', 'नैष्कर्म्यम्', 'पुरुषः', 'अश्नुते', 'न', 'च', 'संन्यसनात्', 'एव', 'सिद्धिम्', 'समधिगच्छति'],
      'Not by abstaining from actions does a person attain freedom from action, nor by renunciation alone does he attain perfection.',
      SAN_GLOSS
    ),
  ],
};

export const SAN_HITOPADESA_1: TextSection = {
  id: 'San-Hito-1',
  textId: 'San-Hito',
  sequence: 1,
  label: 'Mitralabha — The Winning of Friends',
  sentences: [
    sent(
      'San-Hito-1-1',
      ['परोपकारार्थम्', 'इदम्', 'शरीरम्', 'परार्थम्', 'अर्थम्', 'अपि', 'धर्मम्', 'त्यजेत्', 'परार्थम्', 'अर्थम्', 'धर्मम्', 'त्यजेत्'],
      'This body is for the benefit of others. For the sake of others one should abandon even wealth and righteousness.',
      SAN_GLOSS
    ),
    sent(
      'San-Hito-1-2',
      ['प्राणाः', 'अपि', 'परार्थम्', 'एव', 'बुद्धिमताम्', 'भवन्ति', 'इति', 'उक्तम्', 'तेषाम्', 'ते', 'उत्तमाः', 'ये', 'स्वार्थम्', 'त्यक्त्वा', 'परार्थे', 'प्रवर्तन्ते'],
      'Even lives exist for the sake of others in the wise. It is said that those who, abandoning selfishness, act for others — they are the best.',
      SAN_GLOSS
    ),
    sent(
      'San-Hito-1-3',
      ['धर्मार्थकाममोक्षेषु', 'प्रवृत्तिः', 'क्रमशः', 'नृणाम्', 'चतुर्णाम्', 'अपि', 'तेषाम्', 'अन्त्यः', 'मुख्यः', 'इति', 'धारणा'],
      'In dharma, artha, kama, and moksha, the engagement of men is in sequence. Among these four, the last is considered the chief.',
      SAN_GLOSS
    ),
  ],
};

export const ALL_SANSKRIT_EXTENDED_SECTIONS: TextSection[] = [SAN_GITA_2, SAN_GITA_3, SAN_HITOPADESA_1];
