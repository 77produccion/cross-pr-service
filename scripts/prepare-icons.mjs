import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const logo = await readFile(
  new URL(
    '../Logo/png_logo_on_a_transparent_checkerboard_background.png',
    import.meta.url,
  ),
);
// Preserve the complete official PNG, including all lettering and transparency.
// Contain adds only transparent space to make a square; never crop or flatten it.
const background = { r: 0, g: 0, b: 0, alpha: 0 };
const sizes = [16, 32, 48, 180];
const icons = new Map();
for (const size of sizes) {
  const icon = await sharp(logo)
    .resize(size, size, {
      fit: 'contain',
      background,
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
  icons.set(size, icon);
}

// ICO stores three PNG images for native browser/Windows size selection.
const faviconSizes = [16, 32, 48];
const header = Buffer.alloc(6 + faviconSizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(faviconSizes.length, 4);
let offset = header.length;
for (const [index, size] of faviconSizes.entries()) {
  const entry = 6 + index * 16;
  const png = icons.get(size);
  header[entry] = size;
  header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
}
await Promise.all([
  writeFile(
    new URL('../public/favicon.ico', import.meta.url),
    Buffer.concat([header, ...faviconSizes.map((size) => icons.get(size))]),
  ),
  writeFile(
    new URL('../public/favicon-32x32.png', import.meta.url),
    icons.get(32),
  ),
  writeFile(
    new URL('../public/apple-touch-icon.png', import.meta.url),
    icons.get(180),
  ),
]);
console.log(
  'Complete transparent official PNG: favicon.ico (16/32/48), PNG (32), Apple touch icon (180).',
);
