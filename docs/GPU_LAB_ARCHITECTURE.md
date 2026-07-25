# Auralith GPU Lab Architecture

## Purpose

GPU Lab is Auralith369's optional second rendering heart. It adds live shader-driven visual treatments without replacing the proven Canvas 2D editing engine.

## Authority boundary

Canvas 2D remains authoritative for:

- project state and `.auralith` compatibility
- pixel layers, masks, selections, and editing tools
- undo/redo and crash recovery
- receipts, manifests, and deterministic core exports

GPU Lab may consume a synchronized composite frame and render a non-destructive preview. GPU memory is never the sole copy of artwork or project state.

## v0.1 foundation

- Three.js running on an explicitly requested WebGL2 context
- capability detection with a clean Canvas 2D fallback
- a separate overlay canvas that never captures pointer input
- CRT Signal controls: curvature, scanlines, chromatic separation, vignette, and noise
- Aura Bloom controls: strength, radius, and threshold
- explicit GPU-frame PNG export
- GPU settings saved as optional project metadata

## Rendering flow

```text
Auralith project model
        |
        v
Canvas 2D compositor (authority)
        |                       \
        |                        -> normal export / receipt / recovery
        v
synchronized composite canvas
        |
        v
GpuLabPreview bridge
        |
        v
Three.js WebGL2 fullscreen shader
        |
        v
optional live preview / explicit GPU PNG export
```

## Failure behavior

If WebGL2 is unavailable, blocked, lost, or fails initialization:

1. the GPU overlay remains hidden;
2. the Canvas 2D editor continues operating normally;
3. the GPU panel reports the fallback reason;
4. project files remain valid and editable.

## Next stages

The foundation deliberately avoids making GPU rendering a release dependency. Later stages may add feedback buffers, displacement fields, particle brushes, audio reactivity, dimensional layer planes, and a renderer abstraction prepared for WebGPU. Each stage must preserve the authority boundary above.
