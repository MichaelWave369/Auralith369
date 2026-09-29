# Auralith369 v0.7.2-alpha — Agent Capture

Auralith369 v0.7.2-alpha adds a structured readback path for finished artwork.

## Stable SDK

The existing browser-oriented export remains:

```js
const blob = await Auralith.export.png()
```

That method continues to return a PNG Blob.

Agents now have a separate structured capture contract:

```js
const capture = await Auralith.export.capture({
  maxDimension: 2048
})
```

Returned shape:

```js
{
  schema: 'auralith.capture.png.v1',
  authority: 'canvas2d',
  projectName,
  mimeType: 'image/png',
  width,
  height,
  bytes,
  sha256,
  dataBase64,
  dataUrl
}
```

## Bounds

The capture path is intentionally bounded:

- maximum dimension: 2048 px
- maximum encoded PNG bytes: 4 MiB
- output format: PNG only
- source: authoritative Canvas 2D composite only

If the project exceeds the requested maximum dimension, the capture is proportionally downscaled before encoding.

If the encoded PNG exceeds 4 MiB, the capture fails closed.

## Authority

```text
authority: canvas2d
```

is part of every capture response.

This makes explicit that the returned pixels come from Auralith's authoritative project composite.

GPU Lab remains a non-destructive finishing preview and is not silently promoted into project authority by capture.

## SHA-256

`sha256` is computed over the actual PNG bytes, not the data-URL text.

Example:

```text
sha256:0123...
```

## Native WebMCP tool

The site-tool layer adds:

```text
auralith_capture_png
```

It accepts:

```json
{
  "maxDimension": 1024
}
```

and returns the capture metadata plus `dataBase64`.

The WebMCP response deliberately omits the duplicate `dataUrl` string to avoid sending the same image bytes twice.

## Contracts

```text
Auralith app:      v0.7.2-alpha
Stable SDK:        0.1.1
Stable SDK schema: auralith.sdk.v1
Site tools:        0.1.1
Site-tool schema:  auralith.site-tools.v1
Capture schema:    auralith.capture.png.v1
```
