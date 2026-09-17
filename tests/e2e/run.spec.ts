import { expect, test } from '@playwright/test';
import { addTalk } from './helpers';

test('completes a full run with the keyboard and sees peek counts in the summary', async ({ page }) => {
  await addTalk(page, 'Keyboard run');
  await page.goto('/');
  await page.getByRole('button', { name: 'Practice for Keyboard run' }).click();
  await page.waitForURL(/\/practice\/[\w-]+$/);

  const firstExplainer = page.getByRole('heading', { name: 'People notice your nerves less than you think.' });
  const ready = page.getByText('Stand up and speak out loud. Hands free.');
  await expect(firstExplainer.or(ready)).toBeVisible();

  if (await firstExplainer.isVisible()) {
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Nervous energy can help you perform.' })).toBeVisible();
    await page.keyboard.press('Enter');
  }

  await expect(ready).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('article', { name: /Section 1 of 3/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next section' })).toBeFocused();

  await page.keyboard.press('p');
  await expect(page.getByText('1 peek in this section')).toBeVisible();
  await page.keyboard.press('p');
  await expect(page.getByText('2 peeks in this section')).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('article', { name: /Section 2 of 3/ })).toBeVisible();
  await page.keyboard.press('p');

  await page.keyboard.press('Space');
  await expect(page.getByRole('article', { name: /Section 3 of 3/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finish run' })).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('run-summary')).toHaveText(/^3 peeks, .+\. Next: .+\.$/);
});
