# Auralith369 v0.7.1-alpha — Native WebMCP Site Tools

Auralith369 now exposes a compact browser-native WebMCP layer over the frozen \`window.Auralith\` stable SDK.

The architecture is intentionally thin:

\`\`\`text
browser agent / site tools
        ↓
WebMCP
        ↓
Auralith site-tool adapter
        ↓
window.Auralith
        ↓
existing finishing workstation
\`\`\`

The site-tool adapter does not reach into React state, raw Canvas 2D contexts, raw WebGL contexts, or hidden workstation closures.

## Why a curated surface

Auralith’s stable SDK already exposes a rich finishing vocabulary.

WebMCP therefore registers a smaller, high-value tool set rather than dumping every live command into agent context.

The agent can search the full command language explicitly when it needs deeper capabilities.

## Registered tools

### Read-only

\`\`\`text
auralith_get_capabilities
auralith_search_commands
auralith_list_layers
auralith_get_domistika_transfer
\`\`\`

### Mutating / action tools

\`\`\`text
auralith_add_layer
auralith_update_layer
auralith_apply_fx
auralith_apply_lut
auralith_apply_style
auralith_apply_gpu_cartridge
auralith_set_adjustments
auralith_receive_domistika_transfer
auralith_import_domistika_transfer
auralith_export_receipt
auralith_execute_command
\`\`\`

All of these operations route through \`window.Auralith\`.

## Capability discovery

\`\`\`text
auralith_get_capabilities
\`\`\`

returns a slim snapshot of:

- app and SDK versions;
- project and image state;
- layer state;
- FX/LUT/Style availability;
- GPU capability and cartridge count;
- saved Actions;
- receipt availability;
- verified Domistika bridge availability;
- live command count.

## Command discovery

\`\`\`text
auralith_search_commands
auralith_execute_command
\`\`\`

wrap:

\`\`\`js
Auralith.commands.search(...)
Auralith.commands.execute(...)
\`\`\`

Execution verifies that the command exists in the live stable command list before invoking it.

This is bounded semantic command execution, not arbitrary JavaScript.

## Layer operations

The site-tool layer can:

- list sanitized layer metadata;
- add a finishing layer;
- activate a layer;
- change opacity;
- change blend mode;
- enable or disable a mask.

Raw layer canvases and contexts remain private to the workstation.

## FX / LUT / Style

Dedicated site tools wrap the existing stable operations:

\`\`\`js
Auralith.fx.apply(...)
Auralith.lut.apply(...)
Auralith.style.apply(...)
\`\`\`

They use the exact same finishing pipelines as the human workstation.

## GPU Lab

\`\`\`text
auralith_apply_gpu_cartridge
\`\`\`

loads an existing Cartridge Bay preset.

The tool description and implementation preserve Auralith’s authority boundary:

\`\`\`text
Canvas 2D = project / edit / receipt / standard-export authority
GPU Lab   = non-destructive finishing preview
\`\`\`

A site-tool GPU call does not silently promote preview pixels into the authoritative project.

## Adjustments

\`\`\`text
auralith_set_adjustments
\`\`\`

supports the existing bounded global controls:

\`\`\`text
br    brightness   0..200
ct    contrast     0..200
st    saturation   0..200
hu    hue          0..360
bl    blur         0..20
temp  temperature -50..50
\`\`\`

Omitted values remain unchanged.

## Domistika transfer hygiene

The native bridge tools deliberately keep the image payload out of agent context.

\`\`\`text
auralith_get_domistika_transfer
auralith_receive_domistika_transfer
\`\`\`

return a summary containing:

- protocol;
- source / target;
- project name;
- content hash;
- palette;
- MIME type;
- dimensions;
- estimated payload size.

They do **not** return the base64 artwork data URI.

The receive tool still delegates to:

\`\`\`js
Auralith.bridge.domistika.receive()
\`\`\`

which uses the existing verified bridge path.

WebMCP does not create an integrity bypass.

## Verified semantic Domistika import

The native action:

```text
auralith_import_domistika_transfer
```

calls:

```js
Auralith.bridge.domistika.import()
```

For Creative Bridge v2, this imports the verified base raster and protected semantic overlays as separate Auralith layers.

The native path does not implement an alternate bridge or bypass integrity verification.

## Finished-art capture

Starting in v0.7.2-alpha, the read-only site tool:

```text
auralith_capture_png
```

returns the authoritative Canvas 2D finished artwork as a bounded PNG readback.

The response includes:

- capture schema
- `authority: canvas2d`
- project name
- MIME type
- dimensions
- byte count
- SHA-256
- one `dataBase64` payload

The duplicate data URL is intentionally omitted from the WebMCP response.

## Creative receipt

\`\`\`text
auralith_export_receipt
\`\`\`

uses the normal receipt generator and preserves its existing download behavior.

The site-tool response returns a lightweight receipt summary:

- receipt ID;
- timestamp;
- project name;
- image hash;
- layer count;
- GPU preset summary.

It does not return project pixels.

## WebMCP lifecycle

The adapter prefers:

\`\`\`js
document.modelContext.registerTool(...)
\`\`\`

and retains a compatibility fallback for older \`navigator.modelContext\` implementations.

Registrations use an \`AbortController\` signal so the whole tool set can be withdrawn as one lifecycle unit.

Normal browsers without WebMCP continue to run Auralith normally.

## Annotations

Read operations use:

\`\`\`text
readOnlyHint: true
\`\`\`

Mutating creative operations use:

\`\`\`text
readOnlyHint: false
\`\`\`

Bridge/project metadata that can contain user-authored strings is marked untrusted where appropriate.

Creative finishing operations are bounded project mutations and are not marked as high-stakes consequential actions.

## Boundaries

The WebMCP module exposes no:

- arbitrary JavaScript evaluation;
- raw Canvas 2D context;
- raw WebGL context;
- network fetch API;
- filesystem API;
- bridge verification bypass.

\`\`\`text
SITE TOOL != RAW PAGE AUTHORITY
GPU PREVIEW != PROJECT AUTHORITY
BRIDGE TOOL != TRUST BYPASS
COMMAND EXECUTION != ARBITRARY JAVASCRIPT
\`\`\`

## Contracts

\`\`\`text
Auralith app:      v0.7.3-alpha
Stable SDK:        0.1.2
Stable SDK schema: auralith.sdk.v1
Site tools:        0.1.2
Site-tool schema:  auralith.site-tools.v1
\`\`\`
