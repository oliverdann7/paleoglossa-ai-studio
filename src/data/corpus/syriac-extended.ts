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

export const SYR_JOHN_2: TextSection = {
  id: 'Syr-Jn-2',
  textId: 'Syr-Jn',
  sequence: 2,
  label: 'John 1:6–14 — The Word Became Flesh',
  sentences: [
    sent('Syr-Jn-2-1', ['ܗܘܐ', 'ܓܒܪܐ', 'ܕܫܝܪ', 'ܡܢ', 'ܐܠܗܐ', 'ܫܡܗ', 'ܝܘܚܢܢ'], 'There was a man sent from God, whose name was John.'),
    sent('Syr-Jn-2-2', ['ܗܢܐ', 'ܐܬܐ', 'ܠܣܗܕܘܬܐ', 'ܕܢܣܗܕ', 'ܥܠ', 'ܢܘܗܪܐ', 'ܕܟܠ', 'ܢܗܝܡܘܢ', 'ܒܝܕܗ'], 'He came for testimony, to bear witness about the light, that all might believe through him.'),
    sent('Syr-Jn-2-3', ['ܠܐ', 'ܗܘܐ', 'ܗܘ', 'ܢܘܗܪܐ', 'ܐܠܐ', 'ܕܢܣܗܕ', 'ܥܠ', 'ܢܘܗܪܐ'], 'He was not the light, but came to bear witness about the light.'),
    sent('Syr-Jn-2-4', ['ܡܠܬܐ', 'ܓܝܪ', 'ܦܓܪܐ', 'ܗܘܬ', 'ܘܫܪܝܬ', 'ܒܝܢܢ', 'ܘܚܙܝܢ', 'ܫܘܒܚܗ', 'ܫܘܒܚܐ', 'ܐܝܟ', 'ܕܡܢ', 'ܐܒܐ', 'ܠܒܪܗ', 'ܘܡܠܐ', 'ܛܝܒܘܬܐ', 'ܘܩܘܫܬܐ'], 'And the Word became flesh and dwelt among us, and we beheld his glory, the glory as of the only begotten of the Father, full of grace and truth.'),
  ],
};

export const SYR_GENESIS_1: TextSection = {
  id: 'Syr-Gen-1',
  textId: 'Syr-Gen',
  sequence: 1,
  label: 'Genesis 1:1–5 — Creation',
  sentences: [
    sent('Syr-Gen-1-1', ['ܒܪܫܝܬ', 'ܒܪܐ', 'ܐܠܗܐ', 'ܝܬ', 'ܫܡܝܐ', 'ܘܝܬ', 'ܐܪܥܐ'], 'In the beginning God created the heavens and the earth.'),
    sent('Syr-Gen-1-2', ['ܘܐܪܥܐ', 'ܗܘܬ', 'ܬܘܗ', 'ܘܒܘܗ', 'ܘܚܫܘܟܐ', 'ܥܠ', 'ܐܦܝ', 'ܬܗܘܡܐ', 'ܘܪܘܚܗ', 'ܕܐܠܗܐ', 'ܡܪܚܦܐ', 'ܗܘܬ', 'ܥܠ', 'ܐܦܝ', 'ܡܝܐ'], 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.'),
    sent('Syr-Gen-1-3', ['ܘܐܡܪ', 'ܐܠܗܐ', 'ܢܗܘܐ', 'ܢܘܗܪܐ', 'ܘܗܘܐ', 'ܢܘܗܪܐ'], 'And God said, Let there be light, and there was light.'),
  ],
};

export const ALL_SYRIAC_EXTENDED_SECTIONS: TextSection[] = [
  SYR_JOHN_2,
  SYR_GENESIS_1,
];
