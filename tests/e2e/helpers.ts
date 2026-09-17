import { expect, type Page } from '@playwright/test';

export async function addTalk(page: Page, title: string) {
  await page.goto('/talks/new');
  const box = page.getByLabel('Tell the coach about your talk');
  const typeInstead = page.getByRole('button', { name: 'Type instead' });
  await expect(async () => {
    if (await typeInstead.isVisible()) await typeInstead.click();
    await expect(box).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 20_000 });
  await box.fill(`${title}, tomorrow at 2pm, 10 minutes`);
  await page.getByRole('button', { name: 'Build my plan' }).click();
  await page.waitForURL(/\/talks\/[\w-]+\/plan$/);
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  const match = page.url().match(/\/talks\/([\w-]+)\/plan$/);
  if (!match?.[1]) throw new Error(`Could not read the talk id from ${page.url()}`);
  return match[1];
}
