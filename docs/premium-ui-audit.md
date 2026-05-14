# Premium UI Audit — 2026-05-14

Current visual polish gaps and prioritized fixes. Measured against market-leading language learning products (Duolingo, LingQ, ReadLang) for UX benchmarks, while keeping PaleoGlossa's scholarly identity.

---

## 1. Current UI Strengths

- **Typography**: Serif body + heading stack (Cormorant Garamond, Crimson Pro) gives a distinct scholarly identity. Greek and Hebrew font stacks are well-chosen with appropriate fallbacks.
- **Theme system**: Three complete themes (parchment, sepia, dark) with full CSS custom property overrides. Dark mode in particular is well-executed with proper contrast ratios.
- **Parchment texture**: Radial gradients + SVG turbulence noise at 4% opacity creates an authentic tactile background without distracting from content.
- **Animation taste**: `motion/react` usage is restrained and intentional — 0.12s fades, subtle slide-ups, no gratuitous motion.
- **Color palette**: Warm, cohesive, bronze-age-inspired palette. The `parch`/`ink`/`gold`/`blue` system is distinctive and memorable.
- **Reader text rendering**: Serif fonts, proper line height, punctuation-aware spacing (`punctBefore`/`punctAfter`), RTL support, and Hebrew font handling are all well-implemented.
- **Bottom sheet pattern**: `LexDrawerPanel`'s mobile bottom sheet with rounded top corners (`rounded-t-3xl`) is a premium touch.
- **Error Boundary**: Gracefully handles chunk-load errors (auto-retry once on stale deploy) and shows a non-technical error card.
- **CEFR pill classes**: Level badges (`cefr-a`, `cefr-b`, `cefr-c`) with distinct colors are a nice detail.

---

## 2. Current UI Weaknesses (Prioritized)

### P0 — Critical polish gaps

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **No empty state illustrations** | All pages with empty data lists | Empty lists show dashed-border boxes with text. A subtle illustration or icon would make the app feel inhabited and guide the user. | Add thematic SVG spot illustrations (a scroll, a quill, an amphora) for empty states. 2-3 reusable illustrations covering "no vocabulary", "no texts", "no notes". |
| 2 | **Loading states are inconsistent** | Across all pages | Some pages use skeleton components (Dashboard, Reader), others use `Loader2` spinner, others show raw "Loading..." text. | Standardize: skeleton for content-heavy pages (library, reader, vocabulary), spinner for actions (submit, fetch), never raw "Loading..." text. |
| 3 | **No onboarding tooltip/first-run experience** | First visit to Reader, Review, Vocabulary | Users open a text and are expected to know to tap a word. No hint for first-time users. | Add a dismissible first-run overlay or tooltip sequence (like `ReaderTutorial` but for each major feature). |

### P1 — Visual polish

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 4 | **Font sizes use arbitrary pixel values** | Throughout: `text-[42px]`, `text-[48px]`, `text-[72px]` | No typographic scale. Sizes feel arbitrary rather than intentional. | Define a 4-step type scale in `@theme`: `--text-display`, `--text-heading`, `--text-body`, `--text-small`. Replace inline pixel values with semantic tokens. |
| 5 | **Spacing lacks vertical rhythm** | All pages: `px-4 md:px-12`, `p-6 md:p-12`, `p-5`, `p-8` | No consistent spacing scale. Sections feel unevenly spaced. | Define spacing scale in `@theme` (`--spacing-section`, `--spacing-card`, etc.). Apply consistently across pages. Minimum 32px vertical rhythm between sections. |
| 6 | **Card styles are inconsistent** | Dashboard cards, library cards, vocabulary cards | Multiple card styles: some use `card` class, some have inline `rounded-[20px]`, some `rounded-2xl`, some `rounded-xl`. Shadow styles vary. | Consolidate to 2-3 card variants: `card-default` (white, soft shadow, rounded-2xl), `card-interactive` (hover lift, active press), `card-bordered` (subtle border, no shadow). |
| 7 | **Word Analysis side panel spacing feels tight on desktop** | `LexDrawerPanel.tsx` | Content padding is `p-6 md:p-8`. For a side panel that should feel like a reading companion, this is slightly tight. | Increase to `p-6 md:p-10`. Add more vertical space between sections (currently `mb-10` feels tight for a panel with 6+ sections). |
| 8 | **Dashboard greeting lacks personalization** | `Dashboard.tsx` | Shows generic greeting. No user name, no streak, no contextual suggestion. | Add user display name, reading streak (computed from `lastSeenAt` on vocabulary items), and a contextual next-action suggestion. |
| 9 | **Navbar active state is low contrast** | `Navbar.tsx` | Active nav item uses `font-bold` only. No background or underline indicator. On mobile tab bar, the active icon is dimmer than inactive. | Add a subtle left-border indicator on desktop sidebar. On mobile tab bar, use an underline or background pill for active tab. |

