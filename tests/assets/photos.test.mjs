import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../..');
const catalog = JSON.parse(
  await readFile(path.join(root, 'docs/assets/photo-catalog.json'), 'utf8'),
);
const publicCatalog = JSON.parse(
  await readFile(path.join(root, 'src/data/photos.json'), 'utf8'),
);

test('all originals are traceable and unchanged', async () => {
  const originals = (
    await readdir(path.join(root, 'Contenido Web/Fotos'))
  ).filter((file) => /\.(jpe?g|png)$/i.test(file));
  assert.equal(catalog.length, originals.length);
  assert.equal(new Set(catalog.map((photo) => photo.id)).size, catalog.length);
  assert.equal(
    new Set(catalog.map((photo) => photo.source)).size,
    catalog.length,
  );
  for (const photo of catalog) {
    const original = await readFile(path.join(root, photo.source));
    assert.equal(
      createHash('sha256').update(original).digest('hex'),
      photo.sha256,
    );
    assert.match(photo.name, /^cps-\d{3}-[a-z0-9-]+$/);
    assert.ok(photo.alt);
  }
});

test('responsive variants decode, match metadata, strip EXIF and never upscale', async () => {
  for (const photo of catalog) {
    for (const variant of photo.variants) {
      const buffer = await readFile(path.join(root, 'public', variant.src));
      const image = sharp(buffer);
      const metadata = await image.metadata();
      await image.stats(); // Decode pixels, not just the header.
      assert.equal(metadata.format, variant.format);
      assert.equal(metadata.width, variant.width);
      assert.equal(metadata.height, variant.height);
      assert.equal(buffer.length, variant.bytes);
      assert.ok(variant.width <= photo.sourceWidth);
      assert.ok(variant.width <= 1920);
      assert.ok(
        Math.abs(
          variant.height -
            (variant.width * photo.sourceHeight) / photo.sourceWidth,
        ) <= 1,
      );
      assert.equal(metadata.exif, undefined);
      assert.equal(metadata.orientation, undefined);
    }
    const widths = (format) =>
      photo.variants.filter((v) => v.format === format).map((v) => v.width);
    assert.deepEqual(widths('webp'), widths('jpeg'));
    assert.ok(widths('webp').length > 0);
  }
});

test('site catalog excludes private source paths and review notes', () => {
  assert.equal(publicCatalog.length, catalog.length);
  for (const photo of publicCatalog) {
    assert.equal(photo.source, undefined);
    assert.equal(photo.sha256, undefined);
    assert.equal(photo.note, undefined);
    assert.ok(catalog.some((entry) => entry.id === photo.id));
  }
});
