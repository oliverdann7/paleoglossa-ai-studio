# Performance Audit — 2026-05-14

Measured from `main` @ `b7846db` (post-design-tokens, post-premium-app-states).

---

## 1. Build & Bundle

### Bundle Breakdown

| Chunk | Size | What it contains |
|-------|------|------------------|
| `vendor-firebase-*.js` | **696 KB** | Firebase Auth + Firestore + `firebase-admin` API library |
| `corpus-*.js` | **485 KB** | Token arrays, corpus texts, dictionary DB (static data) |
| `vendor-charts-*.js` | **353 KB** | Recharts + Victory charts |
| `vendor-react-*.js` | **293 KB** | React 19 + ReactDOM + react-router-dom |
| `index-*.js` | **220 KB** | App shell, providers, route definitions, Firestore indexes |
| `vendor-markdown-*.js` | **154 KB** | react-markdown + remark/rehype |
| `vendor-motion-*.js` | **114 KB** | `motion` (framer-motion v12) |
| `Reader-*.js` | **80 KB** | Reader page (lazy-loaded) |
| `index-*.css` | **80 KB** | Tailwind CSS (generated) |
| `aiClient-*.js` | **71 KB** | AI client library |
| `dictionary-*.js` | **71 KB** | Dictionary page (lazy-loaded) |
| 17 other page chunks | 10–37 KB each | All lazy-loaded route pages |

**Total JS: ~2.7 MB unpacked, ~676 KB gzipped (est.)**.

### Critical Observation: `corpus-*.js` (485 KB)

This chunk contains ALL token data for all texts in the corpus (SBLGNT John, Anabasis, Aeneid, etc.) loaded eagerly via `src/data/tokens.ts`. It is imported by `src/lib/data/dictionary.ts` (corpus-derived dictionary builder) which is imported by several components. **This chunk cannot be tree-shaken** because the entire `tokens.ts` barrel file is imported as `import * as tokenArrays from '../../data/tokens'` — the entire module is evaluated.

### Noteworthy: React Compiler is Active

`vite.config.ts` enables `babel-plugin-react-compiler`. This auto-memoizes component renders at compile time, mitigating many manual `useMemo`/`useCallback` gaps. This is already ahead of most React apps.

---

## 2. Route-Level Code Splitting

**Status: ALL routes are lazy-loaded via `React.lazy()`** (22 pages + `AppLayout`). This is excellent.

Each page import uses the pattern:
```tsx
const Reader = lazy(() => import('./pages/Reader').then(m => ({ default: m.Reader })));
```

All wrapped in a single `<Suspense fallback={<PageFallback />}>` at `App.tsx:41`. The fallback is a simple "Loading..." card.

**Gap**: The splash/lobby chunk (`index-*.js` at 220 KB) cannot be split further without moving route definitions out of `App.tsx`. This is acceptable for a 220 KB initial load.

---

## 3. Reader Rendering Performance

### High Risk: `chapters` useMemo (Reader.tsx:322)

```tsx
const chapters = useMemo(() => { ... }, [text, t]);
```

Iterates every sentence and every token, calling `getTransliteration()` per token. For John 1–21 (918 sentences, ~15,000 tokens), this is a heavy synchronous computation. Dependency `text` changes on navigation, so switching texts rebuilds the entire chapter tree.

- **Impact**: ~50–100ms pause on text load (felt as a lag).
- **Fix**: Memoize `getTransliteration` results per unique token string, or compute chapters on the server.

### High Risk: Full context destructuring in every consumer (Reader.tsx:110-122)

`useReaderState()` returns a single flat state object. Every consumer destructures `{ state: { display: { ... }, navigation: { ... }, audio: { ... } }, setMode, ... }`. Because `ReaderContext` does `setState({ ...prev, display: { ...prev.display, ...updated } })` — a new `state` reference is created on **every update to any domain**. This propagates to **all** context consumers, even if only the audio state changed.

- **Fix**: Split `ReaderContext` into `ReaderDisplayContext`, `ReaderNavigationContext`, `ReaderAudioContext`. Each domain has its own provider and setter. Components only re-render when their domain changes.
- **Alternative**: Use `useSyncExternalStore` with atomic store slices per domain.

### Medium Risk: localStorage serialization on every state change (ReaderContext.tsx:80-82)

```tsx
useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); });
```

This runs on **every** reader state change (scroll, audio position, display toggle). For a state object of ~50KB, JSON.stringify has measurable cost. On fast scroll, this could queue multiple stringify calls.

- **Fix**: Debounce to 1s using `setTimeout` clear-on-change pattern.

### Medium Risk: Scroll handler creates new closure on text/mode change (Reader.tsx:465-498)

