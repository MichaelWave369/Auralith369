import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AURALITH_SITE_TOOLS_VERSION,
  AURALITH_SITE_TOOLS_SCHEMA,
  createAuralithSiteTools,
  installAuralithSiteTools,
} from '../src/lib/auralithSiteTools.js';

function fakeApi() {
  const calls=[];
  const commands=[
    {id:'lut.golden-hour',label:'LUT · Golden Hour',category:'LUT',description:'Apply Golden Hour',keywords:['golden','cinematic']},
    {id:'gpu.builtin:golden-oracle',label:'GPU · Golden Oracle',category:'GPU',description:'Load Golden Oracle',keywords:['gpu','golden']},
  ];
  return {
    schema:'auralith.sdk.v1',
    ready:()=>true,
    capabilities:()=>({
      schema:'auralith.sdk.v1',
      sdkVersion:'0.1.1',
      appVersion:'v0.7.2-alpha',
      ready:true,
      project:{name:'Night Harbor',width:1200,height:800,activeLayerId:1,layerCount:2},
      image:{loaded:true,width:1200,height:800},
      layers:{count:2,activeLayerId:1},
      fx:{available:true,count:1},
      lut:{available:true,count:1},
      style:{available:true,count:1},
      gpu:{supported:true,active:true,cartridgeCount:1,state:{enabled:true}},
      actions:{count:1},
      receipts:{available:true,latestReceiptId:'sha256:old'},
      capture:{available:true,schema:'auralith.capture.png.v1',authority:'canvas2d',maxDimension:2048,maxBytes:4194304},
      bridge:{domistika:{available:true}},
    }),
    project:{info:()=>({name:'Night Harbor',activeLayerId:1,layerCount:2})},
    layers:{
      list:()=>[{id:1,name:'Base',visible:true,opacity:1,blend:'normal',mask:false}],
      add:(name)=>{calls.push(['add',name]);return{id:2,name};},
      activate:(id)=>{calls.push(['activate',id]);return{id};},
      opacity:(id,value)=>{calls.push(['opacity',id,value]);return{id,opacity:value};},
      blend:(id,value)=>{calls.push(['blend',id,value]);return{id,blend:value};},
      mask:(id,value)=>{calls.push(['mask',id,value]);return{id,mask:value};},
    },
    fx:{apply:(id)=>{calls.push(['fx',id]);return{id,name:'Sharpen'};}},
    lut:{apply:(id)=>{calls.push(['lut',id]);return{id,name:'Golden Hour'};}},
    style:{apply:(id)=>{calls.push(['style',id]);return{id,name:'Φ Forge'};}},
    gpu:{
      apply:(id)=>{calls.push(['gpu',id]);return{id,name:'Golden Oracle'};},
      state:()=>({enabled:true,bypassed:false,activeCartridgeId:'builtin:golden-oracle'}),
    },
    adjustments:{set:(input)=>{calls.push(['adjustments',input]);return{br:100,ct:100,st:100,hu:0,bl:0,temp:0,...input};}},
    bridge:{domistika:{
      get:async()=>({
        protocol:'parallax-creative-bridge',
        source:'domistika',
        target:'auralith369',
        projectName:'Night Harbor',
        contentHash:'sha256:abc',
        palette:['#112233','#ffcc88'],
        artwork:{mimeType:'image/png',width:1200,height:800,dataUri:'data:image/png;base64,AAAA'},
      }),
      receive:async()=>({
        protocol:'parallax-creative-bridge',
        source:'domistika',
        target:'auralith369',
        projectName:'Night Harbor',
        contentHash:'sha256:abc',
        artwork:{mimeType:'image/png',width:1200,height:800,dataUri:'data:image/png;base64,BBBB'},
      }),
    }},
    receipts:{export:async()=>({
      receiptId:'sha256:new',
      createdAt:'2026-09-28T00:00:00Z',
      projectName:'Night Harbor',
      imageHash:'sha256:image',
      layers:[{id:1},{id:2}],
      gpuLab:{enabled:true,bypassed:false,activePresetId:'builtin:golden-oracle',activePresetName:'Golden Oracle'},
    })},
    export:{capture:async({maxDimension}={})=>({
      schema:'auralith.capture.png.v1',
      authority:'canvas2d',
      projectName:'Night Harbor',
      mimeType:'image/png',
      width:Math.min(maxDimension||2048,1400),
      height:1000,
      bytes:4,
      sha256:'sha256:capture',
      dataBase64:'cG5n',
      dataUrl:'data:image/png;base64,cG5n',
    })},
    commands:{
      list:()=>commands.map(c=>c.id),
      search:(query,limit)=>commands.filter(c=>JSON.stringify(c).toLowerCase().includes(String(query).toLowerCase())).slice(0,limit),
      execute:async(id,args)=>{calls.push(['command',id,args]);return{command:id};},
    },
    calls,
  };
}

