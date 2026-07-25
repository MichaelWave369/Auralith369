import assert from 'node:assert/strict';
import test from 'node:test';
import { probeWebGL2 } from '../src/gpu/capabilities.js';
import {
  GPU_LAB_DEFAULTS,
  normalizeGpuLabProjectState,
  normalizeGpuLabSettings
} from '../src/gpu/gpuLabDefaults.js';
import {
  GPU_LAB_FRAGMENT_SHADER,
  GPU_LAB_VERTEX_SHADER
} from '../src/gpu/GpuLabRenderer.js';

test('GPU Lab settings are bounded and preserve explicit toggles', () => {
  const normalized = normalizeGpuLabSettings({
    crt: {
      enabled: false,
      curvature: 99,
      scanlineCount: -4,
      noise: Number.NaN
    },
    bloom: {
      enabled: false,
      strength: 100,
      threshold: -2
    }
  });

  assert.equal(normalized.crt.enabled, false);
  assert.equal(normalized.crt.curvature, 0.35);
  assert.equal(normalized.crt.scanlineCount, 120);
  assert.equal(normalized.crt.noise, GPU_LAB_DEFAULTS.crt.noise);
  assert.equal(normalized.bloom.enabled, false);
  assert.equal(normalized.bloom.strength, 2.5);
  assert.equal(normalized.bloom.threshold, 0);
});

test('GPU Lab project state remains optional and disabled by default', () => {
  const normalized = normalizeGpuLabProjectState();
  assert.equal(normalized.enabled, false);
  assert.deepEqual(normalized.settings, normalizeGpuLabSettings());
});

test('WebGL2 probing reports both fallback and supported capability shapes', () => {
  assert.equal(probeWebGL2(() => ({ getContext: () => null })).supported, false);

  const fakeContext = {
    MAX_TEXTURE_SIZE: 1,
    MAX_RENDERBUFFER_SIZE: 2,
    getExtension: () => null,
    getParameter: key => key === 1 ? 8192 : 4096
  };
  const supported = probeWebGL2(() => ({ getContext: () => fakeContext }));
  assert.equal(supported.supported, true);
  assert.equal(supported.maxTextureSize, 8192);
  assert.equal(supported.maxRenderbufferSize, 4096);
});

test('GPU Lab shader exposes CRT and bloom stages', () => {
  assert.match(GPU_LAB_VERTEX_SHADER, /varying vec2 vUv/);
  assert.match(GPU_LAB_FRAGMENT_SHADER, /uCurvature/);
  assert.match(GPU_LAB_FRAGMENT_SHADER, /uScanlineIntensity/);
  assert.match(GPU_LAB_FRAGMENT_SHADER, /uBloomStrength/);
  assert.match(GPU_LAB_FRAGMENT_SHADER, /thresholdedBloom/);
});
