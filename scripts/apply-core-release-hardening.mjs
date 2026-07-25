import fs from 'node:fs';

const editorPath = 'src/Auralith369.jsx';
const smokePath = 'tests/e2e/editor-smoke.spec.js';
const gatePath = 'docs/CORE_RELEASE_GATE.md';

let source = fs.readFileSync(editorPath, 'utf8');

function replaceOnce(input, before, after, label) {
  const first = input.indexOf(before);
  if (first === -1) throw new Error(`Missing source contract: ${label}`);
  if (input.indexOf(before, first + before.length) !== -1) {
    throw new Error(`Ambiguous source contract: ${label}`);
  }
  return input.slice(0, first) + after + input.slice(first + before.length);
}

source = replaceOnce(
  source,
  '} from "./lib/auralithProjectSchema.js";\n',
  '} from "./lib/auralithProjectSchema.js";\nimport { clampPixelRegion, sharedPixelRegionSize } from "./lib/pixelRegion.js";\n',
  'pixel region import'
);

source = replaceOnce(
  source,
  '  const historyTimers=useRef(new Set()),histogramTimer=useRef(null);',
  '  const historyTimers=useRef(new Set()),histogramTimer=useRef(null),renderFrameRef=useRef(null);',
  'render frame ref'
);

source = replaceOnce(
  source,
  '  const comp=useCallback(()=>{const mc=mcR.current;if(!mc)return;const rendered=renderCompositeCanvas({checker:1,split:1});mc.width=sz.w;mc.height=sz.h;const ctx=mc.getContext("2d");mc.style.filter="none";ctx.clearRect(0,0,sz.w,sz.h);ctx.drawImage(rendered,0,0);const mm=mnR.current;if(mm){mm.width=100;mm.height=Math.round(100*(sz.h/sz.w));mm.getContext("2d").drawImage(mc,0,0,mm.width,mm.height);}if(histogramTimer.current)clearTimeout(histogramTimer.current);histogramTimer.current=setTimeout(()=>{try{const id=ctx.getImageData(0,0,sz.w,sz.h),rH=new Array(256).fill(0),gH=new Array(256).fill(0),bH=new Array(256).fill(0);for(let i=0;i<id.data.length;i+=4){rH[id.data[i]]++;gH[id.data[i+1]]++;bH[id.data[i+2]]++;}sHistD({r:rH,g:gH,b:bH});}catch(e){}},140);},[renderCompositeCanvas,sz]);\n  useEffect(()=>{comp();},[comp]);',
  '  const renderCompositeFrame=useCallback(()=>{renderFrameRef.current=null;const mc=mcR.current;if(!mc)return;const rendered=renderCompositeCanvas({checker:1,split:1});mc.width=sz.w;mc.height=sz.h;const ctx=mc.getContext("2d");mc.style.filter="none";ctx.clearRect(0,0,sz.w,sz.h);ctx.drawImage(rendered,0,0);const mm=mnR.current;if(mm){mm.width=100;mm.height=Math.round(100*(sz.h/sz.w));mm.getContext("2d").drawImage(mc,0,0,mm.width,mm.height);}if(histogramTimer.current)clearTimeout(histogramTimer.current);histogramTimer.current=setTimeout(()=>{try{const id=ctx.getImageData(0,0,sz.w,sz.h),rH=new Array(256).fill(0),gH=new Array(256).fill(0),bH=new Array(256).fill(0),sampleStep=Math.max(1,Math.ceil((sz.w*sz.h)/262144));for(let i=0;i<id.data.length;i+=4*sampleStep){rH[id.data[i]]++;gH[id.data[i+1]]++;bH[id.data[i+2]]++;}sHistD({r:rH,g:gH,b:bH});}catch(error){console.warn("[Auralith369] Histogram update failed",error);}},180);},[renderCompositeCanvas,sz]);\n  const comp=useCallback(()=>{if(renderFrameRef.current!==null)return;renderFrameRef.current=requestAnimationFrame(renderCompositeFrame);},[renderCompositeFrame]);\n  useEffect(()=>{comp();return()=>{if(renderFrameRef.current!==null)cancelAnimationFrame(renderFrameRef.current);renderFrameRef.current=null;if(histogramTimer.current)clearTimeout(histogramTimer.current);};},[comp]);',
  'frame-scheduled compositor'
);

