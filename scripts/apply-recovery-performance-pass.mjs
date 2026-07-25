import fs from 'node:fs';

const editorPath = 'src/Auralith369.jsx';
const smokePath = 'tests/e2e/editor-smoke.spec.js';
let source = fs.readFileSync(editorPath, 'utf8');

function replaceOnce(input, before, after, label) {
  const first = input.indexOf(before);
  if (first === -1) throw new Error(`Missing source contract: ${label}`);
  if (input.indexOf(before, first + before.length) !== -1) throw new Error(`Ambiguous source contract: ${label}`);
  return input.slice(0, first) + after + input.slice(first + before.length);
}

source = replaceOnce(
  source,
  'import { clampPixelRegion, sharedPixelRegionSize } from "./lib/pixelRegion.js";\n',
  'import { clampPixelRegion, sharedPixelRegionSize } from "./lib/pixelRegion.js";\nimport { clearRecoverySnapshot, loadRecoverySnapshot, saveRecoverySnapshot } from "./lib/sessionRecovery.js";\n',
  'recovery import'
);

source = replaceOnce(
  source,
  '  const[captionTone,setCaptionTone]=useState("mythic");const[lastManifest,setLastManifest]=useState("");',
  '  const[captionTone,setCaptionTone]=useState("mythic");const[lastManifest,setLastManifest]=useState("");\n  const[recoveryCandidate,setRecoveryCandidate]=useState(null);const[recoverySavedAt,setRecoverySavedAt]=useState("");',
  'recovery state'
);

const renderAnchor = '  const renderCompositeCanvas=useCallback(({checker=0,background=null,split=0}={})=>{const base=document.createElement("canvas");base.width=sz.w;base.height=sz.h;const b=base.getContext("2d");b.clearRect(0,0,sz.w,sz.h);if(background){b.fillStyle=background;b.fillRect(0,0,sz.w,sz.h);}else if(checker)dCk(b,sz.w,sz.h);layers.forEach(l=>{if(!l.vis)return;if(l.kind==="adjustment")applyAdjustmentLayer(base,l);else drawLayerTo(b,l);});const out=document.createElement("canvas");out.width=sz.w;out.height=sz.h;const o=out.getContext("2d");if(background){o.fillStyle=background;o.fillRect(0,0,sz.w,sz.h);}o.filter=adjF;o.drawImage(base,0,0);o.filter="none";if(split&&splitV&&origS.current){const sx=Math.round(sz.w*splitP/100);o.save();o.beginPath();o.rect(0,0,sx,sz.h);o.clip();o.drawImage(origS.current,0,0,sz.w,sz.h);o.restore();o.strokeStyle=C.ac;o.lineWidth=2;o.setLineDash([6,4]);o.beginPath();o.moveTo(sx,0);o.lineTo(sx,sz.h);o.stroke();o.setLineDash([]);o.font="8px "+FN;o.fillStyle=C.ac;o.fillText("BEFORE",sx-42,12);o.fillText("AFTER",sx+4,12);}return out;},[layers,sz,adjF,splitV,splitP]);';
source = replaceOnce(
  source,
  renderAnchor,
  `${renderAnchor}\n  useEffect(()=>{window.__AURALITH_DIAGNOSTICS__={measureComposite:(iterations=1)=>{const count=cl(Math.round(iterations)||1,1,10),durations=[];for(let i=0;i<count;i++){const started=performance.now(),canvas=renderCompositeCanvas({checker:0});durations.push(performance.now()-started);if(canvas.width!==sz.w||canvas.height!==sz.h)throw new Error("Composite size mismatch");}const total=durations.reduce((sum,value)=>sum+value,0);return{size:{...sz},iterations:count,durations,averageMs:total/count,maxMs:Math.max(...durations)};}};return()=>{delete window.__AURALITH_DIAGNOSTICS__;};},[renderCompositeCanvas,sz]);`,
  'performance diagnostics'
);

