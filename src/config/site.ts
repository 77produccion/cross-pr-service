export const site = {
  name: 'Cross Pro Services',
  language: 'en-US',
  // Development scaffold: do not index until content and contact details are approved.
  noindex: true,
  whatsapp: {
    number: '15129179901',
    displayNumber: '+1 (512) 917-9901',
    message:
      "Hi Cross Pro Services! I visited your website and would love to discuss a painting or remodeling project for my home or business. I'd like to learn how your team can help and request an estimate. May I share my project details, location, and a few photos?",
  },
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services/' },
    { label: 'About Us', href: '/about-us/' },
    { label: 'Our Work', href: '/our-work/' },
    { label: 'Contact', href: '/contact/' },
  ],
} as const;

export const whatsappHref = `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.message)}`;
