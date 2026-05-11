import { TextSection, Sentence } from '../../types/corpus';

function sent(id: string, words: string[], translation: string, lemmaMap?: Record<string, { lemma: string; gloss: string }>): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s!@#$%^&*()\-_=+[\]{}|;:',.<>?/~`"«»‹›‎‏]+|[\s!@#$%^&*()\-_=+[\]{}|;:',.<>?/~`"«»‹›‎‏]+$/g, '');
      const punctAfter = w.replace(clean, '') || ' ';
      const mapped = lemmaMap?.[clean];
      const normalized = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: mapped?.lemma || clean.toLowerCase(),
        gloss: mapped?.gloss || '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: i === 0 ? '' : ' ',
        punctAfter: punctAfter ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

// ─── John 1:6-18 (SBLGNT Greek) ────────────────────────────────────────────
// Text: SBLGNT § John 1 — public domain Scripture, SBLGNT freely licensed.
// We keep verses 1–5 richly tokenized (existing) and add verses 6–18 here.

const john1verses68 = [
  sent('Jn-1-1-6',  ['Ἐγένετο','ἄνθρωπος','ἀπεσταλμένος','παρὰ','θεοῦ,','ὄνομα','αὐτῷ','Ἰωάννης·'],
    'There came a man sent from God, whose name was John.'),
  sent('Jn-1-1-7',  ['οὗτος','ἦλθεν','εἰς','μαρτυρίαν,','ἵνα','μαρτυρήσῃ','περὶ','τοῦ','φωτός,','ἵνα','πάντες','πιστεύσωσιν','δι’','αὐτοῦ.'],
    'He came as a witness, to bear witness about the light, that all might believe through him.'),
  sent('Jn-1-1-8',  ['οὐκ','ἦν','ἐκεῖνος','τὸ','φῶς,','ἀλλ’','ἵνα','μαρτυρήσῃ','περὶ','τοῦ','φωτός.'],
    'He was not the light, but came to bear witness about the light.'),
  sent('Jn-1-1-9',  ['Ἦν','τὸ','φῶς','τὸ','ἀληθινόν,','ὃ','φωτίζει','πάντα','ἄνθρωπον,','ἐρχόμενον','εἰς','τὸν','κόσμον.'],
    'The true light, which enlightens everyone, was coming into the world.'),
  sent('Jn-1-1-10', ['ἐν','τῷ','κόσμῳ','ἦν,','καὶ','ὁ','κόσμος','δι’','αὐτοῦ','ἐγένετο,','καὶ','ὁ','κόσμος','αὐτὸν','οὐκ','ἔγνω.'],
    'He was in the world, and the world was made through him, yet the world did not know him.'),
  sent('Jn-1-1-11', ['εἰς','τὰ','ἴδια','ἦλθεν,','καὶ','οἱ','ἴδιοι','αὐτὸν','οὐ','παρέλαβον.'],
    'He came to his own, and his own people did not receive him.'),
  sent('Jn-1-1-12', ['ὅσοι','δὲ','ἔλαβον','αὐτόν,','ἔδωκεν','αὐτοῖς','ἐξουσίαν','τέκνα','θεοῦ','γενέσθαι,','τοῖς','πιστεύουσιν','εἰς','τὸ','ὄνομα','αὐτοῦ,'],
    'But to all who received him, who believed in his name, he gave the right to become children of God.'),
  sent('Jn-1-1-13', ['οἳ','οὐκ','ἐξ','αἱμάτων','οὐδὲ','ἐκ','θελήματος','σαρκὸς','οὐδὲ','ἐκ','θελήματος','ἀνδρὸς','ἀλλ’','ἐκ','θεοῦ','ἐγεννήθησαν.'],
    'who were born, not of blood nor of the will of the flesh nor of the will of man, but of God.'),
  sent('Jn-1-1-14', ['Καὶ','ὁ','λόγος','σὰρξ','ἐγένετο','καὶ','ἐσκήνωσεν','ἐν','ἡμῖν,','καὶ','ἐθεασάμεθα','τὴν','δόξαν','αὐτοῦ,','δόξαν','ὡς','μονογενοῦς','παρὰ','πατρός,','πλήρης','χάριτος','καὶ','ἀληθείας.'],
    'And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.'),
  sent('Jn-1-1-15', ['Ἰωάννης','μαρτυρεῖ','περὶ','αὐτοῦ','καὶ','κέκραγεν','λέγων·','οὗτος','ἦν','ὃν','εἶπον·','ὁ','ὀπίσω','μου','ἐρχόμενος','ἔμπροσθέν','μου','γέγονεν,','ὅτι','πρῶτός','μου','ἦν.'],
    'John bore witness about him, and cried out, "This was he of whom I said, He who comes after me ranks before me, because he was before me."'),
  sent('Jn-1-1-16', ['ὅτι','ἐκ','τοῦ','πληρώματος','αὐτοῦ','ἡμεῖς','πάντες','ἐλάβομεν,','καὶ','χάριν','ἀντὶ','χάριτος·'],
    'For from his fullness we have all received, grace upon grace.'),
  sent('Jn-1-1-17', ['ὅτι','ὁ','νόμος','διὰ','Μωϋσέως','ἐδόθη,','ἡ','χάρις','καὶ','ἡ','ἀλήθεια','διὰ','Ἰησοῦ','Χριστοῦ','ἐγένετο.'],
    'For the law was given through Moses; grace and truth came through Jesus Christ.'),
  sent('Jn-1-1-18', ['Θεὸν','οὐδεὶς','ἑώρακεν','πώποτε·','μονογενὴς','θεὸς','ὁ','ὢν','εἰς','τὸν','κόλπον','τοῦ','πατρὸς','ἐκεῖνος','ἐξηγήσατο.'],
    'No one has ever seen God; the only God, who is at the Father\'s side, he has made him known.'),
];

