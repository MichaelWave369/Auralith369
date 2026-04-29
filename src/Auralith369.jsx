// Auralith369 v0.1.0-alpha — local-first visual alchemy by PHI369 Labs
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  validateAuralithProject,
  normalizeAuralithProject
} from "./lib/auralithProjectSchema.js";

const APP_VERSION="v0.1.0-alpha";
const PHI=1.618033988749895,LAM=0.618033988749895;
const C={bg:"#050910",pn:"#090e1b",pa:"#0b1120",bd:"#121a2f",srf:"#0d142c",sh:"#121b3a",sa:"#172249",ac:"#00d4aa",ad:"#00a88622",ag:"#00d4aa10",gd:"#d4a017",pr:"#8b5cf6",rd:"#ef4444",bl:"#3b82f6",gn:"#10b981",cy:"#06b6d4",pk:"#ec4899",or:"#f97316",tx:"#e2e8f0",td:"#7085a8",tm:"#3a4c66",wh:"#fff",bk:"#000"};
const FN="'IBM Plex Mono',monospace";
const h2r=h=>({r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)});
const r2h=(r,g,b)=>"#"+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const hsl2r=(h,s,l)=>{s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];};
const apK=(s,k,w,h)=>{const d=new Uint8ClampedArray(s.length),ks=Math.sqrt(k.length)|0,hl=(ks/2)|0,kS=k.reduce((a,b)=>a+b,0)||1;for(let y=0;y<h;y++)for(let x=0;x<w;x++){let rv=0,gv=0,bv=0;for(let ky=0;ky<ks;ky++)for(let kx=0;kx<ks;kx++){const sx=cl(x+kx-hl,0,w-1),sy=cl(y+ky-hl,0,h-1),si=(sy*w+sx)*4,kv=k[ky*ks+kx];rv+=s[si]*kv;gv+=s[si+1]*kv;bv+=s[si+2]*kv;}const di=(y*w+x)*4;d[di]=cl(rv/kS,0,255);d[di+1]=cl(gv/kS,0,255);d[di+2]=cl(bv/kS,0,255);d[di+3]=s[di+3];}return d;};

// ─── All filters ───
const PF={
  sharpen:{n:"Sharpen",c:"⚡",fn:(d,w,h)=>apK(d,[0,-1,0,-1,5,-1,0,-1,0],w,h)},
  edge:{n:"Edge Detect",c:"◫",fn:(d,w,h)=>apK(d,[-1,-1,-1,-1,8,-1,-1,-1,-1],w,h)},
  emboss:{n:"Emboss",c:"◈",fn:(d,w,h)=>{const r=new Uint8ClampedArray(d.length),k=[-2,-1,0,-1,1,1,0,1,2];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let rv=128,gv=128,bv=128;for(let ky=0;ky<3;ky++)for(let kx=0;kx<3;kx++){const sx=cl(x+kx-1,0,w-1),sy=cl(y+ky-1,0,h-1),si=(sy*w+sx)*4,kv=k[ky*3+kx];rv+=d[si]*kv;gv+=d[si+1]*kv;bv+=d[si+2]*kv;}const di=(y*w+x)*4;r[di]=cl(rv,0,255);r[di+1]=cl(gv,0,255);r[di+2]=cl(bv,0,255);r[di+3]=d[di+3];}return r;}},
  gblur:{n:"Gaussian Blur",c:"○",fn:(d,w,h)=>apK(d,[1,2,1,2,4,2,1,2,1],w,h)},
  poster:{n:"Posterize",c:"▦",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){const l=6;r[i]=Math.round(r[i]/255*(l-1))/(l-1)*255;r[i+1]=Math.round(r[i+1]/255*(l-1))/(l-1)*255;r[i+2]=Math.round(r[i+2]/255*(l-1))/(l-1)*255;}return r;}},
  noise:{n:"Add Noise",c:"▒",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){const n=(Math.random()-.5)*55;r[i]=cl(r[i]+n,0,255);r[i+1]=cl(r[i+1]+n,0,255);r[i+2]=cl(r[i+2]+n,0,255);}return r;}},
  thresh:{n:"Threshold",c:"◑",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){const v=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)>128?255:0;r[i]=r[i+1]=r[i+2]=v;}return r;}},
  vig:{n:"Vignette",c:"◉",fn:(d,w,h)=>{const r=new Uint8ClampedArray(d);const cx=w/2,cy=h/2,md=Math.sqrt(cx*cx+cy*cy);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ds=Math.sqrt((x-cx)**2+(y-cy)**2)/md,f=1-ds*ds*.8,i=(y*w+x)*4;r[i]*=f;r[i+1]*=f;r[i+2]*=f;}return r;}},
  solar:{n:"Solarize",c:"☀",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=r[i]>128?255-r[i]:r[i];r[i+1]=r[i+1]>128?255-r[i+1]:r[i+1];r[i+2]=r[i+2]>128?255-r[i+2]:r[i+2];}return r;}},
  usm:{n:"Unsharp Mask",c:"◇",fn:(d,w,h)=>{const bl=apK(d,[1,2,1,2,4,2,1,2,1],w,h),r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=cl(d[i]+(d[i]-bl[i])*1.5,0,255);r[i+1]=cl(d[i+1]+(d[i+1]-bl[i+1])*1.5,0,255);r[i+2]=cl(d[i+2]+(d[i+2]-bl[i+2])*1.5,0,255);}return r;}},
  phiC:{n:"Φ Colorize",c:"Φ",fn:d=>{const r=new Uint8ClampedArray(d),tc=h2r("#00d4aa");for(let i=0;i<r.length;i+=4){const lum=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255;r[i]=cl(tc.r*lum,0,255);r[i+1]=cl(tc.g*lum,0,255);r[i+2]=cl(tc.b*lum,0,255);}return r;}},
  pix:{n:"Pixelate",c:"▤",fn:(d,w,h)=>{const r=new Uint8ClampedArray(d),bs=8;for(let by=0;by<h;by+=bs)for(let bx=0;bx<w;bx+=bs){let tr=0,tg=0,tb=0,cnt=0;for(let y=by;y<Math.min(by+bs,h);y++)for(let x=bx;x<Math.min(bx+bs,w);x++){const i=(y*w+x)*4;tr+=d[i];tg+=d[i+1];tb+=d[i+2];cnt++;}tr/=cnt;tg/=cnt;tb/=cnt;for(let y=by;y<Math.min(by+bs,h);y++)for(let x=bx;x<Math.min(bx+bs,w);x++){const i=(y*w+x)*4;r[i]=tr;r[i+1]=tg;r[i+2]=tb;}}return r;}},
  autoLvl:{n:"Auto Levels",c:"⊞",fn:d=>{const r=new Uint8ClampedArray(d);let mnR=255,mxR=0,mnG=255,mxG=0,mnB=255,mxB=0;for(let i=0;i<d.length;i+=4){mnR=Math.min(mnR,d[i]);mxR=Math.max(mxR,d[i]);mnG=Math.min(mnG,d[i+1]);mxG=Math.max(mxG,d[i+1]);mnB=Math.min(mnB,d[i+2]);mxB=Math.max(mxB,d[i+2]);}const rn=(a,b)=>b-a||1;for(let i=0;i<r.length;i+=4){r[i]=cl((d[i]-mnR)/rn(mnR,mxR)*255,0,255);r[i+1]=cl((d[i+1]-mnG)/rn(mnG,mxG)*255,0,255);r[i+2]=cl((d[i+2]-mnB)/rn(mnB,mxB)*255,0,255);}return r;}},
  autoCt:{n:"Auto Contrast",c:"⊡",fn:d=>{const r=new Uint8ClampedArray(d);let mn=255,mx=0;for(let i=0;i<d.length;i+=4){const l=d[i]*.299+d[i+1]*.587+d[i+2]*.114;mn=Math.min(mn,l);mx=Math.max(mx,l);}const rn=mx-mn||1;for(let i=0;i<r.length;i+=4){r[i]=cl((d[i]-mn)/rn*255,0,255);r[i+1]=cl((d[i+1]-mn)/rn*255,0,255);r[i+2]=cl((d[i+2]-mn)/rn*255,0,255);}return r;}},
  warm:{n:"Warm",c:"🔥",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=cl(d[i]+20,0,255);r[i+2]=cl(d[i+2]-15,0,255);}return r;}},
  cool:{n:"Cool",c:"❄",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=cl(d[i]-15,0,255);r[i+2]=cl(d[i+2]+20,0,255);}return r;}},
  phiD:{n:"Φ Dither",c:"∴",fn:(d,w,h)=>{const r=new Uint8ClampedArray(d),st=Math.round(PHI*16);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,lum=r[i]*.299+r[i+1]*.587+r[i+2]*.114;r[i]=r[i+1]=r[i+2]=lum>((x*st+y*st*3)%255)?255:0;}return r;}},
};

// ─── Gradient Maps ───
const GRAD_MAPS=[
  {n:"Teal→Gold",stops:[[0,"#00d4aa"],[1,"#d4a017"]]},
  {n:"Blue→Orange",stops:[[0,"#1e3a5f"],[0.5,"#3b82f6"],[1,"#f97316"]]},
  {n:"Purple→Pink",stops:[[0,"#4c1d95"],[1,"#ec4899"]]},
  {n:"B&W",stops:[[0,"#000000"],[1,"#ffffff"]]},
  {n:"Cyan→Red",stops:[[0,"#06b6d4"],[0.5,"#fafafa"],[1,"#ef4444"]]},
  {n:"Φ Aura",stops:[[0,"#0a0e1a"],[0.38,"#00d4aa"],[0.62,"#8b5cf6"],[1,"#d4a017"]]},
  {n:"Sunset",stops:[[0,"#1a1a2e"],[0.3,"#e94560"],[0.6,"#f97316"],[1,"#fcd34d"]]},
  {n:"Forest",stops:[[0,"#0a1a0a"],[0.5,"#10b981"],[1,"#d4f4dd"]]},
];

// ─── Cinematic LUT Presets ───
const LUTS=[
  {n:"Teal & Orange",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){const lum=d[i]*.299+d[i+1]*.587+d[i+2]*.114;if(lum<128){r[i]=cl(d[i]*.7,0,255);r[i+1]=cl(d[i+1]*1.1,0,255);r[i+2]=cl(d[i+2]*1.3,0,255);}else{r[i]=cl(d[i]*1.2+15,0,255);r[i+1]=cl(d[i+1]*.95,0,255);r[i+2]=cl(d[i+2]*.7,0,255);}}return r;}},
  {n:"Blade Runner",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=cl(d[i]*1.1+10,0,255);r[i+1]=cl(d[i+1]*.85,0,255);r[i+2]=cl(d[i+2]*1.4,0,255);}return r;}},
  {n:"Vintage Film",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=cl(d[i]*1.05+15,0,255);r[i+1]=cl(d[i+1]*.95+10,0,255);r[i+2]=cl(d[i+2]*.85+5,0,255);const lum=r[i]*.299+r[i+1]*.587+r[i+2]*.114;r[i]=cl(r[i]*.85+lum*.15,0,255);r[i+1]=cl(r[i+1]*.85+lum*.15,0,255);r[i+2]=cl(r[i+2]*.85+lum*.15,0,255);}return r;}},
  {n:"Matrix",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){const lum=d[i]*.299+d[i+1]*.587+d[i+2]*.114;r[i]=cl(lum*.2,0,255);r[i+1]=cl(lum*1.1+10,0,255);r[i+2]=cl(lum*.15,0,255);}return r;}},
  {n:"Moonlight",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=cl(d[i]*.8,0,255);r[i+1]=cl(d[i+1]*.85+5,0,255);r[i+2]=cl(d[i+2]*1.2+15,0,255);}return r;}},
  {n:"Golden Hour",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=cl(d[i]*1.15+20,0,255);r[i+1]=cl(d[i+1]*1.05+10,0,255);r[i+2]=cl(d[i+2]*.75,0,255);}return r;}},
];

// ─── Plugins ───
const PLUGINS=[
  {id:"p_half",name:"Halftone",author:"PHI369",desc:"Dot pattern",fn:(d,w,h)=>{const r=new Uint8ClampedArray(d),dot=6;for(let by=0;by<h;by+=dot)for(let bx=0;bx<w;bx+=dot){let sum=0,cnt=0;for(let y=by;y<Math.min(by+dot,h);y++)for(let x=bx;x<Math.min(bx+dot,w);x++){sum+=d[(y*w+x)*4]*.299+d[(y*w+x)*4+1]*.587+d[(y*w+x)*4+2]*.114;cnt++;}const avg=sum/cnt,rad=((255-avg)/255)*(dot/2),cx=bx+dot/2,cy=by+dot/2;for(let y=by;y<Math.min(by+dot,h);y++)for(let x=bx;x<Math.min(bx+dot,w);x++){const i=(y*w+x)*4;r[i]=r[i+1]=r[i+2]=Math.sqrt((x-cx)**2+(y-cy)**2)<=rad?0:255;}}return r;}},
  {id:"p_duo",name:"Duotone Φ",author:"PHI369",desc:"Teal/Gold map",fn:d=>{const r=new Uint8ClampedArray(d),c1=h2r("#00d4aa"),c2=h2r("#d4a017");for(let i=0;i<r.length;i+=4){const t=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255;r[i]=c1.r*(1-t)+c2.r*t;r[i+1]=c1.g*(1-t)+c2.g*t;r[i+2]=c1.b*(1-t)+c2.b*t;}return r;}},
  {id:"p_glitch",name:"Glitch",author:"PHI369",desc:"RGB shift + scan",fn:(d,w,h)=>{const r=new Uint8ClampedArray(d),sh=Math.round(w*.02);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;r[i]=d[(y*w+cl(x+sh,0,w-1))*4];r[i+1]=d[i+1];r[i+2]=d[(y*w+cl(x-sh,0,w-1))*4+2];if(y%3===0){r[i]*=.7;r[i+1]*=.7;r[i+2]*=.7;}r[i+3]=d[i+3];}return r;}},
  {id:"p_xproc",name:"Cross Process",author:"PHI369",desc:"Film cross-process",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){r[i]=cl(d[i]*1.1+15,0,255);r[i+1]=cl(d[i+1]*.9+10,0,255);r[i+2]=cl(d[i+2]*1.2-10,0,255);}return r;}},
  {id:"p_ir",name:"Infrared",author:"PHI369",desc:"False IR color",fn:d=>{const r=new Uint8ClampedArray(d);for(let i=0;i<r.length;i+=4){const lum=d[i]*.299+d[i+1]*.587+d[i+2]*.114;r[i]=cl(d[i+1]*1.4,0,255);r[i+1]=cl(lum*.6,0,255);r[i+2]=cl(d[i]*.8+50,0,255);}return r;}},
];

