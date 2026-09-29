# Auralith369 v0.7.2-alpha

## Agent-friendly finished-art capture

Auralith369 now exposes a structured readback surface for finished artwork:

```js
const capture = await Auralith.export.capture({
  maxDimension: 2048
})
```

The result uses schema:

```text
auralith.capture.png.v1
```

and includes:

- `authority: canvas2d`
- project name
- PNG MIME type
- width / height
- encoded byte count
- SHA-256 of the actual PNG bytes
- `dataBase64`
- `dataUrl`

## Bounds

Capture is intentionally bounded:

```text
maximum dimension: 2048 px
maximum PNG bytes: 4 MiB
format:            PNG
authority:         Canvas 2D
```

Larger artwork is proportionally downscaled to the requested maximum dimension.

Oversized encoded output fails closed.

## Existing export compatibility

```js
Auralith.export.png()
```

still returns the existing PNG Blob.

The new structured capture is additive and does not change that browser-oriented contract.

## Native site tool

The WebMCP layer adds:

```text
auralith_capture_png
```

This read-only tool returns one base64 image payload plus metadata.

It deliberately omits the duplicate data URL from the site-tool response.

## Stable contracts

```text
Auralith app:      v0.7.2-alpha
Stable SDK:        0.1.1
SDK schema:        auralith.sdk.v1
Site tools:        0.1.1
Site-tool schema:  auralith.site-tools.v1
Capture schema:    auralith.capture.png.v1
```

## Acceptance 001

This release also preserves the first observed live Domistika → Auralith creative chain as:

```text
docs/acceptance/NATIVE_CREATIVE_CHAIN_ACCEPTANCE_001.md
```

The acceptance records the hash-bound handoff, image open, Moonlight LUT, Vignette FX, 369 Cinema style, and creative receipt path.