test('Auralith site tools expose a compact stable finishing vocabulary', async()=>{
  assert.equal(AURALITH_SITE_TOOLS_VERSION,'0.1.1');
  assert.equal(AURALITH_SITE_TOOLS_SCHEMA,'auralith.site-tools.v1');

  const api=fakeApi();
  const tools=createAuralithSiteTools(api);
  assert.equal(Object.isFrozen(tools),true);
  assert.equal(tools.length,15);
  assert.deepEqual(tools.map(t=>t.name),[
    'auralith_get_capabilities',
    'auralith_search_commands',
    'auralith_list_layers',
    'auralith_add_layer',
    'auralith_update_layer',
    'auralith_apply_fx',
    'auralith_apply_lut',
    'auralith_apply_style',
    'auralith_apply_gpu_cartridge',
    'auralith_set_adjustments',
    'auralith_get_domistika_transfer',
    'auralith_receive_domistika_transfer',
    'auralith_capture_png',
    'auralith_export_receipt',
    'auralith_execute_command',
  ]);

  const readOnly=new Set([
    'auralith_get_capabilities',
    'auralith_search_commands',
    'auralith_list_layers',
    'auralith_get_domistika_transfer',
    'auralith_capture_png',
  ]);
  for(const tool of tools){
    assert.match(tool.name,/^[A-Za-z0-9_.-]+$/);
    assert.equal(typeof tool.execute,'function');
    assert.equal(tool.annotations.readOnlyHint,readOnly.has(tool.name));
  }

  const capsTool=tools.find(t=>t.name==='auralith_get_capabilities');
  const caps=JSON.parse(await capsTool.execute({}));
  assert.equal(caps.capabilities.commandCount,2);
  assert.equal(caps.capabilities.gpu.supported,true);

  const searchTool=tools.find(t=>t.name==='auralith_search_commands');
  const search=JSON.parse(await searchTool.execute({query:'golden',limit:10}));
  assert.equal(search.results.length,2);

  const add=tools.find(t=>t.name==='auralith_add_layer');
  await add.execute({name:'Finish Pass'});
  assert.deepEqual(api.calls.at(-1),['add','Finish Pass']);

  const update=tools.find(t=>t.name==='auralith_update_layer');
  await update.execute({layerId:1,activate:true,opacity:0.72,blend:'screen',mask:true});
  assert.deepEqual(api.calls.slice(-4),[
    ['activate',1],
    ['opacity',1,0.72],
    ['blend',1,'screen'],
    ['mask',1,true],
  ]);

  await tools.find(t=>t.name==='auralith_apply_fx').execute({fxId:'sharpen'});
  assert.deepEqual(api.calls.at(-1),['fx','sharpen']);

  await tools.find(t=>t.name==='auralith_apply_lut').execute({lutId:'golden-hour'});
  assert.deepEqual(api.calls.at(-1),['lut','golden-hour']);

  await tools.find(t=>t.name==='auralith_apply_style').execute({styleId:'phi_forge'});
  assert.deepEqual(api.calls.at(-1),['style','phi_forge']);

  await tools.find(t=>t.name==='auralith_apply_gpu_cartridge').execute({cartridgeId:'builtin:golden-oracle'});
  assert.deepEqual(api.calls.at(-1),['gpu','builtin:golden-oracle']);

  await tools.find(t=>t.name==='auralith_set_adjustments').execute({ct:118,temp:7});
  assert.deepEqual(api.calls.at(-1),['adjustments',{ct:118,temp:7}]);

  const transferTool=tools.find(t=>t.name==='auralith_get_domistika_transfer');
  const transferRaw=await transferTool.execute({});
  const transfer=JSON.parse(transferRaw);
  assert.equal(transfer.transfer.projectName,'Night Harbor');
  assert.equal(transfer.transfer.contentHash,'sha256:abc');
  assert.equal(transfer.transfer.artwork.payloadIncluded,true);
  assert.doesNotMatch(transferRaw,/data:image\/png;base64/);
  assert.doesNotMatch(transferRaw,/AAAA/);

  const receiveTool=tools.find(t=>t.name==='auralith_receive_domistika_transfer');
  const receivedRaw=await receiveTool.execute({});
  assert.doesNotMatch(receivedRaw,/BBBB/);

  const captureTool=tools.find(t=>t.name==='auralith_capture_png');
  const captureRaw=await captureTool.execute({maxDimension:1024});
  const capture=JSON.parse(captureRaw);
  assert.equal(capture.capture.schema,'auralith.capture.png.v1');
  assert.equal(capture.capture.authority,'canvas2d');
  assert.equal(capture.capture.width,1024);
  assert.equal(capture.capture.dataBase64,'cG5n');
  assert.equal('dataUrl' in capture.capture,false);
  assert.doesNotMatch(captureRaw,/data:image\/png;base64/);

  const receiptTool=tools.find(t=>t.name==='auralith_export_receipt');
  const receipt=JSON.parse(await receiptTool.execute({}));
  assert.equal(receipt.receipt.receiptId,'sha256:new');
  assert.equal(receipt.receipt.layerCount,2);

  const execTool=tools.find(t=>t.name==='auralith_execute_command');
  await execTool.execute({commandId:'lut.golden-hour',args:{}});
  assert.deepEqual(api.calls.at(-1),['command','lut.golden-hour',{}]);
  await assert.rejects(
    ()=>execTool.execute({commandId:'javascript.eval',args:{}}),
    /COMMAND_UNKNOWN/,
  );
});

