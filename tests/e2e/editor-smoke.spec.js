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
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('Main editor canvas has no usable viewport geometry.');

  const left = Math.max(0, box.x);
  const top = Math.max(0, box.y);
  const right = Math.min(viewport.width, box.x + box.width);
  const bottom = Math.min(viewport.height, box.y + box.height);
  if (right - left < 80 || bottom - top < 80) {
    throw new Error('Main editor canvas does not expose enough visible drawing area.');
  }

  const x1 = left + (right - left) * 0.35;
  const y1 = top + (bottom - top) * 0.35;
  const x2 = Math.min(right - 12, x1 + 70);
  const y2 = Math.min(bottom - 12, y1 + 35);

  await canvas.evaluate((element, points) => {
    const emit = (type, clientX, clientY, buttons) => element.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons,
      clientX,
      clientY
    }));

    emit('pointerdown', points.x1, points.y1, 1);
    for (let step = 1; step <= 8; step += 1) {
      const t = step / 8;
      emit('pointermove', points.x1 + (points.x2 - points.x1) * t, points.y1 + (points.y2 - points.y1) * t, 1);
    }
    emit('pointerup', points.x2, points.y2, 0);
  }, { x1, y1, x2, y2 });

  await expect(page.getByText('brush', { exact: true })).toBeVisible();
}

test('boots every inspector without runtime errors', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('./');

  await expect(page).toHaveTitle(/Auralith369/);
  await expect(page.locator('.auralith-editor-root')).toBeVisible();
  await expect(page.getByText('Local-first visual alchemy').first()).toBeVisible();

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
  if (!stream) throw new Error('Project download did not provide a readable stream.');
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
