export const AURALITH_SDK_VERSION = '0.1.3';
export const AURALITH_SDK_SCHEMA = 'auralith.sdk.v1';

let runtimeAdapter = null;
let installTarget = null;

const freezeDeep = value => {
  if (!value || (typeof value !== 'object' && typeof value !== 'function') || Object.isFrozen(value)) return value;
  Object.freeze(value);
  if (typeof value === 'object') Object.values(value).forEach(freezeDeep);
  return value;
};

const cleanText = (value, fallback = '', max = 160) => {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().replace(/\s+/g, ' ');
  return (text || fallback).slice(0, max);
};

const slugify = value => cleanText(value, 'item', 100)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'item';

function emit(name, detail = {}) {
  const target = installTarget || globalThis;
  if (!target?.dispatchEvent || typeof target.CustomEvent !== 'function') return;
  target.dispatchEvent(new target.CustomEvent(
    String(name).startsWith('auralith:') ? String(name) : `auralith:${name}`,
    {
      detail: {
        sdkVersion: AURALITH_SDK_VERSION,
        schema: AURALITH_SDK_SCHEMA,
        ...detail,
      },
    },
  ));
}

function runtime() {
  if (!runtimeAdapter) throw new Error('AURALITH_SDK_RUNTIME_NOT_READY');
  return runtimeAdapter;
}

function maybe(method, fallback) {
  const adapter = runtimeAdapter;
  const fn = adapter?.[method];
  if (typeof fn !== 'function') return fallback;
  return fn();
}

function cloneFrozen(value) {
  if (value == null) return value;
  const clone = JSON.parse(JSON.stringify(value));
  return freezeDeep(clone);
}

function requireMethod(name) {
  const adapter = runtime();
  const fn = adapter[name];
  if (typeof fn !== 'function') throw new Error('AURALITH_SDK_CAPABILITY_UNAVAILABLE');
  return fn;
}

function projectInfo() {
  return cloneFrozen(maybe('projectInfo', {
    name: null,
    width: null,
    height: null,
    activeLayerId: null,
    layerCount: 0,
  }));
}

function projectSerialize() {
  return cloneFrozen(requireMethod('projectSerialize')());
}

function projectOpen(input) {
  return requireMethod('projectOpen')(input);
}

function imageOpen(input, options = {}) {
  return requireMethod('imageOpen')(input, options);
}

function imageCurrent() {
  return cloneFrozen(maybe('imageCurrent', {
    loaded: false,
    width: null,
    height: null,
  }));
}

function layersList() {
  return cloneFrozen(maybe('layersList', []));
}

function layersAdd(name = 'Layer') {
  return cloneFrozen(requireMethod('layersAdd')(name));
}

function layersActivate(id) {
  return cloneFrozen(requireMethod('layersActivate')(id));
}

function layersOpacity(id, value) {
  return cloneFrozen(requireMethod('layersOpacity')(id, value));
}

function layersBlend(id, value) {
  return cloneFrozen(requireMethod('layersBlend')(id, value));
}

function layersMask(id, enabled = true) {
  return cloneFrozen(requireMethod('layersMask')(id, enabled));
}

function fxList() {
  return cloneFrozen(maybe('fxList', []));
}

function fxApply(id) {
  const result = requireMethod('fxApply')(id);
  emit('sdk-effect', { kind: 'fx', id: String(id) });
  return cloneFrozen(result);
}

function lutList() {
  return cloneFrozen(maybe('lutList', []));
}

function lutApply(id) {
  const result = requireMethod('lutApply')(id);
  emit('sdk-effect', { kind: 'lut', id: String(id) });
  return cloneFrozen(result);
}

function styleList() {
  return cloneFrozen(maybe('styleList', []));
}

function styleApply(id) {
  const result = requireMethod('styleApply')(id);
  emit('sdk-effect', { kind: 'style', id: String(id) });
  return cloneFrozen(result);
}

function adjustmentGet() {
  return cloneFrozen(maybe('adjustmentGet', {}));
}

function adjustmentSet(values = {}) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new Error('AURALITH_SDK_ADJUSTMENT_INVALID');
  }
  return cloneFrozen(requireMethod('adjustmentSet')(values));
}

function gpuCapabilities() {
  return cloneFrozen(maybe('gpuCapabilities', {
    supported: null,
    active: false,
    reason: 'GPU runtime unavailable',
  }));
}

