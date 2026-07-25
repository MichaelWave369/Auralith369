# Auralith369 v0.3.0-alpha

## GPU Lab v0.2 — Cartridge Bay

- Adds eight built-in GPU signal cartridges.
- Preserves the first live high-energy discovery as **Cathedral Resonance**.
- Adds custom cartridge save, update, clone, rename, delete, and favorite controls.
- Adds portable `.auralith-gpu.json` cartridge import and export.
- Adds GPU bypass and press-and-hold original comparison.
- Persists cartridge identity, exact settings, modified state, and bypass state in `.auralith` projects and local recovery snapshots.
- Records cartridge provenance in receipts and manifests.
- Keeps custom cartridge libraries local to the browser.

## Built-in cartridges

- Golden Oracle
- Cathedral Resonance
- Haunted Broadcast
- VHS Revelation
- Arcade Ascension
- Solar Relic
- Phosphor Dream
- Temple Transmission

## Authority boundary

Canvas 2D remains authoritative for pixels, layers, masks, tools, undo/redo, recovery, standard exports, and project compatibility. GPU cartridges are parameterized, non-destructive visual states layered above that authority.

## Validation

- GPU preset normalization and bounds tests
- Malformed import rejection
- Local cartridge/favorite storage tests
- Production build gate
- Chromium, Firefox, and WebKit browser smoke tests
- Existing save/reopen, recovery, edge-tool, export, and performance gates
