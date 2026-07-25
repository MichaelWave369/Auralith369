import fs from 'node:fs';

const editorPath = 'src/Auralith369.jsx';
const e2ePath = 'tests/e2e/editor-smoke.spec.js';

const replaceRequired = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error(`Missing integration marker: ${label}`);
  return text.replace(from, to);
};

let editor = fs.readFileSync(editorPath, 'utf8');
editor = replaceRequired(
  editor,
  '// Auralith369 v0.3.0-alpha — local-first visual alchemy by PHI369 Labs',
  '// Auralith369 v0.4.0-alpha — local-first visual alchemy by PHI369 Labs',
  'editor version comment'
);
editor = replaceRequired(
  editor,
  'const APP_VERSION="v0.3.0-alpha";',
  'const APP_VERSION="v0.4.0-alpha";',
  'editor version constant'
);
editor = replaceRequired(
  editor,
  '<Hd ic="◈">GPU Lab v0.2</Hd>',
  '<Hd ic="◈">GPU Lab v0.3</Hd>',
  'GPU panel version'
);

const signalNoiseLine = '            <Sl l="Signal Noise" v={gpuSettings.crt.noise*1000} mn={0} mx={120} ch={value=>setGpuValue("crt","noise",value/1000)} u="‰"/>';
const displayPhysics = `${signalNoiseLine}\n            <div data-testid="gpu-display-physics">\n              <Hd ic="▦">Display Physics</Hd>\n              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:3,marginBottom:3}}><span style={{fontSize:6.5,color:C.td}}>Phosphor Mask</span><select data-testid="gpu-phosphor-mask" value={gpuSettings.display.phosphorMask} onChange={e=>setGpuValue("display","phosphorMask",e.target.value)} style={{fontSize:6.5,minWidth:82}}>{[["off","Off"],["aperture","Aperture"],["slot","Slot Mask"],["triad","Triad Dots"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>\n              <Sl l="Scanline Softness" v={gpuSettings.display.scanlineSoftness*100} mn={0} mx={100} ch={value=>setGpuValue("display","scanlineSoftness",value/100)} u="%" c={C.cy}/>\n              <Sl l="Phosphor Strength" v={gpuSettings.display.phosphorStrength*100} mn={0} mx={85} ch={value=>setGpuValue("display","phosphorStrength",value/100)} u="%" c={C.gn}/>\n              <Sl l="Signal Ghosting" v={gpuSettings.display.ghosting*100} mn={0} mx={85} ch={value=>setGpuValue("display","ghosting",value/100)} u="%" c={C.pr}/>\n              <Sl l="Ghost Offset" v={gpuSettings.display.ghostOffset} mn={0} mx={24} s={.5} ch={value=>setGpuValue("display","ghostOffset",value)} u="px" c={C.pr}/>\n              <Sl l="Brightness Comp" v={gpuSettings.display.brightness*100} mn={50} mx={180} ch={value=>setGpuValue("display","brightness",value/100)} u="%" c={C.gd}/>\n              <Sl l="Black Crush" v={gpuSettings.display.blackCrush*100} mn={0} mx={45} ch={value=>setGpuValue("display","blackCrush",value/100)} u="%" c={C.or}/>\n              <Sl l="Highlight Rolloff" v={gpuSettings.display.highlightRolloff*100} mn={0} mx={100} ch={value=>setGpuValue("display","highlightRolloff",value/100)} u="%" c={C.gd}/>\n            </div>`;
editor = replaceRequired(editor, signalNoiseLine, displayPhysics, 'display physics insertion');
editor = replaceRequired(
  editor,
  '<Bt onClick={()=>{setGpuSettings(normalizeGpuLabSettings(GPU_LAB_DEFAULTS));setActiveGpuPresetId("builtin:golden-oracle");setGpuPresetName("Golden Oracle");setGpuPresetDirty(0);}} sm style={{flex:1}}>Reset</Bt>',
  '<Bt onClick={()=>applyGpuPresetById("builtin:golden-oracle")} sm style={{flex:1}}>Reset</Bt>',
  'GPU reset behavior'
);
fs.writeFileSync(editorPath, editor);

let e2e = fs.readFileSync(e2ePath, 'utf8');
e2e = e2e.replaceAll('GPU Lab v0\\.2', 'GPU Lab v0\\.3');

if (!e2e.includes("GPU Display Physics controls cartridges and live settings")) {
  e2e += `\n\ntest('GPU Display Physics controls cartridges and live settings', async ({ page }) => {\n  const errors = collectPageErrors(page);\n  await page.goto('./');\n  await page.getByRole('button', { name: 'gpu', exact: true }).click();\n  await expect(page.getByText(/GPU Lab v0\\.3/).first()).toBeVisible();\n  await expect(page.getByTestId('gpu-display-physics')).toBeVisible();\n\n  await page.getByTestId('gpu-preset-select').selectOption('builtin:cathedral-resonance');\n  await expect(page.getByTestId('gpu-phosphor-mask')).toHaveValue('slot');\n  await page.getByTestId('gpu-phosphor-mask').selectOption('triad');\n  await expect(page.getByTestId('gpu-active-preset')).toContainText('modified');\n\n  await page.getByText('Signal Ghosting', { exact: true }).scrollIntoViewIfNeeded();\n  await expect(page.getByText('Brightness Comp', { exact: true })).toBeVisible();\n  await expect(page.getByText('Black Crush', { exact: true })).toBeVisible();\n  await expect(page.getByText('Highlight Rolloff', { exact: true })).toBeVisible();\n  await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);\n  expect(errors).toEqual([]);\n});\n`;
}
fs.writeFileSync(e2ePath, e2e);

console.log('GPU Display Physics integration completed.');
