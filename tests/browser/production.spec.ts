import { test, expect } from '@playwright/test';

test.describe('deployed release', () => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'Set PLAYWRIGHT_BASE_URL to run deployed-release tests.');

  test('serves public routes without client or CSP errors', async ({ page }) => {
    const failures:string[]=[];
    page.on('pageerror', error => failures.push(error.message));
    page.on('console', message => { if (message.type()==='error') failures.push(message.text()); });
    for (const route of ['/', '/tournaments', '/players', '/leaders', '/community', '/login', '/missing']) {
      const response=await page.goto(route,{waitUntil:'domcontentloaded'});
      expect(response?.status()).toBe(200);
      await expect(page.locator('main')).toBeVisible();
      await page.waitForTimeout(250);
    }
    await page.goto('/');
    await expect(page.getByRole('heading',{name:/Tavo kelionė|Your adventure/})).toBeVisible();
    expect(await page.locator('body').innerText()).not.toMatch(/[�]/);
    expect(failures).toEqual([]);
  });

  test('publishes hardened headers and cache policies', async ({ request }) => {
    const html=await request.get('/');
    expect(html.headers()['content-security-policy']).toContain("default-src 'self'");
    expect(html.headers()['content-security-policy']).toContain("script-src 'self' https://apis.google.com");
    expect(html.headers()['content-security-policy']).not.toContain("'unsafe-inline'");
    expect(html.headers()['content-security-policy']).toContain('https://www.google.com/recaptcha/');
    expect(html.headers()['strict-transport-security']).toContain('includeSubDomains');
    expect(html.headers()['x-content-type-options']).toBe('nosniff');
    expect(html.headers()['x-frame-options']).toBe('DENY');
    expect(html.headers()['permissions-policy']).toContain('camera=()');
    expect(html.headers()['cache-control']).toBe('no-cache');
    const source=await html.text();
    const asset=source.match(/\/assets\/[^"']+\.js/)?.[0];
    expect(asset).toBeTruthy();
    const script=await request.get(asset!);
    expect(script.headers()['cache-control']).toContain('immutable');
  });

  test('publishes crawl and social resources', async ({ request, page }) => {
    for (const resource of ['/robots.txt','/sitemap.xml','/social-card.png','/THIRD_PARTY_NOTICES.txt']) {
      expect((await request.get(resource)).ok()).toBe(true);
    }
    await page.goto('/login');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
    await expect(page.getByRole('button',{name:/Google/})).toBeEnabled();
  });
});
