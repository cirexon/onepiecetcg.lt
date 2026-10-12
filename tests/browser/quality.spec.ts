import { test, expect } from '@playwright/test';

const publicRoutes = ['/', '/tournaments', '/tournaments/vilnius-sep', '/players', '/players/jonas', '/leaders', '/community'];

for (const route of publicRoutes) {
  test(`keeps ${route} responsive and error-free`, async ({ page }) => {
    const errors: string[] = [];
    const failedRequests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`));
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)), { timeout: 15_000 }).toBe(true);
    expect(await page.locator('body').innerText()).not.toMatch(/[�]/);
    expect(errors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
}

test('updates indexable metadata and canonical URLs', async ({ page }) => {
  await page.goto('/tournaments/vilnius-sep');
  await expect(page).toHaveTitle(/Vilnius · Sunday locals · One Piece TCG Lietuva/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Vilnius · Sunday locals/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/tournaments\/vilnius-sep$/);
  await page.goto('/login');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await page.goto('/missing');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
});

test('publishes crawl controls and protects new-tab links', async ({ page, request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('Disallow: /admin');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('<loc>https://onepiecetcglt.web.app/tournaments</loc>');
  await page.goto('/community');
  const newTabLinks = page.locator('a[target="_blank"]');
  for (let index = 0; index < await newTabLinks.count(); index++) {
    await expect(newTabLinks.nth(index)).toHaveAttribute('rel', /noreferrer|noopener/);
  }
});

test('reflows at 320 CSS pixels with WCAG text spacing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await page.addStyleTag({ content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}' });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('keeps essential navigation available in landscape orientation', async ({ page }) => {
  await page.setViewportSize({ width: 915, height: 412 });
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('link', { name: /Turnyrai|Tournaments/, exact: true }).first()).toBeVisible();
});
