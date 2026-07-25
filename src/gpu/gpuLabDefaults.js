const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};

const PHOSPHOR_MASKS = Object.freeze(['off', 'aperture', 'slot', 'triad']);
const FEEDBACK_MIRRORS = Object.freeze(['off', 'x', 'y', 'quad']);
const FEEDBACK_BLENDS = Object.freeze(['mix', 'add', 'screen']);
const SPECTRAL_CHANNEL_MAPS = Object.freeze(['rgb', 'rbg', 'grb', 'gbr', 'brg', 'bgr']);

const normalizeEnum = (value, values, fallback) => {
  const mode = String(value || '').toLowerCase();
  return values.includes(mode) ? mode : fallback;
};

const normalizeHexColor = (value, fallback) => {
  const text = String(value || '').trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  if (/^#[0-9a-f]{3}$/.test(text)) {
    return `#${text.slice(1).split('').map(character => character + character).join('')}`;
  }
  return fallback;
};

export const GPU_LAB_DEFAULTS = Object.freeze({
  crt: Object.freeze({
    enabled: true,
    curvature: 0.08,
    scanlineIntensity: 0.16,
    scanlineCount: 720,
    chromaticAberration: 1.2,
    vignette: 0.22,
    noise: 0.012
  }),
  bloom: Object.freeze({
    enabled: true,
    strength: 0.34,
    radius: 0.24,
    threshold: 0.62
  }),
  display: Object.freeze({
    scanlineSoftness: 0.65,
    phosphorMask: 'off',
    phosphorStrength: 0.18,
    ghosting: 0,
    ghostOffset: 3,
    brightness: 1,
    blackCrush: 0,
    highlightRolloff: 0.2
  }),
  feedback: Object.freeze({
    enabled: false,
    amount: 0.42,
    decay: 0.9,
    scale: 0.985,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    mirror: 'off',
    kaleidoscope: 0,
    blend: 'screen'
  }),
  spectral: Object.freeze({
    enabled: false,
    hueShift: 0,
    saturation: 1,
    prismAmount: 0,
    shadowTint: '#25134f',
    highlightTint: '#ffd76a',
    tintStrength: 0,
    solarize: 0,
    channelMap: 'rgb'
  })
});