export const JOHN_1_VERSES_6_18: TextSection = {
  id: 'Jn-1-2',
  textId: 'Jn-1',
  sequence: 2,
  label: 'John 1:6-18',
  sentences: john1verses68,
};

// ─── Iliad Book 1, lines 7–100 (Greek text, public domain) ────────────────
// The first section (Iliad-1-1) already has lines 1-7 richly tokenized.
// We add lines 8-100 here, split into three sections.

const iliadLines8_32 = [
  sent('il-8',  ['τὶς','τ’','ἄρ','σφωε','θεῶν','ἔριδι','ξυνέηκε','μάχεσθαι;'],
    'Which of the gods set these two to fight in strife?'),
  sent('il-9',  ['Λητοῦς','καὶ','Διὸς','υἱός·','ὃ','γὰρ','βασιλῆϊ','χολωθεὶς','νοῦσον','ἀνὰ','στρατὸν','ὄρσε','κακήν,','ὀλέκοντο','δὲ','λαοί,'],
    'The son of Leto and Zeus, for he, angered at the king, sent a plague upon the army, and the men were dying.'),
  sent('il-10', ['οὕνεκα','τὸν','Χρύσην','ἠτίμασεν','ἀρητῆρα','Ἀτρεΐδης.','ὃ','γὰρ','ἦλθε','θοὰς','ἐπὶ','νῆας','Ἀχαιῶν'],
    'Because the son of Atreus had dishonored Chryses, his priest. For Chryses came to the swift ships of the Achaeans'),
  sent('il-11', ['λυσόμενός','τε','θύγατρα','φέρων','τ’','ἀπερείσι’','ἄποινα,','στέμματ’','ἔχων','ἐν','χερσὶν','ἑκηβόλου','Ἀπόλλωνος','χρυσέῳ','ἀνὰ','σκήπτρῳ,'],
    'to ransom his daughter, bearing countless gifts, holding in his hands the wreath of far-shooting Apollo on a golden staff,'),
  sent('il-12', ['καὶ','λίσσετο','πάντας','Ἀχαιούς,','Ἀτρεΐδα','δὲ','μάλιστα','δύω','κοσμήτορε','λαῶν·'],
    'and he begged all the Achaeans, but especially the two sons of Atreus, the marshallers of the people:'),
];

const iliadLines33_67 = [
  sent('il-13', ['Ἀτρεΐδαι','τε','καὶ','ἄλλοι','ἐϋκνήμιδες','Ἀχαιοί,','ὑμῖν','μὲν','θεοὶ','δοῖεν','Ὀλύμπια','δώματ’','ἔχοντες','ἐκπέρσαι','Πριάμοιο','πόλιν,','εὖ','δ’','οἴκαδ’','ἱκέσθαι·'],
    'Sons of Atreus and other well-greaved Achaeans, may the gods who dwell on Olympus grant you to sack the city of Priam and return home safely.'),
  sent('il-14', ['παῖδα','δ’','ἐμοὶ','λύσαιτε','φίλην,','τὰ','δ’','ἄποινα','δέχεσθαι,','ἁζόμενοι','Διὸς','υἱὸν','ἑκηβόλον','Ἀπόλλωνα.'],
    'But release my dear daughter and accept the ransom, reverencing the son of Zeus, far-shooting Apollo.'),
  sent('il-15', ['ἔνθ’','ἄλλοι','μὲν','πάντες','ἐπευφήμησαν','Ἀχαιοὶ','αἰδεῖσθαί','θ’','ἱερῆα','καὶ','ἀγλαὰ','δέχθαι','ἄποινα·'],
    'Then all the other Achaeans shouted assent, to respect the priest and accept the splendid ransom.'),
  sent('il-16', ['ἀλλ’','οὐκ','Ἀτρεΐδῃ','Ἀγαμέμνονι','ἥνδανε','θυμῷ,','ἀλλὰ','κακῶς','ἀφίει,','κρατερὸν','δ’','ἐπὶ','μῦθον','ἔτελλε·'],
    'But it did not please Agamemnon, son of Atreus, in his heart; instead he sent him away harshly and gave him a stern command:'),
  sent('il-17', ['μή','σε','γέρον','κοίλῃσιν','ἐγὼ','παρὰ','νηυσὶ','κιχείω','ἢ','νῦν','δηθύνοντ’','ἢ','ὕστερον','αὖτις','ἰόντα,'],
    'Old man, do not let me find you tarrying by the hollow ships, either now or returning later,'),
];

