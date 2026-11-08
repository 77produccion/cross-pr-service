import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const asset = (file) => new URL(`../../public/${file}`, import.meta.url);
const logo = new URL(
  '../../Logo/png_logo_on_a_transparent_checkerboard_background.png',
  import.meta.url,
);
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const expectedPixels = async (size) =>
  sharp(await readFile(logo))
    .resize(size, size, {
      fit: 'contain',
      background: transparent,
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer();

test('brand PNG icons preserve the complete logo and transparent background', async () => {
  for (const [file, size] of [
    ['favicon-32x32.png', 32],
    ['apple-touch-icon.png', 180],
  ]) {
    const image = sharp(await readFile(asset(file)));
    const metadata = await image.metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    assert.equal(metadata.hasAlpha, true);
    assert.equal(metadata.exif, undefined);
    assert.ok((await image.stats()).channels[0].stdev > 10);
    const alpha = (await image.stats()).channels.at(-1);
    assert.equal(alpha.min, 0);
    assert.ok(alpha.max > 0);
    assert.deepEqual(
      await image.ensureAlpha().raw().toBuffer(),
      await expectedPixels(size),
    );
  }
});

test('ICO includes valid 16, 32 and 48 px logo images', async () => {
  const ico = await readFile(asset('favicon.ico'));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    const bytes = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.ok(offset + bytes <= ico.length);
    const png = ico.subarray(offset, offset + bytes);
    const metadata = await sharp(png).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    assert.equal(metadata.hasAlpha, true);
    assert.deepEqual(
      await sharp(png).ensureAlpha().raw().toBuffer(),
      await expectedPixels(size),
    );
    if (size === 32)
      assert.deepEqual(png, await readFile(asset('favicon-32x32.png')));
  }
});
