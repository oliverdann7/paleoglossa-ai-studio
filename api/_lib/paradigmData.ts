export interface ParadigmEntry {
  id: string;
  label: string;
  language: string;
  pos: string;
  endings?: string[];
  patterns?: RegExp[];
  markdown: string;
}

// ─── Ancient Greek ────────────────────────────────────────────────────────────

const GRC_PARADIGMS: ParadigmEntry[] = [
  {
    id: 'grc-2decl-masc',
    label: '2nd Declension (Masculine)',
    language: 'grc',
    pos: 'noun',
    endings: ['ος', 'ου'],
    markdown: `## 2nd Declension — Masculine (e.g. λόγος)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | λόγ**ος** | λόγ**οι** |
| **Genitive** | λόγ**ου** | λόγ**ων** |
| **Dative** | λόγ**ῳ** | λόγ**οις** |
| **Accusative** | λόγ**ον** | λόγ**ους** |
| **Vocative** | λόγ**ε** | λόγ**οι** |

> **Pattern**: stem + thematic vowel **ο/ε** + ending. Nominative singular in **-ος**, vocative singular in **-ε**.`,
  },
  {
    id: 'grc-2decl-neut',
    label: '2nd Declension (Neuter)',
    language: 'grc',
    pos: 'noun',
    endings: ['ον'],
    markdown: `## 2nd Declension — Neuter (e.g. ἔργον)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | ἔργ**ον** | ἔργ**α** |
| **Genitive** | ἔργ**ου** | ἔργ**ων** |
| **Dative** | ἔργ**ῳ** | ἔργ**οις** |
| **Accusative** | ἔργ**ον** | ἔργ**α** |
| **Vocative** | ἔργ**ον** | ἔργ**α** |

> **Rule**: Nom/Acc/Voc are always identical in neuter nouns. Plural Nom/Acc/Voc ends in **-α**.`,
  },
  {
    id: 'grc-1decl-fem-eta',
    label: '1st Declension (Feminine, -η)',
    language: 'grc',
    pos: 'noun',
    endings: ['η', 'ης'],
    markdown: `## 1st Declension — Feminine -η (e.g. ψυχή)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | ψυχ**ή** | ψυχ**αί** |
| **Genitive** | ψυχ**ῆς** | ψυχ**ῶν** |
| **Dative** | ψυχ**ῇ** | ψυχ**αῖς** |
| **Accusative** | ψυχ**ήν** | ψυχ**άς** |
| **Vocative** | ψυχ**ή** | ψυχ**αί** |`,
  },
  {
    id: 'grc-1decl-fem-alpha',
    label: '1st Declension (Feminine, -α)',
    language: 'grc',
    pos: 'noun',
    endings: ['α', 'ας'],
    markdown: `## 1st Declension — Feminine -α (e.g. ἀρχή → ἀρχ-α after ε/ι/ρ)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | ἀρχ**ή** / χώρ**α** | χώρ**αι** |
| **Genitive** | ἀρχ**ῆς** / χώρ**ας** | χωρ**ῶν** |
| **Dative** | ἀρχ**ῇ** / χώρ**ᾳ** | χώρ**αις** |
| **Accusative** | ἀρχ**ήν** / χώρ**αν** | χώρ**ας** |
| **Vocative** | ἀρχ**ή** / χώρ**α** | χώρ**αι** |

> After **ε, ι, ρ** the stem vowel remains **α** throughout singular (pure alpha declension).`,
  },
  {
    id: 'grc-omega-verb',
    label: 'ω-Verb (Present Active)',
    language: 'grc',
    pos: 'verb',
    endings: ['ω', 'εις', 'ει'],
    markdown: `## ω-Verb — Full Tense Overview (e.g. λύω "to loose")

### Present Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | λύ**ω** | λύ**ομεν** |
| 2nd | λύ**εις** | λύ**ετε** |
| 3rd | λύ**ει** | λύ**ουσι(ν)** |

### Imperfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **ἔ**λυ**ον** | **ἐ**λύ**ομεν** |
| 2nd | **ἔ**λυ**ες** | **ἐ**λύ**ετε** |
| 3rd | **ἔ**λυ**ε(ν)** | **ἔ**λυ**ον** |

### Aorist Active Indicative (1st Aorist)
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **ἔ**λυσ**α** | **ἐ**λύσ**αμεν** |
| 2nd | **ἔ**λυσ**ας** | **ἐ**λύσ**ατε** |
| 3rd | **ἔ**λυσ**ε(ν)** | **ἔ**λυσ**αν** |

### Future Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | λύσ**ω** | λύσ**ομεν** |
| 2nd | λύσ**εις** | λύσ**ετε** |
| 3rd | λύσ**ει** | λύσ**ουσι(ν)** |

### Perfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **λέ**λυ**κα** | **λε**λύ**καμεν** |
| 2nd | **λέ**λυ**κας** | **λε**λύ**κατε** |
| 3rd | **λέ**λυ**κε(ν)** | **λε**λύ**κασι(ν)** |

### Present Active Infinitive & Participle
- Infinitive: λύ**ειν**
- Participle (M/F/N): λύ**ων** / λύ**ουσα** / λῦ**ον**`,
  },
  {
    id: 'grc-eimi',
    label: 'εἰμί (to be)',
    language: 'grc',
    pos: 'verb',
    patterns: [/^εἰμί?$/, /^εἶ$/, /^ἐστί?ν?$/, /^εἰσί?ν?$/],
    endings: ['εἰμί'],
    markdown: `## εἰμί — "to be"

### Present Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **εἰμί** | **ἐσμέν** |
| 2nd | **εἶ** | **ἐστέ** |
| 3rd | **ἐστί(ν)** | **εἰσί(ν)** |

### Imperfect Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **ἦν** | **ἦμεν** |
| 2nd | **ἦσθα** | **ἦτε** |
| 3rd | **ἦν** | **ἦσαν** |

### Future Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **ἔσομαι** | **ἐσόμεθα** |
| 2nd | **ἔσῃ** | **ἔσεσθε** |
| 3rd | **ἔσται** | **ἔσονται** |

### Present Infinitive & Participle
- Infinitive: **εἶναι**
- Participle (M/F/N): **ὤν** / **οὖσα** / **ὄν**`,
  },
  {
    id: 'grc-3decl',
    label: '3rd Declension (Consonant Stem)',
    language: 'grc',
    pos: 'noun',
    endings: ['ς', 'ος'],
    markdown: `## 3rd Declension — Consonant Stem (e.g. σάρξ / σαρκ-)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | σάρξ | σάρκ**ες** |
| **Genitive** | σαρκ**ός** | σαρκ**ῶν** |
| **Dative** | σαρκ**ί** | σαρξ**ί(ν)** |
| **Accusative** | σάρκ**α** | σάρκ**ας** |
| **Vocative** | σάρξ | σάρκ**ες** |

> **Key**: always find the stem from the **genitive singular** (remove -ος). 3rd declension is the most varied declension in Greek.`,
  },
];

