import { normalizeGpuLabSettings } from './gpuLabDefaults.js';

export const GPU_PRESET_KIND = 'auralith.gpu-preset';
export const GPU_PRESET_VERSION = 1;

const cleanText = (value, fallback, max = 80) => {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().replace(/\s+/g, ' ');
  return (text || fallback).slice(0, max);
};

const slugify = value => cleanText(value, 'signal', 60)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'signal';

const builtIn = (id, name, description, settings) => Object.freeze({
  kind: GPU_PRESET_KIND,
  version: GPU_PRESET_VERSION,
  id: `builtin:${id}`,
  name,
  description,
  builtIn: true,
  settings: Object.freeze(normalizeGpuLabSettings(settings))
});

export const GPU_LAB_BUILTIN_PRESETS = Object.freeze([
  builtIn('golden-oracle', 'Golden Oracle', 'Balanced sacred glow and clean retro signal.', {
    crt: { enabled: true, curvature: 0.08, scanlineIntensity: 0.16, scanlineCount: 720, chromaticAberration: 1.2, vignette: 0.22, noise: 0.012 },
    bloom: { enabled: true, strength: 0.34, radius: 0.24, threshold: 0.62 }
  }),
  builtIn('cathedral-resonance', 'Cathedral Resonance', 'The high-energy concentric broadcast discovered during the first live GPU session.', {
    crt: { enabled: true, curvature: 0.08, scanlineIntensity: 0.54, scanlineCount: 1980, chromaticAberration: 1.2, vignette: 0.22, noise: 0.082 },
    bloom: { enabled: true, strength: 2.12, radius: 0.95, threshold: 0.62 }
  }),
  builtIn('haunted-broadcast', 'Haunted Broadcast', 'Crushed shadows, restless noise, and an unstable late-night transmission.', {
    crt: { enabled: true, curvature: 0.13, scanlineIntensity: 0.42, scanlineCount: 1440, chromaticAberration: 2.1, vignette: 0.48, noise: 0.055 },
    bloom: { enabled: true, strength: 0.28, radius: 0.18, threshold: 0.74 }
  }),
  builtIn('vhs-revelation', 'VHS Revelation', 'Soft analog glow with pronounced color separation and signal grain.', {
    crt: { enabled: true, curvature: 0.1, scanlineIntensity: 0.27, scanlineCount: 900, chromaticAberration: 3.2, vignette: 0.3, noise: 0.035 },
    bloom: { enabled: true, strength: 0.58, radius: 0.4, threshold: 0.58 }
  }),
  builtIn('arcade-ascension', 'Arcade Ascension', 'Bright phosphor energy with a crisp cabinet-screen presence.', {
    crt: { enabled: true, curvature: 0.06, scanlineIntensity: 0.22, scanlineCount: 1080, chromaticAberration: 0.8, vignette: 0.14, noise: 0.006 },
    bloom: { enabled: true, strength: 0.72, radius: 0.3, threshold: 0.52 }
  }),
  builtIn('solar-relic', 'Solar Relic', 'Hot highlights and broad luminous spill for radiant artifacts.', {
    crt: { enabled: true, curvature: 0.05, scanlineIntensity: 0.12, scanlineCount: 600, chromaticAberration: 1.5, vignette: 0.18, noise: 0.009 },
    bloom: { enabled: true, strength: 1.45, radius: 0.7, threshold: 0.44 }
  }),
  builtIn('phosphor-dream', 'Phosphor Dream', 'Gentle monitor texture and a soft dreamlike halo.', {
    crt: { enabled: true, curvature: 0.045, scanlineIntensity: 0.1, scanlineCount: 840, chromaticAberration: 0.5, vignette: 0.12, noise: 0.004 },
    bloom: { enabled: true, strength: 0.42, radius: 0.52, threshold: 0.64 }
  }),
  builtIn('temple-transmission', 'Temple Transmission', 'Dense ritual scanlines with a controlled central glow.', {
    crt: { enabled: true, curvature: 0.11, scanlineIntensity: 0.36, scanlineCount: 1680, chromaticAberration: 1.4, vignette: 0.34, noise: 0.028 },
    bloom: { enabled: true, strength: 0.95, radius: 0.56, threshold: 0.6 }
  })
]);

export function normalizeGpuPreset(input = {}, options = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('GPU preset must be an object.');
  }

  const builtInPreset = Boolean(options.builtIn ?? input.builtIn);
  const fallbackName = builtInPreset ? 'Built-in Signal' : 'Custom Signal';
  const name = cleanText(input.name, fallbackName);
  const suppliedId = cleanText(input.id, '', 120);
  const customId = suppliedId.startsWith('custom:') ? suppliedId : `custom:${slugify(name)}-${Date.now().toString(36)}`;

  return {
    kind: GPU_PRESET_KIND,
    version: GPU_PRESET_VERSION,
    id: builtInPreset ? suppliedId : customId,
    name,
    description: cleanText(input.description, '', 180),
    builtIn: builtInPreset,
    createdAt: cleanText(input.createdAt, new Date().toISOString(), 40),
    updatedAt: cleanText(input.updatedAt, new Date().toISOString(), 40),
    settings: normalizeGpuLabSettings(input.settings || input)
  };
}

export function createCustomGpuPreset(name, settings, description = '') {
  const now = new Date().toISOString();
  return normalizeGpuPreset({
    id: `custom:${slugify(name)}-${Date.now().toString(36)}`,
    name,
    description,
    createdAt: now,
    updatedAt: now,
    settings
  });
}

export function updateCustomGpuPreset(preset, patch = {}) {
  if (!preset || preset.builtIn || !String(preset.id || '').startsWith('custom:')) {
    throw new Error('Only custom GPU cartridges can be updated.');
  }
  return normalizeGpuPreset({
    ...preset,
    ...patch,
    id: preset.id,
    builtIn: false,
    createdAt: preset.createdAt,
    updatedAt: new Date().toISOString(),
    settings: patch.settings || preset.settings
  });
}

export function parseGpuPresetText(text) {
  let raw;
  try {
    raw = JSON.parse(String(text));
  } catch {
    throw new Error('Preset file is not valid JSON.');
  }
  const candidate = raw?.preset || raw;
  if (candidate?.kind && candidate.kind !== GPU_PRESET_KIND) {
    throw new Error('This JSON file is not an Auralith GPU preset.');
  }
  const imported = createCustomGpuPreset(candidate?.name || 'Imported Signal', candidate?.settings || candidate, candidate?.description || 'Imported GPU cartridge.');
  return { ...imported, sourceId: cleanText(candidate?.id, '', 120) };
}

export function serializeGpuPreset(preset) {
  const normalized = preset?.builtIn
    ? { ...preset, settings: normalizeGpuLabSettings(preset.settings) }
    : normalizeGpuPreset(preset);
  return JSON.stringify({
    kind: GPU_PRESET_KIND,
    version: GPU_PRESET_VERSION,
    exportedAt: new Date().toISOString(),
    preset: {
      id: normalized.id,
      name: normalized.name,
      description: normalized.description || '',
      settings: normalized.settings
    }
  }, null, 2);
}

export function findGpuPreset(presets, id) {
  return (presets || []).find(preset => preset.id === id) || null;
}
