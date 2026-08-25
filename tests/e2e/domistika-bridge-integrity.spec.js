import { expect, test } from '@playwright/test';

const BRIDGE_KEY = 'parallax-creative-bridge-v1';
const IMAGE = 'data:image/svg+xml;base64,PHN2Zy8+';
const IMAGE_SHA256 = 'd4dc56669143034f31aa309635d4113d9ad76a02b1739da22c965ed2049be9e6';

function bridge(contentHash) {
  return {
    protocol: 'parallax-creative-bridge',
    version: 1,
    source: 'domistika',
    target: 'auralith369',
    createdAt: '2026-08-25T22:30:00Z',
    name: 'Pass 6 Browser Fixture',
    image: IMAGE,
    canvas: { width: 1, height: 1 },
    palette: [],
    symmetry: 'none',
    note: 'Deterministic local bridge fixture.',
    contentHash,
  };
}

test('valid hash-bound Domistika bridge becomes visible only after verification', async ({ page }) => {
  await page.addInitScript(({ key, payload }) => {
    localStorage.setItem(key, JSON.stringify(payload));
  }, {
    key: BRIDGE_KEY,
    payload: bridge(`sha256:${IMAGE_SHA256}`),
  });

  await page.goto('./#domistika-import');
  await expect(page.getByRole('dialog', { name: 'Domistika artwork received' })).toBeVisible();
  await expect(page.getByText('passed a local SHA-256 integrity check')).toBeVisible();
});

test('tampered Domistika bridge fails closed before artwork controls are exposed', async ({ page }) => {
  await page.addInitScript(({ key, payload }) => {
    window.__AURALITH_BRIDGE_REJECTED__ = false;
    window.addEventListener('auralith:domistika-bridge-rejected', () => {
      window.__AURALITH_BRIDGE_REJECTED__ = true;
    });
    localStorage.setItem(key, JSON.stringify(payload));
  }, {
    key: BRIDGE_KEY,
    payload: bridge(`sha256:${'0'.repeat(64)}`),
  });

  await page.goto('./#domistika-import');
  await expect(page.getByRole('dialog', { name: 'Domistika artwork received' })).toHaveCount(0);
  await expect.poll(
    () => page.evaluate(() => window.__AURALITH_BRIDGE_REJECTED__),
  ).toBe(true);
  await expect(page.locator('.domistika-bridge-reference')).toHaveCount(0);
  await expect(page.locator('.domistika-bridge-backdrop')).toHaveCount(0);
});
