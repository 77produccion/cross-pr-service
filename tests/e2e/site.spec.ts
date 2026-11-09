import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { site } from '../../src/config/site';

const projectGroups = JSON.parse(
  readFileSync(
    new URL('../../scripts/project-groups.json', import.meta.url),
    'utf8',
  ),
) as {
  id: string;
  title: string;
  category: string;
  gallery?: boolean;
  photos: string[];
  heldPhotos?: string[];
}[];

const galleryProjects = projectGroups.filter(
  (project) => project.gallery !== false,
);
const fixedPhotoIds = Object.keys(
  JSON.parse(
    readFileSync(
      new URL('../../scripts/fixed-photo-sources.json', import.meta.url),
      'utf8',
    ),
  ),
);

const routes = ['/', '/services/', '/about-us/', '/our-work/', '/contact/'];

test('WhatsApp label disappears after five seconds leaving a circular link', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/');
  const link = page.locator('.whatsapp-button');
  await expect(link.locator('span')).toBeVisible();
  await page.clock.fastForward(4000);
  await expect(link.locator('span')).toBeVisible();
  await page.clock.fastForward(1050);
  await expect(link).toHaveClass(/is-collapsing/);
  await expect(link.locator('span')).toHaveCSS('transition-duration', '0.25s');
  await page.clock.fastForward(500);
  await expect(link.locator('span')).toBeHidden();
  await expect(link.locator('svg')).toBeVisible();
  const box = await link.boundingBox();
  expect(box!.width).toBe(56);
  expect(box!.height).toBe(56);
  await expect(link).toHaveAccessibleName(
    'Chat with Cross Pro Services on WhatsApp (opens in a new tab)',
  );
});

test('floating WhatsApp link works on every page without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of routes) {
      await page.goto(route);
      const link = page.getByRole('link', {
        name: 'Chat with Cross Pro Services on WhatsApp (opens in a new tab)',
      });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('target', '_blank');
      const url = new URL((await link.getAttribute('href'))!);
      expect(url.origin).toBe('https://wa.me');
      expect(url.pathname).toBe('/15129179901');
      expect(url.searchParams.get('text')).toBe(site.whatsapp.message);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(link).toBeInViewport();
      const box = await link.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x + box!.width).toBeLessThan(width);
      expect(width - box!.x - box!.width).toBeCloseTo(20, 0);
    }
  }
  await context.close();
});

test('official logo favicon files are available in the production build', async ({
  request,
}) => {
  for (const path of [
    '/favicon.ico?v=full-logo',
    '/favicon-32x32.png?v=full-logo',
    '/apple-touch-icon.png?v=full-logo',
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect((await response.body()).length).toBeGreaterThan(100);
    expect(response.headers()['content-type']).toMatch(/image\//);
  }
});

test('footer and contact show the WhatsApp number with descriptive CTAs', async ({
  page,
}) => {
  await page.goto('/contact/');
  const footer = page.locator('.site-footer');
  const footerLink = footer.getByRole('link', { name: /Chat on WhatsApp:/ });
  await expect(footerLink).toHaveText(site.whatsapp.displayNumber);
  await expect(footerLink.locator('svg')).toBeVisible();
  for (const section of [footer, page.locator('.contact-aside')]) {
    await expect(section).toContainText('+1 (512) 917-9901');
    const link = section.getByRole('link', { name: /Chat on WhatsApp/ });
    await expect(link).toHaveAttribute(
      'href',
      `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.message)}`,
    );
    if (section !== footer)
      await expect(link).not.toContainText(site.whatsapp.displayNumber);
  }
});

for (const route of routes) {
  test(`${route} renders static accessible structure`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    const menu = page.getByRole('button', { name: 'Open menu', exact: true });
    if (await menu.isVisible()) await menu.click();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /.+/,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    await expect(
      page.locator('link[rel="icon"][type="image/png"]'),
    ).toHaveAttribute('href', '/favicon-32x32.png?v=full-logo');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      '/apple-touch-icon.png?v=full-logo',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('content works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'View all services' }).click();
  await expect(page).toHaveURL(/\/services\/$/);
  await context.close();
});

test('hero photograph fills its frame without hiding the heading', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const hero = page
    .locator('.hero-a-media, .hero-b-media, .hero-c-media')
    .first();
  const frame = await hero.boundingBox();
  const image = await hero.locator('img').first().boundingBox();
  expect(frame).not.toBeNull();
  expect(image).not.toBeNull();
  expect(Math.abs(frame!.height - image!.height)).toBeLessThan(2);
});

test('reduced motion leaves content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-reveal]').first()).toBeVisible();
  await expect(page.locator('[data-reveal]').first()).not.toHaveAttribute(
    'style',
    /opacity:\s*0/,
  );
});

