# Reader Architecture Report — paleoglossa-ai-studio

> **Audit date:** 2026-05-14  
> **Branch:** `main` @ `449eb66`  
> **Focus:** Reader routes, components, state, data flow, word interaction, dictionary/gloss behavior, gaps, and next steps.

---

## 1. Entry Points and Routes

| Route | Component | Params | Guards |
|-------|-----------|--------|--------|
| `/app/reader/:textId` | `Reader.tsx` | `textId` from `useParams` | `AuthGuard` (parent), `LanguageGuard` via `canAccessLanguage()` inline in `Reader.tsx:734` |

The reader is a single-route page. `textId` can be:
- A **corpus text ID** (e.g., `john-1`) — loaded from `CorpusDB.getText()` (static bundle)
- An **import ID** (prefixed `import-`) — loaded from `ImportService.getImports()` (Firestore)
- An **offline payload** — loaded via `OfflineService.getOfflinePayload()` (IndexedDB)

All three sources are normalized into the same internal `text` object shape.

---

## 2. Component Hierarchy

```
Reader.tsx  (948 lines — page-level orchestrator)
├── ReaderProgressHeader     (72 lines) — daily goal, session timer, back button
├── ReaderToolbar            (105 lines) — chapter selector, translit/parallel/mask/interlinear toggles, scroll/page mode
├── [Floating buttons]       — "Ask Tutor" (fixed bottom-right), "Save Offline" toggle
├── ReaderAudioBar           (72 lines) — play/pause, progress bar, speed, loop controls
├── ReadingPane              (503 lines) — the main text area
│   ├── ReaderToken (memo)   — single word/token with click, hover, styling
│   └── GlossTooltip         (30 lines) — floating gloss popover on hover
├── ReaderBottomNav          (74 lines) — prev/next navigation, "Mark Known" button, progress bar
├── LexDrawerPanel           (459 lines) — side panel: word analysis, knowledge states, dictionary, morphology, AI insights, examples, notes
│   └── ParadigmModal        (108 lines) — AI-generated paradigm table in modal
└── ReaderTutorial           (42 lines) — onboarding overlay (4 steps)
```

Key observations:
- `Reader.tsx` at 948 lines is the largest file — it handles orchestration, keyboard shortcuts, audio playback timer, scroll tracking, chapter/page state, and progress saving.
- `ReadingPane.tsx` at 503 lines is the second largest — it renders sentences, handles touch/swipe, manages hover state, and contains the end-of-page/completion UI.
- `LexDrawerPanel.tsx` at 459 lines is a close third — it manages word analysis, morphology display, AI explanation, knowledge state buttons, personal notes, and example sentences.
- All other reader components are well-sized (42-108 lines).

---

## 3. State Ownership and Flow

### State Location Map

| State | Owner | Passed To | Persisted |
|-------|-------|-----------|-----------|
| `text` (loaded corpus data) | `Reader.tsx` (local `useState`) | `ReadingPane`, `LexDrawerPanel`, `ReaderToolbar` | No (reloaded on mount) |
| `knowledge` (all word states) | `useKnowledge` → `useVocabulary` | `ReadingPane` (via `getWordInfo`), `LexDrawerPanel` | Firestore + localStorage |
| `knowledgeVersion` (counter) | `useKnowledge` → `useVocabulary` | `ReadingPane` (triggers re-render) | N/A (counter only) |
| `stats` (reading stats) | `useKnowledge` → `useStats` | `ReaderProgressHeader` | Firestore (debounced 10s) |
| `settings` | `useSettings` | `Reader`, `ReadingPane`, `LexDrawerPanel` | Firestore |
| `selectedWord` | `Reader.tsx` (local `useState`) | `LexDrawerPanel`, `ReadingPane` | No |
| `scrollProgress` | `Reader.tsx` (local `useState`) | `ReaderBottomNav`, progress saving | Firestore (via interval) |
| `currentSentenceIndex` | `Reader.tsx` (local `useState`) | `ReadingPane`, `ReaderBottomNav`, audio | Firestore (via interval) |
| `currentChapterIndex` | `Reader.tsx` (local `useState`) | `ReaderToolbar`, `ReadingPane`, `ReaderBottomNav` | localStorage |
| `currentScrollPage` | `Reader.tsx` (local `useState`) | `ReadingPane` | No |
| `readingMode` | `Reader.tsx` (local `useState`) | `ReadingPane`, `ReaderBottomNav` | No |
| `showTranslit`, `showParallel`, `maskKnown`, `interlinearMode` | `Reader.tsx` (local `useState`) | `ReadingPane`, `ReaderToolbar` | No |
| `aiTranslations` | `Reader.tsx` (local `useState`) | `ReadingPane` | No (in-memory only) |
| `audioPos`, `isPlaying`, `audioSpeed`, loop states | `Reader.tsx` (local `useState`) | `ReadingPane`, `ReaderAudioBar` | No |
| `tutorialStep` | `Reader.tsx` (local `useState`) | `ReaderTutorial` | localStorage (completion) |
| `hoverGloss` | `ReadingPane` (local `useState`) | `GlossTooltip` | No |

