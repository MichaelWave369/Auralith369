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


test('edge tools remain operational at all four canvas borders', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('./');
  const canvas = page.locator('.auralith-editor-root canvas').first();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Main editor canvas has no bounding box.');

  const points = [
    { x: box.x + 3, y: box.y + 3 },
    { x: box.x + box.width - 3, y: box.y + 3 },
    { x: box.x + 3, y: box.y + box.height - 3 },
    { x: box.x + box.width - 3, y: box.y + box.height - 3 }
  ];

  for (const tool of ['Smudge (F)', 'Dodge (O)', 'Burn (N)', 'ColSwap (J)', 'Liquify (W)']) {
    await page.getByTitle(tool).click();
    for (const point of points) {
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      await page.mouse.move(point.x + (point.x < box.x + box.width / 2 ? 4 : -4), point.y, { steps: 2 });
      await page.mouse.up();
    }
  }

  await page.getByTitle('Clone (S)').click();
  await page.keyboard.down('Alt');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.keyboard.up('Alt');
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  await page.mouse.move(points[0].x + 4, points[0].y + 4, { steps: 2 });
  await page.mouse.up();

  await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);
  expect(errors).toEqual([]);
});


test('recovers an unsaved local session after reload', async ({ page }) => {
  await page.goto('./');
  await drawStroke(page);
  await expect(page.getByTestId('recovery-state')).toContainText('Recovery saved', { timeout: 12_000 });

  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Recover unsaved session' })).toBeVisible();
  await page.getByRole('button', { name: 'Recover Session' }).click();
  await expect(page.getByText('Session recovered', { exact: true })).toBeVisible();
  await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);
});

test('Canvas 2D compositor stays inside 1080p and 4K budgets', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Performance budgets use the Chromium CI reference engine.');
  test.setTimeout(90_000);
  await page.goto('./');

  const measureAt = async (width, height, iterations) => {
    await page.getByRole('button', { name: 'Rsz', exact: true }).click();
    const inputs = page.locator('input[type="number"]');
    await inputs.nth(0).fill(String(width));
    await inputs.nth(1).fill(String(height));
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.getByText(`${width}×${height}`, { exact: true }).first()).toBeVisible();
    await page.waitForTimeout(75);
    return page.evaluate(count => window.__AURALITH_DIAGNOSTICS__.measureComposite(count), iterations);
  };

  const hd = await measureAt(1920, 1080, 3);
  expect(hd.averageMs).toBeLessThanOrEqual(500);
  expect(hd.maxMs).toBeLessThanOrEqual(750);

  const fourK = await measureAt(3840, 2160, 2);
  expect(fourK.averageMs).toBeLessThanOrEqual(2000);
  expect(fourK.maxMs).toBeLessThanOrEqual(3000);
});