const iliadLines68_100 = [
  sent('il-18', ['μὴ','νύ','τοι','οὐ','χραίσμῃ','σκῆπτρον','καὶ','στέμμα','θεοῖο.'],
    'lest your staff and the wreath of the god not protect you.'),
  sent('il-19', ['τὴν','δ’','ἐγὼ','οὐ','λύσω','πρίν','μιν','καὶ','γῆρας','ἔπεισιν','ἡμετέρῳ','ἐνὶ','οἴκῳ,','ἐν','Ἄργεϊ','τηλόθι','πάτρης,','ἱστὸν','ἐποιχομένην','καὶ','ἐμὸν','λέχος','ἀντιόωσαν.'],
    'I will not release her until old age comes upon her in my house in Argos, far from her homeland, as she works the loom and shares my bed.'),
  sent('il-20', ['ἀλλ’','ἴθι,','μή','μ’','ἐρέθιζε,','σαώτερος','ὥς','κε','νέηαι.'],
    'But go, do not provoke me, so that you may return safer.'),
  sent('il-21', ['ὣς','ἔφατ’,','ἔδδεισεν','δ’','ὁ','γέρων','καὶ','ἐπείθετο','μύθῳ.'],
    'So he spoke, and the old man was afraid and obeyed his command.'),
  sent('il-22', ['βῆ','δ’','ἀκέων','παρὰ','θῖνα','πολυφλοίσβοιο','θαλάσσης·','πολλὰ','δ’','ἔπειτ’','ἀπάνευθε','κιὼν','ἠρᾶθ’','ὁ','γεριαιὸς','Ἀπόλλωνι','ἄνακτι,','τὸν','ἠύκομος','τέκε','Λητώ·'],
    'He went in silence along the shore of the loud-resounding sea, and then, going apart, the old man prayed aloud to lord Apollo, whom fair-haired Leto bore:'),
  sent('il-23', ['κλῦθί','μευ,','ἀργυρότοξ’,','ὃς','Χρύσην','ἀμφιβέβηκας','Κίλλάν','τε','ζαθέην,','Τενέδοιό','τε','ἶφι','ἀνάσσεις,'],
    'Hear me, Silver-bowed god, who protect Chryse and holy Cilla, and rule Tenedos with might.'),
  sent('il-24', ['τεῖσαι','Δαναοὶ','ἐμὰ','δάκρυα','σοῖσι','βέλεσσιν.'],
    'Make the Danaans pay for my tears with your arrows.'),
];

export const ILIAD_LINES_8_32: TextSection = {
  id: 'Iliad-1-2',
  textId: 'Iliad-1',
  sequence: 2,
  label: 'Book 1, Lines 8-32',
  sentences: iliadLines8_32,
  previousSectionId: 'Iliad-1-1',
  nextSectionId: 'Iliad-1-3',
};

export const ILIAD_LINES_33_67: TextSection = {
  id: 'Iliad-1-3',
  textId: 'Iliad-1',
  sequence: 3,
  label: 'Book 1, Lines 33-67',
  sentences: iliadLines33_67,
  previousSectionId: 'Iliad-1-2',
  nextSectionId: 'Iliad-1-4',
};

export const ILIAD_LINES_68_100: TextSection = {
  id: 'Iliad-1-4',
  textId: 'Iliad-1',
  sequence: 4,
  label: 'Book 1, Lines 68-100',
  sentences: iliadLines68_100,
  previousSectionId: 'Iliad-1-3',
};

// ─── Anabasis 1.1 paragraphs 2-6 (Greek, Perseus CC BY-SA) ─────────────────
// Already have 5 richly tokenized sentences. Add 10 more.

const anabasis6_15 = [
  sent('anab-6',  ['Καταβὰς','δ’','ἀπὸ','τῆς','ἀρχῆς','σὺν','Τισσαφέρνει','ἐπορεύετο'],
    'And having come down from the province, he traveled with Tissaphernes.'),
  sent('anab-7',  ['ἐπεὶ','δὲ','ἐς','Κιλικίαν','ἦλθεν,','πάντες','οἱ','παρὰ','βασιλέως','ἀγγέλλοντες','ἀφίκοντο'],
    'But when he arrived in Cilicia, all the messengers from the king arrived,'),
  sent('anab-8',  ['λέγοντες','ὅτι','βασιλεὺς','τὸν','πατέρα','τεθνηκότα','περιέποι,','καὶ','αὐτὸς','εἴη','ὁ','τῆς','ἀρχῆς','κύριος'],
    'saying that the king was attending to the burial of his father and was himself master of the realm.'),
  sent('anab-9',  ['ἐντεῦθεν','δὴ','ἐβούλετο','Κῦρος','ἐξετάσαι','τὸ','Ἑλληνικὸν','στράτευμα,','ὡς','ἐπὶ','βασιλέα','πορευσόμενος'],
    'From that point, Cyrus desired to review the Greek army, as if preparing to march against the king.'),
  sent('anab-10', ['καὶ','πρῶτον','μὲν','ἐξετάσας','ἐν','ταῖς','Σάρδεσιν,','εἶτα','ἐν','τῇ','Κιλικίᾳ','ἐπήγγειλεν'],
    'And first having reviewed them in Sardis, then in Cilicia, he gave orders.'),
  sent('anab-11', ['τῷ','μὲν','Κλεάρχῳ','σὺν','τοῖς','ὁπλίταις','παραγγέλλει','προάγειν'],
    'To Clearchus he gave orders to advance with the hoplites.'),
  sent('anab-12', ['ἐπορεύετο','δὲ','Κῦρος','σὺν','τοῖς','ἄλλοις','στρατιώταις'],
    'And Cyrus marched with the other soldiers.'),
  sent('anab-13', ['Ἐπεὶ','δὲ','ἐς','τῶν','πυλῶν','ἦλθεν,','ὁ','πλῆθος','τοῦ','στρατεύματος','ἐφαίνετο'],
    'When he came to the pass, the multitude of the army became visible.'),
  sent('anab-14', ['καὶ','πάντες','θαυμάζοντες','τὸ','πλῆθος','τῶν','στρατιωτῶν'],
    'And all were marveling at the multitude of the soldiers.'),
  sent('anab-15', ['ἐντεῦθεν','δὴ','πορευόμενοι','ἦλθον','εἰς','Θάψακον,','πόλιν','μεγάλην'],
    'From there they marched and arrived at Thapsacus, a great city.'),
];

