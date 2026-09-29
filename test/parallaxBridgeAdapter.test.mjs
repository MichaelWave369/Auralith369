import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  normalizeCreativeBridgeV1,
  verifyCreativeBridgeV1,
  normalizeCreativeBridgeV2,
  verifyCreativeBridgeV2,
} from '../src/parallaxBridgeAdapter.js';

const nativePayload = {
  protocol: 'parallax-creative-bridge',
  version: 1,
  source: 'domistika',
  target: 'auralith369',
  createdAt: '2026-08-25T17:00:00Z',
  name: 'Interop fixture',
  image: 'data:image/webp;base64,QUJD',
};

test('Creative Bridge v1 projects to Parallax without silent ingestion', () => {
  const before = JSON.stringify(nativePayload);
  const normalized = normalizeCreativeBridgeV1(nativePayload);
  assert.equal(normalized.schema, 'parallax.bridge.v1');
  assert.equal(normalized.localOnly, true);
  assert.equal(normalized.requiresUserAction, true);
  assert.equal(normalized.contentHash, null);
  assert.equal(normalized.warnings.length, 1);
  assert.equal(normalized.payloadRefOrInline.native, nativePayload);
  assert.equal(JSON.stringify(nativePayload), before);
});

test('caller-supplied content hash is preserved', () => {
  const hash = `sha256:${'a'.repeat(64)}`;
  const normalized = normalizeCreativeBridgeV1(nativePayload, { contentHash: hash });
  assert.equal(normalized.contentHash, hash);
  assert.deepEqual(normalized.warnings, []);
});

test('Pass 5 real artifact bytes preserve their exact SHA through the Auralith compatibility view', async () => {
  const fixture = JSON.parse(
    readFileSync(new URL('./fixtures/parallax-pass5-artifact.json', import.meta.url), 'utf8'),
  );
  const encoded = fixture.data_uri.split(',', 2)[1];
  const artifactBytes = Buffer.from(encoded, 'base64');
  const artifactSha256 = createHash('sha256').update(artifactBytes).digest('hex');

  assert.equal(artifactBytes.length, fixture.bytes);
  assert.equal(artifactSha256, fixture.sha256);

  const pass5NativePayload = {
    protocol: 'parallax-creative-bridge',
    version: 1,
    source: 'domistika',
    target: 'auralith369',
    createdAt: '2026-08-25T22:00:00Z',
    name: fixture.name,
    image: fixture.data_uri,
    canvas: { width: fixture.width, height: fixture.height },
    note: fixture.rights_note,
    contentHash: `sha256:${artifactSha256}`,
  };
  const before = JSON.stringify(pass5NativePayload);

  await verifyCreativeBridgeV1(pass5NativePayload);
  const normalized = normalizeCreativeBridgeV1(pass5NativePayload);

  assert.equal(normalized.contentHash, `sha256:${fixture.sha256}`);
  assert.equal(normalized.payloadRefOrInline.native.image, fixture.data_uri);
  assert.equal(normalized.localOnly, true);
  assert.equal(normalized.requiresUserAction, true);
  assert.deepEqual(normalized.warnings, []);
  assert.equal(JSON.stringify(pass5NativePayload), before);
});

test('Pass 6 rejects a one-byte artwork mutation after hashing', async () => {
  const fixture = JSON.parse(
    readFileSync(new URL('./fixtures/parallax-pass5-artifact.json', import.meta.url), 'utf8'),
  );
  const [header, encoded] = fixture.data_uri.split(',', 2);
  const tampered = Buffer.from(encoded, 'base64');
  tampered[0] = (tampered[0] ?? 0) ^ 0x01;

  const payload = {
    protocol: 'parallax-creative-bridge',
    version: 1,
    source: 'domistika',
    target: 'auralith369',
    createdAt: '2026-08-25T22:20:00Z',
    name: fixture.name,
    image: `${header},${tampered.toString('base64')}`,
    contentHash: `sha256:${fixture.sha256}`,
  };

  await assert.rejects(
    verifyCreativeBridgeV1(payload),
    /contentHash does not match image bytes/,
  );
});

test('Pass 6 rejects missing and substituted hashes', async () => {
  const fixture = JSON.parse(
    readFileSync(new URL('./fixtures/parallax-pass5-artifact.json', import.meta.url), 'utf8'),
  );
  const base = {
    protocol: 'parallax-creative-bridge',
    version: 1,
    source: 'domistika',
    target: 'auralith369',
    createdAt: '2026-08-25T22:20:00Z',
    name: fixture.name,
    image: fixture.data_uri,
  };

  await assert.rejects(verifyCreativeBridgeV1(base), /requires contentHash/);
  await assert.rejects(
    verifyCreativeBridgeV1({ ...base, contentHash: `sha256:${'0'.repeat(64)}` }),
    /contentHash does not match image bytes/,
  );
});


