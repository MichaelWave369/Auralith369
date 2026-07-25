import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AURALITH_RECOVERY_KIND,
  AURALITH_RECOVERY_VERSION,
  createRecoveryEnvelope,
  isRecoveryEnvelope
} from '../src/lib/sessionRecovery.js';

test('recovery envelopes preserve the project without changing it', () => {
  const project = { kind: 'auralith.project', name: 'Recovered Work', size: { w: 640, h: 480 } };
  const envelope = createRecoveryEnvelope(project, '2026-07-25T00:00:00.000Z');

  assert.equal(envelope.kind, AURALITH_RECOVERY_KIND);
  assert.equal(envelope.version, AURALITH_RECOVERY_VERSION);
  assert.equal(envelope.savedAt, '2026-07-25T00:00:00.000Z');
  assert.equal(envelope.project, project);
  assert.equal(isRecoveryEnvelope(envelope), true);
});

test('malformed or stale recovery values are rejected', () => {
  assert.equal(isRecoveryEnvelope(null), false);
  assert.equal(isRecoveryEnvelope({}), false);
  assert.equal(isRecoveryEnvelope({
    kind: AURALITH_RECOVERY_KIND,
    version: AURALITH_RECOVERY_VERSION + 1,
    savedAt: '2026-07-25T00:00:00.000Z',
    project: {}
  }), false);
});
