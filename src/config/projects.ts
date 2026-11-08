const house = 'cps-024';
const interior = 'cps-007';
const kitchen = 'cps-022';
const entry = 'cps-002';
const porch = 'cps-017';
const drywall = 'cps-038';
const wood = 'cps-047';
const bathroom = 'cps-042';

// Related interior details selected visually; not an approved before/after pair.
export const interiorDetails = [
  'cps-009',
  'cps-010',
  'cps-014',
  'cps-001',
] as const;

export const ctaPhotos: Readonly<Record<string, string>> = {
  home: 'cps-030',
  services: 'cps-022',
  'about-us': 'cps-007',
  'our-work': 'cps-036',
};

// Client-supplied material selected for V1 review. Locations and pairings unverified.
export const projects = [
  {
    image: house,
    title: 'Exterior details',
    category: 'Exteriors',
    alt: 'Rear exterior of a two-story house with dark siding and a covered porch',
  },
  {
    image: interior,
    title: 'A fresh interior',
    category: 'Interiors',
    alt: 'Light-filled living room with white walls and a dark fireplace surround',
  },
  {
    image: kitchen,
    title: 'Kitchen details',
    category: 'Cabinets',
    alt: 'Kitchen with white cabinetry and a central island',
  },
  {
    image: entry,
    title: 'A welcoming entrance',
    category: 'Exteriors',
    alt: 'Wood front door framed by light-colored masonry',
  },
  {
    image: porch,
    title: 'Outdoor living',
    category: 'Exteriors',
    alt: 'Covered outdoor space with white posts and a wood ceiling',
  },
  {
    image: bathroom,
    title: 'Interior finishes',
    category: 'Interiors',
    alt: 'Bathroom vanity with dark blue cabinetry and a light countertop',
  },
  {
    image: 'cps-040',
    title: 'Cabinet details',
    category: 'Cabinets',
    alt: 'Dark wine storage cabinets with diamond-shaped shelves',
  },
  {
    image: 'cps-039',
    title: 'Interior details',
    category: 'Interiors',
    alt: 'Double bathroom vanity beneath a patterned wall',
  },
  {
    image: 'cps-048',
    title: 'Exterior finishes',
    category: 'Exteriors',
    alt: 'Gray house siding and white fascia above a fence',
  },
  {
    image: 'cps-012',
    title: 'Commercial exterior',
    category: 'Exteriors',
    alt: 'Exterior of a two-story commercial building',
  },
  {
    image: 'cps-044',
    title: 'Entry details',
    category: 'Exteriors',
    alt: 'Dark wood entry door set into a stone facade',
  },
  {
    image: 'cps-054',
    title: 'Timber details',
    category: 'Interiors',
    alt: 'Carved wood doorway opening into a room with timber beams',
  },
] as const;

export const services = [
  {
    id: 'interior-painting',
    title: 'Interior Painting',
    image: interior,
    alt: projects[1].alt,
    description:
      'Refresh the look and feel of your home or business with professional interior painting. We focus on quality finishes and careful attention to detail.',
  },
  {
    id: 'exterior-painting',
    title: 'Exterior Painting',
    image: house,
    alt: projects[0].alt,
    description:
      'Give your property a fresh look with exterior painting services designed to improve its appearance and curb appeal.',
  },
  {
    id: 'drywall',
    title: 'Drywall Services',
    image: drywall,
    alt: 'Interior wall with exposed areas during renovation',
    description:
      'From drywall repairs to surface preparation, we help create smooth, clean walls ready for a beautiful finish.',
  },
  {
    id: 'cabinets',
    title: 'Cabinet Projects',
    image: kitchen,
    alt: projects[2].alt,
    description:
      'Update the look of your cabinets as part of your next home improvement project. Contact us to discuss the scope of your project.',
  },
  {
    id: 'wood-repairs',
    title: 'Exterior Wood Repairs',
    image: wood,
    alt: 'Exterior house siding with white trim beside a fence',
    description:
      'Repair damaged exterior wood features and improve the appearance of your property with professional workmanship.',
  },
  {
    id: 'remodeling',
    title: 'Residential & Commercial Remodeling',
    image: porch,
    alt: projects[4].alt,
    description:
      'Planning to improve your home or business? Our team offers remodeling services tailored to the needs of your space.',
  },
] as const;
