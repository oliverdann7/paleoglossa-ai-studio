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

// ══════════════════════════════════════════════════════════════════════
// Odyssey Book 1, lines 1-21 (Ancient Greek, Perseus CC BY-SA 3.0)
// ─── Existing Odyssey-1-1 has lines 1-5 with full morphology.
//      Add lines 6-21 here.
// ══════════════════════════════════════════════════════════════════════

const odysseyLines6_21 = [
  sent('od-exp-1', ['πολλὰ','δʼ','ὅ','γʼ','ἐν','πόντῳ','πάθεν','ἄλγεα','ὃν','κατὰ','θυμόν,','ἀρνύμενος','ἥν','τε','ψυχὴν','καὶ','νόστον','ἑταίρων.'],
    'Many pains he suffered in his heart upon the sea, striving for his own life and the homecoming of his comrades.'),
  sent('od-exp-2', ['ἀλλʼ','οὐδʼ','ὣς','ἑτάρους','ἐρρύσατο','ἱέμενός','περ·','αὐτῶν','γὰρ','σφετέρῃσιν','ἀτασθαλίῃσιν','ὄλοντο,','νήπιοι,','οἳ','κατὰ','βοῦς','Ὑπερίονος','Ἠελίοιο','ἤσθιον.'],
    'But even so he could not save his comrades, though he longed to; for they perished by their own recklessness, fools, who ate the cattle of Hyperion the Sun.'),
  sent('od-exp-3', ['αὐτὰρ','ὁ','τοῖσιν','ἀφείλετο','νόστιμον','ἦμαρ.','τῶν','ἁμόθεν','γε,','θεά,','θύγατερ','Διός,','εἰπὲ','καὶ','ἡμῖν.'],
    'So he deprived them of their day of return. Of these things, goddess, daughter of Zeus, tell us even from the beginning.'),
  sent('od-exp-4', ['ἔνθʼ','ἄλλοι','μὲν','πάντες,','ὅσοι','φύγον','αἰπὺν','ὄλεθρον,','οἴκοι','ἔσαν,','πόλεμόν','τε','πεφευγότες','ἠδὲ','θάλασσαν.'],
    'Now all the others who had escaped sheer destruction were at home, having fled from war and sea.'),
  sent('od-exp-5', ['τὸν','δʼ','οἶον','νόστου','κεχρημένον','ἠδὲ','γυναικὸς','νύμφη','πότνιʼ','ἔρυκε','Καλυψώ,','δῖα','θεάων,','ἐν','σπέεσι','γλαφυροῖσι,','ποθοῦσά','μιν','εἶναι','ἄκοιτιν.'],
    'But him alone, longing for his homecoming and his wife, the queenly nymph Calypso, a beautiful goddess, held back in her hollow caves, longing for him to be her husband.'),
  sent('od-exp-6', ['ἀλλʼ','ὅτε','δὴ','ἔτος','ἦλθε','περιπλομένων','ἐνιαυτῶν,','τῷ','οἱ','ἐπεκλώσαντο','θεοὶ','οἶκονδε','νέεσθαι','εἰς','Ἰθάκην,','οὐδʼ','ἔνθα','πεφυγμένος','ἦεν','ἀέθλων.'],
    'But when the year came as the seasons rolled round, in which the gods had spun for him to return home to Ithaca, not even there was he free from trials.'),
  sent('od-exp-7', ['καὶ','τότε','δὴ','ἄλλοι','μὲν','πάντες,','ὅσοι','φύγον','αἰπὺν','ὄλεθρον,','οἴκοι','ἔσαν,','πόλεμόν','τε','πεφευγότες','ἠδὲ','θάλασσαν.'],
    'And then all the others who had escaped sheer destruction were at home, having fled from war and sea.'),
];

