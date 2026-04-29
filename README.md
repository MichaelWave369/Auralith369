# Auralith369

**Local-first visual alchemy.**

Auralith369 is a public-alpha creative workstation by PHI369 Labs for image editing, poster forging, style cards, manifests, and auditable creative receipts.

> ⚠️ **Alpha status:** This is alpha software. Auralith369 runs locally in your browser. Avoid opening untrusted `.auralith` project files until import validation is hardened. No warranty; MIT licensed.

## Features (Public Alpha)
- Canvas editor with local rendering
- Layer stack with opacity, masks, and blend modes
- Core tools: brush, move, crop, transform, and selection modes
- Filters/LUTs/gradient-map oriented workflow foundations
- Poster Forge + style card workflow
- PHI/369/sacred geometry overlays with snap system
- Caption tooling and dominant color extraction
- Project save/load (`.auralith`)
- Auralith Receipt export (`.auralith-receipt.json`)
- Auralith Manifest export (`.auralith-manifest.md`)
- Version snapshots and social pack export oriented pipeline

## Local Setup
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Development Commands
```bash
npm run dev
npm run build
npm run preview
```

## Install / Dev / Test / Build
```bash
npm install
npm run dev
npm test
npm run build
```

## File Formats
- Project: `.auralith`
- Receipt: `.auralith-receipt.json`
- Manifest: `.auralith-manifest.md`

See docs:
- `docs/FILE_FORMAT.md`
- `docs/RECEIPTS.md`
- `docs/MANIFESTS.md`
- `docs/STYLE_CARDS.md`

## Screenshots
Screenshots coming soon.

## Roadmap
See `ROADMAP.md`.

## License
MIT (`LICENSE`). No warranty.

## Attribution
Auralith369 is built by **PHI369 Labs**.

## Quality Checks

- Smoke check: if the app shows an **Auralith369 runtime error** panel, open browser console and report the displayed error.

```bash
npm install
npm test
npm run build
npm run dev
```

## Online Demo

Once GitHub Pages is enabled for this repository, Auralith369 will be available at:

https://michaelwave369.github.io/Auralith369/

If the page is not live yet, enable GitHub Pages under repository Settings → Pages and set Source to GitHub Actions.

If the online demo shows only a blank background, open DevTools Console and report any message from:
- Auralith369 failed to boot
- Auralith369 runtime error
