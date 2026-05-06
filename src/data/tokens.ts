export const greekAlphabetTokens = [
  { id: 10101, text: "Α α", lemma: "Alpha", gloss: "[a] as in father", morphology: { part: "Letter", name: "Alpha", type: "Vowel" }, language: "Greek", status: "New" },
  { id: 10102, text: "Β β", lemma: "Beta", gloss: "[b] as in boat", morphology: { part: "Letter", name: "Beta", type: "Consonant" }, language: "Greek", status: "New" },
  { id: 10103, text: "Γ γ", lemma: "Gamma", gloss: "[g] as in get", morphology: { part: "Letter", name: "Gamma", type: "Consonant" }, language: "Greek", status: "New" },
  { id: 10104, text: "Δ δ", lemma: "Delta", gloss: "[d] as in dog", morphology: { part: "Letter", name: "Delta", type: "Consonant" }, language: "Greek", status: "New" },
  { id: 10105, text: "Ε ε", lemma: "Epsilon", gloss: "[e] as in pet", morphology: { part: "Letter", name: "Epsilon", type: "Vowel" }, language: "Greek", status: "New" },
  { id: 10106, text: "Ζ ζ", lemma: "Zeta", gloss: "[zd] as in wisdom", morphology: { part: "Letter", name: "Zeta", type: "Consonant" }, language: "Greek", status: "New" },
  { id: 10107, text: "Η η", lemma: "Eta", gloss: "[e:] as in air", morphology: { part: "Letter", name: "Eta", type: "Vowel" }, language: "Greek", status: "New" },
  { id: 10108, text: "Θ θ", lemma: "Theta", gloss: "[th] as in thin", morphology: { part: "Letter", name: "Theta", type: "Consonant" }, language: "Greek", status: "New" },
];

export const hebrewAlphabetTokens = [
  { id: 20101, text: "א", lemma: "Aleph", gloss: "Silent", morphology: { part: "Letter", name: "Aleph", type: "Consonant" }, language: "Hebrew", status: "New" },
  { id: 20102, text: "ב", lemma: "Bet", gloss: "[b] or [v]", morphology: { part: "Letter", name: "Bet", type: "Consonant" }, language: "Hebrew", status: "New" },
  { id: 20103, text: "ג", lemma: "Gimel", gloss: "[g]", morphology: { part: "Letter", name: "Gimel", type: "Consonant" }, language: "Hebrew", status: "New" },
  { id: 20104, text: "ד", lemma: "Dalet", gloss: "[d]", morphology: { part: "Letter", name: "Dalet", type: "Consonant" }, language: "Hebrew", status: "New" },
  { id: 20105, text: "ה", lemma: "He", gloss: "[h]", morphology: { part: "Letter", name: "He", type: "Consonant" }, language: "Hebrew", status: "New" },
  { id: 20106, text: "ו", lemma: "Vav", gloss: "[v] or [w]", morphology: { part: "Letter", name: "Vav", type: "Consonant" }, language: "Hebrew", status: "New" },
];

export const egyptianAlphabetTokens = [
  { id: 30101, text: "𓄿", lemma: "Aleph", gloss: "Vulture (a)", morphology: { part: "Sign", type: "Uniliteral" }, language: "Egyptian", status: "New" },
  { id: 30102, text: "𓇋", lemma: "Yod", gloss: "Reed (i)", morphology: { part: "Sign", type: "Uniliteral" }, language: "Egyptian", status: "New" },
  { id: 30103, text: "𓂝", lemma: "Ayin", gloss: "Arm (a)", morphology: { part: "Sign", type: "Uniliteral" }, language: "Egyptian", status: "New" },
  { id: 30104, text: "𓅱", lemma: "Waw", gloss: "Quail chick (w)", morphology: { part: "Sign", type: "Uniliteral" }, language: "Egyptian", status: "New" },
  { id: 30105, text: "𓃀", lemma: "B", gloss: "Foot (b)", morphology: { part: "Sign", type: "Uniliteral" }, language: "Egyptian", status: "New" },
];