// ─── Latin ────────────────────────────────────────────────────────────────────

const LAT_PARADIGMS: ParadigmEntry[] = [
  {
    id: 'lat-1decl',
    label: '1st Declension (-a)',
    language: 'lat',
    pos: 'noun',
    endings: ['a', 'ae'],
    markdown: `## 1st Declension — Feminine -a (e.g. puella)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | puell**a** | puell**ae** |
| **Genitive** | puell**ae** | puell**ārum** |
| **Dative** | puell**ae** | puell**īs** |
| **Accusative** | puell**am** | puell**ās** |
| **Ablative** | puell**ā** | puell**īs** |
| **Vocative** | puell**a** | puell**ae** |

> **Note**: Nominative and ablative differ only by vowel length (a vs ā). Most 1st-declension nouns are feminine.`,
  },
  {
    id: 'lat-2decl-masc',
    label: '2nd Declension (-us)',
    language: 'lat',
    pos: 'noun',
    endings: ['us', 'i'],
    markdown: `## 2nd Declension — Masculine -us (e.g. dominus)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | domin**us** | domin**ī** |
| **Genitive** | domin**ī** | domin**ōrum** |
| **Dative** | domin**ō** | domin**īs** |
| **Accusative** | domin**um** | domin**ōs** |
| **Ablative** | domin**ō** | domin**īs** |
| **Vocative** | domin**e** | domin**ī** |`,
  },
  {
    id: 'lat-2decl-neut',
    label: '2nd Declension (-um, Neuter)',
    language: 'lat',
    pos: 'noun',
    endings: ['um'],
    markdown: `## 2nd Declension — Neuter -um (e.g. verbum)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | verb**um** | verb**a** |
| **Genitive** | verb**ī** | verb**ōrum** |
| **Dative** | verb**ō** | verb**īs** |
| **Accusative** | verb**um** | verb**a** |
| **Ablative** | verb**ō** | verb**īs** |
| **Vocative** | verb**um** | verb**a** |`,
  },
  {
    id: 'lat-3decl',
    label: '3rd Declension',
    language: 'lat',
    pos: 'noun',
    endings: ['is', 'em', 'ibus'],
    markdown: `## 3rd Declension — Mixed (e.g. rex / reg-)

| Case | Singular | Plural |
|------|----------|--------|
| **Nominative** | rēx | rēg**ēs** |
| **Genitive** | rēg**is** | rēg**um** |
| **Dative** | rēg**ī** | rēg**ibus** |
| **Accusative** | rēg**em** | rēg**ēs** |
| **Ablative** | rēg**e** | rēg**ibus** |
| **Vocative** | rēx | rēg**ēs** |

> **Key**: find the stem from the **genitive singular** (remove -is). The nominative singular is often irregular.`,
  },
  {
    id: 'lat-1conj',
    label: '1st Conjugation (amō)',
    language: 'lat',
    pos: 'verb',
    endings: ['āre', 'are', 'o', 'as', 'at'],
    markdown: `## 1st Conjugation — amō, amāre (to love)

### Present Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | am**ō** | amā**mus** |
| 2nd | amā**s** | amā**tis** |
| 3rd | ama**t** | ama**nt** |

### Imperfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | amā**bam** | amā**bāmus** |
| 2nd | amā**bās** | amā**bātis** |
| 3rd | amā**bat** | amā**bant** |

### Future Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | amā**bō** | amā**bimus** |
| 2nd | amā**bis** | amā**bitis** |
| 3rd | amā**bit** | amā**bunt** |

### Perfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | amāv**ī** | amāv**imus** |
| 2nd | amāv**istī** | amāv**istis** |
| 3rd | amāv**it** | amāv**ērunt** |

### Principal Parts
amō · amāre · amāvī · amātum`,
  },
  {
    id: 'lat-esse',
    label: 'esse (to be)',
    language: 'lat',
    pos: 'verb',
    patterns: [/^esse?$/, /^sum$/, /^est$/, /^sunt$/],
    endings: ['esse', 'sum'],
    markdown: `## esse — "to be"

### Present Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **sum** | **sumus** |
| 2nd | **es** | **estis** |
| 3rd | **est** | **sunt** |

### Imperfect Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **eram** | **erāmus** |
| 2nd | **erās** | **erātis** |
| 3rd | **erat** | **erant** |

### Future Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **erō** | **erimus** |
| 2nd | **eris** | **eritis** |
| 3rd | **erit** | **erunt** |

### Perfect Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | **fuī** | **fuimus** |
| 2nd | **fuistī** | **fuistis** |
| 3rd | **fuit** | **fuērunt** |

### Infinitives
- Present: **esse**
- Perfect: **fuisse**
- Future: **fore** / **futūrum esse**`,
  },
];

