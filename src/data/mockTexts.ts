import { Text, TextSection } from "../types/corpus";
import { 
  TEXT_JOHN_1, GENESIS_1, TEXT_GENESIS, AENEID_1_1, TEXT_AENEID_1, 
  JOHN_1_1, SYRIAC_JOHN_1_1, TEXT_SYRIAC_JOHN,
  COPTIC_JOHN_1_1, TEXT_COPTIC_JOHN, ARAMAIC_GENESIS_1_1, TEXT_ARAMAIC_GENESIS,
  AKKADIAN_GILGAMESH_1_1, TEXT_AKKADIAN_GILGAMESH, SANSKRIT_GITA_1_1, TEXT_SANSKRIT_GITA
} from "./corpus";

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const titlesByLanguage: Record<string, string[]> = {
  'grc': ["Aesop's Fables", "Dialogues of the Dead", "Apology", "Anabasis", "The Iliad", "The Republic", "Odyssey", "Phaedrus", "Histories (Herodotus)", "Antigone", "Medea", "Symposium", "Poetics", "Gorgias"],
  'grc-koine': ["Gospel of Luke", "Gospel of Mark", "Gospel of Matthew", "Acts of the Apostles", "Romans", "1 Corinthians", "Ephesians", "Revelation", "Didache", "1 Clement", "Shepherd of Hermas", "Epistle of Barnabas", "Martyrdom of Polycarp"],
  'hbo': ["Book of Exodus", "Book of Leviticus", "Book of Numbers", "Book of Deuteronomy", "Joshua", "Judges", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "Isaiah", "Jeremiah", "Ezekiel", "Proverbs", "Job", "Ecclesiastes", "Song of Solomon", "Ruth"],
  'lat': ["De Bello Gallico", "In Catilinam", "De Amicitia", "Metamorphoses", "Odes (Horace)", "Epistles (Seneca)", "Annals (Tacitus)", "De Rerum Natura", "Bucolics", "Georgics", "Ars Amatoria", "Fasti", "Satyricon"],
  'syr': ["Gospel of Luke (Peshitta)", "Gospel of Mark (Peshitta)", "Acts (Peshitta)", "Odes of Solomon", "Acts of Thomas", "Cave of Treasures", "Hymns composed by Ephrem", "Homilies of Jacob of Serugh"],
  'cop': ["Gospel of Thomas", "Gospel of Truth", "Apocryphon of John", "Gospel of Philip", "Trimorphic Protennoia", "Pistis Sophia", "Apophthegmata Patrum (Coptic)", "Life of Antony (Coptic)"],
  'arc': ["Targum Pseudo-Jonathan", "Targum Neofiti", "Book of Daniel (Aramaic)", "Book of Ezra (Aramaic)", "Genesis Apocryphon", "Targum Isaiah", "Targum Jonathan", "Elephantine Papyri"],
  'akk': ["Enuma Elish", "Epic of Atrahasis", "Code of Hammurabi", "Descent of Ishtar", "Adapa", "Epic of Creation", "Amarna Letters", "Ludlul Bel Nemeqi"],
  'san': ["Ramayana", "Rigveda", "Upanishads", "Pancatantra", "Hitopadesha", "Meghaduta", "Shakuntala", "Arthashastra", "Manusmriti", "Bhagavata Purana"],
  'egy': ["The Maxims of Ptahhotep", "Tale of Sinuhe", "Book of the Dead", "Westcar Papyrus", "Pyramid Texts", "Coffin Texts", "Instructions of Kagemni", "The Eloquent Peasant", "Story of Wenamun", "Papyrus Edwin Smith"]
};

const generatedTexts: Text[] = [];
const generatedSections: TextSection[] = [];

export const getMockTexts = () => {
  if (generatedTexts.length > 0) return generatedTexts;
  generateMocks();
  return generatedTexts;
};

export const getMockSections = () => {
  if (generatedSections.length > 0) return generatedSections;
  generateMocks();
  return generatedSections;
};

const EGYPTIAN_BASE_TEXT: Text = {
  id: "Egy-Ptah",
  corpusId: "Egy-Corpus",
  title: "The Maxims of Ptahhotep",
  author: "Ptahhotep",
  language: "egy",
  level: "B1",
  sectionsPreview: [{ id: "Egy-Ptah-1", label: "Maxim 1" }]
};

