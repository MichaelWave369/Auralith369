# Auralith369 v0.7.3-alpha — Creative Bridge v2 Semantic Overlay Import

Auralith369 v0.7.3-alpha understands Creative Bridge v2 packages from Domistika.

The v2 receiver preserves title and other protected overlay layers separately from the artwork that Auralith grades.

## Compatibility

Auralith reads bridge keys in this order:

\`\`\`text
parallax-creative-bridge-v2
parallax-creative-bridge-v1
\`\`\`

Creative Bridge v1 remains supported.

## Integrity verification

A v2 transfer is accepted only after Auralith verifies:

1. SHA-256 of the base image bytes;
2. SHA-256 of every protected overlay image;
3. SHA-256 of the canonical manifest containing the base hash, overlay hashes, roles, source layer IDs, preserve flags, and semantic metadata.

Changing base pixels, protected overlay pixels, or semantic metadata rejects the transfer.

## Import model

A verified v2 package contains:

\`\`\`text
base image
+ zero or more protected overlay images
+ semantic metadata
\`\`\`

Auralith imports the base image as its ordinary finishing layer.

Each protected overlay becomes a separate Auralith pixel layer with provenance metadata:

\`\`\`text
semanticRole
styleProtected
bridgeOverlay
bridgeVersion
sourceLayerId
sourceOverlayId
sourceContentHash
semantic
\`\`\`

After import, the base layer is selected for finishing.

## Existing call sequence remains valid

The existing agent workflow continues to work:

\`\`\`js
const payload = await A.bridge.domistika.receive()
await A.image.open(payload.image)

A.lut.apply('moonlight')
A.fx.apply('vig')
A.style.apply('cinema_369')
\`\`\`

When the verified pending transfer is v2 and \`image.open(...)\` receives that exact base-image payload, Auralith automatically installs the protected overlays.

## One-call stable import

Stable SDK v0.1.2 also adds:

\`\`\`js
await Auralith.bridge.domistika.import()
\`\`\`

This performs:

\`\`\`text
verified receive
→ base image open
→ protected overlay import
→ base layer activation
\`\`\`

and returns a lightweight result containing bridge version, project name, dimensions, overlay count, protected Auralith layer IDs, and manifest hash.

## Style protection

Protected bridge overlays are excluded from destructive active-layer finishing operations such as:

- pixel FX;
- plugin filters;
- LUT application;
- gradient-map application;
- Curves.

If a protected layer is selected and one of those operations is invoked, Auralith skips it and reports that the semantic overlay is protected.

## Composite order

Auralith also protects semantic overlays from global finishing adjustments.

The authoritative compositor now follows:

\`\`\`text
normal layers
→ adjustment layers
→ global Auralith color/contrast filter
→ protected semantic overlays
\`\`\`

Protected overlays are therefore drawn after the global grade.

This is the behavior required to keep a title readable while \`cinema_369\` grades and RGB-splits the base artwork.

## Receiver preview

The Domistika receive card and floating reference preview stack verified v2 overlay images over the base image.

The preview therefore shows the same protected visual composition that will be imported.

## Native WebMCP

Site tools v0.1.2 adds:

\`\`\`text
auralith_import_domistika_transfer
\`\`\`

It calls the same stable import method:

\`\`\`js
Auralith.bridge.domistika.import()
\`\`\`

The native road does not implement a separate bridge.

## Receipts

Creative receipts now retain bridge provenance on imported layers:

\`\`\`text
semanticRole
styleProtected
bridgeOverlay
sourceLayerId
sourceContentHash
\`\`\`

This lets a receipt distinguish gradeable base artwork from protected semantic overlays.

## Contracts

\`\`\`text
Auralith app:       v0.7.3-alpha
Stable SDK:         0.1.2
Stable SDK schema:  auralith.sdk.v1
Site tools:         0.1.2
Site-tool schema:   auralith.site-tools.v1
Bridge protocol:    parallax-creative-bridge v2 + v1 fallback
\`\`\`

## Live acceptance target

\`\`\`text
Domistika title
→ bridge v2
→ verify base + overlay + manifest
→ import separate protected title
→ moonlight
→ vignette
→ cinema_369
→ finished capture
→ title remains readable
→ receipt records protected-layer provenance
\`\`\`
