import { Router } from 'express';
import {
  findDictionaryEntry,
  searchDictionaryEntries as searchCorpusEntries,
  normalizeSearch,
  getGlobalDictionary,
  getDictionaryEntries,
} from '../../src/lib/data/dictionary.js';
import { getDictionaryEntry as getStaticDictEntry } from '../../src/lib/data/dictionaryDB.js';
import {
  getDictionaryEntry,
  getDictionaryLanguages,
  searchDictionaryEntries,
} from '../../src/lib/data/dictionaryDB.js';
import { CorpusDB } from '../../src/data/corpus.js';
import { findParadigm, listParadigms } from '../_lib/paradigmData.js';
import { getCacheEntry, upsertCacheEntry } from '../_lib/lexicalCache.js';

const router = Router();

// ─── Lexical Cache ────────────────────────────────────────────────────────────

router.get('/api/lexical-cache/:language/:lemma/:type', async (req: any, res: any) => {
  try {
    const { language, lemma, type } = req.params;
    // Accept English types plus UI-localised glosses keyed `short-gloss:<lang>`.
    const isValidType =
      type === 'short-gloss' || type === 'word-explanation' || /^short-gloss:[a-z]{2}$/.test(type);
    if (!isValidType) {
      return res.status(400).json({ error: 'Invalid type', code: 'INVALID_INPUT' });
    }
    const entry = await getCacheEntry(language, lemma, type as any);
    if (entry) {
      res.status(200).json(entry);
    } else {
      res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    }
  } catch (err: any) {
    console.error('[lexical-cache] GET Error:', err.message);
    res.status(500).json({ error: 'Failed to get cache', code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/lexical-cache', async (req: any, res: any) => {
  try {
    const { languageId, lemma, surface, type, value } = req.body;
    if (!languageId || !lemma || !type || !value) {
      return res.status(400).json({ error: 'Missing required fields', code: 'INVALID_INPUT' });
    }
    await upsertCacheEntry(languageId, lemma, surface, type, value);
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[lexical-cache] POST Error:', err.message);
    res.status(500).json({ error: 'Failed to upsert cache', code: 'INTERNAL_ERROR' });
  }
});

router.get('/api/lemmas/:language/:lemma', (req: any, res: any) => {
  try {
    const { language, lemma } = req.params;
    if (!lemma || typeof lemma !== 'string') {
      return res
        .status(400)
        .json({ error: 'lemma is required', code: 'INVALID_INPUT', field: 'lemma' });
    }
    if (!language || typeof language !== 'string') {
      return res
        .status(400)
        .json({ error: 'language is required', code: 'INVALID_INPUT', field: 'language' });
    }

    const entry = findDictionaryEntry(lemma, language);
    if (entry) {
      return res.status(200).json(entry);
    }

    const staticEntry = getStaticDictEntry(lemma, language);
    if (staticEntry) {
      return res.status(200).json(staticEntry);
    }

    res.status(404).json({ error: 'Lemma not found', code: 'NOT_FOUND' });
  } catch (err: any) {
    console.error('[lemmas/:language/:lemma] Error:', err.message);
    res.status(500).json({ error: 'Failed to look up lemma', code: 'INTERNAL_ERROR' });
  }
});

router.get('/api/lemmas', (req: any, res: any) => {
  try {
    const { q: query, lang } = req.query;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res
        .status(400)
        .json({ error: 'query parameter q is required', code: 'INVALID_INPUT', field: 'q' });
    }
    const results = searchCorpusEntries(
      query.trim(),
      lang && typeof lang === 'string' ? lang : undefined,
      50
    );
    res.status(200).json(results);
  } catch (err: any) {
    console.error('[lemmas] Error:', err.message);
    res.status(500).json({ error: 'Failed to search lemmas', code: 'INTERNAL_ERROR' });
  }
});

router.get('/api/lemmas/:lemma/paradigm', (req: any, res: any) => {
  const lemma = req.params.lemma as string;
  const lang = (req.query.lang as string | undefined) || '';
  const pos = (req.query.pos as string | undefined) || undefined;

  if (lang) {
    const result = findParadigm(lemma, lang, pos);
    if (result) {
      return res.status(200).json({ found: true, ...result });
    }
  }
  res.status(200).json({ found: false, available: lang ? listParadigms(lang) : [] });
});

router.get('/api/paradigms/:lang', (req: any, res: any) => {
  const lang = req.params.lang as string;
  res.status(200).json({ paradigms: listParadigms(lang) });
});

// ─── Attested corpus forms for a lemma ────────────────────────────────────────
// Returns all surface forms found in the corpus for this lemma, grouped with
// their morphological features. Used to render offline paradigm tables.

router.get('/api/lemmas/:language/:lemma/forms', (req: any, res: any) => {
  try {
    const { language, lemma } = req.params;
    if (!lemma || !language) {
      return res.status(400).json({ error: 'language and lemma are required' });
    }

    const texts = CorpusDB.getTexts() as any[];

    const formsMap = new Map<
      string,
      { surface: string; features: Record<string, string>; count: number }
    >();

    for (const text of texts) {
      const textLang = (text as any).languageId || (text as any).language || '';
      if (textLang && textLang !== language && !textLang.startsWith(language)) continue;
      const sections: { id: string }[] = (text as any).sectionsPreview ?? [];
      for (const preview of sections) {
        const section = CorpusDB.getSection(preview.id) as any;
        if (!section?.sentences) continue;
        for (const sentence of section.sentences) {
          for (const token of sentence.tokens ?? []) {
            if (!token.lemma || token.lemma !== lemma) continue;
            const surface = token.surface || token.text || token.normalized || '';
            if (!surface) continue;
            const features: Record<string, string> = {};
            const m = token.morphology || {};
            if (m.partOfSpeech) features.pos = m.partOfSpeech;
            if (m.case) features.case = m.case;
            if (m.number) features.number = m.number;
            if (m.gender) features.gender = m.gender;
            if (m.tense) features.tense = m.tense;
            if (m.voice) features.voice = m.voice;
            if (m.mood) features.mood = m.mood;
            if (m.person) features.person = m.person;
            if (m.stem) features.stem = m.stem;
            const key = surface + '|' + JSON.stringify(features);
            const existing = formsMap.get(key);
            if (existing) existing.count++;
            else formsMap.set(key, { surface, features, count: 1 });
          }
        }
      }
    }

    const forms = Array.from(formsMap.values()).sort((a, b) => b.count - a.count);
    res.status(200).json({ lemma, language, forms });
  } catch (err: any) {
    console.error('[lemmas/:language/:lemma/forms] Error:', err.message);
    res.status(500).json({ error: 'Failed to collect forms', code: 'INTERNAL_ERROR' });
  }
});

// ─── Token Lookup ─────────────────────────────────────────────────────────────

router.get('/api/tokens/:language/:token', (req: any, res: any) => {
  try {
    const { language, token } = req.params;
    if (!token || typeof token !== 'string') {
      return res
        .status(400)
        .json({ error: 'token is required', code: 'INVALID_INPUT', field: 'token' });
    }
    if (!language || typeof language !== 'string') {
      return res
        .status(400)
        .json({ error: 'language is required', code: 'INVALID_INPUT', field: 'language' });
    }

    const normalized = normalizeSearch(token);
    const globalDict = getGlobalDictionary();
    const corpusEntry = findDictionaryEntry(token, language);
    const staticEntry = getStaticDictEntry(token, language);

    const candidates: Array<{ lemma: string; score: number }> = [];
    const seen = new Set<string>();

    if (corpusEntry) {
      candidates.push({ lemma: corpusEntry.lemma, score: 100 });
      seen.add(corpusEntry.lemma);
    }
    if (staticEntry) {
      if (!seen.has(staticEntry.lemma)) {
        candidates.push({ lemma: staticEntry.lemma, score: 80 });
        seen.add(staticEntry.lemma);
      }
    }
    if (normalized !== token) {
      const normalizedEntry = findDictionaryEntry(normalized, language);
      if (normalizedEntry && !seen.has(normalizedEntry.lemma)) {
        candidates.push({ lemma: normalizedEntry.lemma, score: 70 });
        seen.add(normalizedEntry.lemma);
      }
    }

    const searchResults = searchCorpusEntries(token, language, 5);
    for (const result of searchResults) {
      if (!seen.has(result.lemma)) {
        candidates.push({ lemma: result.lemma, score: 50 });
        seen.add(result.lemma);
      }
    }

    const lemmaInfo = candidates.map((c) => {
      const entry = findDictionaryEntry(c.lemma, language);
      const tokenObj = globalDict?.[c.lemma];
      return {
        lemma: c.lemma,
        score: c.score,
        definition: entry?.fullDefinition || entry?.shortGloss || tokenObj?.gloss || null,
        definitionSource: entry ? 'corpus' : tokenObj ? 'token' : null,
        partOfSpeech: entry?.partOfSpeech || tokenObj?.morphology?.partOfSpeech || null,
        transliteration: entry?.transliteration || tokenObj?.transliteration || null,
        frequency: entry?.frequency || 0,
      };
    });

    const bestCandidate = lemmaInfo[0] || null;

    const result: Record<string, any> = {
      language,
      surface: token,
      normalized: normalized !== token ? normalized : undefined,
      lemmaCandidates: lemmaInfo,
      definitions: [] as Array<{ lemma: string; gloss: string; source: string }>,
    };

    if (corpusEntry) {
      result.dictionaryEntry = corpusEntry;
      result.definitions.push({
        lemma: corpusEntry.lemma,
        gloss: corpusEntry.fullDefinition || corpusEntry.shortGloss,
        source: 'corpus-derived',
      });
    }
    if (staticEntry) {
      result.staticEntry = staticEntry;
      result.definitions.push({
        lemma: staticEntry.lemma,
        gloss: staticEntry.fullDefinition || staticEntry.shortGloss,
        source: 'static-dictionary',
      });
    }

    if (!bestCandidate) {
      const tokenObj = globalDict?.[token] || globalDict?.[normalized];
      if (tokenObj) {
        result.definitions.push({
          lemma: tokenObj.lemma || token,
          gloss: tokenObj.gloss || '',
          source: 'corpus-token',
        });
        result.fallbackGloss = tokenObj.gloss || null;
      }
    }

    res.status(200).json(result);
  } catch (err: any) {
    console.error('[tokens/:language/:token] Error:', err.message);
    res.status(500).json({ error: 'Failed to look up token', code: 'INTERNAL_ERROR' });
  }
});

// ─── External Lexicon Lookup (Logeion · Sefaria) ─────────────────────────────
// Server-side proxy so we avoid CORS and can cache/rate-limit in one place.
// Supported languages: grc, grc-koine, lat → Logeion (LSJ / Lewis & Short)
//                      hbo                → Sefaria (BDB)

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

router.get('/api/lexicon-lookup/:language/:lemma', async (req: any, res: any) => {
  const { language, lemma } = req.params;
  if (!lemma || !language) {
    return res
      .status(400)
      .json({ error: 'language and lemma are required', code: 'INVALID_INPUT' });
  }

  const isGreek = language === 'grc' || language === 'grc-koine';
  const isLatin = language === 'lat';
  const isHebrew = language === 'hbo';

  // ── Greek / Latin via Logeion ──────────────────────────────────────────────
  if (isGreek || isLatin) {
    try {
      const url = `https://logeion.uchicago.edu/lexical/info/${encodeURIComponent(lemma)}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Paleoglossa/1.0 (ancient-language learning; paleoglossa.com)',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        return res.status(404).json({ error: 'Not found in Logeion', code: 'NOT_FOUND' });
      }

      const data: Record<string, any[]> = await response.json();

      // Priority order: LSJ > middleLiddell for Greek; ls > logeion for Latin
      const candidateKeys = isLatin ? ['ls', 'logeion'] : ['lsj', 'middleLiddell', 'logeion'];

      const sourceLabels: Record<string, string> = {
        lsj: 'Liddell-Scott-Jones',
        middleLiddell: 'Middle Liddell',
        ls: 'Lewis & Short',
        logeion: 'Logeion',
      };

      for (const key of candidateKeys) {
        const entries = data[key];
        if (!Array.isArray(entries) || entries.length === 0) continue;
        const entry = entries[0];
        const raw = entry?.data?.short || entry?.data?.long || entry?.content || '';
        const text = typeof raw === 'string' ? stripTags(raw) : '';
        if (!text) continue;
        return res.status(200).json({
          lemma,
          language,
          definition: text,
          source: `logeion-${key}`,
          sourceLabel: sourceLabels[key] ?? 'Logeion',
          sourceUrl: `https://logeion.uchicago.edu/${encodeURIComponent(lemma)}`,
        });
      }
      return res
        .status(404)
        .json({ error: 'No usable definition in Logeion response', code: 'NOT_FOUND' });
    } catch (err: any) {
      console.error('[lexicon-lookup] Logeion error:', err.message);
      return res.status(502).json({ error: 'Logeion request failed', code: 'UPSTREAM_ERROR' });
    }
  }

  // ── Biblical Hebrew via Sefaria ────────────────────────────────────────────
  if (isHebrew) {
    try {
      const url = `https://www.sefaria.org/api/lexicon/lookup/${encodeURIComponent(lemma)}`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        return res.status(404).json({ error: 'Not found in Sefaria', code: 'NOT_FOUND' });
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        return res.status(404).json({ error: 'No Sefaria entries', code: 'NOT_FOUND' });
      }

      const entry = data[0];
      const content = entry?.content ?? [];
      let definition = '';

      for (const block of content) {
        if (block?.en) {
          definition = block.en;
          break;
        }
        if (Array.isArray(block?.senses)) {
          const senseDefs = block.senses
            .map((s: any) => s?.definition || s?.en || '')
            .filter(Boolean);
          if (senseDefs.length) {
            definition = senseDefs.join('; ');
            break;
          }
        }
      }

      if (!definition) {
        return res.status(404).json({ error: 'Empty Sefaria entry', code: 'NOT_FOUND' });
      }

      return res.status(200).json({
        lemma,
        language,
        definition: stripTags(definition),
        source: 'sefaria-bdb',
        sourceLabel: entry?.parent_lexicon ?? 'Hebrew Lexicon (Sefaria)',
        sourceUrl: `https://www.sefaria.org/search#lexicon/${encodeURIComponent(lemma)}`,
      });
    } catch (err: any) {
      console.error('[lexicon-lookup] Sefaria error:', err.message);
      return res.status(502).json({ error: 'Sefaria request failed', code: 'UPSTREAM_ERROR' });
    }
  }

  return res
    .status(400)
    .json({ error: 'Language not supported for lexicon lookup', code: 'UNSUPPORTED_LANGUAGE' });
});

