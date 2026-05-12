import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const appIconSvg = fs.readFileSync(path.join(publicDir, 'icon-app.svg'));
const sealIconSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'));

async function generate() {
  // PWA + Android / Google Play
  await sharp(appIconSvg).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(appIconSvg).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));

  // Apple touch icon (home screen on iOS)
  await sharp(appIconSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Apple App Store (must be 1024×1024, no alpha, no transparency)
  await sharp(appIconSvg)
    .resize(1024, 1024)
    .flatten({ background: '#F8F3E8' })
    .png()
    .toFile(path.join(publicDir, 'app-store-icon-1024.png'));

  // Google Play high-res icon (512×512)
  await sharp(appIconSvg)
    .resize(512, 512)
    .flatten({ background: '#F8F3E8' })
    .png()
    .toFile(path.join(publicDir, 'play-store-icon-512.png'));

  // Favicon sizes from the seal mark (transparent bg looks good in browser tabs)
  await sharp(sealIconSvg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(sealIconSvg).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));

  console.log('✓ All icons generated in public/');
}

generate().catch(console.error);
