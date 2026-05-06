import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Type, Languages, Eye, EyeOff, Maximize2, Settings2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LexDrawer } from '../components/LexDrawer';
import { 
  greekAlphabetTokens, greekBasicVocabTokens, 
  hebrewAlphabetTokens, hebrewBasicVocabTokens, 
  egyptianAlphabetTokens, egyptianBasicVocabTokens, 
  sanskritAlphabetTokens, sanskritBasicVocabTokens, 
  latinAlphabetTokens, latinBasicVocabTokens,
  koineGreekAlphabetTokens, koineGreekBasicVocabTokens,
  aramaicAlphabetTokens, aramaicBasicVocabTokens,
  copticAlphabetTokens, copticBasicVocabTokens,
  akkadianAlphabetTokens, akkadianBasicVocabTokens,
  koineGreekTokens, nextKoineGreekTokens,
  aramaicTokens, nextAramaicTokens,
  copticTokens, nextCopticTokens,
  akkadianTokens, nextAkkadianTokens,
  latinTokens, nextLatinTokens
} from '../data/tokens';

const greekTokens = [
  { id: 1, text: "Ἐν", lemma: "ἐν", gloss: "In", morphology: { part: "Preposition", case: "Dative" }, language: "Greek", status: "New" },
  { id: 2, text: "ἀρχῇ", lemma: "ἀρχή", gloss: "beginning", morphology: { part: "Noun", case: "Dative", gender: "Feminine", number: "Singular" }, language: "Greek", status: "Familiar" },
  { id: 3, text: "ἦν", lemma: "εἰμί", gloss: "was", morphology: { part: "Verb", tense: "Imperfect", voice: "Active", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek", status: "Seen Once" },
  { id: 4, text: "ὁ", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "New" },
  { id: 5, text: "λόγος,", lemma: "λόγος", gloss: "word", morphology: { part: "Noun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "Known" },
  { id: 6, text: "καὶ", lemma: "καί", gloss: "and", morphology: { part: "Conjunction" }, language: "Greek", status: "New" },
  { id: 7, text: "ὁ", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "New" },
  { id: 8, text: "λόγος", lemma: "λόγος", gloss: "word", morphology: { part: "Noun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "Known" },
  { id: 9, text: "ἦν", lemma: "εἰμί", gloss: "was", morphology: { part: "Verb", tense: "Imperfect", voice: "Active", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek", status: "Seen Once" },
  { id: 10, text: "πρὸς", lemma: "πρός", gloss: "with", morphology: { part: "Preposition", case: "Accusative" }, language: "Greek", status: "New" },
  { id: 11, text: "τὸν", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Accusative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "New" },
  { id: 12, text: "θεόν,", lemma: "θεός", gloss: "God", morphology: { part: "Noun", case: "Accusative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "Known" },
  { id: 13, text: "καὶ", lemma: "καί", gloss: "and", morphology: { part: "Conjunction" }, language: "Greek", status: "New" },
  { id: 14, text: "θεὸς", lemma: "θεός", gloss: "God", morphology: { part: "Noun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "Known" },
  { id: 15, text: "ἦν", lemma: "εἰμί", gloss: "was", morphology: { part: "Verb", tense: "Imperfect", voice: "Active", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek", status: "Seen Once" },
  { id: 16, text: "ὁ", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "New" },
  { id: 17, text: "λόγος.", lemma: "λόγος", gloss: "word", morphology: { part: "Noun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "Known" },
];

const nextGreekTokens = [
  { id: 18, text: "οὗτος", lemma: "οὗτος", gloss: "he", morphology: { part: "Pronoun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "New" },
  { id: 19, text: "ἦν", lemma: "εἰμί", gloss: "was", morphology: { part: "Verb", tense: "Imperfect", voice: "Active", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek", status: "Seen Once" },
  { id: 20, text: "ἐν", lemma: "ἐν", gloss: "in", morphology: { part: "Preposition", case: "Dative" }, language: "Greek", status: "New" },
  { id: 21, text: "ἀρχῇ", lemma: "ἀρχή", gloss: "beginning", morphology: { part: "Noun", case: "Dative", gender: "Feminine", number: "Singular" }, language: "Greek", status: "Familiar" },
  { id: 22, text: "πρὸς", lemma: "πρός", gloss: "with", morphology: { part: "Preposition", case: "Accusative" }, language: "Greek", status: "New" },
  { id: 23, text: "τὸν", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Accusative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "New" },
  { id: 24, text: "θεόν.", lemma: "θεός", gloss: "God", morphology: { part: "Noun", case: "Accusative", gender: "Masculine", number: "Singular" }, language: "Greek", status: "Known" },
  { id: 25, text: "πάντα", lemma: "πᾶς", gloss: "all things", morphology: { part: "Adjective", case: "Nominative", gender: "Neuter", number: "Plural" }, language: "Greek", status: "New" },
  { id: 26, text: "δι’", lemma: "διά", gloss: "through", morphology: { part: "Preposition", case: "Genitive" }, language: "Greek", status: "New" },
  { id: 27, text: "αὐτοῦ", lemma: "αὐτός", gloss: "him", morphology: { part: "Pronoun", case: "Genitive", gender: "Masculine", number: "Singular" }, language: "Greek", status: "New" },
  { id: 28, text: "ἐγένετο,", lemma: "γίνομαι", gloss: "were made", morphology: { part: "Verb", tense: "Aorist", voice: "Middle", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek", status: "New" },
  { id: 29, text: "καὶ", lemma: "καί", gloss: "and", morphology: { part: "Conjunction" }, language: "Greek", status: "New" },
  { id: 30, text: "χωρὶς", lemma: "χωρίς", gloss: "without", morphology: { part: "Preposition", case: "Genitive" }, language: "Greek", status: "New" },
  { id: 31, text: "αὐτοῦ", lemma: "αὐτός", gloss: "him", morphology: { part: "Pronoun", case: "Genitive", gender: "Masculine", number: "Singular" }, language: "Greek", status: "New" },
  { id: 32, text: "ἐγένετο", lemma: "γίνομαι", gloss: "was made", morphology: { part: "Verb", tense: "Aorist", voice: "Middle", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek", status: "New" },
  { id: 33, text: "οὐδὲ", lemma: "οὐδέ", gloss: "not one thing", morphology: { part: "Conjunction" }, language: "Greek", status: "New" },
  { id: 34, text: "ἕν", lemma: "εἷς", gloss: "one", morphology: { part: "Numeral", case: "Nominative", gender: "Neuter", number: "Singular" }, language: "Greek", status: "New" },
  { id: 35, text: "ὃ", lemma: "ὅς", gloss: "that", morphology: { part: "Pronoun", case: "Nominative", gender: "Neuter", number: "Singular" }, language: "Greek", status: "New" },
  { id: 36, text: "γέγονεν.", lemma: "γίνομαι", gloss: "was made", morphology: { part: "Verb", tense: "Perfect", voice: "Active", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek", status: "New" }
];

const hebrewTokens = [
  { id: 101, text: "בְּרֵאשִׁית", lemma: "רֵאשִׁית", gloss: "In the beginning", morphology: { part: "Noun", prefix: "Preposition", gender: "Feminine", number: "Singular" }, language: "Hebrew", status: "Seen Once" },
  { id: 102, text: "בָּרָא", lemma: "בָּרָא", gloss: "created", morphology: { part: "Verb", tense: "Perfect", person: "3rd", gender: "Masculine", number: "Singular" }, language: "Hebrew", status: "New" },
  { id: 103, text: "אֱלֹהִים", lemma: "אֱלֹהִים", gloss: "God", morphology: { part: "Noun", gender: "Masculine", number: "Plural" }, language: "Hebrew", status: "Known" },
  { id: 104, text: "אֵת", lemma: "אֵת", gloss: "direct object marker", morphology: { part: "Particle" }, language: "Hebrew", status: "New" },
  { id: 105, text: "הַשָּׁמַיִם", lemma: "שָׁמַיִם", gloss: "the heavens", morphology: { part: "Noun", prefix: "Article", gender: "Masculine", number: "Dual" }, language: "Hebrew", status: "Familiar" },
  { id: 106, text: "וְאֵת", lemma: "אֵת", gloss: "and direct object marker", morphology: { part: "Particle", prefix: "Conjunction" }, language: "Hebrew", status: "New" },
  { id: 107, text: "הָאָרֶץ׃", lemma: "אֶרֶץ", gloss: "the earth", morphology: { part: "Noun", prefix: "Article", gender: "Feminine", number: "Singular" }, language: "Hebrew", status: "Familiar" },
];

const nextHebrewTokens = [
  { id: 108, text: "וְהָאָרֶץ", lemma: "אֶרֶץ", gloss: "And the earth", morphology: { part: "Noun", prefix: "Conjunction/Article", gender: "Feminine", number: "Singular" }, language: "Hebrew", status: "Familiar" },
  { id: 109, text: "הָיְתָה", lemma: "הָיָה", gloss: "was", morphology: { part: "Verb", tense: "Perfect", person: "3rd", gender: "Feminine", number: "Singular" }, language: "Hebrew", status: "New" },
  { id: 110, text: "תֹהוּ", lemma: "תֹּהוּ", gloss: "formless", morphology: { part: "Noun", gender: "Masculine", number: "Singular" }, language: "Hebrew", status: "New" },
  { id: 111, text: "וָבֹהוּ", lemma: "בֹּהוּ", gloss: "and void", morphology: { part: "Noun", prefix: "Conjunction", gender: "Masculine", number: "Singular" }, language: "Hebrew", status: "New" },
  { id: 112, text: "וְחֹשֶׁךְ", lemma: "חֹשֶׁךְ", gloss: "and darkness", morphology: { part: "Noun", prefix: "Conjunction", gender: "Masculine", number: "Singular" }, language: "Hebrew", status: "New" },
  { id: 113, text: "עַל־", lemma: "עַל", gloss: "upon", morphology: { part: "Preposition" }, language: "Hebrew", status: "New" },
  { id: 114, text: "פְּנֵי", lemma: "פָּנֶה", gloss: "the face of", morphology: { part: "Noun", state: "Construct", gender: "Masculine", number: "Plural" }, language: "Hebrew", status: "New" },
  { id: 115, text: "תְהוֹם", lemma: "תְּהוֹם", gloss: "the deep", morphology: { part: "Noun", gender: "Feminine", number: "Singular" }, language: "Hebrew", status: "New" },
  { id: 116, text: "וְרוּחַ", lemma: "רוּחַ", gloss: "and the Spirit", morphology: { part: "Noun", prefix: "Conjunction", gender: "Feminine", number: "Singular" }, language: "Hebrew", status: "New" },
  { id: 117, text: "אֱלֹהִים", lemma: "אֱלֹהִים", gloss: "of God", morphology: { part: "Noun", state: "Absolute", gender: "Masculine", number: "Plural" }, language: "Hebrew", status: "Known" },
  { id: 118, text: "מְרַחֶפֶת", lemma: "רָחַף", gloss: "hovering", morphology: { part: "Verb", tense: "Participle", gender: "Feminine", number: "Singular" }, language: "Hebrew", status: "New" },
  { id: 119, text: "עַל־", lemma: "עַל", gloss: "upon", morphology: { part: "Preposition" }, language: "Hebrew", status: "New" },
  { id: 120, text: "פְּנֵי", lemma: "פָּנֶה", gloss: "the face of", morphology: { part: "Noun", state: "Construct", gender: "Masculine", number: "Plural" }, language: "Hebrew", status: "New" },
  { id: 121, text: "הַמָּיִם׃", lemma: "מַיִם", gloss: "the waters", morphology: { part: "Noun", prefix: "Article", gender: "Masculine", number: "Plural" }, language: "Hebrew", status: "New" }
];

const egyptianTokens = [
  { id: 201, text: "𓇋𓏲", lemma: "iw", gloss: "particle", morphology: { part: "Particle" }, language: "Egyptian", status: "New" },
  { id: 202, text: "𓋴𓍋𓃀𓅱𓀀", lemma: "sꜣbw", gloss: "jackal", morphology: { part: "Noun", gender: "Masculine" }, language: "Egyptian", status: "Familiar" },
  { id: 203, text: "𓁷𓂋", lemma: "ḥr", gloss: "upon", morphology: { part: "Preposition" }, language: "Egyptian", status: "Known" },
  { id: 204, text: "𓈖𓅱𓃭𓏤", lemma: "nw", gloss: "hunter", morphology: { part: "Noun", gender: "Masculine" }, language: "Egyptian", status: "New" }
];

const nextEgyptianTokens = [
  { id: 205, text: "𓅓", lemma: "m", gloss: "in", morphology: { part: "Preposition" }, language: "Egyptian", status: "Known" },
  { id: 206, text: "𓈙𓂧𓇮", lemma: "šd", gloss: "field", morphology: { part: "Noun", gender: "Masculine" }, language: "Egyptian", status: "New" },
  { id: 207, text: "𓈖", lemma: "n", gloss: "of", morphology: { part: "Preposition" }, language: "Egyptian", status: "Known" },
  { id: 208, text: "𓇓𓏏𓈖𓀭", lemma: "nsw", gloss: "king", morphology: { part: "Noun", gender: "Masculine" }, language: "Egyptian", status: "Familiar" }
];

const sanskritTokens = [
  { id: 301, text: "अग्निमीळे", lemma: "अग्नि", gloss: "Agni, I praise", morphology: { part: "Noun/Verb", case: "Accusative" }, language: "Sanskrit", status: "New" },
  { id: 302, text: "पुरोहितं", lemma: "पुरोहित", gloss: "the high priest", morphology: { part: "Noun", case: "Accusative" }, language: "Sanskrit", status: "Familiar" },
  { id: 303, text: "यज्ञस्य", lemma: "यज्ञ", gloss: "of the sacrifice", morphology: { part: "Noun", case: "Genitive" }, language: "Sanskrit", status: "Known" },
  { id: 304, text: "देवमृत्विजम्", lemma: "देव", gloss: "the divine ministrant", morphology: { part: "Noun", case: "Accusative" }, language: "Sanskrit", status: "New" }
];

const nextSanskritTokens = [
  { id: 305, text: "होतारं", lemma: "होतृ", gloss: "the invoker", morphology: { part: "Noun", case: "Accusative" }, language: "Sanskrit", status: "New" },
  { id: 306, text: "रत्नधातमम्", lemma: "रत्नधातम", gloss: "the best bestower of treasure", morphology: { part: "Adjective", case: "Accusative" }, language: "Sanskrit", status: "New" },
  { id: 307, text: "॥", lemma: "॥", gloss: "punctuation", morphology: { part: "Punctuation" }, language: "Sanskrit", status: "New" }
];

export const Reader = ({ text, onBack }: { text: any, onBack: () => void }) => {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [focusMode, setFocusMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [currentTokens, setCurrentTokens] = useState<any[]>(() => {
    switch (text?.id) {
      case 101: return greekAlphabetTokens;
      case 102: return greekBasicVocabTokens;
      case 201: return hebrewAlphabetTokens;
      case 202: return hebrewBasicVocabTokens;
      case 301: return egyptianAlphabetTokens;
      case 302: return egyptianBasicVocabTokens;
      case 401: return sanskritAlphabetTokens;
      case 402: return sanskritBasicVocabTokens;
      case 501: return latinAlphabetTokens;
      case 502: return latinBasicVocabTokens;
      case 601: return koineGreekAlphabetTokens;
      case 602: return koineGreekBasicVocabTokens;
      case 701: return aramaicAlphabetTokens;
      case 702: return aramaicBasicVocabTokens;
      case 801: return copticAlphabetTokens;
      case 802: return copticBasicVocabTokens;
      case 901: return akkadianAlphabetTokens;
      case 902: return akkadianBasicVocabTokens;
      default:
        if (text?.language === 'Hebrew') return hebrewTokens;
        if (text?.language === 'Egyptian') return egyptianTokens;
        if (text?.language === 'Sanskrit') return sanskritTokens;
        if (text?.language === 'Latin') return latinBasicVocabTokens;
        if (text?.language === 'Koine Greek') return koineGreekBasicVocabTokens;
        if (text?.language === 'Aramaic') return aramaicBasicVocabTokens;
        if (text?.language === 'Coptic') return copticBasicVocabTokens;
        if (text?.language === 'Akkadian') return akkadianBasicVocabTokens;
        return greekTokens;
    }
  });

  const [hasMore, setHasMore] = useState(text?.id ? (text.id % 100 > 2) : true);

  let isRTL = text?.language === 'Hebrew' || text?.language === 'Aramaic';
  let fontClass = "font-greek";
  if (text?.language === 'Hebrew' || text?.language === 'Aramaic') fontClass = "font-hebrew";
  else if (text?.language === 'Egyptian' || text?.language === 'Sanskrit' || text?.language === 'Latin' || text?.language === 'Akkadian' || text?.language === 'Coptic') fontClass = "font-sans";

  let translationText = "In the beginning was the Word, and the Word was with God, and the Word was God.";
  if (text?.language === 'Hebrew') {
    translationText = "In the beginning God created the heaven and the earth.";
  } else if (text?.language === 'Egyptian') {
    translationText = "The jackal is upon the hunter.";
  } else if (text?.language === 'Sanskrit') {
    translationText = "I praise Agni, the high priest of the sacrifice, the divine ministrant.";
  } else if (text?.language === 'Latin') {
    translationText = "Arms and the man I sing.";
  } else if (text?.language === 'Koine Greek') {
    translationText = "Paul, a servant of Jesus Christ...";
  } else if (text?.language === 'Aramaic') {
    translationText = "Then Daniel spoke to the king...";
  } else if (text?.language === 'Coptic') {
    translationText = "Jesus said: He who finds...";
  } else if (text?.language === 'Akkadian') {
    translationText = "He who saw the deep...";
  }

  // Update translation for alphabets/basics
  if (text?.id % 100 === 1) translationText = "The Alphabet";
  if (text?.id % 100 === 2) translationText = "Basic Vocabulary and Sentences";

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMore = () => {
    if (!hasMore) return;
    setHasMore(false); // only 1 extra page for demo
    if (text?.language === 'Hebrew') setCurrentTokens(prev => [...prev, ...nextHebrewTokens]);
    else if (text?.language === 'Egyptian') setCurrentTokens(prev => [...prev, ...nextEgyptianTokens]);
    else if (text?.language === 'Sanskrit') setCurrentTokens(prev => [...prev, ...nextSanskritTokens]);
    else if (text?.language === 'Latin') setCurrentTokens(prev => [...prev, ...nextLatinTokens]);
    else if (text?.language === 'Koine Greek') setCurrentTokens(prev => [...prev, ...nextKoineGreekTokens]);
    else if (text?.language === 'Aramaic') setCurrentTokens(prev => [...prev, ...nextAramaicTokens]);
    else if (text?.language === 'Coptic') setCurrentTokens(prev => [...prev, ...nextCopticTokens]);
    else if (text?.language === 'Akkadian') setCurrentTokens(prev => [...prev, ...nextAkkadianTokens]);
    else setCurrentTokens(prev => [...prev, ...nextGreekTokens]);
  };

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (isSelected) return "text-gold-600";
    switch(status) {
      case 'Known': return "text-green-600 dark:text-green-400";
      case 'Familiar': return "text-gold-600 dark:text-gold-400";
      case 'Seen Once': return "text-blue-600 dark:text-blue-400";
      default: return "text-obsidian-900 dark:text-vellum-100";
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000 ease-in-out",
      focusMode ? "bg-vellum-100 dark:bg-obsidian-950" : "bg-vellum-50 dark:bg-obsidian-950"
    )}>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/5 dark:bg-white/5 z-[100]">
        <motion.div 
          className="h-full bg-gold-500"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Bar */}
      <AnimatePresence>
        {!focusMode && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-0 left-64 right-0 h-24 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-12 z-50 bg-vellum-50/80 dark:bg-obsidian-950/80 backdrop-blur-xl"
          >
            <div className="flex items-center gap-8">
              <button 
                onClick={onBack}
                className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-xl font-serif font-bold tracking-tight">{text?.title || "Gospel of John"}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.2em]">Book I • Chapter 1</span>
                  <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                  <span className="text-[10px] font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-[0.2em]">{text?.language}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/5">
                <button 
                  onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="p-2.5 rounded-full hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm active:scale-90"
                >
                  <span className="text-xs font-bold">A</span>
                </button>
                <button 
                  onClick={() => setFontSize(Math.min(64, fontSize + 2))}
                  className="p-2.5 rounded-full hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm active:scale-90"
                >
                  <span className="text-lg font-bold leading-none">A</span>
                </button>
              </div>
              <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className={cn(
                  "p-3.5 rounded-full transition-all border border-black/5 dark:border-white/5 active:scale-95",
                  showTranslation ? "bg-gold-500 text-vellum-50 shadow-lg shadow-gold-500/20" : "bg-black/5 dark:bg-white/5"
                )}
              >
                <Languages className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setFocusMode(!focusMode)}
                className="p-3.5 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5 active:scale-95"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Reading Canvas */}
      <main className={cn(
        "editorial-container pt-56 pb-64 transition-all duration-1000 ease-in-out",
        focusMode ? "max-w-2xl" : "max-w-4xl"
      )}>
        <div className="relative">
          <div className={cn(
            "flex flex-wrap gap-x-4 gap-y-8 leading-[2] justify-center",
            fontClass
          )} dir={isRTL ? "rtl" : "ltr"}>
            {currentTokens.map((token: any) => (
              <motion.span
                key={token.id}
                whileHover={{ y: -3, scale: 1.05 }}
                onClick={() => setSelectedWord(token)}
                className={cn(
                  "cursor-pointer transition-all duration-500 relative group",
                  "font-medium tracking-normal",
                  getStatusColor(token.status, selectedWord?.id === token.id)
                )}
                style={{ fontSize: `${fontSize}px` }}
              >
                {token.text}
                <span className={cn(
                  "absolute -bottom-2 left-0 w-full h-0.5 bg-gold-500/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500",
                  selectedWord?.id === token.id && "scale-x-100 bg-gold-500"
                )} />
              </motion.span>
            ))}
          </div>

          {hasMore && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={loadMore}
                className="px-8 py-3 rounded-full border border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-600 transition-all duration-300"
              >
                Continue Reading
              </button>
            </div>
          )}

          <AnimatePresence>
            {showTranslation && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-32 p-16 rounded-[40px] bg-gold-500/5 border border-gold-500/10 relative overflow-hidden paper-texture"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gold-500/20" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-600 mb-8 flex items-center gap-3">
                  <Eye className="w-4 h-4" />
                  Parallel Translation
                </h4>
                <p className="text-3xl font-serif italic text-obsidian-900/70 dark:text-vellum-100/70 leading-relaxed tracking-tight">
                  {translationText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="mt-48 flex justify-between items-center pt-16 border-t border-black/5 dark:border-white/5">
          <button className="group flex items-center gap-3 text-xs font-bold text-obsidian-900/40 dark:text-vellum-100/40 hover:text-gold-600 transition-all uppercase tracking-widest">
            <div className="p-2 rounded-full border border-black/5 dark:border-white/5 group-hover:border-gold-500/30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Previous Chapter
          </button>
          <button className="group flex items-center gap-3 text-xs font-bold text-obsidian-900/40 dark:text-vellum-100/40 hover:text-gold-600 transition-all uppercase tracking-widest">
            Next Chapter
            <div className="p-2 rounded-full border border-black/5 dark:border-white/5 group-hover:border-gold-500/30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </main>

      {/* Lexical Drawer */}
      <LexDrawer 
        word={selectedWord} 
        isOpen={!!selectedWord} 
        onClose={() => setSelectedWord(null)} 
      />

      {/* Focus Mode Toggle (Floating) */}
      <AnimatePresence>
        {focusMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setFocusMode(false)}
            className="fixed bottom-12 right-12 p-5 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-full shadow-2xl z-[100] hover:scale-110 active:scale-95 transition-all"
          >
            <Maximize2 className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