The scroll event listener is rebound whenever `[chapter, readingMode]` change. The handler captures `setScrollProgress` from render scope. This is acceptable but unnecessary churn when navigating between chapters with the same reading mode.

### Low Risk: `handleMarkPageKnown` useCallback (Reader.tsx:663)

Has 15 dependencies in its dep array — any one of them triggers a new function reference. However, this is only called on button click, not in a hot path.

### Existing Mitigation: `useRef` for scroll progress and sentence index

```tsx
const scrollProgressRef = useRef(0);
const currentSentenceIndexRef = useRef(0);
```

These avoid re-renders from scroll/progress updates. Good pattern.

---

## 4. Word Analysis / Knowledge Performance

### Good: Stable `getWordInfo` (useVocabulary.ts:100-102)

```tsx
const getWordInfo = useCallback((lemma: string): WordInfo => {
  return knowledgeRef.current[lemma] ?? NEW_WORD_INFO;
}, []);
```

Singleton for unknown words (`NEW_WORD_INFO`) — same reference every call. `knowledgeVersion` signal prevents deep comparisons. This is well-optimized.

### Good: Vocabulary write batching (vocabularyService.ts:34-85)

- Writes are queued into `vocabWriteQueue` (Map).
- Flushed in batches of up to 500 using `writeBatch()`.
- 2-second debounce coalesces rapid word marking into a single batch.
- This is production-quality and reduces Firestore write costs significantly.

### Medium Risk: Full knowledge spread on every setWordState (useVocabulary.ts:66-86)

`setKnowledge(prev => ({ ...prev, [lemma]: info }))` creates a new object with N keys for every word state change. For 2000+ vocabulary entries, this is a ~2000-key object spread on every word click. Acceptable for in-memory operations (sub-ms) but worth noting.

### Medium Risk: `getDocs` fetches entire vocabulary collection (vocabularyService.ts:100)

Fetches all vocabulary documents for the user on mount. For users with thousands of words, this is a single large Firestore read. Mitigated by:
- 5-minute in-memory cache.
- After initial load, writes are optimistic (no re-fetch).
- **No pagination** — if a user has 10,000+ vocab items, this could be slow.

---

## 5. API & Gemini Performance

### Positive: Quota system for `/api/ai/analyze`

`checkAndIncrementUsage` (api/index.ts:277-290) prevents runaway AI costs per user. Returns 429 when quota exhausted. Good.

### Missing: Quota on other AI endpoints

`/api/ai/translate`, `/api/ai/explain`, `/api/ai/quiz`, `/api/ai/syntax`, `/api/ai/tutor`, `/api/ai/metadata`, `/api/ai/summarize` — none have per-user rate limiting. A user could hammer these endpoints.

### Missing: Timeouts on Gemini calls

Only `/api/ai/scrape` has `AbortSignal.timeout(15000)`. All other AI endpoints let Gemini run indefinitely (Express defaults). If Gemini is slow, the request hangs.

- **Fix**: Add `AbortSignal.timeout(30000)` to all `model.generateContent()` calls.

### Client-Side: No caching of AI responses (aiClient.ts)

Every call to `explainWord`, `translateSentence`, etc. fires an API request. No deduplication (calling `explainWord("λόγος")` twice = two requests).

- **Fix**: Add an LRU cache in `AIClient` keyed by `method+args` with a short TTL (5 minutes). This would benefit the LexDrawerPanel's AI fallback which fires on word tap.

---

## 6. Firebase Performance

### Reads: Single `getDocs` per user session

Vocabulary fetch is one batch read. After initial load, all mutations are optimistic (no re-fetch). This is correct for the app pattern.

### Writes: Batched + debounced (excellent)

As noted in §4, writes are queued and batched. This is a best practice for Firestore.

### API Server: Individual writes

Server-side Firestore writes (notebooks, notes, syntax annotations) are individual document writes. At current usage levels, this is negligible.

---

## 7. PWA & Offline

### Service Worker: Registered

`vite-plugin-pwa` with `registerType: 'autoUpdate'`. Workbox precaches all build assets (JS, CSS, HTML, images, fonts). Google Fonts cached with `CacheFirst` (1 year).

### Offline Reading: Custom localStorage (not SW Cache API)

`OfflineService` (Reader.tsx:25) saves text payloads to localStorage manually. This is functional but limited:
- Texts must be explicitly saved ("download for offline").
- No service worker cache for Firestore vocabulary data.
- No offline fallback UI when network is unavailable.

### Gap: No API caching in SW

Firestore reads and API responses are not cached by the service worker. The app works offline only for pre-cached UI + manually saved texts.

---

## 8. Asset & CSS

### CSS: 80 KB generated Tailwind

This is large for a utility-first framework. Tailwind v4's JIT engine should produce smaller output. The `--text-[10px]` patterns (now largely replaced by `--text-tiny`) generate unique utilities that inflate the CSS.