source = replaceOnce(
  source,
  '  const gP_=(e)=>{const r=mcR.current.getBoundingClientRect();return snapPoint({x:(e.clientX-r.left)*(sz.w/r.width),y:(e.clientY-r.top)*(sz.h/r.height)});};',
  '  const gP_=(e)=>{const r=mcR.current.getBoundingClientRect(),raw={x:(e.clientX-r.left)*(sz.w/r.width),y:(e.clientY-r.top)*(sz.h/r.height)},p=snapPoint(raw);return{x:cl(p.x,0,Math.max(0,sz.w-1)),y:cl(p.y,0,Math.max(0,sz.h-1))};};',
  'pointer clamp'
);

source = replaceOnce(
  source,
  '  const smudgePaint=(ctx,x,y,lx,ly)=>{const r=bSz/2;try{const src=ctx.getImageData(cl(Math.floor(lx-r),0,sz.w-1),cl(Math.floor(ly-r),0,sz.h-1),Math.ceil(bSz),Math.ceil(bSz));const dst=ctx.getImageData(cl(Math.floor(x-r),0,sz.w-1),cl(Math.floor(y-r),0,sz.h-1),Math.ceil(bSz),Math.ceil(bSz));for(let i=0;i<dst.data.length;i+=4){const s=bOp*.5;dst.data[i]=dst.data[i]*(1-s)+src.data[i]*s;dst.data[i+1]=dst.data[i+1]*(1-s)+src.data[i+1]*s;dst.data[i+2]=dst.data[i+2]*(1-s)+src.data[i+2]*s;}ctx.putImageData(dst,cl(Math.floor(x-r),0,sz.w-1),cl(Math.floor(y-r),0,sz.h-1));}catch(e){}};',
  '  const smudgePaint=(ctx,x,y,lx,ly)=>{const r=bSz/2,srcR=clampPixelRegion(lx-r,ly-r,bSz,bSz,sz.w,sz.h),dstR=clampPixelRegion(x-r,y-r,bSz,bSz,sz.w,sz.h),shared=sharedPixelRegionSize(srcR,dstR);if(!shared)return;const src=ctx.getImageData(srcR.x,srcR.y,shared.width,shared.height),dst=ctx.getImageData(dstR.x,dstR.y,shared.width,shared.height);for(let i=0;i<dst.data.length;i+=4){const s=bOp*.5;dst.data[i]=dst.data[i]*(1-s)+src.data[i]*s;dst.data[i+1]=dst.data[i+1]*(1-s)+src.data[i+1]*s;dst.data[i+2]=dst.data[i+2]*(1-s)+src.data[i+2]*s;}ctx.putImageData(dst,dstR.x,dstR.y);};',
  'edge-safe smudge'
);

source = replaceOnce(
  source,
  '  const dodgeBurn=(ctx,x,y,mode)=>{const r=bSz/2,x0=cl(Math.floor(x-r),0,sz.w-1),y0=cl(Math.floor(y-r),0,sz.h-1);try{const id=ctx.getImageData(x0,y0,Math.ceil(bSz),Math.ceil(bSz));const amt=bOp*.15;for(let i=0;i<id.data.length;i+=4){const d=mode==="dodge"?amt*255:-amt*255;id.data[i]=cl(id.data[i]+d,0,255);id.data[i+1]=cl(id.data[i+1]+d,0,255);id.data[i+2]=cl(id.data[i+2]+d,0,255);}ctx.putImageData(id,x0,y0);}catch(e){}};',
  '  const dodgeBurn=(ctx,x,y,mode)=>{const r=bSz/2,region=clampPixelRegion(x-r,y-r,bSz,bSz,sz.w,sz.h);if(!region)return;const id=ctx.getImageData(region.x,region.y,region.width,region.height),amt=bOp*.15;for(let i=0;i<id.data.length;i+=4){const d=mode==="dodge"?amt*255:-amt*255;id.data[i]=cl(id.data[i]+d,0,255);id.data[i+1]=cl(id.data[i+1]+d,0,255);id.data[i+2]=cl(id.data[i+2]+d,0,255);}ctx.putImageData(id,region.x,region.y);};',
  'edge-safe dodge burn'
);

