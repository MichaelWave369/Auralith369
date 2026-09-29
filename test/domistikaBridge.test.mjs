import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Domistika bridge receiver is mounted, local-first, and integrity-gated', async () => {
  const [app, receiver, styles] = await Promise.all([
    read('src/App.jsx'),
    read('src/DomistikaBridgeReceiver.jsx'),
    read('src/domistikaBridge.css'),
  ]);

  assert.match(app, /DomistikaBridgeReceiver/);
  assert.match(receiver, /parallax-creative-bridge-v2/);
  assert.match(receiver, /parallax-creative-bridge-v1/);
  assert.match(receiver, /source !== 'domistika'/);
  assert.match(receiver, /target !== 'auralith369'/);
  assert.match(receiver, /verifyCreativeBridge/);
  assert.match(receiver, /auralith:domistika-bridge-rejected/);
  assert.match(receiver, /Use as floating reference/);
  assert.match(receiver, /Use as workspace backdrop/);
  assert.match(receiver, /passed a local SHA-256 integrity check/);
  assert.match(receiver, /Protected overlays/);
  assert.match(receiver, /Creative Bridge v2 also verifies protected overlay bytes and manifest metadata/);
  assert.match(receiver, /ArtworkStack/);
  assert.match(receiver, /Nothing was uploaded by the bridge/);
  assert.match(receiver, /auralith:domistika-bridge/);
  assert.match(styles, /domistika-bridge-modal/);
  assert.match(styles, /domistika-bridge-reference/);
  assert.match(styles, /domistika-bridge-backdrop/);
  assert.match(styles, /domistika-bridge-art-stack/);
  assert.match(styles, /domistika-bridge-art-overlay/);
});
