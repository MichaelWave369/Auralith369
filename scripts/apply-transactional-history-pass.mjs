import fs from 'node:fs';

const file = 'src/Auralith369.jsx';
let source = fs.readFileSync(file, 'utf8');

function replaceExact(before, after, label) {
  if (!source.includes(before)) {
    throw new Error(`Patch target not found: ${label}`);
  }
  source = source.replace(before, after);
}

function replaceRegex(pattern, after, label) {
  if (!pattern.test(source)) {
    throw new Error(`Patch target not found: ${label}`);
  }
  source = source.replace(pattern, after);
}

replaceExact(
  `const FN="'IBM Plex Mono',monospace";`,
  `const FN="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace";`,
  'offline font stack'
);

replaceExact(
  `  const[hist,sHist]=useState([]);const[hP,sHP]=useState(-1);const[hNm,sHNm]=useState([]);`,
  `  const[hist,sHist]=useState([]);const[hP,sHP]=useState(-1);const[hNm,sHNm]=useState([]);\n  const histRef=useRef(hist),hPRef=useRef(hP),hNmRef=useRef(hNm),layersRef=useRef(layers),szRef=useRef(sz),aLRef=useRef(aL);\n  histRef.current=hist;hPRef.current=hP;hNmRef.current=hNm;layersRef.current=layers;szRef.current=sz;aLRef.current=aL;\n  const historyTimers=useRef(new Set()),histogramTimer=useRef(null);`,
  'history refs'
);

