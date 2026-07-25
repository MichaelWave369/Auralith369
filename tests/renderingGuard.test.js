import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('numeric UI flags cannot leak a visible zero into the canvas', () => {
  const source = fs.readFileSync('src/Auralith369.jsx', 'utf8');
  assert.ok(source.includes('{Boolean(drOv)&&<div'));
  assert.ok(!source.includes('{drOv&&<div'));
});
