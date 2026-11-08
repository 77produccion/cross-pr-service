import photos from '@/data/photos.json';

export function getPhoto(id: string) {
  const photo = photos.find((photo) => photo.id === id);
  if (!photo) throw new Error(`Unknown photo ID: ${id}`);
  return photo;
}

export function getPhotoSource(id: string, format = 'webp') {
  return getPhoto(id)
    .variants.filter((variant) => variant.format === format)
    .at(-1)!.src;
}