### P2 — Reader UX

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 10 | **No scroll progress indicator** | `Reader.tsx` / `ReadingPane.tsx` | Users can't tell how far into a text they are. The `ReaderProgressHeader` exists but lacks a visual scroll-progress bar. | Add a thin progress bar at the top of the reading pane (fixed, similar to Medium's reading progress). Tracks `scrollTop / scrollHeight`. |
| 11 | **Chapter transitions are abrupt** | `Reader.tsx` | Switching chapters replaces content instantly with no transition. | `AnimatePresence` with fade or slide transition on chapter change. The `motion` library is already available. |
| 12 | **No reading-width constraint** | `ReadingPane.tsx` | Text spans full width of content area. On wide screens, lines can be 100+ characters, harming readability. | Add `max-w-prose` (~65ch) or `max-w-[700px]` to the reading text container. Center it within the pane. |
| 13 | **Bottom sheet overlaps content on mobile** | `LexDrawerPanel.tsx` | The `65vh` bottom sheet covers most of the text when open on mobile, making it hard to refer back to the sentence. | Reduce to `50vh` on mobile, or add a "peek" handle that allows collapsing to a small bar showing just the word and gloss. |
| 14 | **Word Analysis shows no etymology data** | `LexDrawerPanel.tsx` | The panel has an "AI Insights" section for explanation, but no structured etymology breakdown. | Add a small "Etymology" section below the definition showing root, cognates, and semantic domain from `DictionaryEntry`. |
| 15 | **No swipe gesture for chapters on mobile** | `Reader.tsx` | Users must tap the chapter selector to navigate. No swipe-left/right between chapters. | Add touch swipe detection on the reading pane. Show a brief chapter label overlay on swipe. |

### P3 — Responsive & Mobile

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 16 | **Dashboard grid breaks at tablet sizes** | `Dashboard.tsx` | Three-column grid collapses directly to single column at `lg:` breakpoint. No intermediate tablet layout. | Add `md:grid-cols-2` between the mobile and desktop breakpoints. |
| 17 | **Library page missing card tap target on mobile** | `Library.tsx` | Language cards have `min-w-[70px]` flex items that are small to tap accurately. | Ensure all tappable cards are at least 44x44pt touch target. Add `min-h-[48px]` to flex card items. |
| 18 | **Settings page is unstyled** | `Settings.tsx` | Settings are laid out as a simple form without the app's card/panel aesthetic. | Apply consistent card styling. Group settings into sections with `eyebrow` headers matching the reader layout. |
| 19 | **No safe-area handling beyond bottom tabs** | Throughout | Only the mobile tab bar uses `pb-safe`. The LexDrawerPanel bottom sheet and modals don't account for the home indicator area on iOS. | Apply `pb-safe` to all bottom-fixed elements and `pt-safe` to top-fixed elements. |

