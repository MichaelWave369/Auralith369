# Auralith Core Release Gate

Auralith's Canvas 2D editor remains the authoritative editing and project engine. A second GPU renderer must not become a release dependency until every gate below is satisfied.

## Required before GPU Lab

- [x] Project save/reopen round trip validated in a real browser
- [x] Transactional undo/redo includes pixel layers, masks, layer metadata, active layer, and canvas size
- [x] Browser smoke coverage opens every inspector and checks export paths
- [x] No runtime third-party font request
- [ ] Canvas compositing is frame-scheduled and coalesces repeated pointer updates
- [ ] Edge-region tools work at all four canvas borders without swallowed exceptions
- [ ] Internal clipboard and operating-system image paste have explicit precedence
- [ ] Dependency installation is reproducible from a committed lockfile
- [ ] Crash/refresh recovery protects unsaved work
- [ ] Chromium, Firefox, and WebKit smoke suites pass
- [ ] 1080p and 4K performance budgets are recorded and enforced

## Architectural boundary

Canvas 2D owns:

- project state and file compatibility
- editing tools and selections
- layer and mask authority
- undo/redo and recovery
- receipts, manifests, and deterministic export state

Future GPU rendering may consume synchronized layer textures and provide non-destructive visual effects, but GPU memory must never become the sole copy of project truth.
