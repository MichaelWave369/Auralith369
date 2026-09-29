# Auralith369 Stable SDK v0.1

Auralith369 v0.7.0-alpha introduces a small, frozen semantic facade:

```js
window.Auralith
```

The facade sits on top of the existing React workstation. It does not replace the editor's internal rendering, project, GPU, receipt, or bridge systems.

## Contract

```text
SDK version: 0.1.0
schema:      auralith.sdk.v1
app:         v0.7.0-alpha
```

The global object is deep-frozen. Runtime state is supplied through a private adapter that is rebound by the mounted workstation.

```js
Auralith.ready()
Auralith.capabilities()
```

Consumers should interrogate the live capability snapshot instead of inferring features from UI text or version strings.

## Project and image

```js
Auralith.project.info()
Auralith.project.serialize()
await Auralith.project.open(project)

Auralith.image.current()
await Auralith.image.open(blobOrFileOrDataUrl)
```

SDK image input is bounded to PNG, JPEG, or WebP and a maximum of 32 MiB.

Project opening still passes through Auralith's existing project validation path.

## Layers

```js
Auralith.layers.list()

const layer = Auralith.layers.add('Finish Pass')
Auralith.layers.activate(layer.id)
Auralith.layers.opacity(layer.id, 0.8)
Auralith.layers.blend(layer.id, 'screen')
Auralith.layers.mask(layer.id, true)
```

Returned layer records are sanitized metadata. Raw canvas contexts are not exposed.

## Pixel FX

```js
Auralith.fx.list()
Auralith.fx.apply('sharpen')
```

FX calls route to the same authoritative Canvas 2D pixel operations used by the workstation UI.

## LUTs

```js
Auralith.lut.list()
Auralith.lut.apply('golden-hour')
```

The initial live LUT catalog includes the workstation's existing cinematic grades such as Golden Hour, Moonlight, Matrix, Vintage Film, Blade Runner, and Teal & Orange.

## Style cards

```js
Auralith.style.list()
Auralith.style.apply('phi_forge')
```

Style cards use the existing Auralith style-card pipeline, including their bounded adjustment, overlay, LUT, gradient-map, and plugin composition.

## Adjustments

```js
Auralith.adjustments.get()

Auralith.adjustments.set({
  br: 105,
  ct: 118,
  st: 110,
  temp: 8
})
```

Values are normalized to the workstation's existing ranges.

## GPU Lab

```js
Auralith.gpu.capabilities()
Auralith.gpu.cartridges()
Auralith.gpu.state()

Auralith.gpu.apply('builtin:golden-oracle')
```

GPU operations address the existing Cartridge Bay.

### Authority boundary

GPU Lab remains an optional non-destructive Three.js/WebGL2 preview renderer.

The stable SDK does not promote GPU preview pixels into project authority.

```text
Canvas 2D = project / edit / receipt / standard-export authority
GPU Lab   = optional finishing preview + explicit GPU workflow
```

## Actions

Saved Auralith batches are discoverable through:

```js
Auralith.actions.list()
Auralith.actions.run('batch-0')
```

Batch IDs are session/project-local identifiers in SDK v0.1.

## Receipts

```js
Auralith.receipts.latest()
await Auralith.receipts.export()
```

Receipt export calls the existing Auralith receipt generator, including its composite hash and workstation state record.

## Domistika bridge

The stable SDK does not bypass the existing bridge integrity check.

```js
await Auralith.bridge.domistika.get()
await Auralith.bridge.domistika.receive()
Auralith.bridge.domistika.clear()
```

The receive path still uses the existing `auralithDomistikaBridge` runtime and `verifyCreativeBridgeV1()` SHA-256 verification.

## Export

```js
const png = await Auralith.export.png()
const project = await Auralith.export.project()
const receipt = await Auralith.export.receipt()
```

`export.png()` returns a PNG Blob generated from the authoritative Canvas 2D composite.

It intentionally does not silently capture the optional GPU preview.

## Commands

The SDK builds a live semantic command catalog from the finishing capabilities currently installed.

```js
Auralith.commands.list()
Auralith.commands.catalog()
Auralith.commands.search('golden')
Auralith.commands.search('gpu cathedral')

await Auralith.commands.execute('lut.golden-hour')
await Auralith.commands.execute('style.phi_forge')
await Auralith.commands.execute('gpu.builtin:golden-oracle')
```

The catalog includes live FX, LUT, Style, GPU Cartridge, and saved Action entries in addition to core project/bridge/export commands.

## Security and authority boundary

The stable SDK intentionally exposes no:

- arbitrary JavaScript evaluation;
- raw Canvas 2D context;
- raw WebGL context;
- network fetch API;
- filesystem API;
- hidden bridge bypass.

The surface expresses Auralith workstation operations rather than general browser authority.

```text
CAPABILITY != AUTHORITY
SDK METHOD != ARBITRARY EXECUTION
GPU PREVIEW != PROJECT AUTHORITY
BRIDGE TRANSPORT != TRUST BYPASS
```


## Native WebMCP adapter

Starting in Auralith369 v0.7.1-alpha, WebMCP-aware browsers can expose a curated site-tool layer above this SDK.

The site tools do not form a second workstation API. They call the methods documented above and preserve the same Canvas/GPU/bridge authority boundaries.

See [Native WebMCP Site Tools v0.7.1-alpha](WEBMCP_SITE_TOOLS_V071.md).
