import groups from '../../scripts/project-groups.json';
import photos from '@/data/photos.json';

const house = 'cps-024';
const interior = 'cps-007';
const kitchen = 'cps-022';
const porch = 'cps-017';
const drywall = 'cps-038';
const wood = 'cps-047';

// Respect the client's project folders; never mix shelving with the fireplace.
export const interiorDetails = groups.find(
  (group) => group.id === 'geometric-fireplace',
)!.photos;

export const ctaPhotos: Readonly<Record<string, string>> = {
  home: 'company-van',
  services: 'cps-022',
  'about-us': 'company-van',
  'our-work': 'cps-036',
};

// Categories and descriptions describe visible material, not locations or promises.
export const projects = groups.map((group) => {
  const images = group.photos;
  const image = images[0]!;
  return {
    id: group.id,
    image,
    images,
    title: group.title,
    category: group.category,
    description: group.description,
    alt: photos.find((photo) => photo.id === image)!.alt,
  };
});

export const services = [
  {
    id: 'interior-painting',
    title: 'Interior Painting',
    image: interior,
    alt: photos.find((photo) => photo.id === interior)!.alt,
    description:
      'Refresh the look and feel of your home or business with professional interior painting. We focus on quality finishes and careful attention to detail.',
  },
  {
    id: 'exterior-painting',
    title: 'Exterior Painting',
    image: house,
    alt: photos.find((photo) => photo.id === house)!.alt,
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
    alt: photos.find((photo) => photo.id === kitchen)!.alt,
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
    alt: photos.find((photo) => photo.id === porch)!.alt,
    description:
      'Planning to improve your home or business? Our team offers remodeling services tailored to the needs of your space.',
  },
] as const;