### State Flow Pattern

```
useVocabulary (vocabularyService.ts)
  → useKnowledge (composite: vocab + stats + progress)
    → Reader.tsx
      → ReadingPane (via props: getWordInfo, onWordClick callbacks)
        → ReaderToken (memo, receives wordInfo as prop)
      → LexDrawerPanel (via props: knowledge, setWordState, getWordInfo)
```

The `knowledgeVersion` counter is incremented every time any word state changes. It is passed as a prop to `ReadingPane` to force re-render of token styles without requiring a full re-render of the entire tree. Inside `ReadingPane`, `ReaderToken` is wrapped in `React.memo` so it only re-renders when its specific props change.

### Areas for Improvement

1. **`Reader.tsx` has 21 `useState` calls** — too many for a single component. Some could be grouped (e.g., audio state into a `useAudioPlayer` hook, display settings into a `useReaderSettings` hook).
2. **`chapters` computed via `useMemo`** depends on the raw `text` object, which is coarse. If any dependency changes, the entire chapter structure recomputes.
3. **`knowledgeVersion` as a re-render trigger** is a manual optimization — React Compiler (enabled in `vite.config.ts`) should handle this automatically in many cases, but the pattern works.
4. **`handleMarkPageKnown` has a questionable `markPageAsSeen` check** — it checks `typeof setWordState.markPageAsSeen === 'function'`, but `setWordState` is a function, not an object. This code path may never execute.

---

## 4. Data Loading Flow

```
Reader mounts
  └── CorpusDB.getText(textId)  → synchronous, from static import
    └── If null AND textId starts with "import-"
      └── ImportService.getImports(userId)  → Firestore query, async
    └── If still null
      └── OfflineService.getOfflinePayload(textId)  → IndexedDB, sync
```

After text loads, `chapters` useMemo:
```
chapters = CorpusDB sections (if corpus text)
         | imported sentences (if analyzed import)
         | legacy content split by regex (if raw text import)
```

This three-tier fallback (corpus → import → offline) is robust. The legacy `text.content` split path (`Reader.tsx:278-301`) performs regex-based sentence splitting with no language awareness — it is a worst-case fallback.

### Progress Loading

```
useEffect [textId, fetchTextProgress, readingMode]:
  fetchTextProgress(textId) → Firestore
  If scroll mode: set scrollTop to lastPosition%
  If page mode: set currentSentenceIndex to saved sentenceIndex
```

Progress is saved every 5 seconds via a `setInterval` that reads from refs (`scrollProgressRef`, `currentSentenceIndexRef`). This avoids re-creating the interval on every state change.

### Gap

There is no splash/"loading" screen between text selection and reader mount. `ReaderSkeleton` is shown while text loads (line 731), but it has no animation. The skeleton fades to the full reader once `text` resolves, which on a cold corpus load is near-instant (static import), but for Firestore imports or offline payloads there is a brief flash.

---

## 5. Word/Token Interaction Flow

### Click Flow

```
User clicks token in ReadingPane
  └── ReaderToken.onClick → onWordClick(token, sentenceText, sentenceIndex)
    └── Reader.tsx handleWordClick:
        1. setSelectedWord({...token, sentenceText}) — opens LexDrawerPanel
        2. incrementEncounter(lemma, languageId) — updates knowledge
        3. setWordContext(lemma, sentenceText, languageId) — saves context
        4. If page mode: setCurrentSentenceIndex(sentenceIndex)
```

### Hover Flow

```
User hovers over token in ReadingPane
  └── ReaderToken.onMouseEnter → onWordHover(gloss, x, y)
    └── ReadingPane handleWordHover → setHoverGloss(...)
      └── GlossTooltip renders floating label
  └── ReaderToken.onMouseLeave → onWordLeave → setHoverGloss(null)
```