test('gallery filters and photo viewer work with keyboard', async ({
  page,
}) => {
  await page.goto('/our-work/');
  await page.getByRole('button', { name: 'Cabinets', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(
    galleryProjects.filter((project) => project.category === 'Cabinets').length,
  );
  const photo = page.getByRole('link', {
    name: 'Enlarge: Kitchen cabinet finishes',
  });
  await photo.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(photo).toBeFocused();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(
    galleryProjects.length,
  );
});

test('contact is an honest non-submitting preview with selected service', async ({
  page,
}) => {
  await page.goto('/services/');
  await page
    .locator('#cabinets')
    .getByRole('link', { name: 'Request an Estimate', exact: true })
    .click();
  await expect(page.getByLabel('Project Type')).toHaveValue('cabinets');
  await expect(
    page.getByRole('button', { name: 'Send My Request' }),
  ).toBeDisabled();
  await expect(page.locator('#form-status')).toContainText(
    'No information is sent or saved',
  );
});

test('service index jumps to a service without creating extra routes', async ({
  page,
}) => {
  await page.goto('/services/');
  const index = page.getByRole('region', { name: 'Browse our services' });
  await expect(index.getByRole('link')).toHaveCount(6);
  await index.getByRole('link', { name: /Cabinet Projects/ }).click();
  await expect(page).toHaveURL(/\/services\/#cabinets$/);
  await expect(page.locator('#cabinets h2')).toHaveText('Cabinet Projects');
});

test('photo viewer stays inside the selected project and handles single-photo projects', async ({
  page,
}) => {
  await page.goto('/our-work/');
  await page.getByRole('button', { name: 'Exteriors', exact: true }).click();
  await page
    .getByRole('link', { name: 'Enlarge: Two-story exterior painting' })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('[data-photo-position]')).toHaveText('1 / 2');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('.lightbox-frame.is-active')).toHaveAttribute(
    'data-photo',
    'cps-026',
  );
  await dialog.getByRole('button', { name: 'Next photo' }).click();
  await expect(dialog.locator('[data-photo-position]')).toHaveText('1 / 2');
  await expect(dialog.locator('[data-project-title]')).toHaveText(
    'Two-story exterior painting',
  );
  await expect(dialog.locator('[data-project-description]')).toContainText(
    'covered rear porch',
  );
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Cabinets', exact: true }).click();
  await page
    .getByRole('link', { name: 'Enlarge: Kitchen cabinet finishes' })
    .click();
  await expect(
    dialog.getByRole('button', { name: 'Next photo' }),
  ).toBeEnabled();
  await expect(
    dialog.getByRole('button', { name: 'Previous photo' }),
  ).toBeEnabled();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('.lightbox-frame.is-active')).toHaveAttribute(
    'data-photo',
    'cps-023',
  );
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page
    .getByRole('link', { name: 'Enlarge: Commercial exterior' })
    .click();
  await expect(dialog.locator('[data-photo-position]')).toHaveText('1 / 1');
  await expect(
    dialog.getByRole('button', { name: 'Next photo' }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole('button', { name: 'Previous photo' }),
  ).toBeDisabled();
});

test('services remain navigable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/services/');
  await page
    .getByRole('region', { name: 'Browse our services' })
    .getByRole('link', { name: /Drywall Services/ })
    .click();
  await expect(page).toHaveURL(/#drywall$/);
  await page
    .locator('#drywall')
    .getByRole('link', { name: 'Request an Estimate', exact: true })
    .click();
  await expect(page).toHaveURL(/\/contact\/\?service=drywall$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /Get in Touch/ }),
  ).toBeVisible();
  await context.close();
});

test('animations are always enabled and cannot be disabled from the page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByLabel('Animation preference')).toHaveCount(0);
  await expect
    .poll(
      async () =>
        (await page.locator('.scroll-progress').getAttribute('style')) ?? '',
    )
    .toMatch(/transform/);
});

test('brand leads the tab title and the footer uses the official logo', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^Cross Pro Services \| Painting/);
  await expect(page.locator('.footer-brand img')).toHaveAttribute(
    'alt',
    'Cross Pro Services',
  );
  const colors = await page.locator('.site-footer').evaluate((footer) => ({
    background: getComputedStyle(footer).backgroundColor,
    text: getComputedStyle(footer).color,
  }));
  expect(colors.background).toBe('rgb(27, 29, 25)');
  expect(colors.text).not.toBe(colors.background);
});

