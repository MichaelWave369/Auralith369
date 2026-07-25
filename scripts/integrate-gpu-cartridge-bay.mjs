import fs from 'node:fs';

const editorPath = 'src/Auralith369.jsx';
const e2ePath = 'tests/e2e/editor-smoke.spec.js';
const packagePath = 'package.json';
const readmePath = 'README.md';

const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Could not locate ${label}`);
  return source.replace(before, after);
};

let editor = fs.readFileSync(editorPath, 'utf8');
editor = editor.replace('// Auralith369 v0.2.0-alpha', '// Auralith369 v0.3.0-alpha');
editor = editor.replace('const APP_VERSION="v0.2.0-alpha";', 'const APP_VERSION="v0.3.0-alpha";');

editor = replaceOnce(
  editor,
  'import { GPU_LAB_DEFAULTS, normalizeGpuLabProjectState, normalizeGpuLabSettings } from "./gpu/gpuLabDefaults.js";',
  `import { GPU_LAB_DEFAULTS, normalizeGpuLabProjectState, normalizeGpuLabSettings } from "./gpu/gpuLabDefaults.js";\nimport { GPU_LAB_BUILTIN_PRESETS, createCustomGpuPreset, findGpuPreset, parseGpuPresetText, serializeGpuPreset, updateCustomGpuPreset } from "./gpu/gpuLabPresets.js";\nimport { loadCustomGpuPresets, loadGpuFavoriteIds, saveCustomGpuPresets, saveGpuFavoriteIds } from "./gpu/gpuPresetStorage.js";`,
  'GPU preset imports'
);

editor = replaceOnce(
  editor,
  '  const gpuPreviewRef=useRef(null);',
  '  const gpuPreviewRef=useRef(null),gpuPresetInputRef=useRef(null);',
  'GPU preset file ref'
);

const oldGpuState = `  const[gpuEnabled,setGpuEnabled]=useState(0);\n  const[gpuSettings,setGpuSettings]=useState(()=>normalizeGpuLabSettings(GPU_LAB_DEFAULTS));\n  const[gpuStatus,setGpuStatus]=useState({supported:null,active:false,reason:"Checking WebGL2…"});\n  const setGpuValue=(group,key,value)=>setGpuSettings(current=>normalizeGpuLabSettings({...current,[group]:{...current[group],[key]:value}}));`;
const newGpuState = `  const[gpuEnabled,setGpuEnabled]=useState(0);\n  const[gpuSettings,setGpuSettings]=useState(()=>normalizeGpuLabSettings(GPU_LAB_DEFAULTS));\n  const[gpuStatus,setGpuStatus]=useState({supported:null,active:false,reason:"Checking WebGL2…"});\n  const[customGpuPresets,setCustomGpuPresets]=useState(()=>loadCustomGpuPresets());\n  const[gpuFavoriteIds,setGpuFavoriteIds]=useState(()=>loadGpuFavoriteIds());\n  const[activeGpuPresetId,setActiveGpuPresetId]=useState("builtin:golden-oracle");\n  const[gpuPresetName,setGpuPresetName]=useState("Golden Oracle");\n  const[gpuPresetDirty,setGpuPresetDirty]=useState(0);\n  const[gpuBypass,setGpuBypass]=useState(0);\n  const[gpuHoldOriginal,setGpuHoldOriginal]=useState(0);\n  const gpuPresets=useMemo(()=>[...GPU_LAB_BUILTIN_PRESETS,...customGpuPresets].map(preset=>({...preset,favorite:gpuFavoriteIds.includes(preset.id)})).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||a.name.localeCompare(b.name)),[customGpuPresets,gpuFavoriteIds]);\n  const activeGpuPreset=useMemo(()=>findGpuPreset(gpuPresets,activeGpuPresetId),[gpuPresets,activeGpuPresetId]);\n  const effectiveGpuEnabled=Boolean(gpuEnabled&&!gpuBypass&&!gpuHoldOriginal);\n  const setGpuValue=(group,key,value)=>{setGpuPresetDirty(1);setGpuSettings(current=>normalizeGpuLabSettings({...current,[group]:{...current[group],[key]:value}}));};`;
editor = replaceOnce(editor, oldGpuState, newGpuState, 'GPU state block');

const oldDownload = '  const downloadBlob=(name,type,body)=>{const a=document.createElement("a"),blob=new Blob([body],{type});a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800);};';
const cartridgeHandlers = `${oldDownload}\n  const applyGpuPresetById=id=>{const preset=findGpuPreset(gpuPresets,id);if(!preset)return;setGpuSettings(normalizeGpuLabSettings(preset.settings));setActiveGpuPresetId(preset.id);setGpuPresetName(preset.name);setGpuPresetDirty(0);setGpuBypass(0);if(gpuStatus.supported!==false)setGpuEnabled(1);flash("Cartridge: "+preset.name);};\n  const saveGpuPresetAs=()=>{const name=window.prompt("Name this GPU cartridge",gpuPresetDirty?gpuPresetName+" Variant":gpuPresetName||"Custom Signal");if(!name?.trim())return;const preset=createCustomGpuPreset(name,gpuSettings,"Created in Auralith GPU Lab.");setCustomGpuPresets(current=>[preset,...current.filter(item=>item.id!==preset.id)]);setActiveGpuPresetId(preset.id);setGpuPresetName(preset.name);setGpuPresetDirty(0);flash("Cartridge saved");};\n  const updateActiveGpuPreset=()=>{if(!activeGpuPreset||activeGpuPreset.builtIn){saveGpuPresetAs();return;}const updated=updateCustomGpuPreset(activeGpuPreset,{settings:gpuSettings});setCustomGpuPresets(current=>current.map(item=>item.id===updated.id?updated:item));setGpuPresetName(updated.name);setGpuPresetDirty(0);flash("Cartridge updated");};\n  const cloneActiveGpuPreset=()=>{const source=activeGpuPreset||{name:gpuPresetName,settings:gpuSettings};const name=window.prompt("Name the cloned cartridge",(source.name||"Signal")+" Copy");if(!name?.trim())return;const preset=createCustomGpuPreset(name,source.settings,source.description||"Cloned GPU cartridge.");setCustomGpuPresets(current=>[preset,...current]);setActiveGpuPresetId(preset.id);setGpuPresetName(preset.name);setGpuPresetDirty(0);flash("Cartridge cloned");};\n  const renameActiveGpuPreset=()=>{if(!activeGpuPreset||activeGpuPreset.builtIn){cloneActiveGpuPreset();return;}const name=window.prompt("Rename GPU cartridge",activeGpuPreset.name);if(!name?.trim())return;const updated=updateCustomGpuPreset(activeGpuPreset,{name});setCustomGpuPresets(current=>current.map(item=>item.id===updated.id?updated:item));setGpuPresetName(updated.name);flash("Cartridge renamed");};\n  const deleteActiveGpuPreset=()=>{if(!activeGpuPreset||activeGpuPreset.builtIn){flash("Built-in cartridges are protected");return;}if(!window.confirm(\`Delete cartridge “\${activeGpuPreset.name}”?\`))return;setCustomGpuPresets(current=>current.filter(item=>item.id!==activeGpuPreset.id));setGpuFavoriteIds(current=>current.filter(id=>id!==activeGpuPreset.id));applyGpuPresetById("builtin:golden-oracle");flash("Cartridge deleted");};\n  const toggleGpuPresetFavorite=()=>{if(!activeGpuPresetId)return;setGpuFavoriteIds(current=>current.includes(activeGpuPresetId)?current.filter(id=>id!==activeGpuPresetId):[activeGpuPresetId,...current]);};\n  const exportGpuCartridge=()=>{const preset=activeGpuPreset||createCustomGpuPreset(gpuPresetName||"Current Signal",gpuSettings,"Current unsaved GPU settings.");const safe=(preset.name||"gpu-cartridge").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"gpu-cartridge";downloadBlob(\`\${safe}.auralith-gpu.json\`,"application/json",serializeGpuPreset({...preset,settings:gpuSettings}));flash("Cartridge exported");};\n  const importGpuCartridge=async file=>{if(!file)return;try{const preset=parseGpuPresetText(await file.text());setCustomGpuPresets(current=>[preset,...current.filter(item=>item.id!==preset.id)]);setGpuSettings(preset.settings);setActiveGpuPresetId(preset.id);setGpuPresetName(preset.name);setGpuPresetDirty(0);setGpuBypass(0);if(gpuStatus.supported!==false)setGpuEnabled(1);flash("Cartridge imported");}catch(error){console.warn("[Auralith369] GPU cartridge import rejected",error);flash(error?.message||"Cartridge import failed");}};`;
editor = replaceOnce(editor, oldDownload, cartridgeHandlers, 'GPU cartridge handlers');

editor = editor.replace(
  'gpuLab:{enabled:!!gpuEnabled,settings:normalizeGpuLabSettings(gpuSettings)}',
  'gpuLab:{enabled:!!gpuEnabled,bypassed:!!gpuBypass,activePresetId:activeGpuPresetId,activePresetName:gpuPresetName,presetDirty:!!gpuPresetDirty,settings:normalizeGpuLabSettings(gpuSettings)}'
);
editor = editor.replace(
  'domColors,gpuEnabled,gpuSettings]);',
  'domColors,gpuEnabled,gpuBypass,activeGpuPresetId,gpuPresetName,gpuPresetDirty,gpuSettings]);'
);

editor = replaceOnce(
  editor,
  'const gpuProject=normalizeGpuLabProjectState(raw.gpuLab);setGpuEnabled(gpuProject.enabled?1:0);setGpuSettings(gpuProject.settings);setHasI(1);',
  'const gpuProject=normalizeGpuLabProjectState(raw.gpuLab);setGpuEnabled(gpuProject.enabled?1:0);setGpuSettings(gpuProject.settings);setGpuBypass(raw.gpuLab?.bypassed?1:0);setActiveGpuPresetId(String(raw.gpuLab?.activePresetId||""));setGpuPresetName(String(raw.gpuLab?.activePresetName||"Custom Signal"));setGpuPresetDirty(raw.gpuLab?.presetDirty?1:0);setHasI(1);',
  'project GPU cartridge restore'
);

editor = editor.replace(
  'setGpuEnabled(0);setGpuSettings(normalizeGpuLabSettings(GPU_LAB_DEFAULTS));setTimeout(()=>save("New Canvas"),0);',
  'setGpuEnabled(0);setGpuBypass(0);setGpuHoldOriginal(0);setGpuSettings(normalizeGpuLabSettings(GPU_LAB_DEFAULTS));setActiveGpuPresetId("builtin:golden-oracle");setGpuPresetName("Golden Oracle");setGpuPresetDirty(0);setTimeout(()=>save("New Canvas"),0);'
);

editor = editor.replaceAll(
  'gpuLab:{enabled:!!gpuEnabled,settings:normalizeGpuLabSettings(gpuSettings)}',
  'gpuLab:{enabled:!!gpuEnabled,bypassed:!!gpuBypass,activePresetId:activeGpuPresetId,activePresetName:gpuPresetName,presetDirty:!!gpuPresetDirty,settings:normalizeGpuLabSettings(gpuSettings)}'
);
editor = editor.replace(
  '`- GPU Lab: ${gpuEnabled?"on":"off"}${gpuEnabled?` · ${gpuStatus.active?"three-webgl2":"fallback"}`:""}`',
  '`- GPU Lab: ${gpuEnabled?"on":"off"}${gpuEnabled?` · ${gpuStatus.active?"three-webgl2":"fallback"}`:""} · cartridge=${gpuPresetName}${gpuPresetDirty?" (modified)":""}${gpuBypass?" · bypassed":""}`'
);

editor = replaceOnce(
  editor,
  '  useEffect(()=>{let active=true;loadRecoverySnapshot()',
  '  useEffect(()=>{saveCustomGpuPresets(customGpuPresets);},[customGpuPresets]);\n  useEffect(()=>{saveGpuFavoriteIds(gpuFavoriteIds);},[gpuFavoriteIds]);\n\n  useEffect(()=>{let active=true;loadRecoverySnapshot()',
  'GPU cartridge storage effects'
);

editor = replaceOnce(
  editor,
  '<GpuLabPreview ref={gpuPreviewRef} enabled={!!gpuEnabled} width={sz.w} height={sz.h} settings={gpuSettings} onStatus={setGpuStatus}/>',
  '<GpuLabPreview ref={gpuPreviewRef} enabled={effectiveGpuEnabled} width={sz.w} height={sz.h} settings={gpuSettings} onStatus={setGpuStatus}/>',
  'effective GPU preview state'
);

const gpuPanelPattern = /          \{rT==="gpu"&&<>[\s\S]*?          <\/\>}\n\n          \{rT==="plug"&&<>/;
const gpuPanel = `          {rT==="gpu"&&<>\n            <Hd ic="◈">GPU Lab v0.2</Hd>\n            <Hd ic="▣">Cartridge Bay</Hd>\n            <select data-testid="gpu-preset-select" value={activeGpuPresetId} onChange={e=>applyGpuPresetById(e.target.value)} style={{width:"100%",marginBottom:2,fontSize:6.5}}>\n              <option value="">Custom / unsaved signal</option>\n              {gpuPresets.map(preset=><option key={preset.id} value={preset.id}>{preset.favorite?"★ ":""}{preset.builtIn?"◆ ":""}{preset.name}</option>)}\n            </select>\n            <div data-testid="gpu-active-preset" style={{padding:"2px 4px",background:C.srf,borderRadius:2,border:\`1px solid \${gpuPresetDirty?C.gd:C.bd}\`,fontSize:6,color:gpuPresetDirty?C.gd:C.ac,marginBottom:2}}>{gpuPresetName||"Custom Signal"}{gpuPresetDirty?" · modified":""}</div>\n            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1}}>\n              <Bt onClick={saveGpuPresetAs} sm>Save As</Bt><Bt onClick={updateActiveGpuPreset} sm>Update</Bt><Bt onClick={cloneActiveGpuPreset} sm>Clone</Bt>\n              <Bt onClick={renameActiveGpuPreset} sm>Rename</Bt><Bt onClick={deleteActiveGpuPreset} sm style={{color:activeGpuPreset?.builtIn?C.tm:C.rd}}>Delete</Bt><Bt onClick={toggleGpuPresetFavorite} sm a={gpuFavoriteIds.includes(activeGpuPresetId)}>★ Fav</Bt>\n              <Bt onClick={exportGpuCartridge} sm>Export Cart</Bt><Bt onClick={()=>gpuPresetInputRef.current?.click()} sm>Import Cart</Bt><Bt onClick={()=>applyGpuPresetById("builtin:golden-oracle")} sm>Default</Bt>\n            </div>\n            <input ref={gpuPresetInputRef} type="file" accept=".auralith-gpu.json,application/json" style={{display:"none"}} onChange={e=>{importGpuCartridge(e.target.files?.[0]);e.target.value="";}}/>\n            <Hd ic="◐">Compare</Hd>\n            <div style={{display:"flex",gap:2,marginBottom:3}}>\n              <Bt a={gpuBypass} onClick={()=>setGpuBypass(value=>value?0:1)} sm style={{flex:1}}>{gpuBypass?"Resume GPU":"Bypass GPU"}</Bt>\n              <button onPointerDown={()=>setGpuHoldOriginal(1)} onPointerUp={()=>setGpuHoldOriginal(0)} onPointerLeave={()=>setGpuHoldOriginal(0)} onPointerCancel={()=>setGpuHoldOriginal(0)} style={{flex:1,padding:"2px 4px",background:gpuHoldOriginal?C.ad:C.srf,color:gpuHoldOriginal?C.ac:C.td,border:\`1px solid \${gpuHoldOriginal?C.ac+"55":C.bd}\`,borderRadius:2,cursor:"pointer",fontSize:6,fontFamily:FN}}>Hold Original</button>\n            </div>\n            <div data-testid="gpu-capability" style={{padding:4,background:C.srf,borderRadius:3,border:\`1px solid \${gpuStatus.active?C.ac:C.bd}\`,fontSize:6,color:gpuStatus.supported===false?C.rd:gpuStatus.active?C.ac:C.td,lineHeight:1.45,marginBottom:3}}>{gpuStatus.supported===null?"Checking WebGL2…":gpuStatus.supported?(gpuStatus.active?"WebGL2 active · Three.js shader preview":gpuBypass||gpuHoldOriginal?"Canvas 2D compare view · GPU ready":"WebGL2 ready · Canvas 2D remains active"):gpuStatus.reason}</div>\n            <button onClick={()=>setGpuEnabled(value=>value?0:1)} disabled={gpuStatus.supported===false} style={{width:"100%",padding:"5px 7px",background:gpuEnabled?\`linear-gradient(135deg,\${C.ac},\${C.pr})\`:C.srf,color:gpuEnabled?C.bg:C.tx,border:\`1px solid \${gpuEnabled?C.ac:C.bd}\`,borderRadius:3,cursor:gpuStatus.supported===false?"not-allowed":"pointer",fontWeight:700,fontSize:7,fontFamily:FN,opacity:gpuStatus.supported===false?.55:1}}>{gpuEnabled?"Disable GPU Preview":"Enable GPU Preview"}</button>\n            {gpuStatus.renderer&&<div style={{fontSize:5.5,color:C.tm,marginTop:3,wordBreak:"break-word"}}>{gpuStatus.renderer} · max texture {gpuStatus.maxTextureSize||"?"}px</div>}\n            <Hd ic="▤">CRT Signal</Hd>\n            <Bt a={gpuSettings.crt.enabled} onClick={()=>setGpuValue("crt","enabled",!gpuSettings.crt.enabled)} sm>{gpuSettings.crt.enabled?"CRT On":"CRT Off"}</Bt>\n            <Sl l="Curvature" v={gpuSettings.crt.curvature*100} mn={0} mx={35} ch={value=>setGpuValue("crt","curvature",value/100)} u="%" c={C.pr}/>\n            <Sl l="Scanlines" v={gpuSettings.crt.scanlineIntensity*100} mn={0} mx={60} ch={value=>setGpuValue("crt","scanlineIntensity",value/100)} u="%"/>\n            <Sl l="Density" v={gpuSettings.crt.scanlineCount} mn={120} mx={2160} s={60} ch={value=>setGpuValue("crt","scanlineCount",value)}/>\n            <Sl l="RGB Split" v={gpuSettings.crt.chromaticAberration} mn={0} mx={8} s={.1} ch={value=>setGpuValue("crt","chromaticAberration",value)} u="px" c={C.cy}/>\n            <Sl l="Vignette" v={gpuSettings.crt.vignette*100} mn={0} mx={80} ch={value=>setGpuValue("crt","vignette",value/100)} u="%"/>\n            <Sl l="Signal Noise" v={gpuSettings.crt.noise*1000} mn={0} mx={120} ch={value=>setGpuValue("crt","noise",value/1000)} u="‰"/>\n            <Hd ic="✦">Aura Bloom</Hd>\n            <Bt a={gpuSettings.bloom.enabled} onClick={()=>setGpuValue("bloom","enabled",!gpuSettings.bloom.enabled)} sm>{gpuSettings.bloom.enabled?"Bloom On":"Bloom Off"}</Bt>\n            <Sl l="Strength" v={gpuSettings.bloom.strength*100} mn={0} mx={250} ch={value=>setGpuValue("bloom","strength",value/100)} u="%" c={C.pr}/>\n            <Sl l="Radius" v={gpuSettings.bloom.radius*100} mn={0} mx={100} ch={value=>setGpuValue("bloom","radius",value/100)} u="%"/>\n            <Sl l="Threshold" v={gpuSettings.bloom.threshold*100} mn={0} mx={100} ch={value=>setGpuValue("bloom","threshold",value/100)} u="%" c={C.gd}/>\n            <div style={{display:"flex",gap:2,marginTop:4}}><Bt onClick={()=>{setGpuSettings(normalizeGpuLabSettings(GPU_LAB_DEFAULTS));setActiveGpuPresetId("builtin:golden-oracle");setGpuPresetName("Golden Oracle");setGpuPresetDirty(0);}} sm style={{flex:1}}>Reset</Bt><Bt onClick={exportGpuFrame} sm style={{flex:1,color:gpuStatus.active?C.ac:C.tm}}>Export GPU PNG</Bt></div>\n            <div style={{marginTop:5,padding:4,background:C.srf,borderRadius:3,border:\`1px solid \${C.bd}\`,fontSize:5.5,color:C.tm,lineHeight:1.5}}>Cartridges stay local in this browser. Project files preserve exact GPU settings and cartridge identity. Canvas 2D remains authoritative.</div>\n          </>}\n\n          {rT==="plug"&&<>`;
if (!gpuPanelPattern.test(editor)) throw new Error('Could not locate GPU panel block');
editor = editor.replace(gpuPanelPattern, gpuPanel);

editor = editor.replace('Auralith369 v0.1.0-alpha Shortcuts', 'Auralith369 v0.3.0-alpha Shortcuts');
fs.writeFileSync(editorPath, editor);

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.version = '0.3.0-alpha';
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

let e2e = fs.readFileSync(e2ePath, 'utf8');
const cartridgeTest = `\n\ntest('GPU Cartridge Bay loads, saves, persists, and exports presets', async ({ page }) => {\n  const errors = collectPageErrors(page);\n  await page.goto('./');\n  await page.getByRole('button', { name: 'gpu', exact: true }).click();\n  await expect(page.getByText(/GPU Lab v0\\.2/).first()).toBeVisible();\n\n  const select = page.getByTestId('gpu-preset-select');\n  await select.selectOption('builtin:cathedral-resonance');\n  await expect(page.getByTestId('gpu-active-preset')).toContainText('Cathedral Resonance');\n\n  page.once('dialog', dialog => dialog.accept('CI Cathedral'));\n  await page.getByRole('button', { name: 'Save As', exact: true }).click();\n  await expect(page.getByTestId('gpu-active-preset')).toContainText('CI Cathedral');\n  await expect(select.locator('option', { hasText: 'CI Cathedral' })).toHaveCount(1);\n\n  const downloadPromise = page.waitForEvent('download');\n  await page.getByRole('button', { name: 'Export Cart', exact: true }).click();\n  const download = await downloadPromise;\n  expect(download.suggestedFilename()).toMatch(/\\.auralith-gpu\\.json$/);\n\n  await page.getByRole('button', { name: 'Bypass GPU', exact: true }).click();\n  await expect(page.getByRole('button', { name: 'Resume GPU', exact: true })).toBeVisible();\n  await page.reload();\n  await page.getByRole('button', { name: 'gpu', exact: true }).click();\n  await expect(page.getByTestId('gpu-preset-select').locator('option', { hasText: 'CI Cathedral' })).toHaveCount(1);\n  expect(errors).toEqual([]);\n});\n`;
if (!e2e.includes("GPU Cartridge Bay loads, saves, persists, and exports presets")) e2e += cartridgeTest;
fs.writeFileSync(e2ePath, e2e);

let readme = fs.readFileSync(readmePath, 'utf8');
const readmeSection = `\n## GPU Cartridge Bay (v0.3.0-alpha)\n\nGPU Lab v0.2 adds a local visual-cartridge workflow: eight built-in signal presets, custom save/update/clone/rename/delete, favorites, JSON import/export, bypass and hold-original comparison, and project/receipt/manifest persistence. The first-session high-energy settings are preserved as the built-in **Cathedral Resonance** cartridge. Canvas 2D remains authoritative.\n`;
if (!readme.includes('## GPU Cartridge Bay (v0.3.0-alpha)')) readme = readme.replace('\n## Roadmap', `${readmeSection}\n## Roadmap`);
fs.writeFileSync(readmePath, readme);

console.log('GPU Cartridge Bay integration applied.');
