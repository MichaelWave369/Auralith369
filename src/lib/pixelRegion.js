export function clampPixelRegion(x, y, width, height, maxWidth, maxHeight) {
  const boundsWidth = Math.max(0, Math.floor(Number(maxWidth) || 0));
  const boundsHeight = Math.max(0, Math.floor(Number(maxHeight) || 0));
  if (boundsWidth === 0 || boundsHeight === 0) return null;

  const rawX = Math.floor(Number(x) || 0);
  const rawY = Math.floor(Number(y) || 0);
  const requestedWidth = Math.max(1, Math.ceil(Number(width) || 1));
  const requestedHeight = Math.max(1, Math.ceil(Number(height) || 1));

  const x0 = Math.max(0, Math.min(boundsWidth, rawX));
  const y0 = Math.max(0, Math.min(boundsHeight, rawY));
  const x1 = Math.max(0, Math.min(boundsWidth, rawX + requestedWidth));
  const y1 = Math.max(0, Math.min(boundsHeight, rawY + requestedHeight));

  if (x1 <= x0 || y1 <= y0) return null;
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

export function sharedPixelRegionSize(...regions) {
  const valid = regions.filter(Boolean);
  if (valid.length !== regions.length || valid.length === 0) return null;
  const width = Math.min(...valid.map(region => region.width));
  const height = Math.min(...valid.map(region => region.height));
  return width > 0 && height > 0 ? { width, height } : null;
}
