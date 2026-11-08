import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const sourceDirectory = path.join(root, 'Contenido Web/Fotos');
const definitions = JSON.parse(
  await readFile(new URL('./photo-sources.json', import.meta.url), 'utf8'),
);
const widths = [480, 768, 1280, 1920];
const catalog = [];
const photos = [];
const checksums = new Map();
const sourceNames = new Set(definitions.map(([source]) => source));
const actualNames = (await readdir(sourceDirectory)).filter((file) =>
  /\.(jpe?g|png)$/i.test(file),
);
if (
  sourceNames.size !== definitions.length ||
  actualNames.some((file) => !sourceNames.has(file))
) {
  throw new Error(
    'New or duplicated source definitions. Review photo-sources.json before processing.',
  );
}

await mkdir(path.join(root, 'docs/assets'), { recursive: true });
await mkdir(path.join(root, 'src/data'), { recursive: true });

for (const [index, [source, slug, alt, note = '']] of definitions.entries()) {
  const id = `cps-${String(index + 1).padStart(3, '0')}`;
  const name = `${id}-${slug}`;
  const outputDirectory = path.join(root, 'public/images/projects', id);
  await mkdir(outputDirectory, { recursive: true });
  const input = await readFile(path.join(sourceDirectory, source));
  const sha256 = createHash('sha256').update(input).digest('hex');
  const duplicateOf = checksums.get(sha256) ?? null;
  checksums.set(sha256, id);
  const metadata = await sharp(input).metadata();
  const rotated = (metadata.orientation ?? 1) >= 5;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) throw new Error(`Invalid image: ${source}`);
  // Never upscale small WhatsApp images; include their native width as the last candidate.
  const targetWidths = [
    ...new Set([
      ...widths.filter((size) => size < width),
      Math.min(width, 1920),
    ]),
  ].sort((a, b) => a - b);
  const variants = [];
  for (const target of targetWidths) {
    for (const format of ['webp', 'jpeg']) {
      const extension = format === 'jpeg' ? 'jpg' : 'webp';
      const filename = `${name}-${target}w.${extension}`;
      // Rotate before stripping EXIF. Sharp strips EXIF/GPS by default and converts to sRGB.
      const pipeline = sharp(input)
        .autoOrient()
        .toColourspace('srgb')
        .resize({ width: target, withoutEnlargement: true });
      if (format === 'webp') pipeline.webp({ quality: 82, effort: 5 });
      else pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true });
      const info = await pipeline.toFile(path.join(outputDirectory, filename));
      variants.push({
        format,
        width: info.width,
        height: info.height,
        bytes: info.size,
        src: `/images/projects/${id}/${filename}`,
      });
    }
  }
  const largest = variants
    .filter((variant) => variant.format === 'jpeg')
    .at(-1);
  const photo = {
    id,
    name,
    alt,
    status: 'pending-review',
    width: largest.width,
    height: largest.height,
    variants,
  };
  photos.push(photo);
  catalog.push({
    ...photo,
    source: `Contenido Web/Fotos/${source}`,
    sha256,
    sourceWidth: width,
    sourceHeight: height,
    sourceBytes: input.length,
    duplicateOf,
    note,
  });
  console.log(
    `${id}: ${width}×${height} → ${targetWidths.join(', ')}px (${variants.length} files)`,
  );
}

// JSON is deliberately unformatted here; run Prettier via npm run photos:prepare.
await writeFile(
  path.join(root, 'src/data/photos.json'),
  JSON.stringify(photos, null, 2) + '\n',
);
await writeFile(
  path.join(root, 'docs/assets/photo-catalog.json'),
  JSON.stringify(catalog, null, 2) + '\n',
);
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const rows = [
  [
    'id',
    'name',
    'original',
    'original_width',
    'original_height',
    'original_bytes',
    'largest_webp_bytes',
    'sha256',
    'duplicate_of',
    'review_note',
  ],
];
for (const photo of catalog)
  rows.push([
    photo.id,
    photo.name,
    photo.source,
    photo.sourceWidth,
    photo.sourceHeight,
    photo.sourceBytes,
    photo.variants.filter((v) => v.format === 'webp').at(-1).bytes,
    photo.sha256,
    photo.duplicateOf,
    photo.note,
  ]);
await writeFile(
  path.join(root, 'docs/assets/photo-catalog.csv'),
  '\uFEFF' +
    rows.map((row) => row.map(csvCell).join(',')).join('\r\n') +
    '\r\n',
);
const originalBytes = catalog.reduce(
  (sum, photo) => sum + photo.sourceBytes,
  0,
);
const webpBytes = catalog.reduce(
  (sum, photo) =>
    sum + photo.variants.filter((v) => v.format === 'webp').at(-1).bytes,
  0,
);
console.log(
  JSON.stringify(
    {
      photos: photos.length,
      files: photos.reduce((sum, p) => sum + p.variants.length, 0),
      originalBytes,
      largestWebpBytes: webpBytes,
      reductionPercent: Number(
        ((1 - webpBytes / originalBytes) * 100).toFixed(1),
      ),
    },
    null,
    2,
  ),
);