export const sanskritAlphabetTokens = [
  { id: 40101, text: "अ", lemma: "a", gloss: "a (short)", morphology: { part: "Letter", type: "Vowel" }, language: "Sanskrit", status: "New" },
  { id: 40102, text: "आ", lemma: "ā", gloss: "ā (long)", morphology: { part: "Letter", type: "Vowel" }, language: "Sanskrit", status: "New" },
  { id: 40103, text: "इ", lemma: "i", gloss: "i (short)", morphology: { part: "Letter", type: "Vowel" }, language: "Sanskrit", status: "New" },
  { id: 40104, text: "ई", lemma: "ī", gloss: "ī (long)", morphology: { part: "Letter", type: "Vowel" }, language: "Sanskrit", status: "New" },
  { id: 40105, text: "क", lemma: "ka", gloss: "ka", morphology: { part: "Letter", type: "Consonant" }, language: "Sanskrit", status: "New" },
  { id: 40106, text: "ख", lemma: "kha", gloss: "kha", morphology: { part: "Letter", type: "Consonant" }, language: "Sanskrit", status: "New" },
];

export const greekBasicVocabTokens = [
  { id: 10201, text: "Χαῖρε", lemma: "χαίρω", gloss: "Greetings", morphology: { part: "Verb", mood: "Imperative" }, language: "Greek", status: "New" },
  { id: 10202, text: "ἀδελφέ", lemma: "ἀδελφός", gloss: "brother", morphology: { part: "Noun", case: "Vocative" }, language: "Greek", status: "New" },
  { id: 10203, text: "πῶς", lemma: "πῶς", gloss: "how", morphology: { part: "Adverb", type: "Interrogative" }, language: "Greek", status: "Seen Once" },
  { id: 10204, text: "ἔχεις;", lemma: "ἔχω", gloss: "are you? (do you have)", morphology: { part: "Verb", tense: "Present", mood: "Indicative" }, language: "Greek", status: "New" },
];

export const hebrewBasicVocabTokens = [
  { id: 20201, text: "שָׁלוֹם", lemma: "שָׁלוֹם", gloss: "Peace / Hello", morphology: { part: "Noun", gender: "Masculine" }, language: "Hebrew", status: "New" },
  { id: 20202, text: "אָח", lemma: "אָח", gloss: "brother", morphology: { part: "Noun", gender: "Masculine" }, language: "Hebrew", status: "New" },
  { id: 20203, text: "מָה", lemma: "מָה", gloss: "what", morphology: { part: "Pronoun", type: "Interrogative" }, language: "Hebrew", status: "New" },
  { id: 20204, text: "שְּׁלוֹמְךָ", lemma: "שָׁלוֹם", gloss: "is your peace?", morphology: { part: "Noun", suffix: "2ms" }, language: "Hebrew", status: "New" },
];

export const egyptianBasicVocabTokens = [
  { id: 30201, text: "𓊵𓏏𓊪", lemma: "ḥtp", gloss: "offering/peace", morphology: { part: "Noun" }, language: "Egyptian", status: "Familiar" },
  { id: 30202, text: "𓂧𓏭𓇓𓏏𓈖", lemma: "di nsw", gloss: "given by the king", morphology: { part: "Phrase" }, language: "Egyptian", status: "New" },
  { id: 30203, text: "𓁹", lemma: "iri", gloss: "to do/make", morphology: { part: "Verb" }, language: "Egyptian", status: "New" },
];

export const sanskritBasicVocabTokens = [
  { id: 40201, text: "नमस्ते", lemma: "नमस्", gloss: "Salutations to you", morphology: { part: "Phrase" }, language: "Sanskrit", status: "New" },
  { id: 40202, text: "मित्र", lemma: "मित्र", gloss: "friend", morphology: { part: "Noun", case: "Vocative" }, language: "Sanskrit", status: "Familiar" },
  { id: 40203, text: "कुशलम्", lemma: "कुशल", gloss: "well-being", morphology: { part: "Noun", case: "Nominative" }, language: "Sanskrit", status: "Seen Once" },
  { id: 40204, text: "अस्ति", lemma: "अस्", gloss: "is", morphology: { part: "Verb", tense: "Present" }, language: "Sanskrit", status: "Known" },
];

export const koineGreekAlphabetTokens = [
  { id: 60101, text: "Α α", lemma: "Alpha", gloss: "[a] as in father", morphology: { part: "Letter", type: "Vowel" }, language: "Koine Greek", status: "New" },
  { id: 60102, text: "Β β", lemma: "Beta", gloss: "[v] (Koine shift)", morphology: { part: "Letter", type: "Consonant" }, language: "Koine Greek", status: "New" },
  { id: 60103, text: "Γ γ", lemma: "Gamma", gloss: "[gh] voiced velar fricative", morphology: { part: "Letter", type: "Consonant" }, language: "Koine Greek", status: "New" },
  { id: 60104, text: "Δ δ", lemma: "Delta", gloss: "[dh] as in then", morphology: { part: "Letter", type: "Consonant" }, language: "Koine Greek", status: "New" },
];