// ─── Auralith369 v0.1.0-alpha creator system presets ───
const STYLE_CARDS=[
  {id:"phi_forge",n:"Φ Forge",desc:"Clean teal/gold mythic grade",fg:"#00d4aa",bg:"#0a0e1a",adj:{br:108,ct:118,st:116,hu:0,bl:0,temp:8},ovl:"phi",oOp:.42,lut:"Golden Hour",grad:"Φ Aura"},
  {id:"cinema_369",n:"369 Cinema",desc:"High-contrast sacred grid finish",fg:"#8b5cf6",bg:"#050910",adj:{br:96,ct:132,st:124,hu:0,bl:0,temp:-6},ovl:"369",oOp:.36,lut:"Blade Runner",plugin:"Glitch"},
  {id:"analog_oracle",n:"Analog Oracle",desc:"Soft vintage ritual film",fg:"#d4a017",bg:"#1a1a2e",adj:{br:105,ct:106,st:92,hu:0,bl:.4,temp:16},ovl:"spiral",oOp:.3,lut:"Vintage Film",plugin:"Halftone"},
  {id:"noir_signal",n:"Noir Signal",desc:"Cool moonlit transmission",fg:"#06b6d4",bg:"#050910",adj:{br:86,ct:145,st:78,hu:0,bl:0,temp:-18},ovl:"thirds",oOp:.25,lut:"Moonlight",grad:"B&W"},
  {id:"mythic_poster",n:"Mythic Poster",desc:"Punchy poster-ready alchemy",fg:"#f97316",bg:"#090e1b",adj:{br:112,ct:128,st:140,hu:0,bl:0,temp:12},ovl:"phi",oOp:.5,lut:"Teal & Orange",grad:"Teal→Gold"}
];
const POSTER_PRESETS=[
  {id:"square",n:"Square",w:1080,h:1080,desc:"1:1 social post"},
  {id:"portrait",n:"Portrait",w:1080,h:1350,desc:"4:5 feed poster"},
  {id:"story",n:"Story",w:1080,h:1920,desc:"9:16 story/reel cover"},
  {id:"wide",n:"Wide",w:1920,h:1080,desc:"16:9 thumbnail/cinema"},
  {id:"print",n:"Print",w:2400,h:3600,desc:"2:3 print master"}
];
const AURALITH_PROJECT_KIND="auralith.project";
const ADJ_LAYER_PRESETS=[
  {id:"soft_phi",n:"Soft Φ Look",desc:"Clean non-destructive teal/gold polish",adj:{br:106,ct:112,st:112,hu:0,bl:0,temp:8,vignette:.18,tint:"#00d4aa",tintOp:.05}},
  {id:"deep_noir",n:"Deep Noir",desc:"Hard contrast, cooler shadows, cinematic falloff",adj:{br:88,ct:138,st:82,hu:0,bl:0,temp:-18,vignette:.35,tint:"#06b6d4",tintOp:.04}},
  {id:"gold_oracle",n:"Gold Oracle",desc:"Warm print finish for posters and covers",adj:{br:110,ct:118,st:126,hu:0,bl:0,temp:18,vignette:.22,tint:"#d4a017",tintOp:.08}},
  {id:"dream_bloom",n:"Dream Bloom",desc:"Soft blur aura with lifted color",adj:{br:112,ct:96,st:132,hu:0,bl:.6,temp:6,vignette:.12,tint:"#8b5cf6",tintOp:.06}}
];
const SOCIAL_EXPORTS=[
  {id:"ig_square",n:"IG Square",w:1080,h:1080},
  {id:"ig_portrait",n:"IG Portrait",w:1080,h:1350},
  {id:"story",n:"Story/Reel",w:1080,h:1920},
  {id:"yt_thumb",n:"YouTube Thumb",w:1280,h:720},
  {id:"x_wide",n:"X Wide",w:1600,h:900}
];
const CAPTION_TONES={
  mythic:"A sovereign image forged through Φ/369 composition, color resonance, and layered visual alchemy.",
  clean:"An Auralith369 composition tuned with balanced contrast, structured color, and export-ready geometry.",
  playful:"A little Φ, a little 369, and a whole lot of visual mischief from the PHI369 forge.",
  studio:"Edited in Auralith369 with layered adjustments, deterministic project metadata, and PHI369 creative receipts."
};

// Content-aware fill
const caFill=(ctx,sel,w,h)=>{if(!sel)return;const{x:sx,y:sy,w:sw,h:sh}=sel;const pad=Math.max(12,Math.round(Math.min(sw,sh)*.3));const id=ctx.getImageData(0,0,w,h);const d=id.data;const samples=[];for(let y=Math.max(0,sy-pad);y<Math.min(h,sy+sh+pad);y++)for(let x=Math.max(0,sx-pad);x<Math.min(w,sx+sw+pad);x++){if(x>=sx&&x<sx+sw&&y>=sy&&y<sy+sh)continue;const i=(y*w+x)*4;samples.push({r:d[i],g:d[i+1],b:d[i+2]});}if(!samples.length)return;for(let y=sy;y<Math.min(sy+sh,h);y++)for(let x=sx;x<Math.min(sx+sw,w);x++){const nx=cl(x<sx+sw/2?sx-1-Math.floor(Math.random()*pad):sx+sw+Math.floor(Math.random()*pad),0,w-1);const ny=cl(y<sy+sh/2?sy-1-Math.floor(Math.random()*pad):sy+sh+Math.floor(Math.random()*pad),0,h-1);const si=(ny*w+nx)*4,di=(y*w+x)*4;const s2=samples[Math.floor(Math.random()*samples.length)];const t=.6+Math.random()*.4;d[di]=cl(d[si]*t+s2.r*(1-t),0,255);d[di+1]=cl(d[si+1]*t+s2.g*(1-t),0,255);d[di+2]=cl(d[si+2]*t+s2.b*(1-t),0,255);}for(let p=0;p<2;p++)for(let y=Math.max(1,sy);y<Math.min(h-1,sy+sh);y++)for(let x=Math.max(1,sx);x<Math.min(w-1,sx+sw);x++){if(x>sx+1&&x<sx+sw-2&&y>sy+1&&y<sy+sh-2)continue;const i=(y*w+x)*4;let r=0,g=0,b=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const ni=((y+dy)*w+(x+dx))*4;r+=d[ni];g+=d[ni+1];b+=d[ni+2];}d[i]=r/9;d[i+1]=g/9;d[i+2]=b/9;}ctx.putImageData(id,0,0);};
const spotHeal=(ctx,x,y,rad,w,h)=>{const r=Math.round(rad);const id=ctx.getImageData(0,0,w,h);const d=id.data;const samples=[];const or=r+Math.max(4,Math.round(r*.5));for(let dy=-or;dy<=or;dy++)for(let dx=-or;dx<=or;dx++){const dist=Math.sqrt(dx*dx+dy*dy);if(dist<r||dist>or)continue;const px=cl(Math.floor(x+dx),0,w-1),py=cl(Math.floor(y+dy),0,h-1);const si=(py*w+px)*4;samples.push({r:d[si],g:d[si+1],b:d[si+2]});}if(!samples.length)return;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.sqrt(dx*dx+dy*dy)>r)continue;const px=cl(Math.floor(x+dx),0,w-1),py=cl(Math.floor(y+dy),0,h-1);const di=(py*w+px)*4;const s=samples[Math.floor(Math.random()*samples.length)];const fade=1-Math.sqrt(dx*dx+dy*dy)/r;d[di]=cl(d[di]*(1-fade)+s.r*fade,0,255);d[di+1]=cl(d[di+1]*(1-fade)+s.g*fade,0,255);d[di+2]=cl(d[di+2]*(1-fade)+s.b*fade,0,255);}ctx.putImageData(id,0,0);};

const TLS=[{id:"brush",ic:"🖌",k:"B",n:"Brush"},{id:"eraser",ic:"🧹",k:"E",n:"Eraser"},{id:"smudge",ic:"👆",k:"F",n:"Smudge"},{id:"dodge",ic:"◐",k:"O",n:"Dodge"},{id:"burn",ic:"◑",k:"N",n:"Burn"},{id:"heal",ic:"🩹",k:"H",n:"Heal"},{id:"colorReplace",ic:"🔄",k:"J",n:"ColSwap"},{id:"clone",ic:"🔘",k:"S",n:"Clone"},{id:"liquify",ic:"💧",k:"W",n:"Liquify"},{id:"fill",ic:"🪣",k:"G",n:"Fill"},{id:"caFill",ic:"✨",k:"A",n:"CA Fill"},{id:"gradient",ic:"◧",k:"D",n:"Gradient"},{id:"shape",ic:"□",k:"U",n:"Shape"},{id:"text",ic:"T",k:"T",n:"Text"},{id:"pen",ic:"✒",k:"P",n:"Pen"},{id:"picker",ic:"🎨",k:"I",n:"Picker"},{id:"ruler",ic:"📏",k:"Q",n:"Ruler"},{id:"select",ic:"⬚",k:"M",n:"Select"},{id:"lasso",ic:"⛏",k:"L",n:"Lasso"},{id:"wand",ic:"✨",k:"K",n:"Wand"},{id:"transform",ic:"⟲",k:"R",n:"Xform"},{id:"move",ic:"✥",k:"V",n:"Move"},{id:"crop",ic:"✂",k:"C",n:"Crop"}];
const BLN=["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion"];
const SHP=["rect","circle","line","triangle","star","hex"];
const BRS=[{n:"Pencil",sz:2,op:1,hd:1},{n:"Brush",sz:14,op:.85,hd:.55},{n:"Soft",sz:32,op:.35,hd:.08},{n:"Air",sz:44,op:.12,hd:.04},{n:"Marker",sz:18,op:.7,hd:.9},{n:"Eraser",sz:22,op:1,hd:.7,er:1},{n:"Φ",sz:50,op:.9,hd:1,st:1}];
const GRD=["linear","radial","conic"];
const SYM=[{n:"Off",v:0},{n:"2×",v:2},{n:"4×",v:4},{n:"8×",v:8}];

const Sl=({l,v,mn,mx,s,ch,u,c})=>(<div style={{marginBottom:2}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:6.5,color:C.td}}>{l}</span><span style={{fontSize:6.5,color:c||C.ac}}>{s&&s<1?v.toFixed(1):Math.round(v)}{u||""}</span></div><input type="range" min={mn} max={mx} step={s||1} value={v} onChange={e=>ch(+e.target.value)} style={{width:"100%",height:2,appearance:"none",background:`linear-gradient(90deg,${(c||C.ac)+"35"} 0%,${c||C.ac} ${((v-mn)/(mx-mn))*100}%,${C.srf} ${((v-mn)/(mx-mn))*100}%)`,borderRadius:1,outline:"none",cursor:"pointer"}}/></div>);
const Hd=({children,ic})=>(<div style={{fontSize:6,color:C.tm,textTransform:"uppercase",letterSpacing:1.5,marginBottom:2,marginTop:5,display:"flex",alignItems:"center",gap:2}}>{ic&&<span style={{fontSize:7}}>{ic}</span>}{children}</div>);
const Bt=({a,children,onClick,style:s,title:t,sm})=>(<button title={t} onClick={onClick} style={{padding:sm?"1px 3px":"2px 4px",background:a?C.ad:"transparent",color:a?C.ac:C.td,border:`1px solid ${a?C.ac+"35":"transparent"}`,borderRadius:2,cursor:"pointer",fontSize:sm?6:7,fontFamily:FN,whiteSpace:"nowrap",...s}}>{children}</button>);

