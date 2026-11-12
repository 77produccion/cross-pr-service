// Curated by visible finish: no preparation photos, masked surfaces or before views.
// This selection describes appearance, not a new certification of project scope.
export const heroPhotos = [
  { id: 'exterior-after', position: 'center 58%' },
  { id: 'cps-022', position: '58% center' },
  { id: 'cps-036', position: 'center 55%' },
  { id: 'cps-040', position: 'center 48%' },
  { id: 'cps-019', position: 'center 55%' },
  { id: 'cps-012', position: 'center 55%' },
] as const;

export const pageIntros: Record<
  string,
  { image: string; accent: string; summary: string }
> = {
  services: {
    image: 'cps-022',
    accent: 'Remodeling Services',
    summary:
      'Painting, drywall, cabinets and wood repairs for residential and commercial properties.',
  },
  'about-us': {
    image: 'cps-019',
    accent: 'Services',
    summary:
      'Over 10 years of painting and remodeling experience in Austin, San Antonio and surrounding communities.',
  },
  'our-work': {
    image: 'exterior-after',
    accent: 'Work',
    summary:
      'Painting and remodeling projects across Central Texas. Choose a project to see its photographs.',
  },
  contact: {
    image: 'cps-040',
    accent: 'Touch',
    summary:
      'Tell us about your painting or remodeling project in Austin, San Antonio or a nearby community.',
  },
};
