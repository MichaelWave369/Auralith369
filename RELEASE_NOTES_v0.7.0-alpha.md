# Auralith369 v0.7.0-alpha

## Stable SDK v0.1

Auralith369 now exposes a frozen semantic workstation facade:

```js
window.Auralith
```

The first stable surface covers:

- live capabilities;
- project information, serialization, and validated open;
- bounded image open;
- layers, opacity, blend modes, and masks;
- Canvas 2D FX;
- cinematic LUTs;
- Style Cards;
- global adjustments;
- GPU Lab capability discovery and Cartridge Bay selection;
- saved Action batches;
- creative receipts;
- the existing verified Domistika bridge;
- authoritative PNG/project export;
- a live command catalog, search, and execution surface.

## Runtime architecture

The SDK object is frozen and installed at app boot. The React workstation binds a private runtime adapter containing the current live state.

This keeps external callers on one durable object without exposing internal React setters or raw canvas contexts.

## Canvas / GPU authority

Canvas 2D remains authoritative for:

- project pixels;
- layers and masks;
- project serialization;
- receipts;
- standard PNG export.

GPU Lab remains an optional non-destructive preview renderer and Cartridge Bay. The SDK preserves that boundary.

## Domistika bridge

```js
await Auralith.bridge.domistika.receive()
```

uses the existing bridge receiver and SHA-256 verification path. The SDK does not introduce an alternate unverified transfer path.

## Bounded image input

`Auralith.image.open()` accepts PNG, JPEG, and WebP File/Blob/data-URL input up to 32 MiB.

## Command language

Examples:

```js
Auralith.commands.search('golden')
await Auralith.commands.execute('lut.golden-hour')

Auralith.commands.search('cathedral')
await Auralith.commands.execute('gpu.builtin:infinite-cathedral')
```

This gives agents, scripts, accessibility systems, and future governed bridges a shared semantic finishing vocabulary.

## Compatibility

Existing human UI workflows remain intact. This release wraps existing workstation operations rather than replacing them.

The SDK schema begins at:

```text
auralith.sdk.v1
```

with SDK version:

```text
0.1.0
```
