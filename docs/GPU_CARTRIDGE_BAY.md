# Auralith GPU Cartridge Bay

GPU Lab v0.2 treats reusable shader settings as **visual cartridges**. A cartridge is a named, portable parameter set for CRT Signal and Aura Bloom.

## Workflow

1. Open the **GPU** inspector.
2. Choose a built-in or custom cartridge.
3. Tune the live controls.
4. Save the result as a new cartridge or update an existing custom cartridge.
5. Export a cartridge as `.auralith-gpu.json` to move it between browsers or collaborators.

Built-in cartridges are protected. Renaming or updating one creates a custom cartridge rather than modifying the shipped reference.

## Local persistence

Custom cartridges and favorites are stored locally in the browser under versioned storage keys. They are not uploaded. Invalid or malformed records are ignored safely.

## Project persistence

A `.auralith` project records:

- whether GPU preview was enabled
- whether it was bypassed
- active cartridge ID and name
- whether the cartridge settings were modified
- normalized CRT Signal and Aura Bloom parameters

The exact visual state therefore travels with the project even when the receiving browser does not have the same custom cartridge library.

## Portable cartridge format

```json
{
  "kind": "auralith.gpu-preset",
  "version": 1,
  "exportedAt": "2026-07-25T00:00:00.000Z",
  "preset": {
    "id": "custom:example",
    "name": "Example Signal",
    "description": "A portable Auralith GPU cartridge.",
    "settings": {
      "crt": {},
      "bloom": {}
    }
  }
}
```

Imported values are normalized through the same bounded settings model used by GPU Lab. Unknown fields are ignored, malformed JSON is rejected, and imported cartridges receive a new local custom ID.

## Comparison controls

- **Bypass GPU** keeps the Canvas 2D composition visible until GPU preview is resumed.
- **Hold Original** temporarily reveals the Canvas 2D authority layer while pressed.

## Authority boundary

GPU cartridges never become the sole copy of artwork. Canvas 2D remains authoritative for editing, layers, masks, history, recovery, receipts, manifests, and standard exports.
