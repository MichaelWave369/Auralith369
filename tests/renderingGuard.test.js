import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('numeric UI flags cannot leak visible zeroes into the editor', () => {
  const source = fs.readFileSync('src/Auralith369.jsx', 'utf8');
  for (const flag of ['drOv', 'splitV', 'eMask']) {
    assert.ok(source.includes(`{Boolean(${flag})&&`), `${flag} must be boolean-coerced before rendering`);
    assert.ok(!source.includes(`{${flag}&&`), `${flag} must not render a numeric zero`);
  }
});
