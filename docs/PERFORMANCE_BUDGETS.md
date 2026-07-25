# Auralith Core Performance Budgets

These budgets protect the Canvas 2D authority layer before a GPU renderer is introduced. They are intentionally framed as release-blocking responsiveness ceilings rather than aspirational benchmark scores.

## CI reference environment

- GitHub-hosted Ubuntu runner
- Node.js 22
- Playwright Chromium
- Production Vite build served through `vite preview`
- One visible pixel layer with the normal Auralith compositor path

## Enforced budgets

| Canvas | Composite samples | Average ceiling | Worst-sample ceiling |
|---|---:|---:|---:|
| 1920×1080 | 3 | 500 ms | 750 ms |
| 3840×2160 | 2 | 2,000 ms | 3,000 ms |

The browser smoke suite calls Auralith's read-only diagnostic compositor. It measures complete synchronous composites because exports, receipts, thumbnails, and future GPU texture synchronization all depend on this path remaining bounded.

## Interactive rendering policy

Pointer-driven screen updates are separately coalesced through `requestAnimationFrame`. Histogram work is delayed and sampled, so it is not included in the synchronous composite budget.

## Change policy

A budget increase requires:

1. a documented visual or correctness benefit;
2. before/after measurements;
3. confirmation that 4K editing remains usable;
4. an explicit update to this document and the browser test.

GPU acceleration may improve these figures later, but the Canvas 2D fallback must continue meeting its own budgets.