export const koineGreekBasicVocabTokens = [
  { id: 60201, text: "χάρις", lemma: "χάρις", gloss: "grace", morphology: { part: "Noun", case: "Nominative", gender: "Feminine" }, language: "Koine Greek", status: "New" },
  { id: 60202, text: "καὶ", lemma: "καί", gloss: "and", morphology: { part: "Conjunction" }, language: "Koine Greek", status: "Known" },
  { id: 60203, text: "εἰρήνη", lemma: "εἰρήνη", gloss: "peace", morphology: { part: "Noun", case: "Nominative", gender: "Feminine" }, language: "Koine Greek", status: "New" },
];

export const aramaicAlphabetTokens = [
  { id: 70101, text: "א", lemma: "Alaph", gloss: "Silent", morphology: { part: "Letter", type: "Consonant" }, language: "Aramaic", status: "New" },
  { id: 70102, text: "ב", lemma: "Beth", gloss: "[b] or [v]", morphology: { part: "Letter", type: "Consonant" }, language: "Aramaic", status: "New" },
  { id: 70103, text: "ג", lemma: "Gamal", gloss: "[g] or [gh]", morphology: { part: "Letter", type: "Consonant" }, language: "Aramaic", status: "New" },
  { id: 70104, text: "ד", lemma: "Dalath", gloss: "[d] or [dh]", morphology: { part: "Letter", type: "Consonant" }, language: "Aramaic", status: "New" },
];

export const aramaicBasicVocabTokens = [
  { id: 70201, text: "שְׁלָם", lemma: "שְׁלָם", gloss: "peace", morphology: { part: "Noun", gender: "Masculine" }, language: "Aramaic", status: "New" },
  { id: 70202, text: "עֲלֵיכוֹן", lemma: "עַל", gloss: "upon you", morphology: { part: "Preposition", suffix: "2mp" }, language: "Aramaic", status: "New" },
  { id: 70203, text: "מָרָא", lemma: "מָרֵא", gloss: "Lord", morphology: { part: "Noun", state: "Emphatic" }, language: "Aramaic", status: "New" },
];

export const copticAlphabetTokens = [
  { id: 80101, text: "Ⲁ", lemma: "Alpha", gloss: "[a]", morphology: { part: "Letter" }, language: "Coptic", status: "New" },
  { id: 80102, text: "Ⲃ", lemma: "Vida", gloss: "[v] / [b]", morphology: { part: "Letter" }, language: "Coptic", status: "New" },
  { id: 80103, text: "Ⲅ", lemma: "Gamma", gloss: "[g]", morphology: { part: "Letter" }, language: "Coptic", status: "New" },
  { id: 80104, text: "Ⲇ", lemma: "Dalda", gloss: "[d]", morphology: { part: "Letter" }, language: "Coptic", status: "New" },
  { id: 80105, text: "Ϣ", lemma: "Shai", gloss: "[sh]", morphology: { part: "Letter" }, language: "Coptic", status: "New" },
  { id: 80106, text: "Ϥ", lemma: "Fai", gloss: "[f]", morphology: { part: "Letter" }, language: "Coptic", status: "New" },
];

export const copticBasicVocabTokens = [
  { id: 80201, text: "ⲛⲟⲩⲧⲉ", lemma: "noute", gloss: "God", morphology: { part: "Noun", gender: "Masculine" }, language: "Coptic", status: "New" },
  { id: 80202, text: "ⲡⲉ", lemma: "pe", gloss: "the", morphology: { part: "Article", gender: "Masculine" }, language: "Coptic", status: "New" },
  { id: 80203, text: "ⲣⲱⲙⲉ", lemma: "rōme", gloss: "man / human", morphology: { part: "Noun", gender: "Masculine" }, language: "Coptic", status: "Seen Once" },
  { id: 80204, text: "ⲟⲩϫⲁⲓ", lemma: "oujai", gloss: "salvation / health", morphology: { part: "Noun" }, language: "Coptic", status: "New" },
];

