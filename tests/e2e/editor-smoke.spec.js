import { expect, test } from '@playwright/test';

function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

async function clickInspectorTabs(page) {
  for (const tab of ['layers', 'fx', 'lut', 'style', 'forge', 'adj', 'plug', 'act', 'exp']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await expect(page.locator('.auralith-editor-root')).toBeVisible();
    await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);
  }
}

async function drawStroke(page) {
  const canvas = page.locator('.auralith-editor-root canvas').first();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Main editor canvas has no bounding box.');

  const startX = box.x + Math.min(80, box.width * 0.2);
  const startY = box.y + Math.min(80, box.height * 0.2);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 70, startY + 35, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(250);
}

test('boots every inspector without runtime errors', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('./');

  await expect(page).toHaveTitle(/Auralith369/);
  await expect(page.locator('.auralith-editor-root')).toBeVisible();
  await expect(page.getByText('Local-first visual alchemy')).toBeVisible();

  await clickInspectorTabs(page);
  expect(errors).toEqual([]);
});

test('undo redo save reopen and PNG export remain operational', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('./');
  await expect(page.locator('.auralith-editor-root')).toBeVisible();
  await page.waitForTimeout(250);

  await drawStroke(page);

  await page.getByRole('button', { name: '↶', exact: true }).click();
  await expect(page.getByText('Undo', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '↷', exact: true }).click();
  await expect(page.getByText('Redo', { exact: true })).toBeVisible();

  const projectDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save .auralith', exact: true }).click();
  const projectDownload = await projectDownloadPromise;
  expect(projectDownload.suggestedFilename()).toMatch(/\.auralith$/);

  const stream = await projectDownload.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const projectBuffer = Buffer.concat(chunks);
  expect(projectBuffer.length).toBeGreaterThan(100);

  await page.locator('input[type="file"]').setInputFiles({
    name: projectDownload.suggestedFilename(),
    mimeType: 'application/json',
    buffer: projectBuffer
  });
  await expect(page.getByText(/Project loaded|Open Project/).first()).toBeVisible();
  await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);

  const imageDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const imageDownload = await imageDownloadPromise;
  expect(imageDownload.suggestedFilename()).toMatch(/\.png$/);

  expect(errors).toEqual([]);
});
