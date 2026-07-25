import assert from 'node:assert/strict';
import test from 'node:test';
import { GPU_LAB_FRAGMENT_SHADER } from '../src/gpu/GpuLabRenderer.js';
import { normalizeGpuLabSettings } from '../src/gpu/gpuLabDefaults.js';

test('Spectral Forge shader exposes prism, tint, solarize, and channel controls', () => {
  for (const token of [
    'uSpectralEnabled',
    'uHueShift',
    'uSaturation',
    'uPrismAmount',
    'uShadowTint',
    'uHighlightTint',
    'uTintStrength',
    'uSolarize',
    'uChannelMap',
    'rotateHue',
    'remapChannels',
    'applySpectralForge',
    'radialDirection'
  ]) {
    assert.ok(GPU_LAB_FRAGMENT_SHADER.includes(token), `Missing shader contract token: ${token}`);
  }
});

test('Spectral Forge defaults remain visually neutral and non-destructive', () => {
  const settings = normalizeGpuLabSettings({});
  assert.equal(settings.spectral.enabled, false);
  assert.equal(settings.spectral.hueShift, 0);
  assert.equal(settings.spectral.saturation, 1);
  assert.equal(settings.spectral.prismAmount, 0);
  assert.equal(settings.spectral.tintStrength, 0);
  assert.equal(settings.spectral.solarize, 0);
  assert.equal(settings.spectral.channelMap, 'rgb');
});
