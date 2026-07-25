import test from 'node:test';
import assert from 'node:assert/strict';

import { clampPixelRegion, sharedPixelRegionSize } from '../src/lib/pixelRegion.js';

test('pixel regions remain inside all canvas borders', () => {
  assert.deepEqual(clampPixelRegion(-5, -7, 20, 20, 100, 80), {
    x: 0,
    y: 0,
    width: 15,
    height: 13
  });
  assert.deepEqual(clampPixelRegion(92, 74, 20, 20, 100, 80), {
    x: 92,
    y: 74,
    width: 8,
    height: 6
  });
  assert.deepEqual(clampPixelRegion(0, 0, 1, 1, 100, 80), {
    x: 0,
    y: 0,
    width: 1,
    height: 1
  });
});

test('regions completely outside the canvas are rejected', () => {
  assert.equal(clampPixelRegion(120, 20, 10, 10, 100, 80), null);
  assert.equal(clampPixelRegion(20, 90, 10, 10, 100, 80), null);
  assert.equal(clampPixelRegion(0, 0, 10, 10, 0, 80), null);
});

test('paired tools use a safe shared region size', () => {
  assert.deepEqual(
    sharedPixelRegionSize(
      { x: 0, y: 0, width: 12, height: 20 },
      { x: 4, y: 5, width: 8, height: 16 }
    ),
    { width: 8, height: 16 }
  );
  assert.equal(sharedPixelRegionSize({ x: 0, y: 0, width: 1, height: 1 }, null), null);
});
