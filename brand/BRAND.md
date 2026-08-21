# Paleoglossa — brand kit

Everything here is generated from source, so the feed and the product can never drift apart:
the colours are the same hex values as `src/index.css`, and every asset is rebuilt with one
command.

```bash
node brand/render.mjs           # rebuild every PNG
node brand/render.mjs p02 p07   # rebuild just those cards
```

Requires the repo's dev dependencies (`playwright`) and a network connection the first time,
since fonts come from Google Fonts.

---

## The mark

A Greek capital **Π** — *paleo-* + *glossa*, and the first letter of the alphabet chart every
beginner meets — sitting on a gold manuscript rule, the ruled baseline a scribe drew before
writing a line.

It is drawn as **paths, not text**, so it renders identically with no font installed. Source of
truth is `logo/paleoglossa-glyph.svg` (letterform + rule, no background); `logo/paleoglossa-mark.svg`
is that glyph inside the parchment app-icon tile.

| File | Use |
|------|-----|
| `logo/paleoglossa-glyph.svg` | The letterform alone. Recolour by setting `fill` on the group. |
| `logo/paleoglossa-mark.svg` | App-icon tile: glyph on parchment with rounded corners. |
| `logo/out/avatar-1080.png` | **Instagram profile picture.** Everything is inside the circle-safe area. |
| `logo/out/lockup-horizontal.png` | 1600 × 460. Site headers, email signatures, wide placements. |
| `logo/out/lockup-stacked.png` | 1080 × 1080. Square placements, sponsor slots. |
| `logo/out/lockup-dark.png` | Same lockup on `#151b23` for dark backgrounds. |
| `logo/out/paleoglossa-mark-{1024,256,64}.png` | Raster mark. The 64 px render is the legibility check. |
| `logo/out/story-template.png` | Empty 9:16 story frame with the type scale marked. |
| `logo/out/highlight-{read,learn,listen}.png` | Story-highlight covers (Α / Β / Γ). |

**Clear space:** one bar-height of the Π on every side. **Minimum size:** 32 px for the mark,
120 px wide for the horizontal lockup. Never restretch, recolour outside the palette below,
add a drop shadow, or set the wordmark in anything but Cormorant Garamond.

---

## Palette

Straight from `src/index.css`.

| Token | Hex | Role |
|-------|-----|------|
| Parchment | `#F8F3E8` | Page ground — every card starts here |
| Parchment 2 | `#F0E9D5` | Panel fill |
| Border | `#CFC0A0` | Hairlines, panel edges |
| Ink | `#1A1410` | Headlines |
| Ink 2 | `#3D3020` | Body copy |
| Ink 3 | `#6B5C48` | Captions, secondary |
| Muted | `#7A6A52` | Labels, metadata |
| **Gold** | `#B8842A` | The accent. Rules, kickers, numerals. Never for body text. |
| **Blue** | `#1E3D6E` | The mark, ancient-text highlights, data |
| Jade | `#1E5C38` | "Familiar" state only |
| Ruby | `#8C1C1C` | Errors only — avoid in marketing |

Ink on parchment is 16.5:1; blue on parchment is 9.7:1. Gold on parchment is only **3.0:1** —
it clears the large-text threshold and nothing more, so it stays on rules and the 20 px+
letterspaced mono labels. Never gold body copy, never gold on gold.

---

## Type

| Role | Face | Notes |
|------|------|-------|
| Display / headlines | **Cormorant Garamond** 600 | Tight leading (1.0–1.1), slight negative tracking |
| Body | **Crimson Pro** 400 | 1.5 leading, ~27 characters per line |
| Labels, data, kickers | **DM Mono** 400–500 | Uppercase, 0.16–0.24em tracking, always |
| Greek & polytonic | **Gentium Book Plus** | Cormorant has no polytonic coverage — do not substitute |
| Hebrew | Noto Serif Hebrew | Full pointing |
| Syriac / Coptic / Devanagari / cuneiform / hieroglyphs | matching Noto face | See `_shared.css` |

The italic in "*word by word*" is Cormorant Garamond 500 italic in blue. That pairing —
roman ink headline, italic blue kicker phrase — is the house voice; reuse it.

---

## Card grammar

Every in-feed card is built the same way, which is what makes the grid read as one publication:

1. **Double gold rule** inset 44 px / 51 px — the scribal frame.
2. **Kicker** top-left: gold number, then a mono label, then a rule fading right.
3. **Stage** — the content, vertically centred, one idea only.
4. **Signature** bottom: Π badge, `PALEOGLOSSA`, and the URL right-aligned.

Never fill the stage edge to edge. The empty parchment is the brand.

---

## Files

```
brand/
├── BRAND.md                       this file
├── render.mjs                     HTML/SVG → PNG
├── logo/
│   ├── paleoglossa-glyph.svg      letterform + rule
│   ├── paleoglossa-mark.svg       icon tile
│   └── out/                       rendered logo, avatar, lockups, story assets
└── instagram/
    ├── CAPTIONS.md                the 10 launch captions, hashtags, alt text
    ├── source/
    │   ├── _shared.css            tokens + card chrome
    │   ├── posts.html             the 10 feed cards
    │   └── brand.html             avatar, lockups, story template, highlights
    └── out/                       the 10 post PNGs, 1080 × 1350
```

## Making a new post

Add a `<section class="card post" id="p11-slug">` to `posts.html`, follow the four-part card
grammar above, then `node brand/render.mjs p11`. The id becomes the filename.

Quote real text from the corpus rather than typing it from memory — the served JSON in
`public/corpus-data/` carries the accents and the treebank morphology, and a wrong breathing
mark in front of this audience is not survivable.
