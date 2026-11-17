import { expect, test } from '@playwright/test';

test('editorial typefaces load locally with real serif italics and legible sans-serif controls', async ({
  page,
}) => {
  const externalFonts: string[] = [];
  page.on('request', (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url()))
      externalFonts.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCSS(
    'font-family',
    /Cormorant Garamond/,
  );
  await expect(page.locator('h1 em')).toHaveCSS('font-style', 'italic');
  await expect(page.locator('body')).toHaveCSS('font-family', /Manrope/);
  await expect(page.locator('.contact-form input').first()).toHaveCSS(
    'font-family',
    /Manrope/,
  );
  const loaded = await page.evaluate(async () => {
    const faces = await Promise.all([
      document.fonts.load('500 64px "Cormorant Garamond"'),
      document.fonts.load('italic 500 64px "Cormorant Garamond"'),
      document.fonts.load('400 16px "Manrope"'),
      document.fonts.load('700 12px "Manrope"'),
    ]);
    return faces.every(
      (group) =>
        group.length > 0 && group.every((face) => face.status === 'loaded'),
    );
  });
  expect(loaded).toBe(true);
  expect(externalFonts).toEqual([]);
});

test('new typography fits all five pages after fonts finish loading', async ({
  page,
}) => {
  for (const route of [
    '/',
    '/services/',
    '/about-us/',
    '/our-work/',
    '/contact/',
  ]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    const box = (await heading.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
