export const AURALITH_SITE_TOOLS_VERSION = '0.1.2';
export const AURALITH_SITE_TOOLS_SCHEMA = 'auralith.site-tools.v1';

const MAX_SEARCH_RESULTS = 20;

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};

const cleanString = (value, max = 180) => String(value ?? '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .trim()
  .replace(/\s+/g, ' ')
  .slice(0, max);

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));

export function getWebMcpModelContext(doc = globalThis.document, nav = globalThis.navigator) {
  if (doc?.modelContext?.registerTool) return doc.modelContext;
  if (nav?.modelContext?.registerTool) return nav.modelContext;
  return null;
}

function requireApi(api = globalThis.window?.Auralith) {
  if (!api?.schema || api.schema !== 'auralith.sdk.v1') {
    throw new Error('AURALITH_SITE_TOOLS_SDK_UNAVAILABLE');
  }
  return api;
}

function requireReady(api) {
  if (!api.ready?.()) throw new Error('AURALITH_SITE_TOOLS_WORKSTATION_NOT_READY');
}

function safeJson(value) {
  const seen = new WeakSet();
  return JSON.stringify(value, (key, item) => {
    if (typeof item === 'string' && /^data:[^,]+;base64,/i.test(item)) {
      return '[omitted data URL]';
    }
    if (typeof Blob !== 'undefined' && item instanceof Blob) {
      return { type: item.type || 'application/octet-stream', bytes: item.size };
    }
    if (item && typeof item === 'object') {
      if (seen.has(item)) return '[circular]';
      seen.add(item);
    }
    return item;
  });
}

function ok(data = {}) {
  return safeJson({ ok: true, ...data });
}

function slimCapabilities(api) {
  const caps = api.capabilities();
  return {
    schema: caps.schema,
    sdkVersion: caps.sdkVersion,
    appVersion: caps.appVersion,
    ready: caps.ready,
    project: caps.project,
    image: caps.image,
    layers: caps.layers,
    fx: caps.fx,
    lut: caps.lut,
    style: caps.style,
    gpu: caps.gpu,
    actions: caps.actions,
    receipts: caps.receipts,
    capture: caps.capture,
    bridge: caps.bridge,
    commandCount: api.commands.list().length,
  };
}

function transferSummary(transfer) {
  if (!transfer || typeof transfer !== 'object') return null;
  const artwork = transfer.artwork || transfer.image || {};
  const dataUri = typeof artwork === 'string'
    ? artwork
    : artwork.dataUri || artwork.dataURL || artwork.dataUrl || transfer.dataUri || transfer.imageDataUri || null;
  let estimatedBytes = null;
  let mimeType = null;
  if (typeof dataUri === 'string') {
    const match = /^data:([^;,]+);base64,(.+)$/i.exec(dataUri);
    if (match) {
      mimeType = match[1];
      estimatedBytes = Math.floor(match[2].length * 0.75);
    }
  }
  return {
    protocol: transfer.protocol || null,
    source: transfer.source || null,
    target: transfer.target || null,
    version: transfer.version || transfer.schemaVersion || null,
    createdAt: transfer.createdAt || transfer.timestamp || null,
    projectName: transfer.projectName || transfer.name || transfer.project?.name || null,
    contentHash: transfer.contentHash || transfer.hash || null,
    baseContentHash: transfer.baseContentHash || null,
    palette: Array.isArray(transfer.palette) ? transfer.palette.slice(0, 32) : [],
    overlays: Array.isArray(transfer.overlays)
      ? transfer.overlays.slice(0, 16).map((overlay) => ({
        id: overlay.id || null,
        role: overlay.role || null,
        name: overlay.name || null,
        preserveDuringStyle: overlay.preserveDuringStyle !== false,
        sourceLayerId: overlay.sourceLayerId || null,
        contentHash: overlay.contentHash || null,
        semanticKinds: Array.isArray(overlay.semantic)
          ? [...new Set(overlay.semantic.map((item) => item?.kind).filter(Boolean))].slice(0, 8)
          : [],
      }))
      : [],
    overlayCount: Array.isArray(transfer.overlays) ? transfer.overlays.length : 0,
    artwork: {
      mimeType: artwork.mimeType || mimeType || null,
      width: artwork.width || transfer.canvas?.width || null,
      height: artwork.height || transfer.canvas?.height || null,
      estimatedBytes,
      payloadIncluded: Boolean(dataUri),
    },
  };
}