// ─── Dictionary ───────────────────────────────────────────────────────────────

router.get('/api/dictionary', (_req: any, res: any) => {
  const languages = getDictionaryLanguages();
  res.status(200).json(languages);
});

router.get('/api/dictionary/:lemma/:lang', (req: any, res: any) => {
  const { lemma, lang } = req.params;
  const entry = getDictionaryEntry(lemma, lang);
  if (entry) {
    res.status(200).json(entry);
  } else {
    res.status(404).json({ error: 'Entry not found' });
  }
});

router.get('/api/dictionary/search', (req: any, res: any) => {
  const { q: query, lang, limit } = req.query;
  const results = searchDictionaryEntries(
    query && typeof query === 'string' ? query : '',
    lang && typeof lang === 'string' ? lang : undefined,
    limit && typeof limit === 'string' ? parseInt(limit, 10) : 20
  );
  res.status(200).json(results);
});

// ─── Lemma Frequency Index ────────────────────────────────────────────────────
// Returns corpus-derived lemma frequencies for a language, sorted by frequency
// descending. Supports pagination via ?limit and ?offset query params.
//
// The index is computed once at first call (getDictionaryEntries is memoised)
// and served from memory on subsequent requests.

router.get('/api/lemma-frequency/:lang', (req: any, res: any) => {
  try {
    const { lang } = req.params;
    if (!lang || typeof lang !== 'string') {
      return res.status(400).json({ error: 'lang is required', code: 'INVALID_INPUT' });
    }

    const limitParam = req.query.limit;
    const offsetParam = req.query.offset;
    const limit =
      limitParam && typeof limitParam === 'string' ? Math.min(parseInt(limitParam, 10), 2000) : 500;
    const offset =
      offsetParam && typeof offsetParam === 'string' ? Math.max(parseInt(offsetParam, 10), 0) : 0;

    const all = getDictionaryEntries();
    const forLang = all.filter((e) => e.languageId === lang);
    const page = forLang.slice(offset, offset + limit);

    res.status(200).json({
      language: lang,
      total: forLang.length,
      offset,
      limit,
      entries: page.map((e) => ({
        lemma: e.lemma,
        frequency: e.frequency,
        gloss: e.shortGloss || '',
        partOfSpeech: e.partOfSpeech || null,
        transliteration: e.transliteration || null,
      })),
    });
  } catch (err: any) {
    console.error('[lemma-frequency/:lang] Error:', err.message);
    res.status(500).json({ error: 'Failed to build frequency index', code: 'INTERNAL_ERROR' });
  }
});

export default router;
