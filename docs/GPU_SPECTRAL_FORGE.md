# GPU Spectral Forge

## Purpose

GPU Lab v0.5 adds a parameterized color-and-prism stage to Auralith's optional Three.js/WebGL2 renderer without moving project authority away from Canvas 2D.

## Rendering order

```text
Canvas 2D composite
        |
        v
CRT channel sampling + radial prism offset
        |
        v
Bloom + Feedback Chamber
        |
        v
Spectral Forge
  - channel remap
  - hue rotation
  - saturation shaping
  - shadow/highlight duotone
  - solarization
        |
        v
Display Physics + explicit GPU output
```

The Spectral Forge stage is applied after recursive feedback composition, so feedback cartridges can accumulate the transformed signal. Prism dispersion is sampled radially from the image center and is measured in bounded source pixels.

## Controls

- Spectral Forge on/off
- Hue Drift: -180° to 180°
- Saturation: 0% to 250%
- Prism Dispersion: 0–24 px
- Shadow Tint
- Highlight Tint
- Tint Strength: 0–100%
- Solarize: 0–100%
- Channel Map: RGB, RBG, GRB, GBR, BRG, or BGR

## Compatibility and safety

- Spectral Forge is disabled by default for legacy settings.
- Legacy and custom cartridges receive neutral normalized values.
- Imported colors accept bounded `#RGB` or `#RRGGBB` values only.
- Unknown channel maps fall back to RGB.
- No control changes Canvas 2D pixels, layers, masks, history, or standard exports.
- Projects, recovery snapshots, receipts, manifests, and `.auralith-gpu.json` cartridges preserve the normalized spectral state.

## Built-in spectral cartridges

- Golden Oracle
- Cathedral Resonance
- Haunted Broadcast
- VHS Revelation
- Arcade Ascension
- Solar Relic
- Phosphor Dream
- Temple Transmission
- Infinite Cathedral
- Mirror Shrine
- Prism Oracle
- Solarized Reliquary

**Prism Oracle** is a clean radial-dispersion reference with cyan-gold duotone light. **Solarized Reliquary** combines strong solarization, channel remapping, and recursive amber-violet memory.