### Keyboard Flow

```
User presses key with selectedWord active:
  1/2/3/4 → setWordState (LEARNING/FAMILIAR/KNOWN/IGNORED)
  k/l/i   → same (KNOWN/LEARNING/IGNORED)
  Escape  → deselect word

User presses key without selectedWord:
  Space   → toggle audio play/pause
  ←/→     → navigate sentences/chapters/pages
```

### Gap

There is no **double-click to look up in dictionary** or **right-click context menu**. The only interaction is single-click → open side panel.

---

## 6. Dictionary / Gloss / Analysis Behavior

### Gloss Resolution Order (in `LexDrawerPanel.tsx:178`)

```
1. wordInfo?.userGloss  (user-edited gloss)
2. getGlossWithFallbacks(lemma, languageId)  → multi-step corpus lookup
3. selectedWord.gloss  (token's built-in gloss from corpus data)
4. "No definition available."  (fallback text)
```

`getGlossWithFallbacks()` (in `src/lib/data/dictionary.ts`) applies this chain:
1. Exact lemma match in dynamic corpus-derived index
2. Lowercase/case-insensitive match
3. NFD-normalized match (handles Unicode composition)
4. Static dictionary lookup (Strong's, LSJ, Whitaker's)
5. Hebrew consonantal skeleton match
6. Corpus-derived frequency-based fallback

### Morphology Display

`MorphologyService.formatMorphologyForDisplay()` (in `src/lib/services/morphologyService.ts`) formats the morphology object into:
- `compact` — short string (e.g., "nom sg m")
- `expanded` — array of `{label, value}` pairs
- `missing` — boolean flag (true when no morphology data exists)
- `confidence` — AI confidence score
- `source` — data source attribution

### AI Analysis

- **Word explanation:** `LexDrawerPanel` calls `AIClient.explainWord()` on demand (user clicks "Ask AI About This Word"). Result is cached in component state (not saved to Firestore).
- **Paradigm:** `ParadigmModal` calls `AIClient.getParadigm()` on open. Result is in-memory only.
- **Sentence translation:** `ReadingPane` calls `onAITranslate` → `AIClient.translateSentence()` when user clicks "Ask AI to Translate."
- **AI analysis is server-side only** — all calls go through Express API endpoints using `GEMINI_API_KEY`.

### Gap

AI explanations and paradigm results are **not cached** between sessions. If a user looks up the same word tomorrow, the AI call fires again (wasting cost and time). The `aiClient.ts` has methods but no client-side caching layer.

---

## 7. Known Gaps and Risks

### Critical

| # | Gap | Location | Impact |
|---|-----|----------|--------|
| 1 | **`Reader.tsx` is 948 lines** — too large for a single component | `src/pages/Reader.tsx` | Hard to test, hard to reason about |
| 2 | **`ReadingPane.tsx` is 503 lines** — second largest, mixes rendering with end-of-page UI logic | `src/components/reader/ReadingPane.tsx` | Similar maintainability concern |
| 3 | **21 `useState` calls in a single component** | `Reader.tsx` | State fragmentation; could cause unnecessary re-renders |
| 4 | **Dead code path in `handleMarkPageKnown`** | `Reader.tsx:643-644` | `setWordState.markPageAsSeen` is never a function since `setWordState` is a function |

### Important

| # | Gap | Location | Impact |
|---|-----|----------|--------|
| 5 | **AI paradigm results not cached** | `LexDrawerPanel.tsx` / `ParadigmModal.tsx` | Redundant API calls; user pays for same data repeatedly |
| 6 | **AI translations not persisted** | `Reader.tsx` (local `useState` only) | Lost on re-mount; user must re-translate after navigation |
| 7 | **`Reader.test.ts` is only smoke tests** (5 tests) | `src/components/reader/Reader.test.ts` | No interaction tests, no rendering tests with mock state |
| 8 | **No right-click or double-click interaction** | `ReadingPane.tsx` | Power users expect alternate interaction paths |
| 9 | **Scroll pagination (`currentScrollPage`) is manual** — uses `SENTENCES_PER_PAGE = 30` | `Reader.tsx:331` | Not true virtualization; hidden sentences still consume DOM nodes |
| 10 | **Offline save button saves only current chapter's sentences** | `Reader.tsx:776` | Not the full text; users may expect the entire text to be saved |

### Nice-to-Have

