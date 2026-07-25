import { normalizeGpuLabSettings } from './gpuLabDefaults.js';

export const GPU_PRESET_KIND = 'auralith.gpu-preset';
export const GPU_PRESET_VERSION = 4;

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

const feedbackOff = { enabled: false, amount: 0.42, decay: 0.9, scale: 0.985, rotation: 0, offsetX: 0, offsetY: 0, mirror: 'off', kaleidoscope: 0, blend: 'screen' };
const spectralOff = { enabled: false, hueShift: 0, saturation: 1, prismAmount: 0, shadowTint: '#25134f', highlightTint: '#ffd76a', tintStrength: 0, solarize: 0, channelMap: 'rgb' };

export const GPU_LAB_BUILTIN_PRESETS = Object.freeze([
  builtIn('golden-oracle', 'Golden Oracle', 'Balanced sacred glow, warm spectral shaping, and clean retro signal.', {
    crt: { enabled: true, curvature: 0.08, scanlineIntensity: 0.16, scanlineCount: 720, chromaticAberration: 1.2, vignette: 0.22, noise: 0.012 },
    bloom: { enabled: true, strength: 0.34, radius: 0.24, threshold: 0.62 },
    display: { scanlineSoftness: 0.72, phosphorMask: 'aperture', phosphorStrength: 0.12, ghosting: 0.02, ghostOffset: 2.5, brightness: 1.08, blackCrush: 0.02, highlightRolloff: 0.22 },
    feedback: feedbackOff,
    spectral: { enabled: true, hueShift: 0, saturation: 1.08, prismAmount: 1.2, shadowTint: '#281746', highlightTint: '#ffd76a', tintStrength: 0.16, solarize: 0, channelMap: 'rgb' }
  }),
  builtIn('cathedral-resonance', 'Cathedral Resonance', 'The high-energy concentric broadcast discovered during the first live GPU session.', {
    crt: { enabled: true, curvature: 0.08, scanlineIntensity: 0.54, scanlineCount: 1980, chromaticAberration: 1.2, vignette: 0.22, noise: 0.082 },
    bloom: { enabled: true, strength: 2.12, radius: 0.95, threshold: 0.62 },
    display: { scanlineSoftness: 0.34, phosphorMask: 'slot', phosphorStrength: 0.24, ghosting: 0.12, ghostOffset: 3.5, brightness: 1.12, blackCrush: 0.06, highlightRolloff: 0.35 },
    feedback: { enabled: true, amount: 0.18, decay: 0.82, scale: 0.994, rotation: 0.12, offsetX: 0, offsetY: 0, mirror: 'off', kaleidoscope: 0, blend: 'screen' },
    spectral: { enabled: true, hueShift: 4, saturation: 1.18, prismAmount: 3, shadowTint: '#30135f', highlightTint: '#ffd36a', tintStrength: 0.22, solarize: 0.04, channelMap: 'rgb' }
  }),
  builtIn('haunted-broadcast', 'Haunted Broadcast', 'Crushed shadows, recursive echo, and an unstable late-night transmission.', {
    crt: { enabled: true, curvature: 0.13, scanlineIntensity: 0.42, scanlineCount: 1440, chromaticAberration: 2.1, vignette: 0.48, noise: 0.055 },
    bloom: { enabled: true, strength: 0.28, radius: 0.18, threshold: 0.74 },
    display: { scanlineSoftness: 0.18, phosphorMask: 'slot', phosphorStrength: 0.3, ghosting: 0.35, ghostOffset: 6, brightness: 0.9, blackCrush: 0.15, highlightRolloff: 0.1 },
    feedback: { enabled: true, amount: 0.28, decay: 0.86, scale: 1.008, rotation: -0.22, offsetX: 3, offsetY: 0, mirror: 'x', kaleidoscope: 0, blend: 'add' },
    spectral: { enabled: true, hueShift: -18, saturation: 0.92, prismAmount: 5.5, shadowTint: '#061b17', highlightTint: '#ff4fa1', tintStrength: 0.34, solarize: 0.18, channelMap: 'grb' }
  }),
  builtIn('vhs-revelation', 'VHS Revelation', 'Soft analog glow with pronounced color separation, ghosting, and signal memory.', {
    crt: { enabled: true, curvature: 0.1, scanlineIntensity: 0.27, scanlineCount: 900, chromaticAberration: 3.2, vignette: 0.3, noise: 0.035 },
    bloom: { enabled: true, strength: 0.58, radius: 0.4, threshold: 0.58 },
    display: { scanlineSoftness: 0.78, phosphorMask: 'aperture', phosphorStrength: 0.18, ghosting: 0.28, ghostOffset: 5, brightness: 1.05, blackCrush: 0.04, highlightRolloff: 0.2 },
    feedback: { enabled: true, amount: 0.2, decay: 0.8, scale: 1, rotation: 0, offsetX: 5, offsetY: 1, mirror: 'off', kaleidoscope: 0, blend: 'mix' },
    spectral: { enabled: true, hueShift: 6, saturation: 1.2, prismAmount: 6, shadowTint: '#20205f', highlightTint: '#ff5fbb', tintStrength: 0.2, solarize: 0.06, channelMap: 'rgb' }
  }),
  builtIn('arcade-ascension', 'Arcade Ascension', 'Bright triad phosphor energy with a crisp cabinet-screen presence.', {
    crt: { enabled: true, curvature: 0.06, scanlineIntensity: 0.22, scanlineCount: 1080, chromaticAberration: 0.8, vignette: 0.14, noise: 0.006 },
    bloom: { enabled: true, strength: 0.72, radius: 0.3, threshold: 0.52 },
    display: { scanlineSoftness: 0.28, phosphorMask: 'triad', phosphorStrength: 0.35, ghosting: 0.05, ghostOffset: 2, brightness: 1.12, blackCrush: 0.03, highlightRolloff: 0.12 },
    feedback: feedbackOff,
    spectral: { enabled: true, hueShift: 0, saturation: 1.45, prismAmount: 2.5, shadowTint: '#142c62', highlightTint: '#fff16a', tintStrength: 0.08, solarize: 0, channelMap: 'rgb' }
  }),
  builtIn('solar-relic', 'Solar Relic', 'Hot highlights, controlled rolloff, and broad luminous spill for radiant artifacts.', {
    crt: { enabled: true, curvature: 0.05, scanlineIntensity: 0.12, scanlineCount: 600, chromaticAberration: 1.5, vignette: 0.18, noise: 0.009 },
    bloom: { enabled: true, strength: 1.45, radius: 0.7, threshold: 0.44 },
    display: { scanlineSoftness: 0.86, phosphorMask: 'aperture', phosphorStrength: 0.08, ghosting: 0.03, ghostOffset: 2, brightness: 1.18, blackCrush: 0.01, highlightRolloff: 0.55 },
    feedback: { enabled: true, amount: 0.12, decay: 0.76, scale: 0.99, rotation: 0, offsetX: 0, offsetY: -1, mirror: 'off', kaleidoscope: 0, blend: 'screen' },
    spectral: { enabled: true, hueShift: -8, saturation: 1.12, prismAmount: 2, shadowTint: '#4a1708', highlightTint: '#fff2a8', tintStrength: 0.3, solarize: 0.04, channelMap: 'rgb' }
  }),
  builtIn('phosphor-dream', 'Phosphor Dream', 'Gentle aperture texture, soft scanlines, and a dreamlike memory halo.', {
    crt: { enabled: true, curvature: 0.045, scanlineIntensity: 0.1, scanlineCount: 840, chromaticAberration: 0.5, vignette: 0.12, noise: 0.004 },
    bloom: { enabled: true, strength: 0.42, radius: 0.52, threshold: 0.64 },
    display: { scanlineSoftness: 0.92, phosphorMask: 'aperture', phosphorStrength: 0.26, ghosting: 0.1, ghostOffset: 2.5, brightness: 1.08, blackCrush: 0, highlightRolloff: 0.3 },
    feedback: { enabled: true, amount: 0.16, decay: 0.88, scale: 0.998, rotation: 0.08, offsetX: 0, offsetY: 0, mirror: 'off', kaleidoscope: 0, blend: 'screen' },
    spectral: { enabled: true, hueShift: 12, saturation: 1.05, prismAmount: 1.5, shadowTint: '#172b5d', highlightTint: '#d8c8ff', tintStrength: 0.25, solarize: 0.03, channelMap: 'rgb' }
  }),
  builtIn('temple-transmission', 'Temple Transmission', 'Dense slot-mask scanlines with a ritual echo and six-fold signal chamber.', {
    crt: { enabled: true, curvature: 0.11, scanlineIntensity: 0.36, scanlineCount: 1680, chromaticAberration: 1.4, vignette: 0.34, noise: 0.028 },
    bloom: { enabled: true, strength: 0.95, radius: 0.56, threshold: 0.6 },
    display: { scanlineSoftness: 0.2, phosphorMask: 'slot', phosphorStrength: 0.32, ghosting: 0.18, ghostOffset: 4, brightness: 1, blackCrush: 0.1, highlightRolloff: 0.2 },
    feedback: { enabled: true, amount: 0.24, decay: 0.86, scale: 0.988, rotation: 0.18, offsetX: 0, offsetY: 0, mirror: 'quad', kaleidoscope: 6, blend: 'screen' },
    spectral: { enabled: true, hueShift: 20, saturation: 1.2, prismAmount: 3.5, shadowTint: '#241044', highlightTint: '#ffbf5f', tintStrength: 0.2, solarize: 0.05, channelMap: 'rgb' }
  }),
  builtIn('infinite-cathedral', 'Infinite Cathedral', 'Deep recursive zoom, six-fold folding, and luminous architectural recursion.', {
    crt: { enabled: true, curvature: 0.09, scanlineIntensity: 0.28, scanlineCount: 1440, chromaticAberration: 1.1, vignette: 0.28, noise: 0.018 },
    bloom: { enabled: true, strength: 1.25, radius: 0.72, threshold: 0.55 },
    display: { scanlineSoftness: 0.42, phosphorMask: 'slot', phosphorStrength: 0.2, ghosting: 0.08, ghostOffset: 3, brightness: 1.08, blackCrush: 0.05, highlightRolloff: 0.48 },
    feedback: { enabled: true, amount: 0.7, decay: 0.93, scale: 0.972, rotation: 0.42, offsetX: 0, offsetY: 0, mirror: 'quad', kaleidoscope: 6, blend: 'screen' },
    spectral: { enabled: true, hueShift: 10, saturation: 1.25, prismAmount: 5, shadowTint: '#1d165d', highlightTint: '#ffd978', tintStrength: 0.32, solarize: 0.07, channelMap: 'rgb' }
  }),
  builtIn('mirror-shrine', 'Mirror Shrine', 'Eight-fold mirrored recursion with a slower inward signal drift.', {
    crt: { enabled: true, curvature: 0.07, scanlineIntensity: 0.2, scanlineCount: 1080, chromaticAberration: 1.6, vignette: 0.24, noise: 0.012 },
    bloom: { enabled: true, strength: 0.78, radius: 0.5, threshold: 0.6 },
    display: { scanlineSoftness: 0.56, phosphorMask: 'triad', phosphorStrength: 0.18, ghosting: 0.06, ghostOffset: 2.5, brightness: 1.04, blackCrush: 0.04, highlightRolloff: 0.36 },
    feedback: { enabled: true, amount: 0.56, decay: 0.9, scale: 1.012, rotation: -0.32, offsetX: 0, offsetY: 0, mirror: 'quad', kaleidoscope: 8, blend: 'mix' },
    spectral: { enabled: true, hueShift: -25, saturation: 1.3, prismAmount: 7, shadowTint: '#10264f', highlightTint: '#ff76d6', tintStrength: 0.28, solarize: 0.08, channelMap: 'rbg' }
  }),
  builtIn('prism-oracle', 'Prism Oracle', 'Radial spectral dispersion with cyan-gold duotone light and clean geometry.', {
    crt: { enabled: true, curvature: 0.055, scanlineIntensity: 0.12, scanlineCount: 960, chromaticAberration: 0.4, vignette: 0.16, noise: 0.006 },
    bloom: { enabled: true, strength: 0.7, radius: 0.42, threshold: 0.56 },
    display: { scanlineSoftness: 0.74, phosphorMask: 'aperture', phosphorStrength: 0.12, ghosting: 0.02, ghostOffset: 2, brightness: 1.08, blackCrush: 0.02, highlightRolloff: 0.34 },
    feedback: feedbackOff,
    spectral: { enabled: true, hueShift: 18, saturation: 1.35, prismAmount: 9, shadowTint: '#34136f', highlightTint: '#69f7ff', tintStrength: 0.38, solarize: 0.08, channelMap: 'rgb' }
  }),
  builtIn('solarized-reliquary', 'Solarized Reliquary', 'A hot inverted relic palette with recursive amber-violet spectral memory.', {
    crt: { enabled: true, curvature: 0.08, scanlineIntensity: 0.24, scanlineCount: 1260, chromaticAberration: 1.4, vignette: 0.3, noise: 0.018 },
    bloom: { enabled: true, strength: 0.9, radius: 0.58, threshold: 0.52 },
    display: { scanlineSoftness: 0.48, phosphorMask: 'slot', phosphorStrength: 0.18, ghosting: 0.1, ghostOffset: 3.5, brightness: 1.02, blackCrush: 0.08, highlightRolloff: 0.62 },
    feedback: { enabled: true, amount: 0.34, decay: 0.87, scale: 0.992, rotation: 0.2, offsetX: 0, offsetY: 0, mirror: 'y', kaleidoscope: 4, blend: 'screen' },
    spectral: { enabled: true, hueShift: -12, saturation: 1.15, prismAmount: 4, shadowTint: '#2a063f', highlightTint: '#ff9b3d', tintStrength: 0.55, solarize: 0.72, channelMap: 'brg' }
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

export { feedbackOff, spectralOff };