export function normalizeGpuLabSettings(input = {}) {
  const crt = input.crt || {};
  const bloom = input.bloom || {};
  const display = input.display || {};
  const feedback = input.feedback || {};
  const spectral = input.spectral || {};

  return {
    crt: {
      enabled: crt.enabled ?? GPU_LAB_DEFAULTS.crt.enabled,
      curvature: clamp(crt.curvature, 0, 0.35, GPU_LAB_DEFAULTS.crt.curvature),
      scanlineIntensity: clamp(crt.scanlineIntensity, 0, 0.6, GPU_LAB_DEFAULTS.crt.scanlineIntensity),
      scanlineCount: clamp(crt.scanlineCount, 120, 2160, GPU_LAB_DEFAULTS.crt.scanlineCount),
      chromaticAberration: clamp(crt.chromaticAberration, 0, 8, GPU_LAB_DEFAULTS.crt.chromaticAberration),
      vignette: clamp(crt.vignette, 0, 0.8, GPU_LAB_DEFAULTS.crt.vignette),
      noise: clamp(crt.noise, 0, 0.12, GPU_LAB_DEFAULTS.crt.noise)
    },
    bloom: {
      enabled: bloom.enabled ?? GPU_LAB_DEFAULTS.bloom.enabled,
      strength: clamp(bloom.strength, 0, 2.5, GPU_LAB_DEFAULTS.bloom.strength),
      radius: clamp(bloom.radius, 0, 1, GPU_LAB_DEFAULTS.bloom.radius),
      threshold: clamp(bloom.threshold, 0, 1, GPU_LAB_DEFAULTS.bloom.threshold)
    },
    display: {
      scanlineSoftness: clamp(display.scanlineSoftness, 0, 1, GPU_LAB_DEFAULTS.display.scanlineSoftness),
      phosphorMask: normalizeEnum(display.phosphorMask, PHOSPHOR_MASKS, GPU_LAB_DEFAULTS.display.phosphorMask),
      phosphorStrength: clamp(display.phosphorStrength, 0, 0.85, GPU_LAB_DEFAULTS.display.phosphorStrength),
      ghosting: clamp(display.ghosting, 0, 0.85, GPU_LAB_DEFAULTS.display.ghosting),
      ghostOffset: clamp(display.ghostOffset, 0, 24, GPU_LAB_DEFAULTS.display.ghostOffset),
      brightness: clamp(display.brightness, 0.5, 1.8, GPU_LAB_DEFAULTS.display.brightness),
      blackCrush: clamp(display.blackCrush, 0, 0.45, GPU_LAB_DEFAULTS.display.blackCrush),
      highlightRolloff: clamp(display.highlightRolloff, 0, 1, GPU_LAB_DEFAULTS.display.highlightRolloff)
    },
    feedback: {
      enabled: feedback.enabled ?? GPU_LAB_DEFAULTS.feedback.enabled,
      amount: clamp(feedback.amount, 0, 0.95, GPU_LAB_DEFAULTS.feedback.amount),
      decay: clamp(feedback.decay, 0, 0.995, GPU_LAB_DEFAULTS.feedback.decay),
      scale: clamp(feedback.scale, 0.8, 1.2, GPU_LAB_DEFAULTS.feedback.scale),
      rotation: clamp(feedback.rotation, -180, 180, GPU_LAB_DEFAULTS.feedback.rotation),
      offsetX: clamp(feedback.offsetX, -64, 64, GPU_LAB_DEFAULTS.feedback.offsetX),
      offsetY: clamp(feedback.offsetY, -64, 64, GPU_LAB_DEFAULTS.feedback.offsetY),
      mirror: normalizeEnum(feedback.mirror, FEEDBACK_MIRRORS, GPU_LAB_DEFAULTS.feedback.mirror),
      kaleidoscope: Math.round(clamp(feedback.kaleidoscope, 0, 12, GPU_LAB_DEFAULTS.feedback.kaleidoscope)),
      blend: normalizeEnum(feedback.blend, FEEDBACK_BLENDS, GPU_LAB_DEFAULTS.feedback.blend)
    },
    spectral: {
      enabled: spectral.enabled ?? GPU_LAB_DEFAULTS.spectral.enabled,
      hueShift: clamp(spectral.hueShift, -180, 180, GPU_LAB_DEFAULTS.spectral.hueShift),
      saturation: clamp(spectral.saturation, 0, 2.5, GPU_LAB_DEFAULTS.spectral.saturation),
      prismAmount: clamp(spectral.prismAmount, 0, 24, GPU_LAB_DEFAULTS.spectral.prismAmount),
      shadowTint: normalizeHexColor(spectral.shadowTint, GPU_LAB_DEFAULTS.spectral.shadowTint),
      highlightTint: normalizeHexColor(spectral.highlightTint, GPU_LAB_DEFAULTS.spectral.highlightTint),
      tintStrength: clamp(spectral.tintStrength, 0, 1, GPU_LAB_DEFAULTS.spectral.tintStrength),
      solarize: clamp(spectral.solarize, 0, 1, GPU_LAB_DEFAULTS.spectral.solarize),
      channelMap: normalizeEnum(spectral.channelMap, SPECTRAL_CHANNEL_MAPS, GPU_LAB_DEFAULTS.spectral.channelMap)
    }
  };
}

export function normalizeGpuLabProjectState(input = {}) {
  return {
    enabled: Boolean(input.enabled),
    settings: normalizeGpuLabSettings(input.settings || input)
  };
}

export {
  PHOSPHOR_MASKS,
  FEEDBACK_MIRRORS,
  FEEDBACK_BLENDS,
  SPECTRAL_CHANNEL_MAPS,
  normalizeHexColor
};