| # | Gap | Location | Impact |
|---|-----|----------|--------|
| 11 | **`ReaderSkeleton` has no animation** | `src/components/Skeleton.tsx` | Brief flash between skeleton and content |
| 12 | **No text search within the reader** | — | Users cannot Cmd+F for a word in the current text |
| 13 | **No reading time estimate** | — | No indicator of how long the current chapter/text will take |
| 14 | **Parallel text toggle shows/hides entire column** but no word-level alignment | `ReadingPane.tsx:448` | Parallel text is sentence-level, not word-aligned |
| 15 | **No touch-optimized gesture for word selection on mobile** | Swipe navigates, but no long-press for word lookup | `ReadingPane.tsx:212-224` |

---

## 8. Reader Test Coverage

Current reader test file: `src/components/reader/Reader.test.ts` (5 tests)

```
✓ ancient texts load from CorpusDB
✓ Iliad 1.1 loads with tokens
✓ tokens have required fields
✓ WordState constants have correct shape
✓ getTransliteration returns a string for known text
```

These tests verify that corpus data loads correctly. They do NOT test:
- Component rendering (`ReaderToken`, `ReadingPane`, `LexDrawerPanel`)
- State changes (click → selectedWord → LexDrawerPanel opens)
- Keyboard shortcuts
- Word state transitions
- Reading mode switching
- Audio playback logic
- Offline save/load
- Sentenc pagination
- Touch/swipe handling

The smoke test also in `src/__tests__/smoke.test.tsx` verifies that the `/app/reader/:textId` route renders without crashing (11 tests across all routes).

---

## 9. Premium UX Gaps

| Area | Current State | Premium State |
|------|--------------|---------------|
| **Typography** | Works, but no refined scale or `text-pretty` | Balanced line lengths, proper hierarchy |
| **Animations** | Only `LexDrawerPanel` slide-up, `GlossTooltip` fade | Smooth chapter transitions, page curl or fade |
| **Reading mode** | Scroll and Page modes exist | "Reading mode" that hides all chrome |
| **Word tooltip** | Bare gloss label, no context | Rich tooltip with gloss + frequency + "add to review" button |
| **Loading states** | Generic `ReaderSkeleton` | Skeleton that matches reader layout (line shapes) |
| **Accessibility** | Keyboard shortcuts exist, no explicit ARIA | Full screen reader support, focus indicators |
| **Offline indicator** | Manual save button, no connection status | Auto-detect offline, show sync queue status |
| **Search in text** | Not available | Cmd+F for current text |
| **Text-to-speech** | Browser `speechSynthesis` with no voice selection | High-quality TTS with voice picker |

---

## 10. Dependency Map of Reader Files

```
Reader.tsx
  imports from:
    - src/data/corpus              (CorpusDB, text data)
    - src/lib/hooks/useKnowledge   (vocabulary, stats, progress)
    - src/lib/hooks/useSettings    (user preferences)
    - src/lib/hooks/useAuth        (user identity)
    - src/lib/contexts/SubscriptionContext  (plan gating)
    - src/lib/hooks/useToast       (notifications)
    - src/lib/services/aiClient    (AI translation)
    - src/lib/services/importService    (user imports from Firestore)
    - src/lib/services/offlineService   (IndexedDB offline cache)
    - src/lib/constants/wordStates (WordState enum)
    - src/lib/constants/storage    (localStorage keys)
    - src/lib/transliterate        (script conversion)
    - src/components/reader/*      (8 sub-components)
    - src/components/Skeleton      (loading state)

ReadingPane.tsx
  imports from:
    - src/lib/utils                (cn() helper)
    - src/lib/constants/wordStates (WordState, STATE_COLORS)
    - src/components/reader/GlossTooltip  (hover popover)

LexDrawerPanel.tsx
  imports from:
    - src/lib/utils                (cn() helper)
    - src/lib/constants/wordStates (WordState, STATE_COLORS, STATE_LABELS)
    - src/lib/services/aiClient    (AI word explanation)
    - src/lib/services/morphologyService  (morphology formatting)
    - src/lib/data/dictionary      (getGlossWithFallbacks, findDictionaryEntry)
    - src/data/corpus              (ATTRIBUTIONS, CorpusDB)
    - src/lib/hooks/useSettings    (active dictionaries)
    - src/components/reader/ParadigmModal
```

---

## 11. Recommended Implementation Order

### PR 1: Extract Hooks from Reader.tsx