export const akkadianAlphabetTokens = [
  { id: 90101, text: "𒀀", lemma: "A", gloss: "Syllable: a", morphology: { part: "Sign", type: "Vowel" }, language: "Akkadian", status: "New" },
  { id: 90102, text: "𒁀", lemma: "BA", gloss: "Syllable: ba", morphology: { part: "Sign", type: "CV" }, language: "Akkadian", status: "New" },
  { id: 90103, text: "𒀊", lemma: "AB", gloss: "Syllable: ab", morphology: { part: "Sign", type: "VC" }, language: "Akkadian", status: "New" },
  { id: 90104, text: "𒂍", lemma: "É", gloss: "Logogram: house", morphology: { part: "Sign", type: "Logogram" }, language: "Akkadian", status: "New" },
  { id: 90105, text: "𒀭", lemma: "AN", gloss: "Determinative/Logogram: god/sky", morphology: { part: "Sign", type: "Determinative" }, language: "Akkadian", status: "New" },
];

export const akkadianBasicVocabTokens = [
  { id: 90201, text: "𒀀𒉿𒈝", lemma: "awīlum", gloss: "man", morphology: { part: "Noun", case: "Nominative", gender: "Masculine" }, language: "Akkadian", status: "New" },
  { id: 90202, text: "𒈗", lemma: "šarrum", gloss: "king", morphology: { part: "Noun", case: "Nominative", gender: "Masculine" }, language: "Akkadian", status: "New" },
  { id: 90203, text: "𒂍", lemma: "bītum", gloss: "house", morphology: { part: "Noun", case: "Nominative", gender: "Masculine" }, language: "Akkadian", status: "New" },
  { id: 90204, text: "𒄿𒁷", lemma: "nadānum", gloss: "he gave", morphology: { part: "Verb", tense: "Preterite", person: "3cs" }, language: "Akkadian", status: "New" },
];

export const latinTokens = [
  { id: 50301, text: "Arma", lemma: "arma", gloss: "arms", morphology: { part: "Noun", case: "Accusative" }, language: "Latin", status: "New" },
  { id: 50302, text: "virumque", lemma: "vir", gloss: "and the man", morphology: { part: "Noun", case: "Accusative" }, language: "Latin", status: "Known" },
  { id: 50303, text: "cano", lemma: "cano", gloss: "I sing", morphology: { part: "Verb", tense: "Present", person: "1st" }, language: "Latin", status: "New" },
  { id: 50304, text: "Troiae", lemma: "Troia", gloss: "of Troy", morphology: { part: "Noun", case: "Genitive" }, language: "Latin", status: "Familiar" },
  { id: 50305, text: "qui", lemma: "qui", gloss: "who", morphology: { part: "Pronoun", case: "Nominative" }, language: "Latin", status: "New" },
  { id: 50306, text: "primus", lemma: "primus", gloss: "first", morphology: { part: "Adjective", case: "Nominative" }, language: "Latin", status: "New" },
  { id: 50307, text: "ab", lemma: "ab", gloss: "from", morphology: { part: "Preposition" }, language: "Latin", status: "Known" },
  { id: 50308, text: "oris", lemma: "ora", gloss: "shores", morphology: { part: "Noun", case: "Ablative" }, language: "Latin", status: "New" },
];

export const nextLatinTokens = [
  { id: 50309, text: "Italiam,", lemma: "Italia", gloss: "to Italy", morphology: { part: "Noun", case: "Accusative" }, language: "Latin", status: "New" },
  { id: 50310, text: "fato", lemma: "fatum", gloss: "by fate", morphology: { part: "Noun", case: "Ablative" }, language: "Latin", status: "Familiar" },
  { id: 50311, text: "profugus", lemma: "profugus", gloss: "exiled", morphology: { part: "Adjective", case: "Nominative" }, language: "Latin", status: "New" },
  { id: 50312, text: "Laviniaque", lemma: "Lavinius", gloss: "and Lavinian", morphology: { part: "Adjective", case: "Accusative" }, language: "Latin", status: "New" },
  { id: 50313, text: "venit", lemma: "venio", gloss: "came", morphology: { part: "Verb", tense: "Perfect", person: "3rd" }, language: "Latin", status: "Known" },
  { id: 50314, text: "litora,", lemma: "litus", gloss: "shores", morphology: { part: "Noun", case: "Accusative" }, language: "Latin", status: "New" },
];