function gpuCartridges() {
  return cloneFrozen(maybe('gpuCartridges', []));
}

function gpuApply(id) {
  const result = requireMethod('gpuApply')(id);
  emit('sdk-effect', { kind: 'gpu-cartridge', id: String(id) });
  return cloneFrozen(result);
}

function gpuState() {
  return cloneFrozen(maybe('gpuState', {
    enabled: false,
    bypassed: false,
    activeCartridgeId: null,
    activeCartridgeName: null,
  }));
}

function actionsList() {
  return cloneFrozen(maybe('actionsList', []));
}

function actionsRun(id) {
  const result = requireMethod('actionsRun')(id);
  emit('sdk-action', { id: String(id) });
  return cloneFrozen(result);
}

function receiptLatest() {
  return cloneFrozen(maybe('receiptLatest', null));
}

async function receiptExport() {
  const result = await requireMethod('receiptExport')();
  emit('sdk-export', { kind: 'receipt', receiptId: result?.receiptId || null });
  return cloneFrozen(result);
}

async function exportPng() {
  const result = await requireMethod('exportPng')();
  emit('sdk-export', { kind: 'png', bytes: result?.size || null });
  return result;
}

async function exportCapture(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('AURALITH_SDK_CAPTURE_OPTIONS_INVALID');
  }
  const result = await requireMethod('exportCapture')(options);
  emit('sdk-export', {
    kind: 'capture',
    bytes: result?.bytes || null,
    width: result?.width || null,
    height: result?.height || null,
    sha256: result?.sha256 || null,
  });
  return cloneFrozen(result);
}

async function exportProject() {
  const result = await requireMethod('exportProject')();
  emit('sdk-export', { kind: 'project' });
  return cloneFrozen(result);
}

async function bridgeReceive() {
  const result = await requireMethod('bridgeReceive')();
  emit('sdk-bridge', { action: 'receive', available: Boolean(result) });
  return cloneFrozen(result);
}

async function bridgeGet() {
  return cloneFrozen(await requireMethod('bridgeGet')());
}

async function bridgeImport() {
  const result = await requireMethod('bridgeImport')();
  emit('sdk-bridge', {
    action: 'import',
    available: Boolean(result),
    version: result?.version || null,
    overlayCount: result?.overlayCount || 0,
  });
  return cloneFrozen(result);
}

function bridgeClear() {
  const result = requireMethod('bridgeClear')();
  emit('sdk-bridge', { action: 'clear' });
  return result;
}

function capabilities() {
  const base = maybe('capabilities', {});
  const snapshot = {
    schema: AURALITH_SDK_SCHEMA,
    sdkVersion: AURALITH_SDK_VERSION,
    appVersion: base?.appVersion || null,
    ready: Boolean(runtimeAdapter),
    project: projectInfo(),
    image: imageCurrent(),
    layers: {
      count: layersList().length,
      activeLayerId: projectInfo()?.activeLayerId ?? null,
    },
    fx: {
      available: fxList().length > 0,
      count: fxList().length,
    },
    lut: {
      available: lutList().length > 0,
      count: lutList().length,
    },
    style: {
      available: styleList().length > 0,
      count: styleList().length,
    },
    gpu: {
      ...gpuCapabilities(),
      cartridgeCount: gpuCartridges().length,
      state: gpuState(),
    },
    actions: {
      count: actionsList().length,
    },
    receipts: {
      available: typeof runtimeAdapter?.receiptExport === 'function',
      latestReceiptId: receiptLatest()?.receiptId || null,
      latestReceiptSchema: receiptLatest()?.schema || receiptLatest()?.kind || null,
      observationSchema: 'auralith.observation-receipt.v1',
    },
    capture: {
      available: typeof runtimeAdapter?.exportCapture === 'function',
      schema: 'auralith.capture.png.v1',
      authority: 'canvas2d',
      maxDimension: 2048,
      maxBytes: 4 * 1024 * 1024,
    },
    bridge: cloneFrozen(base?.bridge || { domistika: { available: false } }),
  };
  return cloneFrozen(snapshot);
}

