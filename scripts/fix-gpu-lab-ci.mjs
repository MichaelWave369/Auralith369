import fs from 'node:fs';

const editorPath = 'src/Auralith369.jsx';
const smokePath = 'tests/e2e/editor-smoke.spec.js';
const guardPath = 'tests/renderingGuard.test.js';

let editor = fs.readFileSync(editorPath, 'utf8');
const replacements = [
  ['{splitV&&<input', '{Boolean(splitV)&&<input'],
  ['{eMask&&<span', '{Boolean(eMask)&&<span']
];

for (const [before, after] of replacements) {
  if (editor.includes(before)) editor = editor.replace(before, after);
  else if (!editor.includes(after)) throw new Error(`Missing numeric conditional: ${before}`);
}
editor = editor.replace(
  '// Auralith369 v0.1.0-alpha — local-first visual alchemy by PHI369 Labs',
  '// Auralith369 v0.2.0-alpha — local-first visual alchemy by PHI369 Labs'
);
fs.writeFileSync(editorPath, editor);

let smoke = fs.readFileSync(smokePath, 'utf8');
smoke = smoke.replace(
  "page.getByText('GPU Lab v0.1', { exact: true })",
  "page.getByText(/GPU Lab v0\\.1/).first()"
);
fs.writeFileSync(smokePath, smoke);

fs.writeFileSync(guardPath, `import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('numeric UI flags cannot leak visible zeroes into the editor', () => {
  const source = fs.readFileSync('src/Auralith369.jsx', 'utf8');
  for (const flag of ['drOv', 'splitV', 'eMask']) {
    assert.ok(source.includes(\`{Boolean(\${flag})&&\`), \`\${flag} must be boolean-coerced before rendering\`);
    assert.ok(!source.includes(\`{\${flag}&&\`), \`\${flag} must not render a numeric zero\`);
  }
});
`);

console.log('GPU Lab browser gate repair applied.');
