import { test, expect } from '@playwright/test';

test.describe('Kids Learning Cards E2E', () => {
  test('should load home page and display all generators', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /让学习变得/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: '数学练习' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '书写练习' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '英文练习' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '涂色卡片' })).toBeVisible();
  });

  test('should generate math problems', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: '数学练习' }).click();

    await expect(page.getByRole('heading', { name: '数学练习生成器' })).toBeVisible();

    // Generate
    await page.getByRole('button', { name: '开始生成' }).click();

    // Check results
    // Wait for generation (simulated delay)
    await page.waitForTimeout(600);

    // Should see worksheet
    const problems = page.locator('.problem-item');
    await expect(problems).toHaveCount(20); // Default count is 20
  });

  test('should generate writing worksheet', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: '书写练习' }).click();

    await expect(page.getByRole('heading', { name: '书写练习生成器' })).toBeVisible();

    // Verify default content is visible in the preview area
    // The preview renders the text '天地玄黄' by default
    await expect(page.locator('.text-4xl').first()).toBeVisible();

    // Change content
    await page.locator('textarea').fill('你好');
    await page.getByRole('button', { name: '更新预览' }).click();

    await page.waitForTimeout(600);

    // Verify new content in grid
    // We look for the character '你' in the grid (ChineseGrid renders characters in a span)
    await expect(page.getByText('你').first()).toBeVisible();
  });

  test('should generate english worksheet', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: '英文练习' }).click();

    await expect(page.getByRole('heading', { name: 'English Practice Generator' })).toBeVisible();

    // Generate words
    await page.getByRole('button', { name: '生成练习纸' }).click();

    await page.waitForTimeout(600);

    // Should see worksheet content header
    await expect(page.getByRole('heading', { name: 'English Writing Practice' })).toBeVisible();
  });
});
