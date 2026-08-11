/**
 * Regenerate the `sectionsPreview` arrays of bundled `remoteSections` stubs
 * (src/data/corpus/*-full.ts) from the served JSON they point at.
 * validation.test.ts locks the 1:1 correspondence between a stub's preview ids
 * and the served sections — run this after any re-sectioning of served texts
 * (e.g. resection-served-corpus.ts).
 *
 * Usage: npx tsx scripts/corpus/sync-stub-previews.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SERVED = 'public/corpus-data';
const STUB_DIR = 'src/data/corpus';

const served = new Map<string, { id: string; label: string }[]>();
for (const file of readdirSync(SERVED)) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const { text, sections } = JSON.parse(readFileSync(join(SERVED, file), 'utf-8'));
  served.set(
    text.id,
    (sections as { id: string; label?: string }[]).map((s) => ({ id: s.id, label: s.label ?? '' }))
  );
}

let patched = 0;
for (const file of readdirSync(STUB_DIR)) {
  if (!file.endsWith('.ts')) continue;
  const path = join(STUB_DIR, file);
  let src = readFileSync(path, 'utf-8');
  const before = src;
  for (const [textId, previews] of served) {
    const re = new RegExp(`(id: '${textId}',[\\s\\S]*?sectionsPreview: )(\\[[\\s\\S]*?\\])`);
    const m = src.match(re);
    if (!m) continue;
    // Only rewrite when the ID LIST differs — that is the invariant
    // validation.test.ts locks. Labels are curated in the stubs (the served
    // labels are often raw source codes like "ACT 1"), so label-only
    // differences never trigger a rewrite.
    const existingIds = [...m[2].matchAll(/id: '([^']*)'/g)].map((e) => e[1]);
    const same =
      existingIds.length === previews.length && existingIds.every((id, i) => id === previews[i].id);
    if (same) continue;
    const rendered =
      '[\n' +
      previews.map((p) => `    { id: '${p.id}', label: ${JSON.stringify(p.label)} },`).join('\n') +
      '\n  ]';
    src = src.replace(re, `${m[1]}${rendered}`.replace(/\$/g, '$$$$'));
    patched++;
  }
  if (src !== before) {
    writeFileSync(path, src, 'utf-8');
    console.log(`patched ${file}`);
  }
}
console.log(`${patched} stub previews rewritten`);