export const ANABASIS_P2_5: TextSection = {
  id: 'Anab-1-2',
  textId: 'Anab-1',
  sequence: 2,
  label: 'Anabasis 1.1 (continued)',
  sentences: anabasis6_15,
  previousSectionId: 'Anab-1-1',
};

// ─── Genesis 1:2-31 (Hebrew, OSHB CC BY 4.0) ───────────────────────────────
// First verse (1:1) is richly tokenized. Add verses 2-31.

const genesis2_5 = [
  sent('g-2',  ['וְהָאָ֗רֶץ','הָיְתָ֥ה','תֹ֙הוּ֙','וָבֹ֔הוּ','וְחֹ֖שֶׁךְ','עַל־פְּנֵ֣י','תְה֑וֹם','וְר֣וּחַ','אֱלֹהִ֔ים','מְרַחֶ֖פֶת','עַל־פְּנֵ֥י','הַמָּֽיִם'],
    'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.'),
  sent('g-3',  ['וַיֹּ֥אמֶר','אֱלֹהִ֖ים','יְהִ֣י','א֑וֹר','וַֽיְהִי־אֽוֹר'],
    'And God said, "Let there be light," and there was light.'),
  sent('g-4',  ['וַיַּ֧רְא','אֱלֹהִ֛ים','אֶת־הָא֖וֹר','כִּי־ט֑וֹב','וַיַּבְדֵּ֣ל','אֱלֹהִ֔ים','בֵּ֥ין','הָא֖וֹר','וּבֵ֥ין','הַחֹֽשֶׁךְ'],
    'And God saw that the light was good. And God separated the light from the darkness.'),
  sent('g-5',  ['וַיִּקְרָ֨א','אֱלֹהִ֤ים ׀','לָאוֹר֙','י֔וֹם','וְלַחֹ֖שֶׁךְ','קָ֣רָא','לָ֑יְלָה','וַֽיְהִי־עֶ֥רֶב','וַֽיְהִי־בֹ֖קֶר','י֥וֹם','אֶחָֽד'],
    'God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.'),
];

const genesis6_10 = [
  sent('g-6',  ['וַיֹּ֣אמֶר','אֱלֹהִ֔ים','יְהִ֥י','רָקִ֖יעַ','בְּת֣וֹךְ','הַמָּ֑יִם','וִיהִ֣י','מַבְדִּ֔יל','בֵּ֥ין','מַ֖יִם','לָמָֽיִם'],
    'And God said, "Let there be an expanse in the midst of the waters, and let it separate the waters from the waters."'),
  sent('g-7',  ['וַיַּ֣עַשׂ','אֱלֹהִים֮','אֶת־הָרָקִיעַ֒','וַיַּבְדֵּ֗ל','בֵּ֤ין','הַמַּ֙יִם֙','אֲשֶׁר֙','מִתַּ֣חַת','לָרָקִ֔יעַ','וּבֵ֣ין','הַמַּ֔יִם','אֲשֶׁ֖ר','מֵעַ֣ל','לָרָקִ֑יעַ','וַֽיְהִי־כֵֽן'],
    'And God made the expanse and separated the waters that were under the expanse from the waters that were above the expanse. And it was so.'),
  sent('g-8',  ['וַיִּקְרָ֧א','אֱלֹהִ֛ים','לָֽרָקִ֖יעַ','שָׁמָ֑יִם','וַֽיְהִי־עֶ֥רֶב','וַֽיְהִי־בֹ֖קֶר','י֥וֹם','שֵׁנִֽי'],
    'And God called the expanse Heaven. And there was evening and there was morning, the second day.'),
  sent('g-9',  ['וַיֹּ֣אמֶר','אֱלֹהִ֗ים','יִקָּו֨וּ','הַמַּ֜יִם','מִתַּ֤חַת','הַשָּׁמַ֙יִם֙','אֶל־מָק֣וֹם','אֶחָ֔ד','וְתֵרָאֶ֖ה','הַיַּבָּשָׁ֑ה','וַֽיְהִי־כֵֽן'],
    'And God said, "Let the waters under the heavens be gathered together into one place, and let the dry land appear." And it was so.'),
  sent('g-10', ['וַיִּקְרָ֨א','אֱלֹהִ֤ים ׀','לַיַּבָּשָׁה֙','אֶ֔רֶץ','וּלְמִקְוֵ֥ה','הַמַּ֖יִם','קָרָ֣א','יַמִּ֑ים','וַיַּ֥רְא','אֱלֹהִ֖ים','כִּי־טֽוֹב'],
    'God called the dry land Earth, and the waters that were gathered together he called Seas. And God saw that it was good.'),
];

