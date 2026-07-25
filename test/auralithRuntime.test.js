import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AURALITH_OVERLAYS,
  installAuralithRuntimeGlobals
} from '../src/lib/auralithRuntime.js';

test('runtime overlay registry exposes every editor overlay', () => {
  assert.deepEqual(
    AURALITH_OVERLAYS.map(({ id }) => id),
    ['none', 'phi', 'thirds', 'spiral', '369']
  );
});

test('runtime bridge installs OVL for the canonical editor component', () => {
  const target = {};
  installAuralithRuntimeGlobals(target);
  assert.equal(target.OVL, AURALITH_OVERLAYS);
});
