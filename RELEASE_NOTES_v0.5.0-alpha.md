# Auralith369 v0.5.0-alpha

## GPU Lab v0.4 — Feedback Chamber

- Adds true ping-pong GPU frame recursion.
- Adds feedback amount and decay.
- Adds recursive zoom and rotation.
- Adds X/Y frame offsets.
- Adds X, Y, and quad mirror modes.
- Adds 2–12 segment kaleidoscopic folding.
- Adds Mix, Add, and Screen feedback blending.
- Adds explicit local feedback-buffer clearing.
- Runs recursive preview updates at a bounded 30 FPS.
- Avoids re-uploading the Canvas 2D source texture on every recursive frame.

## Cartridge library

- Adds **Infinite Cathedral**.
- Adds **Mirror Shrine**.
- Upgrades compatible existing cartridges with intentional recursive settings.
- Keeps Golden Oracle and Arcade Ascension as clean non-feedback references.
- Advances the portable cartridge schema to version 3 while retaining legacy compatibility.

## Authority boundary

Feedback remains an optional, non-destructive GPU state. Canvas 2D continues to own pixels, layers, masks, tools, undo/redo, recovery, project compatibility, and standard exports.

## Validation

- Feedback bounds and legacy-normalization tests
- Shader contract coverage
- Cartridge round-trip coverage
- Chromium, Firefox, and WebKit browser gates
- Existing GPU capability/fallback gates
- Existing recovery, project save/reopen, edge-tool, export, and performance gates