test('Auralith site tools register through modelContext with abort lifecycle', async()=>{
  const api=fakeApi();
  const registrations=[];
  const modelContext={
    async registerTool(tool,options){
      registrations.push({tool,options});
    },
  };
  const state=await installAuralithSiteTools({api,modelContext});
  assert.equal(state.available,true);
  assert.equal(state.registered.length,15);
  assert.equal(registrations.length,15);
  for(const entry of registrations) assert.ok(entry.options.signal);
  assert.equal(state.stop(),true);
});

test('Auralith site-tool source preserves the stable authority boundaries',()=>{
  const source=fs.readFileSync(new URL('../src/lib/auralithSiteTools.js',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  const editor=fs.readFileSync(new URL('../src/Auralith369.jsx',import.meta.url),'utf8');

  assert.match(source,/modelContext/);
  assert.match(source,/registerTool/);
  assert.match(source,/readOnlyHint/);
  assert.match(source,/consequentialHint/);
  assert.match(source,/auralith\.site-tools\.v1/);
  assert.match(source,/payloadIncluded/);
  assert.match(source,/auralith_capture_png/);
  assert.match(source,/dataBase64/);
  assert.doesNotMatch(source,/\beval\s*\(/);
  assert.doesNotMatch(source,/new Function\s*\(/);
  assert.doesNotMatch(source,/\bfetch\s*\(/);
  assert.doesNotMatch(source,/CanvasRenderingContext2D/);
  assert.doesNotMatch(source,/WebGLRenderingContext/);

  assert.match(app,/installAuralithSiteToolsGlobal/);
  assert.match(editor,/APP_VERSION="v0\.7\.2-alpha"/);
});
