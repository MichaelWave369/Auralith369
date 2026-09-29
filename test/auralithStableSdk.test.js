import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AURALITH_SDK_VERSION,
  AURALITH_SDK_SCHEMA,
  bindAuralithRuntime,
  unbindAuralithRuntime,
  installAuralithStableSdk,
} from '../src/lib/auralithStableSdk.js';

test('stable SDK installs a frozen v1 facade and binds live capabilities', async () => {
  const target = {};
  const api = installAuralithStableSdk(target);

  assert.equal(target.Auralith, api);
  assert.equal(api.schema, 'auralith.sdk.v1');
  assert.equal(api.sdkVersion, '0.1.3');
  assert.equal(AURALITH_SDK_SCHEMA, 'auralith.sdk.v1');
  assert.equal(AURALITH_SDK_VERSION, '0.1.3');
  assert.equal(Object.isFrozen(api), true);
  assert.equal(Object.isFrozen(api.layers), true);
  assert.equal(Object.isFrozen(api.commands), true);
  assert.equal(api.ready(), false);

  const calls = [];
  const fakePng = new Blob(['png'], { type: 'image/png' });
  const adapter = {
    capabilities: () => ({
      appVersion: 'v0.7.4-alpha',
      bridge: { domistika: { available: true } },
    }),
    projectInfo: () => ({
      name: 'SDK Test',
      width: 1200,
      height: 800,
      activeLayerId: 1,
      layerCount: 2,
      hasImage: true,
    }),
    projectSerialize: () => ({ kind: 'auralith.project', name: 'SDK Test' }),
    projectOpen: input => ({ ok: Boolean(input) }),
    imageOpen: input => ({ ok: Boolean(input), width: 1200, height: 800 }),
    imageCurrent: () => ({ loaded: true, width: 1200, height: 800 }),
    layersList: () => [
      { id: 1, name: 'Base', kind: 'pixel', visible: true, opacity: 1, blend: 'normal' },
      { id: 2, name: 'Title', kind: 'pixel', visible: true, opacity: 1, blend: 'normal', semanticRole: 'type', styleProtected: true, bridgeOverlay: true, sourceLayerId: 'layer-title' },
    ],
    layersAdd: name => ({ id: 3, name }),
    layersActivate: id => ({ id, name: 'Base' }),
    layersOpacity: (id, value) => ({ id, opacity: value }),
    layersBlend: (id, value) => ({ id, blend: value }),
    layersMask: (id, enabled) => ({ id, mask: enabled }),
    fxList: () => [{ id: 'sharpen', name: 'Sharpen' }],
    fxApply: id => { calls.push(['fx', id]); return { id, name: 'Sharpen' }; },
    lutList: () => [{ id: 'golden-hour', name: 'Golden Hour' }],
    lutApply: id => { calls.push(['lut', id]); return { id, name: 'Golden Hour' }; },
    styleList: () => [{ id: 'phi_forge', name: 'Φ Forge', description: 'Teal/gold finish' }],
    styleApply: id => { calls.push(['style', id]); return { id, name: 'Φ Forge' }; },
    adjustmentGet: () => ({ br: 100, ct: 100, st: 100, hu: 0, bl: 0, temp: 0 }),
    adjustmentSet: values => ({ br: 100, ...values }),
    gpuCapabilities: () => ({ supported: true, active: true, reason: 'WebGL2 ready' }),
    gpuCartridges: () => [{ id: 'builtin:golden-oracle', name: 'Golden Oracle', builtIn: true }],
    gpuApply: id => { calls.push(['gpu', id]); return { id, name: 'Golden Oracle' }; },
    gpuState: () => ({ enabled: true, bypassed: false, activeCartridgeId: 'builtin:golden-oracle' }),
    actionsList: () => [{ id: 'batch-0', name: 'Finish Pass', stepCount: 2 }],
    actionsRun: id => { calls.push(['action', id]); return { id, name: 'Finish Pass', stepCount: 2 }; },
    receiptLatest: () => ({
      kind: 'auralith.observation-receipt',
      schema: 'auralith.observation-receipt.v1',
      event: 'capture',
      receiptId: 'sha256:test-receipt',
      receiptHash: 'sha256:test-receipt',
      capture: { sha256: 'sha256:capture' },
    }),
    receiptExport: async () => ({ receiptId: 'sha256:new-receipt' }),
    bridgeReceive: async () => ({ protocol: 'parallax-creative-bridge', version: 2, source: 'domistika' }),
    bridgeGet: async () => ({ protocol: 'parallax-creative-bridge', version: 2, source: 'domistika' }),
    bridgeImport: async () => {
      calls.push(['bridge-import']);
      return { ok: true, version: 2, overlayCount: 1, protectedLayerIds: [2], contentHash: 'sha256:manifest', observationReceipt: { receiptId: 'sha256:bridge-observation', receiptHash: 'sha256:bridge-observation', schema: 'auralith.observation-receipt.v1' } };
    },
    bridgeClear: () => true,
    exportPng: async () => fakePng,
    exportCapture: async ({ maxDimension } = {}) => ({
      schema: 'auralith.capture.png.v1',
      authority: 'canvas2d',
      projectName: 'SDK Test',
      mimeType: 'image/png',
      width: Math.min(maxDimension || 2048, 1200),
      height: 800,
      bytes: 4,
      sha256: 'sha256:capture',
      dataBase64: 'cG5n',
      dataUrl: 'data:image/png;base64,cG5n',
      receiptId: 'sha256:capture-observation',
      receiptHash: 'sha256:capture-observation',
      receiptSchema: 'auralith.observation-receipt.v1',
    }),
    exportProject: async () => ({ kind: 'auralith.project', name: 'SDK Test' }),
  };

  bindAuralithRuntime(adapter);
  assert.equal(api.ready(), true);

  const caps = api.capabilities();
  assert.equal(caps.appVersion, 'v0.7.4-alpha');
  assert.equal(caps.layers.count, 2);
  assert.equal(caps.fx.count, 1);
  assert.equal(caps.lut.count, 1);
  assert.equal(caps.style.count, 1);
  assert.equal(caps.gpu.supported, true);
  assert.equal(caps.gpu.cartridgeCount, 1);
  assert.equal(caps.actions.count, 1);
  assert.equal(caps.capture.available, true);
  assert.equal(caps.capture.authority, 'canvas2d');
  assert.equal(caps.capture.maxDimension, 2048);
  assert.equal(caps.bridge.domistika.available, true);
  assert.equal(Object.isFrozen(caps), true);

  assert.deepEqual(api.layers.add('Finishing Pass'), { id: 3, name: 'Finishing Pass' });
  assert.equal(api.layers.list().length, 2);

  const golden = api.commands.search('golden');
  assert.equal(golden.some(command => command.id === 'lut.golden-hour'), true);
  assert.equal(golden.some(command => command.id === 'gpu.builtin:golden-oracle'), true);
  assert.equal(api.commands.search('gpu golden').some(command => command.id === 'gpu.builtin:golden-oracle'), true);
  await api.commands.execute('fx.sharpen');
  await api.commands.execute('lut.golden-hour');
  await api.commands.execute('style.phi_forge');
  await api.commands.execute('gpu.builtin:golden-oracle');
  await api.commands.execute('action.batch-0');

  assert.deepEqual(calls, [
    ['fx', 'sharpen'],
    ['lut', 'golden-hour'],
    ['style', 'phi_forge'],
    ['gpu', 'builtin:golden-oracle'],
    ['action', 'batch-0'],
  ]);

  const receipt = await api.receipts.export();
  assert.equal(receipt.receiptId, 'sha256:new-receipt');

  const png = await api.export.png();
  assert.equal(png, fakePng);
  assert.equal(png.type, 'image/png');

  const capture = await api.export.capture({ maxDimension: 1024 });
  assert.equal(capture.schema, 'auralith.capture.png.v1');
  assert.equal(capture.receiptHash, 'sha256:capture-observation');
  assert.equal(capture.receiptSchema, 'auralith.observation-receipt.v1');
  assert.equal(capture.authority, 'canvas2d');
  assert.equal(capture.width, 1024);
  assert.equal(capture.mimeType, 'image/png');
  assert.equal(capture.sha256, 'sha256:capture');
  assert.equal(capture.dataBase64, 'cG5n');
  assert.match(capture.dataUrl, /^data:image\/png;base64,/);
  assert.equal(Object.isFrozen(capture), true);

  const commandCapture = await api.commands.execute('export.capture', { maxDimension: 900 });
  assert.equal(commandCapture.width, 900);

  const bridge = await api.bridge.domistika.receive();
  assert.equal(bridge.source, 'domistika');
  assert.equal(bridge.version, 2);

  const imported = await api.bridge.domistika.import();
  assert.equal(imported.version, 2);
  assert.equal(imported.overlayCount, 1);
  assert.equal(imported.observationReceipt.schema, 'auralith.observation-receipt.v1');
  assert.deepEqual(imported.protectedLayerIds, [2]);
  assert.deepEqual(calls.at(-1), ['bridge-import']);

  const importCommand = await api.commands.execute('bridge.domistika.import');
  assert.equal(importCommand.overlayCount, 1);

  unbindAuralithRuntime(adapter);
  assert.equal(api.ready(), false);
});

