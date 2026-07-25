# Auralith369 Technical Audit — July 2026

## Executive Summary

The editor has a strong and surprisingly broad alpha feature set, but two release-blocking faults were present in the current main branch:

1. The adjustments panel referenced an `OVL` registry that did not exist at runtime, causing the React error boundary to replace the editor with a runtime-error screen.
2. The `.auralith` validator did not accept the compact field names and canvas shape emitted by the editor's own exporter, so a project saved by Auralith369 could be rejected when reopened.

Both blockers are addressed in the accompanying stability branch. The same pass also integrates the new visual identity and tightens the embedded-image trust boundary.

## Corrected in This Pass

### Runtime boot and rendering
- Added a single overlay registry for `none`, Φ grid, thirds, golden spiral, and 369 grid.
- Installed the registry before the canonical editor component renders.
- Added a regression test that locks this runtime contract.

### Project round-trip compatibility
- Accepts both canonical fields and the editor's compact aliases:
  - canvas: `canvas.width`/`canvas.height` or `size.w`/`size.h`
  - layer name: `name`, `title`, or `n`
  - blend mode: `blendMode`, `blend`, or `bl`
  - visibility: `visible` or `vis`
  - opacity: `opacity` or `op`
- Preserves project `name`, overlay object state, and snap object state during normalization.
- Adds a regression fixture shaped exactly like the current editor export.

### Import safety
- Validates `layerData`, `maskData`, and `orig` instead of only shallow image-like fields.
- Allows bounded base64 PNG, JPEG, and WebP data URLs.
- Rejects remote sources and SVG payloads.
- Caps both individual images and aggregate embedded image data.

### Identity and interface
- Added the new mark, compact favicon, and repository banner.
- Replaced the temporary Φ app tile with the Auralith369 mark.
- Added restrained scanline and beveled-control treatment inspired by classic SNES-era emulator workstations.
- Added visible keyboard focus states and reduced-motion handling.

## Remaining High-Priority Engineering Work

### P1 — Make undo/redo transactional

History snapshots are captured inconsistently. Some tools save after mutation, while filters, transforms, crop, and other operations save before mutation. This can make redo restore the pre-operation frame instead of the completed operation. Mask canvases are not included in history snapshots, so mask edits cannot be reliably undone and redone.

Recommended direction:
- centralize every edit through `beginTransaction` / `commitTransaction`
- snapshot pixels, masks, layer metadata, active layer, and canvas size together
- add deterministic undo/redo tests for brush, filter, crop, move, masks, and layer operations

### P1 — Move expensive rendering off the pointer hot path

Every brush movement can trigger full layer compositing plus a complete RGB histogram scan. On large canvases or multiple layers this will create visible lag and can freeze lower-memory browsers.

Recommended direction:
- composite with `requestAnimationFrame`
- calculate histograms on a throttled worker or only after pointer-up
- cache unchanged layer composites
- add a performance budget for 1080p and 4K canvases

### P1 — Add a real browser smoke suite

The current tests protect the schema but do not open the application, click every panel, import/export a project, or exercise the canvas.

Recommended direction:
- Playwright smoke test for boot, all right-panel tabs, open image, save/reopen project, export PNG, undo/redo, and error-boundary absence
- run against the GitHub Pages base path in CI

## Remaining Medium-Priority Work

### P2 — Split the canonical editor component

The main editor currently combines pixel algorithms, file I/O, state, keyboard handling, rendering, and the complete UI in one large component. This makes small fixes risky and hides cross-feature state bugs.

Suggested modules:
- `editor/core` — project and command state
- `editor/render` — layer compositor and histogram worker
- `editor/tools` — brush, selection, heal, clone, transform
- `editor/io` — project, receipt, manifest, and image export
- `editor/ui` — toolbar, canvas viewport, inspector tabs, dialogs

### P2 — Resolve clipboard ownership

The keyboard shortcut handler intercepts Ctrl/Cmd+V for the editor's internal clipboard while a separate browser paste listener tries to import pasted images. These paths can compete. Define explicit precedence: selected-pixel paste first when available, otherwise system image paste.

### P2 — Harden edge-region tools

Smudge, dodge/burn, clone, liquify, and color replacement request fixed-size pixel rectangles near canvas edges and suppress exceptions. The tools can silently stop working at borders. Clamp both origin and rectangle dimensions before `getImageData` / `putImageData`.

### P2 — Remove external runtime dependencies

The editor injects a Google Fonts request from inside the React tree. A local-first application should bundle or use a local/system monospace stack and remain fully usable offline without third-party requests.

### P2 — Reproducible installs

Commit a generated `package-lock.json` and use `npm ci` unconditionally in CI. This will make releases and Pages builds reproducible.

### P2 — Reset the entire project domain on New

`New Canvas` should explicitly clear project name, versions, saved batches, receipts/manifests, original comparison state, and any project-scoped metadata so a fresh document cannot inherit stale state.

## Product Additions Worth Building Next

1. **Auralith Session Recovery** — autosave a compact project journal to IndexedDB and offer recovery after a crash or accidental refresh.
2. **Command Palette** — a ZSNES-style keyboard-first launcher for tools, filters, exports, panels, and recent actions.
3. **Workspace Presets** — Editing, Poster Forge, Pixel Lab, and Receipt Review layouts.
4. **Pixel Preview Mode** — nearest-neighbor zoom, optional CRT mask, palette limits, tile grid, and SNES-oriented export helpers.
5. **Receipt Inspector** — reopen a receipt beside the current project and verify hashes, history tail, dimensions, and export settings.
6. **Plugin Sandbox** — move extensions into workers with capability declarations, execution timeouts, and deterministic receipt entries.
7. **Installable Offline App** — service worker, manifest, file handlers, and a clear offline-ready indicator.

## Release Gate Recommendation

Before calling the editor beta-ready:

- boot smoke suite passes in Chromium, Firefox, and WebKit
- save/reopen round trip is proven in-browser
- undo/redo is transactional for pixels and masks
- 4K brush interaction remains responsive under the agreed performance budget
- app loads and edits with the network disabled
- one recovery path exists for refresh/crash loss