**Files:** `src/pages/Reader.tsx`, new `src/lib/hooks/useReaderAudio.ts`, `src/lib/hooks/useReaderNavigation.ts`, `src/lib/hooks/useReaderDisplay.ts`

Extract audio state/logic, navigation state/logic, and display toggle state/logic into dedicated hooks. This removes 12 of the 21 `useState` calls from `Reader.tsx` and makes the page file more readable.

**Effort:** 2 hours.  
**Risk:** Low — hooks are pure extractions, no behavior changes.

### PR 2: Fix Dead Code and Lint Warnings

**Files:** `Reader.tsx:643-644`, `Dashboard.tsx`, `Vocabulary.tsx`, `fsrs.ts`, `SubscriptionContext.tsx`

Remove the unreachable `markPageAsSeen` code path in `handleMarkPageKnown`. Fix the 6 missing/excessive hook dependency warnings.

**Effort:** 30 minutes.  
**Risk:** None.

### PR 3: Expand Reader Test Coverage

**Files:** `src/components/reader/Reader.test.ts`, new `src/components/reader/ReadingPane.test.tsx`, `src/components/reader/LexDrawerPanel.test.tsx`

Add tests for:
- `ReadingPane` renders tokens
- Token click fires `onWordClick` callback
- `ReaderToken` applies correct `WordState` styles
- `LexDrawerPanel` opens when `selectedWord` is set
- Keyboard shortcuts trigger state changes

**Effort:** 3 hours.  
**Risk:** Low — tests only, no production code changes.

### PR 4: Add AI Result Caching

**Files:** `src/lib/services/aiClient.ts`, `LexDrawerPanel.tsx`, `ParadigmModal.tsx`, `Reader.tsx`

Add client-side caching for AI explanations and paradigm results. Use a `Map<lemma, result>` that persists in `useRef` across the component lifecycle, and optionally persist to Firestore `users/{uid}/aiCache/{lemma}` for longer TTL.

**Effort:** 2 hours.  
**Risk:** Low — cache is additive, no behavior change for misses.

### PR 5: Reader Performance — Virtual Scrolling

**Files:** `Reader.tsx`, `ReadingPane.tsx`

Replace the manual `SENTENCES_PER_PAGE = 30` pagination with true virtual scrolling using `IntersectionObserver` or a lightweight virtualizer. Only render sentences within the viewport + buffer.

**Effort:** 4 hours.  
**Risk:** Medium — virtual scrolling with variable-height text requires careful measurement.

### PR 6: Premium UX Pass

**Files:** `ReadingPane.tsx`, `GlossTooltip.tsx`, `ReaderToolbar.tsx`, `Skeleton.tsx`, `index.css`

- Refine typographic scale, line lengths (65-75 chars), `text-pretty`
- Rich hover tooltip with gloss + frequency badge + "Add to Review"
- Reading mode that hides all chrome
- Animated skeleton matching reader layout
- Smooth chapter transitions using `motion`

**Effort:** 6 hours.  
**Risk:** Low-medium — visual changes may need iteration.

### PR 7: Offline Content Caching

**Files:** `Reader.tsx`, `offlineService.ts`

Fix the offline save to download all chapters/sections, not just the current one. Add a progress indicator for large texts.

**Effort:** 1 hour.  
**Risk:** Low.

---

## 12. Files Future PRs Should Modify (Not Duplicate)

| If You Want To... | Modify This File | Don't Create |
|-------------------|-----------------|--------------|
| Add a new reader toolbar button | `ReaderToolbar.tsx` | A new toolbar component |
| Change word click behavior | `Reader.tsx` `handleWordClick` + `ReadingPane.tsx` `ReaderToken` | A new word interaction system |
| Add a reader setting toggle | `Reader.tsx` local state → extract to hook | A new settings context |
| Change morphology display | `LexDrawerPanel.tsx` + `morphologyService.ts` | A new morphology component |
| Add word interaction (right-click, double-click) | `ReadingPane.tsx` `ReaderToken` | A separate overlay system |
| Add AI feature in reader | `LexDrawerPanel.tsx` + `aiClient.ts` | A new AI service file |
| Change reader navigation | `ReaderBottomNav.tsx` + `Reader.tsx` keyboard handler | A new navigation component |
| Add text search in reader | New `src/components/reader/ReaderSearch.tsx` + integrate in `ReadingPane.tsx` | Any new `searchService.ts` (one already exists) |
| Add offline text caching | `offlineService.ts` | A new offline storage file |