### P4 — Accessibility

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 20 | **No focus indicators** | Throughout | Tab navigation through interactive elements shows no visible focus ring. Keyboard-only users cannot navigate. | Add `focus-visible:ring-2 focus-visible:ring-gold` to all interactive elements. Standardize via Tailwind v4 `@variant` or base styles. |
| 21 | **Color-only state indicators** | `LexDrawerPanel.tsx` word state buttons | Word states (NEW, SEEN, LEARNING, etc.) are differentiated only by background color. No icon or text pattern distinguishes them for colorblind users. | Add a small icon or symbol to each state button in addition to color: NEW=○, SEEN=◐, LEARNING=◎, FAMILIAR=●, KNOWN=★, IGNORED=⊘. |
| 22 | **Missing ARIA labels on icon buttons** | Navbar, Reader toolbar | Icon buttons (play TTS, close panel, chapter selector) have no `aria-label`. | Add `aria-label` to all `<button>` elements that contain only an icon. |
| 23 | **Low contrast on muted text** | `text-muted` (`#9A8A72`) | On parchment background (`#F8F3E8`), the contrast ratio is approximately 3.2:1 — below WCAG AA for normal text (4.5:1). | Darken `--color-muted` to approximately `#7A6A52` to achieve ~4.6:1 contrast on parchment. |
| 24 | **No skip-to-content link** | `AppLayout.tsx` | Keyboard users must tab through the entire navbar before reaching page content. | Add a visually-hidden skip link as the first focusable element in `AppLayout`. |

### P5 — Micro-interactions

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 25 | **No press-state feedback on cards** | Library cards, vocabulary items | Tapping a card instantly navigates with no visual press feedback. | Add `active:scale-[0.98]` to all interactive cards. This pattern is already used on the "Add to Review" button. |
| 26 | **No toast confirmation after actions** | Save note, mark word known, toggle settings | Actions have no confirmation feedback. Users can't tell if the action registered. | Add brief toast notification system (`useToast` hook) for: note saved, word marked, setting changed. Use the existing `animate-slide-up` animation. |
| 27 | **No optimistic UI updates** | `useVocabulary.ts` | Marking a word state triggers a Firestore write with no immediate UI feedback. | Apply optimistic state updates to vocabulary mutations. Revert on error. |

---

## 3. Design Token Recommendations

### Type Scale (replace inline pixel values)

```css
@theme {
  --text-display: 48px;    /* Hero, word in Word Analysis */
  --text-heading: 28px;    /* Section titles */
  --text-body: 18px;       /* Reading text, body copy */
  --text-small: 14px;      /* Labels, metadata */
  --text-tiny: 11px;       /* Eyebrow, badges */
}
```

### Spacing Scale

```css
@theme {
  --spacing-section: 48px;    /* Between major page sections */
  --spacing-card-gap: 24px;  /* Between cards in a grid */
  --spacing-card-pad: 20px;  /* Inside cards */
  --spacing-text: 32px;      /* Between text paragraphs */
}
```

### Card Variants (consolidate)

| Variant | Use | Style |
|---------|-----|-------|
| `card-default` | Content cards, settings groups | `rounded-2xl bg-white shadow-sm border border-bdr/30 p-5` |
| `card-interactive` | Clickable cards, library items | Same as default + `hover:shadow-md active:scale-[0.98] cursor-pointer transition-all duration-150` |
| `card-bordered` | Side panel sections, embedded groups | `rounded-xl bg-parch/40 border border-bdr/20 p-4` |

---

## 4. Prioritized Fixes (Top 10 for Next Sprint)

| Priority | # | Fix | Effort | Impact |
|----------|---|-----|--------|--------|
| 1 | 1 | Add empty state illustrations (3 reusable SVGs) | Medium | High — guides new users, reduces abandonment |
| 2 | 24 | Add skip-to-content link and focus indicators | Low | High — legal requirement, enables keyboard users |
| 3 | 12 | Add `max-w-prose` to reading text on desktop | Low | High — immediately improves reading experience |
| 4 | 3 | Add first-run tooltip sequence for Reader | Medium | High — reduces confusion for new users |
| 5 | 10 | Add scroll progress bar to Reader | Low | Medium — provides orientation in long texts |
| 6 | 26 | Add toast notification system | Medium | Medium — confirms actions, reduces uncertainty |
| 7 | 21 | Add icons to word state buttons | Low | Medium — improves accessibility and clarity |
| 8 | 23 | Fix muted text contrast | Low | Medium — WCAG compliance, readability |
| 9 | 14 | Add etymology section to Word Analysis | Medium | Medium — enriches word insight |
| 10 | 4 | Define and apply type scale tokens | Medium | Medium — visual consistency |

---

## 5. Routes Requiring Immediate UI Attention

