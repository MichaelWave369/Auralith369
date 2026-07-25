import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GPU_LAB_BUILTIN_PRESETS,
  GPU_PRESET_KIND,
  GPU_PRESET_VERSION,
  createCustomGpuPreset,
  parseGpuPresetText,
  serializeGpuPreset,
  updateCustomGpuPreset
} from '../src/gpu/gpuLabPresets.js';
import { normalizeGpuLabSettings } from '../src/gpu/gpuLabDefaults.js';
import {
  GPU_PRESET_FAVORITES_KEY,
  GPU_PRESET_LIBRARY_KEY,
  loadCustomGpuPresets,
  loadGpuFavoriteIds,
  saveCustomGpuPresets,
  saveGpuFavoriteIds
} from '../src/gpu/gpuPresetStorage.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); }
  };
}

test('ships a bounded built-in GPU cartridge library with display physics and feedback', () => {
  assert.ok(GPU_LAB_BUILTIN_PRESETS.length >= 10);
  assert.equal(GPU_PRESET_VERSION, 3);
  const cathedral = GPU_LAB_BUILTIN_PRESETS.find(preset => preset.id === 'builtin:cathedral-resonance');
  const infinite = GPU_LAB_BUILTIN_PRESETS.find(preset => preset.id === 'builtin:infinite-cathedral');
  assert.ok(cathedral);
  assert.ok(infinite);
  assert.equal(cathedral.kind, GPU_PRESET_KIND);
  assert.equal(cathedral.settings.crt.scanlineCount, 1980);
  assert.equal(cathedral.settings.bloom.strength, 2.12);
  assert.equal(cathedral.settings.display.phosphorMask, 'slot');
  assert.equal(cathedral.settings.feedback.enabled, true);
  assert.equal(infinite.settings.feedback.kaleidoscope, 6);
  assert.equal(infinite.settings.feedback.mirror, 'quad');
  assert.ok(GPU_LAB_BUILTIN_PRESETS.every(preset => preset.builtIn && preset.id.startsWith('builtin:')));
});

test('normalizes legacy settings and clamps display physics and feedback safely', () => {
  const legacy = normalizeGpuLabSettings({ crt: { curvature: 0.2 }, bloom: { strength: 0.7 } });
  assert.equal(legacy.crt.curvature, 0.2);
  assert.equal(legacy.display.phosphorMask, 'off');
  assert.equal(legacy.display.brightness, 1);
  assert.equal(legacy.feedback.enabled, false);
  assert.equal(legacy.feedback.blend, 'screen');

  const bounded = normalizeGpuLabSettings({
    display: {
      scanlineSoftness: 9,
      phosphorMask: 'unknown-grid',
      phosphorStrength: -4,
      ghosting: 99,
      ghostOffset: 999,
      brightness: 99,
      blackCrush: 8,
      highlightRolloff: -1
    },
    feedback: {
      amount: 9,
      decay: -1,
      scale: 4,
      rotation: 999,
      offsetX: -999,
      offsetY: 999,
      mirror: 'spiral',
      kaleidoscope: 99,
      blend: 'burn'
    }
  });
  assert.equal(bounded.display.scanlineSoftness, 1);
  assert.equal(bounded.display.phosphorMask, 'off');
  assert.equal(bounded.display.phosphorStrength, 0);
  assert.equal(bounded.display.ghosting, 0.85);
  assert.equal(bounded.display.ghostOffset, 24);
  assert.equal(bounded.display.brightness, 1.8);
  assert.equal(bounded.display.blackCrush, 0.45);
  assert.equal(bounded.display.highlightRolloff, 0);
  assert.equal(bounded.feedback.amount, 0.95);
  assert.equal(bounded.feedback.decay, 0);
  assert.equal(bounded.feedback.scale, 1.2);
  assert.equal(bounded.feedback.rotation, 180);
  assert.equal(bounded.feedback.offsetX, -64);
  assert.equal(bounded.feedback.offsetY, 64);
  assert.equal(bounded.feedback.mirror, 'off');
  assert.equal(bounded.feedback.kaleidoscope, 12);
  assert.equal(bounded.feedback.blend, 'screen');
});

test('creates, updates, exports, and reimports a custom cartridge safely', () => {
  const created = createCustomGpuPreset('My Signal', {
    crt: { scanlineCount: 99999, noise: -1 },
    bloom: { strength: 999, radius: 0.5, threshold: 0.4 },
    display: { phosphorMask: 'triad', ghosting: 0.33, brightness: 1.2 },
    feedback: { enabled: true, amount: 0.6, scale: 0.97, rotation: 4, mirror: 'quad', kaleidoscope: 8, blend: 'add' }
  });
  assert.ok(created.id.startsWith('custom:my-signal-'));
  assert.equal(created.settings.crt.scanlineCount, 2160);
  assert.equal(created.settings.crt.noise, 0);
  assert.equal(created.settings.bloom.strength, 2.5);
  assert.equal(created.settings.display.phosphorMask, 'triad');
  assert.equal(created.settings.display.ghosting, 0.33);
  assert.equal(created.settings.feedback.enabled, true);
  assert.equal(created.settings.feedback.kaleidoscope, 8);

  const updated = updateCustomGpuPreset(created, { name: 'My Signal II', settings: { ...created.settings, crt: { ...created.settings.crt, curvature: 0.2 } } });
  assert.equal(updated.id, created.id);
  assert.equal(updated.name, 'My Signal II');
  assert.equal(updated.settings.crt.curvature, 0.2);

  const json = serializeGpuPreset(updated);
  const imported = parseGpuPresetText(json);
  assert.equal(imported.name, 'My Signal II');
  assert.notEqual(imported.id, updated.id);
  assert.equal(imported.settings.crt.curvature, 0.2);
  assert.equal(imported.settings.display.phosphorMask, 'triad');
  assert.equal(imported.settings.display.brightness, 1.2);
  assert.equal(imported.settings.feedback.mirror, 'quad');
  assert.equal(imported.settings.feedback.blend, 'add');
});

test('rejects unrelated or malformed preset files', () => {
  assert.throws(() => parseGpuPresetText('{'), /valid JSON/);
  assert.throws(() => parseGpuPresetText(JSON.stringify({ kind: 'not.auralith', settings: {} })), /not an Auralith GPU preset/);
});

test('persists custom cartridges and favorite ids without trusting malformed storage', () => {
  const storage = memoryStorage();
  const preset = createCustomGpuPreset('Stored Signal', {});

  assert.equal(saveCustomGpuPresets([preset], storage), true);
  assert.equal(saveGpuFavoriteIds([preset.id, 'builtin:golden-oracle', preset.id], storage), true);
  assert.ok(storage.getItem(GPU_PRESET_LIBRARY_KEY));
  assert.ok(storage.getItem(GPU_PRESET_FAVORITES_KEY));

  const loaded = loadCustomGpuPresets(storage);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].name, 'Stored Signal');
  assert.deepEqual(loadGpuFavoriteIds(storage), [preset.id, 'builtin:golden-oracle']);

  storage.setItem(GPU_PRESET_LIBRARY_KEY, '{bad json');
  storage.setItem(GPU_PRESET_FAVORITES_KEY, JSON.stringify({ nope: true }));
  assert.deepEqual(loadCustomGpuPresets(storage), []);
  assert.deepEqual(loadGpuFavoriteIds(storage), []);
});