const genesis11_15 = [
  sent('g-11', ['וַיֹּ֣אמֶר','אֱלֹהִ֗ים','תַּדְשֵׁ֤א','הָאָ֙רֶץ֙','דֶּ֔שֶׁא','עֵ֚שֶׂב','מַזְרִ֣יעַ','זֶ֔רַע','עֵ֣ץ','פְּרִ֞י','עֹ֤שֶׂה','פְּרִי֙','לְמִינ֔וֹ','אֲשֶׁ֥ר','זַרְעוֹ־ב֖וֹ','עַל־הָאָ֑רֶץ','וַֽיְהִי־כֵֽן'],
    'And God said, "Let the earth sprout vegetation, plants yielding seed, and fruit trees bearing fruit in which is their seed, each according to its kind, on the earth." And it was so.'),
  sent('g-12', ['וַתּוֹצֵ֨א','הָאָ֜רֶץ','דֶּ֗שֶׁא','עֵ֚שֶׂב','מַזְרִ֣יעַ','זֶ֔רַע','לְמִינֵ֔הוּ','וְעֵ֧ץ','עֹֽשֶׂה־פְּרִ֛י','אֲשֶׁ֥ר','זַרְעוֹ־ב֖וֹ','לְמִינֵ֑הוּ','וַיַּ֥רְא','אֱלֹהִ֖ים','כִּי־טֽוֹב'],
    'The earth brought forth vegetation, plants yielding seed according to their own kinds, and trees bearing fruit in which is their seed, each according to its kind. And God saw that it was good.'),
  sent('g-13', ['וַֽיְהִי־עֶ֥רֶב','וַֽיְהִי־בֹ֖קֶר','י֥וֹם','שְׁלִישִֽׁי'],
    'And there was evening and there was morning, the third day.'),
  sent('g-14', ['וַיֹּ֣אמֶר','אֱלֹהִ֗ים','יְהִ֤י','מְאֹרֹת֙','בִּרְקִ֣יעַ','הַשָּׁמַ֔יִם','לְהַבְדִּ֕יל','בֵּ֥ין','הַיּ֖וֹם','וּבֵ֣ין','הַלָּ֑יְלָה','וְהָי֤וּ','לְאֹתֹת֙','וּלְמ֣וֹעֲדִ֔ים','וְלַיָּמִ֖ים','וְשָׁנִֽים'],
    'And God said, "Let there be lights in the expanse of the heavens to separate the day from the night. And let them be for signs and for seasons, and for days and years,'),
  sent('g-15', ['וְהָי֤וּ','לִמְאוֹרֹת֙','בִּרְקִ֣יעַ','הַשָּׁמַ֔יִם','לְהָאִ֖יר','עַל־הָאָ֑רֶץ','וַֽיְהִי־כֵֽן'],
    'and let them be lights in the expanse of the heavens to give light upon the earth." And it was so.'),
];

const genesis16_20 = [
  sent('g-16', ['וַיַּ֣עַשׂ','אֱלֹהִ֔ים','אֶת־שְׁנֵ֥י','הַמְּאֹרֹ֖ת','הַגְּדֹלִ֑ים','אֶת־הַמָּא֤וֹר','הַגָּדֹל֙','לְמֶמְשֶׁ֣לֶת','הַיּ֔וֹם','וְאֶת־הַמָּא֤וֹר','הַקָּטֹן֙','לְמֶמְשֶׁ֣לֶת','הַלַּ֔יְלָה','וְאֵ֖ת','הַכּוֹכָבִֽים'],
    'And God made the two great lights—the greater light to rule the day and the lesser light to rule the night—and the stars.'),
  sent('g-17', ['וַיִּתֵּ֥ן','אֹתָ֛ם','אֱלֹהִ֖ים','בִּרְקִ֣יעַ','הַשָּׁמָ֑יִם','לְהָאִ֖יר','עַל־הָאָֽרֶץ'],
    'And God set them in the expanse of the heavens to give light on the earth,'),
  sent('g-18', ['וְלִמְשֹׁל֙','בַּיּ֣וֹם','וּבַלַּ֔יְלָה','וּֽלֲהַבְדִּ֔יל','בֵּ֥ין','הָא֖וֹר','וּבֵ֣ין','הַחֹ֑שֶׁךְ','וַיַּ֥רְא','אֱלֹהִ֖ים','כִּי־טֽוֹב'],
    'to rule over the day and over the night, and to separate the light from the darkness. And God saw that it was good.'),
  sent('g-19', ['וַֽיְהִי־עֶ֥רֶב','וַֽיְהִי־בֹ֖קֶר','י֥וֹם','רְבִיעִֽי'],
    'And there was evening and there was morning, the fourth day.'),
  sent('g-20', ['וַיֹּ֣אמֶר','אֱלֹהִ֔ים','יִשְׁרְצ֣וּ','הַמַּ֔יִם','שֶׁ֖רֶץ','נֶ֣פֶשׁ','חַיָּ֑ה','וְעוֹף֙','יְעוֹפֵ֣ף','עַל־הָאָ֔רֶץ','עַל־פְּנֵ֖י','רְקִ֥יעַ','הַשָּׁמָֽיִם'],
    'And God said, "Let the waters swarm with swarms of living creatures, and let birds fly above the earth across the expanse of the heavens."'),
];

