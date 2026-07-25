# Auralith369 v0.2.0-alpha

## GPU Lab foundation

- Adds an optional Three.js renderer on an explicit WebGL2 context.
- Adds CRT Signal controls for curvature, scanlines, chromatic separation, vignette, and signal noise.
- Adds thresholded multi-tap Aura Bloom controls.
- Adds a separate pointer-transparent preview canvas and explicit GPU PNG export.
- Saves GPU settings as optional `.auralith` metadata and records them in receipts and manifests.
- Preserves Canvas 2D as the authority layer with a clean fallback when WebGL2 is unavailable.

## Stability

- Existing Canvas 2D tests, project round trips, recovery, edge tools, and performance gates remain release requirements.
- Browser smoke coverage exercises a live GPU preview only when the capability control is enabled, and otherwise verifies the explicit fallback path.
- Numeric UI flags are boolean-coerced so inactive controls cannot leak visible `0` characters into the workstation.