const stableValueV2 = (value) => {
  if (Array.isArray(value)) return value.map(stableValueV2);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stableValueV2(value[key])]),
    );
  }
  return value;
};

const bridgeV2ManifestFixture = (payload) => ({
  protocol: payload.protocol,
  version: payload.version,
  source: payload.source,
  target: payload.target,
  createdAt: payload.createdAt,
  name: payload.name || '',
  canvas: payload.canvas || null,
  palette: Array.isArray(payload.palette) ? payload.palette : [],
  symmetry: payload.symmetry || 'none',
  note: payload.note || '',
  baseContentHash: payload.baseContentHash,
  overlays: (payload.overlays || []).map((overlay) => ({
    id: String(overlay.id || ''),
    kind: overlay.kind,
    role: overlay.role,
    name: String(overlay.name || ''),
    sourceLayerId: String(overlay.sourceLayerId || ''),
    preserveDuringStyle: Boolean(overlay.preserveDuringStyle),
    opacity: Number(overlay.opacity ?? 1),
    blendMode: String(overlay.blendMode || 'normal'),
    semantic: overlay.semantic ?? null,
    contentHash: overlay.contentHash,
  })),
});

const imageData = (value) => 'data:image/png;base64,' + Buffer.from(value).toString('base64');
const hashDataUri = (uri) => createHash('sha256').update(Buffer.from(uri.split(',', 2)[1], 'base64')).digest('hex');
const hashManifest = (payload) => createHash('sha256')
  .update(JSON.stringify(stableValueV2(bridgeV2ManifestFixture(payload))))
  .digest('hex');

function bridgeV2Fixture() {
  const base = {
    protocol: 'parallax-creative-bridge',
    version: 2,
    source: 'domistika',
    target: 'auralith369',
    createdAt: '2026-09-28T17:40:00-07:00',
    name: 'Harbor Bridge semantic fixture',
    image: imageData('base artwork pixels'),
    canvas: { width: 1400, height: 1000 },
    palette: ['#112233'],
    symmetry: 'none',
    note: 'semantic overlay fixture',
    overlays: [{
      id: 'overlay-1',
      kind: 'raster-overlay',
      role: 'type',
      name: 'Title',
      sourceLayerId: 'layer-title',
      preserveDuringStyle: true,
      opacity: 1,
      blendMode: 'normal',
      semantic: [{
        kind: 'text',
        schema: 'domistika.semantic-text.v1',
        text: 'Harbor Bridge v3',
        x: 0.04,
        y: 0.05,
        preserveDuringStyle: true,
      }],
      image: imageData('transparent title pixels'),
    }],
  };
  base.baseContentHash = 'sha256:' + hashDataUri(base.image);
  base.overlays[0].contentHash = 'sha256:' + hashDataUri(base.overlays[0].image);
  base.contentHash = 'sha256:' + hashManifest(base);
  return base;
}

test('Creative Bridge v2 verifies base, overlay, and manifest hashes', async () => {
  const payload = bridgeV2Fixture();
  assert.equal(await verifyCreativeBridgeV2(payload), true);

  const normalized = normalizeCreativeBridgeV2(payload);
  assert.equal(normalized.schema, 'parallax.bridge.v2');
  assert.equal(normalized.version, 2);
  assert.equal(normalized.contentHash, payload.contentHash);
  assert.deepEqual(normalized.trustLabels, ['semantic-overlay-bound']);
  assert.equal(normalized.requiresUserAction, true);
});

test('Creative Bridge v2 rejects overlay pixel tampering', async () => {
  const payload = bridgeV2Fixture();
  payload.overlays[0].image = imageData('tampered title pixels');

  await assert.rejects(
    verifyCreativeBridgeV2(payload),
    /overlay contentHash does not match image bytes/,
  );
});

test('Creative Bridge v2 rejects semantic metadata tampering', async () => {
  const payload = bridgeV2Fixture();
  payload.overlays[0].semantic[0].text = 'Altered title';

  await assert.rejects(
    verifyCreativeBridgeV2(payload),
    /manifest contentHash does not match transfer metadata/,
  );
});

test('Creative Bridge v2 rejects base artwork tampering', async () => {
  const payload = bridgeV2Fixture();
  payload.image = imageData('tampered base artwork');

  await assert.rejects(
    verifyCreativeBridgeV2(payload),
    /baseContentHash does not match image bytes/,
  );
});
