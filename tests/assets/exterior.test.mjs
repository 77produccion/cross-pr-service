import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../..');
const catalog = JSON.parse(
  await readFile(path.join(root, 'docs/assets/exterior-catalog.json'), 'utf8'),
);
const photos = JSON.parse(
  await readFile(path.join(root, 'src/data/exterior.json'), 'utf8'),
);

test('exterior comparison preserves both PNG originals privately and their shared dimensions', async () => {
  assert.deepEqual(
    photos.map((photo) => photo.id),
    ['exterior-before', 'exterior-after'],
  );
  assert.equal(photos[0].width, photos[1].width);
  assert.equal(photos[0].height, photos[1].height);
  for (const photo of catalog) {
    const original = await readFile(path.join(root, photo.source));
    assert.equal(
      createHash('sha256').update(original).digest('hex'),
      photo.sha256,
    );
    assert.equal(original.length, photo.sourceBytes);
    const metadata = await sharp(original).metadata();
    assert.equal(metadata.width, photo.width);
    assert.equal(metadata.height, photo.height);
  }
  const publicFiles = await readdir(
    path.join(root, 'public/images/projects/two-story-exterior'),
  );
  assert.ok(!publicFiles.some((filename) => filename.endsWith('.png')));
  assert.ok(
    photos.every((photo) => !('source' in photo) && !('sha256' in photo)),
  );
});

test('exterior AVIF, WebP and JPEG variants decode without EXIF or upscaling', async () => {
  for (const photo of photos) {
    const formats = ['avif', 'webp', 'jpeg'];
    const widths = (format) =>
      photo.variants
        .filter((variant) => variant.format === format)
        .map((variant) => variant.width);
    assert.deepEqual(widths('avif'), widths('webp'));
    assert.deepEqual(widths('webp'), widths('jpeg'));
    for (const variant of photo.variants) {
      const buffer = await readFile(path.join(root, 'public', variant.src));
      const image = sharp(buffer);
      const metadata = await image.metadata();
      await image.stats();
      assert.equal(
        metadata.format,
        variant.format === 'avif' ? 'heif' : variant.format,
      );
      assert.equal(metadata.width, variant.width);
      assert.equal(metadata.height, variant.height);
      assert.equal(buffer.length, variant.bytes);
      assert.ok(variant.width <= photo.width);
      assert.ok(
        Math.abs(
          variant.height - (variant.width * photo.height) / photo.width,
        ) <= 1,
      );
      assert.equal(metadata.exif, undefined);
      assert.equal(metadata.orientation, undefined);
    }
    const largest = (format) =>
      photo.variants.filter((variant) => variant.format === format).at(-1)
        .bytes;
    assert.ok(
      largest('avif') < largest('webp'),
      'AVIF must justify its extra variants by reducing bytes',
    );
    assert.ok(formats.every((format) => widths(format).length > 0));
  }
});