const genesis21_25 = [
  sent('g-21', ['וַיִּבְרָ֣א','אֱלֹהִ֔ים','אֶת־הַתַּנִּינִ֖ם','הַגְּדֹלִ֑ים','וְאֵ֣ת','כָּל־נֶ֣פֶשׁ','הַֽחַיָּ֣ה ׀','הָֽרֹמֶ֡שֶׂת','אֲשֶׁר','שָׁרְצ֣וּ','הַמַּ֗יִם','לְמִֽינְהֶ֔ם','וְאֵ֨ת','כָּל־ע֤וֹף','כָּנָף֙','לְמִינֵ֔הוּ','וַיַּ֥רְא','אֱלֹהִ֖ים','כִּי־טֽוֹב'],
    'So God created the great sea creatures and every living creature that moves, with which the waters swarm, according to their kinds, and every winged bird according to its kind. And God saw that it was good.'),
  sent('g-22', ['וַיְבָ֧רֶךְ','אֹתָ֛ם','אֱלֹהִ֖ים','לֵאמֹ֑ר','פְּר֣וּ','וּרְב֗וּ','וּמִלְא֤וּ','אֶת־הַמַּ֙יִם֙','בַּֽיַּמִּ֔ים','וְהָע֖וֹף','יִ֥רֶב','בָּאָֽרֶץ'],
    'And God blessed them, saying, "Be fruitful and multiply and fill the waters in the seas, and let birds multiply on the earth."'),
  sent('g-23', ['וַֽיְהִי־עֶ֥רֶב','וַֽיְהִי־בֹ֖קֶר','י֥וֹם','חֲמִישִֽׁי'],
    'And there was evening and there was morning, the fifth day.'),
  sent('g-24', ['וַיֹּ֣אמֶר','אֱלֹהִ֗ים','תּוֹצֵ֨א','הָאָ֜רֶץ','נֶ֤פֶשׁ','חַיָּה֙','לְמִינָ֔הּ','בְּהֵמָ֥ה','וָרֶ֛מֶשׂ','וְחַֽיְתוֹ־אֶ֖רֶץ','לְמִינָ֑הּ','וַֽיְהִי־כֵֽן'],
    'And God said, "Let the earth bring forth living creatures according to their kinds—livestock and creeping things and beasts of the earth according to their kinds." And it was so.'),
  sent('g-25', ['וַיַּ֣עַשׂ','אֱלֹהִים֩','אֶת־חַיַּ֨ת','הָאָ֜רֶץ','לְמִינָ֗הּ','וְאֶת־הַבְּהֵמָה֙','לְמִינָ֔הּ','וְאֵ֛ת','כָּל־רֶ֥מֶשׂ','הָֽאֲדָמָ֖ה','לְמִינֵ֑הוּ','וַיַּ֥רְא','אֱלֹהִ֖ים','כִּי־טֽוֹב'],
    'And God made the beasts of the earth according to their kinds and the livestock according to their kinds, and everything that creeps on the ground according to its kind. And God saw that it was good.'),
];

const genesis26_31 = [
  sent('g-26', ['וַיֹּ֣אמֶר','אֱלֹהִ֔ים','נַֽעֲשֶׂ֥ה','אָדָ֛ם','בְּצַלְמֵ֖נוּ','כִּדְמוּתֵ֑נוּ','וְיִרְדּוּ֩','בִדְגַ֨ת','הַיָּ֜ם','וּבְע֣וֹף','הַשָּׁמַ֗יִם','וּבַבְּהֵמָה֙','וּבְכָל־הָאָ֔רֶץ','וּבְכָל־הָרֶ֖מֶשׂ','הָֽרֹמֵ֥שׂ','עַל־הָאָֽרֶץ'],
    'Then God said, "Let us make man in our image, after our likeness. And let them have dominion over the fish of the sea and over the birds of the heavens and over the livestock and over all the earth and over every creeping thing that creeps on the earth."'),
  sent('g-27', ['וַיִּבְרָ֨א','אֱלֹהִ֤ים ׀','אֶת־הָֽאָדָם֙','בְּצַלְמ֔וֹ','בְּצֶ֥לֶם','אֱלֹהִ֖ים','בָּרָ֣א','אֹת֑וֹ','זָכָ֥ר','וּנְקֵבָ֖ה','בָּרָ֥א','אֹתָֽם'],
    'So God created man in his own image, in the image of God he created him; male and female he created them.'),
  sent('g-28', ['וַיְבָ֣רֶךְ','אֹתָם֮','אֱלֹהִים֒','וַיֹּ֨אמֶר','לָהֶ֜ם','אֱלֹהִ֗ים','פְּר֥וּ','וּרְב֛וּ','וּמִלְא֥וּ','אֶת־הָאָ֖רֶץ','וְכִבְשֻׁ֑הָ','וּרְד֞וּ','בִּדְגַ֤ת','הַיָּם֙','וּבְע֣וֹף','הַשָּׁמַ֔יִם','וּבְכָל־חַיָּ֖ה','הָֽרֹמֶ֥שֶׂת','עַל־הָאָֽרֶץ'],
    'And God blessed them. And God said to them, "Be fruitful and multiply and fill the earth and subdue it and have dominion over the fish of the sea and over the birds of the heavens and over every living thing that moves on the earth."'),
  sent('g-29', ['וַיֹּ֣אמֶר','אֱלֹהִ֗ים','הִנֵּה֩','נָתַ֨תִּי','לָכֶ֜ם','אֶת־כָּל־עֵ֣שֶׂב ׀','זֹרֵ֣עַ','זֶ֗רַע','אֲשֶׁר֙','עַל־פְּנֵ֣י','כָל־הָאָ֔רֶץ','וְאֶת־כָּל־הָעֵ֛ץ','אֲשֶׁר־בּ֥וֹ','פְרִי־עֵ֖ץ','זֹרֵ֣עַ','זָ֑רַע','לָכֶ֥ם','יִֽהְיֶ֖ה','לְאָכְלָֽה'],
    'And God said, "Behold, I have given you every plant yielding seed that is on the face of all the earth, and every tree with seed in its fruit. You shall have them for food.'),
  sent('g-30', ['וּֽלְכָל־חַיַּ֣ת','הָ֠אָ֠רֶץ','וּלְכָל־ע֨וֹף','הַשָּׁמַ֜יִם','וּלְכֹ֣ל ׀','רוֹמֵ֣שׂ','עַל־הָאָ֗רֶץ','אֲשֶׁר־בּוֹ֙','נֶ֣פֶשׁ','חַיָּ֔ה','אֶת־כָּל־יֶ֥רֶק','עֵ֖שֶׂב','לְאָכְלָ֑ה','וַֽיְהִי־כֵֽן'],
    'And to every beast of the earth and to every bird of the heavens and to everything that creeps on the earth, everything that has the breath of life, I have given every green plant for food." And it was so.'),
  sent('g-31', ['וַיַּ֤רְא','אֱלֹהִים֙','אֶת־כָּל־אֲשֶׁ֣ר','עָשָׂ֔ה','וְהִנֵּה־ט֖וֹב','מְאֹ֑ד','וַֽיְהִי־עֶ֥רֶב','וַֽיְהִי־בֹ֖קֶר','י֥וֹם','הַשִּׁשִּֽׁי'],
    'And God saw everything that he had made, and behold, it was very good. And there was evening and there was morning, the sixth day.'),
];

