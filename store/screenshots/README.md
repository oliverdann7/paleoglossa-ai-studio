# App Store & Play Store screenshots

Branded marketing screenshots for Paleoglossa — six hero panels showing the core
reading-and-learning loop, rendered inside device frames on the brand navy/parchment
palette with the real product type (Cormorant Garamond / Crimson Pro / DM Mono).

## Output

| Panel | Headline | Screen shown |
|-------|----------|--------------|
| `01-reader`    | Read the ancient world, word by word | Word-by-word reader with the Iliad proem + word inspector (lemma, morphology, AI note) |
| `02-tutor`     | Your own philology tutor             | AI tutor chat, six difficulty modes, follow-up suggestions |
| `03-review`    | Never forget a word                  | FSRS-5 spaced-repetition review card with Again/Hard/Good/Easy |
| `04-library`   | A library of the classics            | Curated corpus grid across Greek, Latin, Hebrew, Sanskrit, Akkadian |
| `05-audio`     | Hear it the way it sounded           | AudioLab: waveform, IPA, restored/Erasmian/modern traditions |
| `06-languages` | Eleven ancient languages             | Language picker with native script samples for all 11 |

Each panel is produced at the sizes App Store Connect and Play Console accept:

- **`ios-6.7/*.png`** — 1284 × 2778 px (iPhone 6.7" display) — iPhone 17 Pro Max frame.
- **`ios-6.5/*.png`** — 1242 × 2688 px (iPhone 6.5" display) — iPhone 17 Pro Max frame.
- **`ipad-13/*.png`** — 2064 × 2752 px (iPad 13" display) — iPad Pro frame, tablet layouts.
- **`ipad-12.9/*.png`** — 2048 × 2732 px (iPad 12.9" display) — iPad Pro frame, tablet layouts.
- **`android/*.png`** — 1080 × 2400 px (9:20 portrait phone).

The iPad panels are not the phone screens scaled up — they use genuine tablet layouts
(reader + inspector split, tutor reading/chat split, library filter rail + 3-column grid,
review stats rail, AudioLab word list + detail).

Drop the PNGs straight into App Store Connect (Media Manager) and Google Play Console
(Store listing → Phone screenshots). Both stores want 2–10 images; all six per platform
are upload-ready as-is.

## Regenerate

```bash
node store/screenshots/generate.mjs   # writes the HTML panels into ios/ and android/
bash store/screenshots/capture.sh     # renders each to PNG with headless Chrome
```

- `generate.mjs` is the single source of truth — palette, copy, and every screen mockup
  live there. Edit a caption or UI detail and re-run both commands.
- `capture.sh` uses the system Google Chrome in `--headless` mode. Override the binary
  with `CHROME=/path/to/chrome bash store/screenshots/capture.sh` if needed.
- Brand serif/script fonts (Cormorant Garamond, Crimson Pro, DM Mono, Noto Serif Hebrew /
  Devanagari, Noto Sans Coptic / Syriac / Cuneiform / Egyptian Hieroglyphs) load from
  Google Fonts at render time, so capturing requires a network connection.

The HTML panels are intermediate build artifacts; only the PNGs are the deliverable.
