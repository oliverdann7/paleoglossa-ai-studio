import { describe, it, expect } from 'vitest';
import { MAX_PHRASE_WORDS, phrasePattern, phraseTokenIndices, selectPhrase } from '../phrases.js';

const sentence = (words: string, lemmas: Record<string, string> = {}) => {
  const out: Array<{ id: string; text: string; lemma?: string; type?: string }> = [];
  words.split(' ').forEach((w, i) => {
    if (i > 0) out.push({ id: `ws${i}`, text: ' ', type: 'whitespace' });
    if (/^\p{P}+$/u.test(w)) out.push({ id: `p${i}`, text: w, type: 'punctuation' });
    else out.push({ id: `t${i}`, text: w, lemma: lemmas[w], type: 'word' });
  });
  return out;
};

describe('selectPhrase', () => {
  // Homer's formula: "swift-footed Achilles"
  const tokens = sentence('τὸν δ᾽ ἀπαμειβόμενος προσέφη πόδας ὠκὺς Ἀχιλλεύς', {
    πόδας: 'πούς',
    ὠκὺς: 'ὠκύς',
    Ἀχιλλεύς: 'Ἀχιλλεύς',
  });

  it('selects the words between two tokens with their lemmas', () => {
    const phrase = selectPhrase(tokens, 't4', 't6')!;
    expect(phrase.text).toBe('πόδας ὠκὺς Ἀχιλλεύς');
    expect(phrase.memberLemmas).toEqual(['πούς', 'ὠκύς', 'Ἀχιλλεύς']);
    expect(phrase.wordCount).toBe(3);
    expect(tokens[phrase.start].id).toBe('t4');
    expect(tokens[phrase.end].id).toBe('t6');
  });

  it('gives the same phrase whichever end is chosen first', () => {
    expect(selectPhrase(tokens, 't6', 't4')).toEqual(selectPhrase(tokens, 't4', 't6'));
  });

  it('falls back to the surface form for a word with no lemma', () => {
    expect(selectPhrase(tokens, 't2', 't3')!.memberLemmas).toEqual(['ἀπαμειβόμενος', 'προσέφη']);
  });

  it('leaves punctuation inside the range out of the phrase text', () => {
    const t = sentence('arma , virumque cano');
    expect(selectPhrase(t, 't0', 't3')!.text).toBe('arma virumque cano');
  });

  it('refuses a single word, an unknown token, and an over-long run', () => {
    expect(selectPhrase(tokens, 't4', 't4')).toBeNull();
    expect(selectPhrase(tokens, 't4', 'missing')).toBeNull();
    const long = sentence(
      Array.from({ length: MAX_PHRASE_WORDS + 2 }, (_, i) => `w${i}`).join(' ')
    );
    expect(selectPhrase(long, 't0', `t${MAX_PHRASE_WORDS + 1}`)).toBeNull();
    expect(selectPhrase(long, 't0', `t${MAX_PHRASE_WORDS - 1}`)).not.toBeNull();
  });
});

describe('phraseTokenIndices', () => {
  it('finds a saved phrase wherever its words recur, ignoring accent and case differences', () => {
    const pattern = phrasePattern('πόδας ὠκὺς Ἀχιλλεύς', 'grc');
    const other = sentence('καὶ Πόδας ὠκύς Ἀχιλλεύς εἶπε');
    const hit = phraseTokenIndices(other, [pattern], 'grc');
    expect([...hit].map((i) => other[i].text.trim()).filter(Boolean)).toEqual([
      'Πόδας',
      'ὠκύς',
      'Ἀχιλλεύς',
    ]);
  });

  it('marks nothing when only part of the phrase occurs', () => {
    const pattern = phrasePattern('πόδας ὠκὺς Ἀχιλλεύς', 'grc');
    expect(phraseTokenIndices(sentence('πόδας ὠκὺς Ἕκτωρ'), [pattern], 'grc').size).toBe(0);
  });

  it('handles Hebrew construct chains and several phrases at once', () => {
    const tokens = sentence('בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ');
    const patterns = [
      phrasePattern('בָּרָא אֱלֹהִים', 'hbo'),
      phrasePattern('וְאֵת הָאָרֶץ', 'hbo'),
    ];
    const words = [...phraseTokenIndices(tokens, patterns, 'hbo')]
      .map((i) => tokens[i])
      .filter((t) => t.type === 'word')
      .map((t) => t.text);
    expect(words).toEqual(['בָּרָא', 'אֱלֹהִים', 'וְאֵת', 'הָאָרֶץ']);
  });

  it('folds Latin spelling so a phrase saved from one edition matches another', () => {
    const hit = phraseTokenIndices(
      sentence('Arma uirumque cano'),
      [phrasePattern('arma virumque', 'lat')],
      'lat'
    );
    expect(hit.size).toBe(3); // two words and the space between
  });

  it('returns an empty set with no saved phrases', () => {
    expect(phraseTokenIndices(sentence('a b c'), [], 'lat').size).toBe(0);
  });
});
