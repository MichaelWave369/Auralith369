import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AURALITH_PROJECT_LIMITS,
  validateAuralithProject,
  normalizeAuralithProject
} from '../src/lib/auralithProjectSchema.js';

function makeValidProject(overrides = {}) {
  return {
    title: 'Auralith Project',
    version: '0.1.0-alpha',
    canvas: { width: 1024, height: 768 },
    tool: 'brush',
    overlay: 'phi-grid',
    snap: true,
    caption: 'Local-first visual alchemy',
    layers: [
      {
        id: 'layer-1',
        name: 'Base Layer',
        visible: true,
        opacity: 1,
        blendMode: 'normal'
      }
    ],
    ...overrides
  };
}

test('A. minimal valid project passes and normalizes', () => {
  const project = makeValidProject();
  const result = validateAuralithProject(project);
  assert.equal(result.ok, true);
  assert.ok(result.project);

  const normalized = normalizeAuralithProject(project);
  assert.equal(normalized.title, 'Auralith Project');
  assert.equal(normalized.canvas.width, 1024);
  assert.equal(normalized.canvas.height, 768);
  assert.equal(Array.isArray(normalized.layers), true);
  assert.equal(normalized.layers.length, 1);
});

test('B. oversized canvas is rejected', () => {
  const tooWide = makeValidProject({ canvas: { width: AURALITH_PROJECT_LIMITS.maxWidth + 1, height: 768 } });
  const tooTall = makeValidProject({ canvas: { width: 1024, height: AURALITH_PROJECT_LIMITS.maxHeight + 1 } });

  const wideResult = validateAuralithProject(tooWide);
  const tallResult = validateAuralithProject(tooTall);

  assert.equal(wideResult.ok, false);
  assert.equal(tallResult.ok, false);
  assert.match(wideResult.errors.join(' '), /Canvas width/i);
  assert.match(tallResult.errors.join(' '), /Canvas height/i);
});

test('C. too many layers is rejected', () => {
  const layers = Array.from({ length: AURALITH_PROJECT_LIMITS.maxLayers + 1 }, (_, i) => ({
    id: `layer-${i + 1}`,
    name: `Layer ${i + 1}`,
    visible: true,
    opacity: 1,
    blendMode: 'normal'
  }));
  const result = validateAuralithProject(makeValidProject({ layers }));
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /Layer count exceeds/i);
});

test('D. invalid image data URL is rejected', () => {
  const result = validateAuralithProject(
    makeValidProject({ image: 'javascript:alert(1)' })
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /data:image\//i);
});

test('E. oversized data URL is rejected', () => {
  const huge = 'data:image/png;base64,' + 'A'.repeat(AURALITH_PROJECT_LIMITS.maxDataUrlChars + 1);
  const result = validateAuralithProject(makeValidProject({ preview: huge }));
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /exceeds max data URL size/i);
});

test('F. invalid blend mode is rejected', () => {
  const result = validateAuralithProject(
    makeValidProject({
      layers: [{ id: 'layer-1', name: 'Bad Blend', opacity: 1, blendMode: 'chaos-mode' }]
    })
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /unsupported blend mode/i);
});

test('G. invalid opacity is rejected', () => {
  const result = validateAuralithProject(
    makeValidProject({
      layers: [{ id: 'layer-1', name: 'Bad Opacity', opacity: -0.1, blendMode: 'normal' }]
    })
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /opacity\/op must be between 0 and 1/i);
});

test('H. unknown fields do not crash validation', () => {
  const result = validateAuralithProject(
    makeValidProject({
      randomTopLevelField: { anything: true },
      layers: [{ id: 'layer-1', name: 'Layer', blendMode: 'normal', mystery: 123 }]
    })
  );
  assert.equal(result.ok, true);
});

test('I. normalization applies safe defaults', () => {
  const normalized = normalizeAuralithProject({
    canvas: { width: 900, height: 520 },
    layers: [{ id: 'layer-1', name: 'Defaulted Layer' }]
  });

  assert.equal(normalized.tool, 'brush');
  assert.equal(normalized.overlay, 'phi-grid');
  assert.equal(normalized.snap, true);
  assert.equal(normalized.caption, 'Local-first visual alchemy');
  assert.equal(normalized.layers[0].visible, true);
  assert.equal(normalized.layers[0].opacity, 1);
  assert.equal(normalized.layers[0].blendMode, 'normal');
});

test('J. validation result shape is stable', () => {
  const valid = validateAuralithProject(makeValidProject());
  assert.equal(typeof valid.ok, 'boolean');
  assert.equal(Array.isArray(valid.errors), true);
  assert.equal(Array.isArray(valid.warnings), true);
  assert.ok(valid.project);

  const invalid = validateAuralithProject(null);
  assert.equal(typeof invalid.ok, 'boolean');
  assert.equal(Array.isArray(invalid.errors), true);
  assert.equal(Array.isArray(invalid.warnings), true);
});
