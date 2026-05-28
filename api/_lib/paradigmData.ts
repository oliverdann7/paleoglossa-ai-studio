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
    id: 'grc-omega-mid-pass',
    label: 'ω-Verb: Present Middle/Passive (λύομαι)',
    language: 'grc',
    pos: 'verb',
    endings: ['ομαι', 'εσθαι'],
    markdown: `## ω-Verb Present Middle/Passive — λύομαι (lúomai)

### Present Middle/Passive Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | λύ**ομαι** | λυ**όμεθα** |
| 2nd | λύ**ῃ** (λύει) | λύ**εσθε** |
| 3rd | λύ**εται** | λύ**ονται** |

### Imperfect Middle/Passive Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | ἐλυ**όμην** | ἐλυ**όμεθα** |
| 2nd | ἐλύ**ου** | ἐλύ**εσθε** |
| 3rd | ἐλύ**ετο** | ἐλύ**οντο** |

### Present Middle/Passive Infinitive
λύ**εσθαι**

> The **middle voice** expresses action in the subject's own interest. The **passive voice** expresses the subject receiving action. Present/Imperfect forms are identical for both voices.`,
  },
  {
    id: 'grc-aorist-pass',
    label: 'Aorist Passive (ἐλύθην)',
    language: 'grc',
    pos: 'verb',
    endings: ['θην', 'θης', 'θη', 'θημεν', 'θητε', 'θησαν'],
    markdown: `## Aorist Passive — ἐλύθην (elúthēn, "I was loosened")

### Aorist Passive Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | ἐλύ**θην** | ἐλύ**θημεν** |
| 2nd | ἐλύ**θης** | ἐλύ**θητε** |
| 3rd | ἐλύ**θη** | ἐλύ**θησαν** |

### Aorist Passive Infinitive & Participle
- Infinitive: λυ**θῆναι**
- Participle (M/F/N): λυ**θείς** / λυ**θεῖσα** / λυ**θέν**

> The aorist passive adds **-θη-** (or **-η-** for 2nd aorist passives) after the verb stem, plus an augment (ε-) in the indicative. It is conjugated with **active** personal endings.`,
  },
  {
    id: 'grc-perfect-mid-pass',
    label: 'Perfect Middle/Passive (λέλυμαι)',
    language: 'grc',
    pos: 'verb',
    endings: ['μαι', 'σαι', 'ται', 'μεθα', 'σθε', 'νται'],
    markdown: `## Perfect Middle/Passive — λέλυμαι (lélümai, "I have been loosened")

### Perfect Middle/Passive Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | λέλυ**μαι** | λελύ**μεθα** |
| 2nd | λέλυ**σαι** | λέλυ**σθε** |
| 3rd | λέλυ**ται** | λελύ**νται** |

### Perfect Middle/Passive Infinitive & Participle
- Infinitive: λελύ**σθαι**
- Participle (M/F/N): λελυ**μένος** / λελυ**μένη** / λελυ**μένον**

> The perfect middle/passive uses the **reduplicated stem** + middle personal endings directly on the stem (no connecting vowel). Consonant stems undergo significant changes before μ, σ, τ endings.`,
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
    id: 'lat-2conj',
    label: '2nd Conjugation (moneō)',
    language: 'lat',
    pos: 'verb',
    endings: ['ēre', 'ere'],
    markdown: `## 2nd Conjugation — moneō, monēre (to warn/advise)

### Present Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | mon**eō** | monē**mus** |
| 2nd | monē**s** | monē**tis** |
| 3rd | mone**t** | mone**nt** |

### Imperfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | monē**bam** | monē**bāmus** |
| 2nd | monē**bās** | monē**bātis** |
| 3rd | monē**bat** | monē**bant** |

### Future Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | monē**bō** | monē**bimus** |
| 2nd | monē**bis** | monē**bitis** |
| 3rd | monē**bit** | monē**bunt** |

### Perfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | monu**ī** | monu**imus** |
| 2nd | monu**istī** | monu**istis** |
| 3rd | monu**it** | monu**ērunt** |

### Principal Parts
moneō · monēre · monuī · monitum`,
  },
  {
    id: 'lat-3conj',
    label: '3rd Conjugation (regō)',
    language: 'lat',
    pos: 'verb',
    endings: ['ere', 'ō'],
    markdown: `## 3rd Conjugation — regō, regere (to rule/lead)

### Present Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | reg**ō** | reg**imus** |
| 2nd | reg**is** | reg**itis** |
| 3rd | reg**it** | reg**unt** |

### Imperfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | regē**bam** | regē**bāmus** |
| 2nd | regē**bās** | regē**bātis** |
| 3rd | regē**bat** | regē**bant** |

### Future Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | reg**am** | reg**ēmus** |
| 2nd | reg**ēs** | reg**ētis** |
| 3rd | reg**et** | reg**ent** |

### Perfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | rēx**ī** | rēx**imus** |
| 2nd | rēx**istī** | rēx**istis** |
| 3rd | rēx**it** | rēx**ērunt** |

### Principal Parts
regō · regere · rēxī · rēctum`,
  },
  {
    id: 'lat-4conj',
    label: '4th Conjugation (audiō)',
    language: 'lat',
    pos: 'verb',
    endings: ['īre', 'ire'],
    markdown: `## 4th Conjugation — audiō, audīre (to hear)

### Present Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | aud**iō** | audī**mus** |
| 2nd | audī**s** | audī**tis** |
| 3rd | audi**t** | audi**unt** |

### Imperfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | audiē**bam** | audiē**bāmus** |
| 2nd | audiē**bās** | audiē**bātis** |
| 3rd | audiē**bat** | audiē**bant** |

### Future Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | aud**iam** | aud**iēmus** |
| 2nd | aud**iēs** | aud**iētis** |
| 3rd | aud**iet** | aud**ient** |

### Perfect Active Indicative
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | audīv**ī** | audīv**imus** |
| 2nd | audīv**istī** | audīv**istis** |
| 3rd | audīv**it** | audīv**ērunt** |

### Principal Parts
audiō · audīre · audīvī · audītum`,
  },
  {
    id: 'lat-4decl',
    label: '4th Declension (cornū)',
    language: 'lat',
    pos: 'noun',
    endings: ['us', 'ū', 'uī'],
    markdown: `## 4th Declension — cornū, cornūs n. (horn)

| Case | Singular | Plural |
|------|----------|--------|
| **Nom** | corn**ū** | corn**ua** |
| **Gen** | corn**ūs** | corn**uum** |
| **Dat** | corn**uī** | corn**ibus** |
| **Acc** | corn**ū** | corn**ua** |
| **Abl** | corn**ū** | corn**ibus** |
| **Voc** | corn**ū** | corn**ua** |

### Masc/Fem example — gradus, gradūs m. (step, rank)
| Case | Singular | Plural |
|------|----------|--------|
| **Nom** | grad**us** | grad**ūs** |
| **Gen** | grad**ūs** | grad**uum** |
| **Dat** | grad**uī** | grad**ibus** |
| **Acc** | grad**um** | grad**ūs** |
| **Abl** | grad**ū** | grad**ibus** |
| **Voc** | grad**us** | grad**ūs** |`,
  },
  {
    id: 'lat-5decl',
    label: '5th Declension (rēs)',
    language: 'lat',
    pos: 'noun',
    endings: ['ēs', 'eī', 'em'],
    markdown: `## 5th Declension — rēs, reī f. (thing, affair)

| Case | Singular | Plural |
|------|----------|--------|
| **Nom** | r**ēs** | r**ēs** |
| **Gen** | r**eī** | r**ērum** |
| **Dat** | r**eī** | r**ēbus** |
| **Acc** | r**em** | r**ēs** |
| **Abl** | r**ē** | r**ēbus** |
| **Voc** | r**ēs** | r**ēs** |

> Most 5th-declension nouns are feminine. Only **diēs** (day) and **merīdiēs** (midday) are masculine.`,
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

// ─── Syriac ──────────────────────────────────────────────────────────────────

const SYR_PARADIGMS: ParadigmEntry[] = [
  {
    id: 'syr-peal-perfect',
    label: 'Peal Perfect',
    language: 'syr',
    pos: 'verb',
    endings: [],
    markdown: `## Peal Perfect — ܟܬܰܒ (kṯaḇ, "he wrote")

| Person | Singular | Plural |
|--------|----------|--------|
| 3ms | ܟܬܰ**ܒ** (kṯaḇ) | ܟܬܰ**ܒܘ** (kṯaḇw) |
| 3fs | ܟܶܬܒܰ**ܬ** (keṯbaṯ) | ܟܬܰ**ܒ̈ܝ** (kṯaḇy) |
| 2ms | ܟܬܰܒ**ܬ** (kṯaḇt) | ܟܬܰܒ**ܬܘܢ** (kṯaḇtōn) |
| 2fs | ܟܬܰܒ**ܬܝ** (kṯaḇty) | ܟܬܰܒ**ܬܝܢ** (kṯaḇtēn) |
| 1cs | ܟܶܬܒ**ܶܬ** (keṯbeṯ) | ܟܬܰܒ**ܢ** (kṯaḇn) |

> **Peal** is the basic active stem in Syriac (equivalent to Hebrew Qal). Perfect expresses completed action.`,
  },
  {
    id: 'syr-peal-imperfect',
    label: 'Peal Imperfect',
    language: 'syr',
    pos: 'verb',
    endings: [],
    markdown: `## Peal Imperfect — ܢܶܟܬܘܒ (neḵtōḇ, "he will write")

| Person | Singular | Plural |
|--------|----------|--------|
| 3ms | **ܢ**ܶܟܬܘ**ܒ** (neḵtōḇ) | **ܢ**ܶܟܬܒ**ܘܢ** (neḵtḇōn) |
| 3fs | **ܬ**ܶܟܬܘ**ܒ** (teḵtōḇ) | **ܢ**ܶܟܬܒ**ܢ** (neḵtḇān) |
| 2ms | **ܬ**ܶܟܬܘ**ܒ** (teḵtōḇ) | **ܬ**ܶܟܬܒ**ܘܢ** (teḵtḇōn) |
| 2fs | **ܬ**ܶܟܬܒ**ܝܢ** (teḵtḇīn) | **ܬ**ܶܟܬܒ**ܢ** (teḵtḇān) |
| 1cs | **ܐ**ܶܟܬܘ**ܒ** (eḵtōḇ) | **ܢ**ܶܟܬܘ**ܒ** (neḵtōḇ) |

> The imperfect uses **prefixed** person markers. Syriac has the same prefix system as other Aramaic dialects.`,
  },
  {
    id: 'syr-noun-states',
    label: 'Noun States (Absolute / Construct / Emphatic)',
    language: 'syr',
    pos: 'noun',
    endings: ['ܐ', 'ܬܐ'],
    markdown: `## Syriac Noun States — ܡܰܠܟܳܐ (malkā, "king")

| State | Masculine Sg | Masculine Pl | Feminine Sg | Feminine Pl |
|-------|-------------|-------------|-------------|-------------|
| **Absolute** | ܡܰܠܶ**ܟ** (maleḵ) | ܡܰܠܟ**ܺܝܢ** (malkīn) | ܡܰܠܟ**ܳܐ** (malkā) | ܡܰܠܟ**ܳܢ** (malkān) |
| **Construct** | ܡܰܠܶ**ܟ** (maleḵ) | ܡܰܠܟ**ܰܝ** (malkay) | ܡܰܠܟ**ܰܬ** (malkaṯ) | ܡܰܠܟ**ܳܬ** (malkāṯ) |
| **Emphatic** | ܡܰܠܟ**ܳܐ** (malkā) | ܡܰܠܟ**ܶܐ** (malkē) | ܡܰܠܟ**ܬܳܐ** (malkṯā) | ܡܰܠܟ**ܳܬܳܐ** (malkāṯā) |

> The **emphatic state** (with suffix **-ā**) is the default/definite form in Syriac, unlike Hebrew where the article is prefixed.`,
  },
  {
    id: 'syr-verb-stems',
    label: 'Verb Stems Overview',
    language: 'syr',
    pos: 'verb',
    endings: [],
    markdown: `## Syriac Verb Stems (ܒܢܝ̈ܢܐ)

| Stem | Pattern | Voice | Example |
|------|---------|-------|---------|
| **Peal** (ܦܥܰܠ) | basic | Simple active | ܟܬܰܒ (kṯaḇ) "wrote" |
| **Ethpeel** (ܐܶܬܦܥܶܠ) | reflexive/passive | Simple passive | ܐܶܬܟܬܶܒ (eṯkteḇ) "was written" |
| **Pael** (ܦܰܥܶܠ) | intensive | Intensive active | ܟܰܬܶܒ (katteḇ) "inscribed" |
| **Ethpaal** (ܐܶܬܦܰܥܰܠ) | intensive passive | Intensive passive | ܐܶܬܟܰܬܰܒ (eṯkattaḇ) "was inscribed" |
| **Aphel** (ܐܰܦܥܶܠ) | causative | Causative active | ܐܰܟܬܶܒ (aḵteḇ) "caused to write" |
| **Ettaphal** (ܐܶܬܬܰܦܥܰܠ) | causative passive | Causative passive | ܐܶܬܬܰܟܬܰܒ (ettaḵtaḇ) "was caused to write" |
| **Saphel** (ܫܰܦܥܶܠ) | rare causative | — | (rare, mostly lexicalized) |

> Syriac stems correspond to Hebrew binyanim: Peal ≈ Qal, Pael ≈ Piel, Aphel ≈ Hiphil.`,
  },
];

// ─── Coptic ──────────────────────────────────────────────────────────────────

const COP_PARADIGMS: ParadigmEntry[] = [
  {
    id: 'cop-subject-pronouns',
    label: 'Subject Pronouns & Verbal Prefixes',
    language: 'cop',
    pos: 'verb',
    endings: [],
    markdown: `## Coptic Subject Pronouns & Verbal Prefixes (Sahidic)

### Independent Pronouns
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | ⲁⲛⲟⲕ (anok) | ⲁⲛⲟⲛ (anon) |
| 2nd m | ⲛⲧⲟⲕ (ntok) | ⲛⲧⲱⲧⲛ (ntōtn) |
| 2nd f | ⲛⲧⲟ (nto) | ⲛⲧⲱⲧⲛ (ntōtn) |
| 3rd m | ⲛⲧⲟϥ (ntof) | ⲛⲧⲟⲟⲩ (ntoou) |
| 3rd f | ⲛⲧⲟⲥ (ntos) | ⲛⲧⲟⲟⲩ (ntoou) |

### Pronominal Prefixes (Present Tense)
| Person | Singular | Plural |
|--------|----------|--------|
| 1st | ϯ- (ti-) | ⲧⲛ- (tn-) |
| 2nd m | ⲕ- (k-) | ⲧⲉⲧⲛ- (tetn-) |
| 2nd f | ⲧⲉ- (te-) | ⲧⲉⲧⲛ- (tetn-) |
| 3rd m | ϥ- (f-) | ⲥⲉ- (se-) |
| 3rd f | ⲥ- (s-) | ⲥⲉ- (se-) |

> Coptic verbs conjugate by **prefixing** a subject marker. The verb stem itself does not change.`,
  },
  {
    id: 'cop-tense-patterns',
    label: 'Tense/Aspect Patterns',
    language: 'cop',
    pos: 'verb',
    endings: [],
    markdown: `## Coptic Tense/Aspect Patterns (Sahidic)

Using ⲥⲱⲧⲙ (sōtm, "hear") with 3ms subject:

| Pattern | Form | Meaning |
|---------|------|---------|
| **Present** | ϥ-ⲥⲱⲧⲙ (f-sōtm) | he hears |
| **Past** | ⲁ-ϥ-ⲥⲱⲧⲙ (a-f-sōtm) | he heard |
| **Future** | ϥ-ⲛⲁ-ⲥⲱⲧⲙ (f-na-sōtm) | he will hear |
| **Habitual** | ϣⲁ-ϥ-ⲥⲱⲧⲙ (sha-f-sōtm) | he (usually) hears |
| **Negative Present** | ⲛ-ϥ-ⲥⲱⲧⲙ ⲁⲛ (n-f-sōtm an) | he does not hear |
| **Negative Past** | ⲙⲡ-ϥ-ⲥⲱⲧⲙ (mp-f-sōtm) | he did not hear |
| **Imperative** | ⲥⲱⲧⲙ (sōtm) | hear! |

> Coptic is **analytic**: tense, aspect, and negation are expressed through particles and prefixes, not verb stem changes.`,
  },
  {
    id: 'cop-noun-articles',
    label: 'Noun Articles & Possessives',
    language: 'cop',
    pos: 'noun',
    endings: ['ⲡ', 'ⲧ', 'ⲛ'],
    markdown: `## Coptic Articles & Possessive Prefixes (Sahidic)

### Definite Articles
| | Masculine | Feminine | Plural |
|--|-----------|----------|--------|
| **Article** | ⲡ- (p-) | ⲧ- (t-) | ⲛ- (n-) |
| **Example** | ⲡ-ⲣⲱⲙⲉ (p-rōme) "the man" | ⲧ-ⲥϩⲓⲙⲉ (t-shime) "the woman" | ⲛ-ⲣⲱⲙⲉ (n-rōme) "the men" |

### Indefinite Articles
| | Masculine | Feminine | Plural |
|--|-----------|----------|--------|
| **Article** | ⲟⲩ- (ou-) | ⲟⲩ- (ou-) | ϩⲉⲛ- (hen-) |

### Possessive Prefixes (e.g. "my/your/his…")
| Person | Masculine | Feminine | Plural |
|--------|-----------|----------|--------|
| 1sg | ⲡⲁ- (pa-) | ⲧⲁ- (ta-) | ⲛⲁ- (na-) |
| 2ms | ⲡⲉⲕ- (pek-) | ⲧⲉⲕ- (tek-) | ⲛⲉⲕ- (nek-) |
| 3ms | ⲡⲉϥ- (pef-) | ⲧⲉϥ- (tef-) | ⲛⲉϥ- (nef-) |

> Gender and number are marked on the **article**, not on the noun itself.`,
  },
];

// ─── Aramaic ─────────────────────────────────────────────────────────────────

const ARC_PARADIGMS: ParadigmEntry[] = [
  {
    id: 'arc-peal-perfect',
    label: 'Peal Perfect',
    language: 'arc',
    pos: 'verb',
    endings: [],
    markdown: `## Peal Perfect — כְּתַב (kəṯaḇ, "he wrote")

| Person | Singular | Plural |
|--------|----------|--------|
| 3ms | כְּתַ**ב** (kəṯaḇ) | כְּתַ**בוּ** (kəṯaḇū) |
| 3fs | כִּתְבַ**ת** (kiṯḇaṯ) | כְּתַ**בָה** (kəṯaḇā) |
| 2ms | כְּתַבְ**תָּ** (kəṯaḇtā) | כְּתַבְ**תּוּן** (kəṯaḇtūn) |
| 2fs | כְּתַבְ**תִּי** (kəṯaḇtī) | כְּתַבְ**תֵּן** (kəṯaḇtēn) |
| 1cs | כִּתְבֵ**ת** (kiṯḇēṯ) | כְּתַבְ**נָא** (kəṯaḇnā) |

> Biblical Aramaic Peal is the basic active stem, parallel to Hebrew Qal. Suffixed conjugation (perfect).`,
  },
  {
    id: 'arc-noun-states',
    label: 'Noun States (Absolute / Construct / Emphatic)',
    language: 'arc',
    pos: 'noun',
    endings: ['א', 'ה'],
    markdown: `## Aramaic Noun States — מֶלֶךְ (meleḵ, "king")

| State | Singular | Plural |
|-------|----------|--------|
| **Absolute** | מֶלֶ**ךְ** (meleḵ) | מַלְכִ**ין** (malḵīn) |
| **Construct** | מֶלֶ**ךְ** (meleḵ) | מַלְכֵ**י** (malḵē) |
| **Emphatic** | מַלְכָּ**א** (malkā) | מַלְכַיָּ**א** (malḵayyā) |

> The **emphatic state** (suffix **-א**) is the definite form in Aramaic — it functions like a postposed definite article.`,
  },
  {
    id: 'arc-verb-stems',
    label: 'Verb Stems Overview',
    language: 'arc',
    pos: 'verb',
    endings: [],
    markdown: `## Aramaic Verb Stems (Biblical Aramaic)

| Stem | Voice | Example (√כתב) |
|------|-------|-----------------|
| **Peal** | Simple active | כְּתַב (kəṯaḇ) "wrote" |
| **Hithpeel** | Simple reflexive/passive | הִתְכְּתֵב (hiṯkəṯēḇ) "was written" |
| **Pael** | Intensive active | כַּתֵּב (kattēḇ) "inscribed" |
| **Hithpaal** | Intensive passive | הִתְכַּתַּב (hiṯkattaḇ) "was inscribed" |
| **Haphel** | Causative active | הַכְתֵּב (haḵtēḇ) "caused to write" |
| **Hophal** | Causative passive | הֻכְתַּב (huḵtaḇ) "was caused to write" |

> The Aramaic stem system is closely related to Hebrew and Syriac. Peal ≈ Qal, Pael ≈ Piel, Haphel ≈ Hiphil.`,
  },
];

// ─── Sanskrit ────────────────────────────────────────────────────────────────

const SAN_PARADIGMS: ParadigmEntry[] = [
  {
    id: 'san-a-stem-masc',
    label: 'a-stem Masculine (deva-)',
    language: 'san',
    pos: 'noun',
    endings: ['ः', 'स्'],
    markdown: `## a-stem Masculine — देव (deva, "god")

| Case | Singular | Dual | Plural |
|------|----------|------|--------|
| **Nominative** | देव**ः** (devaḥ) | देव**ौ** (devau) | देव**ाः** (devāḥ) |
| **Accusative** | देव**म्** (devam) | देव**ौ** (devau) | देव**ान्** (devān) |
| **Instrumental** | देव**ेन** (devena) | देव**ाभ्याम्** (devābhyām) | देव**ैः** (devaiḥ) |
| **Dative** | देव**ाय** (devāya) | देव**ाभ्याम्** (devābhyām) | देव**ेभ्यः** (devebhyaḥ) |
| **Ablative** | देव**ात्** (devāt) | देव**ाभ्याम्** (devābhyām) | देव**ेभ्यः** (devebhyaḥ) |
| **Genitive** | देव**स्य** (devasya) | देव**योः** (devayoḥ) | देव**ानाम्** (devānām) |
| **Locative** | देव**े** (deve) | देव**योः** (devayoḥ) | देव**ेषु** (deveṣu) |
| **Vocative** | देव (deva) | देव**ौ** (devau) | देव**ाः** (devāḥ) |

> The **a-stem** is the most common declension class in Sanskrit. Note the 8 cases and 3 numbers (singular, dual, plural).`,
  },
  {
    id: 'san-aa-stem-fem',
    label: 'ā-stem Feminine (kanyā-)',
    language: 'san',
    pos: 'noun',
    endings: ['ा'],
    markdown: `## ā-stem Feminine — कन्या (kanyā, "girl")

| Case | Singular | Dual | Plural |
|------|----------|------|--------|
| **Nominative** | कन्य**ा** (kanyā) | कन्य**े** (kanye) | कन्य**ाः** (kanyāḥ) |
| **Accusative** | कन्य**ाम्** (kanyām) | कन्य**े** (kanye) | कन्य**ाः** (kanyāḥ) |
| **Instrumental** | कन्य**या** (kanyayā) | कन्य**ाभ्याम्** (kanyābhyām) | कन्य**ाभिः** (kanyābhiḥ) |
| **Dative** | कन्य**ायै** (kanyāyai) | कन्य**ाभ्याम्** (kanyābhyām) | कन्य**ाभ्यः** (kanyābhyaḥ) |
| **Genitive** | कन्य**ायाः** (kanyāyāḥ) | कन्य**योः** (kanyayoḥ) | कन्य**ानाम्** (kanyānām) |
| **Locative** | कन्य**ायाम्** (kanyāyām) | कन्य**योः** (kanyayoḥ) | कन्य**ासु** (kanyāsu) |`,
  },
  {
    id: 'san-present-active',
    label: 'Present Active (bhū class 1)',
    language: 'san',
    pos: 'verb',
    endings: ['ति', 'न्ति'],
    markdown: `## Present Active Indicative — भू (bhū, "to be") → भवति (bhavati)

### Parasmaipada (Active)
| Person | Singular | Dual | Plural |
|--------|----------|------|--------|
| 3rd | भव**ति** (bhavati) | भव**तः** (bhavataḥ) | भव**न्ति** (bhavanti) |
| 2nd | भव**सि** (bhavasi) | भव**थः** (bhavathaḥ) | भव**थ** (bhavatha) |
| 1st | भव**ामि** (bhavāmi) | भव**ावः** (bhavāvaḥ) | भव**ामः** (bhavāmaḥ) |

### Ātmanepada (Middle)
| Person | Singular | Dual | Plural |
|--------|----------|------|--------|
| 3rd | भव**ते** (bhavate) | भव**ेते** (bhavete) | भव**न्ते** (bhavante) |
| 2nd | भव**से** (bhavase) | भव**ेथे** (bhavethe) | भव**ध्वे** (bhavadhve) |
| 1st | भव**े** (bhave) | भव**ावहे** (bhavāvahe) | भव**ामहे** (bhavāmahe) |

> Sanskrit has two voices: **Parasmaipada** (active) and **Ātmanepada** (middle). Class 1 verbs add the thematic vowel **-a-** to the root.`,
  },
  {
    id: 'san-verb-classes',
    label: 'Ten Verb Classes Overview',
    language: 'san',
    pos: 'verb',
    endings: [],
    markdown: `## Sanskrit Verb Classes (Gaṇa)

| Class | Type | Present Stem | Example |
|-------|------|-------------|---------|
| **1** (bhū) | Thematic | root + a | भू → भव- (bhav-) |
| **2** (ad) | Athematic | root | अद् → अद्- (ad-) |
| **3** (hu) | Reduplicated | redupl. + root | हु → जुहो- (juho-) |
| **4** (div) | Thematic | root + ya | दिव् → दीव्य- (dīvy-) |
| **5** (su) | Athematic | root + nu/no | सु → सुनो- (suno-) |
| **6** (tud) | Thematic | root + a (accented) | तुद् → तुद- (tuda-) |
| **7** (rudh) | Athematic | root + na/n | रुध् → रुण/रुन्ध् |
| **8** (tan) | Athematic | root + u/o | तन् → तनो- (tano-) |
| **9** (krī) | Athematic | root + nā/nī | क्री → क्रीणा- (krīṇā-) |
| **10** (cur) | Thematic | root + aya | चुर् → चोरय- (coraya-) |

> **Thematic** classes (1, 4, 6, 10) insert a vowel between stem and ending. **Athematic** classes (2, 3, 5, 7, 8, 9) attach endings directly to the stem.`,
  },
];

// ─── Index ────────────────────────────────────────────────────────────────────

const BY_LANGUAGE: Record<string, ParadigmEntry[]> = {
  grc: GRC_PARADIGMS,
  'grc-koine': GRC_PARADIGMS,
  lat: LAT_PARADIGMS,
  hbo: HBO_PARADIGMS,
  syr: SYR_PARADIGMS,
  cop: COP_PARADIGMS,
  arc: ARC_PARADIGMS,
  san: SAN_PARADIGMS,
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
