/**
 * Renders the Paleoglossa brand + Instagram assets to PNG.
 *
 *   node brand/render.mjs            # render everything
 *   node brand/render.mjs 02 07      # render only cards whose id starts with 02 / 07
 *
 * Sources: brand/instagram/source/*.html  →  brand/instagram/out/*.png
 *          brand/logo/*.svg               →  brand/logo/out/*.png
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const filter = process.argv.slice(2);

const HTML_SOURCES = [
  { file: 'instagram/source/posts.html', outDir: 'instagram/out' },
  { file: 'instagram/source/brand.html', outDir: 'logo/out' },
];

const SVG_RENDERS = [
  { file: 'logo/paleoglossa-mark.svg', out: 'logo/out/paleoglossa-mark-1024.png', size: 1024 },
  { file: 'logo/paleoglossa-mark.svg', out: 'logo/out/paleoglossa-mark-256.png', size: 256 },
  { file: 'logo/paleoglossa-mark.svg', out: 'logo/out/paleoglossa-mark-64.png', size: 64 },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { width: 2200, height: 1200 },
});

for (const { file, outDir } of HTML_SOURCES) {
  const src = path.join(here, file);
  try {
    await fs.access(src);
  } catch {
    continue;
  }
  await fs.mkdir(path.join(here, outDir), { recursive: true });
  await page.goto('file://' + src, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const ids = await page.$$eval('.card', (els) => els.map((el) => el.id));
  for (const id of ids) {
    if (filter.length && !filter.some((f) => id.startsWith(f))) continue;
    const el = await page.$('#' + id);
    const out = path.join(here, outDir, `${id}.png`);
    await el.screenshot({ path: out });
    const { width, height } = await el.boundingBox();
    console.log(`✓ ${path.relative(here, out)}  ${width}×${height}`);
  }
}

await fs.mkdir(path.join(here, 'logo/out'), { recursive: true });
for (const { file, out, size } of SVG_RENDERS) {
  if (filter.length && !filter.some((f) => out.includes(f))) continue;
  const svg = await fs.readFile(path.join(here, file), 'utf8');
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`
  );
  await page.screenshot({ path: path.join(here, out), omitBackground: true });
  console.log(`✓ ${out}  ${size}×${size}`);
}

await browser.close();
