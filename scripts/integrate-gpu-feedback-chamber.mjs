import fs from 'node:fs';

const editorPath = 'src/Auralith369.jsx';
const e2ePath = 'tests/e2e/editor-smoke.spec.js';
const packagePath = 'package.json';
const lockPath = 'package-lock.json';
const readmePath = 'README.md';

const replaceRequired = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error(`Missing integration marker: ${label}`);
  return text.replace(from, to);
};

let editor = fs.readFileSync(editorPath, 'utf8');
editor = replaceRequired(editor, '// Auralith369 v0.4.0-alpha — local-first visual alchemy by PHI369 Labs', '// Auralith369 v0.5.0-alpha — local-first visual alchemy by PHI369 Labs', 'editor version comment');
editor = replaceRequired(editor, 'const APP_VERSION="v0.4.0-alpha";', 'const APP_VERSION="v0.5.0-alpha";', 'editor version constant');
editor = replaceRequired(editor, '<Hd ic="◈">GPU Lab v0.3</Hd>', '<Hd ic="◈">GPU Lab v0.4</Hd>', 'GPU panel version');

editor = replaceRequired(
  editor,
  'const applyGpuPresetById=id=>{const preset=findGpuPreset(gpuPresets,id);if(!preset)return;setGpuSettings(normalizeGpuLabSettings(preset.settings));',
  'const applyGpuPresetById=id=>{const preset=findGpuPreset(gpuPresets,id);if(!preset)return;gpuPreviewRef.current?.clearFeedback();setGpuSettings(normalizeGpuLabSettings(preset.settings));',
  'preset buffer reset'
);
editor = replaceRequired(
  editor,
  'const importGpuCartridge=async file=>{if(!file)return;try{const preset=parseGpuPresetText(await file.text());setCustomGpuPresets',
  'const importGpuCartridge=async file=>{if(!file)return;try{const preset=parseGpuPresetText(await file.text());gpuPreviewRef.current?.clearFeedback();setCustomGpuPresets',
  'import buffer reset'
);

const auraMarker = '            <Hd ic="✦">Aura Bloom</Hd>';
const feedbackSection = `            <div data-testid="gpu-feedback-chamber">
              <Hd ic="⟳">Feedback Chamber</Hd>
              <div style={{display:"flex",gap:2,marginBottom:3}}><Bt a={gpuSettings.feedback.enabled} onClick={()=>{setGpuValue("feedback","enabled",!gpuSettings.feedback.enabled);gpuPreviewRef.current?.clearFeedback();}} sm style={{flex:1}}>{gpuSettings.feedback.enabled?"Feedback On":"Feedback Off"}</Bt><Bt data-testid="gpu-feedback-clear" onClick={()=>{gpuPreviewRef.current?.clearFeedback();flash("Feedback buffer cleared");}} sm style={{flex:1}}>Clear Frame</Bt></div>
              <Sl l="Amount" v={gpuSettings.feedback.amount*100} mn={0} mx={95} ch={value=>setGpuValue("feedback","amount",value/100)} u="%" c={C.pr}/>
              <Sl l="Decay" v={gpuSettings.feedback.decay*100} mn={0} mx={99.5} s={.5} ch={value=>setGpuValue("feedback","decay",value/100)} u="%" c={C.gd}/>
              <Sl l="Zoom" v={gpuSettings.feedback.scale*100} mn={80} mx={120} s={.1} ch={value=>setGpuValue("feedback","scale",value/100)} u="%" c={C.cy}/>
              <Sl l="Rotation" v={gpuSettings.feedback.rotation} mn={-180} mx={180} s={.1} ch={value=>setGpuValue("feedback","rotation",value)} u="°" c={C.pr}/>
              <Sl l="Offset X" v={gpuSettings.feedback.offsetX} mn={-64} mx={64} s={1} ch={value=>setGpuValue("feedback","offsetX",value)} u="px"/>
              <Sl l="Offset Y" v={gpuSettings.feedback.offsetY} mn={-64} mx={64} s={1} ch={value=>setGpuValue("feedback","offsetY",value)} u="px"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2}}>
                <label style={{fontSize:6,color:C.td}}>Mirror<select data-testid="gpu-feedback-mirror" value={gpuSettings.feedback.mirror} onChange={e=>setGpuValue("feedback","mirror",e.target.value)} style={{display:"block",width:"100%",marginTop:1}}>{[["off","Off"],["x","Mirror X"],["y","Mirror Y"],["quad","Quad Mirror"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
                <label style={{fontSize:6,color:C.td}}>Blend<select data-testid="gpu-feedback-blend" value={gpuSettings.feedback.blend} onChange={e=>setGpuValue("feedback","blend",e.target.value)} style={{display:"block",width:"100%",marginTop:1}}>{[["mix","Mix"],["add","Add"],["screen","Screen"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
              </div>
              <Sl l="Kaleidoscope" v={gpuSettings.feedback.kaleidoscope} mn={0} mx={12} s={1} ch={value=>setGpuValue("feedback","kaleidoscope",value)} u={gpuSettings.feedback.kaleidoscope?"×":" Off"} c={C.or}/>
              <div style={{fontSize:5.5,color:C.tm,lineHeight:1.45,marginBottom:3}}>True ping-pong frame recursion at a bounded 30 FPS. Clear Frame resets both local GPU buffers without touching Canvas 2D artwork.</div>
            </div>
${auraMarker}`;
editor = replaceRequired(editor, auraMarker, feedbackSection, 'Feedback Chamber panel');
fs.writeFileSync(editorPath, editor);

