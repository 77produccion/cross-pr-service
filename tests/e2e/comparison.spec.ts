import { expect, test } from '@playwright/test';
import { heroPhotos } from '../../src/config/presentation';

test('exterior comparison supports keyboard, exact endpoints and pointer dragging', async ({
  page,
}) => {
  await page.goto('/');
  const comparison = page.locator('[data-comparison]');
  const range = page.getByRole('slider', {
    name: 'Compare exterior painting before and after',
  });
  await comparison.scrollIntoViewIfNeeded();
  await expect(comparison).toHaveClass(/is-ready/);
  await expect(range).toHaveValue('50');
  await expect(range).toHaveAttribute(
    'aria-valuetext',
    '50% before, 50% after',
  );
  await range.focus();
  await page.keyboard.press('ArrowRight');
  await expect(range).toHaveValue('51');
  await expect(range).toHaveAttribute(
    'aria-valuetext',
    '51% before, 49% after',
  );
  await page.keyboard.press('Home');
  await expect(range).toHaveValue('0');
  await expect(comparison).toHaveCSS('--comparison-position', '0%');
  await page.keyboard.press('End');
  await expect(range).toHaveValue('100');
  await expect(comparison).toHaveCSS('--comparison-position', '100%');
  await page.keyboard.press('Home');
  const box = (await comparison.boundingBox())!;
  await page.mouse.move(box.x + 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect
    .poll(async () => Number(await range.inputValue()))
    .toBeGreaterThan(65);
  await expect
    .poll(async () => Number(await range.inputValue()))
    .toBeLessThan(85);
  const photo = comparison.locator('.comparison-after img');
  await expect(photo).toHaveCSS('object-fit', 'contain');
  await expect(photo).toHaveAttribute('width', '1448');
  await expect(photo).toHaveAttribute('height', '1086');
  expect(Math.abs(box.width / box.height - 4 / 3)).toBeLessThan(0.01);
});

test('mobile comparison accepts touch without causing horizontal page overflow', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile',
    'Touch input requires the mobile context.',
  );
  await page.goto('/');
  const comparison = page.locator('[data-comparison]');
  await comparison.scrollIntoViewIfNeeded();
  const box = (await comparison.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width * 0.25, box.y + box.height / 2);
  const range = comparison.locator('input');
  await expect
    .poll(async () => Number(await range.inputValue()))
    .toBeLessThan(35);
  await expect
    .poll(async () => Number(await range.inputValue()))
    .toBeGreaterThan(15);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('hero cross-fades through all six curated finished photos and returns to its opaque base', async ({
  page,
}) => {
  test.setTimeout(65000);
  await page.goto('/');
  const slides = page.locator('[data-hero-slide]');
  await expect(slides).toHaveCount(heroPhotos.length);
  for (const [index, photo] of heroPhotos.entries()) {
    const slide = slides.nth(index);
    await expect(slide.locator('picture')).toHaveAttribute(
      'data-photo-id',
      photo.id,
    );
    await expect
      .poll(
        () =>
          slide.evaluate((element) =>
            Number(getComputedStyle(element).opacity),
          ),
        { timeout: 18000 },
      )
      .toBeGreaterThan(0.99);
    await expect(page.locator('h1')).toBeVisible();
    await expect(slides.first()).toHaveCSS('opacity', '1');
  }
  await expect
    .poll(
      () =>
        slides
          .last()
          .evaluate((element) => Number(getComputedStyle(element).opacity)),
      { timeout: 10000 },
    )
    .toBe(0);
  for (const slide of await slides.all().then((items) => items.slice(1)))
    await expect(slide).toHaveCSS('opacity', '0');
});

test('hero keeps its finished base and skips a secondary photograph that cannot load', async ({
  page,
}) => {
  await page.route('**/kitchen-cabinets/cps-022-*', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-hero-slide]').first()).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.hero-media img').first()).toHaveJSProperty(
    'complete',
    true,
  );
  await expect
    .poll(
      () =>
        page
          .locator('[data-hero-slide]')
          .nth(2)
          .evaluate((element) => Number(getComputedStyle(element).opacity)),
      { timeout: 14000 },
    )
    .toBeGreaterThan(0.99);
});