test('hero fills the right edge and cycles photographs without location labels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.hero-c .kicker-c, .hero-c-vertical')).toHaveCount(
    0,
  );
  const slides = page.locator('[data-hero-slide]');
  await expect(slides).toHaveCount(7);
  await expect(slides.first().locator('picture')).toHaveAttribute(
    'data-company-photo',
    'van',
  );
  await expect(slides.first().locator('img')).toHaveAttribute(
    'loading',
    'eager',
  );
  await expect(slides.first().locator('img')).toHaveAttribute(
    'fetchpriority',
    'high',
  );
  const hero = await page.locator('.hero-c').boundingBox();
  const media = await page.locator('.hero-c-media').boundingBox();
  expect(Math.abs(hero!.height - media!.height)).toBeLessThan(2);
  expect(Math.abs(media!.x + media!.width - 1440)).toBeLessThan(2);
  await expect
    .poll(
      () =>
        slides
          .nth(1)
          .evaluate((slide) => Number(getComputedStyle(slide).opacity)),
      { timeout: 10000 },
    )
    .toBeGreaterThan(0.9);
  await expect(page.locator('h1')).toBeVisible();
});

test('mobile menu opens, closes with Escape and navigates', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  await expect(toggle).toBeVisible();
  await expect(page.getByRole('navigation')).not.toBeVisible();
  const buttonBox = await toggle.boundingBox();
  const logoBox = await page.locator('.brand').boundingBox();
  expect(buttonBox!.x).toBeLessThan(logoBox!.x);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await toggle.click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Services', exact: true })
    .click();
  await expect(page).toHaveURL(/\/services\/$/);
});

test('mobile hero is compact and each service keeps its own photograph', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const hero = await page.locator('.hero-c').boundingBox();
  expect(hero!.height).toBeLessThan(700);
  const items = page.locator('[data-service-item]');
  await expect(items).toHaveCount(3);
  for (const item of await items.all()) {
    await item.scrollIntoViewIfNeeded();
    const image = item.locator('.services-c-card-media img');
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    const photoBox = await image.boundingBox();
    const titleBox = await item.locator('h3').boundingBox();
    expect(photoBox!.y + photoBox!.height).toBeLessThan(titleBox!.y);
  }
});

test('desktop project strip aligns photos and keeps captions in the pinned viewport', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'Pinning requires a desktop pointer.',
  );
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto('/');
  const viewport = page.locator('[data-work-viewport]');
  await expect(viewport).toHaveClass(/is-pinned/);
  const top = await viewport.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate((y) => window.scrollTo(0, y), top);
  await expect
    .poll(async () => (await viewport.boundingBox())!.y)
    .toBeLessThan(120);
  const cards = await page.locator('.work-c-item .image-frame').all();
  const boxes = await Promise.all(cards.map((card) => card.boundingBox()));
  for (const box of boxes)
    expect(Math.abs(box!.y - boxes[0]!.y)).toBeLessThan(2);
  for (const caption of await page.locator('.work-c-item figcaption').all()) {
    const box = await caption.boundingBox();
    expect(box!.y + box!.height).toBeLessThan(900);
  }
});

test('interior thumbnails switch the main photograph smoothly with mouse and keyboard', async ({
  page,
}) => {
  await page.goto('/');
  const showcase = page.locator('[data-photo-switcher]');
  const links = showcase.locator('[data-showcase-select]');
  const photos = showcase.locator('[data-showcase-photo]');
  await expect(links).toHaveCount(2);
  await links.nth(1).click();
  await expect(links.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(photos.nth(1)).toHaveClass(/is-active/);
  await expect(photos.nth(0)).toHaveAttribute('aria-hidden', 'true');
  await expect
    .poll(() =>
      photos
        .nth(1)
        .evaluate((photo) => Number(getComputedStyle(photo).opacity)),
    )
    .toBeGreaterThan(0.99);
  await links.nth(0).focus();
  await page.keyboard.press('Enter');
  await expect(photos.nth(0)).toHaveClass(/is-active/);
  await expect(showcase.getByRole('status')).toContainText('Photo 1 of 2');
  await expect(page).toHaveURL(/\/$/);
});

test('interior thumbnails remain real image links without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('[data-showcase-select]').nth(1).click();
  await expect(page).toHaveURL(
    /\/images\/projects\/geometric-fireplace\/cps-001-.+\.webp$/,
  );
  await context.close();
});