function baseCommands() {
  return [
    {
      id: 'layer.add',
      label: 'Add Layer',
      category: 'Layers',
      description: 'Add and activate a new pixel layer.',
      keywords: ['layer', 'new', 'pixel'],
    },
    {
      id: 'bridge.domistika.receive',
      label: 'Receive Domistika Artwork',
      category: 'Bridge',
      description: 'Verify the current local Domistika creative transfer.',
      keywords: ['domistika', 'bridge', 'transfer', 'reference'],
    },
    {
      id: 'bridge.domistika.import',
      label: 'Import Domistika Artwork',
      category: 'Bridge',
      description: 'Verify and import the Domistika base artwork plus protected semantic overlays.',
      keywords: ['domistika', 'bridge', 'transfer', 'import', 'type', 'protected overlay'],
    },
    {
      id: 'receipt.export',
      label: 'Export Creative Receipt',
      category: 'Export',
      description: 'Create and download an Auralith creative receipt.',
      keywords: ['receipt', 'proof', 'audit', 'hash'],
    },
    {
      id: 'export.png',
      label: 'Create PNG Export',
      category: 'Export',
      description: 'Create a PNG Blob from the authoritative Canvas 2D composite.',
      keywords: ['png', 'image', 'export'],
    },
    {
      id: 'export.capture',
      label: 'Capture Finished PNG',
      category: 'Export',
      description: 'Return a bounded structured PNG capture from the authoritative Canvas 2D composite.',
      keywords: ['capture', 'png', 'image', 'agent', 'readback', 'finished'],
    },
    {
      id: 'export.project',
      label: 'Serialize Auralith Project',
      category: 'Export',
      description: 'Return the current .auralith project payload.',
      keywords: ['project', 'auralith', 'save'],
    },
  ];
}

function dynamicCommands() {
  const commands = [...baseCommands()];
  for (const fx of fxList()) {
    commands.push({
      id: `fx.${fx.id}`,
      label: `FX · ${fx.name}`,
      category: 'FX',
      description: `Apply ${fx.name} to the active pixel layer.`,
      keywords: ['fx', 'filter', fx.name],
    });
  }
  for (const lut of lutList()) {
    commands.push({
      id: `lut.${lut.id}`,
      label: `LUT · ${lut.name}`,
      category: 'LUT',
      description: `Apply the ${lut.name} cinematic LUT.`,
      keywords: ['lut', 'grade', 'cinematic', lut.name],
    });
  }
  for (const style of styleList()) {
    commands.push({
      id: `style.${style.id}`,
      label: `Style · ${style.name}`,
      category: 'Style',
      description: style.description || `Apply the ${style.name} style card.`,
      keywords: ['style', 'card', 'finish', style.name],
    });
  }
  for (const cartridge of gpuCartridges()) {
    commands.push({
      id: `gpu.${cartridge.id}`,
      label: `GPU · ${cartridge.name}`,
      category: 'GPU',
      description: cartridge.description || `Load the ${cartridge.name} GPU cartridge.`,
      keywords: ['gpu', 'cartridge', 'signal', cartridge.name],
    });
  }
  for (const action of actionsList()) {
    commands.push({
      id: `action.${action.id}`,
      label: `Action · ${action.name}`,
      category: 'Actions',
      description: `Run saved action batch ${action.name}.`,
      keywords: ['action', 'batch', action.name],
    });
  }
  return commands.map(command => freezeDeep({
    ...command,
    keywords: Object.freeze((command.keywords || []).map(String)),
  }));
}

function commandCatalog() {
  return Object.freeze(dynamicCommands());
}

function commandList() {
  return Object.freeze(commandCatalog().map(command => command.id));
}

