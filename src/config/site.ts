export const site = {
  name: 'Cross Pro Services',
  language: 'en-US',
  // Development scaffold: do not index until content and contact details are approved.
  noindex: true,
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services/' },
    { label: 'About Us', href: '/about-us/' },
    { label: 'Our Work', href: '/our-work/' },
    { label: 'Contact', href: '/contact/' },
  ],
} as const;
