import type { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
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

export const SAN_GITA_2: TextSection = {
  id: 'San-Gita-2',
  textId: 'San-Gita',
  sequence: 2,
  label: 'Chapter 2.1–10 — Arjuna\'s Grief',
  sentences: [
    sent('San-Gita-2-1', ['तं', 'तथा', 'कृपया', 'आविष्टम्', 'अश्रुपूर्णाकुलम्', 'ईक्षणम्', 'विषीदन्तम्', 'इदम्', 'वाक्यम्', 'उवाच', 'हृषीकेशः'], 'To him thus overcome by pity, his eyes filled with tears and troubled, and despondent, Hrishikesha spoke these words.'),
    sent('San-Gita-2-2', ['कुतस्', 'त्वा', 'कश्मलम्', 'इदम्', 'विषमे', 'समुपस्थितम्', 'अनार्यजुष्टम्', 'अस्वर्ग्यम्', 'अकीर्तिकरम्', 'अर्जुन'], 'Whence has this stain come upon you at this critical hour, Arjuna? It is not fit for an honorable person, nor is it heaven-winning, and it causes infamy.'),
    sent('San-Gita-2-3', ['क्लैब्यम्', 'मा', 'स्म', 'गमः', 'पार्थ', 'न', 'एतत्', 'त्वयि', 'उपपद्यते', 'क्षुद्रम्', 'हृदयदौर्बल्यम्', 'त्यक्त्वा', 'उत्तिष्ठ', 'परन्तप'], 'Do not yield to unmanliness, O son of Pritha. It does not befit you. Shake off this petty faint-heartedness and arise, O scorcher of enemies.'),
  ],
};

export const SAN_GITA_3: TextSection = {
  id: 'San-Gita-3',
  textId: 'San-Gita',
  sequence: 3,
  label: 'Chapter 3.1–5 — The Yoga of Action',
  sentences: [
    sent('San-Gita-3-1', ['ज्यायसी', 'चेत्', 'कर्मणः', 'ते', 'मताः', 'बुद्धिः', 'जनार्दन', 'तत्', 'किम्', 'कर्मणि', 'घोरे', 'माम्', 'नियोजयसि', 'केशव'], 'If you consider wisdom superior to action, O Janardana, why do you engage me in this terrible action, O Kesava?'),
    sent('San-Gita-3-2', ['व्यामिश्रेण', 'इव', 'वाक्येन', 'बुद्धिम्', 'मोहयसि', 'इव', 'मे', 'तत्', 'एकम्', 'वद', 'निश्चित्य', 'येन', 'श्रेयः', 'अहम्', 'आप्नुयाम्'], 'With these ambiguous words you seem to confound my understanding. Therefore tell me decisively that one path by which I may attain what is good.'),
    sent('San-Gita-3-3', ['न', 'कर्मणाम्', 'अनारम्भात्', 'नैष्कर्म्यम्', 'पुरुषः', 'अश्नुते', 'न', 'च', 'संन्यसनात्', 'एव', 'सिद्धिम्', 'समधिगच्छति'], 'Not by abstaining from actions does a person attain freedom from action, nor by renunciation alone does he attain perfection.'),
  ],
};

export const SAN_HITOPADESA_1: TextSection = {
  id: 'San-Hito-1',
  textId: 'San-Hito',
  sequence: 1,
  label: 'Mitralabha — The Winning of Friends',
  sentences: [
    sent('San-Hito-1-1', ['परोपकारार्थम्', 'इदम्', 'शरीरम्', 'परार्थम्', 'अर्थम्', 'अपि', 'धर्मम्', 'त्यजेत्', 'परार्थम्', 'अर्थम्', 'धर्मम्', 'त्यजेत्'], 'This body is for the benefit of others. For the sake of others one should abandon even wealth and righteousness.'),
    sent('San-Hito-1-2', ['प्राणाः', 'अपि', 'परार्थम्', 'एव', 'बुद्धिमताम्', 'भवन्ति', 'इति', 'उक्तम्', 'तेषाम्', 'ते', 'उत्तमाः', 'ये', 'स्वार्थम्', 'त्यक्त्वा', 'परार्थे', 'प्रवर्तन्ते'], 'Even lives exist for the sake of others in the wise. It is said that those who, abandoning selfishness, act for others — they are the best.'),
    sent('San-Hito-1-3', ['धर्मार्थकाममोक्षेषु', 'प्रवृत्तिः', 'क्रमशः', 'नृणाम्', 'चतुर्णाम्', 'अपि', 'तेषाम्', 'अन्त्यः', 'मुख्यः', 'इति', 'धारणा'], 'In dharma, artha, kama, and moksha, the engagement of men is in sequence. Among these four, the last is considered the chief.'),
  ],
};

export const ALL_SANSKRIT_EXTENDED_SECTIONS: TextSection[] = [
  SAN_GITA_2,
  SAN_GITA_3,
  SAN_HITOPADESA_1,
];
