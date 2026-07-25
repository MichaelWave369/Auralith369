const CONTEXT_ATTRIBUTES = Object.freeze({
  alpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance'
});

export function createWebGL2Context(canvas) {
  if (!canvas?.getContext) return null;
  try {
    return canvas.getContext('webgl2', CONTEXT_ATTRIBUTES);
  } catch {
    return null;
  }
}

export function probeWebGL2(createCanvas) {
  const factory = createCanvas || (() => {
    if (typeof document === 'undefined') return null;
    return document.createElement('canvas');
  });

  const canvas = factory();
  if (!canvas?.getContext) {
    return {
      supported: false,
      reason: 'WebGL2 is unavailable in this environment.'
    };
  }

  const context = createWebGL2Context(canvas);
  if (!context) {
    return {
      supported: false,
      reason: 'This browser or graphics driver could not create a WebGL2 context.'
    };
  }

  const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
  const result = {
    supported: true,
    reason: 'WebGL2 ready',
    maxTextureSize: context.getParameter(context.MAX_TEXTURE_SIZE),
    maxRenderbufferSize: context.getParameter(context.MAX_RENDERBUFFER_SIZE),
    renderer: debugInfo ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'WebGL2 renderer',
    vendor: debugInfo ? context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Browser graphics stack'
  };

  context.getExtension('WEBGL_lose_context')?.loseContext();
  return result;
}

export { CONTEXT_ATTRIBUTES };
