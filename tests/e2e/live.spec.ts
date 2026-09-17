import { expect, test } from '@playwright/test';
import { addTalk } from './helpers';

test('navigates every section with arrow keys and opens the lost sheet', async ({ page }) => {
  const talkId = await addTalk(page, 'Live talk');
  await page.goto(`/talks/${talkId}/present/live`);

  const hold = page.getByRole('button', { name: 'Hold to start' });
  await hold.focus();
  await page.keyboard.down(' ');
  await page.waitForTimeout(1200);
  await page.keyboard.up(' ');

  await expect(page.getByRole('article', { name: /Section 1 of 3/ })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('article', { name: /Section 2 of 3/ })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('article', { name: /Section 3 of 3/ })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('article', { name: /Section 3 of 3/ })).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('article', { name: /Section 2 of 3/ })).toBeVisible();

  await page.getByRole('button', { name: 'Lost' }).click();
  const sheet = page.getByRole('dialog', { name: 'Take a breath' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText('Let me come back to the one thing I want you to remember.')).toBeVisible();
  await expect(sheet.getByText('Now: Reason')).toBeVisible();
});
