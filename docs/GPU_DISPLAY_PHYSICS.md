# Auralith GPU Lab v0.3 — Display Physics

Display Physics extends the optional Three.js/WebGL2 preview with monitor- and signal-inspired shaping while preserving Canvas 2D as the project authority.

## Controls

- **Scanline Softness** — blends hard digital rows into smoother analog modulation.
- **Phosphor Mask** — Off, Aperture Grille, Slot Mask, or Triad Dot simulation.
- **Phosphor Strength** — controls the visibility of the selected subpixel pattern.
- **Signal Ghosting** — adds two bounded horizontal echo taps from the current source frame.
- **Ghost Offset** — controls horizontal spacing between the source and echo taps.
- **Brightness Compensation** — restores energy lost to scanlines and phosphor masking.
- **Black Crush** — remaps the lower range without modifying source pixels.
- **Highlight Rolloff** — compresses bright GPU output to protect luminous detail.

## Data model

Display settings live under `gpuLab.settings.display`:

```json
{
  "scanlineSoftness": 0.65,
  "phosphorMask": "aperture",
  "phosphorStrength": 0.18,
  "ghosting": 0.1,
  "ghostOffset": 3,
  "brightness": 1.05,
  "blackCrush": 0.04,
  "highlightRolloff": 0.25
}
```

All imported values are normalized and clamped. Legacy cartridges without a `display` block remain valid and receive safe defaults.

## Authority boundary

Display Physics never becomes the sole holder of artwork. Canvas 2D remains authoritative for pixels, layers, masks, tools, history, recovery, standard exports, and project compatibility. GPU output is a non-destructive parameterized view and an explicit GPU PNG export target.

## Receipt behavior

Because receipts and manifests already include normalized GPU settings, Display Physics values are automatically carried into project provenance, recovery, and exported cartridge files.
