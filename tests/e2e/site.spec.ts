import { expect, test } from '@playwright/test';

const routes = ['/', '/services/', '/about-us/', '/our-work/', '/contact/'];

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
  await expect(page.locator('.project-card:visible')).toHaveCount(2);
  const photo = page.getByRole('link', { name: 'Enlarge: Kitchen details' });
  await photo.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(photo).toBeFocused();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(12);
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

test('photo viewer moves through only the filtered photos', async ({
  page,
}) => {
  await page.goto('/our-work/');
  await page.getByRole('button', { name: 'Exteriors', exact: true }).click();
  await page.getByRole('link', { name: 'Enlarge: Exterior details' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('[data-photo-position]')).toHaveText('1 / 6');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('.lightbox-caption')).toHaveText(
    'A welcoming entrance',
  );
  await dialog.getByRole('button', { name: 'Next photo' }).click();
  await expect(dialog.locator('.lightbox-caption')).toHaveText(
    'Outdoor living',
  );
  await dialog.getByRole('button', { name: 'Next photo' }).click();
  await expect(dialog.locator('[data-photo-position]')).toHaveText('4 / 6');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Cabinets', exact: true }).click();
  await page.getByRole('link', { name: 'Enlarge: Kitchen details' }).click();
  await expect(
    dialog.getByRole('button', { name: 'Next photo' }),
  ).toBeEnabled();
  await expect(
    dialog.getByRole('button', { name: 'Previous photo' }),
  ).toBeEnabled();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('.lightbox-caption')).toHaveText(
    'Cabinet details',
  );
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
  await expect(slides).toHaveCount(6);
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
  await expect(links).toHaveCount(4);
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
  await links.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(photos.nth(2)).toHaveClass(/is-active/);
  await expect(showcase.getByRole('status')).toContainText('Photo 3 of 4');
  await expect(page).toHaveURL(/\/$/);
});

test('interior thumbnails remain real image links without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('[data-showcase-select]').nth(1).click();
  await expect(page).toHaveURL(/\/images\/projects\/cps-010\/.+\.webp$/);
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

test('shared photographic CTA uses a different image on each applicable page', async ({
  page,
}) => {
  const banners = [
    ['/', 'cps-030'],
    ['/services/', 'cps-022'],
    ['/about-us/', 'cps-007'],
    ['/our-work/', 'cps-036'],
  ];
  for (const [route, image] of banners) {
    await page.goto(route!);
    const banner = page.locator('.final-cta-photo');
    await expect(banner).toHaveCount(1);
    await banner.scrollIntoViewIfNeeded();
    await expect(banner.locator('picture')).toHaveAttribute(
      'data-photo-id',
      image!,
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