source = replaceOnce(
  source,
  '  const liquify=(ctx,x,y,lx,ly)=>{const r=bSz,dx=(x-lx)*.3,dy=(y-ly)*.3,x0=cl(Math.floor(x-r),0,sz.w-r),y0=cl(Math.floor(y-r),0,sz.h-r);try{const id=ctx.getImageData(x0,y0,r*2,r*2),w=r*2,h=r*2;const out=new Uint8ClampedArray(id.data);for(let py=0;py<h;py++)for(let px=0;px<w;px++){const ddx=px-r,ddy=py-r,dist=Math.sqrt(ddx*ddx+ddy*ddy);if(dist>r)continue;const f=1-dist/r,sx=cl(Math.round(px-dx*f*f),0,w-1),sy=cl(Math.round(py-dy*f*f),0,h-1),di=(py*w+px)*4,si=(sy*w+sx)*4;out[di]=id.data[si];out[di+1]=id.data[si+1];out[di+2]=id.data[si+2];}ctx.putImageData(new ImageData(out,w,h),x0,y0);}catch(e){}};',
  '  const liquify=(ctx,x,y,lx,ly)=>{const r=Math.max(1,Math.round(bSz)),dx=(x-lx)*.3,dy=(y-ly)*.3,region=clampPixelRegion(x-r,y-r,r*2,r*2,sz.w,sz.h);if(!region)return;const id=ctx.getImageData(region.x,region.y,region.width,region.height),w=region.width,h=region.height,cx=x-region.x,cy=y-region.y,out=new Uint8ClampedArray(id.data);for(let py=0;py<h;py++)for(let px=0;px<w;px++){const ddx=px-cx,ddy=py-cy,dist=Math.sqrt(ddx*ddx+ddy*ddy);if(dist>r)continue;const f=1-dist/r,sx=cl(Math.round(px-dx*f*f),0,w-1),sy=cl(Math.round(py-dy*f*f),0,h-1),di=(py*w+px)*4,si=(sy*w+sx)*4;out[di]=id.data[si];out[di+1]=id.data[si+1];out[di+2]=id.data[si+2];out[di+3]=id.data[si+3];}ctx.putImageData(new ImageData(out,w,h),region.x,region.y);};',
  'edge-safe liquify'
);

source = replaceOnce(
  source,
  '  const colorReplace=(ctx,x,y)=>{const r=bSz/2,x0=cl(Math.floor(x-r),0,sz.w-1),y0=cl(Math.floor(y-r),0,sz.h-1);try{const id=ctx.getImageData(x0,y0,Math.ceil(bSz),Math.ceil(bSz));const tc=h2r(replTgt),fc=h2r(fg);for(let i=0;i<id.data.length;i+=4){if(Math.abs(id.data[i]-tc.r)+Math.abs(id.data[i+1]-tc.g)+Math.abs(id.data[i+2]-tc.b)<replTol){id.data[i]=fc.r;id.data[i+1]=fc.g;id.data[i+2]=fc.b;}}ctx.putImageData(id,x0,y0);}catch(e){}};',
  '  const colorReplace=(ctx,x,y)=>{const r=bSz/2,region=clampPixelRegion(x-r,y-r,bSz,bSz,sz.w,sz.h);if(!region)return;const id=ctx.getImageData(region.x,region.y,region.width,region.height),tc=h2r(replTgt),fc=h2r(fg);for(let i=0;i<id.data.length;i+=4){if(Math.abs(id.data[i]-tc.r)+Math.abs(id.data[i+1]-tc.g)+Math.abs(id.data[i+2]-tc.b)<replTol){id.data[i]=fc.r;id.data[i+1]=fc.g;id.data[i+2]=fc.b;}}ctx.putImageData(id,region.x,region.y);};',
  'edge-safe color replace'
);

