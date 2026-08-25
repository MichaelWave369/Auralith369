import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  normalizeCreativeBridgeV1,
  verifyCreativeBridgeV1,
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
