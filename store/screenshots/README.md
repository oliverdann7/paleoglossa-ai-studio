# App Store & Play Store screenshots

Real captures of the app, one set per store size. Each image is the app's own
UI at that device's logical size and pixel ratio — nothing is drawn or mocked.

## Screens

| File | Screen |
|------|--------|
| `01-reader`   | Reader — the opening of the *Iliad* from the curated library |
| `02-word`     | Word analysis — Μῆνιν: lemma, meaning, knowledge state |
| `03-review`   | Spaced-repetition review card with Again / Hard / Good / Easy |
| `04-library`  | Curated library |
| `05-audio`    | Pronunciation Lab |
| `06-language` | Language overview (Ancient Greek) |

## Sizes

| Folder | Pixels | Store slot |
|--------|--------|------------|
| `ios-6.7/`   | 1290 × 2796 | iPhone 6.7" / 6.9" |
| `ios-6.5/`   | 1242 × 2688 | iPhone 6.5" |
| `ipad-13/`   | 2064 × 2752 | iPad 13" |
| `ipad-12.9/` | 2048 × 2732 | iPad 12.9" |
| `android/`   | 1080 × 2400 | Google Play phone |

Files are JPEG (quality 92), which both stores accept. Upload them as they are.

## How they are made

```bash
npm run dev                         # http://localhost:3000, in another terminal
node store/screenshots/capture.cjs  # all sizes; add a folder name for just one
```

`capture.cjs` drives the app with a headless browser in guest ("Try Demo")
mode: it opens the *Iliad* from the library, saves the dictionary meaning of
five words and marks them Learning with the reader's own buttons, then opens
the review session the app schedules for them.

If the project's Playwright has no browser downloaded, either run
`npx playwright install chromium` or set `CHROMIUM_PATH` to a Chrome/Chromium
binary.

## What to know before uploading

- **Rendered in a browser, not on a device.** The apps show the same web UI
  inside a WebView, but these have no status bar and were rendered by
  Chromium, not by iOS's WebKit. For pixel-exact store images, re-take them in
  the iOS Simulator and an Android emulator.
- **Guest session.** The amber "Demo mode" banner is hidden and the web cookie
  notice is answered before the first screen, because a signed-in user of the
  store build sees neither. The tablet layouts still show the sidebar's
  "Demo mode" pill and a "Guest · Free" account chip.
- **No AI or audio screens.** The AI tutor, AI explanations and text-to-speech
  need an account and server keys, so they are not captured. Take those on a
  device from a signed-in production build if you want them in the listing.
- **No marketing captions.** These are plain screens. Add framing or captions
  in a design tool if you want them; keep the screen content unaltered.