test('photographic CTA zooms on hover and keeps its contact link', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'Hover is a desktop enhancement.',
  );
  await page.goto('/');
  const banner = page.locator('.final-cta-photo');
  await banner.scrollIntoViewIfNeeded();
  const image = banner.locator('img');
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await banner.hover();
  await expect
    .poll(() =>
      image.evaluate((img) => new DOMMatrix(getComputedStyle(img).transform).a),
    )
    .toBeGreaterThan(1.05);
  await banner
    .getByRole('link', { name: 'Request an Estimate', exact: true })
    .click();
  await expect(page).toHaveURL(/\/contact\/$/);
});

test('shared photographic CTA uses the chosen company or project image on each applicable page', async ({
  page,
}) => {
  const banners = [
    ['/', 'company-van'],
    ['/services/', 'cps-022'],
    ['/about-us/', 'company-van'],
    ['/our-work/', 'cps-036'],
  ];
  for (const [route, image] of banners) {
    await page.goto(route!);
    const banner = page.locator('.final-cta-photo');
    await expect(banner).toHaveCount(1);
    await banner.scrollIntoViewIfNeeded();
    await expect(banner.locator('picture')).toHaveAttribute(
      image === 'company-van' ? 'data-company-photo' : 'data-photo-id',
      image === 'company-van' ? 'van' : image!,
    );
    await expect(
      banner.getByRole('link', { name: 'Request an Estimate', exact: true }),
    ).toHaveAttribute('href', '/contact/');
    expect(
      await banner.evaluate(
        (element) => getComputedStyle(element).flexDirection,
      ),
    ).toBe('column');
  }
  await page.goto('/contact/');
  await expect(page.locator('.final-cta-photo')).toHaveCount(0);
});

test('project viewer uses responsive WebP, project thumbnails and an icon-only close button', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/our-work/');
  await page.locator('#two-story-exterior [data-project-image]').click();
  const dialog = page.getByRole('dialog');
  const close = dialog.getByRole('button', {
    name: 'Close photo',
    exact: true,
  });
  await expect(close).toHaveText('');
  await expect(close.locator('svg')).toBeVisible();
  const active = dialog.locator('.lightbox-frame.is-active');
  await expect(active).toHaveAttribute('data-photo', 'cps-024');
  const currentSource = await active
    .locator('img')
    .evaluate((image: HTMLImageElement) => image.currentSrc);
  expect(currentSource).toMatch(/\/two-story-exterior\/cps-024-.+-\d+w\.webp$/);
  const selectedWidth = Number(currentSource.match(/-(\d+)w\.webp$/)![1]);
  expect(selectedWidth).toBeLessThan(1600);
  await expect(dialog.locator('.lightbox-thumbnails button')).toHaveCount(2);
  await expect(
    dialog.locator('.lightbox-thumbnails img').first(),
  ).toHaveAttribute('src', /-240w\.webp$/);
  await dialog.locator('[data-photo-id="cps-026"]').click();
  await expect(dialog.locator('.lightbox-frame.is-active')).toHaveAttribute(
    'data-photo',
    'cps-026',
  );
  await expect(dialog.locator('[data-photo-position]')).toHaveText('2 / 2');
  await close.click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.locator('#two-story-exterior [data-project-image]'),
  ).toBeFocused();
});

test('Home selected work opens the same project gallery instead of unrelated photos', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.work-c-item [data-project-image]').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-project-title]')).toHaveText(
    'Two-story exterior painting',
  );
  await expect(dialog.locator('.lightbox-thumbnails button')).toHaveCount(2);
  await expect(dialog.locator('.lightbox-frame.is-active')).toHaveAttribute(
    'data-photo',
    'cps-024',
  );
});

test('all project photographs remain reachable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/our-work/');
  await page
    .locator('#two-story-exterior')
    .getByRole('link', { name: 'View photo 2', exact: true })
    .click();
  await expect(page).toHaveURL(/\/two-story-exterior\/cps-026-.+\.webp$/);
  await context.close();
});

test('every project photo decodes and reopening a different gallery cancels stale closes', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/our-work/');
  await expect(page.locator('[data-gallery]')).toHaveAttribute(
    'data-ready',
    'true',
  );
  for (const project of galleryProjects) {
    await page
      .locator(`[data-project-image][data-project="${project.id}"]`)
      .evaluate((link: HTMLAnchorElement) => link.click());
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('[data-project-title]')).toHaveText(
      project.title,
    );
    const photos = project.photos.filter(
      (id) => !project.heldPhotos?.includes(id),
    );
    for (const [index, id] of photos.entries()) {
      if (index)
        await dialog
          .locator(`[data-photo-index="${index}"]`)
          .evaluate((button: HTMLButtonElement) => button.click());
      await expect(dialog.locator('.lightbox-frame.is-active')).toHaveAttribute(
        'data-photo',
        id,
      );
      await expect(dialog.locator('[data-photo-position]')).toHaveText(
        `${index + 1} / ${photos.length}`,
      );
    }
    await dialog.evaluate((element: HTMLDialogElement) => element.close());
  }
});

