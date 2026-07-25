# GPU Feedback Chamber

## Purpose

GPU Lab v0.4 adds true recursive frame processing without moving project authority away from Auralith Core.

## Rendering model

The Three.js/WebGL2 renderer owns two local render targets. Each frame is written into one target while the prior frame is sampled from the other. The targets then swap roles.

```text
Canvas 2D composite
        |
        v
source texture + previous GPU frame
        |
        v
Feedback Chamber shader
        |
        +--> current GPU preview/export
        |
        `--> next frame's feedback texture
```

The source texture is uploaded only when the Canvas 2D composite changes. Recursive frames run at a bounded 30 FPS while feedback is enabled.

## Controls

- Amount
- Decay
- Zoom
- Rotation
- Offset X/Y
- Mirror: Off, X, Y, Quad
- Kaleidoscope: Off or 2–12 segments
- Blend: Mix, Add, Screen
- Clear Frame

## Safety and authority

- Feedback is disabled by default.
- All imported values are normalized and clamped.
- Clear Frame resets both GPU buffers only.
- Canvas 2D pixels, layers, masks, history, recovery, and normal exports are never modified.
- GPU state remains parameterized in projects, cartridges, receipts, and manifests.
- Disabling feedback clears stale recursive state before it can be reused.

## Built-in feedback cartridges

- Cathedral Resonance
- Haunted Broadcast
- VHS Revelation
- Solar Relic
- Phosphor Dream
- Temple Transmission
- Infinite Cathedral
- Mirror Shrine

Golden Oracle and Arcade Ascension remain clean non-feedback references.
