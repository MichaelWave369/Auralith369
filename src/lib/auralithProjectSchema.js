const KNOWN_BLEND_MODES = new Set([
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'
]);

const SAFE_IMAGE_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,/i;

export const AURALITH_PROJECT_LIMITS = {
  maxWidth: 8192,
  maxHeight: 8192,
  maxLayers: 128,
  maxDataUrlChars: 16_000_000,
  maxEmbeddedDataChars: 64_000_000
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

  const { width, height } = getCanvasDimensions(project);

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

      const layerName = layer.name ?? layer.title ?? layer.n;
      if (layer.id === undefined || layer.id === null || String(layer.id).trim() === '') {
        errors.push(`Layer ${index + 1} is missing required id.`);
      }
      if (typeof layerName !== 'string' || !layerName.trim()) {
        errors.push(`Layer ${index + 1} must include a non-empty name/title/n.`);
      }

      const visible = layer.visible ?? layer.vis;
      if (visible !== undefined && toBooleanLike(visible) === null) {
        errors.push(`Layer ${index + 1} visible/vis must be boolean-like.`);
      }

      const opacity = layer.opacity ?? layer.op;
      if (opacity !== undefined && toOpacity(opacity) === null) {
        errors.push(`Layer ${index + 1} opacity/op must be between 0 and 1 (or 0-100 legacy).`);
      }

      const blend = layer.blendMode ?? layer.blend ?? layer.bl;
      if (blend !== undefined && !KNOWN_BLEND_MODES.has(String(blend))) {
        errors.push(`Layer ${index + 1} uses unsupported blend mode: ${String(blend)}.`);
      }

      checkDataUrls(layer, `Layer ${index + 1}`, errors);
      checkPlainMetadata(layer.adjustments, `Layer ${index + 1} adjustments`, errors);
      checkPlainMetadata(layer.style, `Layer ${index + 1} style`, errors);
    });
  }

  checkDataUrls(project, 'Project', errors);
  const embeddedChars =
    checkDataUrlMap(project.layerData, 'Project layerData', errors) +
    checkDataUrlMap(project.maskData, 'Project maskData', errors) +
    checkDataUrlValue(project.orig, 'Project orig', errors);

  if (embeddedChars > AURALITH_PROJECT_LIMITS.maxEmbeddedDataChars) {
    errors.push(`Embedded image data exceeds ${AURALITH_PROJECT_LIMITS.maxEmbeddedDataChars} characters.`);
  }

  checkPlainMetadata(project.metadata, 'Project metadata', errors);
  checkPlainMetadata(project.styleCard, 'Project styleCard', errors);

  const ok = errors.length === 0;
  return ok
    ? { ok, errors, warnings, project: normalizeAuralithProject(project) }
    : { ok, errors, warnings };
}

export function normalizeAuralithProject(project) {
  const { width: rawWidth, height: rawHeight } = getCanvasDimensions(project);
  const width = clampInt(rawWidth ?? 900, 1, AURALITH_PROJECT_LIMITS.maxWidth);
  const height = clampInt(rawHeight ?? 520, 1, AURALITH_PROJECT_LIMITS.maxHeight);

  const normalizedLayers = (Array.isArray(project.layers) ? project.layers : [])
    .slice(0, AURALITH_PROJECT_LIMITS.maxLayers)
    .map((layer, index) => {
      const opacity = toOpacity(layer.opacity ?? layer.op);
      const blend = String(layer.blendMode ?? layer.blend ?? layer.bl ?? 'normal');

      return {
        id: String(layer.id ?? `layer-${index + 1}`),
        name: String(layer.name ?? layer.title ?? layer.n ?? `Layer ${index + 1}`),
        visible: toBooleanLike(layer.visible ?? layer.vis) ?? true,
        opacity: opacity ?? 1,
        blendMode: KNOWN_BLEND_MODES.has(blend) ? blend : 'normal',
        mask: Boolean(layer.mask)
      };
    });

  const rawOverlay = isPlainObject(project.overlay) ? project.overlay.id : project.overlay;
  const rawSnap = isPlainObject(project.snap) ? project.snap.enabled : project.snap;
  const title = [project.title, project.name].find(value => typeof value === 'string' && value.trim());

  return {
    title: title || 'Auralith Project',
    version: typeof project.version === 'string'
      ? project.version
      : (typeof project.appVersion === 'string' ? project.appVersion : '0.1.0-alpha'),
    canvas: { width, height },
    tool: typeof project.tool === 'string' ? project.tool : 'brush',
    overlay: typeof rawOverlay === 'string' ? rawOverlay : 'none',
    snap: toBooleanLike(rawSnap) ?? true,
    caption: typeof project.caption === 'string' ? project.caption : 'Local-first visual alchemy',
    layers: normalizedLayers
  };
}

function getCanvasDimensions(project) {
  const canvas = isPlainObject(project.canvas) ? project.canvas : {};
  const size = isPlainObject(project.size) ? project.size : {};
  return {
    width: toFiniteNumber(canvas.width ?? size.w ?? project.width),
    height: toFiniteNumber(canvas.height ?? size.h ?? project.height)
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
    checkDataUrlValue(value, `${label} field \`${key}\``, errors);
  });
}

function checkDataUrlMap(value, label, errors) {
  if (value === undefined) return 0;
  if (!isPlainObject(value)) {
    errors.push(`${label} must be a plain JSON object.`);
    return 0;
  }

  let total = 0;
  Object.entries(value).forEach(([key, dataUrl]) => {
    total += checkDataUrlValue(dataUrl, `${label}[${JSON.stringify(key)}]`, errors);
  });
  return total;
}

function checkDataUrlValue(value, label, errors) {
  if (value === undefined || value === null) return 0;
  if (typeof value !== 'string') {
    errors.push(`${label} must be an embedded image data URL.`);
    return 0;
  }
  if (!SAFE_IMAGE_DATA_URL.test(value)) {
    errors.push(`${label} must use a base64 PNG, JPEG, or WebP data URL.`);
    return value.length;
  }
  if (value.length > AURALITH_PROJECT_LIMITS.maxDataUrlChars) {
    errors.push(`${label} exceeds max data URL size.`);
  }
  return value.length;
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