export default function Auralith369(){
  const mcR=useRef(null),olR=useRef(null),mnR=useRef(null),fR=useRef(null);
  const[sz,setSz]=useState({w:1024,h:680});const[zm,setZm]=useState(1);const[hasI,setHasI]=useState(0);const[drOv,setDrOv]=useState(0);const[cRot,setCRot]=useState(0);
  const[layers,setLayers]=useState([{id:1,n:"Background",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{shadow:0,shadowBlur:8,shadowX:4,shadowY:4,glow:0,glowSize:6}}]);
  const[aL,setAL]=useState(1);const ld=useRef({}),mks=useRef({}),nid=useRef(2);
  const dfx={shadow:0,shadowBlur:8,shadowX:4,shadowY:4,glow:0,glowSize:6};
  const[tl,setTl]=useState("brush");const[bI,setBI]=useState(1);const[bSz,setBSz]=useState(14);const[bOp,setBOp]=useState(.85);const[bHd,setBHd]=useState(.55);
  const[fg,setFg]=useState("#00d4aa");const[bg_,setBgC]=useState("#0a0e1a");const[symM,setSymM]=useState(0);const[scatter,setScatter]=useState(0);
  const[txt,sTxt]=useState("PHI369");const[tF,sTF]=useState("'IBM Plex Mono',monospace");const[tSz,sTSz]=useState(36);const[plc,sPlc]=useState(0);
  const[txtFx,setTxtFx]=useState({stroke:0,strokeW:2,strokeC:"#ffffff",shadow:0,shadowB:4,gradient:0});
  const[shp,sShp]=useState("rect");const[shpF,sShpF]=useState(1);const[shpW,sShpW]=useState(2);const shpS=useRef(null);const[shpP,sShpP]=useState(null);
  const[gT,sGT]=useState("linear");const gS=useRef(null);const[gPr,sGPr]=useState(null);
  const[clSrc,sClSrc]=useState(null);const clOff=useRef(null);const[penP,sPenP]=useState([]);
  const[xfing,sXfing]=useState(0);const[xfA,sXfA]=useState(0);const[xfSc,sXfSc]=useState(100);
  const[ovl,sOvl]=useState("none");const[oOp,sOOp]=useState(.5);
  const[adj,sAdj]=useState({br:100,ct:100,st:100,hu:0,bl:0,temp:0});const setA=(k,v)=>sAdj(p=>({...p,[k]:v}));
  const[curvP,sCurvP]=useState([{x:0,y:0},{x:85,y:85},{x:170,y:170},{x:255,y:255}]);const dcI=useRef(null);
  const[rT,sRT]=useState("layers");const[showK,sShowK]=useState(0);const[eMask,sEMask]=useState(0);
  const[eF,sEF]=useState("PNG");const[eQ,sEQ]=useState(92);
  const drw=useRef(0);const lP=useRef(null);
  const[hist,sHist]=useState([]);const[hP,sHP]=useState(-1);const[hNm,sHNm]=useState([]);
  const[sel,sSel]=useState(null);const selS=useRef(null);const[selFeather,setSelFeather]=useState(0);
  const[crR,sCrR]=useState(null);const crSt=useRef(null);
  const mvS=useRef(null),mvSn=useRef(null);const clip=useRef(null);const[histD,sHistD]=useState(null);
  const[showR,sShowR]=useState(0);const[rW,sRW]=useState(1024);const[rH_,sRH]=useState(680);
  const[splitV,setSplitV]=useState(0);const[splitP,setSplitP]=useState(50);const origS=useRef(null);
  const lassoP=useRef([]);const[lassoPts,setLassoPts]=useState([]);const[lassoM,setLassoM]=useState(0);
  const[wandTol,setWandTol]=useState(32);const[replTgt,setReplTgt]=useState("#000000");const[replTol,setReplTol]=useState(40);
  const[quickA,setQuickA]=useState([]);const[status,setStatus]=useState("");
  const[layerSearch,setLayerSearch]=useState("");
  const[guides,setGuides]=useState([]);// {type:'h'|'v', pos: number}
  const[rulerStart,setRulerStart]=useState(null);const[rulerEnd,setRulerEnd]=useState(null);
  const[batchRec,setBatchRec]=useState(0);const[batchActions,setBatchActions]=useState([]);const[savedBatches,setSavedBatches]=useState([]);
  const[domColors,setDomColors]=useState([]);
  const[projectName,setProjectName]=useState("auralith-project");
  const[posterTitle,setPosterTitle]=useState("PHI369");
  const[posterSub,setPosterSub]=useState("Sovereign image alchemy");
  const[lastReceipt,setLastReceipt]=useState(null);
  const[versions,setVersions]=useState([]);
  const[snapOn,setSnapOn]=useState(1);const[snapTol,setSnapTol]=useState(9);
  const[captionTone,setCaptionTone]=useState("mythic");const[lastManifest,setLastManifest]=useState("");

  const flash=msg=>{setStatus(msg);setTimeout(()=>setStatus(""),2000);};
  const adjToFilter=a=>{const p=[];if((a.br??100)!==100)p.push(`brightness(${a.br}%)`);if((a.ct??100)!==100)p.push(`contrast(${a.ct}%)`);if((a.st??100)!==100)p.push(`saturate(${a.st}%)`);if((a.hu??0)!==0)p.push(`hue-rotate(${a.hu}deg)`);if((a.bl??0)>0)p.push(`blur(${a.bl}px)`);if((a.temp??0)>0)p.push(`sepia(${a.temp}%)`);if((a.temp??0)<0)p.push(`hue-rotate(${Math.abs(a.temp)*.5}deg)`);return p.length?p.join(" "):"none";};
  const adjF=useMemo(()=>adjToFilter(adj),[adj]);

  const eLC=useCallback(id=>{if(!ld.current[id]){const c=document.createElement("canvas");c.width=sz.w;c.height=sz.h;ld.current[id]=c;}return ld.current[id];},[sz]);
  const eMk=useCallback(id=>{if(!mks.current[id]){const c=document.createElement("canvas");c.width=sz.w;c.height=sz.h;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,sz.w,sz.h);mks.current[id]=c;}return mks.current[id];},[sz]);

  const save=useCallback((name)=>{const snap={};Object.keys(ld.current).forEach(k=>{const s=ld.current[k],c=document.createElement("canvas");c.width=s.width;c.height=s.height;c.getContext("2d").drawImage(s,0,0);snap[k]=c;});const nh=hist.slice(0,hP+1);nh.push({layers:JSON.parse(JSON.stringify(layers)),data:snap,sz:{...sz}});if(nh.length>60)nh.shift();sHist(nh);sHP(nh.length-1);const nn=[...hNm.slice(0,hP+1),name||"Edit"];if(nn.length>60)nn.shift();sHNm(nn);if(name&&!["Move","Open","Paste","brush","eraser"].includes(name)){setQuickA(p=>[name,...p.filter(x=>x!==name)].slice(0,6));}
    if(batchRec&&name)setBatchActions(p=>[...p,name]);
    flash(name);},[hist,hP,layers,sz,hNm,batchRec]);

  const undo=useCallback(()=>{if(hP<=0)return;const s=hist[hP-1];if(!s)return;ld.current={};Object.keys(s.data).forEach(k=>{const c=document.createElement("canvas");c.width=s.data[k].width;c.height=s.data[k].height;c.getContext("2d").drawImage(s.data[k],0,0);ld.current[k]=c;});setLayers(s.layers);setSz(s.sz);sHP(hP-1);flash("Undo");},[hist,hP]);
  const redo=useCallback(()=>{if(hP>=hist.length-1)return;const s=hist[hP+1];if(!s)return;ld.current={};Object.keys(s.data).forEach(k=>{const c=document.createElement("canvas");c.width=s.data[k].width;c.height=s.data[k].height;c.getContext("2d").drawImage(s.data[k],0,0);ld.current[k]=c;});setLayers(s.layers);setSz(s.sz);sHP(hP+1);flash("Redo");},[hist,hP]);

  const curvLUT=useMemo(()=>{const lut=new Uint8Array(256),pts=[...curvP].sort((a,b)=>a.x-b.x);for(let i=0;i<256;i++){let lo=pts[0],hi=pts[pts.length-1];for(let j=0;j<pts.length-1;j++)if(pts[j].x<=i&&pts[j+1].x>=i){lo=pts[j];hi=pts[j+1];break;}lut[i]=cl(Math.round(lo.y+(hi.y-lo.y)*(hi.x===lo.x?0:(i-lo.x)/(hi.x-lo.x))),0,255);}return lut;},[curvP]);

  // Apply gradient map
  const applyGradMap=(gm)=>{const lc=ld.current[aL];if(!lc)return;save("GradMap: "+gm.n);const ctx=lc.getContext("2d"),id=ctx.getImageData(0,0,lc.width,lc.height);const stops=gm.stops.map(s=>({p:s[0],c:h2r(s[1])}));for(let i=0;i<id.data.length;i+=4){const lum=(id.data[i]*.299+id.data[i+1]*.587+id.data[i+2]*.114)/255;let lo=stops[0],hi=stops[stops.length-1];for(let j=0;j<stops.length-1;j++)if(stops[j].p<=lum&&stops[j+1].p>=lum){lo=stops[j];hi=stops[j+1];break;}const t=hi.p===lo.p?0:(lum-lo.p)/(hi.p-lo.p);id.data[i]=lo.c.r+(hi.c.r-lo.c.r)*t;id.data[i+1]=lo.c.g+(hi.c.g-lo.c.g)*t;id.data[i+2]=lo.c.b+(hi.c.b-lo.c.b)*t;}ctx.putImageData(id,0,0);comp();};

  // Apply LUT
  const applyLUT=(lut)=>{const lc=ld.current[aL];if(!lc)return;save("LUT: "+lut.n);const ctx=lc.getContext("2d"),id=ctx.getImageData(0,0,lc.width,lc.height);const result=lut.fn(id.data);ctx.putImageData(new ImageData(result,lc.width,lc.height),0,0);comp();};

  // Dominant color extraction
  const extractDominant=()=>{const mc=mcR.current;if(!mc)return;const ctx=mc.getContext("2d");const id=ctx.getImageData(0,0,sz.w,sz.h);const colorMap={};const step=4;for(let i=0;i<id.data.length;i+=4*step){const r=Math.round(id.data[i]/32)*32,g=Math.round(id.data[i+1]/32)*32,b=Math.round(id.data[i+2]/32)*32;const key=`${r},${g},${b}`;colorMap[key]=(colorMap[key]||0)+1;}const sorted=Object.entries(colorMap).sort((a,b)=>b[1]-a[1]).slice(0,8);setDomColors(sorted.map(([k])=>{const[r,g,b]=k.split(",").map(Number);return r2h(r,g,b);}));};

  // Batch playback
  const playBatch=(actions)=>{actions.forEach(a=>{const pf=Object.entries(PF).find(([,v])=>v.n===a);if(pf)apPxF(pf[0]);const pl=PLUGINS.find(p=>p.name===a);if(pl)applyPlugin(pl);const gm=GRAD_MAPS.find(g=>"GradMap: "+g.n===a);if(gm)applyGradMap(gm);const lt=LUTS.find(l=>"LUT: "+l.n===a);if(lt)applyLUT(lt);});flash(`Played ${actions.length} actions`);};

  const dCk=(ctx,w,h)=>{const s=8;for(let y=0;y<h;y+=s)for(let x=0;x<w;x+=s){ctx.fillStyle=((x/s+y/s)%2===0)?"#13132a":"#0f0f24";ctx.fillRect(x,y,s,s);}};
  const applyAdjustmentLayer=(canvas,l)=>{if(!l.vis)return;const a=l.adj||{},ctx=canvas.getContext("2d"),src=document.createElement("canvas"),fx=document.createElement("canvas");src.width=fx.width=canvas.width;src.height=fx.height=canvas.height;src.getContext("2d").drawImage(canvas,0,0);const x=fx.getContext("2d");x.filter=adjToFilter(a);x.drawImage(src,0,0);x.filter="none";if(a.tint){x.save();x.globalAlpha=cl(a.tintOp??.06,0,.5);x.globalCompositeOperation="screen";x.fillStyle=a.tint;x.fillRect(0,0,fx.width,fx.height);x.restore();}if((a.vignette??0)>0){const g=x.createRadialGradient(fx.width/2,fx.height/2,Math.min(fx.width,fx.height)*.2,fx.width/2,fx.height/2,Math.max(fx.width,fx.height)*.68);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,`rgba(0,0,0,${cl(a.vignette,0,.85)})`);x.fillStyle=g;x.fillRect(0,0,fx.width,fx.height);}ctx.save();ctx.globalAlpha=cl(l.op??1,0,1);ctx.globalCompositeOperation=l.bl||"normal";ctx.drawImage(fx,0,0);ctx.restore();};
  const drawLayerTo=(ctx,l)=>{const lc=ld.current[l.id];if(!lc||!l.vis)return;const tmp=document.createElement("canvas");tmp.width=sz.w;tmp.height=sz.h;const tc=tmp.getContext("2d");tc.drawImage(lc,0,0);
    if(l.biLo>0||l.biHi<255){const id=tc.getImageData(0,0,sz.w,sz.h);for(let i=0;i<id.data.length;i+=4){const lum=id.data[i]*.299+id.data[i+1]*.587+id.data[i+2]*.114;if(lum<l.biLo||lum>l.biHi)id.data[i+3]=0;}tc.putImageData(id,0,0);}
    if(l.mask&&mks.current[l.id]){const id=tc.getImageData(0,0,sz.w,sz.h),mk=mks.current[l.id].getContext("2d").getImageData(0,0,sz.w,sz.h);for(let i=0;i<id.data.length;i+=4)id.data[i+3]=Math.round(id.data[i+3]*(mk.data[i]+mk.data[i+1]+mk.data[i+2])/3/255);tc.putImageData(id,0,0);}
    ctx.save();ctx.globalAlpha=l.op;ctx.globalCompositeOperation=l.bl;if(l.fx?.shadow){ctx.shadowOffsetX=l.fx.shadowX;ctx.shadowOffsetY=l.fx.shadowY;ctx.shadowBlur=l.fx.shadowBlur;ctx.shadowColor="#00000088";}ctx.drawImage(tmp,0,0);ctx.shadowBlur=0;if(l.fx?.glow){ctx.globalCompositeOperation="screen";ctx.filter=`blur(${l.fx.glowSize}px)`;ctx.globalAlpha=l.op*.3;ctx.drawImage(tmp,0,0);ctx.filter="none";}ctx.restore();};
  const renderCompositeCanvas=useCallback(({checker=0,background=null,split=0}={})=>{const base=document.createElement("canvas");base.width=sz.w;base.height=sz.h;const b=base.getContext("2d");b.clearRect(0,0,sz.w,sz.h);if(background){b.fillStyle=background;b.fillRect(0,0,sz.w,sz.h);}else if(checker)dCk(b,sz.w,sz.h);layers.forEach(l=>{if(!l.vis)return;if(l.kind==="adjustment")applyAdjustmentLayer(base,l);else drawLayerTo(b,l);});const out=document.createElement("canvas");out.width=sz.w;out.height=sz.h;const o=out.getContext("2d");if(background){o.fillStyle=background;o.fillRect(0,0,sz.w,sz.h);}o.filter=adjF;o.drawImage(base,0,0);o.filter="none";if(split&&splitV&&origS.current){const sx=Math.round(sz.w*splitP/100);o.save();o.beginPath();o.rect(0,0,sx,sz.h);o.clip();o.drawImage(origS.current,0,0,sz.w,sz.h);o.restore();o.strokeStyle=C.ac;o.lineWidth=2;o.setLineDash([6,4]);o.beginPath();o.moveTo(sx,0);o.lineTo(sx,sz.h);o.stroke();o.setLineDash([]);o.font="8px "+FN;o.fillStyle=C.ac;o.fillText("BEFORE",sx-42,12);o.fillText("AFTER",sx+4,12);}return out;},[layers,sz,adjF,splitV,splitP]);
  const comp=useCallback(()=>{const mc=mcR.current;if(!mc)return;const rendered=renderCompositeCanvas({checker:1,split:1});mc.width=sz.w;mc.height=sz.h;const ctx=mc.getContext("2d");mc.style.filter="none";ctx.clearRect(0,0,sz.w,sz.h);ctx.drawImage(rendered,0,0);const mm=mnR.current;if(mm){mm.width=100;mm.height=Math.round(100*(sz.h/sz.w));mm.getContext("2d").drawImage(mc,0,0,mm.width,mm.height);}try{const id=ctx.getImageData(0,0,sz.w,sz.h),rH=new Array(256).fill(0),gH=new Array(256).fill(0),bH=new Array(256).fill(0);for(let i=0;i<id.data.length;i+=4){rH[id.data[i]]++;gH[id.data[i+1]]++;bH[id.data[i+2]]++;}sHistD({r:rH,g:gH,b:bH});}catch(e){}},[renderCompositeCanvas,sz]);
  useEffect(()=>{comp();},[comp]);

  // Overlay + guides + ruler
  useEffect(()=>{const oc=olR.current;if(!oc)return;oc.width=sz.w;oc.height=sz.h;const ctx=oc.getContext("2d");ctx.clearRect(0,0,sz.w,sz.h);const w=sz.w,h=sz.h;
    if(ovl!=="none"){ctx.strokeStyle=`rgba(0,212,170,${oOp})`;ctx.lineWidth=1;ctx.setLineDash([5,4]);
      if(ovl==="phi"){const xs=[w*LAM*LAM,w*LAM,w*(1-LAM*LAM)],ys=[h*LAM*LAM,h*LAM,h*(1-LAM*LAM)];xs.forEach(x=>{ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()});ys.forEach(y=>{ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()});ctx.setLineDash([]);ctx.fillStyle=`rgba(0,212,170,${oOp*.7})`;xs.forEach(x=>ys.forEach(y=>{ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill()}));}
      else if(ovl==="thirds"){for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(w*i/3,0);ctx.lineTo(w*i/3,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,h*i/3);ctx.lineTo(w,h*i/3);ctx.stroke();}}
      else if(ovl==="spiral"){ctx.setLineDash([]);ctx.strokeStyle=`rgba(212,160,23,${oOp})`;ctx.lineWidth=1.5;ctx.beginPath();let a=0;const cx=w*LAM,cy=h*LAM,r=Math.min(w,h)*LAM;for(let i=0;i<250;i++){const rv=r*Math.pow(LAM,a/(Math.PI/2));ctx.lineTo(cx+rv*Math.cos(a),cy+rv*Math.sin(a));a+=.04;}ctx.stroke();}
      else if(ovl==="369"){ctx.strokeStyle=`rgba(139,92,246,${oOp*.5})`;for(let i=1;i<=8;i++){const f=i/9;ctx.beginPath();ctx.moveTo(w*f,0);ctx.lineTo(w*f,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,h*f);ctx.lineTo(w,h*f);ctx.stroke();}ctx.setLineDash([]);ctx.strokeStyle=`rgba(139,92,246,${oOp})`;ctx.lineWidth=2;[3,6,9].forEach(n=>{const f=n/9;ctx.beginPath();ctx.moveTo(w*f,0);ctx.lineTo(w*f,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,h*f);ctx.lineTo(w,h*f);ctx.stroke();});}}
    // Guides
    guides.forEach(g=>{ctx.strokeStyle="rgba(0,212,170,.4)";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();if(g.type==="h"){ctx.moveTo(0,g.pos);ctx.lineTo(w,g.pos);}else{ctx.moveTo(g.pos,0);ctx.lineTo(g.pos,h);}ctx.stroke();});
    // Selection
    if(sel){ctx.setLineDash([4,4]);ctx.strokeStyle="rgba(255,255,255,.8)";ctx.lineWidth=1;ctx.strokeRect(sel.x,sel.y,sel.w,sel.h);if(selFeather>0){ctx.strokeStyle="rgba(255,255,255,.3)";ctx.strokeRect(sel.x-selFeather,sel.y-selFeather,sel.w+selFeather*2,sel.h+selFeather*2);}}
    if(crR){ctx.setLineDash([6,3]);ctx.strokeStyle=C.ac;ctx.lineWidth=2;ctx.strokeRect(crR.x,crR.y,crR.w,crR.h);ctx.fillStyle="rgba(0,0,0,.4)";ctx.fillRect(0,0,w,crR.y);ctx.fillRect(0,crR.y+crR.h,w,h-crR.y-crR.h);ctx.fillRect(0,crR.y,crR.x,crR.h);ctx.fillRect(crR.x+crR.w,crR.y,w-crR.x-crR.w,crR.h);}
    if(penP.length>0){ctx.setLineDash([]);ctx.strokeStyle=C.ac;ctx.lineWidth=1.5;ctx.beginPath();penP.forEach((p,i)=>{i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)});ctx.stroke();}
    if(lassoPts.length>1){ctx.setLineDash([3,3]);ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=1;ctx.beginPath();lassoPts.forEach((p,i)=>{i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)});if(!lassoM)ctx.closePath();ctx.stroke();}
    // Ruler measurement
    if(rulerStart&&rulerEnd){ctx.setLineDash([]);ctx.strokeStyle=C.or;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(rulerStart.x,rulerStart.y);ctx.lineTo(rulerEnd.x,rulerEnd.y);ctx.stroke();const dist=Math.round(Math.hypot(rulerEnd.x-rulerStart.x,rulerEnd.y-rulerStart.y));ctx.fillStyle=C.or;ctx.font="10px "+FN;ctx.fillText(`${dist}px`,( rulerStart.x+rulerEnd.x)/2+5,(rulerStart.y+rulerEnd.y)/2-5);ctx.beginPath();ctx.arc(rulerStart.x,rulerStart.y,3,0,Math.PI*2);ctx.fillStyle=C.or;ctx.fill();ctx.beginPath();ctx.arc(rulerEnd.x,rulerEnd.y,3,0,Math.PI*2);ctx.fill();}
    if(symM>0){ctx.setLineDash([2,3]);ctx.strokeStyle="rgba(139,92,246,.2)";ctx.lineWidth=.5;for(let i=0;i<symM;i++){const a=(Math.PI*2/symM)*i;ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(w/2+Math.cos(a)*Math.max(w,h),h/2+Math.sin(a)*Math.max(w,h));ctx.stroke();}}
  },[ovl,oOp,sz,sel,selFeather,crR,penP,lassoPts,lassoM,symM,guides,rulerStart,rulerEnd]);

  const snapPoint=p=>{if(!snapOn)return p;const xs=[0,sz.w/2,sz.w,sz.w*LAM*LAM,sz.w*LAM,sz.w*(1-LAM*LAM)],ys=[0,sz.h/2,sz.h,sz.h*LAM*LAM,sz.h*LAM,sz.h*(1-LAM*LAM)];for(let i=1;i<9;i++){xs.push(sz.w*i/9);ys.push(sz.h*i/9);}guides.forEach(g=>{(g.type==="v"?xs:ys).push(g.pos);});let nx=p.x,ny=p.y,bx=snapTol+1,by=snapTol+1;xs.forEach(x=>{const d=Math.abs(p.x-x);if(d<bx){bx=d;nx=x;}});ys.forEach(y=>{const d=Math.abs(p.y-y);if(d<by){by=d;ny=y;}});return{x:bx<=snapTol?nx:p.x,y:by<=snapTol?ny:p.y};};
  const gP_=(e)=>{const r=mcR.current.getBoundingClientRect();return snapPoint({x:(e.clientX-r.left)*(sz.w/r.width),y:(e.clientY-r.top)*(sz.h/r.height)});};
  const drawDot=(ctx,x,y,br)=>{ctx.globalCompositeOperation=(br?.er||tl==="eraser")?"destination-out":"source-over";if(br?.st){ctx.save();ctx.globalAlpha=bOp;ctx.font=`${bSz}px serif`;ctx.fillStyle=fg;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("Φ",x,y);ctx.restore();return;}const sx=scatter>0?(Math.random()-.5)*scatter*bSz:0,sy=scatter>0?(Math.random()-.5)*scatter*bSz:0;const px=x+sx,py=y+sy;const grad=ctx.createRadialGradient(px,py,0,px,py,bSz/2);const col=(br?.er||tl==="eraser")?"0,0,0":Object.values(h2r(fg)).join(",");grad.addColorStop(0,`rgba(${col},${bOp})`);grad.addColorStop(cl(bHd,.01,.99),`rgba(${col},${bOp*.6})`);grad.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=grad;ctx.beginPath();ctx.arc(px,py,bSz/2,0,Math.PI*2);ctx.fill();};
  const drawSymDot=(ctx,x,y,br)=>{drawDot(ctx,x,y,br);if(symM>0){const cx=sz.w/2,cy=sz.h/2;for(let i=1;i<symM;i++){const a=(Math.PI*2/symM)*i,dx=x-cx,dy=y-cy;drawDot(ctx,cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a),br);}}};
  const drawLn=(ctx,x1,y1,x2,y2,br)=>{const d=Math.hypot(x2-x1,y2-y1);const st=Math.max(1,Math.floor(d/(bSz*.12)));for(let i=0;i<=st;i++){const t=i/st;drawSymDot(ctx,x1+(x2-x1)*t,y1+(y2-y1)*t,br);}};
  const smudgePaint=(ctx,x,y,lx,ly)=>{const r=bSz/2;try{const src=ctx.getImageData(cl(Math.floor(lx-r),0,sz.w-1),cl(Math.floor(ly-r),0,sz.h-1),Math.ceil(bSz),Math.ceil(bSz));const dst=ctx.getImageData(cl(Math.floor(x-r),0,sz.w-1),cl(Math.floor(y-r),0,sz.h-1),Math.ceil(bSz),Math.ceil(bSz));for(let i=0;i<dst.data.length;i+=4){const s=bOp*.5;dst.data[i]=dst.data[i]*(1-s)+src.data[i]*s;dst.data[i+1]=dst.data[i+1]*(1-s)+src.data[i+1]*s;dst.data[i+2]=dst.data[i+2]*(1-s)+src.data[i+2]*s;}ctx.putImageData(dst,cl(Math.floor(x-r),0,sz.w-1),cl(Math.floor(y-r),0,sz.h-1));}catch(e){}};
  const dodgeBurn=(ctx,x,y,mode)=>{const r=bSz/2,x0=cl(Math.floor(x-r),0,sz.w-1),y0=cl(Math.floor(y-r),0,sz.h-1);try{const id=ctx.getImageData(x0,y0,Math.ceil(bSz),Math.ceil(bSz));const amt=bOp*.15;for(let i=0;i<id.data.length;i+=4){const d=mode==="dodge"?amt*255:-amt*255;id.data[i]=cl(id.data[i]+d,0,255);id.data[i+1]=cl(id.data[i+1]+d,0,255);id.data[i+2]=cl(id.data[i+2]+d,0,255);}ctx.putImageData(id,x0,y0);}catch(e){}};
  const liquify=(ctx,x,y,lx,ly)=>{const r=bSz,dx=(x-lx)*.3,dy=(y-ly)*.3,x0=cl(Math.floor(x-r),0,sz.w-r),y0=cl(Math.floor(y-r),0,sz.h-r);try{const id=ctx.getImageData(x0,y0,r*2,r*2),w=r*2,h=r*2;const out=new Uint8ClampedArray(id.data);for(let py=0;py<h;py++)for(let px=0;px<w;px++){const ddx=px-r,ddy=py-r,dist=Math.sqrt(ddx*ddx+ddy*ddy);if(dist>r)continue;const f=1-dist/r,sx=cl(Math.round(px-dx*f*f),0,w-1),sy=cl(Math.round(py-dy*f*f),0,h-1),di=(py*w+px)*4,si=(sy*w+sx)*4;out[di]=id.data[si];out[di+1]=id.data[si+1];out[di+2]=id.data[si+2];}ctx.putImageData(new ImageData(out,w,h),x0,y0);}catch(e){}};
  const colorReplace=(ctx,x,y)=>{const r=bSz/2,x0=cl(Math.floor(x-r),0,sz.w-1),y0=cl(Math.floor(y-r),0,sz.h-1);try{const id=ctx.getImageData(x0,y0,Math.ceil(bSz),Math.ceil(bSz));const tc=h2r(replTgt),fc=h2r(fg);for(let i=0;i<id.data.length;i+=4){if(Math.abs(id.data[i]-tc.r)+Math.abs(id.data[i+1]-tc.g)+Math.abs(id.data[i+2]-tc.b)<replTol){id.data[i]=fc.r;id.data[i+1]=fc.g;id.data[i+2]=fc.b;}}ctx.putImageData(id,x0,y0);}catch(e){}};
  const floodFill=(lid,sx,sy,col)=>{const lc=eLC(lid);const ctx=lc.getContext("2d");const id=ctx.getImageData(0,0,lc.width,lc.height);const d=id.data,w=lc.width,h=lc.height;const si=(Math.floor(sy)*w+Math.floor(sx))*4;const tr=d[si],tg=d[si+1],tb=d[si+2],ta=d[si+3];const fc=h2r(col);if(tr===fc.r&&tg===fc.g&&tb===fc.b)return;const m=i=>Math.abs(d[i]-tr)+Math.abs(d[i+1]-tg)+Math.abs(d[i+2]-tb)+Math.abs(d[i+3]-ta)<32;const stk=[[Math.floor(sx),Math.floor(sy)]];const vis=new Uint8Array(w*h);while(stk.length>0){const[px,py]=stk.pop();if(px<0||px>=w||py<0||py>=h)continue;const pi=py*w+px;if(vis[pi])continue;const di=pi*4;if(!m(di))continue;vis[pi]=1;d[di]=fc.r;d[di+1]=fc.g;d[di+2]=fc.b;d[di+3]=255;stk.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);}ctx.putImageData(id,0,0);};
  const magicWand=(x,y)=>{const mc=mcR.current;if(!mc)return;const ctx=mc.getContext("2d");const id=ctx.getImageData(0,0,sz.w,sz.h);const d=id.data;const si=(Math.floor(y)*sz.w+Math.floor(x))*4;const tr=d[si],tg=d[si+1],tb=d[si+2];const vis=new Uint8Array(sz.w*sz.h);const stk=[[Math.floor(x),Math.floor(y)]];let mnX=sz.w,mxX=0,mnY=sz.h,mxY=0;while(stk.length>0){const[px,py]=stk.pop();if(px<0||px>=sz.w||py<0||py>=sz.h)continue;const pi=py*sz.w+px;if(vis[pi])continue;const di=pi*4;if(Math.abs(d[di]-tr)+Math.abs(d[di+1]-tg)+Math.abs(d[di+2]-tb)>wandTol)continue;vis[pi]=1;mnX=Math.min(mnX,px);mxX=Math.max(mxX,px);mnY=Math.min(mnY,py);mxY=Math.max(mxY,py);stk.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);}if(mxX>mnX&&mxY>mnY)sSel({x:mnX,y:mnY,w:mxX-mnX,h:mxY-mnY});};

  const commitShp=(s)=>{if(!s)return;const lc=eLC(aL);const ctx=lc.getContext("2d");const{x1,y1,x2,y2}=s,rx=Math.min(x1,x2),ry=Math.min(y1,y2),rw=Math.abs(x2-x1),rh=Math.abs(y2-y1);ctx.save();ctx.strokeStyle=fg;ctx.fillStyle=fg;ctx.lineWidth=shpW;ctx.globalAlpha=bOp;ctx.setLineDash([]);if(shp==="rect"){shpF?ctx.fillRect(rx,ry,rw,rh):ctx.strokeRect(rx,ry,rw,rh);}else if(shp==="circle"){ctx.beginPath();ctx.ellipse(rx+rw/2,ry+rh/2,rw/2,rh/2,0,0,Math.PI*2);shpF?ctx.fill():ctx.stroke();}else if(shp==="line"){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}else if(shp==="triangle"){ctx.beginPath();ctx.moveTo(rx+rw/2,ry);ctx.lineTo(rx+rw,ry+rh);ctx.lineTo(rx,ry+rh);ctx.closePath();shpF?ctx.fill():ctx.stroke();}else if(shp==="star"){const cx=rx+rw/2,cy=ry+rh/2,or=Math.max(rw,rh)/2,ir=or*LAM;ctx.beginPath();for(let i=0;i<10;i++){const r=i%2===0?or:ir;ctx.lineTo(cx+Math.cos(Math.PI/2*3+i*Math.PI/5)*r,cy+Math.sin(Math.PI/2*3+i*Math.PI/5)*r);}ctx.closePath();shpF?ctx.fill():ctx.stroke();}else if(shp==="hex"){const cx=rx+rw/2,cy=ry+rh/2,r=Math.max(rw,rh)/2;ctx.beginPath();for(let i=0;i<6;i++)ctx.lineTo(cx+Math.cos(Math.PI/3*i-Math.PI/6)*r,cy+Math.sin(Math.PI/3*i-Math.PI/6)*r);ctx.closePath();shpF?ctx.fill():ctx.stroke();}ctx.restore();};
  const commitGrad=(g)=>{if(!g)return;const lc=eLC(aL);const ctx=lc.getContext("2d");let gr;if(gT==="linear")gr=ctx.createLinearGradient(g.x1,g.y1,g.x2,g.y2);else if(gT==="radial"){const r=Math.hypot(g.x2-g.x1,g.y2-g.y1);gr=ctx.createRadialGradient(g.x1,g.y1,0,g.x1,g.y1,r);}else gr=ctx.createConicGradient(0,g.x1,g.y1);gr.addColorStop(0,fg);gr.addColorStop(1,bg_);ctx.save();ctx.globalAlpha=bOp;if(sel){ctx.beginPath();ctx.rect(sel.x,sel.y,sel.w,sel.h);ctx.clip();}ctx.fillStyle=gr;ctx.fillRect(0,0,sz.w,sz.h);ctx.restore();};

  const apPxF=(k)=>{const f=PF[k];if(!f)return;const lc=ld.current[aL];if(!lc)return;save(f.n);const ctx=lc.getContext("2d"),id=ctx.getImageData(0,0,lc.width,lc.height);ctx.putImageData(new ImageData(f.fn(id.data,lc.width,lc.height),lc.width,lc.height),0,0);comp();};
  const applyPlugin=(pl)=>{const lc=ld.current[aL];if(!lc)return;save(pl.name);const ctx=lc.getContext("2d"),id=ctx.getImageData(0,0,lc.width,lc.height);ctx.putImageData(new ImageData(pl.fn(id.data,lc.width,lc.height),lc.width,lc.height),0,0);comp();};
  const applyCurv=()=>{const lc=ld.current[aL];if(!lc)return;save("Curves");const ctx=lc.getContext("2d"),id=ctx.getImageData(0,0,lc.width,lc.height);for(let i=0;i<id.data.length;i+=4){id.data[i]=curvLUT[id.data[i]];id.data[i+1]=curvLUT[id.data[i+1]];id.data[i+2]=curvLUT[id.data[i+2]];}ctx.putImageData(id,0,0);comp();};
  const doCAFill=()=>{if(!sel){flash("Select area first");return;}const lc=ld.current[aL];if(!lc)return;save("CA Fill");caFill(lc.getContext("2d"),sel,sz.w,sz.h);comp();};

  // Pointer
  const onDown=(e)=>{const p=gP_(e);
    if(tl==="clone"&&e.altKey){sClSrc(p);return;}
    if(tl==="clone"&&clSrc){if(!clOff.current)clOff.current={dx:clSrc.x-p.x,dy:clSrc.y-p.y};drw.current=1;lP.current=p;return;}
    if(["brush","eraser"].includes(tl)){const tgt=eMask?eMk(aL):eLC(aL);drw.current=1;lP.current=p;drawSymDot(tgt.getContext("2d"),p.x,p.y,tl==="eraser"?BRS[5]:BRS[bI]);comp();}
    else if(tl==="heal"){save("Heal");spotHeal(eLC(aL).getContext("2d"),p.x,p.y,bSz/2,sz.w,sz.h);comp();}
    else if(["smudge","dodge","burn","liquify","colorReplace"].includes(tl)){drw.current=1;lP.current=p;if(tl==="dodge"||tl==="burn"){dodgeBurn(eLC(aL).getContext("2d"),p.x,p.y,tl);comp();}if(tl==="colorReplace"){colorReplace(eLC(aL).getContext("2d"),p.x,p.y);comp();}}
    else if(tl==="fill"){save("Fill");floodFill(aL,p.x,p.y,fg);comp();}
    else if(tl==="caFill"){doCAFill();}
    else if(tl==="text"&&plc){save("Text");const ctx=eLC(aL).getContext("2d");ctx.save();ctx.globalAlpha=bOp;ctx.font=`${tSz}px ${tF}`;ctx.textAlign="left";ctx.textBaseline="top";
      // Text FX
      if(txtFx.shadow){ctx.shadowColor="#000";ctx.shadowBlur=txtFx.shadowB;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;}
      if(txtFx.gradient){const gr=ctx.createLinearGradient(p.x,p.y,p.x+tSz*txt.length*.6,p.y);gr.addColorStop(0,fg);gr.addColorStop(1,bg_);ctx.fillStyle=gr;}else{ctx.fillStyle=fg;}
      ctx.fillText(txt,p.x,p.y);ctx.shadowBlur=0;
      if(txtFx.stroke){ctx.strokeStyle=txtFx.strokeC;ctx.lineWidth=txtFx.strokeW;ctx.strokeText(txt,p.x,p.y);}
      ctx.restore();comp();sPlc(0);}
    else if(tl==="picker"){const px=mcR.current.getContext("2d").getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data;setFg(r2h(px[0],px[1],px[2]));setTl("brush");}
    else if(tl==="wand"){magicWand(p.x,p.y);}
    else if(tl==="pen"){sPenP(pr=>[...pr,p]);}
    else if(tl==="lasso"){setLassoM(1);lassoP.current=[p];setLassoPts([p]);}
    else if(tl==="ruler"){setRulerStart(p);setRulerEnd(p);}
    else if(tl==="select"){selS.current=p;sSel(null);}
    else if(tl==="crop"){crSt.current=p;sCrR(null);}
    else if(tl==="move"){mvS.current=p;const lc=ld.current[aL];if(lc){const s=document.createElement("canvas");s.width=lc.width;s.height=lc.height;s.getContext("2d").drawImage(lc,0,0);mvSn.current=s;}}
    else if(tl==="shape"){shpS.current=p;}
    else if(tl==="gradient"){gS.current=p;}
    else if(tl==="transform"){sXfing(1);}
  };
  const onMove=(e)=>{const p=gP_(e);
    if(["brush","eraser"].includes(tl)&&drw.current){const tgt=eMask?eMk(aL):eLC(aL);drawLn(tgt.getContext("2d"),lP.current.x,lP.current.y,p.x,p.y,tl==="eraser"?BRS[5]:BRS[bI]);lP.current=p;comp();}
    else if(tl==="smudge"&&drw.current&&lP.current){smudgePaint(eLC(aL).getContext("2d"),p.x,p.y,lP.current.x,lP.current.y);lP.current=p;comp();}
    else if((tl==="dodge"||tl==="burn")&&drw.current){dodgeBurn(eLC(aL).getContext("2d"),p.x,p.y,tl);lP.current=p;comp();}
    else if(tl==="liquify"&&drw.current&&lP.current){liquify(eLC(aL).getContext("2d"),p.x,p.y,lP.current.x,lP.current.y);lP.current=p;comp();}
    else if(tl==="colorReplace"&&drw.current){colorReplace(eLC(aL).getContext("2d"),p.x,p.y);lP.current=p;comp();}
    else if(tl==="clone"&&drw.current&&clOff.current){try{const sd=mcR.current.getContext("2d").getImageData(cl(Math.floor(p.x+clOff.current.dx-bSz/2),0,sz.w-1),cl(Math.floor(p.y+clOff.current.dy-bSz/2),0,sz.h-1),bSz,bSz);eLC(aL).getContext("2d").putImageData(sd,cl(Math.floor(p.x-bSz/2),0,sz.w-1),cl(Math.floor(p.y-bSz/2),0,sz.h-1));}catch(e){}lP.current=p;comp();}
    else if(tl==="lasso"&&lassoM){lassoP.current.push(p);setLassoPts([...lassoP.current]);}
    else if(tl==="ruler"&&rulerStart){setRulerEnd(p);}
    else if(tl==="select"&&selS.current){const s=selS.current;sSel({x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y)});}
    else if(tl==="crop"&&crSt.current){const s=crSt.current;sCrR({x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y)});}
    else if(tl==="move"&&mvS.current&&mvSn.current){const dx=p.x-mvS.current.x,dy=p.y-mvS.current.y;eLC(aL).getContext("2d").clearRect(0,0,sz.w,sz.h);eLC(aL).getContext("2d").drawImage(mvSn.current,dx,dy);comp();}
    else if(tl==="shape"&&shpS.current){sShpP({x1:shpS.current.x,y1:shpS.current.y,x2:p.x,y2:p.y});}
    else if(tl==="gradient"&&gS.current){sGPr({x1:gS.current.x,y1:gS.current.y,x2:p.x,y2:p.y});}
  };
  const onUp=()=>{
    if(drw.current){drw.current=0;lP.current=null;if(!["wand","picker","heal","caFill","ruler"].includes(tl))save(tl);}
    if(tl==="select")selS.current=null;if(tl==="crop")crSt.current=null;
    if(tl==="lasso"&&lassoM){setLassoM(0);const pts=lassoP.current;if(pts.length>2){let mnX=Infinity,mxX=-Infinity,mnY=Infinity,mxY=-Infinity;pts.forEach(p=>{mnX=Math.min(mnX,p.x);mxX=Math.max(mxX,p.x);mnY=Math.min(mnY,p.y);mxY=Math.max(mxY,p.y);});sSel({x:mnX,y:mnY,w:mxX-mnX,h:mxY-mnY});}lassoP.current=[];setLassoPts([]);}
    if(tl==="move"&&mvSn.current){mvS.current=null;mvSn.current=null;save("Move");}
    if(tl==="shape"&&shpP){save("Shape");commitShp(shpP);sShpP(null);shpS.current=null;comp();}
    if(tl==="gradient"&&gPr){save("Gradient");commitGrad(gPr);sGPr(null);gS.current=null;comp();}
  };

  const onWheel=useCallback(e=>{e.preventDefault();setZm(z=>cl(z+(e.deltaY<0?.1:-.1),.05,12));},[]);
  const selCp=()=>{if(!sel)return;const lc=ld.current[aL];if(!lc)return;clip.current=lc.getContext("2d").getImageData(sel.x,sel.y,sel.w,sel.h);flash("Copied");};
  const selCut=()=>{selCp();selDel();};
  const selPst=()=>{if(!clip.current)return;save("Paste");const id=nid.current++;const c=document.createElement("canvas");c.width=sz.w;c.height=sz.h;c.getContext("2d").putImageData(clip.current,0,0);ld.current[id]=c;setLayers(p=>[...p,{id,n:"Pasted",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(id);comp();};
  const selDel=()=>{if(!sel)return;save("Delete");eLC(aL).getContext("2d").clearRect(sel.x,sel.y,sel.w,sel.h);comp();};
  const selFl=()=>{if(!sel)return;save("Fill Sel");const ctx=eLC(aL).getContext("2d");ctx.fillStyle=fg;ctx.globalAlpha=bOp;ctx.fillRect(sel.x,sel.y,sel.w,sel.h);ctx.globalAlpha=1;comp();};
  const applyCrop=()=>{if(!crR||crR.w<5||crR.h<5)return;save("Crop");const{x,y,w,h}=crR;Object.keys(ld.current).forEach(k=>{const o=ld.current[k];const n=document.createElement("canvas");n.width=Math.round(w);n.height=Math.round(h);n.getContext("2d").drawImage(o,x,y,w,h,0,0,w,h);ld.current[k]=n;});setSz({w:Math.round(w),h:Math.round(h)});sCrR(null);setTimeout(comp,30);};
  const applyXf=()=>{if(!xfing)return;save("Transform");const lc=ld.current[aL];if(!lc)return;const nc=document.createElement("canvas");nc.width=sz.w;nc.height=sz.h;const ctx=nc.getContext("2d");ctx.translate(sz.w/2,sz.h/2);ctx.rotate(xfA*Math.PI/180);ctx.scale(xfSc/100,xfSc/100);ctx.translate(-sz.w/2,-sz.h/2);ctx.drawImage(lc,0,0);ld.current[aL]=nc;sXfing(0);sXfA(0);sXfSc(100);comp();};
  const strokePen=()=>{if(penP.length<2)return;save("Pen");const ctx=eLC(aL).getContext("2d");ctx.save();ctx.strokeStyle=fg;ctx.lineWidth=bSz;ctx.lineCap="round";ctx.globalAlpha=bOp;ctx.beginPath();penP.forEach((p,i)=>{i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)});ctx.stroke();ctx.restore();sPenP([]);comp();};

  const loadImg=(file)=>{const img=new Image();img.onload=()=>{setSz({w:img.width,h:img.height});const lc=document.createElement("canvas");lc.width=img.width;lc.height=img.height;lc.getContext("2d").drawImage(img,0,0);ld.current[1]=lc;setHasI(1);setLayers(p=>p.map(l=>l.id===1?{...l,n:file.name.split('.')[0]}:l));const oc=document.createElement("canvas");oc.width=img.width;oc.height=img.height;oc.getContext("2d").drawImage(img,0,0);origS.current=oc;setTimeout(()=>{comp();save("Open");extractDominant();},50);};img.src=URL.createObjectURL(file);};

  const canvasFromURL=url=>new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=img.width;c.height=img.height;c.getContext("2d").drawImage(img,0,0);res(c);};img.onerror=rej;img.src=url;});
  const downloadBlob=(name,type,body)=>{const a=document.createElement("a"),blob=new Blob([body],{type});a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800);};
  const exportProject=()=>{try{const layerData={},maskData={};Object.keys(ld.current).forEach(k=>{layerData[k]=ld.current[k].toDataURL("image/png")});Object.keys(mks.current).forEach(k=>{maskData[k]=mks.current[k].toDataURL("image/png")});const project={kind:AURALITH_PROJECT_KIND,version:APP_VERSION,savedAt:new Date().toISOString(),constants:{PHI,LAM,Cstar:.809017,OmegaC:.376},name:projectName,size:sz,activeLayer:aL,nextId:nid.current,layers:JSON.parse(JSON.stringify(layers)),layerData,maskData,orig:origS.current?origS.current.toDataURL("image/png"):null,adjustments:adj,overlay:{id:ovl,opacity:oOp},guides,snap:{enabled:!!snapOn,tolerance:snapTol},captionTone,colors:{fg,bg:bg_},text:{txt,tF,tSz,txtFx},batches:savedBatches,versions,quickActions:quickA,dominantColors:domColors};downloadBlob(`${projectName||"auralith369"}.auralith`,"application/json",JSON.stringify(project,null,2));flash("Project saved");}catch(e){console.error(e);flash("Project save failed");}};
  const loadProject=async(file)=>{try{const raw=JSON.parse(await file.text());const result=validateAuralithProject(raw);if(!result.ok||!result.project){const reason=(result.errors||[]).join(" | ")||"Invalid Auralith project file.";console.warn("[Auralith369] Project import rejected",{file:file.name,errors:result.errors,warnings:result.warnings});flash(`Project load failed: ${reason}`);return;}if(result.warnings?.length){console.warn("[Auralith369] Project import warnings",{file:file.name,warnings:result.warnings});}const normalized=normalizeAuralithProject(result.project);const project={...raw,...normalized,size:{w:normalized.canvas.width,h:normalized.canvas.height}};const data={},masks={};for(const [id,url] of Object.entries(raw.layerData||{}))data[id]=await canvasFromURL(url);for(const [id,url] of Object.entries(raw.maskData||{}))masks[id]=await canvasFromURL(url);ld.current=data;mks.current=masks;origS.current=raw.orig?await canvasFromURL(raw.orig):null;setProjectName(project.title||raw.name||file.name.replace(/\.auralith$/i,""));setSz(project.size||{w:1024,h:680});setLayers(raw.layers||project.layers||[{id:1,n:"Background",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(raw.activeLayer||raw.layers?.[0]?.id||project.layers?.[0]?.id||1);nid.current=raw.nextId||Math.max(2,...((raw.layers||project.layers||[]).map(l=>Number(l.id)||1)+[1]));sAdj(raw.adjustments||{br:100,ct:100,st:100,hu:0,bl:0,temp:0});sOvl(project.overlay||raw.overlay?.id||"none");sOOp(raw.overlay?.opacity??.5);setGuides(raw.guides||[]);setSnapOn(project.snap??raw.snap?.enabled??1);setSnapTol(raw.snap?.tolerance??9);setCaptionTone(raw.captionTone||"mythic");setFg(raw.colors?.fg||"#00d4aa");setBgC(raw.colors?.bg||"#0a0e1a");sTxt(raw.text?.txt||"PHI369");sTF(raw.text?.tF||"'IBM Plex Mono',monospace");sTSz(raw.text?.tSz||36);setTxtFx(raw.text?.txtFx||{stroke:0,strokeW:2,strokeC:"#ffffff",shadow:0,shadowB:4,gradient:0});setSavedBatches(raw.batches||[]);setVersions(raw.versions||[]);setQuickA(raw.quickActions||[]);setDomColors(raw.dominantColors||[]);setHasI(1);sHist([]);sHP(-1);sHNm([]);setTimeout(()=>{save("Open Project");extractDominant();},80);flash("Project loaded");}catch(e){console.warn("[Auralith369] Project import parse failure",{file:file.name,error:e});flash("Project load failed: file is not valid JSON.");}};
  const openAsset=file=>{if(!file)return;if(/\.auralith$/i.test(file.name)||file.type==="application/json")loadProject(file);else loadImg(file);};
  const applyStyleCard=card=>{setProjectName(p=>p||card.id);if(card.fg)setFg(card.fg);if(card.bg)setBgC(card.bg);if(card.adj)sAdj(card.adj);if(card.ovl)sOvl(card.ovl);if(card.oOp)sOOp(card.oOp);const lut=LUTS.find(l=>l.n===card.lut),gm=GRAD_MAPS.find(g=>g.n===card.grad),pl=PLUGINS.find(p=>p.name===card.plugin);setTimeout(()=>{if(lut)applyLUT(lut);if(gm)applyGradMap(gm);if(pl)applyPlugin(pl);comp();},20);flash("Style: "+card.n);};
  const forgePoster=pr=>{const old=renderCompositeCanvas({checker:0,background:bg_});save("Poster Forge");const c=document.createElement("canvas");c.width=pr.w;c.height=pr.h;const x=c.getContext("2d");const grd=x.createLinearGradient(0,0,pr.w,pr.h);grd.addColorStop(0,bg_);grd.addColorStop(.62,"#090e1b");grd.addColorStop(1,"#0d142c");x.fillStyle=grd;x.fillRect(0,0,pr.w,pr.h);const margin=Math.round(Math.min(pr.w,pr.h)*.08),capH=Math.round(pr.h*.72),sc=Math.min((pr.w-margin*2)/old.width,capH/old.height),dw=old.width*sc,dh=old.height*sc,dx=(pr.w-dw)/2,dy=Math.round(pr.h*LAM*.42-dh/2);x.shadowColor="#00000088";x.shadowBlur=24;x.drawImage(old,dx,Math.max(margin*1.3,dy),dw,dh);x.shadowBlur=0;x.strokeStyle=fg;x.globalAlpha=.45;x.lineWidth=2;x.strokeRect(margin,margin,pr.w-margin*2,pr.h-margin*2);x.globalAlpha=.18;[LAM*LAM,LAM,1-LAM*LAM].forEach(f=>{x.beginPath();x.moveTo(pr.w*f,margin);x.lineTo(pr.w*f,pr.h-margin);x.stroke();});x.globalAlpha=1;x.fillStyle=fg;x.font=`700 ${Math.round(pr.w*.055)}px ${FN}`;x.fillText(posterTitle||"PHI369",margin,pr.h-margin*1.55);x.fillStyle=C.tx;x.font=`${Math.round(pr.w*.022)}px ${FN}`;x.fillText(posterSub||"Sovereign image alchemy",margin,pr.h-margin*.9);x.fillStyle=C.tm;x.font=`${Math.round(pr.w*.015)}px ${FN}`;x.textAlign="right";x.fillText(`Φ=${PHI.toFixed(3)} · 369 · ${APP_VERSION}`,pr.w-margin,pr.h-margin*.9);ld.current={1:c};mks.current={};origS.current=null;setSz({w:pr.w,h:pr.h});setLayers([{id:1,n:`Poster Forge · ${pr.n}`,vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(1);nid.current=2;setHasI(1);setGuides([{type:"h",pos:Math.round(pr.h*LAM)},{type:"v",pos:Math.round(pr.w*LAM)}]);sOvl("phi");sOOp(.35);setTimeout(comp,60);flash(`Poster: ${pr.n}`);};
  const hashText=async s=>{const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");};
  const exportReceipt=async()=>{try{const image=renderCompositeCanvas({checker:0,background:eF==="JPEG"?"#fff":null}).toDataURL("image/png"),imageHash=await hashText(image),payload={kind:"auralith.receipt",version:APP_VERSION,createdAt:new Date().toISOString(),projectName,size:sz,constants:{PHI,LAM,Cstar:.809017,OmegaC:.376},imageHash,layers:layers.map(l=>({id:l.id,name:l.n,visible:!!l.vis,opacity:l.op,blend:l.bl,mask:!!l.mask,blendIf:[l.biLo,l.biHi],fx:l.fx})),adjustments:adj,overlay:{id:ovl,opacity:oOp},history:hNm.slice(-36),export:{format:eF,quality:eQ}};payload.receiptId=await hashText(JSON.stringify(payload));setLastReceipt(payload);downloadBlob(`${projectName||"auralith369"}.auralith-receipt.json`,"application/json",JSON.stringify(payload,null,2));flash("Receipt exported");}catch(e){console.error(e);flash("Receipt failed");}};
  const captureVersion=()=>{const img=renderCompositeCanvas({checker:0}).toDataURL("image/png");setVersions(p=>[{name:`Version ${p.length+1}`,at:new Date().toISOString(),size:{...sz},img},...p].slice(0,9));flash("Version captured");};
  const restoreVersion=async(v)=>{try{save("Restore Version");const c=await canvasFromURL(v.img);ld.current={1:c};mks.current={};origS.current=null;setSz(v.size||{w:c.width,h:c.height});setLayers([{id:1,n:v.name||"Restored Version",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(1);nid.current=2;setHasI(1);setTimeout(comp,60);flash("Version restored");}catch(e){console.error(e);flash("Restore failed");}};

  const addL=()=>{const id=nid.current++;setLayers(p=>[...p,{id,n:`Layer ${id}`,vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(id);};
  const addAdjL=preset=>{const id=nid.current++;save("Adjustment Layer");setLayers(p=>[...p,{id,n:preset.n,kind:"adjustment",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx},adj:{...preset.adj}}]);setAL(id);flash("Added "+preset.n);};
  const dupL=lid=>{const id=nid.current++;const s=ld.current[lid];if(s){const c=document.createElement("canvas");c.width=s.width;c.height=s.height;c.getContext("2d").drawImage(s,0,0);ld.current[id]=c;}const o=layers.find(l=>l.id===lid);setLayers(p=>[...p,{...JSON.parse(JSON.stringify(o)),id,n:(o?.n||"L")+" copy"}]);setAL(id);};
  const delL=id=>{if(layers.length<=1)return;setLayers(p=>p.filter(l=>l.id!==id));delete ld.current[id];if(aL===id)setAL(layers.find(l=>l.id!==id)?.id||1);setTimeout(comp,20);};
  const mergeV=()=>{save("Merge");const mc=renderCompositeCanvas({checker:0});ld.current={1:mc};mks.current={};setLayers([{id:1,n:"Merged",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(1);nid.current=2;comp();};
  const togMask=id=>{const l=layers.find(x=>x.id===id);if(!l.mask){eMk(id);setLayers(p=>p.map(x=>x.id===id?{...x,mask:1}:x));}else{setLayers(p=>p.map(x=>x.id===id?{...x,mask:0}:x));delete mks.current[id];}comp();};
  const setFx=(id,key,val)=>setLayers(p=>p.map(l=>l.id===id?{...l,fx:{...l.fx,[key]:val}}:l));
  const flipA=d=>{save("Flip");Object.keys(ld.current).forEach(k=>{const o=ld.current[k];const n=document.createElement("canvas");n.width=o.width;n.height=o.height;const c=n.getContext("2d");if(d==="h"){c.translate(n.width,0);c.scale(-1,1);}else{c.translate(0,n.height);c.scale(1,-1);}c.drawImage(o,0,0);ld.current[k]=n;});comp();};
  const rotA=deg=>{save("Rotate");const sw=Math.abs(deg)===90;Object.keys(ld.current).forEach(k=>{const o=ld.current[k];const n=document.createElement("canvas");n.width=sw?o.height:o.width;n.height=sw?o.width:o.height;const c=n.getContext("2d");c.translate(n.width/2,n.height/2);c.rotate(deg*Math.PI/180);c.drawImage(o,-o.width/2,-o.height/2);ld.current[k]=n;});if(sw)setSz({w:sz.h,h:sz.w});setTimeout(comp,30);};
  const newC=()=>{ld.current={};mks.current={};origS.current=null;setLayers([{id:1,n:"Background",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(1);nid.current=2;setHasI(0);sOvl("none");sAdj({br:100,ct:100,st:100,hu:0,bl:0,temp:0});setSz({w:1024,h:680});sHist([]);sHP(-1);sHNm([]);sSel(null);sCrR(null);sPenP([]);setSplitV(0);setCRot(0);setGuides([]);setDomColors([]);flash("New Canvas");};
  const apRsz=()=>{save("Resize");const nw=parseInt(rW)||1024,nh=parseInt(rH_)||680;Object.keys(ld.current).forEach(k=>{const o=ld.current[k];const n=document.createElement("canvas");n.width=nw;n.height=nh;n.getContext("2d").drawImage(o,0,0,nw,nh);ld.current[k]=n;});setSz({w:nw,h:nh});sShowR(0);setTimeout(comp,30);};
  const downloadCanvas=(c,name,fmt=eF,q=eQ)=>{const a=document.createElement("a"),mime=fmt==="PNG"?"image/png":fmt==="JPEG"?"image/jpeg":"image/webp";a.download=name;a.href=c.toDataURL(mime,fmt==="PNG"?undefined:q/100);a.click();};
  const doExp=()=>{const ec=renderCompositeCanvas({checker:0,background:eF==="JPEG"?"#fff":null});downloadCanvas(ec,`${projectName||"auralith369"}.${eF.toLowerCase()}`);flash("Exported!");};
  const exportSocialPack=()=>{const src=renderCompositeCanvas({checker:0,background:bg_});SOCIAL_EXPORTS.forEach((pr,i)=>setTimeout(()=>{const c=document.createElement("canvas");c.width=pr.w;c.height=pr.h;const x=c.getContext("2d");x.fillStyle=bg_;x.fillRect(0,0,pr.w,pr.h);const m=Math.round(Math.min(pr.w,pr.h)*.06),sc=Math.min((pr.w-m*2)/src.width,(pr.h-m*2)/src.height),dw=src.width*sc,dh=src.height*sc;x.drawImage(src,(pr.w-dw)/2,(pr.h-dh)/2,dw,dh);x.fillStyle=C.tm;x.font=`${Math.round(pr.w*.012)}px ${FN}`;x.textAlign="right";x.fillText(`Auralith369 ${APP_VERSION} · 369`,pr.w-m,pr.h-m*.45);downloadCanvas(c,`${projectName||"auralith369"}.${pr.id}.png`,"PNG");},i*140));flash("Social pack exported");};
  const makeCaption=()=>{const base=CAPTION_TONES[captionTone]||CAPTION_TONES.mythic;const pal=domColors.length?` Palette: ${domColors.slice(0,5).join(" · ")}.`:"";return `${base}\n\n${posterTitle?posterTitle+" — ":""}${posterSub||""}${pal}\n\n#PHI369 #Auralith369 #DigitalAlchemy #SacredGeometry`;};
  const copyCaption=async()=>{try{await navigator.clipboard.writeText(makeCaption());flash("Caption copied");}catch(e){flash("Copy failed");}};
  const exportManifest=async()=>{const payload={projectName,version:APP_VERSION,size:sz,createdAt:new Date().toISOString(),constants:{PHI,LAM,Cstar:.809017,OmegaC:.376},layers:layers.map(l=>({id:l.id,name:l.n,kind:l.kind||"pixel",visible:!!l.vis,opacity:l.op,blend:l.bl,adjustment:l.adj||null})),adjustments:adj,overlay:{id:ovl,opacity:oOp},guides,snap:{enabled:!!snapOn,tolerance:snapTol},dominantColors:domColors,caption:makeCaption(),historyTail:hNm.slice(-18)};payload.manifestId=await hashText(JSON.stringify(payload));const md=[`# ${projectName||"Auralith369 Manifest"}`,"",`- Version: ${APP_VERSION}`,`- Manifest ID: ${payload.manifestId}`,`- Canvas: ${sz.w}×${sz.h}`,`- Constants: Φ=${PHI}, λ=${LAM}, C*=0.809017, Ω_c=0.376`,`- Layers: ${layers.length}`,`- Overlay: ${ovl} @ ${Math.round(oOp*100)}%`,`- Snap: ${snapOn?"on":"off"} / ${snapTol}px`,"","## Caption","",payload.caption,"","## Layers",...payload.layers.map(l=>`- ${l.kind}: ${l.name} · visible=${l.visible} · opacity=${Math.round(l.opacity*100)}% · blend=${l.blend}`),"","## Palette",domColors.join(" · ")||"Not extracted yet"].join("\n");setLastManifest(payload.manifestId);downloadBlob(`${projectName||"auralith369"}.auralith-manifest.md`,"text/markdown",md);flash("Manifest exported");};

  // Keyboard
  useEffect(()=>{const h=e=>{if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;if(e.ctrlKey||e.metaKey){if(e.key==="z"){e.preventDefault();e.shiftKey?redo():undo();}if(e.key==="c"&&sel){e.preventDefault();selCp();}if(e.key==="x"&&sel){e.preventDefault();selCut();}if(e.key==="v"){e.preventDefault();selPst();}if(e.key==="n"){e.preventDefault();newC();}if(e.key==="e"){e.preventDefault();doExp();}if(e.key==="s"){e.preventDefault();exportProject();}if(e.key==="="||e.key==="+"){e.preventDefault();setZm(z=>Math.min(z+.25,12));}if(e.key==="-"){e.preventDefault();setZm(z=>Math.max(z-.25,.05));}if(e.key==="d"){e.preventDefault();sSel(null);}return;}const t=TLS.find(t=>t.k===e.key.toUpperCase());if(t)setTl(t.id);if(e.key==="x"){setFg(bg_);setBgC(fg);}if(e.key==="[")setBSz(s=>Math.max(1,s-3));if(e.key==="]")setBSz(s=>Math.min(200,s+3));if(e.key==="Escape"){sSel(null);sCrR(null);sPlc(0);sShpP(null);sGPr(null);sPenP([]);sXfing(0);setLassoPts([]);setRulerStart(null);setRulerEnd(null);}if(e.key==="Enter"){if(crR)applyCrop();if(penP.length>1)strokePen();if(xfing)applyXf();}if(e.key==="Delete"&&sel)selDel();if(e.key==="/")sShowK(v=>!v);if(e.key==="\\")setSplitV(v=>v?0:1);if(e.key===","&&cRot>-45)setCRot(r=>r-15);if(e.key==="."&&cRot<45)setCRot(r=>r+15);if(e.key==="0"&&!e.ctrlKey)setCRot(0);};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[undo,redo,fg,bg_,crR,sel,penP,xfing,cRot]);
  useEffect(()=>{const h=e=>{const items=e.clipboardData?.items;if(!items)return;for(const item of items){if(item.type.startsWith("image/")){e.preventDefault();const blob=item.getAsFile();const img=new Image();img.onload=()=>{save("Paste");const id=nid.current++;const c=document.createElement("canvas");c.width=sz.w;c.height=sz.h;c.getContext("2d").drawImage(img,0,0);ld.current[id]=c;setLayers(p=>[...p,{id,n:"Pasted",vis:1,op:1,bl:"normal",mask:0,biLo:0,biHi:255,fx:{...dfx}}]);setAL(id);comp();};img.src=URL.createObjectURL(blob);break;}}};window.addEventListener("paste",h);return()=>window.removeEventListener("paste",h);},[sz]);

  const cursor=useMemo(()=>{if(["brush","eraser","fill","gradient","clone","smudge","dodge","burn","liquify","colorReplace","lasso","wand","heal","caFill","ruler"].includes(tl))return"crosshair";if(tl==="text")return plc?"crosshair":"text";if(["picker","select","crop","shape","pen"].includes(tl))return"crosshair";if(tl==="move")return"grab";return"default";},[tl,plc]);

  const curL=layers.find(l=>l.id===aL);
  const filteredLayers=layerSearch?layers.filter(l=>l.n.toLowerCase().includes(layerSearch.toLowerCase())):layers;
  const Hist_=()=>{if(!histD)return null;const mx=Math.max(...histD.r,...histD.g,...histD.b,1);return(<div style={{height:22,background:C.srf,borderRadius:1,overflow:"hidden",marginTop:1}}><svg width="100%" height="22" viewBox="0 0 256 22" preserveAspectRatio="none">{[{d:histD.r,c:"#ef444450"},{d:histD.g,c:"#10b98150"},{d:histD.b,c:"#3b82f650"}].map(({d,c},i)=>(<path key={i} d={`M0,22 ${d.map((v,j)=>`L${j},${22-v/mx*20}`).join(" ")} L255,22Z`} fill={c}/>))}</svg></div>);};

  return(<div className="auralith-editor-root" style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",background:C.bg,color:C.tx,fontFamily:FN,fontSize:11,lineHeight:1.35,overflow:"hidden",userSelect:"none",zoom:1.35}}
    onDrop={e=>{e.preventDefault();setDrOv(0);if(e.dataTransfer.files[0])openAsset(e.dataTransfer.files[0]);}} onDragOver={e=>{e.preventDefault();setDrOv(1);}} onDragLeave={()=>setDrOv(0)}>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
    <style>{`input[type="range"]::-webkit-slider-thumb{appearance:none;width:6px;height:6px;background:${C.ac};border-radius:50%;cursor:pointer;border:1px solid ${C.bg}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.bd};border-radius:2px}select{background:${C.srf};color:${C.tx};border:1px solid ${C.bd};border-radius:2px;padding:1px 2px;font-family:${FN};font-size:6.5px;outline:none}`}</style>

    {/* TOP */}
    <div style={{display:"flex",alignItems:"center",gap:1,padding:"8px 12px",borderBottom:`1px solid ${C.bd}`,background:C.pn,flexShrink:0,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:3,marginRight:3}}>
        <div style={{width:17,height:17,borderRadius:3,background:`linear-gradient(135deg,${C.ac},${C.pr})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.bg}}>Φ</div>
        <span style={{fontSize:12,fontWeight:600,letterSpacing:.5}}>Auralith369</span>
        <span style={{fontSize:10,color:C.tm,padding:"2px 6px",border:`1px solid ${C.bd}`,borderRadius:1}}>{APP_VERSION}</span>
      </div>
      <Bt onClick={newC} sm style={{fontSize:12}}>New</Bt><Bt onClick={()=>fR.current?.click()} sm style={{fontSize:12}}>Open</Bt><Bt onClick={exportProject} sm style={{fontSize:12}}>Save .auralith</Bt><Bt onClick={doExp} sm style={{color:C.ac,fontSize:12}}>Export</Bt><Bt onClick={exportReceipt} sm style={{color:C.gd,fontSize:12}}>Receipt</Bt>
      <input ref={fR} type="file" accept=".auralith,application/json,image/*" style={{display:"none"}} onChange={e=>{openAsset(e.target.files?.[0]);e.target.value="";}}/>
      <div style={{width:1,height:11,background:C.bd}}/>
      <Bt onClick={undo} sm>↶</Bt><Bt onClick={redo} sm>↷</Bt>
      <div style={{width:1,height:11,background:C.bd}}/>
      <Bt onClick={()=>sShowR(1)} sm>Rsz</Bt><Bt onClick={()=>flipA("h")} sm>↔</Bt><Bt onClick={()=>flipA("v")} sm>↕</Bt><Bt onClick={()=>rotA(90)} sm>↻</Bt><Bt onClick={mergeV} sm>⊟</Bt>
      <Bt onClick={()=>setSplitV(v=>v?0:1)} sm a={splitV}>⫿</Bt><Bt onClick={()=>setSnapOn(v=>v?0:1)} sm a={snapOn} title="Snap to guides, Φ, center, and 369 grid">Snap</Bt>
      {splitV&&<input type="range" min={5} max={95} value={splitP} onChange={e=>setSplitP(+e.target.value)} style={{width:30,height:2,appearance:"none",background:C.srf,outline:"none"}}/>}
      {crR&&<Bt onClick={applyCrop} sm style={{color:C.ac}}>✓Crop</Bt>}
      {sel&&<><Bt onClick={selCp} sm>Cp</Bt><Bt onClick={selCut} sm>Cut</Bt><Bt onClick={selPst} sm>Pst</Bt><Bt onClick={selDel} sm style={{color:C.rd}}>Del</Bt><Bt onClick={selFl} sm>Fill</Bt><Bt onClick={doCAFill} sm style={{color:C.gd}}>✨CA</Bt><Bt onClick={()=>sSel(null)} sm>Des</Bt></>}
      {penP.length>1&&<Bt onClick={strokePen} sm style={{color:C.ac}}>✓Path</Bt>}
      {xfing?<><Bt onClick={applyXf} sm style={{color:C.ac}}>✓Xfm</Bt><input type="range" min={-180} max={180} value={xfA} onChange={e=>sXfA(+e.target.value)} style={{width:35,height:2,appearance:"none",background:C.srf,outline:"none"}}/><span style={{fontSize:5.5,color:C.ac}}>{xfA}°</span><input type="range" min={10} max={300} value={xfSc} onChange={e=>sXfSc(+e.target.value)} style={{width:25,height:2,appearance:"none",background:C.srf,outline:"none"}}/><span style={{fontSize:5.5,color:C.ac}}>{xfSc}%</span></>:null}
      {/* Batch */}
      <div style={{width:1,height:11,background:C.bd}}/>
      <Bt onClick={()=>{if(batchRec){setBatchRec(0);if(batchActions.length>0)setSavedBatches(p=>[...p,{n:`Batch ${p.length+1}`,acts:[...batchActions]}]);setBatchActions([]);flash("Batch saved");}else{setBatchRec(1);setBatchActions([]);flash("Recording...");}}} sm a={batchRec} style={{color:batchRec?C.rd:C.td}}>{batchRec?"⏹ Stop":"⏺ Rec"}</Bt>
      {savedBatches.length>0&&<select onChange={e=>{if(e.target.value)playBatch(savedBatches[+e.target.value].acts);e.target.value="";}} style={{fontSize:5.5}}><option value="">▶ Batch...</option>{savedBatches.map((b,i)=>(<option key={i} value={i}>{b.n} ({b.acts.length})</option>))}</select>}
      {quickA.length>0&&<>{quickA.slice(0,3).map((a,i)=>(<Bt key={i} sm onClick={()=>{const pf=Object.entries(PF).find(([,v])=>v.n===a);if(pf)apPxF(pf[0]);const pl=PLUGINS.find(p=>p.name===a);if(pl)applyPlugin(pl);}}>{a}</Bt>))}</>}
      <div style={{flex:1}}/>
      <Bt onClick={()=>sShowK(v=>!v)} sm>⌨</Bt>
      <Bt onClick={()=>setZm(z=>Math.max(z-.25,.05))} sm>−</Bt><span style={{minWidth:36,textAlign:"center",fontSize:12,fontWeight:600}}>{Math.round(zm*100)}%</span><Bt onClick={()=>setZm(z=>Math.min(z+.25,12))} sm>+</Bt>
      <span style={{fontSize:5,color:C.tm,marginLeft:2}}>{sz.w}×{sz.h}</span>
    </div>

    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      {/* LEFT */}
      <div style={{width:44,background:C.pn,borderRight:`1px solid ${C.bd}`,display:"flex",flexDirection:"column",alignItems:"center",padding:"2px 0",gap:0,flexShrink:0,overflow:"auto"}}>
        {TLS.map(t=>(<button key={t.id} title={`${t.n} (${t.k})`} onClick={()=>setTl(t.id)} style={{width:34,height:28,display:"flex",alignItems:"center",justifyContent:"center",background:tl===t.id?C.sa:"transparent",border:tl===t.id?`1px solid ${C.ac}22`:"1px solid transparent",borderRadius:2,cursor:"pointer",fontSize:14,color:tl===t.id?C.ac:C.td,flexShrink:0,boxShadow:tl===t.id?`0 0 0 1px ${C.ac}55 inset`:"none"}}>{t.ic}</button>))}
        <div style={{flex:1}}/>
        <div style={{position:"relative",width:20,height:20,margin:"2px 0"}}><div style={{position:"absolute",top:0,left:0,width:13,height:13,borderRadius:2,background:fg,border:`1px solid ${C.bd}`,zIndex:2,cursor:"pointer"}} onClick={()=>document.getElementById("fg7")?.click()}/><div style={{position:"absolute",bottom:0,right:0,width:13,height:13,borderRadius:2,background:bg_,border:`1px solid ${C.bd}`,cursor:"pointer"}} onClick={()=>document.getElementById("bg7")?.click()}/><input id="fg7" type="color" value={fg} onChange={e=>setFg(e.target.value)} style={{position:"absolute",opacity:0,width:0}}/><input id="bg7" type="color" value={bg_} onChange={e=>setBgC(e.target.value)} style={{position:"absolute",opacity:0,width:0}}/></div>
        <button onClick={()=>{const t=fg;setFg(bg_);setBgC(t);}} style={{background:"none",border:"none",color:C.tm,cursor:"pointer",fontSize:7,fontFamily:FN}}>⇄</button>
      </div>

      {/* CENTER */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:2,padding:"1px 5px",borderBottom:`1px solid ${C.bd}`,background:C.pa,flexShrink:0,minHeight:20,flexWrap:"wrap",fontSize:7}}>
          {["brush","eraser"].includes(tl)&&<><div style={{display:"flex",gap:0}}>{BRS.map((b,i)=>(<button key={i} onClick={()=>{setBI(i);setBSz(b.sz);setBOp(b.op);setBHd(b.hd);if(b.er)setTl("eraser");else setTl("brush");}} style={{padding:"0 2px",background:bI===i?C.sa:"transparent",border:bI===i?`1px solid ${C.ac}22`:"1px solid transparent",borderRadius:1,cursor:"pointer",fontSize:5.5,color:bI===i?C.ac:C.td,fontFamily:FN}}>{b.n}</button>))}</div>
            <input type="range" min={1} max={150} value={bSz} onChange={e=>setBSz(+e.target.value)} style={{width:35,height:2,appearance:"none",background:C.srf,outline:"none"}}/><span style={{color:C.ac,fontSize:5.5}}>{bSz}</span>
            <input type="range" min={1} max={100} value={bOp*100} onChange={e=>setBOp(e.target.value/100)} style={{width:25,height:2,appearance:"none",background:C.srf,outline:"none"}}/><span style={{color:C.ac,fontSize:5.5}}>{Math.round(bOp*100)}%</span>
            <select value={symM} onChange={e=>setSymM(+e.target.value)} style={{fontSize:5.5}}>{SYM.map(m=><option key={m.v} value={m.v}>{m.n}</option>)}</select>
            {eMask&&<span style={{fontSize:5.5,color:C.gd,fontWeight:700}}>MASK</span>}
          </>}
          {tl==="heal"&&<><span style={{fontSize:6,color:C.td}}>Spot Heal</span><input type="range" min={4} max={60} value={bSz} onChange={e=>setBSz(+e.target.value)} style={{width:35,height:2,appearance:"none",background:C.srf,outline:"none"}}/><span style={{color:C.ac,fontSize:5.5}}>{bSz}px</span></>}
          {tl==="text"&&<><input value={txt} onChange={e=>sTxt(e.target.value)} style={{background:C.srf,border:`1px solid ${C.bd}`,borderRadius:1,padding:"0 2px",color:C.tx,fontFamily:FN,fontSize:6.5,width:70}}/><input type="number" value={tSz} onChange={e=>sTSz(+e.target.value)} min={8} max={300} style={{width:24,background:C.srf,border:`1px solid ${C.bd}`,borderRadius:1,color:C.tx,fontFamily:FN,fontSize:5.5}}/><Bt a={plc} onClick={()=>sPlc(!plc)} sm>{plc?"Click →":"Place"}</Bt><Bt a={txtFx.stroke} onClick={()=>setTxtFx(p=>({...p,stroke:p.stroke?0:1}))} sm>Stroke</Bt><Bt a={txtFx.shadow} onClick={()=>setTxtFx(p=>({...p,shadow:p.shadow?0:1}))} sm>Shadow</Bt><Bt a={txtFx.gradient} onClick={()=>setTxtFx(p=>({...p,gradient:p.gradient?0:1}))} sm>Gradient</Bt></>}
          {tl==="shape"&&<>{SHP.map(s=>(<Bt key={s} a={shp===s} onClick={()=>sShp(s)} sm>{s}</Bt>))}<Bt a={shpF} onClick={()=>sShpF(!shpF)} sm>{shpF?"Fill":"Strk"}</Bt></>}
          {tl==="gradient"&&<>{GRD.map(t=>(<Bt key={t} a={gT===t} onClick={()=>sGT(t)} sm>{t}</Bt>))}</>}
          {tl==="select"&&<><span style={{fontSize:5.5,color:C.td}}>Feather</span><input type="range" min={0} max={30} value={selFeather} onChange={e=>setSelFeather(+e.target.value)} style={{width:35,height:2,appearance:"none",background:C.srf,outline:"none"}}/><span style={{fontSize:5.5,color:C.ac}}>{selFeather}px</span></>}
          {tl==="ruler"&&<span style={{fontSize:6,color:C.or}}>Drag to measure{rulerStart&&rulerEnd?` — ${Math.round(Math.hypot(rulerEnd.x-rulerStart.x,rulerEnd.y-rulerStart.y))}px`:""}</span>}
          {tl==="wand"&&<><span style={{fontSize:6,color:C.td}}>Tol</span><input type="range" min={5} max={200} value={wandTol} onChange={e=>setWandTol(+e.target.value)} style={{width:40,height:2,appearance:"none",background:C.srf,outline:"none"}}/><span style={{color:C.ac,fontSize:5.5}}>{wandTol}</span></>}
          {["smudge","dodge","burn","liquify","colorReplace","clone"].includes(tl)&&<><span style={{fontSize:6,color:C.td}}>{TLS.find(t=>t.id===tl)?.n}</span><input type="range" min={4} max={100} value={bSz} onChange={e=>setBSz(+e.target.value)} style={{width:35,height:2,appearance:"none",background:C.srf,outline:"none"}}/><span style={{color:C.ac,fontSize:5.5}}>{bSz}</span></>}
        </div>

        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",overflow:"auto",background:`radial-gradient(ellipse at center,${C.srf}28 0%,${C.bg} 100%)`,position:"relative"}} onWheel={onWheel}>
          {drOv&&<div style={{position:"absolute",inset:0,background:`${C.ac}08`,border:`2px dashed ${C.ac}`,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,pointerEvents:"none"}}><span style={{fontSize:12,color:C.ac}}>Drop</span></div>}
          {!hasI&&!ld.current[1]&&<div style={{position:"absolute",zIndex:6,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center",inset:0,padding:20}}><div style={{maxWidth:420,width:"100%",background:"rgba(12,18,34,.88)",border:`1px solid ${C.bd}`,borderRadius:12,padding:"18px 20px",boxShadow:"0 10px 30px rgba(0,0,0,.35)",textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:C.tx,marginBottom:4}}>Auralith369</div><div style={{fontSize:13,color:C.ac,marginBottom:12}}>Local-first visual alchemy</div><div style={{fontSize:12,color:C.td,lineHeight:1.6}}>• Drop an image here<br/>• Open a .auralith project<br/>• Paste from clipboard with Ctrl+V</div><div style={{fontSize:11,color:C.tm,marginTop:10}}>Your work stays local in the browser.</div></div></div>}
          <div style={{transform:`scale(${zm}) rotate(${cRot}deg)`,transformOrigin:"center",position:"relative",boxShadow:`0 0 14px ${C.ag}`,transition:"transform .2s"}}>
            <canvas ref={mcR} width={sz.w} height={sz.h} style={{display:"block",cursor}} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}/>
            <canvas ref={olR} width={sz.w} height={sz.h} style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}/>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{width:280,background:C.pn,borderLeft:`1px solid ${C.bd}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        <div style={{display:"flex",borderBottom:`1px solid ${C.bd}`}}>
          {["layers","fx","lut","style","forge","adj","plug","act","exp"].map(t=>(<button key={t} onClick={()=>sRT(t)} style={{flex:1,padding:"6px 0",background:"transparent",border:"none",borderBottom:rT===t?`2px solid ${C.ac}`:"2px solid transparent",color:rT===t?C.ac:C.tm,fontSize:10,cursor:"pointer",fontWeight:600,fontFamily:FN,textTransform:"uppercase"}}>{t}</button>))}
        </div>
        <div style={{flex:1,overflow:"auto",padding:4}}>

          {rT==="layers"&&<>
            <div style={{display:"flex",gap:1,marginBottom:2,flexWrap:"wrap"}}><Bt onClick={addL} sm>+</Bt><select onChange={e=>{const p=ADJ_LAYER_PRESETS.find(x=>x.id===e.target.value);if(p)addAdjL(p);e.target.value="";}} style={{fontSize:5.5,maxWidth:58}}><option value="">+ Look</option>{ADJ_LAYER_PRESETS.map(p=><option key={p.id} value={p.id}>{p.n}</option>)}</select><Bt onClick={()=>dupL(aL)} sm>Dup</Bt><Bt onClick={()=>togMask(aL)} sm style={{color:curL?.mask?C.gd:C.td}}>🎭</Bt><Bt onClick={()=>sEMask(!eMask)} sm a={eMask}>Mk</Bt>
              <Bt onClick={()=>setGuides(p=>[...p,{type:"h",pos:Math.round(sz.h/2)}])} sm title="Add horizontal guide">─</Bt>
              <Bt onClick={()=>setGuides(p=>[...p,{type:"v",pos:Math.round(sz.w/2)}])} sm title="Add vertical guide">│</Bt>
              {guides.length>0&&<Bt onClick={()=>setGuides([])} sm style={{color:C.rd}}>✕ guides</Bt>}
            </div>
            <input value={layerSearch} onChange={e=>setLayerSearch(e.target.value)} placeholder="Search layers..." style={{width:"100%",padding:"1px 3px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:2,color:C.tx,fontFamily:FN,fontSize:11,marginBottom:6,outline:"none"}}/>
            <canvas ref={mnR} style={{width:"100%",display:"block",borderRadius:1,border:`1px solid ${C.bd}`,marginBottom:1}}/>
            <Hist_/>
            {domColors.length>0&&<div style={{display:"flex",gap:1,marginTop:2}}>{domColors.map((c,i)=>(<div key={i} onClick={()=>setFg(c)} style={{width:12,height:12,borderRadius:2,background:c,cursor:"pointer",border:fg===c?`1.5px solid ${C.ac}`:`1px solid ${C.bd}`}} title={c}/>))}</div>}
            <div style={{display:"flex",flexDirection:"column-reverse",gap:1,marginTop:2}}>
              {filteredLayers.map(l=>(<div key={l.id} onClick={()=>setAL(l.id)} style={{padding:"2px 3px",background:aL===l.id?C.sa:C.srf,borderRadius:2,border:aL===l.id?`1px solid ${C.ac}22`:`1px solid ${C.bd}`,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:2}}>
                  <button onClick={e=>{e.stopPropagation();setLayers(p=>p.map(x=>x.id===l.id?{...x,vis:x.vis?0:1}:x));}} style={{background:"none",border:"none",cursor:"pointer",color:l.vis?C.ac:C.tm,fontSize:8,padding:0}}>{l.vis?"👁":"◌"}</button>
                  {l.kind==="adjustment"?<span style={{fontSize:5,color:C.gd}}>☀</span>:(l.mask?<span style={{fontSize:5,color:C.gd}}>🎭</span>:null)}
                  {aL===l.id?<input value={l.n} onChange={e=>setLayers(p=>p.map(x=>x.id===l.id?{...x,n:e.target.value}:x))} onClick={e=>e.stopPropagation()} style={{flex:1,fontSize:10,color:C.tx,background:"transparent",border:`1px solid ${C.bd}`,borderRadius:1,padding:"0 1px",fontFamily:FN,outline:"none"}}/>:<span style={{flex:1,fontSize:10,color:C.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.n}</span>}
                  <button onClick={e=>{e.stopPropagation();setLayers(p=>{const i=p.findIndex(x=>x.id===l.id);if(i>=p.length-1)return p;const n=[...p];[n[i],n[i+1]]=[n[i+1],n[i]];return n;});}} style={{background:"none",border:"none",color:C.tm,cursor:"pointer",fontSize:5}}>▲</button>
                  <button onClick={e=>{e.stopPropagation();setLayers(p=>{const i=p.findIndex(x=>x.id===l.id);if(i<=0)return p;const n=[...p];[n[i],n[i-1]]=[n[i-1],n[i]];return n;});}} style={{background:"none",border:"none",color:C.tm,cursor:"pointer",fontSize:5}}>▼</button>
                  {layers.length>1&&<button onClick={e=>{e.stopPropagation();delL(l.id);}} style={{background:"none",border:"none",color:C.rd,cursor:"pointer",fontSize:7}}>✕</button>}
                </div>
                {aL===l.id&&<div style={{marginTop:2}}>
                  <Sl l="Opacity" v={l.op*100} mn={0} mx={100} ch={v=>setLayers(p=>p.map(x=>x.id===l.id?{...x,op:v/100}:x))} u="%"/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:10,color:C.tm}}>Blend</span><select value={l.bl} onChange={e=>setLayers(p=>p.map(x=>x.id===l.id?{...x,bl:e.target.value}:x))}>{BLN.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                  {l.kind==="adjustment"&&<div style={{marginTop:2,padding:2,background:C.bg,borderRadius:2,border:`1px solid ${C.bd}`}}><div style={{fontSize:5.5,color:C.gd,marginBottom:1}}>Non-destructive Look Layer</div><Sl l="Adj Bright" v={l.adj?.br??100} mn={50} mx={160} ch={v=>setLayers(p=>p.map(x=>x.id===l.id?{...x,adj:{...(x.adj||{}),br:v}}:x))} u="%"/><Sl l="Adj Contrast" v={l.adj?.ct??100} mn={50} mx={180} ch={v=>setLayers(p=>p.map(x=>x.id===l.id?{...x,adj:{...(x.adj||{}),ct:v}}:x))} u="%"/><Sl l="Adj Sat" v={l.adj?.st??100} mn={0} mx={200} ch={v=>setLayers(p=>p.map(x=>x.id===l.id?{...x,adj:{...(x.adj||{}),st:v}}:x))} u="%"/><Sl l="Vignette" v={Math.round((l.adj?.vignette??0)*100)} mn={0} mx={85} ch={v=>setLayers(p=>p.map(x=>x.id===l.id?{...x,adj:{...(x.adj||{}),vignette:v/100}}:x))} u="%" c={C.gd}/></div>}
                  <Sl l="BI Lo" v={l.biLo} mn={0} mx={255} ch={v=>setLayers(p=>p.map(x=>x.id===l.id?{...x,biLo:v}:x))} c={C.gd}/>
                  <Sl l="BI Hi" v={l.biHi} mn={0} mx={255} ch={v=>setLayers(p=>p.map(x=>x.id===l.id?{...x,biHi:v}:x))} c={C.gd}/>
                  <div style={{display:"flex",gap:1,marginTop:1}}><Bt sm a={l.fx?.shadow} onClick={()=>setFx(l.id,"shadow",l.fx?.shadow?0:1)}>Shd</Bt><Bt sm a={l.fx?.glow} onClick={()=>setFx(l.id,"glow",l.fx?.glow?0:1)}>Glow</Bt></div>
                </div>}
              </div>))}
            </div>
          </>}

          {rT==="fx"&&<>
            <Hd ic="⚙">Filters ({Object.keys(PF).length})</Hd>
            <div style={{display:"flex",flexWrap:"wrap",gap:1}}>{Object.entries(PF).map(([k,f])=>(<button key={k} onClick={()=>apPxF(k)} title={f.n} style={{padding:"2px 3px",background:"transparent",border:`1px solid ${C.bd}`,borderRadius:2,cursor:"pointer",fontSize:6,color:C.td,fontFamily:FN}} onMouseEnter={e=>{e.currentTarget.style.background=C.sh;e.currentTarget.style.color=C.ac;}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.td;}}>{f.c} {f.n}</button>))}</div>
            <Hd ic="📈">Curves</Hd>
            <svg width="100%" height="65" viewBox="0 0 140 65" style={{background:"#080b14",borderRadius:2,cursor:"crosshair",display:"block"}}
              onMouseDown={e=>{const r=e.currentTarget.getBoundingClientRect();const x=((e.clientX-r.left)/r.width)*255,y=(1-(e.clientY-r.top)/r.height)*255;let ci=-1,md=Infinity;curvP.forEach((p,i)=>{const d=Math.hypot(p.x-x,p.y-y);if(d<md){md=d;ci=i;}});if(md<25)dcI.current=ci;else{sCurvP(p=>[...p,{x:Math.round(x),y:Math.round(y)}]);dcI.current=curvP.length;}}}
              onMouseMove={e=>{if(dcI.current===null)return;const r=e.currentTarget.getBoundingClientRect();sCurvP(p=>p.map((pt,i)=>i===dcI.current?{x:cl(Math.round(((e.clientX-r.left)/r.width)*255),0,255),y:cl(Math.round((1-(e.clientY-r.top)/r.height)*255),0,255)}:pt));}}
              onMouseUp={()=>dcI.current=null}>
              <line x1={0} y1={65} x2={140} y2={0} stroke={C.tm} strokeWidth={.3} strokeDasharray="2,2"/>
              <polyline points={[...curvP].sort((a,b)=>a.x-b.x).map(p=>`${(p.x/255)*140},${65-(p.y/255)*65}`).join(" ")} fill="none" stroke={C.ac} strokeWidth={1}/>
              {curvP.map((p,i)=>(<circle key={i} cx={(p.x/255)*140} cy={65-(p.y/255)*65} r={2.5} fill={C.ac} stroke={C.bg} strokeWidth={1}/>))}
            </svg>
            <div style={{display:"flex",gap:1,marginTop:1}}><Bt sm onClick={applyCurv}>Apply</Bt><Bt sm onClick={()=>sCurvP([{x:0,y:0},{x:85,y:85},{x:170,y:170},{x:255,y:255}])}>Reset</Bt></div>
          </>}

          {rT==="lut"&&<>
            <Hd ic="🎬">Cinematic LUTs</Hd>
            <div style={{display:"flex",flexDirection:"column",gap:1}}>{LUTS.map((l,i)=>(<button key={i} onClick={()=>applyLUT(l)} style={{padding:"3px 5px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:2,cursor:"pointer",fontSize:7,color:C.td,fontFamily:FN,textAlign:"left"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.ac+"40";e.currentTarget.style.color=C.ac;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bd;e.currentTarget.style.color=C.td;}}>🎬 {l.n}</button>))}</div>
            <Hd ic="🌈">Gradient Maps</Hd>
            <div style={{display:"flex",flexDirection:"column",gap:1}}>{GRAD_MAPS.map((gm,i)=>(<button key={i} onClick={()=>applyGradMap(gm)} style={{padding:"3px 5px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:2,cursor:"pointer",fontSize:7,color:C.td,fontFamily:FN,textAlign:"left",display:"flex",alignItems:"center",gap:4}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.ac+"40";e.currentTarget.style.color=C.ac;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bd;e.currentTarget.style.color=C.td;}}>
              <div style={{width:40,height:10,borderRadius:2,background:`linear-gradient(90deg,${gm.stops.map(s=>s[1]).join(",")})`}}/>
              {gm.n}
            </button>))}</div>
          </>}


          {rT==="style"&&<>
            <Hd ic="✨">Style Cards</Hd>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>{STYLE_CARDS.map(card=>(<button key={card.id} onClick={()=>applyStyleCard(card)} style={{padding:"4px 5px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:3,cursor:"pointer",textAlign:"left",fontFamily:FN}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:7,color:C.tx}}>{card.n}</span><span style={{width:42,height:8,borderRadius:2,background:`linear-gradient(90deg,${card.fg},${card.bg})`}}/></div>
              <div style={{fontSize:5.5,color:C.tm,marginTop:1}}>{card.desc}</div>
            </button>))}</div>
            <div style={{marginTop:4,padding:3,background:C.srf,borderRadius:2,fontSize:5.5,color:C.tm}}>Cards set color, live adjustments, overlays, and optional LUT/plugin chains.</div>
          </>}

          {rT==="forge"&&<>
            <Hd ic="▣">Poster Forge</Hd>
            <input value={posterTitle} onChange={e=>setPosterTitle(e.target.value)} placeholder="Poster title" style={{width:"100%",padding:"2px 3px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:2,color:C.tx,fontFamily:FN,fontSize:6.5,marginBottom:2}}/>
            <input value={posterSub} onChange={e=>setPosterSub(e.target.value)} placeholder="Subtitle" style={{width:"100%",padding:"2px 3px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:2,color:C.tx,fontFamily:FN,fontSize:6.5,marginBottom:3}}/>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>{POSTER_PRESETS.map(pr=>(<button key={pr.id} onClick={()=>forgePoster(pr)} style={{padding:"4px 5px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:3,cursor:"pointer",textAlign:"left",fontFamily:FN}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:7,color:C.tx}}>{pr.n}</span><span style={{fontSize:5.5,color:C.ac}}>{pr.w}×{pr.h}</span></div>
              <div style={{fontSize:5.5,color:C.tm}}>{pr.desc} · flattens current composite into a poster master</div>
            </button>))}</div>
          </>}

          {rT==="adj"&&<>
            <Hd ic="☀">Adjustments</Hd>
            <Sl l="Brightness" v={adj.br} mn={0} mx={200} ch={v=>setA("br",v)} u="%"/>
            <Sl l="Contrast" v={adj.ct} mn={0} mx={200} ch={v=>setA("ct",v)} u="%"/>
            <Sl l="Saturation" v={adj.st} mn={0} mx={200} ch={v=>setA("st",v)} u="%"/>
            <Sl l="Hue" v={adj.hu} mn={0} mx={360} ch={v=>setA("hu",v)} u="°" c={C.pr}/>
            <Sl l="Temperature" v={adj.temp} mn={-50} mx={50} ch={v=>setA("temp",v)} c={C.or}/>
            <Sl l="Blur" v={adj.bl} mn={0} mx={20} s={.5} ch={v=>setA("bl",v)} u="px" c={C.bl}/>
            <Bt onClick={()=>sAdj({br:100,ct:100,st:100,hu:0,bl:0,temp:0})} sm style={{marginTop:2}}>↺ Reset</Bt>
            <Hd ic="◎">Overlays</Hd>
            {[...OVL].map(o=>(<button key={o.id} onClick={()=>sOvl(o.id)} style={{display:"block",width:"100%",textAlign:"left",padding:"2px 3px",background:ovl===o.id?C.sa:"transparent",border:ovl===o.id?`1px solid ${C.ac}22`:"1px solid transparent",borderRadius:1,cursor:"pointer",fontSize:7,color:ovl===o.id?C.ac:C.td,fontFamily:FN}}>{o.n}</button>))}
            {ovl!=="none"&&<Sl l="Op" v={oOp*100} mn={10} mx={100} ch={v=>sOOp(v/100)} u="%"/>}
            <Hd ic="⟲">View</Hd>
            <Sl l="Rotation" v={cRot} mn={-45} mx={45} ch={setCRot} u="°" c={C.pr}/>
          </>}

          {rT==="plug"&&<>
            <Hd ic="🧩">Extensions ({PLUGINS.length})</Hd>
            {PLUGINS.map(p=>(<div key={p.id} style={{padding:"3px 4px",background:C.srf,borderRadius:2,border:`1px solid ${C.bd}`,marginBottom:2}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:6.5,color:C.tx}}>{p.name}</span><Bt onClick={()=>applyPlugin(p)} sm style={{color:C.ac}}>Apply</Bt></div>
              <div style={{fontSize:5.5,color:C.tm}}>{p.desc} · {p.author}</div>
            </div>))}
            <div style={{marginTop:4,padding:3,background:C.srf,borderRadius:2,fontSize:5.5,color:C.tm}}>Plugin API: fn(pixelData, w, h) → Uint8ClampedArray</div>
          </>}

          {rT==="act"&&<>
            <Hd ic="📋">History ({hNm.length})</Hd>
            <div style={{display:"flex",flexDirection:"column",gap:0,maxHeight:200,overflow:"auto"}}>
              {hNm.map((nm,i)=>(<div key={i} style={{padding:"1px 3px",background:i===hP?C.sa:C.srf,borderRadius:1,border:i===hP?`1px solid ${C.ac}22`:"1px solid transparent",fontSize:6,color:i===hP?C.ac:C.td,cursor:"pointer"}} onClick={()=>{const s=hist[i];if(!s)return;ld.current={};Object.keys(s.data).forEach(k=>{const c=document.createElement("canvas");c.width=s.data[k].width;c.height=s.data[k].height;c.getContext("2d").drawImage(s.data[k],0,0);ld.current[k]=c;});setLayers(s.layers);setSz(s.sz);sHP(i);}}><span style={{opacity:.3,marginRight:2}}>{i+1}</span>{nm}</div>))}
            </div>
            {savedBatches.length>0&&<><Hd ic="⏺">Saved Batches</Hd>{savedBatches.map((b,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"2px 3px",background:C.srf,borderRadius:2,marginBottom:1}}><span style={{fontSize:6,color:C.tx}}>{b.n} ({b.acts.length})</span><Bt onClick={()=>playBatch(b.acts)} sm style={{color:C.ac}}>▶</Bt></div>))}</>}
            <Hd ic="◇">Versions</Hd>
            <Bt onClick={captureVersion} sm style={{marginBottom:2}}>Capture Version</Bt>
            {versions.map((v,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 3px",background:C.srf,borderRadius:2,marginBottom:1}}><span style={{fontSize:6,color:C.tx}}>{v.name}</span><Bt onClick={()=>restoreVersion(v)} sm style={{color:C.ac}}>Load</Bt></div>))}
            <Hd ic="📊">Image Stats</Hd>
            <div style={{fontSize:6,color:C.tm,lineHeight:1.5}}>{sz.w}×{sz.h} · {(sz.w*sz.h).toLocaleString()}px · {layers.length} layers · {Math.round(sz.w*sz.h*4/1024)}KB raw</div>
          </>}

          {rT==="exp"&&<>
            <Hd ic="⬇">Export</Hd>
            <input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Project/export name" style={{width:"100%",padding:"2px 3px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:2,color:C.tx,fontFamily:FN,fontSize:6.5,marginBottom:3}}/>
            <div style={{display:"flex",gap:1,marginBottom:3}}>{["PNG","JPEG","WEBP"].map(f=><Bt key={f} a={eF===f} onClick={()=>sEF(f)} sm>{f}</Bt>)}</div>
            {eF!=="PNG"&&<Sl l="Quality" v={eQ} mn={10} mx={100} ch={sEQ} u="%"/>}
            <button onClick={doExp} style={{width:"100%",padding:"5px 8px",background:`linear-gradient(135deg,${C.ac},${C.bl})`,color:C.bg,border:"none",borderRadius:3,cursor:"pointer",fontWeight:700,fontSize:8,fontFamily:FN,marginTop:4}}>⬇ Export {eF}</button>
            <div style={{display:"flex",gap:2,marginTop:3}}><Bt onClick={exportSocialPack} sm style={{flex:1,color:C.ac}}>Social Pack</Bt><Bt onClick={exportManifest} sm style={{flex:1,color:C.pr}}>Manifest</Bt></div>
            <Hd ic="✍">Caption</Hd><select value={captionTone} onChange={e=>setCaptionTone(e.target.value)} style={{width:"100%",marginBottom:2}}>{Object.keys(CAPTION_TONES).map(k=><option key={k} value={k}>{k}</option>)}</select><div style={{padding:3,background:C.srf,borderRadius:2,fontSize:5.5,color:C.tm,whiteSpace:"pre-wrap",maxHeight:62,overflow:"auto"}}>{makeCaption()}</div><Bt onClick={copyCaption} sm style={{marginTop:2}}>Copy Caption</Bt>
            <div style={{display:"flex",gap:2,marginTop:3}}><Bt onClick={exportProject} sm style={{flex:1}}>Save .auralith</Bt><Bt onClick={exportReceipt} sm style={{flex:1,color:C.gd}}>Receipt</Bt></div>
            {lastReceipt&&<div style={{fontSize:5.5,color:C.tm,marginTop:3,wordBreak:"break-all"}}>Last receipt: {lastReceipt.receiptId?.slice(0,24)}…</div>}{lastManifest&&<div style={{fontSize:5.5,color:C.tm,marginTop:2,wordBreak:"break-all"}}>Last manifest: {lastManifest.slice(0,24)}…</div>}
          </>}
        </div>
      </div>
    </div>

    {showK?<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>sShowK(0)}><div style={{background:C.pn,border:`1px solid ${C.bd}`,borderRadius:6,padding:12,width:500,maxHeight:"80vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:10,fontWeight:600,marginBottom:5,color:C.ac}}>⌨ Auralith369 v0.1.0-alpha Shortcuts</div>
      <div style={{columns:2,columnGap:10,fontSize:6.5,color:C.td,lineHeight:1.7}}>
        {[["B","Brush"],["E","Eraser"],["F","Smudge"],["O","Dodge"],["N","Burn"],["H","Heal"],["J","Col Replace"],["S","Clone"],["W","Liquify"],["G","Fill"],["A","CA Fill"],["D","Gradient"],["U","Shape"],["T","Text"],["P","Pen"],["I","Picker"],["Q","Ruler"],["L","Lasso"],["K","Magic Wand"],["M","Select"],["R","Transform"],["V","Move"],["C","Crop"],["[/]","Brush ±"],["X","Swap FG/BG"],["Ctrl+Z","Undo"],["⇧Ctrl+Z","Redo"],["Ctrl+C/X/V","Clipboard"],["Ctrl+D","Deselect"],["Del","Delete"],["Enter","Apply"],["Esc","Cancel"],["\\","Split View"],[",/.","Rotate View"],["0","Reset View"],["/ ","Shortcuts"]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between"}}><span style={{background:C.srf,padding:"0 2px",borderRadius:1,fontSize:5.5,color:C.tx}}>{k}</span><span>{v}</span></div>))}
      </div>
    </div></div>:null}

    {showR?<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>sShowR(0)}><div style={{background:C.pn,border:`1px solid ${C.bd}`,borderRadius:5,padding:12,minWidth:190}} onClick={e=>e.stopPropagation()}><div style={{fontSize:9,fontWeight:600,marginBottom:5,color:C.ac}}>Resize</div><div style={{display:"flex",gap:6,marginBottom:5}}><div><label style={{fontSize:5,color:C.tm}}>W</label><input type="number" value={rW} onChange={e=>sRW(e.target.value)} style={{display:"block",width:"100%",padding:"2px 3px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:2,color:C.tx,fontFamily:FN,fontSize:8}}/></div><div><label style={{fontSize:5,color:C.tm}}>H</label><input type="number" value={rH_} onChange={e=>sRH(e.target.value)} style={{display:"block",width:"100%",padding:"2px 3px",background:C.srf,border:`1px solid ${C.bd}`,borderRadius:2,color:C.tx,fontFamily:FN,fontSize:8}}/></div></div><div style={{display:"flex",gap:3,justifyContent:"flex-end"}}><Bt onClick={()=>sShowR(0)} sm>Cancel</Bt><button onClick={apRsz} style={{padding:"3px 8px",background:C.ac,color:C.bg,border:"none",borderRadius:2,fontWeight:600,fontFamily:FN,fontSize:7,cursor:"pointer"}}>Apply</button></div></div></div>:null}

    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1px 5px",borderTop:`1px solid ${C.bd}`,background:C.pn,fontSize:5.5,color:C.tm,flexShrink:0}}>
      <span>{status?<span style={{color:C.ac,fontWeight:600}}>{status}</span>:<>{TLS.find(t=>t.id===tl)?.n}{eMask?" [MASK]":""}{symM>0?` ×${symM}`:""}{batchRec?" ⏺REC":""} · {curL?.n} · H:{hP+1}/{hist.length}{sel?` · ${Math.round(sel.w)}×${Math.round(sel.h)}`:""}</>}</span>
      <span>Φ={PHI.toFixed(3)} · λ={LAM.toFixed(3)} · C*=0.809 · Ω_c=0.376</span>
      <span>Auralith369 {APP_VERSION} ∴ PHI369 Labs · Snap:{snapOn?"on":"off"}</span>
    </div>
  </div>);
}
