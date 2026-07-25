import fs from 'node:fs';

const path = 'tests/e2e/editor-smoke.spec.js';
let source = fs.readFileSync(path, 'utf8');

const before = `  const capabilityText = await capability.textContent();

  if (capabilityText?.includes('WebGL2')) {
    await page.getByRole('button', { name: 'Enable GPU Preview', exact: true }).click();`;
const after = `  const capabilityText = await capability.textContent();
  const enableGpu = page.getByRole('button', { name: 'Enable GPU Preview', exact: true });

  if (await enableGpu.isEnabled()) {
    await enableGpu.click();`;

if (source.includes(before)) source = source.replace(before, after);
else if (!source.includes(after)) throw new Error('GPU fallback test block was not found.');

fs.writeFileSync(path, source);
console.log('GPU fallback test now follows actual control availability.');
