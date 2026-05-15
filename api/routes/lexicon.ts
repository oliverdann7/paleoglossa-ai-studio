import { Router } from 'express';
import { findDictionaryEntry, searchDictionaryEntries as searchCorpusEntries, normalizeSearch, getGlobalDictionary } from '../../src/lib/data/dictionary';
import { getDictionaryEntry as getStaticDictEntry } from '../../src/lib/data/dictionaryDB';
import { getDictionaryEntry, getDictionaryLanguages, searchDictionaryEntries } from '../../src/lib/data/dictionaryDB';

const router = Router();

// ─── Lemmas ──────────────────────────────────────────────────────────────────

router.get('/api/lemmas/:language/:lemma', (req: any, res: any) => {
  try {
    const { language, lemma } = req.params;
    if (!lemma || typeof lemma !== 'string') {
      return res.status(400).json({ error: 'lemma is required', code: 'INVALID_INPUT', field: 'lemma' });
    }
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'language is required', code: 'INVALID_INPUT', field: 'language' });
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
      return res.status(400).json({ error: 'query parameter q is required', code: 'INVALID_INPUT', field: 'q' });
    }
    const results = searchCorpusEntries(
      query.trim(),
      lang && typeof lang === 'string' ? lang : undefined,
      50,
    );
    res.status(200).json(results);
  } catch (err: any) {
    console.error('[lemmas] Error:', err.message);
    res.status(500).json({ error: 'Failed to search lemmas', code: 'INTERNAL_ERROR' });
  }
});

router.get('/api/lemmas/:lemma/paradigm', (_req: any, res: any) => {
  res.status(200).json([]);
});

// ─── Token Lookup ─────────────────────────────────────────────────────────────

router.get('/api/tokens/:language/:token', (req: any, res: any) => {
  try {
    const { language, token } = req.params;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'token is required', code: 'INVALID_INPUT', field: 'token' });
    }
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'language is required', code: 'INVALID_INPUT', field: 'language' });
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

    const lemmaInfo = candidates.map(c => {
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

export default router;
