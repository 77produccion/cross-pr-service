import { expect, test } from '@playwright/test';
import { heroPhotos } from '../../src/config/presentation';

for (const route of ['/services/', '/about-us/', '/our-work/', '/contact/']) {
  test(`${route} shares the dark photographic direction, readable text and gold accents`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      'rgb(20, 22, 20)',
    );
    await expect(page.locator('.page-content')).toHaveCSS(
      'color',
      'rgb(243, 240, 232)',
    );
    await expect(page.locator('.page-intro h1 em')).toHaveCSS(
      'color',
      'rgb(220, 192, 136)',
    );
    await expect(page.locator('.page-intro-media img')).toHaveAttribute(
      'fetchpriority',
      'high',
    );
    await expect
      .poll(() =>
        page
          .locator('.page-intro-media img')
          .evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (route === '/contact/') {
      await expect(page.locator('.contact-form')).toHaveCSS(
        'background-color',
        'rgb(29, 32, 29)',
      );
      await expect(page.getByLabel('Full Name')).toHaveCSS(
        'color',
        'rgb(243, 240, 232)',
      );
    }
  });
}

test('desktop service cards reveal descriptions and darken on hover or keyboard focus', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'Hover is a fine-pointer enhancement.',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const card = page.locator('.home-service').first();
  const description = card.locator('.home-service-description');
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(description).toHaveCSS('opacity', '0');
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el, '::before').opacity))
    .toBe('0');
  await card.hover();
  await expect(description).toHaveCSS('opacity', '1');
  await expect
    .poll(() =>
      card.evaluate((el) => Number(getComputedStyle(el, '::before').opacity)),
    )
    .toBeGreaterThan(0.5);
  await page.mouse.move(0, 0);
  await expect(description).toHaveCSS('opacity', '0');
  await card.getByRole('link').focus();
  await expect(description).toHaveCSS('opacity', '1');
  await expect(card.getByRole('link')).toBeFocused();
});

test('touch service cards keep their descriptions visible without hover', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch fallback only.');
  await page.goto('/');
  for (const card of await page.locator('.home-service').all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('.home-service-description')).toHaveCSS(
      'opacity',
      '1',
    );
    await expect(card.getByRole('link')).toBeVisible();
  }
});

test('Home removes decorative repetition and does not download the entire hero without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(
    page.locator('.marquee, .trust, .hero-foot, .steps, .experience-badge'),
  ).toHaveCount(0);
  const slides = page.locator('[data-hero-slide]');
  await expect(slides).toHaveCount(6);
  expect(
    heroPhotos.some(
      (photo) => photo.id.includes('before') || photo.id.includes('van'),
    ),
  ).toBe(false);
  await expect(slides.first().locator('img')).toHaveAttribute(
    'src',
    /exterior-after/,
  );
  for (const slide of await slides.all().then((items) => items.slice(1))) {
    await expect(slide.locator('img')).not.toHaveAttribute('src');
    await expect(slide.locator('img')).toHaveAttribute('data-src', /fixed-/);
  }
  await expect(page.locator('.hero h1')).toBeVisible();
  await context.close();
});
