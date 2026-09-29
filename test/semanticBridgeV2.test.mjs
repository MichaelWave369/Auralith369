import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('v0.7.3 semantic bridge runtime protects overlays through finishing', () => {
  const editor = fs.readFileSync(new URL('../src/Auralith369.jsx', import.meta.url), 'utf8');
  const sdk = fs.readFileSync(new URL('../src/lib/auralithStableSdk.js', import.meta.url), 'utf8');
  const siteTools = fs.readFileSync(new URL('../src/lib/auralithSiteTools.js', import.meta.url), 'utf8');
  const receiver = fs.readFileSync(new URL('../src/DomistikaBridgeReceiver.jsx', import.meta.url), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

  assert.equal(pkg.version, '0.7.3-alpha');
  assert.match(editor, /APP_VERSION="v0\.7\.3-alpha"/);
  assert.match(sdk, /AURALITH_SDK_VERSION = '0\.1\.2'/);
  assert.match(siteTools, /AURALITH_SITE_TOOLS_VERSION = '0\.1\.2'/);

  assert.match(receiver, /parallax-creative-bridge-v2/);
  assert.match(receiver, /parallax-creative-bridge-v1/);
  assert.match(receiver, /verifyCreativeBridge/);
  assert.match(receiver, /Protected overlays/);

  assert.match(editor, /pendingDomistikaTransferRef/);
  assert.match(editor, /importDomistikaOverlays/);
  assert.match(editor, /semanticRole/);
  assert.match(editor, /styleProtected/);
  assert.match(editor, /bridgeOverlay/);
  assert.match(editor, /sourceLayerId/);
  assert.match(editor, /sourceContentHash/);
  assert.match(editor, /setAL\(1\)/);

  assert.match(editor, /guardProtectedStyle/);
  assert.match(editor, /Protected semantic overlay — finishing effect skipped/);
  assert.match(editor, /if\(!f\|\|guardProtectedStyle\(\)\)return/);
  assert.match(editor, /applyPlugin=\(pl\)=>\{if\(guardProtectedStyle\(\)\)return/);
  assert.match(editor, /applyLUT=\(lut\)=>\{if\(guardProtectedStyle\(\)\)return/);

  assert.match(editor, /const protectedLayers=\[\]/);
  assert.match(editor, /if\(l\.styleProtected\)\{protectedLayers\.push\(l\);return;\}/);
  assert.match(editor, /protectedLayers\.forEach\(layer=>drawLayerTo\(o,layer\)\)/);

  assert.match(editor, /bridgeImport:async/);
  assert.match(editor, /pendingDomistikaTransferRef\.current=transfer/);
  assert.match(editor, /typeof input==="string"&&input===transfer\.image/);

  assert.match(sdk, /function bridgeImport/);
  assert.match(sdk, /bridge\.domistika\.import/);
  assert.match(sdk, /import: bridgeImport/);

  assert.match(siteTools, /auralith_import_domistika_transfer/);
  assert.match(siteTools, /api\.bridge\.domistika\.import/);

  assert.match(editor, /semanticRole:l\.semanticRole\|\|null/);
  assert.match(editor, /styleProtected:!!l\.styleProtected/);
  assert.match(editor, /bridgeOverlay:!!l\.bridgeOverlay/);
});

test('creative receipt preserves semantic bridge provenance', () => {
  const editor = fs.readFileSync(new URL('../src/Auralith369.jsx', import.meta.url), 'utf8');

  assert.match(editor, /semanticRole:l\.semanticRole\|\|null/);
  assert.match(editor, /styleProtected:!!l\.styleProtected/);
  assert.match(editor, /bridgeOverlay:!!l\.bridgeOverlay/);
  assert.match(editor, /sourceLayerId:l\.sourceLayerId\|\|null/);
  assert.match(editor, /sourceContentHash:l\.sourceContentHash\|\|null/);
});