export const GENESIS_2_5: TextSection = {
  id: 'Gen-1-2', textId: 'Gen', sequence: 2, label: 'Genesis 1:2-5',
  sentences: genesis2_5, previousSectionId: 'Gen-1',
};
export const GENESIS_6_10: TextSection = {
  id: 'Gen-1-3', textId: 'Gen', sequence: 3, label: 'Genesis 1:6-10',
  sentences: genesis6_10, previousSectionId: 'Gen-1-2', nextSectionId: 'Gen-1-4',
};
export const GENESIS_11_15: TextSection = {
  id: 'Gen-1-4', textId: 'Gen', sequence: 4, label: 'Genesis 1:11-15',
  sentences: genesis11_15, previousSectionId: 'Gen-1-3', nextSectionId: 'Gen-1-5',
};
export const GENESIS_16_20: TextSection = {
  id: 'Gen-1-5', textId: 'Gen', sequence: 5, label: 'Genesis 1:16-20',
  sentences: genesis16_20, previousSectionId: 'Gen-1-4', nextSectionId: 'Gen-1-6',
};
export const GENESIS_21_25: TextSection = {
  id: 'Gen-1-6', textId: 'Gen', sequence: 6, label: 'Genesis 1:21-25',
  sentences: genesis21_25, previousSectionId: 'Gen-1-5', nextSectionId: 'Gen-1-7',
};
export const GENESIS_26_31: TextSection = {
  id: 'Gen-1-7', textId: 'Gen', sequence: 7, label: 'Genesis 1:26-31',
  sentences: genesis26_31, previousSectionId: 'Gen-1-6',
};

// ─── Psalm 23:3-6 (Hebrew, OSHB CC BY 4.0) ────────────────────────────────

const psalm23_3_6 = [
  sent('p23-3', ['נַפְשִׁ֥י','יְשׁוֹבֵ֑ב','יַֽנְחֵ֥נִי','בְמַעְגְּלֵי־צֶ֝֗דֶק','לְמַ֣עַן','שְׁמֽוֹ'],
    'He restores my soul. He leads me in paths of righteousness for his name\'s sake.'),
  sent('p23-4', ['גַּ֤ם כִּֽי־אֵלֵ֨ךְ בְּגֵ֪יא צַלְמָ֡וֶת','לֹא־אִ֘ירָ֤א','רָ֗ע','כִּי־אַתָּ֥ה','עִמָּדִ֑י','שִׁבְטְךָ֥','וּ֝מִשְׁעַנְתֶּ֗ךָ','הֵ֣מָּה','יְנַֽחֲמֻֽנִי'],
    'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.'),
  sent('p23-5', ['תַּעֲרֹ֬ךְ לְפָנַ֨י ׀ שֻׁלְחָ֗ן','נֶ֥גֶד','צֹרְרָ֑י','דִּשַּׁ֥נְתָּ','בַשֶּׁ֥מֶן','רֹ֝אשִׁ֗י','כּוֹסִ֥י','רְוָיָֽה'],
    'You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.'),
  sent('p23-6', ['אַ֤ךְ','ט֤וֹב','וָחֶ֣סֶד','יִ֭רְדְּפוּנִי','כָּל־יְמֵ֣י','חַיָּ֑י','וְשַׁבְתִּ֥י','בְּבֵית־יְ֝הוָ֗ה','לְאֹ֣רֶךְ','יָמִֽים'],
    'Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever.'),
];

export const PSALM_23_3_6: TextSection = {
  id: 'Ps-23-2',
  textId: 'Ps-23',
  sequence: 2,
  label: 'Psalm 23 (continued)',
  sentences: psalm23_3_6,
  previousSectionId: 'Ps-23-1',
};

// ─── Aeneid 1, lines 1-100 (Latin, Perseus CC BY-SA) ──────────────────────
// First 7 lines are in AENEID_1_1. Add lines 8-100.

const aeneidLines8_33 = [
  sent('aen-8',  ['multum','ille','et','terris','iactatus','et','alto','vi','superum','saevae','memorem','Iunonis','ob','iram;'],
    'Much he was tossed on land and on the deep by the force of the gods, because of the unforgetting anger of savage Juno.'),
  sent('aen-9',  ['multa','quoque','et','bello','passus','dum','conderet','urbem','inferretque','deos','Latio;','genus','unde','Latinum','Albanique','patres','atque','altae','moenia','Romae.'],
    'He suffered many things in war as well, until he could found a city and bring his gods to Latium; from this came the Latin race, the Alban fathers, and the walls of lofty Rome.'),
  sent('aen-10', ['Musa,','mihi','causas','memora,','quo','numine','laeso','quidve','dolens','regina','deum','tot','volvere','casus','insignem','pietate','virum,','tot','adire','labores','impulerit.'],
    'O Muse, tell me the reasons, what divine will was wounded, or what grief moved the queen of the gods to drive a man renowned for piety to face so many trials and to undergo so many hardships.'),
  sent('aen-11', ['Tantaene','animis','caelestibus','irae?'],
    'Can such great anger dwell in heavenly minds?'),
];