| Route | Issues | Urgency |
|-------|--------|---------|
| `/app` (Dashboard) | Personalization, tablet breakpoints, greeting | Medium |
| `/app/reader/:textId` | Reading width, chapter transitions, scroll progress | High |
| `/app/settings` | No card styling, inconsistent with rest of app | Medium |
| `/app/search` | Results page is plain, no visual hierarchy | Low |
| `/app/grammar` | No loading skeleton, plain list layout | Low |
| `/app/manuscripts` | If data present, UI is minimal/lists only | Low |
| `/app/courses` | No visual course cards, plain list | Low |
| `/admin/import` | Functional but unstyled, no progress tracking UX | Low |

---

## 6. Component-Specific Polish

### Navbar
- Desktop: `w-[220px]` could be narrower (`w-48` or `200px`). Active state needs visual indicator.
- Mobile bottom tab: 5 items is at the limit for a tab bar. The "Dictionary" tab icon is small (`BookOpen 18px`). Consider `w-5 h-5` for all tab icons.

### ReadingPane
- Current: full-width text with no max-width.
- Target: `max-w-[700px]` centered within the pane. On very wide screens, show the LexDrawerPanel side-by-side (already done via `md:w-[380px]` layout).
- Word hover tooltip: currently shows only the gloss. Consider adding a frequency badge or POS label.

### LexDrawerPanel (Word Analysis)
- Sections: Meaning, Your Knowledge, Data Source, AI Insights, Morphology, Examples, Notes — 7 sections in a 380px panel is a lot of vertical scroll.
- Consider collapsing morphology and data source into an accordion (default open).
- AI Insights section (now auto-fetched as gloss fallback) should be visually distinct from the main definition.

### LanguageCard
- Small touch target on mobile. Add `min-h-[56px]` for mobile tap areas.
- Consider adding a subtle hover state: `hover:border-gold/30 hover:shadow-sm`.

### ProgressRing
- Excellent implementation. Consider adding a center label showing percentage in a monospace font for reading progress.

### Error Boundary
- Already handles chunk-load errors gracefully. Consider adding a "Report" button that copies error details to clipboard for user support.

---

## 7. Reader-Specific UX Notes

- **Flow**: Select text → Reader loads → Scroll / tap words → Word Analysis panel opens
- **Gap**: No "return to library" shortcut once deep in the Reader. Add a breadcrumb or back-to-library link in the reader header.
- **Gap**: No way to see all vocabulary from the current text inline. A "words in this text" mini-list would help learners preview difficulty.
- **Gap**: No way to hear the full sentence spoken. TTS is per-word only via the Volume2 icon in Word Analysis. Add a "play sentence" button in the reader toolbar.
- **Gap**: No highlight/annotation mode. Users cannot mark passages for later reference (beyond individual word states).

---

## 8. Mobile-Specific UX Notes

- **Bottom sheet tap target**: The `<span>` showing `From '{lemma}'` in LexDrawerPanel is in a `flex flex-col items-center gap-1` div with no padding. On mobile, this is very close to the close button.
- **Reader bottom nav**: The prev/next chapter buttons lack labels on mobile. Consider adding short labels (`< Prev`, `Next >`) that collapse to arrows only on narrow screens.
- **Keyboard avoidance**: The "Your Gloss" input field in LexDrawerPanel may be covered by the mobile keyboard. Use `scroll-into-view` or `visualViewport` API.

---

## 9. Summary

The app has a strong visual identity (parchment theme, serif typography, warm palette) that differentiates it from generic language learning products. The main UX gaps are:

1. **New user experience**: No onboarding, empty states without guidance, no first-run hints.
2. **Visual consistency**: Arbitrary font sizes, inconsistent cards, uneven spacing, no type or spacing scale.
3. **Reader fundamentals**: No reading-width constraint, no scroll progress, abrupt chapter transitions.
4. **Accessibility**: No focus indicators, low contrast on muted text, no skip-to-content, no ARIA labels on icon buttons.
5. **Feedback**: No toast confirmations, no optimistic UI, no press-state feedback on interactive cards.

Fixing the top 10 items (Section 4) would address the most impactful gaps while respecting the existing architecture and visual identity.
