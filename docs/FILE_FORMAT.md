# Auralith File Format

## `.auralith`
JSON-based project container for local-first editing sessions.

Typical fields:
- metadata (product/version/timestamp)
- editor state (tool, overlay, snap)
- layer stack (name, visibility, blend mode, opacity, mask)
- caption and style card references

Security note: treat all imported `.auralith` data as untrusted.
