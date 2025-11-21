import { test, expect } from '@playwright/test';
import path from 'path';

const uniqueEmail = () => `playwright+${Date.now()}@modelia.ai`;
const PASSWORD = 'Playwright123!';

test('signup, generate, and restore flow', async ({ page }) => {
  const email = uniqueEmail();
  const fixturePath = path.join(__dirname, 'fixtures', 'sample.png');

  await page.goto('/');
  await page.getByRole('button', { name: /create an account/i }).click();
  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page.getByLabel(/prompt/i)).toBeVisible();

  await page.getByLabel(/upload reference/i).setInputFiles(fixturePath);
  await page.getByLabel(/prompt/i).fill('Playwright couture with chromed fabrics');
  await page.getByLabel(/style/i).selectOption('Streetwear Luxe');

  await page.getByRole('button', { name: /generate look/i }).click();
  await expect(page.getByText(/generating your look/i)).toBeVisible();
  await expect(page.getByText(/generation ready/i)).toBeVisible({ timeout: 30_000 });

  const historyCard = page.getByRole('button', { name: /playwright couture/i }).first();
  await expect(historyCard).toBeVisible();
  await historyCard.click();

  await expect(page.getByLabel(/prompt/i)).toHaveValue(
    /Playwright couture with chromed fabrics/i,
  );
});

