import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const editorSource = fs.readFileSync(new URL('../src/Auralith369.jsx', import.meta.url), 'utf8');

test('editor compositor coalesces work through requestAnimationFrame', () => {
  assert.match(editorSource, /requestAnimationFrame\(renderCompositeFrame\)/);
  assert.match(editorSource, /cancelAnimationFrame\(renderFrameRef\.current\)/);
});

test('system image paste is not intercepted without an internal pixel clipboard', () => {
  assert.match(editorSource, /if\(e\.key===\"v\"&&clip\.current\)/);
  assert.doesNotMatch(editorSource, /if\(e\.key===\"v\"\)\{e\.preventDefault\(\);selPst\(\);\}/);
});

test('edge tools use bounded pixel regions instead of swallowed canvas exceptions', () => {
  for (const tool of ['smudgePaint', 'dodgeBurn', 'liquify', 'colorReplace']) {
    assert.match(editorSource, new RegExp(`const ${tool}=.*clampPixelRegion`));
  }
  assert.match(editorSource, /tl===\"clone\".*clampPixelRegion/);
});
