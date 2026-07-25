import { normalizeGpuPreset } from './gpuLabPresets.js';

export const GPU_PRESET_LIBRARY_KEY = 'auralith.gpu.presets.v1';
export const GPU_PRESET_FAVORITES_KEY = 'auralith.gpu.favorites.v1';

const resolveStorage = storage => storage || globalThis?.localStorage || null;

export function loadCustomGpuPresets(storage) {
  const target = resolveStorage(storage);
  if (!target) return [];
  try {
    const raw = JSON.parse(target.getItem(GPU_PRESET_LIBRARY_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, 128).flatMap(item => {
      try {
        const preset = normalizeGpuPreset({ ...item, builtIn: false });
        return preset.id.startsWith('custom:') ? [preset] : [];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function saveCustomGpuPresets(presets, storage) {
  const target = resolveStorage(storage);
  if (!target) return false;
  try {
    const normalized = (Array.isArray(presets) ? presets : []).slice(0, 128).flatMap(item => {
      try {
        const preset = normalizeGpuPreset({ ...item, builtIn: false });
        return preset.id.startsWith('custom:') ? [preset] : [];
      } catch {
        return [];
      }
    });
    target.setItem(GPU_PRESET_LIBRARY_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function loadGpuFavoriteIds(storage) {
  const target = resolveStorage(storage);
  if (!target) return [];
  try {
    const raw = JSON.parse(target.getItem(GPU_PRESET_FAVORITES_KEY) || '[]');
    return Array.isArray(raw) ? [...new Set(raw.map(String).filter(Boolean))].slice(0, 256) : [];
  } catch {
    return [];
  }
}

export function saveGpuFavoriteIds(ids, storage) {
  const target = resolveStorage(storage);
  if (!target) return false;
  try {
    target.setItem(GPU_PRESET_FAVORITES_KEY, JSON.stringify([...new Set((ids || []).map(String).filter(Boolean))].slice(0, 256)));
    return true;
  } catch {
    return false;
  }
}