export const koineGreekTokens = [
  { id: 60301, text: "Παῦλος", lemma: "Παῦλος", gloss: "Paul", morphology: { part: "Noun", case: "Nominative" }, language: "Koine Greek", status: "New" },
  { id: 60302, text: "δοῦλος", lemma: "δοῦλος", gloss: "servant", morphology: { part: "Noun", case: "Nominative" }, language: "Koine Greek", status: "Familiar" },
  { id: 60303, text: "Χριστοῦ", lemma: "Χριστός", gloss: "of Christ", morphology: { part: "Noun", case: "Genitive" }, language: "Koine Greek", status: "Known" },
  { id: 60304, text: "Ἰησοῦ", lemma: "Ἰησοῦς", gloss: "Jesus", morphology: { part: "Noun", case: "Genitive" }, language: "Koine Greek", status: "Known" },
];

export const nextKoineGreekTokens = [
  { id: 60305, text: "κλητὸς", lemma: "κλητός", gloss: "called", morphology: { part: "Adjective", case: "Nominative" }, language: "Koine Greek", status: "New" },
  { id: 60306, text: "ἀπόστολος", lemma: "ἀπόστολος", gloss: "apostle", morphology: { part: "Noun", case: "Nominative" }, language: "Koine Greek", status: "Familiar" },
  { id: 60307, text: "ἀφωρισμένος", lemma: "ἀφορίζω", gloss: "set apart", morphology: { part: "Participle", case: "Nominative" }, language: "Koine Greek", status: "New" },
  { id: 60308, text: "εἰς", lemma: "εἰς", gloss: "unto", morphology: { part: "Preposition" }, language: "Koine Greek", status: "Known" },
  { id: 60309, text: "εὐαγγέλιον", lemma: "εὐαγγέλιον", gloss: "gospel", morphology: { part: "Noun", case: "Accusative" }, language: "Koine Greek", status: "Familiar" },
  { id: 60310, text: "θεοῦ", lemma: "θεός", gloss: "of God", morphology: { part: "Noun", case: "Genitive" }, language: "Koine Greek", status: "Known" },
];

export const aramaicTokens = [
  { id: 70301, text: "בֵּאדַיִן", lemma: "אֱדַיִן", gloss: "Then", morphology: { part: "Adverb" }, language: "Aramaic", status: "New" },
  { id: 70302, text: "דָּנִיֵּאל", lemma: "דָּנִיֵּאל", gloss: "Daniel", morphology: { part: "Noun" }, language: "Aramaic", status: "Known" },
  { id: 70303, text: "לְמַלְכָּא", lemma: "מֶלֶךְ", gloss: "to the king", morphology: { part: "Noun", state: "Emphatic" }, language: "Aramaic", status: "Familiar" },
  { id: 70304, text: "מַלִּל", lemma: "מְלַל", gloss: "spoke", morphology: { part: "Verb" }, language: "Aramaic", status: "New" },
];

export const nextAramaicTokens = [
  { id: 70305, text: "מַלְכָּא", lemma: "מֶלֶךְ", gloss: "O king,", morphology: { part: "Noun", state: "Emphatic" }, language: "Aramaic", status: "Familiar" },
  { id: 70306, text: "לְעָלְמִין", lemma: "עָלַם", gloss: "forever", morphology: { part: "Noun", state: "Absolute" }, language: "Aramaic", status: "New" },
  { id: 70307, text: "חֱיִי", lemma: "חֲיָא", gloss: "live!", morphology: { part: "Verb" }, language: "Aramaic", status: "New" },
];

export const copticTokens = [
  { id: 80301, text: "ⲡⲉϫⲁϥ", lemma: "peja", gloss: "He said:", morphology: { part: "Verb" }, language: "Coptic", status: "New" },
  { id: 80302, text: "ⲛϭⲓ", lemma: "nci", gloss: "[subject marker]", morphology: { part: "Particle" }, language: "Coptic", status: "Familiar" },
  { id: 80303, text: "ⲓⲏⲥⲟⲩⲥ", lemma: "Iēsous", gloss: "Jesus", morphology: { part: "Noun" }, language: "Coptic", status: "Known" },
];

