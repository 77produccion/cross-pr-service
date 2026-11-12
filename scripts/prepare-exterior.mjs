import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { copyFile, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const sourceDirectory = path.join(
  root,
  'Contenido Web/Before After/two-story-exterior',
);
const outputDirectory = path.join(
  root,
  'public/images/projects/two-story-exterior',
);
await mkdir(sourceDirectory, { recursive: true });
const definitions = [
  [
    'exterior-before',
    'exterior-1.png',
    'Two-story home before exterior painting, with light siding and worn fascia',
  ],
  [
    'exterior-after',
    'exterior-2.png',
    'The same two-story home after exterior painting, with dark siding and trim',
  ],
];
const photos = [];
const catalog = [];
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');

for (const [id, filename, alt] of definitions) {
  const source = path.join(sourceDirectory, filename);
  const delivered = path.join(outputDirectory, filename);
  // Archive only these two explicitly supplied PNGs, preserving their bytes.
  const input = await readFile(delivered).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (input) {
    await copyFile(delivered, source, constants.COPYFILE_EXCL).catch(
      (error) => {
        if (error.code !== 'EEXIST') throw error;
      },
    );
    if (hash(await readFile(source)) !== hash(input))
      throw new Error(`Archive mismatch: ${filename}`);
    await unlink(delivered);
  }
  const buffer = await readFile(source);
  const metadata = await sharp(buffer).metadata();
  const width = metadata.autoOrient.width;
  const height = metadata.autoOrient.height;
  if (!width || !height) throw new Error(`Invalid image: ${filename}`);
  const sha256 = hash(buffer);
  const name = `${id}-${sha256.slice(0, 8)}`;
  const widths = [
    ...new Set(
      [480, 768, 1280, Math.min(width, 1920)].filter((size) => size <= width),
    ),
  ].sort((a, b) => a - b);
  const variants = [];
  for (const target of widths) {
    for (const format of ['avif', 'webp', 'jpeg']) {
      const extension = format === 'jpeg' ? 'jpg' : format;
      const filename = `${name}-${target}w.${extension}`;
      const pipeline = sharp(buffer)
        .autoOrient()
        .toColourspace('srgb')
        .resize({ width: target, withoutEnlargement: true });
      if (format === 'avif') pipeline.avif({ quality: 50, effort: 5 });
      else if (format === 'webp') pipeline.webp({ quality: 78, effort: 6 });
      else pipeline.jpeg({ quality: 78, progressive: true, mozjpeg: true });
      const info = await pipeline.toFile(path.join(outputDirectory, filename));
      variants.push({
        format,
        width: info.width,
        height: info.height,
        bytes: info.size,
        src: `/images/projects/two-story-exterior/${filename}`,
      });
    }
  }
  const photo = {
    id,
    project: 'two-story-exterior',
    name,
    alt,
    width,
    height,
    variants,
  };
  photos.push(photo);
  catalog.push({
    ...photo,
    source: `Contenido Web/Before After/two-story-exterior/${filename}`,
    sha256,
    sourceBytes: buffer.length,
  });
  console.log(
    JSON.stringify({
      id,
      originalBytes: buffer.length,
      largest: variants.filter((variant) => variant.width === widths.at(-1)),
    }),
  );
}
if (
  photos[0].width !== photos[1].width ||
  photos[0].height !== photos[1].height
)
  throw new Error('Comparison images must share dimensions.');
await writeFile(
  path.join(root, 'src/data/exterior.json'),
  JSON.stringify(photos, null, 2) + '\n',
);
await writeFile(
  path.join(root, 'docs/assets/exterior-catalog.json'),
  JSON.stringify(catalog, null, 2) + '\n',
);
