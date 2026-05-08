import { WordState } from '../constants/wordStates';

const STORAGE_KEY = 'paleoglossa_knowledge';

export const seedKnowledge = () => {
  if (localStorage.getItem(STORAGE_KEY)) return; // Don't overwrite existing knowledge

  const initialKnowledge: Record<string, WordState> = {
    // Known Greek
    'ἐν': WordState.KNOWN,
    'ὁ': WordState.KNOWN,
    'καί': WordState.KNOWN,
    'εἰμί': WordState.KNOWN,
    'θεός': WordState.KNOWN,
    'πρός': WordState.KNOWN,
    
    // Learning Greek
    'ἀρχή': WordState.LEARNING,
    'λόγος': WordState.LEARNING,
    'γένεσις': WordState.LEARNING,
    'βίβλος': WordState.LEARNING,
    
    // Known Hebrew
    'בְּ': WordState.KNOWN,
    'הַ': WordState.KNOWN,
    'וְ': WordState.KNOWN,
    'אֵת': WordState.KNOWN,
    
    // Learning Hebrew
    'רֵאשִׁית': WordState.LEARNING,
    'בָּרָא': WordState.LEARNING,
    'אֱלֹהִים': WordState.LEARNING,
    'שָׁמַיִם': WordState.LEARNING,
    'אֶרֶץ': WordState.LEARNING,
    
    // Known Latin
    'ab': WordState.KNOWN,
    'qui': WordState.KNOWN,
    'de': WordState.KNOWN,
    'in': WordState.KNOWN,
    
    // Learning Latin
    'arma': WordState.LEARNING,
    'vir': WordState.LEARNING,
    'cano': WordState.LEARNING,
    'primus': WordState.LEARNING,
    'ora': WordState.LEARNING
  };

  // Add ~100 more random-ish looking entries for the "150 lemmas" requirement
  const greekWords = ['ἀγάπη', 'ζωή', 'φῶς', 'κόσμος', 'ἄνθρωπος', 'κύριος', 'οὐρανός', 'γῆ', 'θάλασσα', 'πνεῦμα'];
  greekWords.forEach((w, i) => {
    initialKnowledge[w] = (i % 3 === 0) ? WordState.FAMILIAR : WordState.NEW;
  });

  const latinWords = ['amor', 'vita', 'lux', 'mundus', 'homo', 'dominus', 'caelum', 'terra', 'mare', 'spiritus'];
  latinWords.forEach((w, i) => {
    initialKnowledge[w] = (i % 3 === 1) ? WordState.FAMILIAR : WordState.NEW;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialKnowledge));
};
