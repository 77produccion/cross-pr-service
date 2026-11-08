import { createHash } from 'node:crypto';
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
  rm,
  rmdir,
} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const sourceDirectory = path.join(root, 'Contenido Web/fixed');
const definitions = JSON.parse(
  await readFile(new URL('./photo-sources.json', import.meta.url), 'utf8'),
);
const fixedSources = JSON.parse(
  await readFile(
    new URL('./fixed-photo-sources.json', import.meta.url),
    'utf8',
  ),
);
const groups = JSON.parse(
  await readFile(new URL('./project-groups.json', import.meta.url), 'utf8'),
);
const groupByPhoto = new Map();
for (const group of groups) {
  for (const id of group.photos) {
    if (groupByPhoto.has(id))
      throw new Error(`Photo belongs to multiple projects: ${id}`);
    groupByPhoto.set(id, group.id);
  }
}
const previousPhotos = JSON.parse(
  await readFile(path.join(root, 'src/data/photos.json'), 'utf8').catch(
    () => '[]',
  ),
);
// Keep the original delivery traceable, without ever rewriting its files.
const previousCatalog = JSON.parse(
  await readFile(
    path.join(root, 'docs/assets/photo-catalog.json'),
    'utf8',
  ).catch(() => '[]'),
);
if (
  previousCatalog.length &&
  previousCatalog.every((photo) =>
    photo.source.startsWith('Contenido Web/Fotos/'),
  )
) {
  const archive = previousCatalog.map(({ id, source, sha256 }) => ({
    id,
    source,
    sha256,
  }));
  await writeFile(
    path.join(root, 'docs/assets/original-photo-checksums.json'),
    JSON.stringify(archive, null, 2) + '\n',
    { flag: 'wx' },
  ).catch((error) => {
    if (error.code !== 'EEXIST') throw error;
  });
}
const widths = [240, 480, 768, 1280, 1920];
const catalog = [];
const photos = [];
const checksums = new Map();
const sourceNames = new Set(Object.values(fixedSources));
const actualNames = (await readdir(sourceDirectory)).filter((file) =>
  /\.(jpe?g|png|webp|avif|tiff?)$/i.test(file),
);
if (
  sourceNames.size !== Object.keys(fixedSources).length ||
  actualNames.length !== sourceNames.size ||
  actualNames.some((file) => !sourceNames.has(file)) ||
  groupByPhoto.size !== sourceNames.size ||
  [...groupByPhoto.keys()].some((id) => !Object.hasOwn(fixedSources, id)) ||
  groups.some((group) => group.gallery === false || group.heldPhotos?.length)
) {
  throw new Error(
    'Every fixed file must map exactly once to an active gallery photo. Review fixed-photo-sources.json and project-groups.json.',
  );
}

await mkdir(path.join(root, 'docs/assets'), { recursive: true });
await mkdir(path.join(root, 'src/data'), { recursive: true });

for (const [id, source] of Object.entries(fixedSources)) {
  if (!/^cps-\d{3}$/.test(id) || path.basename(source) !== source)
    throw new Error(`Invalid fixed source mapping: ${id}`);
  const definition = definitions[Number(id.slice(4)) - 1];
  if (!definition)
    throw new Error(`Missing description for corrected photo: ${id}`);
  const [, slug, alt] = definition;
  const project = groupByPhoto.get(id);
  if (!project) throw new Error(`Missing project for photo: ${id}`);
  const outputDirectory = path.join(root, 'public/images/projects', project);
  await mkdir(outputDirectory, { recursive: true });
  const input = await readFile(path.join(sourceDirectory, source));
  const sha256 = createHash('sha256').update(input).digest('hex');
  // Changed pixels receive a new URL, so no old browser/CDN cache can mask the correction.
  const name = `${id}-${slug}-fixed-${sha256.slice(0, 8)}`;
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
      if (format === 'webp') pipeline.webp({ quality: 78, effort: 6 });
      else pipeline.jpeg({ quality: 78, progressive: true, mozjpeg: true });
      const info = await pipeline.toFile(path.join(outputDirectory, filename));
      variants.push({
        format,
        width: info.width,
        height: info.height,
        bytes: info.size,
        src: `/images/projects/${project}/${filename}`,
      });
    }
  }
  const largest = variants
    .filter((variant) => variant.format === 'jpeg')
    .at(-1);
  const photo = {
    id,
    project,
    name,
    alt,
    status: 'client-corrected',
    width: largest.width,
    height: largest.height,
    variants,
  };
  photos.push(photo);
  catalog.push({
    ...photo,
    source: `Contenido Web/fixed/${source}`,
    sha256,
    sourceWidth: width,
    sourceHeight: height,
    sourceBytes: input.length,
    duplicateOf,
    note: '',
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
// Remove only obsolete generated variants recorded by the previous catalog.
// Never recurse into directories or touch client source files.
const currentPaths = new Set(
  photos.flatMap((photo) => photo.variants.map((variant) => variant.src)),
);
const oldDirectories = new Set();
for (const photo of previousPhotos) {
  for (const variant of photo.variants) {
    if (currentPaths.has(variant.src)) continue;
    if (
      !/^\/images\/projects\/[a-z0-9-]+\/cps-\d{3}-[a-z0-9-]+\.(?:webp|jpg)$/.test(
        variant.src,
      )
    ) {
      throw new Error(
        `Refusing to remove unexpected variant path: ${variant.src}`,
      );
    }
    const file = path.join(root, 'public', variant.src);
    await rm(file, { force: true });
    oldDirectories.add(path.dirname(file));
  }
}
for (const directory of oldDirectories) {
  await rmdir(directory).catch((error) => {
    if (error.code !== 'ENOTEMPTY' && error.code !== 'ENOENT') throw error;
  });
}
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
