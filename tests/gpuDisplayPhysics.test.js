import assert from 'node:assert/strict';
import test from 'node:test';
import { GPU_LAB_FRAGMENT_SHADER } from '../src/gpu/GpuLabRenderer.js';
import { GPU_LAB_DEFAULTS, PHOSPHOR_MASKS, normalizeGpuLabSettings } from '../src/gpu/gpuLabDefaults.js';

test('display physics defaults remain bounded and backwards compatible', () => {
  const normalized = normalizeGpuLabSettings({});
  assert.deepEqual(PHOSPHOR_MASKS, ['off', 'aperture', 'slot', 'triad']);
  assert.equal(normalized.display.scanlineSoftness, GPU_LAB_DEFAULTS.display.scanlineSoftness);
  assert.equal(normalized.display.phosphorMask, 'off');
  assert.equal(normalized.display.ghosting, 0);
  assert.equal(normalized.display.brightness, 1);
});

test('fragment shader exposes every display physics control', () => {
  for (const token of [
    'uScanlineSoftness',
    'uPhosphorMode',
    'uPhosphorStrength',
    'uGhosting',
    'uGhostOffset',
    'uBrightness',
    'uBlackCrush',
    'uHighlightRolloff',
    'phosphorPattern'
  ]) {
    assert.ok(GPU_LAB_FRAGMENT_SHADER.includes(token), `missing shader token ${token}`);
  }
});