// ─── Biblical Hebrew ──────────────────────────────────────────────────────────

const HBO_PARADIGMS: ParadigmEntry[] = [
  {
    id: 'hbo-qal-perfect',
    label: 'Qal Perfect',
    language: 'hbo',
    pos: 'verb',
    endings: ['ל', 'תי', 'ת'],
    markdown: `## Qal Perfect — קָטַל (qāṭal, "he killed")

| Person | Singular | Plural |
|--------|----------|--------|
| 3ms | קָטַ**ל** | קָטְל**וּ** |
| 3fs | קָטְל**ָה** | קָטְל**וּ** |
| 2ms | קָטַלְ**תָּ** | קְטַלְ**תֶּם** |
| 2fs | קָטַלְ**תְּ** | קְטַלְ**תֶּן** |
| 1cs | קָטַלְ**תִּי** | קָטַלְ**נוּ** |

> **Perfect** expresses completed action. The **Qal** binyan is the simple active stem.`,
  },
  {
    id: 'hbo-qal-imperfect',
    label: 'Qal Imperfect',
    language: 'hbo',
    pos: 'verb',
    endings: ['יִ', 'תִּ', 'יִקְ'],
    markdown: `## Qal Imperfect — יִקְטֹל (yiqṭōl, "he will kill")

| Person | Singular | Plural |
|--------|----------|--------|
| 3ms | **יִ**קְטֹ**ל** | **יִ**קְטְל**וּ** |
| 3fs | **תִּ**קְטֹ**ל** | **תִּ**קְטֹלְ**נָה** |
| 2ms | **תִּ**קְטֹ**ל** | **תִּ**קְטְל**וּ** |
| 2fs | **תִּ**קְטְלִ**י** | **תִּ**קְטֹלְ**נָה** |
| 1cs | **אֶ**קְטֹ**ל** | **נִ**קְטֹ**ל** |

> **Imperfect** expresses incomplete/ongoing action or future. Prefix identifies person/gender/number.`,
  },
  {
    id: 'hbo-noun-masc',
    label: 'Masculine Noun with Suffixes',
    language: 'hbo',
    pos: 'noun',
    endings: ['ים', 'ות'],
    markdown: `## Masculine Noun — דָּבָר (dāḇār, "word/thing")

### Absolute & Construct States
| State | Singular | Plural |
|-------|----------|--------|
| **Absolute** | דָּבָ**ר** | דְּבָרִ**ים** |
| **Construct** | דְּבַ**ר** | דִּבְרֵ**י** |

### With Pronominal Suffixes (singular)
| Suffix | Form | Meaning |
|--------|------|---------|
| 1cs **-ִי** | דְּבָרִ**י** | my word |
| 2ms **-ְךָ** | דְּבָרְ**ךָ** | your word (ms) |
| 2fs **-ֵךְ** | דְּבָרֵ**ךְ** | your word (fs) |
| 3ms **-וֹ** | דְּבָר**וֹ** | his word |
| 3fs **-ָהּ** | דְּבָרָ**הּ** | her word |`,
  },
  {
    id: 'hbo-binyanim',
    label: 'The Seven Binyanim',
    language: 'hbo',
    pos: 'verb',
    endings: [],
    markdown: `## The Seven Binyanim (Verb Stems)

| Binyan | Pattern | Voice | Meaning |
|--------|---------|-------|---------|
| **Qal** | קָטַל | Simple active | basic action |
| **Niphal** | נִקְטַל | Simple passive/reflexive | be killed; kill oneself |
| **Piel** | קִטֵּל | Intensive active | kill repeatedly/intensively |
| **Pual** | קֻטַּל | Intensive passive | be killed intensively |
| **Hiphil** | הִקְטִיל | Causative active | cause to kill |
| **Hophal** | הֻקְטַל | Causative passive | be caused to kill |
| **Hithpael** | הִתְקַטֵּל | Reflexive/reciprocal | kill oneself; kill each other |

> **Root**: Most Hebrew verbs are built on a **3-consonant root** (שֹׁרֶשׁ). The same root appears across all seven binyanim with different vowel patterns and prefixes/infixes.`,
  },
];

