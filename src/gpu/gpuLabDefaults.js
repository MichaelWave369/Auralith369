const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
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
  })
});

export function normalizeGpuLabSettings(input = {}) {
  const crt = input.crt || {};
  const bloom = input.bloom || {};

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
    }
  };
}

export function normalizeGpuLabProjectState(input = {}) {
  return {
    enabled: Boolean(input.enabled),
    settings: normalizeGpuLabSettings(input.settings || input)
  };
}