const EGYPTIAN_BASE_SECTION: TextSection = {
  id: "Egy-Ptah-1",
  textId: "Egy-Ptah",
  sequence: 1,
  label: "Maxim 1",
  sentences: [
    {
      id: "Egy-Ptah-1-s1",
      tokens: [
        { id: "Egy-Ptah-1-s1-t1", surface: "𓐍𓂤𓅱", normalized: "ḫrw", lemma: "ḫrw", gloss: "voice", morphology: { partOfSpeech: "noun", case: "Nom" }, punctBefore: "", punctAfter: " " },
        { id: "Egy-Ptah-1-s1-t2", surface: "𓈖", normalized: "n", lemma: "n", gloss: "of", morphology: { partOfSpeech: "prep" }, punctBefore: "", punctAfter: " " },
        { id: "Egy-Ptah-1-s1-t3", surface: "𓊵𓏏𓊪𓅆", normalized: "ḥtp", lemma: "ḥtp", gloss: "peace", morphology: { partOfSpeech: "noun" }, punctBefore: "", punctAfter: "." }
      ]
    }
  ]
};

const generateMocks = () => {
  const baseMap: Record<string, { text: Text, section: TextSection }> = {
    'grc': { text: TEXT_JOHN_1, section: JOHN_1_1 },
    'grc-koine': { text: TEXT_JOHN_1, section: JOHN_1_1 },
    'hbo': { text: TEXT_GENESIS, section: GENESIS_1 },
    'lat': { text: TEXT_AENEID_1, section: AENEID_1_1 },
    'syr': { text: TEXT_SYRIAC_JOHN, section: SYRIAC_JOHN_1_1 },
    'cop': { text: TEXT_COPTIC_JOHN, section: COPTIC_JOHN_1_1 },
    'arc': { text: TEXT_ARAMAIC_GENESIS, section: ARAMAIC_GENESIS_1_1 },
    'akk': { text: TEXT_AKKADIAN_GILGAMESH, section: AKKADIAN_GILGAMESH_1_1 },
    'san': { text: TEXT_SANSKRIT_GITA, section: SANSKRIT_GITA_1_1 },
    'egy': { text: EGYPTIAN_BASE_TEXT, section: EGYPTIAN_BASE_SECTION }
  };

  Object.entries(baseMap).forEach(([lang, base]) => {
    let nameIndex = 0;
    const titles = titlesByLanguage[lang] || ["Text 1", "Text 2", "Text 3", "Text 4"];
    levels.forEach(level => {
      // Determine how many texts per level (random between 3-5 for realism, wait no, strict count)
      // Actually we'll just do 3-5 texts per level depending on array logic
      const genCount = level === 'C2' ? 3 : 4;
      for(let count = 1; count <= genCount; count++) {
        const newTextId = `mock-${lang}-${level}-${count}`;
        const titleName = titles[Math.min(nameIndex++, titles.length - 1)]; 
        const newTitle = `${titleName} (${level} Text ${count})`;
        const newAuthor = `Classic Author`;
        
        const newText: Text = {
          ...base.text,
          id: newTextId,
          corpusId: `mock-${lang}-corpus`,
          title: newTitle,
          author: newAuthor,
          language: lang,
          level: level,
          sectionsPreview: [{ id: `${newTextId}-sec1`, label: "Sample Selection" }]
        };
        
        const allTokens = base.section.sentences.flatMap(s => s.tokens);
        
        // Generate pseudo-random sentences from base tokens to make texts visually distinct
        const syntheticSentences = [];
        const numSentences = 3 + (count % 3); // 3 to 5 sentences
        for (let sIdx = 0; sIdx < numSentences; sIdx++) {
          const numTokens = 5 + ((count * sIdx) % 8); // 5 to 12 tokens
          const syntheticTokens = [];
          for (let tIdx = 0; tIdx < numTokens; tIdx++) {
            const sourceToken = allTokens[(count * 7 + sIdx * 3 + tIdx) % allTokens.length];
            if (sourceToken) {
              const newToken = {
                ...sourceToken,
                id: `${newTextId}-sec1-s${sIdx}-t${tIdx}`
              };
              // Add a bit of spacing
              newToken.punctBefore = tIdx === 0 ? "" : " ";
              newToken.punctAfter = tIdx === numTokens - 1 ? "." : "";
              syntheticTokens.push(newToken);
            }
          }
          syntheticSentences.push({
            id: `${newTextId}-sec1-s${sIdx}`,
            tokens: syntheticTokens,
          });
        }
        
        const newSection: TextSection = {
          ...base.section,
          id: `${newTextId}-sec1`,
          textId: newTextId,
          sentences: syntheticSentences,
        };

        generatedTexts.push(newText);
        generatedSections.push(newSection);
      }
    });
  });
};