test('portrait photos use the desktop viewport height with details alongside, without cropping', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/our-work/');
  await page.locator('#brick-porch-entry [data-project-image]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.lightbox-frame.is-active')).toHaveAttribute(
    'data-photo',
    'cps-055',
  );
  const stage = await dialog.locator('.lightbox-stage').boundingBox();
  const sidebar = await dialog.locator('.lightbox-sidebar').boundingBox();
  expect(stage!.height).toBeGreaterThan(750);
  expect(Math.abs(stage!.width / stage!.height - 0.75)).toBeLessThan(0.04);
  expect(sidebar!.x).toBeGreaterThanOrEqual(stage!.x + stage!.width);
  await expect(dialog.locator('.lightbox-frame.is-active img')).toHaveCSS(
    'object-fit',
    'contain',
  );
});

test('mobile portraits are larger and the close icon stays visible when scrolling details', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/our-work/');
  await page.locator('#brick-porch-entry [data-project-image]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.lightbox-frame.is-active')).toHaveAttribute(
    'data-photo',
    'cps-055',
  );
  const stage = await dialog.locator('.lightbox-stage').boundingBox();
  expect(stage!.height).toBeGreaterThan(440);
  expect(stage!.width).toBeGreaterThan(350);
  await dialog.locator('.lightbox-content').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  const close = dialog.getByRole('button', {
    name: 'Close photo',
    exact: true,
  });
  await expect(close).toBeInViewport();
  await close.click();
  await expect(dialog).not.toBeVisible();
});

test('restored restroom gallery keeps all four client photographs together', async ({
  page,
}) => {
  await page.goto('/our-work/');
  await page.locator('#restroom-wall-panels [data-project-image]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.lightbox-thumbnails button')).toHaveCount(4);
  await expect(dialog.locator('[data-photo-position]')).toHaveText('1 / 4');
  for (const id of ['cps-004', 'cps-006', 'cps-008', 'cps-015']) {
    await expect(dialog.locator(`[data-photo-id="${id}"]`)).toHaveCount(1);
  }
});

test('every corrected fixed photo is published once and no older asset URL is used', async ({
  page,
}) => {
  await page.goto('/our-work/');
  const data = JSON.parse(
    (await page.locator('[data-gallery-projects]').textContent()) ?? '[]',
  ) as { photos: { id: string; variants: { src: string }[] }[] }[];
  const photos = data.flatMap((project) => project.photos);
  expect(photos.map((photo) => photo.id).sort()).toEqual(
    [...fixedPhotoIds].sort(),
  );
  expect(new Set(photos.map((photo) => photo.id)).size).toBe(
    fixedPhotoIds.length,
  );
  for (const photo of photos) {
    for (const variant of photo.variants)
      expect(variant.src).toMatch(/-fixed-[a-f0-9]{8}-\d+w\.(webp|jpg)$/);
  }
  for (const route of routes) {
    await page.goto(route);
    for (const image of await page
      .locator('main picture[data-photo-id] img')
      .all()) {
      await expect(image).toHaveAttribute(
        'src',
        /-fixed-[a-f0-9]{8}-\d+w\.jpg$/,
      );
    }
  }
});

test('company van uses responsive WebP in the first hero slide and the Home CTA', async ({
  page,
}) => {
  await page.goto('/');
  const first = page.locator('[data-hero-slide]').first().locator('picture');
  await expect(first).toHaveAttribute('data-company-photo', 'van');
  await expect(first.locator('source[type="image/webp"]')).toHaveAttribute(
    'srcset',
    /480w/,
  );
  await expect(first.locator('img')).toHaveAttribute('loading', 'eager');
  await expect(first.locator('img')).toHaveAttribute('fetchpriority', 'high');
  await expect(first.locator('img')).toHaveAttribute(
    'alt',
    /Cross Pro Services work van/,
  );
  const source = await first
    .locator('img')
    .evaluate((image: HTMLImageElement) => image.currentSrc);
  expect(source).toMatch(/\/_astro\/.+\.webp$/);
  const banner = page.locator('.final-cta-photo');
  await banner.scrollIntoViewIfNeeded();
  await expect(banner.locator('picture')).toHaveAttribute(
    'data-company-photo',
    'van',
  );
  await expect(banner.locator('img')).toHaveAttribute('loading', 'lazy');
  await expect(banner.locator('img')).toHaveAttribute('alt', '');
});
