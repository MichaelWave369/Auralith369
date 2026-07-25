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
  '// Auralith369 v0.5.0-alpha — local-first visual alchemy by PHI369 Labs',
  '// Auralith369 v0.6.0-alpha — local-first visual alchemy by PHI369 Labs',
  'editor version comment'
);
editor = replaceRequired(
  editor,
  'const APP_VERSION="v0.5.0-alpha";',
  'const APP_VERSION="v0.6.0-alpha";',
  'editor version constant'
);
editor = replaceRequired(
  editor,
  '<Hd ic="◈">GPU Lab v0.4</Hd>',
  '<Hd ic="◈">GPU Lab v0.5</Hd>',
  'GPU panel version'
);
editor = editor.replaceAll('Auralith369 v0.3.0-alpha Shortcuts', 'Auralith369 v0.6.0-alpha Shortcuts');

const bloomMarker = '            <Hd ic="✦">Aura Bloom</Hd>';
const spectralPanel = `            <div data-testid="gpu-spectral-forge">
              <Hd ic="◇">Prism Drift / Spectral Forge</Hd>
              <Bt a={gpuSettings.spectral.enabled} onClick={()=>setGpuValue("spectral","enabled",!gpuSettings.spectral.enabled)} sm>{gpuSettings.spectral.enabled?"Spectral On":"Spectral Off"}</Bt>
              <Sl l="Hue Drift" v={gpuSettings.spectral.hueShift} mn={-180} mx={180} s={1} ch={value=>setGpuValue("spectral","hueShift",value)} u="°" c={C.pr}/>
              <Sl l="Saturation" v={gpuSettings.spectral.saturation*100} mn={0} mx={250} ch={value=>setGpuValue("spectral","saturation",value/100)} u="%" c={C.pk}/>
              <Sl l="Prism Dispersion" v={gpuSettings.spectral.prismAmount} mn={0} mx={24} s={.5} ch={value=>setGpuValue("spectral","prismAmount",value)} u="px" c={C.cy}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2}}>
                <label style={{fontSize:6,color:C.td}}>Shadow Tint<input data-testid="gpu-shadow-tint" type="color" value={gpuSettings.spectral.shadowTint} onChange={e=>setGpuValue("spectral","shadowTint",e.target.value)} style={{display:"block",width:"100%",height:20,marginTop:1,background:C.srf,border:\`1px solid \${C.bd}\`}}/></label>
                <label style={{fontSize:6,color:C.td}}>Highlight Tint<input data-testid="gpu-highlight-tint" type="color" value={gpuSettings.spectral.highlightTint} onChange={e=>setGpuValue("spectral","highlightTint",e.target.value)} style={{display:"block",width:"100%",height:20,marginTop:1,background:C.srf,border:\`1px solid \${C.bd}\`}}/></label>
              </div>
              <Sl l="Tint Strength" v={gpuSettings.spectral.tintStrength*100} mn={0} mx={100} ch={value=>setGpuValue("spectral","tintStrength",value/100)} u="%" c={C.gd}/>
              <Sl l="Solarize" v={gpuSettings.spectral.solarize*100} mn={0} mx={100} ch={value=>setGpuValue("spectral","solarize",value/100)} u="%" c={C.or}/>
              <label style={{fontSize:6,color:C.td}}>Channel Map<select data-testid="gpu-channel-map" value={gpuSettings.spectral.channelMap} onChange={e=>setGpuValue("spectral","channelMap",e.target.value)} style={{display:"block",width:"100%",marginTop:1,marginBottom:2}}>{[["rgb","RGB"],["rbg","RBG"],["grb","GRB"],["gbr","GBR"],["brg","BRG"],["bgr","BGR"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
              <div style={{fontSize:5.5,color:C.tm,lineHeight:1.45,marginBottom:3}}>Radial prism sampling and color transforms remain parameterized. Original Canvas 2D pixels are never rewritten.</div>
            </div>
${bloomMarker}`;
editor = replaceRequired(editor, bloomMarker, spectralPanel, 'Spectral Forge panel insertion');
fs.writeFileSync(editorPath, editor);

let e2e = fs.readFileSync(e2ePath, 'utf8');
e2e = e2e.replaceAll('GPU Lab v0\\.4', 'GPU Lab v0\\.5');

if (!e2e.includes('GPU Spectral Forge exposes prism and color controls')) {
  e2e += `\n\ntest('GPU Spectral Forge exposes prism and color controls', async ({ page }) => {\n  const errors = collectPageErrors(page);\n  await page.goto('./');\n  await page.getByRole('button', { name: 'gpu', exact: true }).click();\n  await expect(page.getByText(/GPU Lab v0\\.5/).first()).toBeVisible();\n  await expect(page.getByTestId('gpu-spectral-forge')).toBeVisible();\n\n  await page.getByTestId('gpu-preset-select').selectOption('builtin:prism-oracle');\n  await expect(page.getByRole('button', { name: 'Spectral On', exact: true })).toBeVisible();\n  await expect(page.getByTestId('gpu-channel-map')).toHaveValue('rgb');\n  await expect(page.getByTestId('gpu-shadow-tint')).toHaveValue('#34136f');\n  await expect(page.getByTestId('gpu-highlight-tint')).toHaveValue('#69f7ff');\n\n  await page.getByTestId('gpu-channel-map').selectOption('bgr');\n  await expect(page.getByTestId('gpu-active-preset')).toContainText('modified');\n  await expect(page.getByText('Prism Dispersion', { exact: true })).toBeVisible();\n  await expect(page.getByText('Solarize', { exact: true })).toBeVisible();\n  await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);\n  expect(errors).toEqual([]);\n});\n`;
}
fs.writeFileSync(e2ePath, e2e);

console.log('GPU Spectral Forge integration completed.');
