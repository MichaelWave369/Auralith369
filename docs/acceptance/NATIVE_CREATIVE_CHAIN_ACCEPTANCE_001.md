# Native Creative Chain Acceptance 001

**Status:** PASS  
**Observed date:** 2026-09-28  
**Domistika:** `0.9.29`  
**Auralith369:** `v0.7.1-alpha`  
**Auralith stable SDK:** `0.1.0`

## Purpose

This record preserves the first observed end-to-end creative handoff from Domistika into Auralith369 using the live stable application APIs and the verified local creative bridge.

The run demonstrates the intended division of labor:

```text
Domistika = creation room
Auralith  = finishing room
```

## Source artwork

Domistika created a project titled:

```text
Harbor for Auralith
```

The scene included the artwork and a title authored on a `motion-ignore` layer.

## Verified bridge handoff

The live Domistika bridge wrote:

```text
localStorage["parallax-creative-bridge-v1"]
protocol: parallax-creative-bridge
source:   domistika
target:   auralith369
```

The observed transfer was created through:

```js
domistikaAuralithBridgeV093.transfer()
```

The transfer reported a SHA-256 content hash beginning:

```text
sha256:66de68e8…
```

Only the observed prefix is recorded here because the complete hash was not captured in the acceptance notes.

## Auralith receive

Auralith received the transfer through its official bridge path.

The receive card reported:

```text
project: Harbor for Auralith
size:    1400 × 1000
hash:    verified
```

This verifies that the handoff reached the normal Auralith bridge receiver rather than a private agent-only import path.

## Finishing operations

The live run then exercised the stable Auralith API:

```js
A.image.open(payload.image)
A.lut.apply('moonlight')
A.fx.apply('vig')
A.style.apply('cinema_369')
A.receipts.export()
```

Observed effects included:

- Moonlight LUT
- Vignette pixel FX
- 369 Cinema style
- creative receipt export

The resulting image retained the original scene while adding a blue nocturnal grade, cinema/grid treatment, RGB split details, and prism-like moon/orbit treatment.

## Receipt evidence

The resulting receipt reported:

```text
kind:    auralith.receipt
version: v0.7.1-alpha
```

and included:

- image hash
- PHI constants
- layer stack
- finishing state

This verifies that the finished project reached the existing receipt generator.

## What held

The following parts of the architecture were observed working together:

- Domistika authored artwork
- semantic `motion-ignore` title behavior before transfer
- hash-bound local handoff
- same-origin bridge visibility
- Auralith bridge receive
- `Auralith.image.open(...)`
- LUT application by stable ID
- pixel FX application by stable ID
- Style Card application by stable ID
- creative receipt generation

## Known limitation: semantic flattening

The Domistika-to-Auralith bridge currently transfers rendered artwork pixels.

The title therefore crossed the bridge as pixels rather than as live type metadata.

After the 369 Cinema style applied chromatic splitting, the flattened title also received that effect.

This is expected under the current bridge contract.

```text
before bridge:
type / layer semantics exist

after raster handoff:
those pixels are ordinary image pixels
```

Future bridge metadata may carry semantic hints such as source layer roles or title annotations, but Acceptance 001 does not require that behavior.

## Export/readback observation

The live run also exposed one integration gap:

```js
Auralith.export.png()
```

returns a browser Blob, which some agent hosts serialize as `{}`.

That behavior did not block the creative chain, but it motivated the v0.7.2-alpha structured capture contract:

```js
Auralith.export.capture(...)
```

## Acceptance conclusion

**PASS**

The core workflow is live:

```text
Sketch in Domistika
→ verified bridge
→ grade in Auralith
→ receipt
```

This is evidence for the stable application-language and bridge architecture.

It should not be interpreted as proof that every transport layer, browser engine, GPU path, or future project shape has been exhaustively validated.