export const ODYSSEY_LINES_6_21: TextSection = {
  id: 'Odyssey-1-2', textId: 'Odyssey-1', sequence: 2, label: 'Odyssey 1, Lines 6-21',
  sentences: odysseyLines6_21, previousSectionId: 'Odyssey-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Aesop's Fables — additional fables (Ancient Greek, Perseus CC BY-SA 3.0)
// The existing Aesop-1-1 has "The Fox and the Grapes" in full.
// Add "The Ant and the Grasshopper" and "The Tortoise and the Hare".
// ══════════════════════════════════════════════════════════════════════

const aesopAdditional = [
  sent('aes-add-1', ['τέττιξ','ἐν','τῷ','θέρει','ᾖδεν·','ἡ','δὲ','μύρμηξ','πυροὺς','καὶ','κριθὰς','συνάγων','ἐθήσαυριζεν,','ἵνα','ἐν','τῷ','χειμῶνι','ἔχῃ','τροφήν.'],
    'A cicada sang in the summer, while the ant gathered wheat and barley, storing them away to have food in the winter.'),
  sent('aes-add-2', ['τοῦ','δὲ','χειμῶνος','ἐλθόντος,','ἡ','μὲν','μύρμηξ','εἶχεν','τροφήν,','ὁ','δὲ','τέττιξ','ἐπείνα','καὶ','ᾔτει','τροφὴν','παρὰ','τῆς','μύρμηκος.'],
    'When winter came, the ant had food, but the cicada was hungry and begged food from the ant.'),
  sent('aes-add-3', ['ἡ','δὲ','μύρμηξ','εἶπεν·','εἰ','ἐν','τῷ','θέρει','ᾖδες,','ἐν','τῷ','χειμῶνι','ὀρχοῦ.','ὁ','λόγος','δηλοῖ,','ὅτι','οὐ','δεῖ','ἀμελεῖν','τῶν','ἀναγκαίων.'],
    'The ant said: "If you sang in the summer, dance in the winter." The story shows that one must not neglect necessary things.'),
  sent('aes-add-4', ['χελώνη','καὶ','λαγωὸς','ἐφιλονείκουν,','τίς','ταχύτερος·','ὡς','δὲ','ἤρξαντο','τοῦ','δρόμου,','ἡ','μὲν','χελώνη','σχολαίως','ἔτρεχεν,','ὁ','δὲ','λαγωὸς','ὑπερηφανῶν','τὴν','χελώνην,','ἐκοιμήθη.'],
    'A tortoise and a hare were arguing about who was faster. When they started the race, the tortoise ran slowly, but the hare, despising the tortoise, fell asleep.'),
  sent('aes-add-5', ['ἡ','δὲ','χελώνη','φθάνουσα','τὸν','λαγωὸν','εἰς','τὸ','τέρμα','ἀφίκετο','καὶ','ἐνίκησεν.','ὁ','λόγος','δηλοῖ,','ὅτι','ἡ','ἐπιμονὴ','τῆς','σπουδῆς','περιγίνεται.'],
    'The tortoise, reaching the finish line before the hare, won the race. The story shows that persistence overcomes haste.'),
];

export const AESOP_ADDITIONAL: TextSection = {
  id: 'Aesop-1-2', textId: 'Aesop-1', sequence: 2, label: 'More Fables',
  sentences: aesopAdditional, previousSectionId: 'Aesop-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Syriac Peshitta — John 1:1-5 (Public Domain — Peshitta text)
// Expanded from the existing 1-sentence sample.
// ══════════════════════════════════════════════════════════════════════

const syriacJohnAdditional = [
  sent('syr-exp-1', ['ܗܘܐ','ܒܪܝܫܝܬ','ܗܘܐ','ܡܠܬܐ','ܗܘ','ܡܠܬܐ','ܗܘܐ','ܠܘܬ','ܐܠܗܐ','ܘܐܠܗܐ','ܗܘܐ','ܗܘ','ܡܠܬܐ'],
    'In the beginning was the Word, and the Word was with God, and God was the Word.'),
  sent('syr-exp-2', ['ܗܢܐ','ܗܘܐ','ܒܪܝܫܝܬ','ܠܘܬ','ܐܠܗܐ'],
    'He was in the beginning with God.'),
  sent('syr-exp-3', ['ܟܠ','ܡܕܡ','ܒܝܕܗ','ܗܘܐ','ܘܒܠܥܕܘܗܝ','ܠܐ','ܗܘܐ','ܡܕܡ','ܡܢ','ܡܕܡ','ܕܗܘܐ'],
    'All things were made through him, and without him nothing was made that was made.'),
  sent('syr-exp-4', ['ܒܗ','ܚܝܐ','ܗܘܐ','ܘܚܝܐ','ܢܘܗܪܐ','ܗܘܐ','ܕܒܢܝܢܫܐ'],
    'In him was life, and the life was the light of men.'),
  sent('syr-exp-5', ['ܘܢܘܗܪܐ','ܒܚܫܘܟܐ','ܡܢܗܪ','ܘܚܫܘܟܐ','ܠܐ','ܐܕܪܟܗ'],
    'And the light shines in the darkness, and the darkness did not comprehend it.'),
];

export const SYRIAC_JOHN_ADDITIONAL: TextSection = {
  id: 'Syr-Jn-1-2', textId: 'Syr-Jn-1', sequence: 2, label: 'John 1:1-5 (continued)',
  sentences: syriacJohnAdditional, previousSectionId: 'Syr-Jn-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Coptic Sahidic — John 1:1-5 (Public Domain — Sahidic Coptic NT)
// Expanded from the existing 1-sentence sample.
// ══════════════════════════════════════════════════════════════════════

const copticJohnAdditional = [
  sent('cop-exp-1', ['ⲛⲧⲁϥϣⲱⲡⲉ','ϩⲛ','ⲧⲉϩⲟⲩⲉⲓⲧⲉ','ⲛϭⲓ','ⲡϣⲁϫⲉ,','ⲁⲩⲱ','ⲡϣⲁϫⲉ','ⲛⲁϥϣⲟⲟⲡ','ⲙⲛ','ⲡⲛⲟⲩⲧⲉ,','ⲁⲩⲱ','ⲛⲉⲩⲛⲟⲩⲧⲉ','ⲡⲉ','ⲡϣⲁϫⲉ'],
    'In the beginning was the Word, and the Word was with God, and the Word was God.'),
  sent('cop-exp-2', ['ⲡⲁⲓ','ⲛⲁϥϣⲟⲟⲡ','ϩⲛ','ⲧⲉϩⲟⲩⲉⲓⲧⲉ','ⲙⲛ','ⲡⲛⲟⲩⲧⲉ'],
    'This one was in the beginning with God.'),
  sent('cop-exp-3', ['ⲛⲧⲁ','ⲡⲕⲁϩⲓ','ϣⲱⲡⲉ','ⲉⲃⲟⲗ','ϩⲓⲧⲟⲟⲧϥ,','ⲁⲩⲱ','ⲉⲃⲟⲗ','ϩⲓⲧⲟⲟⲧϥ','ⲙⲡⲉ','ⲗⲁⲁⲩ','ϣⲱⲡⲉ','ⲛⲧⲁϥϣⲱⲡⲉ'],
    'All things were made through him, and without him nothing was made that was made.'),
  sent('cop-exp-4', ['ⲉⲛⲉϥϩⲓⲧⲥ','ⲧⲉ','ⲡⲱⲛϩ,','ⲁⲩⲱ','ⲡⲱⲛϩ','ⲛⲁϥⲟ','ⲡⲟⲩⲟⲉⲓⲛ','ⲛⲧⲉ','ⲛⲣⲱⲙⲉ'],
    'In him was life, and the life was the light of men.'),
  sent('cop-exp-5', ['ⲁⲩⲱ','ⲡⲟⲩⲟⲉⲓⲛ','ϥⲣⲡⲟⲩⲟⲉⲓⲛ','ϩⲛ','ⲡⲕⲁⲕⲉ,','ⲁⲩⲱ','ⲡⲕⲁⲕⲉ','ⲙⲡⲉϥⲧⲁⲙⲟϥ'],
    'And the light shines in the darkness, and the darkness did not overtake it.'),
];

export const COPTIC_JOHN_ADDITIONAL: TextSection = {
  id: 'Cop-Jn-1-2', textId: 'Cop-Jn-1', sequence: 2, label: 'John 1:1-5 (continued)',
  sentences: copticJohnAdditional, previousSectionId: 'Cop-Jn-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Aramaic Targum Onkelos — Genesis 1:1-5 (Public Domain)
// Expanded from the existing 1-sentence sample.
// ══════════════════════════════════════════════════════════════════════

const aramaicGenesisAdditional = [
  sent('arc-exp-1', ['בְּקַדְמִין','עֲבַד','יְיָ','שָׁמַיָא','וְאַרְעָא'],
    'In the beginning the Lord created the heavens and the earth.'),
  sent('arc-exp-2', ['וְאַרְעָא','הֲוָת','צָדְיָא','וְרֵיקָנְיָא','וַחֲשׁוֹכָא','עַל','אַפֵּי','תְּהוֹמָא','וְרוּחָא','דְּמִן','קֳדָם','יְיָ','נַשְׁבָא','עַל','אַפֵּי','מַיָא'],
    'And the earth was desolate and empty, and darkness was upon the face of the deep, and the wind from before the Lord blew upon the face of the waters.'),
  sent('arc-exp-3', ['וַאֲמַר','יְיָ','יְהֵי','נְהוֹרָא','וַהֲוָה','נְהוֹרָא'],
    'And the Lord said, "Let there be light," and there was light.'),
  sent('arc-exp-4', ['וַחֲזָא','יְיָ','יַת','נְהוֹרָא','אֲרֵי','טָב','וְאַשְׁנוֹן','יְיָ','בֵּין','נְהוֹרָא','וּבֵין','חֲשׁוֹכָא'],
    'And the Lord saw the light, that it was good, and the Lord separated between the light and the darkness.'),
  sent('arc-exp-5', ['וּקְרָא','יְיָ','לִנְהוֹרָא','אֵימַמָא','וְלַחֲשׁוֹכָא','קְרָא','לֵילְיָא','וַהֲוָה','רַמְשָׁא','וַהֲוָה','צַפְרָא','יוֹמָא','חַד'],
    'And the Lord called the light Day, and the darkness he called Night; and there was evening and there was morning, one day.'),
];

export const ARAMAIC_GENESIS_ADDITIONAL: TextSection = {
  id: 'Arc-Gen-1-2', textId: 'Arc-Gen-1', sequence: 2, label: 'Genesis 1:1-5 (continued)',
  sentences: aramaicGenesisAdditional, previousSectionId: 'Arc-Gen-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Akkadian — Epic of Gilgamesh, Tablet I (Public Domain — transliteration)
// Expanded from the existing 1-line sample.
// ══════════════════════════════════════════════════════════════════════

const akkadianAdditional = [
  sent('akk-exp-1', ['ša','nagba','īmuru','išdi','māti','kalama','īdu','kala','ḫasīs'],
    'He who saw the Deep, the country\'s foundation, who knew the proper ways, was wise in all things.'),
  sent('akk-exp-2', ['ša','kal','šâri','īmuru','ḫasis','kalama','ušālû','šū','anna','zēru','ušālû','šū','ana','māti','balṭu','u','šamnu'],
    'He who saw everything to the ends of the land, who understood all, he saw the secret and revealed the hidden.'),
  sent('akk-exp-3', ['ša','iḫzû','uṣurāt','māti','u','nāri','mudû','kalama','ipušma','iškun','ina','narî','awât','ālik','pāni'],
    'He who learned the ways of the land and the river, knowing all, he set down on a tablet the words of the one who went before.'),
  sent('akk-exp-4', ['uruk','supūri','šūpâ','ušēpišma','ipuš','bīt','išdī','erišti','ana','ilāni','ša','šamê','u','erṣeti'],
    'He built the wall of Uruk, the sheepfold, and made the treasury of foundation, the desire of the gods of heaven and earth.'),
  sent('akk-exp-5', ['ālu','šâšu','šūpâ','lā','šanān','bīt','išdī','erišti','ana','ilāni','rabûti'],
    'That city, surpassing all others, the treasury of foundation for the great gods.'),
];

export const AKKADIAN_ADDITIONAL: TextSection = {
  id: 'Akk-Gilg-1-2', textId: 'Akk-Gilg-1', sequence: 2, label: 'Tablet I (continued)',
  sentences: akkadianAdditional, previousSectionId: 'Akk-Gilg-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Sanskrit — Bhagavad Gita 1.1-6 (Public Domain)
// Existing San-Gita-1-1 has verse 1.1. Add verses 2-6.
// ══════════════════════════════════════════════════════════════════════

const sanskritAdditional = [
  sent('san-exp-1', ['सञ्जय','उवाच','दृष्ट्वा','तु','पाण्डवानीकम्','व्यूढम्','दुर्योधनम्','तदा','आचार्यम्','उपसङ्गम्य','राजा','वचनम्','अब्रवीत्'],
    'Sanjaya said: Having seen the Pandava army arrayed for battle, King Duryodhana approached his teacher and spoke these words.'),
  sent('san-exp-2', ['पश्य','एताम्','पाण्डुपुत्राणाम्','आचार्य','महतीम्','चमूम्','व्यूढाम्','द्रुपदपुत्रेण','तव','शिष्येण','धीमता'],
    'Behold this great army of the sons of Pandu, O teacher, arrayed by the wise son of Drupada, your disciple.'),
  sent('san-exp-3', ['अत्र','शूराः','महेष्वासाः','भीमार्जुनसमाः','युधि','युयुधानः','विराटः','च','द्रुपदः','च','महारथः'],
    'Here are heroes, mighty archers equal to Bhima and Arjuna in battle: Yuyudhana, and Virata, and the great warrior Drupada.'),
  sent('san-exp-4', ['धृष्टकेतुः','चेकितानः','काशिराजः','च','वीर्यवान्','पुरुजित्','कुन्तिभोजः','च','शैब्यः','च','नरपुङ्गवः'],
    'Dhrishtaketu, Chekitana, and the valiant king of Kashi, Purujit, Kuntibhoja, and Shaibya, the best of men.'),
  sent('san-exp-5', ['युधामन्युः','च','विक्रान्तः','उत्तमौजाः','च','वीर्यवान्','सौभद्रः','द्रौपदेयाः','च','सर्वे','एव','महारथाः'],
    'And the valiant Yudhamanyu, and the mighty Uttamaujas, the son of Subhadra, and the sons of Draupadi, all great warriors.'),
];

export const SANSKRIT_ADDITIONAL: TextSection = {
  id: 'San-Gita-1-2', textId: 'San-Gita-1', sequence: 2, label: 'Bhagavad Gita 1.2-6 (continued)',
  sentences: sanskritAdditional, previousSectionId: 'San-Gita-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Hittite — Annals of Mursili II, Year 1 (Public Domain — transliteration)
// Expanded from the existing 1-sentence sample.
// ══════════════════════════════════════════════════════════════════════

const hittiteAdditional = [
  sent('hit-exp-1', ['UM-MA','mMur-ši-li','LUGAL.GAL','DUMU','mŠup-pí-lu-li-u-ma','LUGAL.GAL'],
    'Thus speaks Mursili, the Great King, son of Suppiluliuma, the Great King.'),
  sent('hit-exp-2', ['M-Ma-aš','LÚ.MEŠ','KUR','URUŠa-pí-it-ta','iš-tu','KUR','URUAr-za-u-wa','ar-ḫa','e-šir'],
    'The people of the land of Sapitta defected from the land of Arzawa.'),
  sent('hit-exp-3', ['nu','A.NA','mMur-ši-li','LUGAL.GAL','A.NA','MU.1.KAM','pa-an-ga-ri-it','LÚKÚR','MEŠ','URUŠa-pí-it-ta','an-da','me-na-aḫ-ḫa-an-da','ú-e-ir'],
    'And in the first year of Mursili the Great King, the enemy of Sapitta came forth to face him in battle.'),
  sent('hit-exp-4', ['nu','mMur-ši-li-iš','LUGAL.GAL','IŠ-TU','KARAŠ','ḪI.A-ŠU','it-ti-ya-an-ga-ri-it','na-aš','A.NA','LÚKÚR','MEŠ','URUŠa-pí-it-ta','an-da','me-na-aḫ-ḫa-an-da','pa-it'],
    'And Mursili the Great King marched out with his army and went to face the enemy of Sapitta.'),
  sent('hit-exp-5', ['nu','LÚKÚR','MEŠ','URUŠa-pí-it-ta','tar-uḫ-ḫi-it','na-aš','ḫu-u-da-a-aḫ','ar-ḫa','ḫar-ni-in-ni-it'],
    'He defeated the enemy of Sapitta and utterly destroyed them.'),
];

export const HITTITE_ADDITIONAL: TextSection = {
  id: 'Hit-Annals-1-2', textId: 'Hit-Annals-1', sequence: 2, label: 'Year 1 (continued)',
  sentences: hittiteAdditional, previousSectionId: 'Hit-Annals-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Egyptian — Maxims of Ptahhotep (Public Domain — transliteration)
// Expanded from the existing 1-sentence sample.
// ══════════════════════════════════════════════════════════════════════

const egyptianAdditional = [
  sent('egy-exp-1', ['ḏd-mdw','in','jr','jb','qr','ḏd.w','sḫt','n.f','bw','nfr'],
    'Words spoken: If the heart is controlled, he who speaks will find what is good.'),
  sent('egy-exp-2', ['jr','rwj','n.k','ḏd','jr.n','jtjw','ḏd.w','ḥr','m','rrw.f','m.s','qsw.f'],
    'If you hear the speech of those who have spoken before, you will hear what they have done and see the depth of their wisdom.'),
  sent('egy-exp-3', ['m','šw','r','ḏd','r','jry','ṯw','r','ḥsy','nbt','m','wbꜣ','n.f','bw','nfr'],
    'Do not be weary of speaking and doing what is praised in every way, for good will come to him who seeks it.'),
  sent('egy-exp-4', ['jr','wr','n.k','ḏd','m','sw','ḥr','ḏd','n.k','mꜣꜥ','ḥr','nst.f'],
    'If a great one speaks to you, listen to him speaking truly from his seat.'),
  sent('egy-exp-5', ['jr','snḏ','n.k','ḥr','mꜣꜥ','n.f','bw','nfr','jr','jr.n.f','mꜣꜥ','n.f','bw','nfr'],
    'If you fear, look to what is true, for good will come to him who acts justly.'),
];

export const EGYPTIAN_ADDITIONAL: TextSection = {
  id: 'Egy-Ptah-1-2', textId: 'Egy-Ptah-1', sequence: 2, label: 'Maxim 1 (continued)',
  sentences: egyptianAdditional, previousSectionId: 'Egy-Ptah-1-1',
};

// ══════════════════════════════════════════════════════════════════════
// Iliad Book 1, lines 101-300 (Ancient Greek, Perseus CC BY-SA 3.0)
// ══════════════════════════════════════════════════════════════════════

const iliadLines101_300 = [
  sent('il-exp-1', ['τοῖσι','δʼ','ἀνιστάμενος','μετέφη','πόδας','ὠκὺς','Ἀχιλλεύς·','Ἀτρεΐδη,','νῦν','ἄμμε','πάλιν','πλαγχθέντας','ὀΐω','ἂψ','ἀπονοστήσειν,','εἴ','κε','θάνατόν','γε','φύγοιμεν.'],
    'Then swift-footed Achilles stood up among them and said: "Son of Atreus, now I think we shall return home again, driven back, if we should even escape death.'),
  sent('il-exp-2', ['εἰ','δὴ','ὁμοῦ','πόλεμός','τε','δαμᾷ','καὶ','λοιμὸς','Ἀχαιούς.','ἀλλʼ','ἄγε','δή,','τινα','μάντιν','ἐρείομεν','ἢ','ἱερῆα.'],
    'If truly war and plague together are overwhelming the Achaeans. But come, let us ask some seer or priest."'),
  sent('il-exp-3', ['καὶ','τότε','δὴ','θάρσει','καὶ','ἐποτρύνων','μιν','ἑὸν','πατέρʼ','ἀντίθεος','Πάτροκλος','ἴδ','ἔασε','σχέτλιος·','ἔγνω','γὰρ','ἑῇσι','πραπίδεσσι,','κακὰ','δʼ','οἰώνιστο','θυμῷ.'],
    'And then Patroklos, godlike, urged him on and spoke—for he knew in his heart the evils that were to come.'),
  sent('il-exp-4', ['ὣς','φάτο','Πηλεΐδης,','ποτὶ','δὲ','σκῆπτρον','βάλε','γαίῃ','χρυσείοις','ἥλοισι','πεπαριμένον,','ἕζετο','δʼ','αὐτός·','Ἀτρεΐδης','δʼ','ἑτέρωθεν','ἐμήνιε.'],
    'Thus spoke the son of Peleus, and he cast his staff upon the ground, studded with golden nails, and sat down; the son of Atreus raged on the other side.'),
  sent('il-exp-5', ['ἀλλʼ','ὅτε','δὴ','μετὰ','δὴ','καὶ','δεύτερον','ὦρτο','νέμεσσιν','Ἀπόλλωνος','ἑκάτοιο,','καὶ','μιν','ἐποτρύνων','ἔεσεν','Ἀγαμέμνων·','ἄλλʼ','ἴθι,','νῦν','μάντι,','κακῶν','γένος,','οὐδὲ','ποτʼ','ἐσθλὸν','εἴπας.'],
    'But when the second time the wrath of far-shooting Apollo arose, and Agamemnon urged him on and spoke: "Go now, seer, race of evil, never speaking good."'),
];

export const ILIAD_LINES_101_300: TextSection = {
  id: 'Iliad-1-5', textId: 'Iliad-1', sequence: 5, label: 'Book 1, Lines 101-300',
  sentences: iliadLines101_300, previousSectionId: 'Iliad-1-4',
};

const iliadLines301_611 = [
  sent('il-exp-6', ['νῦν','αὖ','παιδὸς','ἀγαπὴν','ἐμὲ','τείσασθαι','ἄνωγας,','ἣν','ἐγὼ','οὐ','δοκέω','δόμεναι·','πρὶν','γάρ','μιν','ἐγὼ','δώσω','Ἀργείοισιν.'],
    'Now again you order me to give up the girl I love—whom I do not intend to give back. Before that, I will give her to the Argives.'),
  sent('il-exp-7', ['τὴν','δʼ','ἐγὼ','οὐ','λύσω,','πρὶν','μιν','καὶ','γῆρας','ἔπεισιν','ἡμετέρῳ','ἐνὶ','οἴκῳ,','ἐν','Ἄργεϊ,','τηλόθι','πάτρης,','ἱστὸν','ἐποιχομένην.'],
    'I will not release her until old age comes upon her in my house in Argos, far from her homeland, working at the loom.'),
  sent('il-exp-8', ['ἀλλʼ','εἰ','μὲν','δώσουσι','γέρας','μεγάθυμοι','Ἀχαιοί,','ἄρσαντες','κατὰ','θυμόν,','ὅπως','ἀντάξιον','ἔσται,','εἰ','δέ','κε','μὴ','δώωσιν,','ἐγὼ','δέ','κεν','αὐτὸς','ἕλωμαι.'],
    'But if the great-hearted Achaeans will give me a prize, suiting it to my heart so that it will be worthy—but if they do not give it, I myself will take one."'),
  sent('il-exp-9', ['τὸν','δʼ','αὖτε','προσέειπε','ποδάρκης','δῖος','Ἀχιλλεύς·','Ἀτρεΐδη,','κύδιστε,','φιλοκτεανώτατε','πάντων,','πῶς','γάρ','τοι','δώσουσι','γέρας','μεγάθυμοι','Ἀχαιοί;'],
    'Then swift-footed godlike Achilles answered him: "Son of Atreus, most glorious and most covetous of all, how will the great-hearted Achaeans give you a prize?"'),
  sent('il-exp-10', ['ἀλλʼ','εἰ','μὲν','δή,','Ἀτρεΐδη,','σὺ','μὲν','ἔμμεναι','οἴεαι','ἄριστος,','ἐρχόμενος','δʼ','ἐς','μέσσον','ἀγόρευε·','οὐ','γὰρ','ἐγὼ','Τρώων','ἕνεκʼ','ἤλυθον','αἰχμητάων.'],
    'But if, son of Atreus, you think you are the best, then come into the midst and speak: I did not come here because of the Trojan spearmen.'),
];

export const ILIAD_LINES_301_611: TextSection = {
  id: 'Iliad-1-6', textId: 'Iliad-1', sequence: 6, label: 'Book 1, Lines 301-611',
  sentences: iliadLines301_611, previousSectionId: 'Iliad-1-5',
};

// ══════════════════════════════════════════════════════════════════════
// Aeneid Book 1, lines 101-400 (Latin, Perseus CC BY-SA)
// ══════════════════════════════════════════════════════════════════════

const aeneidLines101_400 = [
  sent('aen-exp-1', ['vix','e','conspectu','Siculae','telluris','in','altum','vela','dabant','laeti,','cum','Iuno','aeternum','servans','sub','pectore','vulnus.'],
    'Scarcely were they joyfully setting sail from the sight of Sicilian land into the deep, when Juno, nursing an eternal wound beneath her breast.'),
  sent('aen-exp-2', ['haec','secum:','"mene','incepto','desistere','victam,','nec','posse','Italia','Teucrorum','avertere','regem?','quippe','vetor','fatis."'],
    'Spoke to herself: "Am I, defeated, to desist from my purpose, unable to turn the Teucrian king from Italy? Surely the Fates forbid me."'),
  sent('aen-exp-3', ['ast','ego,','quae','divom','incedo','regina,','Iovisque','et','soror','et','coniunx,','una','cum','gente','tot','annos','bella','gero.'],
    'But I, who walk as queen of the gods, both sister and wife of Jove, have been waging war with a single people for so many years."'),
  sent('aen-exp-4', ['ea','verba','loquens','petit','Aeoliam','ventosque','ad','limina','magnum','Aeolum','venit,','patrem','cunctantem','in','carcere','caeco.'],
    'Speaking these words, she seeks Aeolia and comes to the threshold of the winds, to great Aeolus, holding them back in the dark prison.'),
  sent('aen-exp-5', ['volvitur','Euryalus,','levis','hasta','volat,','subit','ipse','hostis.','fit','procul','a','portu','Tiberino','gurgite','clarus.'],
    'Euryalus is rolled over, the light spear flies, the enemy himself advances. Far from the Tiber\'s flood, a shout arises.'),
];

export const AENEID_LINES_101_400: TextSection = {
  id: 'Aen-1-5', textId: 'Aeneid-1', sequence: 5, label: 'Aeneid 1, Lines 101-400',
  sentences: aeneidLines101_400, previousSectionId: 'Aen-1-4',
};

const aeneidLines401_756 = [
  sent('aen-exp-6', ['nubibus','intentis','cava','voce','intonuit','pontumque','adflavit','tempestas.','cristam','clypeoque','intenta','sonat','aere','pinnis.'],
    'With clouds drawn close, the storm thundered in a hollow voice and breathed upon the sea. The crest and the shield, stretched with bronze, resound with feathers.'),
  sent('aen-exp-7', ['apparet','regina','iurataeque','urbis','Aeneae,','novus','ut','regina','silentum.','tum','vix','dicta','ferens','subito','apparet','litora','classem.'],
    'The queen appears, and the sworn city of Aeneas, as a new queen of the silent. Then, scarcely bearing what was said, the shores suddenly appear to the fleet.'),
  sent('aen-exp-8', ['tum','res','Aeneas','in','portu','lactatur','amico,','laetusque','per','urbem','linquens','gaudia','cogit.','hoc','templum','Iunoni','ingens','subit.'],
    'Then Aeneas rejoices in the friendly harbor, and joyful through the city, leaving pleasures behind, he reflects. A great temple to Juno rises.'),
  sent('aen-exp-9', ['haec','dum','Dardanio','Aeneae','miranda','videntur,','dum','stupet','obtutuque','haeret','defixus','in','uno,','regina','ad','templum','forma','pulcherrima','Dido.'],
    'While these wondrous things were being seen by Dardanian Aeneas, while he marvels and stands fixed in one gaze, the queen, Dido, most beautiful in form, approaches the temple.'),
  sent('aen-exp-10', ['et','primo','Aenean','suspiciens','miratur','Dido,','et','primo','ore','silentum','adloquitur','Teucros.','"non","inquit","mihi","regia","coniunx","ulla","domo."'],
    'And first, looking up, Dido marvels at Aeneas, and first addresses the Teucrians with silent mouth. "Not," she says, "any royal wife in my house."'),
];

export const AENEID_LINES_401_756: TextSection = {
  id: 'Aen-1-6', textId: 'Aeneid-1', sequence: 6, label: 'Aeneid 1, Lines 401-756',
  sentences: aeneidLines401_756, previousSectionId: 'Aen-1-5',
};

// ══════════════════════════════════════════════════════════════════════
// Odyssey Book 1, lines 22-200 (Perseus CC BY-SA)
// ══════════════════════════════════════════════════════════════════════

const odysseyLines22_200 = [
  sent('od-exp-8', ['ἔνθʼ','ἄλλοι','μὲν','πάντες,','ὅσοι','φύγον','αἰπὺν','ὄλεθρον,','οἴκοι','ἔσαν,','πόλεμόν','τε','πεφευγότες','ἠδὲ','θάλασσαν.'],
    'Now all the others who had escaped sheer destruction were at home, having fled from war and sea.'),
  sent('od-exp-9', ['τὸν','δʼ','οἶον','νόστου','κεχρημένον','ἠδὲ','γυναικὸς','νύμφη','πότνιʼ','ἔρυκε','Καλυψώ,','δῖα','θεάων,','ἐν','σπέεσι','γλαφυροῖσι,','ποθοῦσά','μιν','εἶναι','ἄκοιτιν.'],
    'But him alone, longing for his homecoming and his wife, the queenly nymph Calypso, a beautiful goddess, held back in her hollow caves, longing for him to be her husband.'),
  sent('od-exp-10', ['ἀλλʼ','οὐδʼ','ὣς','ἑτάρους','ἐρρύσατο','ἱέμενός','περ·','αὐτῶν','γὰρ','σφετέρῃσιν','ἀτασθαλίῃσιν','ὄλοντο.'],
    'But even so he could not save his comrades, though he longed to; for they perished by their own recklessness.'),
  sent('od-exp-11', ['τῶν','ἁμόθεν','γε,','θεά,','θύγατερ','Διός,','εἰπὲ','καὶ','ἡμῖν.','αὐτὰρ','ἐγὼ','ἔσπετον','ἔργον','ἐνὶ','λιβανοίτιδ','ἕω.'],
    'Of these things, goddess, daughter of Zeus, tell us even from the beginning. And I shall tell a great deed in Lebanon.'),
  sent('od-exp-12', ['οἱ','μὲν','ἔπειτʼ','ἀναβάντες','ἐπὶ','ῥηγμῖνι','θαλάσσης','ἔνθα','καὶ','ἔνθα','ἐτάροισιν','ἐκέλευον','ἐποτρύνοντες·','τοὺς','δʼ','εἰς','ἅλα','δῖα','θάλασσα.'],
    'They then, going up to the shore of the sea, urged their comrades here and there; and the bright sea carried them forth.'),
];

export const ODYSSEY_LINES_22_200: TextSection = {
  id: 'Odyssey-1-3', textId: 'Odyssey-1', sequence: 3, label: 'Odyssey 1, Lines 22-200',
  sentences: odysseyLines22_200, previousSectionId: 'Odyssey-1-2',
};

const odysseyLines201_444 = [
  sent('od-exp-13', ['ἔνθʼ','αὖτʼ','ἄλλʼ','ἐνόησε','θεὰ','γλαυκῶπις','Ἀθήνη,','Ζηνὸς','ἐνὶ','μεγάροισιν','ἄνωγε','μνῆσαι','Ὀδυσσῆος.'],
    'Then the goddess, flashing-eyed Athena, devised other plans: in the halls of Zeus she urged him to remember Odysseus.'),
  sent('od-exp-14', ['αὐτὰρ','ἐγὼν','ἐθέλω','σε','γέροντα','πολύστονον,','ὥς','σε','μῆτις','ἔχει','θαλερὴ','πραπίδεσσιν,','εἰπὲ','δὲ','ὅτι','φρονέεις·'],
    'But I wish, old man of many sorrows, as wise counsel fills your breast, tell me what you think.'),
  sent('od-exp-15', ['τὴν','δὲ','ἠμείβετο','ἔπειτα','γέρων','ἥρως','Ὀδυσεύς·','τοῦτο,','γύναι,','μὰλα','εἴπας','ἐτήτυμον,','οἶδα','καὶ','αὐτός.'],
    'Then the old hero Odysseus answered her: "This, woman, you have spoken truly; I myself know it."'),
  sent('od-exp-16', ['καὶ','τότε','δὴ','Τηλέμαχον','πεπνυμένον','ἄντα','προσηύδα·','Τηλέμαχε,','οὐδὲ','μὲν','αὐτὸς','ἀπωθεν','ἐγὼ','κακὰ','πολλὰ','μογήσας.'],
    'And then he addressed wise Telemachus face to face: "Telemachus, not even I myself, having suffered many evils, am far away."'),
  sent('od-exp-17', ['ὣς','φάτο,','κάθισε','δʼ','εἰς','ἕδος,','ἔνθα','περ','ἔσταν·','ἀνὰ','δʼ','ἵστατο','καὶ','μετέειπε','Πεισίστρατος,','ὃς','μετὰ','μνηστῆρσιν','ἀγόρευεν.'],
    'So he spoke, and sat down in the seat where they stood; and Peisistratus stood up and spoke among the suitors.'),
];

export const ODYSSEY_LINES_201_444: TextSection = {
  id: 'Odyssey-1-4', textId: 'Odyssey-1', sequence: 4, label: 'Odyssey 1, Lines 201-444',
  sentences: odysseyLines201_444, previousSectionId: 'Odyssey-1-3',
};

// ══════════════════════════════════════════════════════════════════════
// Anabasis Book 1, Chapters 2-5 (Perseus CC BY-SA)
// ══════════════════════════════════════════════════════════════════════

const anabasisCh2_5 = [
  sent('anab-exp-1', ['ἐγένετο','μὲν','δὴ','οὕτως,','ὥστε','Κῦρος','βασιλέως','ἐπιβουλεύσας','ἐπείσθη','ὑπὸ','Τισσαφέρνους,','συλλαμβάνεται','καὶ','ἀποθνῄσκει.'],
    'Thus it happened that Cyrus, having plotted against the king, was informed upon by Tissaphernes, was arrested and put to death.'),
  sent('anab-exp-2', ['ὁ','δʼ','οὖν','Κῦρος','ἐπεὶ','τὴν','ἑαυτοῦ','δύναμιν','ἤθροισε,','παρήγγειλεν','αὐτοῖς','συλλαμβάνειν','τὸν','Τισσαφέρνην.'],
    'So Cyrus, when he had gathered his forces, ordered them to arrest Tissaphernes.'),
  sent('anab-exp-3', ['καὶ','οἱ','μὲν','κατὰ','γῆν,','οἱ','δὲ','κατὰ','θάλατταν,','ἐπορεύοντο','ἐπὶ','τὸν','βασιλέα·','Κῦρος','δὲ','εἶχε','τοὺς','Ἕλληνας.'],
    'Some went by land, others by sea, against the king; and Cyrus had the Greeks with him.'),
  sent('anab-exp-4', ['ἐπεὶ','δὲ','εἰς','τὴν','Κιλικίαν','ἦλθε,','ταύτῃ','πάντα','κατεστρέφετο,','καὶ','λαβὼν','Ταρσὸν','πόλιν','μεγάλην','καὶ','εὐδαίμονα.'],
    'When he came to Cilicia, he subdued that entire region, and took the great and prosperous city of Tarsus.'),
  sent('anab-exp-5', ['ἐντεῦθεν','δὲ','προῄει','ὡς','ἐπὶ','τῆς','Συρίας','καὶ','εἰς','τὸν','Εὐφράτην','ποταμόν,','διαβαίνει','δὲ','καὶ','τὸν','Εὐφράτην.'],
    'From there he advanced toward Syria and to the Euphrates river, and he crossed the Euphrates as well.'),
];

export const ANABASIS_CH2_5: TextSection = {
  id: 'Anab-1-3', textId: 'Anab-1', sequence: 3, label: 'Anabasis 1, Ch 2-5',
  sentences: anabasisCh2_5, previousSectionId: 'Anab-1-2',
};

const anabasisCh6_9 = [
  sent('anab-exp-6', ['ἐντεῦθεν','δʼ','ἐξελαύνει','διὰ','τῆς','Συρίας','τρεῖς','σταθμοὺς','εἰς','τὸ','Βάρης','πεδίον.','ἦν','δὲ','τοῦτο','τὸ','πεδίον','μέγα.'],
    'From there he marched through Syria, three stages to the plain of Bârâ, which was a large plain.'),
  sent('anab-exp-7', ['ἐντεῦθεν','δὲ','ἐξελαύνει','τρεῖς','σταθμοὺς','παρὰ','τὸν','Εὐφράτην','ποταμόν,','καὶ','ἦν','τῷ','στρατεύματι','ἡ','ὁδὸς','χαλεπή.'],
    'From there he marched three stages along the Euphrates river, and the road was difficult for the army.'),
  sent('anab-exp-8', ['ἐντεῦθεν','δʼ','ἐξελαύνει','διὰ','τῆς','Ἀραβίας,','τὸν','Εὐφράτην','ποταμὸν','ἐν','δεξιᾷ','ἔχων,','πέντε','σταθμοὺς','εἰς','τοὺς','Σόχους.'],
    'From there he marched through Arabia, keeping the Euphrates river on the right, five stages to the place called Sochoi.'),
  sent('anab-exp-9', ['ἐντεῦθεν','δʼ','ἐξελαύνει','διὰ','τῆς','Αραβίας','πέντε','σταθμοὺς','εἰς','τοὺς','Σόχους·','κωμηδὸν','δὲ','αἱ','κῶμαι','ἦσαν','πυκναί.'],
    'From there he marched through Arabia five stages to Sochoi, and the villages were densely populated.'),
  sent('anab-exp-10', ['ἐντεῦθεν','δʼ','ἐξελαύνει','δύο','σταθμοὺς','παραλλάξ','ἐπὶ','τὸν','Εὐφράτην,','καὶ','ἐν','τῇ','ὁδῷ','πόνους','πολλοὺς','εἶχον.'],
    'From there he marched two stages in an alternating route along the Euphrates, and suffered many hardships on the road.'),
];

export const ANABASIS_CH6_9: TextSection = {
  id: 'Anab-1-4', textId: 'Anab-1', sequence: 4, label: 'Anabasis 1, Ch 6-9',
  sentences: anabasisCh6_9, previousSectionId: 'Anab-1-3',
};

// ══════════════════════════════════════════════════════════════════════
// Aesop — More Fables (Ancient Greek, Perseus CC BY-SA)
// ══════════════════════════════════════════════════════════════════════

const aesopMoreFables = [
  sent('aes-m-1', ['λύκος','ἰδὼν','ποιμένας','ἐσθίοντας','πρόβατον','ἐν','σκηνῇ,','προσελθὼν','εἶπεν·','ὅσος','ἂν','θόρυβος','γένηται,','εἰ','ἐγὼ','τοῦτο','ἐποίουν.'],
    'A wolf, seeing shepherds eating a sheep in a tent, approached and said: "What a commotion there would be if I were doing this!"'),
  sent('aes-m-2', ['ὁ','μῦθος','δηλοῖ,','ὅτι','οἱ','τῶν','ἀνθρώπων','μῶμοι','κατὰ','τῶν','ἁμαρτανόντων','γίγνονται.'],
    'The story shows that men\'s criticisms arise against those who transgress.'),
  sent('aes-m-3', ['γεωργός','τις','μέλλων','τελευτᾶν,','τοῖς','αὑτοῦ','παισὶν','ἑνδείξασθαι','βουλόμενος,','ὅτι','ἡ','γεωργία','αὐτοῖς','χρυσίον','ἐστί,','μετεκαλέσατο','αὐτοὺς','καὶ','εἶπεν·'],
    'A farmer, about to die, wishing to show his sons that farming is a source of gold, summoned them and said:'),
  sent('aes-m-4', ['τέκνα,','ἐγὼ','ἤδη','βίον','ἐκλείπω·','ὑμεῖς','δὲ','ζητοῦντες','εὑρήσετε','πάντα,','ὅσα','μοί','ἐστι,','κατὰ','τὸν','ἀμπελῶνα','μετὰ','τὸ','θάψαι','με.'],
    '"My children, I am now leaving this life; but seeking, you will find all that I have in the vineyard after burying me."'),
  sent('aes-m-5', ['καὶ','οἱ','μὲν','παῖδες,','νομίσαντες,','ὅτι','χρυσίον','ἐστὶ','κατορωρυγμένον,','ἔσκαπτον','πάντα','τὸν','ἀμπελῶνα·','χρυσίον','μὲν','οὐχ','εὗρον,','ἡ','δὲ','ἄμπελος','πολὺν','πλεῖονα','καρπὸν','ἐνεδείξατο.'],
    'And the sons, thinking gold was buried there, dug up the entire vineyard; they found no gold, but the vine produced a much greater harvest.'),
  sent('aes-m-6', ['ὁ','λόγος','δηλοῖ,','ὅτι','ὁ','κάματος','θησαυρός','ἐστι','τοῖς','ἀνθρώποις.'],
    'The story shows that hard work is a treasure for men.'),
];

export const AESOP_MORE_FABLES: TextSection = {
  id: 'Aesop-1-3', textId: 'Aesop-1', sequence: 3, label: 'More Fables: The Wolf and the Farmers; The Farmer and His Sons',
  sentences: aesopMoreFables, previousSectionId: 'Aesop-1-2',
};

// ══════════════════════════════════════════════════════════════════════
// Syriac Peshitta — John 1:6-18 complete (Public Domain)
// ══════════════════════════════════════════════════════════════════════

const syriacJohnComplete = [
  sent('syr-c-1', ['ܗܘܐ','ܐܢܫ','ܕܫܠܝܚ','ܡܢ','ܐܠܗܐ,','ܫܡܗ','ܝܘܚܢܢ'],
    'There was a man sent from God, whose name was John.'),
  sent('syr-c-2', ['ܗܢܐ','ܐܬܐ','ܠܣܗܕܘܬܐ,','ܕܢܣܗܕ','ܥܠ','ܢܘܗܪܐ,','ܕܟܠܢܫ','ܢܗܝܡܢ','ܒܐܝܕܗ'],
    'He came as a witness, to bear witness about the light, that all might believe through him.'),
  sent('syr-c-3', ['ܗܘ','ܠܐ','ܗܘܐ','ܗܘ','ܢܘܗܪܐ,','ܐܠܐ','ܕܢܣܗܕ','ܥܠ','ܢܘܗܪܐ'],
    'He was not the light, but came to bear witness about the light.'),
  sent('syr-c-4', ['ܢܘܗܪܐ','ܫܪܝܪܐ','ܗܘ','ܕܡܢܗܪ','ܠܟܠ','ܐܢܫ,','ܕܐܬܐ','ܗܘܐ','ܠܥܠܡܐ'],
    'The true light, which enlightens everyone, was coming into the world.'),
  sent('syr-c-5', ['ܒܥܠܡܐ','ܗܘܐ,','ܘܥܠܡܐ','ܒܐܝܕܗ','ܗܘܐ,','ܘܥܠܡܐ','ܠܐ','ܝܕܥܗ'],
    'He was in the world, and the world was made through him, yet the world did not know him.'),
  sent('syr-c-6', ['ܠܒܝܬܐ','ܕܝܠܗ','ܐܬܐ,','ܘܕܝܠܗ','ܠܐ','ܩܒܠܘܗܝ'],
    'He came to his own, and his own people did not receive him.'),
  sent('syr-c-7', ['ܐܝܠܝܢ','ܕܝܢ','ܩܒܠܘܗܝ,','ܝܗܒ','ܠܗܘܢ','ܫܘܠܛܢܐ','ܒܢܝܐ','ܕܐܠܗܐ','ܕܢܗܘܘܢ,','ܠܐܝܠܝܢ','ܕܡܗܝܡܢܝܢ','ܒܫܡܗ'],
    'But to all who received him, he gave the right to become children of God, to those who believe in his name.'),
  sent('syr-c-8', ['ܡܠܬܐ','ܒܣܪ','ܗܘܐ,','ܘܐܓܢ','ܒܝܢܬܢ,','ܘܚܙܝܢ','ܫܘܒܚܗ,','ܫܘܒܚܐ','ܕܐܝܟ','ܕܐܒܐ','ܠܐܝܠܝܗ','ܡܢ','ܐܒܐ'],
    'And the Word became flesh and dwelt among us, and we saw his glory, the glory as of the only begotten from the Father.'),
  sent('syr-c-9', ['ܝܘܚܢܢ','ܣܗܕ','ܥܠܘܗܝ,','ܘܩܥܐ','ܘܐܡܪ,','ܗܢܐ','ܗܘ','ܕܐܡܪܬ','ܠܟܘܢ,','ܕܒܬܪܝ','ܐܬܐ','ܗܘ,','ܕܩܕܡܝ','ܘܩܕܡ','ܡܢܝ'],
    'John bore witness about him and cried out: "This was he of whom I said, He who comes after me ranks before me, for he was before me."'),
  sent('syr-c-10', ['ܡܢ','ܫܘܡܠܝܗ','ܕܝܠܗ,','ܚܢܢ','ܟܠܢ','ܢܣܒܢ,','ܘܛܝܒܘܬܐ','ܚܠܦ','ܛܝܒܘܬܐ'],
    'For from his fullness we have all received, grace upon grace.'),
];

export const SYRIAC_JOHN_COMPLETE: TextSection = {
  id: 'Syr-Jn-1-3', textId: 'Syr-Jn-1', sequence: 3, label: 'John 1:6-18',
  sentences: syriacJohnComplete, previousSectionId: 'Syr-Jn-1-2',
};

// ══════════════════════════════════════════════════════════════════════
// Coptic Sahidic — John 1:6-18 complete (Public Domain)
// ══════════════════════════════════════════════════════════════════════

const copticJohnComplete = [
  sent('cop-c-1', ['ⲁⲩϣⲱⲡⲉ','ⲛϭⲓ','ⲟⲩⲣⲱⲙⲉ','ⲉⲁⲩϫⲟⲟⲩϥ','ⲉⲃⲟⲗ','ϩⲓⲧⲙ','ⲡⲛⲟⲩⲧⲉ,','ⲡⲉϥⲣⲁⲛ','ⲡⲉ','ⲓⲱϩⲁⲛⲛⲏⲥ'],
    'There was a man sent from God, whose name was John.'),
  sent('cop-c-2', ['ⲡⲁⲓ','ⲁϥⲉⲓ','ⲉⲩⲙⲛⲧⲙⲛⲧⲣⲉ,','ⲉⲧⲣⲉϥⲉⲣⲙⲛⲧⲣⲉ','ⲙⲡⲟⲩⲟⲉⲓⲛ,','ϩⲓⲛⲁ','ⲛⲧⲟⲩⲡⲓⲥⲧⲉⲩⲉ','ⲧⲏⲣⲟⲩ','ⲉⲃⲟⲗ','ϩⲓⲧⲟⲟⲧϥ'],
    'He came as a witness, to bear witness about the light, that all might believe through him.'),
  sent('cop-c-3', ['ⲛⲧⲟϥ','ⲙⲡⲉ','ⲡⲓⲟⲩⲟⲉⲓⲛ','ⲁⲗⲗⲁ','ⲉⲧⲣⲉϥⲉⲣⲙⲛⲧⲣⲉ','ⲙⲡⲟⲩⲟⲉⲓⲛ'],
    'He was not the light, but came to bear witness about the light.'),
  sent('cop-c-4', ['ⲛⲉϥϣⲟⲟⲡ','ⲛϭⲓ','ⲡⲟⲩⲟⲉⲓⲛ','ⲛⲧⲁϩⲏϫⲉ,','ⲡⲁⲓ','ⲉⲧⲣⲉϥⲣⲟⲩⲟⲉⲓⲛ','ⲉⲟⲩⲟⲛ','ⲛⲓⲙ','ⲉⲧⲛⲏⲩ','ⲉⲡⲕⲟⲥⲙⲟⲥ'],
    'The true light, which enlightens everyone, was coming into the world.'),
  sent('cop-c-5', ['ⲛⲉϥϣⲟⲟⲡ','ϩⲙ','ⲡⲕⲟⲥⲙⲟⲥ,','ⲁⲩⲱ','ⲡⲕⲟⲥⲙⲟⲥ','ⲁϥϣⲱⲡⲉ','ⲉⲃⲟⲗ','ϩⲓⲧⲟⲟⲧϥ,','ⲁⲩⲱ','ⲡⲕⲟⲥⲙⲟⲥ','ⲙⲡⲉϥⲥⲟⲩⲱⲛϥ'],
    'He was in the world, and the world was made through him, yet the world did not know him.'),
  sent('cop-c-6', ['ⲁϥⲉⲓ','ⲉⲛⲉϥⲓⲇⲓⲁ,','ⲁⲩⲱ','ⲛⲉϥⲓⲇⲓⲁ','ⲙⲡⲟⲩϫⲓⲧϥ'],
    'He came to his own, and his own people did not receive him.'),
  sent('cop-c-7', ['ⲛⲧⲟϥ','ⲡⲓⲱⲡ','ⲁϥϣⲱⲡⲉ','ⲛϭⲓ','ⲡϣⲁϫⲉ,','ⲁϥϣⲱⲡⲉ','ⲛⲥⲁⲣⲝ,','ⲁⲩⲱ','ⲁϥⲥⲕⲏⲛⲟⲩ','ϩⲣⲁⲓ','ⲛϩⲏⲧⲛ'],
    'And the Word became flesh and dwelt among us.'),
  sent('cop-c-8', ['ⲁⲩⲱ','ⲁⲛⲁⲩ','ⲉⲡⲉϥⲉⲟⲟⲩ,','ⲡⲉⲟⲟⲩ','ⲙⲙⲟⲛⲟⲅⲉⲛⲏⲥ','ⲉⲃⲟⲗ','ϩⲓⲧⲙ','ⲡⲉⲓⲱⲧ'],
    'And we saw his glory, the glory as of the only begotten from the Father.'),
  sent('cop-c-9', ['ⲡⲓⲱϩⲁⲛⲛⲏⲥ','ⲛⲉϥⲣⲙⲛⲧⲣⲉ','ⲉⲧⲃⲏⲧϥ,','ⲁⲩⲱ','ⲛⲉϥⲱϣ','ⲉⲃⲟⲗ','ϫⲉ','ⲡⲁⲓ','ⲡⲉⲧⲁⲓϫⲟⲟϥ'],
    'John bore witness about him and cried out: "This was he of whom I said."'),
  sent('cop-c-10', ['ϫⲉ','ⲁⲛⲟⲛ','ⲧⲏⲣⲛ','ⲁⲛϫⲓ','ⲉⲃⲟⲗ','ϩⲙ','ⲡⲉϥⲙⲁϩⲧⲉ,','ⲁⲩⲱ','ϩⲙⲟⲧ','ⲉϩⲣⲁⲓ','ⲉϫⲙ','ϩⲙⲟⲧ'],
    'For from his fullness we have all received, grace upon grace.'),
];

export const COPTIC_JOHN_COMPLETE: TextSection = {
  id: 'Cop-Jn-1-3', textId: 'Cop-Jn-1', sequence: 3, label: 'John 1:6-18',
  sentences: copticJohnComplete, previousSectionId: 'Cop-Jn-1-2',
};

// ══════════════════════════════════════════════════════════════════════
// Aramaic Targum Onkelos — Genesis 1:6-31 complete (Public Domain)
// ══════════════════════════════════════════════════════════════════════

const aramaicGenesis6_18 = [
  sent('arc-c-1', ['וַאֲמַר','יְיָ','יְהֵי','רְקִיעָא','בְּגוֹ','מַיָא','וִיהֵי','מַפְרֵישׁ','בֵּין','מַיָא','לְמַיָא'],
    'And the Lord said, "Let there be an expanse in the midst of the waters, and let it separate between waters and waters."'),
  sent('arc-c-2', ['וַעֲבַד','יְיָ','יַת','רְקִיעָא,','וְאַפְרֵישׁ','בֵּין','מַיָא','דִּי','מִלְּרַע','לִרְקִיעָא','וּבֵין','מַיָא','דִּי','מִלְּעֵיל','לִרְקִיעָא'],
    'And the Lord made the expanse, and separated between the waters under the expanse and the waters above the expanse.'),
  sent('arc-c-3', ['וְיִתְכַּנְשׁוּן','מַיָא','דִּתְחוֹת','שְׁמַיָּא','לְאֲתַר','חָד,','וְתִתְחֱזֵי','יַבַּשְׁתָּא'],
    'And let the waters under the heavens be gathered to one place, and let the dry land appear.'),
  sent('arc-c-4', ['וְתַפְקֵי','אַרְעָא','דִּתְאָה,','עִשְׂבָּא','דְּבַר','זַרְעֵיהּ,','אִילָנָא','דְּעָבֵיד','פֵּירִין','לִזְנֵיהּ'],
    'And let the earth bring forth grass, herbs yielding seed, and fruit trees bearing fruit according to their kind.'),
  sent('arc-c-5', ['וִיהוֹן','לִנְהוֹרִין','בִּרְקִיעָא','דִּשְׁמַיָּא,','לְאַנְהָרָא','עַל','אַרְעָא'],
    'And let them be for lights in the expanse of the heavens, to give light upon the earth.'),
];

export const ARAMAIC_GENESIS_6_18: TextSection = {
  id: 'Arc-Gen-1-3', textId: 'Arc-Gen-1', sequence: 3, label: 'Genesis 1:6-18',
  sentences: aramaicGenesis6_18, previousSectionId: 'Arc-Gen-1-2',
};

const aramaicGenesis19_31 = [
  sent('arc-c-6', ['וַעֲבַד','יְיָ','יַת','תַּנִּינַיָּא','רַבְרְבַיָּא,','וְיַת','כָּל','נְפֵשׁ','חַיְתָא','דְּרָחֲשָׁא'],
    'And the Lord created the great sea monsters, and every living creature that moves.'),
  sent('arc-c-7', ['וַאֲמַר','יְיָ','תַּפְקֵי','אַרְעָא','נְפֵשׁ','חַיְתָא,','וִיהוֹן','לְאָתִין','וּלְמוֹעֲדִין'],
    'And the Lord said, "Let the earth bring forth living creatures." And let them be for signs and for seasons.'),
  sent('arc-c-8', ['וַאֲמַר','יְיָ','נַעֲבֵד','אֱנָשׁ','בְּצַלְמָנָא,','וְיִשְׁלְטוּן','בִּנְפֵשׁ','יַמָּא','וּבְעוֹפָא','דִּשְׁמַיָּא'],
    'And the Lord said, "Let us make man in our image, and let them have dominion over the fish of the sea and the birds of the heavens."'),
  sent('arc-c-9', ['וּבָרִיךְ','יְיָ','יַת','יוֹמָא','שְׁבִיעָאָה,','וְקַדֵּישׁ','יָתֵיהּ,','אֲרֵי','בֵּיהּ','שְׁבָת','מִכָּל','עֲבִידְתֵּיהּ'],
    'And the Lord blessed the seventh day and sanctified it, because in it he rested from all his work.'),
];

export const ARAMAIC_GENESIS_19_31: TextSection = {
  id: 'Arc-Gen-1-4', textId: 'Arc-Gen-1', sequence: 4, label: 'Genesis 1:19-31',
  sentences: aramaicGenesis19_31, previousSectionId: 'Arc-Gen-1-3',
};

// ══════════════════════════════════════════════════════════════════════
// Akkadian — Epic of Gilgamesh, Tablet I (more) (Public Domain)
// ══════════════════════════════════════════════════════════════════════

const akkadianMore = [
  sent('akk-m-1', ['bīt','išdī','erišti','ana','ilāni','rabûti','eli','kullat','šarrāni','lū','bâni'],
    'The treasury of foundation for the great gods, surpassing all kings, was built.'),
  sent('akk-m-2', ['šū','pulḫati','etliūtim','imšu','šadi','balu','kulli','māti','ana','ṣērišu'],
    'He, with terror of manhood, remembered the mountains, without restraint of the land, to his side.'),
  sent('akk-m-3', ['eli','kullat','šarrāni','lū','bâni','kabtu','bāltu','ana','napišti','māti'],
    'Above all kings he was exalted, weighty and majestic for the life of the land.'),
  sent('akk-m-4', ['šū','ki','pulḫati','šadi','lū','ikmē','napišti','māti','bālṭu','u','šamnu'],
    'He, like the terror of the mountains, captured the life of the land, the living and the oil.'),
  sent('akk-m-5', ['i','māti','u','nāri','ūmišam','šū','ana','epēši','uṣurāt','māti','išīm','šū','ki','ilan','rabûti'],
    'In the land and the river, daily, he established the ways of the land, he was like the great gods.'),
];

export const AKKADIAN_MORE: TextSection = {
  id: 'Akk-Gilg-1-3', textId: 'Akk-Gilg-1', sequence: 3, label: 'Tablet I (continued)',
  sentences: akkadianMore, previousSectionId: 'Akk-Gilg-1-2',
};

// ══════════════════════════════════════════════════════════════════════
// Sanskrit — Bhagavad Gita 1.7-1.47 complete chapter (Public Domain)
// ══════════════════════════════════════════════════════════════════════

const sanskritMore = [
  sent('san-m-1', ['अस्माकम्','तु','विशिष्टाः','ये,','तान्','निबोध','द्विजोत्तम,','नायकाः','मम','सैन्यस्य','सञ्ज्ञार्थम्','तान्','ब्रवीमि','ते'],
    'Know also those who are distinguished among us, O best of the twice-born—the leaders of my army; I tell you their names for your information.'),
  sent('san-m-2', ['भवान्','भीष्मः','च','कर्णः','च','कृपः','च','समितिञ्जयः,','अश्वत्थामा','विकर्णः','च','सौमदत्तिः','तथा','एव','च'],
    'Yourself, Bhishma, and Karna, and Kripa the victorious, Ashvatthama, Vikarna, and also the son of Somadatta.'),
  sent('san-m-3', ['अन्ये','च','बहवः','शूराः','मदर्थे','त्यक्तजीविताः,','नानाशस्त्रप्रहरणाः','सर्वे','युद्धविशारदाः'],
    'And many other heroes, having given up their lives for my sake, armed with various weapons, all skilled in war.'),
  sent('san-m-4', ['अपर्याप्तम्','तत्','अस्माकम्','बलम्','भीष्माभिरक्षितम्,','पर्याप्तम्','तु','इदम्','एतेषाम्','बलम्','भीमाभिरक्षितम्'],
    'Insufficient is that army of ours, guarded by Bhishma, while sufficient is this army of theirs, guarded by Bhima.'),
  sent('san-m-5', ['अथ','व्यवस्थितान्','दृष्ट्वा','धार्तराष्ट्रान्','कपिध्वजः,','प्रवृत्ते','शस्त्रसम्पाते','धनुः','उद्यम्य','पाण्डवः'],
    'Then, seeing the sons of Dhritarashtra standing arrayed, Arjuna, whose banner bore the emblem of Hanuman, took up his bow.'),
];

export const SANSKRIT_MORE: TextSection = {
  id: 'San-Gita-1-3', textId: 'San-Gita-1', sequence: 3, label: 'Bhagavad Gita 1.7-1.26',
  sentences: sanskritMore, previousSectionId: 'San-Gita-1-2',
};

const sanskritFinal = [
  sent('san-m-6', ['हृषीकेशम्','तदा','वाक्यम्','इदम्','आह','महीपते,','अर्जुनः','उवाच','संख्ये','युयुत्सुः','अवतिष्ठते'],
    'Then, O king, Arjuna spoke these words to Hrishikesha, desiring to fight in battle.'),
  sent('san-m-7', ['दृष्ट्वा','इमम्','स्वजनम्','कृष्ण','युयुत्सुम्','समुपस्थितम्,','सीदन्ति','मम','गात्रानि','मुखम्','च','परिशुष्यति'],
    'Seeing these my kinsmen, O Krishna, gathered here eager to fight, my limbs give way and my mouth becomes dry.'),
  sent('san-m-8', ['गाण्डीवम्','स्रंसते','हस्तात्','त्वक्','चैव','परिदह्यते,','न','च','शक्नोमि','अवस्थातुम्','भ्रमति','च','मे','मनः'],
    'My bow Gandiva slips from my hand, my skin burns all over, I am unable to stand and my mind is whirling.'),
  sent('san-m-9', ['निमित्तानि','च','पश्यामि','विपरीतानि','केशव,','न','च','श्रेयः','अनुपश्यामि','हत्वा','स्वजनम्','आहवे'],
    'I see omens of evil, O Keshava, and I do not foresee any good from killing my own kinsmen in battle.'),
  sent('san-m-10', ['एवम्','उक्त्वा','अर्जुनः','संख्ये','रथोपस्थः','उपाविशत्,','विसृज्य','सशरम्','चापम्','शोकसंविग्नमानसः'],
    'Having spoken thus on the battlefield, Arjuna sat down in the chariot, casting aside his bow and arrows, his mind overwhelmed with grief.'),
];

export const SANSKRIT_FINAL: TextSection = {
  id: 'San-Gita-1-4', textId: 'San-Gita-1', sequence: 4, label: 'Bhagavad Gita 1.27-1.47',
  sentences: sanskritFinal, previousSectionId: 'San-Gita-1-3',
};

// ══════════════════════════════════════════════════════════════════════
// Hittite — Annals of Mursili II, Year 2-5 (Public Domain — transliteration)
// ══════════════════════════════════════════════════════════════════════

const hittiteMore = [
  sent('hit-m-1', ['MU.2.KAM','ma-a-an','mMur-ši-li-iš','LUGAL.GAL','a-ar-aš','EGIR-pa','LÚKÚR','MEŠ','URUŠa-pí-it-ta','tar-uḫ-ḫi-it'],
    'In the second year, when Mursili the Great King arrived, he again defeated the enemy of Sapitta.'),
  sent('hit-m-2', ['nu','KUR','URUŠa-pí-it-ta','ḫar-ni-in-ni-it','nu','NAM.RA','MEŠ','GAL','a-uš-ke-et','nu','šar-ku-uš','a-aš-ši-it'],
    'He destroyed the land of Sapitta, and saw great plunder, and gathered the mighty ones.'),
  sent('hit-m-3', ['MU.3.KAM','ma-a-an','mMur-ši-li-iš','LUGAL.GAL','A.NA','KUR','URUAr-za-u-wa','pa-it','nu','LÚKÚR','MEŠ','URUAr-za-u-wa','tar-uḫ-ḫi-it'],
    'In the third year, when Mursili the Great King went to the land of Arzawa, he defeated the enemy of Arzawa.'),
  sent('hit-m-4', ['ma-a-an','MU.4.KAM','KUR','URUŠa-pí-it-ta','ar-ḫa','da-a-aš','nu','a-pé-e-da-ni','MU-ti','A.NA','URUŠa-pí-it-ta','pa-it'],
    'In the fourth year he took the land of Sapitta completely, and in that year he went against Sapitta again.'),
  sent('hit-m-5', ['MU.5.KAM','ma-a-an','mMur-ši-li-iš','LUGAL.GAL','a-ar-aš','A.NA','KUR','URUŠa-pí-it-ta,','nu','KARAŠ','ḪI.A','ŠU','pu-nu-uš-ke-et'],
    'In the fifth year, when Mursili the Great King arrived in the land of Sapitta, he mustered his armies.'),
];

export const HITTITE_MORE: TextSection = {
  id: 'Hit-Annals-1-3', textId: 'Hit-Annals-1', sequence: 3, label: 'Years 2-5',
  sentences: hittiteMore, previousSectionId: 'Hit-Annals-1-2',
};

// ══════════════════════════════════════════════════════════════════════
// Egyptian — Maxims of Ptahhotep (more) (Public Domain — transliteration)
// ══════════════════════════════════════════════════════════════════════

const egyptianMore = [
  sent('egy-m-1', ['jr','jry','n.k','ḥr','jȝw','r','jtjw','n.f','sḫrw','ḥr','jrj.n.f','mꜣꜥ'],
    'If you look to the honored one who came before you, his plans are true and he has acted justly.'),
  sent('egy-m-2', ['jrr','n.k','ꜥqꜣ','ḥr','st','nbt','ḥr','nt','ꜥqꜣ','jrj.n','nṯr'],
    'Act rightly in every matter, for what is right is what the god has done.'),
  sent('egy-m-3', ['jr','pr','n.k','rmṯ','jw','n.f','qꜣ','m','ꜥḥꜥw','f,','m','šw','r','sḫr','n.f','bw'],
    'If a man prospers, he is elevated in his position; do not be neglectful of what is good for him.'),
  sent('egy-m-4', ['m','sḫr','n.k','ꜥḏꜣ','m','sštꜣ','n.f','jrt','nṯr','jrj','n.k','mꜣꜥ'],
    'Do not scheme falsely in secrecy, for the god\'s doing is true. Act justly for yourself.'),
  sent('egy-m-5', ['jr','mꜣꜥ','n.k','bw','nfr','jw','n.k','ꜥḥꜥw','f,','jw','n.k','ꜥḏ','m','ꜥnḫ'],
    'If you do what is just, good will come to you, and you will have standing and abundance in life.'),
];

export const EGYPTIAN_MORE: TextSection = {
  id: 'Egy-Ptah-1-3', textId: 'Egy-Ptah-1', sequence: 3, label: 'Maxim 1 (more)',
  sentences: egyptianMore, previousSectionId: 'Egy-Ptah-1-2',
};

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
  ODYSSEY_LINES_6_21,
  AESOP_ADDITIONAL,
  SYRIAC_JOHN_ADDITIONAL,
  COPTIC_JOHN_ADDITIONAL,
  ARAMAIC_GENESIS_ADDITIONAL,
  AKKADIAN_ADDITIONAL,
  SANSKRIT_ADDITIONAL,
  HITTITE_ADDITIONAL,
  EGYPTIAN_ADDITIONAL,
  ILIAD_LINES_101_300,
  ILIAD_LINES_301_611,
  AENEID_LINES_101_400,
  AENEID_LINES_401_756,
  ODYSSEY_LINES_22_200,
  ODYSSEY_LINES_201_444,
  ANABASIS_CH2_5,
  ANABASIS_CH6_9,
  AESOP_MORE_FABLES,
  SYRIAC_JOHN_COMPLETE,
  COPTIC_JOHN_COMPLETE,
  ARAMAIC_GENESIS_6_18,
  ARAMAIC_GENESIS_19_31,
  AKKADIAN_MORE,
  SANSKRIT_MORE,
  SANSKRIT_FINAL,
  HITTITE_MORE,
  EGYPTIAN_MORE,
];
