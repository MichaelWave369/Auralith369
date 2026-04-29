const KNOWN_BLEND_MODES = new Set([
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'
]);

export const AURALITH_PROJECT_LIMITS = {
  maxWidth: 8192,
  maxHeight: 8192,
  maxLayers: 128,
  maxDataUrlChars: 2_000_000
};

export function validateAuralithProject(project) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(project)) {
    return { ok: false, errors: ['Project must be a JSON object.'], warnings };
  }

  if (project.version !== undefined && typeof project.version !== 'string') {
    errors.push('`version` must be a string when present.');
  }
  if (project.appVersion !== undefined && typeof project.appVersion !== 'string') {
    errors.push('`appVersion` must be a string when present.');
  }

  const canvas = isPlainObject(project.canvas) ? project.canvas : null;
  const width = toFiniteNumber(canvas?.width ?? project.width);
  const height = toFiniteNumber(canvas?.height ?? project.height);

  if (width === null || height === null) {
    errors.push('Canvas width and height are required numeric values.');
  } else {
    if (width <= 0 || width > AURALITH_PROJECT_LIMITS.maxWidth) {
      errors.push(`Canvas width must be between 1 and ${AURALITH_PROJECT_LIMITS.maxWidth}.`);
    }
    if (height <= 0 || height > AURALITH_PROJECT_LIMITS.maxHeight) {
      errors.push(`Canvas height must be between 1 and ${AURALITH_PROJECT_LIMITS.maxHeight}.`);
    }
  }

  if (!Array.isArray(project.layers)) {
    errors.push('`layers` must be an array.');
  } else {
    if (project.layers.length > AURALITH_PROJECT_LIMITS.maxLayers) {
      errors.push(`Layer count exceeds ${AURALITH_PROJECT_LIMITS.maxLayers}.`);
    }

    project.layers.forEach((layer, index) => {
      if (!isPlainObject(layer)) {
        errors.push(`Layer ${index + 1} must be an object.`);
        return;
      }
      const layerName = layer.name ?? layer.title;
      if (!layer.id) errors.push(`Layer ${index + 1} is missing required id.`);
      if (typeof layerName !== 'string' || !layerName.trim()) {
        errors.push(`Layer ${index + 1} must include a non-empty name/title.`);
      }

      const visible = layer.visible ?? layer.vis;
      if (visible !== undefined && typeof toBooleanLike(visible) !== 'boolean') {
        errors.push(`Layer ${index + 1} visible/vis must be boolean-like.`);
      }

      const opacity = layer.opacity ?? layer.op;
      if (opacity !== undefined) {
        const normalizedOpacity = toOpacity(opacity);
        if (normalizedOpacity === null) {
          errors.push(`Layer ${index + 1} opacity/op must be between 0 and 1 (or 0-100 legacy).`);
        }
      }

      const blend = layer.blendMode ?? layer.blend;
      if (blend !== undefined && !KNOWN_BLEND_MODES.has(String(blend))) {
        errors.push(`Layer ${index + 1} uses unsupported blend mode: ${String(blend)}.`);
      }

      checkDataUrls(layer, `Layer ${index + 1}`, errors);
      checkPlainMetadata(layer.adjustments, `Layer ${index + 1} adjustments`, errors);
      checkPlainMetadata(layer.style, `Layer ${index + 1} style`, errors);
    });
  }

  checkDataUrls(project, 'Project', errors);
  checkPlainMetadata(project.metadata, 'Project metadata', errors);
  checkPlainMetadata(project.styleCard, 'Project styleCard', errors);

  const ok = errors.length === 0;
  return ok
    ? { ok, errors, warnings, project: normalizeAuralithProject(project) }
    : { ok, errors, warnings };
}

export function normalizeAuralithProject(project) {
  const canvasSource = isPlainObject(project.canvas) ? project.canvas : {};
  const width = clampInt(toFiniteNumber(canvasSource.width ?? project.width) ?? 900, 1, AURALITH_PROJECT_LIMITS.maxWidth);
  const height = clampInt(toFiniteNumber(canvasSource.height ?? project.height) ?? 520, 1, AURALITH_PROJECT_LIMITS.maxHeight);

  const normalizedLayers = (Array.isArray(project.layers) ? project.layers : []).slice(0, AURALITH_PROJECT_LIMITS.maxLayers).map((layer, index) => {
    const opacity = toOpacity(layer.opacity ?? layer.op);
    const blend = String(layer.blendMode ?? layer.blend ?? 'normal');

    return {
      id: String(layer.id ?? `layer-${index + 1}`),
      name: String(layer.name ?? layer.title ?? `Layer ${index + 1}`),
      visible: toBooleanLike(layer.visible ?? layer.vis) ?? true,
      opacity: opacity ?? 1,
      blendMode: KNOWN_BLEND_MODES.has(blend) ? blend : 'normal',
      mask: Boolean(layer.mask)
    };
  });

  return {
    title: typeof project.title === 'string' && project.title.trim() ? project.title : 'Auralith Project',
    version: typeof project.version === 'string' ? project.version : (typeof project.appVersion === 'string' ? project.appVersion : '0.1.0-alpha'),
    canvas: { width, height },
    tool: typeof project.tool === 'string' ? project.tool : 'brush',
    overlay: typeof project.overlay === 'string' ? project.overlay : 'phi-grid',
    snap: toBooleanLike(project.snap) ?? true,
    caption: typeof project.caption === 'string' ? project.caption : 'Local-first visual alchemy',
    layers: normalizedLayers
  };
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function toFiniteNumber(value) {
  const num = typeof value === 'number' ? value : (typeof value === 'string' ? Number(value) : NaN);
  return Number.isFinite(num) ? num : null;
}

function toBooleanLike(value) {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return null;
}

function toOpacity(value) {
  const num = toFiniteNumber(value);
  if (num === null) return null;
  if (num >= 0 && num <= 1) return num;
  if (num >= 0 && num <= 100) return num / 100;
  return null;
}

function checkDataUrls(obj, label, errors) {
  if (!isPlainObject(obj)) return;
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value !== 'string') return;
    const looksLikeDataUrlField = /(data|image|src|thumbnail|preview)$/i.test(key);
    if (!looksLikeDataUrlField) return;
    if (!value.startsWith('data:image/')) {
      errors.push(`${label} field \`${key}\` must use data:image/ URL.`);
      return;
    }
    if (value.length > AURALITH_PROJECT_LIMITS.maxDataUrlChars) {
      errors.push(`${label} field \`${key}\` exceeds max data URL size.`);
    }
  });
}

function checkPlainMetadata(value, label, errors) {
  if (value === undefined) return;
  if (!isPlainObject(value)) {
    errors.push(`${label} must be a plain JSON object.`);
  }
}

function clampInt(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
