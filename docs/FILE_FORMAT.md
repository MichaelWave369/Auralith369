# Auralith File Format

## `.auralith`
JSON-based project container for local-first editing sessions.

Typical fields:
- metadata (product/version/timestamp)
- editor state (tool, overlay, snap)
- layer stack (name, visibility, blend mode, opacity, mask)
- caption and style card references

Security note: treat all imported `.auralith` data as untrusted.

## Validation Rules (Alpha)
- Project must be a JSON object.
- `version` / `appVersion` must be strings when present.
- Canvas width/height must be numeric and between 1 and 8192.
- `layers` must be an array with at most 128 entries.
- Each layer must include `id` and `name`/`title`.
- `visible`/`vis` must be boolean-like if present.
- `opacity`/`op` must be between `0..1` (legacy `0..100` accepted and normalized).
- `blend`/`blendMode` must be in the known blend-mode list.
- Image-like fields must be `data:image/` URLs and under size limits.
- Metadata such as adjustments/style must be plain JSON objects.
- Invalid projects are rejected without partially loading state.
