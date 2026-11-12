import { expect, test } from '@playwright/test';

const examples = [
  ['/', '.about-media'],
  ['/services/', '#interior-painting .service-image'],
  ['/about-us/', '.about-feature .image-frame'],
  ['/our-work/', '#two-story-exterior .image-frame'],
] as const;

test('photographs gently zoom on entry across Home and the inner pages without resizing their frames', async ({
  page,
}) => {
  for (const [route, selector] of examples) {
    await page.goto(route);
    const frame = page.locator(selector);
    const before = (await frame.boundingBox())!;
    await frame.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        frame
          .locator('picture')
          .evaluate(
            (picture) => new DOMMatrix(getComputedStyle(picture).transform).a,
          ),
      )
      .toBeCloseTo(1.035, 3);
    const after = (await frame.boundingBox())!;
    expect(after.width).toBeCloseTo(before.width, 0);
    expect(after.height).toBeCloseTo(before.height, 0);
    await expect(frame.locator('img')).toBeVisible();
  }
});

test('inner-page header and CTA photos also receive the entry zoom', async ({
  page,
}) => {
  await page.goto('/services/');
  for (const selector of ['.page-intro-media', '.final-cta-media']) {
    const frame = page.locator(selector);
    await frame.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        frame
          .locator('picture')
          .evaluate(
            (picture) => new DOMMatrix(getComputedStyle(picture).transform).a,
          ),
      )
      .toBeGreaterThan(1.03);
  }
});

test('photo hover and keyboard zoom complement the entry animation on a separate layer', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'Hover is a fine-pointer enhancement.',
  );
  await page.goto('/services/');
  const frame = page.locator('#interior-painting .service-image');
  await frame.scrollIntoViewIfNeeded();
  await frame.hover();
  const scale = () =>
    frame
      .locator('img')
      .evaluate((image) => new DOMMatrix(getComputedStyle(image).transform).a);
  await expect.poll(scale).toBeGreaterThan(1.05);
  await page.mouse.move(0, 0);
  await expect.poll(scale).toBeCloseTo(1, 3);
  await frame.focus();
  await expect.poll(scale).toBeGreaterThan(1.05);
});

test('comparison photos and the full-photo viewer retain their uncropped unscaled geometry', async ({
  page,
}) => {
  await page.goto('/');
  const comparison = page.locator('[data-comparison]');
  await comparison.scrollIntoViewIfNeeded();
  await expect(comparison.locator('[data-photo-motion]')).toHaveCount(0);
  for (const picture of await comparison.locator('picture').all()) {
    await expect(picture).toHaveCSS('transform', 'none');
    await expect(picture.locator('img')).toHaveCSS('transform', 'none');
  }
  await page.goto('/our-work/');
  await page.locator('#two-story-exterior [data-project-image]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-photo-motion]')).toHaveCount(0);
  await expect(dialog.locator('.lightbox-frame.is-active')).toHaveCSS(
    'transform',
    'none',
  );
  await expect(dialog.locator('.lightbox-frame.is-active img')).toHaveCSS(
    'object-fit',
    'contain',
  );
});

test('photo enhancement leaves visible images and content without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/about-us/');
  await expect(page.locator('h1')).toBeVisible();
  const picture = page.locator('.about-feature picture');
  await picture.scrollIntoViewIfNeeded();
  await expect(picture).toHaveCSS('transform', 'none');
  await expect(picture.locator('img')).toBeVisible();
  await context.close();
});
