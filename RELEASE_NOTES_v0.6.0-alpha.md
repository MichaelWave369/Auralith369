# Auralith369 v0.6.0-alpha

## GPU Lab v0.5 — Prism Drift / Spectral Forge

- Adds bounded radial RGB prism dispersion.
- Adds hue rotation and saturation shaping.
- Adds shadow/highlight duotone mapping with validated local color values.
- Adds continuous solarization.
- Adds six channel-remap modes: RGB, RBG, GRB, GBR, BRG, and BGR.
- Adds **Prism Oracle** and **Solarized Reliquary** built-in cartridges.
- Advances portable GPU cartridge schema to version 4.
- Preserves complete spectral state in `.auralith` projects, local recovery, receipts, manifests, and `.auralith-gpu.json` exports.

## Compatibility

- Existing projects and cartridges remain valid.
- Missing Spectral Forge settings normalize to a neutral disabled state.
- Unknown channel maps fall back to RGB.
- Imported tint colors are restricted to normalized hex colors.

## Authority boundary

Canvas 2D remains authoritative for project pixels, layers, masks, tools, undo/redo, recovery, and standard exports. Spectral Forge affects only the optional Three.js/WebGL2 preview and explicit GPU export.

## Validation

- Spectral normalization and bounds tests
- Legacy cartridge compatibility
- Shader-contract tests
- Production build
- Chromium, Firefox, and WebKit browser gates
- Existing GPU fallback, Feedback Chamber, cartridge persistence/export, save/reopen, recovery, edge-tool, and 1080p/4K performance gates
