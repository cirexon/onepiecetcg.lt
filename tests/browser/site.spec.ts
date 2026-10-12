import { test, expect } from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');await page.getByRole('button',{name:/Switch language|Perjungti kalbą/}).click();});
test('shows the community homepage without browser errors',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.reload();
  await expect(page.getByRole('heading',{name:'Your adventure. Your crew. Your game.'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Upcoming tournaments'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.waitForTimeout(900);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await expect.poll(()=>page.locator('.hero-card img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true);
  await expect(page.locator('.hero-card img')).toHaveCount(3);
  await expect(page.locator('.hero-card')).toHaveCount(3);
  await expect(page.locator('.hero-card').first()).toHaveAttribute('href','https://en.onepiece-cardgame.com/cardlist/?series=569117');
  await expect(page.locator('.hero-visual-caption')).toHaveCount(0);
  await expect(page.getByRole('region',{name:'When and where'})).toContainText('Vilnius');
  await expect(page.getByRole('region',{name:'When and where'})).toContainText('Konstitucijos pr. 12');
  await expect(page.getByRole('region',{name:'When and where'})).toContainText('Kaunas');
  await expect(page.getByRole('region',{name:'When and where'})).toContainText('Radvilėnų pl. 1B');
  await expect(page.locator(`a[href="https://discord.gg/rSYnAtQ8Zy"]`)).toHaveCount(2);
  await expect(page.getByText('The literal and graphical information presented on this site about One Piece Card',{exact:false})).toBeVisible();
  expect(errors).toEqual([]);
});
test('filters events and opens standings',async({page})=>{
  await page.goto('/tournaments');await page.getByLabel('City',{exact:true}).selectOption('Kaunas');
  await expect(page.locator('.event-card')).toHaveCount(2);
  await page.getByRole('button',{name:'With results'}).click();await expect(page.locator('.event-card')).toHaveCount(1);
  await page.locator('.event-card').click();await expect(page.getByRole('heading',{name:'Kaunas · Grand Line Cup'})).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(8);
  await page.getByRole('link',{name:'Matas P.'}).click();await expect(page.getByRole('heading',{name:'Matas P.'})).toBeVisible();
});
test('filters leaders and shows sample sizes',async({page})=>{
  await page.goto('/leaders');await page.getByLabel('Colors',{exact:true}).selectOption('Purple');
  await expect(page.locator('.leader-stat-row')).toHaveCount(1);
  await expect(page.getByText('Top 4 rate (2/4)')).toBeVisible();
  await expect(page.getByText('25.0%')).toBeVisible();
});
test('persists language and theme across reloads',async({page})=>{
  await page.getByRole('button',{name:'Light theme',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.reload();await expect(page.getByRole('heading',{name:'Your adventure. Your crew. Your game.'})).toBeVisible();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('does not offer fake Google sign-in in demo mode',async({page})=>{
  await page.goto('/login');await expect(page.getByRole('button',{name:'Continue with Google'})).toBeDisabled();await expect(page.getByText(/Firebase is not connected yet/)).toBeVisible();await expect(page.locator('.discord-login-link')).toHaveAccessibleName('Join the Discord community');
});
test('supports deep links and handles missing pages',async({page})=>{
  await page.goto('/tournaments/vilnius-sep');await expect(page.getByRole('heading',{name:'Vilnius · Sunday locals'})).toBeVisible();
  await page.goto('/missing');await expect(page.getByText('Page not found')).toBeVisible();
});