let e2e = fs.readFileSync(e2ePath, 'utf8');
e2e = e2e.replaceAll('GPU Lab v0\\.3', 'GPU Lab v0\\.4');
if (!e2e.includes("GPU Feedback Chamber exposes recursive controls and safe clearing")) {
  e2e += `\n\ntest('GPU Feedback Chamber exposes recursive controls and safe clearing', async ({ page }) => {\n  const errors = collectPageErrors(page);\n  await page.goto('./');\n  await page.getByRole('button', { name: 'gpu', exact: true }).click();\n  await expect(page.getByText(/GPU Lab v0\\.4/).first()).toBeVisible();\n  await expect(page.getByTestId('gpu-feedback-chamber')).toBeVisible();\n\n  await page.getByTestId('gpu-preset-select').selectOption('builtin:infinite-cathedral');\n  await expect(page.getByRole('button', { name: 'Feedback On', exact: true })).toBeVisible();\n  await expect(page.getByTestId('gpu-feedback-mirror')).toHaveValue('quad');\n  await expect(page.getByTestId('gpu-feedback-blend')).toHaveValue('screen');\n\n  await page.getByTestId('gpu-feedback-mirror').selectOption('x');\n  await expect(page.getByTestId('gpu-active-preset')).toContainText('modified');\n  await page.getByText('Clear Frame', { exact: true }).click();\n  await expect(page.getByText('Feedback buffer cleared', { exact: true })).toBeVisible();\n  await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);\n  expect(errors).toEqual([]);\n});\n`;
}
fs.writeFileSync(e2ePath, e2e);

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.version = '0.5.0-alpha';
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
lock.version = '0.5.0-alpha';
if (lock.packages?.['']) lock.packages[''].version = '0.5.0-alpha';
fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

let readme = fs.readFileSync(readmePath, 'utf8');
readme = readme.replace('## GPU Cartridge Bay (v0.3.0-alpha)', '## GPU Cartridge Bay and Feedback Chamber (v0.5.0-alpha)');
readme = readme.replace(
  'GPU Lab v0.2 adds a local visual-cartridge workflow: eight built-in signal presets, custom save/update/clone/rename/delete, favorites, JSON import/export, bypass and hold-original comparison, and project/receipt/manifest persistence. The first-session high-energy settings are preserved as the built-in **Cathedral Resonance** cartridge. Canvas 2D remains authoritative.',
  'GPU Lab v0.4 adds ten local signal cartridges, Display Physics, and a true ping-pong Feedback Chamber with recursive decay, zoom, rotation, offset, mirror, kaleidoscope, blend, and safe frame-buffer clearing. Custom cartridges, JSON import/export, comparison, recovery, receipts, and manifests preserve the full parameter state. Canvas 2D remains authoritative.'
);
fs.writeFileSync(readmePath, readme);

console.log('GPU Feedback Chamber integration completed.');