function commandSearch(query = '', limit = 32) {
  const raw = cleanText(query, '', 120).toLowerCase();
  const max = Math.max(1, Math.min(100, Math.round(Number(limit) || 32)));
  const catalog = commandCatalog();
  if (!raw) return Object.freeze(catalog.slice(0, max));

  const tokens = raw.split(/\s+/).filter(Boolean);
  const score = command => {
    const id = String(command.id || '').toLowerCase();
    const label = String(command.label || '').toLowerCase();
    const category = String(command.category || '').toLowerCase();
    const description = String(command.description || '').toLowerCase();
    const keywords = (command.keywords || []).map(value => String(value).toLowerCase());
    const haystack = [id, label, category, description, ...keywords].join(' ');

    if (label === raw) return 120;
    if (id === raw) return 115;
    if (label.startsWith(raw)) return 100;
    if (id.startsWith(raw)) return 94;
    if (keywords.some(keyword => keyword === raw)) return 90;
    if (keywords.some(keyword => keyword.startsWith(raw))) return 82;
    if (label.includes(raw)) return 76;
    if (id.includes(raw)) return 70;
    if (category.includes(raw)) return 55;
    if (description.includes(raw)) return 46;
    if (tokens.length > 1 && tokens.every(token => haystack.includes(token))) return 36 + tokens.length;
    return 0;
  };

  return Object.freeze(
    catalog
      .map((command, index) => ({ command, index, score: score(command) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score
        || String(a.command.category).localeCompare(String(b.command.category))
        || a.index - b.index)
      .slice(0, max)
      .map(entry => entry.command),
  );
}

function commandExecute(id, args = {}) {
  const key = cleanText(id, '', 180);
  if (!key) throw new Error('AURALITH_SDK_COMMAND_REQUIRED');

  if (key === 'layer.add') return layersAdd(args?.name || 'Layer');
  if (key === 'bridge.domistika.receive') return bridgeReceive();
  if (key === 'bridge.domistika.import') return bridgeImport();
  if (key === 'receipt.export') return receiptExport();
  if (key === 'export.png') return exportPng();
  if (key === 'export.capture') return exportCapture(args || {});
  if (key === 'export.project') return exportProject();
  if (key.startsWith('fx.')) return fxApply(key.slice(3));
  if (key.startsWith('lut.')) return lutApply(key.slice(4));
  if (key.startsWith('style.')) return styleApply(key.slice(6));
  if (key.startsWith('gpu.')) return gpuApply(key.slice(4));
  if (key.startsWith('action.')) return actionsRun(key.slice(7));

  throw new Error('AURALITH_SDK_COMMAND_UNKNOWN');
}

const API = freezeDeep({
  schema: AURALITH_SDK_SCHEMA,
  sdkVersion: AURALITH_SDK_VERSION,
  ready: () => Boolean(runtimeAdapter),
  capabilities,

  project: {
    info: projectInfo,
    serialize: projectSerialize,
    open: projectOpen,
  },

  image: {
    open: imageOpen,
    current: imageCurrent,
  },

  layers: {
    list: layersList,
    add: layersAdd,
    activate: layersActivate,
    opacity: layersOpacity,
    blend: layersBlend,
    mask: layersMask,
  },

  fx: {
    list: fxList,
    apply: fxApply,
  },

  lut: {
    list: lutList,
    apply: lutApply,
  },

  style: {
    list: styleList,
    apply: styleApply,
  },

  adjustments: {
    get: adjustmentGet,
    set: adjustmentSet,
  },

  gpu: {
    capabilities: gpuCapabilities,
    cartridges: gpuCartridges,
    apply: gpuApply,
    state: gpuState,
  },

  actions: {
    list: actionsList,
    run: actionsRun,
  },

  receipts: {
    latest: receiptLatest,
    export: receiptExport,
  },

  bridge: {
    domistika: {
      receive: bridgeReceive,
      get: bridgeGet,
      import: bridgeImport,
      clear: bridgeClear,
    },
  },

  export: {
    png: exportPng,
    capture: exportCapture,
    project: exportProject,
    receipt: receiptExport,
  },

  commands: {
    list: commandList,
    catalog: commandCatalog,
    search: commandSearch,
    execute: commandExecute,
  },
});

export function bindAuralithRuntime(adapter) {
  if (!adapter || typeof adapter !== 'object') {
    throw new TypeError('Auralith stable SDK runtime adapter must be an object.');
  }
  runtimeAdapter = adapter;
  emit('sdk-runtime', { ready: true });
  return true;
}

export function unbindAuralithRuntime(adapter) {
  if (!adapter || runtimeAdapter === adapter) {
    runtimeAdapter = null;
    emit('sdk-runtime', { ready: false });
  }
}

export function installAuralithStableSdk(target = globalThis) {
  if (!target) return API;
  installTarget = target;

  if (target.Auralith && target.Auralith !== API) {
    if (target.Auralith.schema === AURALITH_SDK_SCHEMA) return target.Auralith;
    throw new Error('AURALITH_SDK_GLOBAL_CONFLICT');
  }

  target.Auralith = API;
  emit('sdk-installed', { ready: Boolean(runtimeAdapter) });
  return API;
}

export { commandCatalog, commandSearch, commandExecute };