test('stable SDK source exposes no arbitrary execution or network surface', () => {
  const source = fs.readFileSync(new URL('../src/lib/auralithStableSdk.js', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /\beval\s*\(/);
  assert.doesNotMatch(source, /new Function\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /XMLHttpRequest/);
  assert.doesNotMatch(source, /rawContext/i);
  assert.match(source, /auralith\.sdk\.v1/);
  assert.match(source, /Object\.freeze/);
  assert.match(source, /commands:/);
  assert.match(source, /gpu:/);
  assert.match(source, /receipts:/);
  assert.match(source, /capture: exportCapture/);
  assert.match(source, /auralith\.capture\.png\.v1/);
});

test('React workstation binds the stable SDK to real finishing functions', () => {
  const source = fs.readFileSync(new URL('../src/Auralith369.jsx', import.meta.url), 'utf8');

  assert.match(source, /APP_VERSION="v0\.7\.\d+-alpha"/);
  assert.match(source, /bindAuralithRuntime\(adapter\)/);
  assert.match(source, /unbindAuralithRuntime\(\)/);
  assert.match(source, /renderCompositeCanvas\(\{checker:0\}\)/);
  assert.match(source, /fxList:/);
  assert.match(source, /lutList:/);
  assert.match(source, /styleList:/);
  assert.match(source, /gpuCartridges:/);
  assert.match(source, /receiptExport:/);
  assert.match(source, /bridgeReceive:/);
  assert.match(source, /bridgeImport:/);
  assert.match(source, /styleProtected/);
  assert.match(source, /bridgeOverlay/);
  assert.match(source, /surface-transform/);
  assert.match(source, /parallax-creative-evidence-v2/);
  assert.match(source, /createObservationReceipt/);
  assert.match(source, /importDomistikaOverlays/);
  assert.ok(source.includes('protectedLayers.forEach(layer=>drawLayerTo(o,layer));'));
  assert.match(source, /exportPng:/);
  assert.match(source, /exportCapture:/);
  assert.match(source, /AURALITH_SDK_CAPTURE_TOO_LARGE/);
  assert.match(source, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(source, /32\*1024\*1024/);
  assert.match(source, /image\\\/\(\?:png\|jpeg\|webp\)/);
});