function receiptSummary(receipt) {
  if (!receipt || typeof receipt !== 'object') return null;
  return {
    receiptId: receipt.receiptId || null,
    createdAt: receipt.createdAt || null,
    projectName: receipt.projectName || null,
    size: receipt.size || null,
    imageHash: receipt.imageHash || null,
    layerCount: Array.isArray(receipt.layers) ? receipt.layers.length : null,
    gpuLab: receipt.gpuLab ? {
      enabled: Boolean(receipt.gpuLab.enabled),
      bypassed: Boolean(receipt.gpuLab.bypassed),
      activePresetId: receipt.gpuLab.activePresetId || null,
      activePresetName: receipt.gpuLab.activePresetName || null,
    } : null,
  };
}

function makeTools(api) {
  return [
    {
      name: 'auralith_get_capabilities',
      title: 'Get Auralith capabilities',
      description: 'Read Auralith’s live stable-SDK finishing capabilities and current project summary. This does not modify the project.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true, consequentialHint: false },
      execute: async () => ok({ capabilities: slimCapabilities(api) }),
    },
    {
      name: 'auralith_search_commands',
      title: 'Search Auralith finishing commands',
      description: 'Search the live Auralith command language for FX, LUTs, Style Cards, GPU cartridges, saved Actions, bridge operations, and exports.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', minLength: 1, maxLength: 120 },
          limit: { type: 'integer', minimum: 1, maximum: MAX_SEARCH_RESULTS, default: 8 },
        },
        required: ['query'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true, consequentialHint: false },
      execute: async ({ query, limit = 8 }) => ok({
        results: api.commands.search(cleanString(query, 120), clamp(limit, 1, MAX_SEARCH_RESULTS)),
      }),
    },
    {
      name: 'auralith_list_layers',
      title: 'List Auralith layers',
      description: 'Read sanitized Auralith layer metadata including visibility, opacity, blend, masks, Blend-If, and bounded FX metadata. Raw canvas contexts are never returned.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true, consequentialHint: false },
      execute: async () => {
        requireReady(api);
        return ok({ layers: api.layers.list(), project: api.project.info() });
      },
    },
    {
      name: 'auralith_add_layer',
      title: 'Add Auralith finishing layer',
      description: 'Add and activate a new pixel layer in the current Auralith project.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 120 },
        },
        required: ['name'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ name }) => {
        requireReady(api);
        return ok({ layer: api.layers.add(cleanString(name, 120)) });
      },
    },
    {
      name: 'auralith_update_layer',
      title: 'Update Auralith layer settings',
      description: 'Update bounded semantic settings on one Auralith layer: activate it, change opacity, change blend mode, or enable/disable its mask.',
      inputSchema: {
        type: 'object',
        properties: {
          layerId: { oneOf: [{ type: 'string' }, { type: 'number' }] },
          activate: { type: 'boolean' },
          opacity: { type: 'number', minimum: 0, maximum: 1 },
          blend: { type: 'string', minLength: 1, maxLength: 60 },
          mask: { type: 'boolean' },
        },
        required: ['layerId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async (input) => {
        requireReady(api);
        if (input.activate == null && input.opacity == null && input.blend == null && input.mask == null) {
          throw new Error('AURALITH_SITE_TOOLS_LAYER_UPDATE_EMPTY');
        }
        const results = {};
        if (input.activate === true) results.active = api.layers.activate(input.layerId);
        if (input.opacity != null) results.opacity = api.layers.opacity(input.layerId, input.opacity);
        if (input.blend != null) results.blend = api.layers.blend(input.layerId, cleanString(input.blend, 60));
        if (input.mask != null) results.mask = api.layers.mask(input.layerId, Boolean(input.mask));
        return ok({ layerId: input.layerId, results });
      },
    },
    {
      name: 'auralith_apply_fx',
      title: 'Apply Auralith pixel FX',
      description: 'Apply one authoritative Canvas 2D pixel FX to the active Auralith pixel layer. Search commands or inspect capabilities when the FX ID is unknown.',
      inputSchema: {
        type: 'object',
        properties: { fxId: { type: 'string', minLength: 1, maxLength: 120 } },
        required: ['fxId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ fxId }) => {
        requireReady(api);
        return ok({ effect: api.fx.apply(cleanString(fxId, 120)) });
      },
    },
    {
      name: 'auralith_apply_lut',
      title: 'Apply Auralith cinematic LUT',
      description: 'Apply one Auralith cinematic LUT to the current finishing workflow through the stable SDK.',
      inputSchema: {
        type: 'object',
        properties: { lutId: { type: 'string', minLength: 1, maxLength: 120 } },
        required: ['lutId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ lutId }) => {
        requireReady(api);
        return ok({ lut: api.lut.apply(cleanString(lutId, 120)) });
      },
    },
    {
      name: 'auralith_apply_style',
      title: 'Apply Auralith Style Card',
      description: 'Apply one existing Auralith Style Card through the same bounded style pipeline used by the human workstation.',
      inputSchema: {
        type: 'object',
        properties: { styleId: { type: 'string', minLength: 1, maxLength: 120 } },
        required: ['styleId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ styleId }) => {
        requireReady(api);
        return ok({ style: api.style.apply(cleanString(styleId, 120)) });
      },
    },
    {
      name: 'auralith_apply_gpu_cartridge',
      title: 'Load Auralith GPU cartridge',
      description: 'Load one Auralith GPU Lab cartridge as a non-destructive finishing preview. This does not promote GPU preview pixels into Canvas 2D project authority.',
      inputSchema: {
        type: 'object',
        properties: { cartridgeId: { type: 'string', minLength: 1, maxLength: 180 } },
        required: ['cartridgeId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ cartridgeId }) => {
        requireReady(api);
        return ok({ cartridge: api.gpu.apply(cleanString(cartridgeId, 180)), gpu: api.gpu.state() });
      },
    },
    {
      name: 'auralith_set_adjustments',
      title: 'Set Auralith global adjustments',
      description: 'Set bounded global finishing adjustments: brightness, contrast, saturation, hue, blur, and temperature. Omitted values remain unchanged.',
      inputSchema: {
        type: 'object',
        properties: {
          br: { type: 'number', minimum: 0, maximum: 200, description: 'Brightness.' },
          ct: { type: 'number', minimum: 0, maximum: 200, description: 'Contrast.' },
          st: { type: 'number', minimum: 0, maximum: 200, description: 'Saturation.' },
          hu: { type: 'number', minimum: 0, maximum: 360, description: 'Hue rotation.' },
          bl: { type: 'number', minimum: 0, maximum: 20, description: 'Blur amount.' },
          temp: { type: 'number', minimum: -50, maximum: 50, description: 'Color temperature.' },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async (input) => {
        requireReady(api);
        if (!Object.keys(input || {}).length) throw new Error('AURALITH_SITE_TOOLS_ADJUSTMENTS_EMPTY');
        return ok({ adjustments: api.adjustments.set(input) });
      },
    },
    {
      name: 'auralith_get_domistika_transfer',
      title: 'Inspect Domistika transfer',
      description: 'Read a summary of the current local Domistika-to-Auralith creative bridge transfer without returning its base64 artwork payload.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true, consequentialHint: false },
      execute: async () => {
        requireReady(api);
        const transfer = await api.bridge.domistika.get();
        return ok({ transfer: transferSummary(transfer) });
      },
    },
    {
      name: 'auralith_receive_domistika_transfer',
      title: 'Receive verified Domistika transfer',
      description: 'Receive the current Domistika creative transfer through Auralith’s existing verified bridge path. The site tool does not bypass SHA-256 verification and does not return the base64 artwork payload.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: true, consequentialHint: false },
      execute: async () => {
        requireReady(api);
        const transfer = await api.bridge.domistika.receive();
        return ok({ transfer: transferSummary(transfer) });
      },
    },
    {
      name: 'auralith_import_domistika_transfer',
      title: 'Import verified Domistika artwork',
      description: 'Verify and import the current Domistika Creative Bridge transfer into Auralith. Creative Bridge v2 installs protected semantic overlay layers above the base artwork and leaves the base selected for finishing.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: true, consequentialHint: false },
      execute: async () => {
        requireReady(api);
        if (!api.bridge?.domistika?.import) throw new Error('AURALITH_SITE_TOOLS_DOMISTIKA_IMPORT_UNAVAILABLE');
        return ok({ import: await api.bridge.domistika.import() });
      },
    },
    {
      name: 'auralith_capture_png',
      title: 'Capture finished Auralith PNG',
      description: 'Read back the authoritative Canvas 2D finished artwork as a bounded PNG payload for visual inspection. Returns metadata plus base64 PNG data and does not trigger a download.',
      inputSchema: {
        type: 'object',
        properties: {
          maxDimension: { type: 'integer', minimum: 256, maximum: 2048, default: 2048 },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ maxDimension = 2048 } = {}) => {
        requireReady(api);
        const capture = await api.export.capture({ maxDimension: clamp(maxDimension, 256, 2048) });
        const { dataUrl, ...portable } = capture || {};
        return JSON.stringify({ ok: true, capture: portable });
      },
    },
    {
      name: 'auralith_export_receipt',
      title: 'Export Auralith creative receipt',
      description: 'Create and download the current Auralith creative receipt using the existing receipt generator. Returns a lightweight receipt summary rather than project pixels.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: true, consequentialHint: false },
      execute: async () => {
        requireReady(api);
        const receipt = await api.receipts.export();
        return ok({ receipt: receiptSummary(receipt) });
      },
    },
    {
      name: 'auralith_execute_command',
      title: 'Execute Auralith semantic command',
      description: 'Execute one live Auralith semantic command. Search first when the command ID is unknown. This only invokes the bounded stable command language and never evaluates arbitrary JavaScript.',
      inputSchema: {
        type: 'object',
        properties: {
          commandId: { type: 'string', minLength: 1, maxLength: 200 },
          args: { type: 'object', additionalProperties: true, default: {} },
        },
        required: ['commandId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false, consequentialHint: false },
      execute: async ({ commandId, args = {} }, { signal } = {}) => {
        requireReady(api);
        if (signal?.aborted) throw new DOMException('Tool execution cancelled', 'AbortError');
        const id = cleanString(commandId, 200);
        if (!api.commands.list().includes(id)) throw new Error('AURALITH_SITE_TOOLS_COMMAND_UNKNOWN');
        const result = await api.commands.execute(id, args && typeof args === 'object' ? args : {});
        return ok({ commandId: id, result });
      },
    },
  ];
}

async function registerTools(modelContext, tools, controller) {
  const registered = [];
  for (const tool of tools) {
    await modelContext.registerTool(tool, { signal: controller.signal });
    registered.push(tool.name);
  }
  return registered;
}

export function createAuralithSiteTools(api = globalThis.window?.Auralith) {
  return freeze(makeTools(requireApi(api)));
}

export async function installAuralithSiteTools({
  api = globalThis.window?.Auralith,
  modelContext = getWebMcpModelContext(),
} = {}) {
  const stable = requireApi(api);
  if (!modelContext?.registerTool) {
    return freeze({
      version: AURALITH_SITE_TOOLS_VERSION,
      schema: AURALITH_SITE_TOOLS_SCHEMA,
      available: false,
      registered: Object.freeze([]),
      reason: 'WebMCP modelContext unavailable in this browser',
    });
  }

  const controller = new AbortController();
  const tools = makeTools(stable);
  const registered = await registerTools(modelContext, tools, controller);
  return freeze({
    version: AURALITH_SITE_TOOLS_VERSION,
    schema: AURALITH_SITE_TOOLS_SCHEMA,
    available: true,
    registered: Object.freeze([...registered]),
    stop() {
      controller.abort();
      return true;
    },
  });
}

export async function installAuralithSiteToolsGlobal(target = globalThis.window) {
  if (!target) return null;
  if (target.__auralithWebMcpSiteToolsV071Installed) return target.auralithSiteToolsV071 || null;
  target.__auralithWebMcpSiteToolsV071Installed = true;

  try {
    const state = await installAuralithSiteTools({ api: target.Auralith });
    target.auralithSiteToolsV071 = state;
    target.dispatchEvent?.(new CustomEvent('auralith:site-tools-ready', {
      detail: {
        version: AURALITH_SITE_TOOLS_VERSION,
        schema: AURALITH_SITE_TOOLS_SCHEMA,
        available: state.available,
        registered: [...state.registered],
      },
    }));
    return state;
  } catch (error) {
    const state = freeze({
      version: AURALITH_SITE_TOOLS_VERSION,
      schema: AURALITH_SITE_TOOLS_SCHEMA,
      available: false,
      registered: Object.freeze([]),
      reason: String(error?.message || error),
    });
    target.auralithSiteToolsV071 = state;
    console.warn('Auralith WebMCP site tools unavailable', error);
    return state;
  }
}