const oldExport = '  const exportProject=()=>{try{const layerData={},maskData={};Object.keys(ld.current).forEach(k=>{layerData[k]=ld.current[k].toDataURL("image/png")});Object.keys(mks.current).forEach(k=>{maskData[k]=mks.current[k].toDataURL("image/png")});const project={kind:AURALITH_PROJECT_KIND,version:APP_VERSION,savedAt:new Date().toISOString(),constants:{PHI,LAM,Cstar:.809017,OmegaC:.376},name:projectName,size:sz,activeLayer:aL,nextId:nid.current,layers:JSON.parse(JSON.stringify(layers)),layerData,maskData,orig:origS.current?origS.current.toDataURL("image/png"):null,adjustments:adj,overlay:{id:ovl,opacity:oOp},guides,snap:{enabled:!!snapOn,tolerance:snapTol},captionTone,colors:{fg,bg:bg_},text:{txt,tF,tSz,txtFx},batches:savedBatches,versions,quickActions:quickA,dominantColors:domColors};downloadBlob(`${projectName||"auralith369"}.auralith`,"application/json",JSON.stringify(project,null,2));flash("Project saved");}catch(e){console.error(e);flash("Project save failed");}};';
const newExport = '  const buildProjectPayload=useCallback(()=>{const layerData={},maskData={};Object.keys(ld.current).forEach(k=>{layerData[k]=ld.current[k].toDataURL("image/png")});Object.keys(mks.current).forEach(k=>{maskData[k]=mks.current[k].toDataURL("image/png")});return{kind:AURALITH_PROJECT_KIND,version:APP_VERSION,savedAt:new Date().toISOString(),constants:{PHI,LAM,Cstar:.809017,OmegaC:.376},name:projectName,size:sz,activeLayer:aL,nextId:nid.current,layers:JSON.parse(JSON.stringify(layers)),layerData,maskData,orig:origS.current?origS.current.toDataURL("image/png"):null,adjustments:adj,overlay:{id:ovl,opacity:oOp},guides,snap:{enabled:!!snapOn,tolerance:snapTol},captionTone,colors:{fg,bg:bg_},text:{txt,tF,tSz,txtFx},batches:savedBatches,versions,quickActions:quickA,dominantColors:domColors};},[projectName,sz,aL,layers,adj,ovl,oOp,guides,snapOn,snapTol,captionTone,fg,bg_,txt,tF,tSz,txtFx,savedBatches,versions,quickA,domColors]);\n  const exportProject=async()=>{try{const project=buildProjectPayload();downloadBlob(`${projectName||"auralith369"}.auralith`,"application/json",JSON.stringify(project,null,2));await clearRecoverySnapshot().catch(error=>console.warn("[Auralith369] Recovery clear after save failed",error));setRecoverySavedAt("");flash("Project saved");}catch(e){console.error(e);flash("Project save failed");}};';
source = replaceOnce(source, oldExport, newExport, 'project payload builder');

source = replaceOnce(
  source,
  '  const openAsset=file=>{if(!file)return;if(/\\.auralith$/i.test(file.name)||file.type==="application/json")loadProject(file);else loadImg(file);};',
  '  const restoreRecovery=async()=>{if(!recoveryCandidate)return;const file=new File([JSON.stringify(recoveryCandidate.project)],"Recovered Session.auralith",{type:"application/json"});setRecoveryCandidate(null);await loadProject(file);flash("Session recovered");};\n  const discardRecovery=async()=>{await clearRecoverySnapshot().catch(error=>console.warn("[Auralith369] Recovery discard failed",error));setRecoveryCandidate(null);setRecoverySavedAt("");flash("Recovery discarded");};\n  const openAsset=file=>{if(!file)return;if(/\\.auralith$/i.test(file.name)||file.type==="application/json")loadProject(file);else loadImg(file);};',
  'recovery actions'
);

const oldNew = '  const newC=()=>{cancelPendingHistory();ld.current={};mks.current={};origS.current=null;setLayers([{id:1,n:"Background",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(1);nid.current=2;setHasI(0);sOvl("none");sAdj({br:100,ct:100,st:100,hu:0,bl:0,temp:0});setSz({w:1024,h:680});sHist([]);sHP(-1);sHNm([]);histRef.current=[];hPRef.current=-1;hNmRef.current=[];sSel(null);sCrR(null);sPenP([]);setSplitV(0);setCRot(0);setGuides([]);setDomColors([]);setProjectName("auralith-project");setPosterTitle("PHI369");setPosterSub("Sovereign image alchemy");setVersions([]);setSavedBatches([]);setBatchActions([]);setBatchRec(0);setLastReceipt(null);setLastManifest("");setQuickA([]);setCaptionTone("mythic");setTimeout(()=>save("New Canvas"),0);};';
const newNew = '  const newC=()=>{cancelPendingHistory();clearRecoverySnapshot().catch(error=>console.warn("[Auralith369] Recovery clear for new canvas failed",error));setRecoveryCandidate(null);setRecoverySavedAt("");ld.current={};mks.current={};origS.current=null;setLayers([{id:1,n:"Background",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(1);nid.current=2;setHasI(0);sOvl("none");sAdj({br:100,ct:100,st:100,hu:0,bl:0,temp:0});setSz({w:1024,h:680});sHist([]);sHP(-1);sHNm([]);histRef.current=[];hPRef.current=-1;hNmRef.current=[];sSel(null);sCrR(null);sPenP([]);setSplitV(0);setCRot(0);setGuides([]);setDomColors([]);setProjectName("auralith-project");setPosterTitle("PHI369");setPosterSub("Sovereign image alchemy");setVersions([]);setSavedBatches([]);setBatchActions([]);setBatchRec(0);setLastReceipt(null);setLastManifest("");setQuickA([]);setCaptionTone("mythic");setTimeout(()=>save("New Canvas"),0);};';
source = replaceOnce(source, oldNew, newNew, 'new canvas recovery clear');

