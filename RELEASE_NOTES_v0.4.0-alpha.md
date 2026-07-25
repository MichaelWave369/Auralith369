# Auralith369 v0.4.0-alpha

## GPU Lab v0.3 — Display Physics

- Adds scanline softness control.
- Adds Aperture Grille, Slot Mask, and Triad Dot phosphor simulations.
- Adds phosphor-strength control.
- Adds bounded two-tap horizontal signal ghosting and adjustable echo offset.
- Adds brightness compensation for scanline and phosphor energy loss.
- Adds black-crush shaping and highlight rolloff.
- Upgrades every built-in GPU cartridge with intentional display-physics settings.
- Preserves legacy cartridges by applying safe normalized defaults.

## Cartridge compatibility

Display Physics is part of the existing normalized GPU settings object. Custom cartridges, `.auralith` projects, local recovery snapshots, receipts, manifests, and `.auralith-gpu.json` exports carry the new values automatically.

## Authority boundary

Canvas 2D remains authoritative for pixels, layers, masks, tools, undo/redo, recovery, standard exports, and project compatibility. Display Physics is a non-destructive Three.js/WebGL2 preview and explicit GPU export layer.

## Validation

- Display-physics normalization and bounds tests
- Legacy cartridge compatibility tests
- Built-in cartridge provenance checks
- Shader token/contract coverage
- Production build
- Chromium, Firefox, and WebKit browser smoke tests
- Existing save/reopen, recovery, edge-tool, GPU fallback, cartridge persistence, export, and 1080p/4K performance gates
