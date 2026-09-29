# Auralith369 v0.7.3-alpha

## Creative Bridge v2 semantic overlay import

Auralith can now preserve protected Domistika layers separately from the raster artwork being graded.

Creative Bridge v2 verifies:

- base artwork SHA-256;
- every protected overlay SHA-256;
- a canonical manifest SHA-256 covering semantic metadata and provenance.

## Protected finishing

Imported semantic overlays carry:

\`\`\`text
semanticRole
styleProtected
bridgeOverlay
sourceLayerId
sourceContentHash
\`\`\`

The compositor grades normal artwork first and draws protected overlays afterward.

Destructive active-layer LUT / FX / plugin / gradient-map / Curves operations also skip protected layers.

## Compatibility

Creative Bridge v1 remains supported.

Existing v2-aware agent sequence:

\`\`\`js
const payload = await A.bridge.domistika.receive()
await A.image.open(payload.image)
\`\`\`

automatically installs the verified overlay layers.

Stable SDK v0.1.2 additionally supports:

\`\`\`js
await Auralith.bridge.domistika.import()
\`\`\`

## Native site tools

Site tools v0.1.2 add:

\`\`\`text
auralith_import_domistika_transfer
\`\`\`

## Receipts

Creative receipts now preserve semantic bridge provenance for imported layers.

## Contracts

\`\`\`text
app:        v0.7.3-alpha
SDK:        0.1.2
site tools: 0.1.2
bridge:     parallax-creative-bridge v2, with v1 fallback
\`\`\`
