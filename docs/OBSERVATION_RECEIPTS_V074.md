# Auralith369 v0.7.4-alpha — Observation Receipts + Style Intent

Auralith now records automatic, non-authoritative observation evidence for verified bridge imports and finished captures.

## Observation receipt

Schema:

```text
auralith.observation-receipt.v1
```

Events:

```text
bridge-import
capture
```

Observation receipts are lightweight evidence records. They are not the same thing as the deliberate downloadable `auralith.receipt` creative receipt.

They do not grant render, publish, or automatic-import authority.

## Creative lineage fields

When a verified Domistika Creative Bridge v2 transfer is active, an observation receipt records:

```text
creativeManifestHash
baseContentHash
protectedOverlayHashes
sourceTransferVersion
```

A capture observation additionally records:

```text
auralith.capture.png.v1
capture SHA-256
width / height / bytes
Canvas 2D authority
```

`Auralith.export.capture()` now returns:

```js
{
  ...capture,
  receiptId,
  receiptHash,
  receiptSchema: 'auralith.observation-receipt.v1'
}
```

and `Auralith.receipts.latest()` immediately exposes the same observation receipt.

## Same-origin downstream evidence

Auralith writes a small evidence-only record to:

```text
localStorage['parallax-creative-evidence-v2']
```

It contains hashes and schemas only, not image payloads.

This gives ParaCut's live Interop Room a discoverable evidence seam without copying finished image bytes into a second storage record.

## Style intent

Style Cards now expose machine-readable intent:

```js
{
  class,
  destructiveAppearance,
  preservesPhotometricStructure,
  recommendedFor
}
```

Example:

```text
Analog Oracle
class: surface-transform
destructiveAppearance: true
preservesPhotometricStructure: false
```

The effect itself is unchanged. Agents can now distinguish a grade from a strong surface transformation before applying it.

## Native site tool

Adds the read-only tool:

```text
auralith_list_styles
```

so native agents can inspect Style Card intent before applying one.

## Contracts

```text
Auralith app:       v0.7.4-alpha
Stable SDK:         0.1.3
Stable SDK schema:  auralith.sdk.v1
Site tools:         0.1.3
Site-tool schema:   auralith.site-tools.v1
Capture schema:     auralith.capture.png.v1
Observation schema: auralith.observation-receipt.v1
```
