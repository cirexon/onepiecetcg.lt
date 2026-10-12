import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/tournaments', '/tournaments/vilnius-sep', '/players', '/players/jonas', '/leaders', '/community', '/login', '/missing'];

for (const route of routes) {
  test(`has no serious WCAG violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.getByRole('button', { name: /Switch language|Perjungti kalbą/ }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const violations = results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    await page.getByRole('button', { name: 'Light theme' }).click();
    const lightResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const lightViolations = lightResults.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(lightViolations, JSON.stringify(lightViolations, null, 2)).toEqual([]);
  });
}

test('supports keyboard bypass and navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Pereiti prie turinio|Skip to content/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('main').getByRole('link').first()).toBeFocused();
});