replaceRegex(
  /  const save=useCallback\(\(name\)=>\{[\s\S]*?  const redo=useCallback\(\(\)=>\{[\s\S]*?\},\[hist,hP\]\);\n/,
  `  const cloneCanvasMap=useCallback(sourceMap=>{const out={};Object.keys(sourceMap||{}).forEach(k=>{const s=sourceMap[k];if(!s)return;const c=document.createElement("canvas");c.width=s.width;c.height=s.height;c.getContext("2d").drawImage(s,0,0);out[k]=c;});return out;},[]);\n  const captureHistorySnapshot=useCallback(()=>({layers:JSON.parse(JSON.stringify(layersRef.current)),data:cloneCanvasMap(ld.current),masks:cloneCanvasMap(mks.current),sz:{...szRef.current},activeLayer:aLRef.current}),[cloneCanvasMap]);\n  const restoreHistorySnapshot=useCallback(snapshot=>{if(!snapshot)return;ld.current=cloneCanvasMap(snapshot.data||{});mks.current=cloneCanvasMap(snapshot.masks||{});const nextLayers=JSON.parse(JSON.stringify(snapshot.layers||[])),nextSize={...(snapshot.sz||{w:1024,h:680})},nextActive=snapshot.activeLayer??nextLayers[0]?.id??1;layersRef.current=nextLayers;szRef.current=nextSize;aLRef.current=nextActive;setLayers(nextLayers);setSz(nextSize);setAL(nextActive);},[cloneCanvasMap]);\n  const cancelPendingHistory=useCallback(()=>{historyTimers.current.forEach(timer=>clearTimeout(timer));historyTimers.current.clear();},[]);\n  const save=useCallback(name=>{if(name&&!['Move','Open','Paste','brush','eraser'].includes(name))setQuickA(p=>[name,...p.filter(x=>x!==name)].slice(0,6));if(batchRec&&name)setBatchActions(p=>[...p,name]);const timer=setTimeout(()=>{historyTimers.current.delete(timer);const snapshot=captureHistorySnapshot(),base=histRef.current.slice(0,hPRef.current+1),names=hNmRef.current.slice(0,hPRef.current+1);base.push(snapshot);names.push(name||'Edit');if(base.length>60){base.shift();names.shift();}const nextIndex=base.length-1;histRef.current=base;hNmRef.current=names;hPRef.current=nextIndex;sHist(base);sHNm(names);sHP(nextIndex);flash(name||'Edit');},0);historyTimers.current.add(timer);},[batchRec,captureHistorySnapshot]);\n  const undo=useCallback(()=>{cancelPendingHistory();const target=hPRef.current-1;if(target<0)return;const snapshot=histRef.current[target];if(!snapshot)return;restoreHistorySnapshot(snapshot);hPRef.current=target;sHP(target);flash('Undo');},[cancelPendingHistory,restoreHistorySnapshot]);\n  const redo=useCallback(()=>{cancelPendingHistory();const target=hPRef.current+1;if(target>=histRef.current.length)return;const snapshot=histRef.current[target];if(!snapshot)return;restoreHistorySnapshot(snapshot);hPRef.current=target;sHP(target);flash('Redo');},[cancelPendingHistory,restoreHistorySnapshot]);\n  useEffect(()=>{if(histRef.current.length===0)save('New Canvas');return cancelPendingHistory;},[]);\n`,
  'transactional history block'
);

replaceRegex(
  /try\{const id=ctx\.getImageData\(0,0,sz\.w,sz\.h\),rH=new Array\(256\)\.fill\(0\),gH=new Array\(256\)\.fill\(0\),bH=new Array\(256\)\.fill\(0\);[\s\S]*?sHistD\(\{r:rH,g:gH,b:bH\}\);\}catch\(e\)\{\}/,
  `if(histogramTimer.current)clearTimeout(histogramTimer.current);histogramTimer.current=setTimeout(()=>{try{const id=ctx.getImageData(0,0,sz.w,sz.h),rH=new Array(256).fill(0),gH=new Array(256).fill(0),bH=new Array(256).fill(0);for(let i=0;i<id.data.length;i+=4){rH[id.data[i]]++;gH[id.data[i+1]]++;bH[id.data[i+2]]++;}sHistD({r:rH,g:gH,b:bH});}catch(e){}},140);`,
  'histogram throttle'
);

replaceExact(
  `    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>\n`,
  ``,
  'external font request'
);

replaceRegex(
  /  const newC=\(\)=>\{[\s\S]*?\};\n  const apRsz=/,
  `  const newC=()=>{cancelPendingHistory();ld.current={};mks.current={};origS.current=null;setLayers([{id:1,n:"Background",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(1);nid.current=2;setHasI(0);sOvl("none");sAdj({br:100,ct:100,st:100,hu:0,bl:0,temp:0});setSz({w:1024,h:680});sHist([]);sHP(-1);sHNm([]);histRef.current=[];hPRef.current=-1;hNmRef.current=[];sSel(null);sCrR(null);sPenP([]);setSplitV(0);setCRot(0);setGuides([]);setDomColors([]);setProjectName("auralith-project");setPosterTitle("PHI369");setPosterSub("Sovereign image alchemy");setVersions([]);setSavedBatches([]);setBatchActions([]);setBatchRec(0);setLastReceipt(null);setLastManifest("");setQuickA([]);setCaptionTone("mythic");setTimeout(()=>save("New Canvas"),0);};\n  const apRsz=`,
  'complete new canvas reset'
);

replaceExact(
  `  const addL=()=>{const id=nid.current++;setLayers(p=>[...p,{id,n:\`Layer \${id}\`,vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(id);};`,
  `  const addL=()=>{const id=nid.current++;setLayers(p=>[...p,{id,n:\`Layer \${id}\`,vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(id);save("Add Layer");};`,
  'add layer history'
);

replaceExact(
  `  const dupL=lid=>{const id=nid.current++;const s=ld.current[lid];if(s){const c=document.createElement("canvas");c.width=s.width;c.height=s.height;c.getContext("2d").drawImage(s,0,0);ld.current[id]=c;}const o=layers.find(l=>l.id===lid);setLayers(p=>[...p,{...JSON.parse(JSON.stringify(o)),id,n:(o?.n||"L")+" copy"}]);setAL(id);};`,
  `  const dupL=lid=>{const id=nid.current++;const s=ld.current[lid];if(s){const c=document.createElement("canvas");c.width=s.width;c.height=s.height;c.getContext("2d").drawImage(s,0,0);ld.current[id]=c;}const o=layers.find(l=>l.id===lid);setLayers(p=>[...p,{...JSON.parse(JSON.stringify(o)),id,n:(o?.n||"L")+" copy"}]);setAL(id);save("Duplicate Layer");};`,
  'duplicate layer history'
);

replaceExact(
  `  const delL=id=>{if(layers.length<=1)return;setLayers(p=>p.filter(l=>l.id!==id));delete ld.current[id];if(aL===id)setAL(layers.find(l=>l.id!==id)?.id||1);setTimeout(comp,20);};`,
  `  const delL=id=>{if(layers.length<=1)return;setLayers(p=>p.filter(l=>l.id!==id));delete ld.current[id];delete mks.current[id];if(aL===id)setAL(layers.find(l=>l.id!==id)?.id||1);setTimeout(comp,20);save("Delete Layer");};`,
  'delete layer history'
);

replaceExact(
  `  const togMask=id=>{const l=layers.find(x=>x.id===id);if(!l.mask){eMk(id);setLayers(p=>p.map(x=>x.id===id?{...x,mask:1}:x));}else{setLayers(p=>p.map(x=>x.id===id?{...x,mask:0}:x));delete mks.current[id];}comp();};`,
  `  const togMask=id=>{const l=layers.find(x=>x.id===id);if(!l.mask){eMk(id);setLayers(p=>p.map(x=>x.id===id?{...x,mask:1}:x));}else{setLayers(p=>p.map(x=>x.id===id?{...x,mask:0}:x));delete mks.current[id];}comp();save(l?.mask?"Remove Mask":"Add Mask");};`,
  'mask history'
);

replaceRegex(
  /onClick=\{\(\)=>\{const s=hist\[i\];if\(!s\)return;ld\.current=\{\};Object\.keys\(s\.data\)\.forEach\(k=>\{const c=document\.createElement\("canvas"\);c\.width=s\.data\[k\]\.width;c\.height=s\.data\[k\]\.height;c\.getContext\("2d"\)\.drawImage\(s\.data\[k\],0,0\);ld\.current\[k\]=c;\}\);setLayers\(s\.layers\);setSz\(s\.sz\);sHP\(i\);\}\}/,
  `onClick={()=>{const s=hist[i];if(!s)return;cancelPendingHistory();restoreHistorySnapshot(s);hPRef.current=i;sHP(i);flash("History: "+nm);}}`,
  'history palette restore'
);

if (!source.includes('transactional history block') && !source.includes('captureHistorySnapshot')) {
  throw new Error('History patch did not produce expected marker.');
}

fs.writeFileSync(file, source);
console.log('Applied transactional history, mask restoration, histogram throttling, and offline font changes.');