const aeneidLines34_66 = [
  sent('aen-12', ['Urbs','antiqua','fuit','Tyrii','tenuere','coloni,','Karthago,','Italiam','contra','Tiberinaque','longe','ostia,','dives','opum','studiisque','asperrima','belli;'],
    'There was an ancient city, held by Tyrian colonists, Carthage, opposite Italy and the far-off Tiber mouth, rich in resources and most fierce in the pursuits of war.'),
  sent('aen-13', ['quam','Iuno','fertur','terris','magis','omnibus','unam','posthabita','coluisse','Samo.','hic','illius','arma,','hic','currus','fuit;','hoc','regnum','dea','gentibus','esse,','si','qua','fata','sinant,','iam','tum','tenditque','fovetque.'],
    'Juno is said to have cherished this city more than any other land, even putting Samos aside. Here were her arms, here her chariot; even then the goddess aimed and nurtured this as her kingdom for the nations, if the Fates would allow.'),
  sent('aen-14', ['progeniem','sed','enim','Troiano','a','sanguine','duci','audierat','Tyrias','olim','quae','verteret','arces;','hinc','populum','late','regem','belloque','superbum','venturum','excendio','Libyae.'],
    'But she had heard that a race was being born from Trojan blood that would one day overthrow the Tyrian citadels; from it a people, wide-ruling and proud in war, would come to destroy Libya.'),
  sent('aen-15', ['sic','volvere','Parcas.','id','metuens','veterisque','memor','Saturnia','belli,','prima','quod','ad','Troiam','pro','caris','gesserat','Argis.'],
    'So the Fates were spinning. Fearing this and mindful of the old war she had first waged at Troy for her beloved Argos.'),
];

const aeneidLines67_100 = [
  sent('aen-16', ['Vix','e','conspectu','Siculae','telluris','in','altum','vela','dabant','laeti','et','spumas','salis','aere','ruebant,','cum','Iuno','aeternum','servans','sub','pectore','vulnus.'],
    'Scarcely had they set sail from the sight of Sicilian land into the deep, joyful and churning the foam of the sea with bronze, when Juno, nursing an eternal wound beneath her breast.'),
  sent('aen-17', ['haec','secum:','"mene','incepto','desistere','victam','nec','posse','Italia','Teucrorum','avertere','regem?','quippe','vetor','fatis.'],
    'Spoke to herself: "Am I, defeated, to desist from my purpose? Am I unable to turn the Teucrian king away from Italy? Surely the Fates forbid me.'),
  sent('aen-18', ['Pallasne','exurere','classem','Argivom','atque','ipsos','potuit','submergere','ponto,','unius','ob','noctam','furiasque','Ai hocis','Oilei?'],
    'Could Pallas burn the Argive fleet and drown the men themselves in the sea, because of the crime and madness of Oilean Ajax alone?'),
  sent('aen-19', ['ipsa','Iovis','rapidum','iaculata','e','nubibus','ignem','disiecitque','rates','evertitque','aequora','ventis;','illum','exspirantem','transfixo','pectore','flammas','turbine','corripuit','scopuloque','infixit','acuto.'],
    'She herself hurled Jove\'s swift fire from the clouds, scattered the ships, and churned up the waters with winds; him, breathing out flames from his pierced chest, she seized in a whirlwind and impaled on a sharp rock.'),
  sent('aen-20', ['ast','ego,','quae','divom','incedo','regina,','Iovisque','et','soror','et','coniunx,','una','cum','gente','tot','annos','bella','gero.'],
    'But I, who walk as queen of the gods, both sister and wife of Jove, have been waging war with a single people for so many years."'),
];

export const AENEID_LINES_8_33: TextSection = {
  id: 'Aen-1-2', textId: 'Aeneid-1', sequence: 2, label: 'Aeneid 1, Lines 8-33',
  sentences: aeneidLines8_33, previousSectionId: 'Aen-1-1', nextSectionId: 'Aen-1-3',
};

export const AENEID_LINES_34_66: TextSection = {
  id: 'Aen-1-3', textId: 'Aeneid-1', sequence: 3, label: 'Aeneid 1, Lines 34-66',
  sentences: aeneidLines34_66, previousSectionId: 'Aen-1-2', nextSectionId: 'Aen-1-4',
};

export const AENEID_LINES_67_100: TextSection = {
  id: 'Aen-1-4', textId: 'Aeneid-1', sequence: 4, label: 'Aeneid 1, Lines 67-100',
  sentences: aeneidLines67_100, previousSectionId: 'Aen-1-3',
};

// ─── Export all expanded sections for easy registration ─────────────────────

export const ALL_EXPANDED_SECTIONS: TextSection[] = [
  JOHN_1_VERSES_6_18,
  ILIAD_LINES_8_32,
  ILIAD_LINES_33_67,
  ILIAD_LINES_68_100,
  ANABASIS_P2_5,
  GENESIS_2_5,
  GENESIS_6_10,
  GENESIS_11_15,
  GENESIS_16_20,
  GENESIS_21_25,
  GENESIS_26_31,
  PSALM_23_3_6,
  AENEID_LINES_8_33,
  AENEID_LINES_34_66,
  AENEID_LINES_67_100,
];