// ─── Index ────────────────────────────────────────────────────────────────────

const BY_LANGUAGE: Record<string, ParadigmEntry[]> = {
  grc: GRC_PARADIGMS,
  'grc-koine': GRC_PARADIGMS,
  lat: LAT_PARADIGMS,
  hbo: HBO_PARADIGMS,
};

export function findParadigm(
  lemma: string,
  languageId: string,
  pos?: string
): Omit<ParadigmEntry, 'patterns'> | null {
  const lang = languageId === 'grc-koine' ? 'grc' : languageId;
  const entries = BY_LANGUAGE[lang];
  if (!entries) return null;

  function strip(entry: ParadigmEntry): Omit<ParadigmEntry, 'patterns'> {
    const out: Record<string, unknown> = { ...entry };
    delete out['patterns'];
    return out as Omit<ParadigmEntry, 'patterns'>;
  }

  // 1. Try regex patterns first (irregular/suppletive forms)
  for (const entry of entries) {
    if (entry.patterns?.some((p) => p.test(lemma))) {
      return strip(entry);
    }
  }

  // 2. Longest-ending match
  let best: ParadigmEntry | null = null;
  let bestLen = 0;
  for (const entry of entries) {
    for (const ending of entry.endings ?? []) {
      if (lemma.endsWith(ending) && ending.length > bestLen) {
        if (!pos || entry.pos === pos) {
          best = entry;
          bestLen = ending.length;
        }
      }
    }
  }
  if (best) return strip(best);

  // 3. First entry matching pos, as fallback
  const fallback = entries.find((e) => !pos || e.pos === pos);
  if (fallback) return strip(fallback);

  return null;
}

export function listParadigms(languageId: string): { id: string; label: string }[] {
  const lang = languageId === 'grc-koine' ? 'grc' : languageId;
  return (BY_LANGUAGE[lang] ?? []).map(({ id, label }) => ({ id, label }));
}
