import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Domistika bridge receiver is mounted and local-first', async () => {
  const [app, receiver, styles] = await Promise.all([
    read('src/App.jsx'),
    read('src/DomistikaBridgeReceiver.jsx'),
    read('src/domistikaBridge.css'),
  ]);

  assert.match(app, /DomistikaBridgeReceiver/);
  assert.match(receiver, /parallax-creative-bridge-v1/);
  assert.match(receiver, /source !== 'domistika'/);
  assert.match(receiver, /target !== 'auralith369'/);
  assert.match(receiver, /Use as floating reference/);
  assert.match(receiver, /Use as workspace backdrop/);
  assert.match(receiver, /Nothing was uploaded by the bridge/);
  assert.match(receiver, /auralith:domistika-bridge/);
  assert.match(styles, /domistika-bridge-modal/);
  assert.match(styles, /domistika-bridge-reference/);
  assert.match(styles, /domistika-bridge-backdrop/);
});
