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
const groups = JSON.parse(
  await readFile(path.join(root, 'scripts/project-groups.json'), 'utf8'),
);
const fixedSources = JSON.parse(
  await readFile(path.join(root, 'scripts/fixed-photo-sources.json'), 'utf8'),
);

test('all corrected fixed sources are traceable and unchanged', async () => {
  const originals = (
    await readdir(path.join(root, 'Contenido Web/fixed'))
  ).filter((file) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(file));
  assert.equal(catalog.length, originals.length);
  assert.deepEqual([...originals].sort(), Object.values(fixedSources).sort());
  assert.deepEqual(
    new Set(catalog.map((photo) => photo.id)),
    new Set(Object.keys(fixedSources)),
  );
  assert.equal(new Set(catalog.map((photo) => photo.id)).size, catalog.length);
  assert.equal(
    new Set(catalog.map((photo) => photo.source)).size,
    catalog.length,
  );
  for (const photo of catalog) {
    assert.equal(photo.source, `Contenido Web/fixed/${fixedSources[photo.id]}`);
    const original = await readFile(path.join(root, photo.source));
    assert.equal(
      createHash('sha256').update(original).digest('hex'),
      photo.sha256,
    );
    assert.match(photo.name, /^cps-\d{3}-[a-z0-9-]+$/);
    assert.ok(photo.name.endsWith(`-fixed-${photo.sha256.slice(0, 8)}`));
    assert.equal(photo.status, 'client-corrected');
    assert.ok(photo.alt);
  }
});

test('the original delivery remains archived and unchanged', async () => {
  const archive = JSON.parse(
    await readFile(
      path.join(root, 'docs/assets/original-photo-checksums.json'),
      'utf8',
    ),
  );
  const files = (await readdir(path.join(root, 'Contenido Web/Fotos'))).filter(
    (file) => /\.(jpe?g|png)$/i.test(file),
  );
  assert.equal(archive.length, files.length);
  for (const photo of archive) {
    const original = await readFile(path.join(root, photo.source));
    assert.equal(
      createHash('sha256').update(original).digest('hex'),
      photo.sha256,
    );
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

test('every photo belongs to exactly one named project and has a lightweight thumbnail', async () => {
  const ids = groups.flatMap((group) => group.photos);
  assert.deepEqual(new Set(ids), new Set(Object.keys(fixedSources)));
  assert.ok(
    groups.every(
      (group) => group.gallery !== false && !group.heldPhotos?.length,
    ),
    'No fixed photo may be excluded from the gallery',
  );
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, publicCatalog.length);
  assert.equal(new Set(groups.map((group) => group.id)).size, groups.length);
  for (const photo of publicCatalog) {
    const group = groups.find((group) => group.photos.includes(photo.id));
    assert.ok(group);
    assert.equal(photo.project, group.id);
    for (const variant of photo.variants) {
      assert.ok(
        variant.src.startsWith(`/images/projects/${group.id}/${photo.id}-`),
      );
    }
    const thumbnail = photo.variants.find(
      (variant) => variant.format === 'webp' && variant.width === 240,
    );
    assert.ok(thumbnail);
    assert.ok(thumbnail.bytes < 30000, `Thumbnail exceeds 30 KB: ${photo.id}`);
  }
  assert.deepEqual(await readdir(path.join(root, 'public/images')), [
    'projects',
  ]);
});
