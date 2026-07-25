import assert from 'node:assert/strict';
import test from 'node:test';
import { GPU_LAB_FRAGMENT_SHADER } from '../src/gpu/GpuLabRenderer.js';
import { normalizeGpuLabSettings } from '../src/gpu/gpuLabDefaults.js';

test('Feedback Chamber shader exposes recursive frame controls', () => {
  for (const token of [
    'uniform sampler2D tFeedback',
    'uFeedbackAmount',
    'uFeedbackDecay',
    'uFeedbackScale',
    'uFeedbackRotation',
    'uFeedbackOffset',
    'uFeedbackMirror',
    'uFeedbackKaleidoscope',
    'uFeedbackBlend',
    'feedbackUv',
    'blendFeedback'
  ]) {
    assert.ok(GPU_LAB_FRAGMENT_SHADER.includes(token), `Missing shader contract token: ${token}`);
  }
});

test('Feedback Chamber defaults remain non-destructive and bounded', () => {
  const settings = normalizeGpuLabSettings({});
  assert.equal(settings.feedback.enabled, false);
  assert.equal(settings.feedback.amount, 0.42);
  assert.equal(settings.feedback.decay, 0.9);
  assert.equal(settings.feedback.scale, 0.985);
  assert.equal(settings.feedback.mirror, 'off');
  assert.equal(settings.feedback.kaleidoscope, 0);
  assert.equal(settings.feedback.blend, 'screen');
});