### Fonts: 4 web fonts via Google Fonts

- Cormorant Garamond (4 weights + italics)
- Crimson Pro (3 weights + italic)
- DM Mono (3 weights)
- Noto Serif Hebrew (3 weights)

**Total font weight files downloaded**: ~14 files (~200 KB total). Google Fonts are cached by the service worker (runtime caching, 1 year).

### SVG Textures: Inline data URI (index.css:106)

```css
background-image: url('data:image/svg+xml;utf8,...');
```

The SVG turbulence noise overlay is inlined as a data URI (~2 KB). This is fine — no extra request.

---

## 9. Prioritized Performance Fixes

| Priority | # | Fix | File(s) | Effort | Impact |
|----------|---|-----|---------|--------|--------|
| **P0** | 1 | Split `ReaderContext` into per-domain providers (display, navigation, audio) | `ReaderContext.tsx`, `Reader.tsx` | Medium | High — prevents cascading re-renders in reader |
| **P0** | 2 | Add AbortSignal timeouts to all Gemini `generateContent` calls | `api/index.ts` AI endpoints | Low | High — prevents hung requests |
| **P1** | 3 | Add per-request quota to remaining AI endpoints (translate, explain, quiz, syntax, etc.) | `api/index.ts` | Medium | Medium — prevents abuse |
| **P1** | 4 | Debounce `persistState` localStorage writes to 1s | `ReaderContext.tsx:80-82` | Low | Medium — reduces scroll jank |
| **P1** | 5 | Memoize `getTransliteration()` results per unique token | `Reader.tsx` chapters builder | Low | Medium — speeds up text load |
| **P2** | 6 | Add `rollup-plugin-visualizer` to dev build for tree-shaking analysis | `vite.config.ts` | Low | Low — analysis only |
| **P2** | 7 | Add LRU cache to `AIClient` for duplicate explainWord calls | `aiClient.ts` | Low | Medium — reduces duplicate AI calls |
| **P2** | 8 | Move `corpus-*.js` to lazy-loaded chunk (only needed by Reader + Dictionary) | `tokens.ts`, `dictionary.ts` imports | High | High — saves 485 KB from initial load |
| **P3** | 9 | Add service worker API caching for Firestore vocabulary reads | `vite.config.ts` PWA config | Medium | Medium — enables offline vocab |
| **P3** | 10 | Add `reportWebVitals()` or custom `performance.mark()` instrumentation | `App.tsx` or root | Low | Low — measurement only |
| **P3** | 11 | Paginate vocabulary Firestore fetch for 10,000+ entry users | `vocabularyService.ts:100` | Medium | Low — edge case |

---

## 10. Suggested Commands for Future Measurement

```bash
# Bundle analysis (after adding rollup-plugin-visualizer)
npx vite build && open dist/stats.html

# Lighthouse CI (requires @lhci/cli)
npx lhci autorun --collect.url=https://paleoglossa.com/app --collect.numberOfRuns=3

# Manual render profiling
# In browser console:
React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Profiling = true;

# Current build output sizes
npx vite build && find dist/assets -name '*.js' -exec sh -c 'ls -lh "$1" | awk "{print \$5, \$NF}"' _ {} \;

# Gzip sizes (more accurate for network)
npx vite build && find dist/assets -name '*.js' -exec sh -c 'gzip -c "$1" | wc -c | awk "{printf \"%6.1f KB %s\\n\", \$1/1024, \$NF}"' _ {} \;
```

---

## 11. Summary

| Area | Verdict |
|------|---------|
| Route splitting | ✅ Excellent — all routes lazy-loaded |
| React Compiler | ✅ Active — auto-memoization in place |
| Firebase writes | ✅ Batched + debounced (production-grade) |
| Firebase reads | ✅ 5-min cache, but single `getDocs` fetch for all vocab |
| Reader re-renders | ⚠️ High risk — single context causes cascading updates |
| Reader chapters | ⚠️ Medium risk — heavy synchronous computation |
| AI quota | ⚠️ Partial — only 1 of 8 endpoints has it |
| AI timeouts | ❌ Missing on all but 1 endpoint |
| PWA | ⚠️ Precaches UI + fonts, but no API caching for offline |
| Bundle size | ⚠️ 485 KB corpus chunk is eager-loaded unnecessarily |
| Perf measurement | ❌ None — no bundle analyzer, no web vitals, no profiling |

The top 3 items to address in the next performance sprint:
1. Split `ReaderContext` (stops cascading re-renders)
2. Add timeouts + quotas to all AI endpoints (prevents hung requests + runaway costs)
3. Move corpus data to lazy-loaded chunk (saves 485 KB from initial load)
