import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GPU_LAB_BUILTIN_PRESETS,
  GPU_PRESET_KIND,
  createCustomGpuPreset,
  parseGpuPresetText,
  serializeGpuPreset,
  updateCustomGpuPreset
} from '../src/gpu/gpuLabPresets.js';
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

test('ships a bounded built-in GPU cartridge library', () => {
  assert.ok(GPU_LAB_BUILTIN_PRESETS.length >= 8);
  const cathedral = GPU_LAB_BUILTIN_PRESETS.find(preset => preset.id === 'builtin:cathedral-resonance');
  assert.ok(cathedral);
  assert.equal(cathedral.kind, GPU_PRESET_KIND);
  assert.equal(cathedral.settings.crt.scanlineCount, 1980);
  assert.equal(cathedral.settings.bloom.strength, 2.12);
  assert.ok(GPU_LAB_BUILTIN_PRESETS.every(preset => preset.builtIn && preset.id.startsWith('builtin:')));
});

test('creates, updates, exports, and reimports a custom cartridge safely', () => {
  const created = createCustomGpuPreset('My Signal', {
    crt: { scanlineCount: 99999, noise: -1 },
    bloom: { strength: 999, radius: 0.5, threshold: 0.4 }
  });
  assert.ok(created.id.startsWith('custom:my-signal-'));
  assert.equal(created.settings.crt.scanlineCount, 2160);
  assert.equal(created.settings.crt.noise, 0);
  assert.equal(created.settings.bloom.strength, 2.5);

  const updated = updateCustomGpuPreset(created, { name: 'My Signal II', settings: { ...created.settings, crt: { ...created.settings.crt, curvature: 0.2 } } });
  assert.equal(updated.id, created.id);
  assert.equal(updated.name, 'My Signal II');
  assert.equal(updated.settings.crt.curvature, 0.2);

  const json = serializeGpuPreset(updated);
  const imported = parseGpuPresetText(json);
  assert.equal(imported.name, 'My Signal II');
  assert.notEqual(imported.id, updated.id);
  assert.equal(imported.settings.crt.curvature, 0.2);
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