export const nextCopticTokens = [
  { id: 80304, text: "ϫⲉ", lemma: "je", gloss: "that [quote]", morphology: { part: "Conjunction" }, language: "Coptic", status: "New" },
  { id: 80305, text: "ⲡⲉⲧⲛⲁϩⲉ", lemma: "he", gloss: "He who will find", morphology: { part: "Verb" }, language: "Coptic", status: "New" },
  { id: 80306, text: "ⲉⲑⲉⲣⲙⲏⲛⲉⲓⲁ", lemma: "hermēneia", gloss: "the interpretation", morphology: { part: "Noun" }, language: "Coptic", status: "New" },
  { id: 80307, text: "ⲛⲛⲉⲓϣⲁϫⲉ", lemma: "shaje", gloss: "of these words", morphology: { part: "Noun" }, language: "Coptic", status: "Familiar" },
  { id: 80308, text: "ϥⲛⲁϫⲓϯⲡⲉ", lemma: "tpe", gloss: "he will not taste", morphology: { part: "Verb" }, language: "Coptic", status: "New" },
  { id: 80309, text: "ⲙⲡⲙⲟⲩ", lemma: "mou", gloss: "death.", morphology: { part: "Noun" }, language: "Coptic", status: "Known" },
];

export const akkadianTokens = [
  { id: 90301, text: "𒊭", lemma: "ša", gloss: "He who", morphology: { part: "Pronoun" }, language: "Akkadian", status: "New" },
  { id: 90302, text: "𒈾𒀝𒁀", lemma: "nagbu", gloss: "the deep", morphology: { part: "Noun", case: "Accusative" }, language: "Akkadian", status: "New" },
  { id: 90303, text: "𒄿𒈬𒊒", lemma: "amārum", gloss: "saw", morphology: { part: "Verb", tense: "Preterite" }, language: "Akkadian", status: "Familiar" },
];

export const nextAkkadianTokens = [
  { id: 90304, text: "𒅖𒁲", lemma: "išdu", gloss: "the foundation", morphology: { part: "Noun" }, language: "Akkadian", status: "New" },
  { id: 90305, text: "𒈠𒀀𒋾", lemma: "mātum", gloss: "of the land", morphology: { part: "Noun", case: "Genitive" }, language: "Akkadian", status: "Known" },
  { id: 90306, text: "𒄿𒁲", lemma: "edûm", gloss: "he knew", morphology: { part: "Verb" }, language: "Akkadian", status: "New" },
  { id: 90307, text: "𒅗𒆷𒈠", lemma: "kalāma", gloss: "everything", morphology: { part: "Noun" }, language: "Akkadian", status: "New" },
];

export const latinAlphabetTokens = [
  { id: 50101, text: "A a", lemma: "a", gloss: "[a] as in father", morphology: { part: "Letter", type: "Vowel" }, language: "Latin", status: "New" },
  { id: 50102, text: "B b", lemma: "b", gloss: "[b]", morphology: { part: "Letter", type: "Consonant" }, language: "Latin", status: "New" },
  { id: 50103, text: "C c", lemma: "c", gloss: "[k] always", morphology: { part: "Letter", type: "Consonant" }, language: "Latin", status: "New" },
  { id: 50104, text: "V v", lemma: "v", gloss: "[w] as in win", morphology: { part: "Letter", type: "Consonant" }, language: "Latin", status: "New" },
];

export const latinBasicVocabTokens = [
  { id: 50201, text: "Gallia", lemma: "Gallia", gloss: "Gaul", morphology: { part: "Noun", case: "Nominative", gender: "Feminine" }, language: "Latin", status: "New" },
  { id: 50202, text: "est", lemma: "sum", gloss: "is", morphology: { part: "Verb", tense: "Present", mood: "Indicative", person: "3rd" }, language: "Latin", status: "Known" },
  { id: 50203, text: "omnis", lemma: "omnis", gloss: "all (as a whole)", morphology: { part: "Adjective", case: "Nominative", gender: "Feminine" }, language: "Latin", status: "New" },
  { id: 50204, text: "divisa", lemma: "divido", gloss: "divided", morphology: { part: "Participle", case: "Nominative", gender: "Feminine" }, language: "Latin", status: "New" },
  { id: 50205, text: "in", lemma: "in", gloss: "into", morphology: { part: "Preposition" }, language: "Latin", status: "Known" },
  { id: 50206, text: "partes", lemma: "pars", gloss: "parts", morphology: { part: "Noun", case: "Accusative", gender: "Feminine", number: "Plural" }, language: "Latin", status: "New" },
  { id: 50207, text: "tres", lemma: "tres", gloss: "three", morphology: { part: "Numeral", case: "Accusative" }, language: "Latin", status: "New" },
];