source = replaceOnce(
  source,
  '    else if(tl==="clone"&&drw.current&&clOff.current){try{const sd=mcR.current.getContext("2d").getImageData(cl(Math.floor(p.x+clOff.current.dx-bSz/2),0,sz.w-1),cl(Math.floor(p.y+clOff.current.dy-bSz/2),0,sz.h-1),bSz,bSz);eLC(aL).getContext("2d").putImageData(sd,cl(Math.floor(p.x-bSz/2),0,sz.w-1),cl(Math.floor(p.y-bSz/2),0,sz.h-1));}catch(e){}lP.current=p;comp();}',
  '    else if(tl==="clone"&&drw.current&&clOff.current){const srcR=clampPixelRegion(p.x+clOff.current.dx-bSz/2,p.y+clOff.current.dy-bSz/2,bSz,bSz,sz.w,sz.h),dstR=clampPixelRegion(p.x-bSz/2,p.y-bSz/2,bSz,bSz,sz.w,sz.h),shared=sharedPixelRegionSize(srcR,dstR);if(shared){const sd=mcR.current.getContext("2d").getImageData(srcR.x,srcR.y,shared.width,shared.height);eLC(aL).getContext("2d").putImageData(sd,dstR.x,dstR.y);}lP.current=p;comp();}',
  'edge-safe clone'
);

source = replaceOnce(
  source,
  'if(e.key==="v"){e.preventDefault();selPst();}',
  'if(e.key==="v"&&clip.current){e.preventDefault();selPst();}',
  'clipboard precedence'
);

fs.writeFileSync(editorPath, source);

let smoke = fs.readFileSync(smokePath, 'utf8');
if (!smoke.includes("edge tools remain operational at all four canvas borders")) {
  smoke += `\n\ntest('edge tools remain operational at all four canvas borders', async ({ page }) => {\n  const errors = collectPageErrors(page);\n  await page.goto('./');\n  const canvas = page.locator('.auralith-editor-root canvas').first();\n  await expect(canvas).toBeVisible();\n  const box = await canvas.boundingBox();\n  if (!box) throw new Error('Main editor canvas has no bounding box.');\n\n  const points = [\n    { x: box.x + 3, y: box.y + 3 },\n    { x: box.x + box.width - 3, y: box.y + 3 },\n    { x: box.x + 3, y: box.y + box.height - 3 },\n    { x: box.x + box.width - 3, y: box.y + box.height - 3 }\n  ];\n\n  for (const tool of ['Smudge (F)', 'Dodge (O)', 'Burn (N)', 'ColSwap (J)', 'Liquify (W)']) {\n    await page.getByTitle(tool).click();\n    for (const point of points) {\n      await page.mouse.move(point.x, point.y);\n      await page.mouse.down();\n      await page.mouse.move(point.x + (point.x < box.x + box.width / 2 ? 4 : -4), point.y, { steps: 2 });\n      await page.mouse.up();\n    }\n  }\n\n  await page.getByTitle('Clone (S)').click();\n  await page.keyboard.down('Alt');\n  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);\n  await page.keyboard.up('Alt');\n  await page.mouse.move(points[0].x, points[0].y);\n  await page.mouse.down();\n  await page.mouse.move(points[0].x + 4, points[0].y + 4, { steps: 2 });\n  await page.mouse.up();\n\n  await expect(page.getByText('Auralith369 runtime error')).toHaveCount(0);\n  expect(errors).toEqual([]);\n});\n`;
}
fs.writeFileSync(smokePath, smoke);

let gate = fs.readFileSync(gatePath, 'utf8');
gate = gate
  .replace('- [ ] Canvas compositing is frame-scheduled and coalesces repeated pointer updates', '- [x] Canvas compositing is frame-scheduled and coalesces repeated pointer updates')
  .replace('- [ ] Edge-region tools work at all four canvas borders without swallowed exceptions', '- [x] Edge-region tools work at all four canvas borders without swallowed exceptions')
  .replace('- [ ] Internal clipboard and operating-system image paste have explicit precedence', '- [x] Internal clipboard and operating-system image paste have explicit precedence');
fs.writeFileSync(gatePath, gate);
