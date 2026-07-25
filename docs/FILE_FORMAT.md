# Auralith File Format

## `.auralith`

JSON-based project container for local-first editing sessions.

Typical fields:
- metadata (product/version/timestamp)
- canvas size (`canvas.width`/`canvas.height` or editor-export `size.w`/`size.h`)
- editor state (tool, overlay, snap)
- layer stack (name, visibility, blend mode, opacity, mask)
- embedded raster layer and mask data
- caption and style card references

Security note: treat all imported `.auralith` data as untrusted.

## Validation Rules (Alpha)
- Project must be a JSON object.
- `version` / `appVersion` must be strings when present.
- Canvas width/height must be numeric and between 1 and 8192.
- `layers` must be an array with at most 128 entries.
- Each layer must include `id` and `name`/`title`/`n`.
- `visible`/`vis` must be boolean-like if present.
- `opacity`/`op` must be between `0..1` (legacy `0..100` accepted and normalized).
- `blendMode`/`blend`/`bl` must be in the known blend-mode list.
- Embedded `layerData`, `maskData`, and `orig` values must be bounded base64 PNG, JPEG, or WebP data URLs.
- Remote image URLs and executable SVG image payloads are rejected.
- Metadata such as adjustments/style must be plain JSON objects.
- Invalid projects are rejected without partially loading state.

## Compatibility

The validator accepts both the normalized public schema and the compact aliases currently emitted by the editor. This makes a project saved by Auralith369 loadable by the same release while preserving a path toward a cleaner canonical v1 container.
