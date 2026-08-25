import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCreativeBridgeV1 } from '../src/parallaxBridgeAdapter.js';

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
