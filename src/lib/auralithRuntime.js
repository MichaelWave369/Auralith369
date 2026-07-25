export const AURALITH_OVERLAYS = Object.freeze([
  { id: 'none', n: 'None' },
  { id: 'phi', n: 'Φ Grid' },
  { id: 'thirds', n: 'Rule of Thirds' },
  { id: 'spiral', n: 'Golden Spiral' },
  { id: '369', n: '369 Grid' }
]);

export function installAuralithRuntimeGlobals(target = globalThis) {
  target.OVL = AURALITH_OVERLAYS;
  return target;
}