const keyboardAnchor = '  // Keyboard\n';
const recoveryEffects = '  useEffect(()=>{let active=true;loadRecoverySnapshot().then(candidate=>{if(active&&candidate)setRecoveryCandidate(candidate);}).catch(error=>console.warn("[Auralith369] Recovery lookup unavailable",error));return()=>{active=false;};},[]);\n  useEffect(()=>{if(recoveryCandidate||(hP<1&&!hasI))return;const timer=setTimeout(()=>{try{const project=buildProjectPayload();saveRecoverySnapshot(project).then(envelope=>setRecoverySavedAt(envelope.savedAt)).catch(error=>console.warn("[Auralith369] Recovery save failed",error));}catch(error){console.warn("[Auralith369] Recovery serialization failed",error);}},1600);return()=>clearTimeout(timer);},[hP,hasI,recoveryCandidate,buildProjectPayload]);\n\n';
source = replaceOnce(source, keyboardAnchor, recoveryEffects + keyboardAnchor, 'recovery effects');

const modalAnchor = '    {showK?<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}';
const recoveryModal = '    {recoveryCandidate?<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1200}}><div role="dialog" aria-label="Recover unsaved session" style={{background:C.pn,border:`1px solid ${C.pr}`,borderRadius:8,padding:16,width:360,boxShadow:`0 18px 50px ${C.bk}`}}><div style={{fontSize:12,fontWeight:700,color:C.tx,marginBottom:5}}>Recover unsaved session?</div><div style={{fontSize:8,color:C.td,lineHeight:1.6,marginBottom:10}}>Auralith found a local recovery snapshot from {new Date(recoveryCandidate.savedAt).toLocaleString()}. Restore it or discard it to begin fresh.</div><div style={{display:"flex",gap:6,justifyContent:"flex-end"}}><Bt onClick={discardRecovery} sm>Discard</Bt><button onClick={restoreRecovery} style={{padding:"4px 9px",background:C.ac,color:C.bg,border:"none",borderRadius:3,fontWeight:700,fontFamily:FN,fontSize:7,cursor:"pointer"}}>Recover Session</button></div></div></div>:null}\n\n';
source = replaceOnce(source, modalAnchor, recoveryModal + modalAnchor, 'recovery modal');

source = replaceOnce(
  source,
  '      <span>Auralith369 {APP_VERSION} ∴ PHI369 Labs · Snap:{snapOn?"on":"off"}</span>',
  '      <span data-testid="recovery-state">Auralith369 {APP_VERSION} ∴ PHI369 Labs · Snap:{snapOn?"on":"off"}{recoverySavedAt?" · Recovery saved":""}</span>',
  'recovery status'
);

fs.writeFileSync(editorPath, source);

let smoke = fs.readFileSync(smokePath, 'utf8');
if (!smoke.includes("recovers an unsaved local session after reload")) {
  smoke += `\n\ntest('recovers an unsaved local session after reload', async ({ page }) => {\n  await page.goto('./');\n  await drawStroke(page);\n  await expect(page.getByTestId('recovery-state')).toContainText('Recovery saved', { timeout: 12_000 });\n\n  await page.reload();\n  await expect(page.getByRole('dialog', { name: 'Recover unsaved session' })).toBeVisible();\n  await page.getByRole('button', { name: 'Recover Session' }).click();\n  await expect(page.getByText('Session recovered', { exact: true })).toBeVisible();\n  await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);\n});\n\ntest('Canvas 2D compositor stays inside 1080p and 4K budgets', async ({ page, browserName }) => {\n  test.skip(browserName !== 'chromium', 'Performance budgets use the Chromium CI reference engine.');\n  test.setTimeout(90_000);\n  await page.goto('./');\n\n  const measureAt = async (width, height, iterations) => {\n    await page.getByRole('button', { name: 'Rsz', exact: true }).click();\n    const inputs = page.locator('input[type="number"]');\n    await inputs.nth(0).fill(String(width));\n    await inputs.nth(1).fill(String(height));\n    await page.getByRole('button', { name: 'Apply', exact: true }).click();\n    await expect(page.locator('.auralith-editor-root canvas').first()).toHaveAttribute('width', String(width));\n    return page.evaluate(count => window.__AURALITH_DIAGNOSTICS__.measureComposite(count), iterations);\n  };\n\n  const hd = await measureAt(1920, 1080, 3);\n  expect(hd.averageMs).toBeLessThanOrEqual(500);\n  expect(hd.maxMs).toBeLessThanOrEqual(750);\n\n  const fourK = await measureAt(3840, 2160, 2);\n  expect(fourK.averageMs).toBeLessThanOrEqual(2000);\n  expect(fourK.maxMs).toBeLessThanOrEqual(3000);\n});\n`;
}
fs.writeFileSync(smokePath, smoke);
