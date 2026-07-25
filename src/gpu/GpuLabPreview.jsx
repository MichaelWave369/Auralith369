import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import GpuLabRenderer from './GpuLabRenderer.js';
import { probeWebGL2 } from './capabilities.js';
import { normalizeGpuLabSettings } from './gpuLabDefaults.js';

const GpuLabPreview = forwardRef(function GpuLabPreview({
  enabled,
  width,
  height,
  settings,
  onStatus
}, forwardedRef) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const lastSourceRef = useRef(null);
  const onStatusRef = useRef(onStatus);
  const animationRef = useRef(0);
  const lastAnimationFrameRef = useRef(0);
  const [capability, setCapability] = useState({ supported: null, reason: 'Checking WebGL2…' });
  const [active, setActive] = useState(false);
  const [runtimeError, setRuntimeError] = useState('');
  const normalizedSettings = useMemo(() => normalizeGpuLabSettings(settings), [settings]);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    setCapability(probeWebGL2());
  }, []);

  const status = useMemo(() => ({
    ...capability,
    active,
    enabled: Boolean(enabled),
    reason: runtimeError || capability.reason
  }), [capability, active, enabled, runtimeError]);

  useEffect(() => {
    onStatusRef.current?.(status);
  }, [status]);

  useEffect(() => {
    rendererRef.current?.dispose();
    rendererRef.current = null;
    setActive(false);
    setRuntimeError('');

    if (!enabled || capability.supported !== true || !canvasRef.current) return undefined;

    try {
      rendererRef.current = new GpuLabRenderer(canvasRef.current, {
        width,
        height,
        settings: normalizedSettings
      });
      setActive(true);
      if (lastSourceRef.current) rendererRef.current.render(lastSourceRef.current);
    } catch (error) {
      console.warn('[Auralith369] GPU Lab initialization failed', error);
      setRuntimeError(error?.message || 'GPU preview failed to initialize.');
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [enabled, capability.supported, width, height]);

  useEffect(() => {
    rendererRef.current?.updateSettings(normalizedSettings);
    if (lastSourceRef.current) rendererRef.current?.render(lastSourceRef.current);
  }, [normalizedSettings]);

  useEffect(() => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = 0;
    lastAnimationFrameRef.current = 0;

    if (!active || !normalizedSettings.feedback.enabled) return undefined;

    const tick = timestamp => {
      animationRef.current = requestAnimationFrame(tick);
      if (document.hidden || timestamp - lastAnimationFrameRef.current < 33) return;
      lastAnimationFrameRef.current = timestamp;
      const renderer = rendererRef.current;
      const source = lastSourceRef.current;
      if (!renderer || !source) return;
      try {
        renderer.render(source, { updateSource: false });
      } catch (error) {
        console.warn('[Auralith369] GPU feedback animation failed', error);
        setRuntimeError(error?.message || 'GPU feedback animation failed.');
        setActive(false);
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    };
  }, [active, normalizedSettings.feedback.enabled]);

  useImperativeHandle(forwardedRef, () => ({
    render(sourceCanvas) {
      lastSourceRef.current = sourceCanvas || null;
      if (!sourceCanvas || !rendererRef.current) return false;
      try {
        return rendererRef.current.render(sourceCanvas);
      } catch (error) {
        console.warn('[Auralith369] GPU Lab render failed', error);
        setRuntimeError(error?.message || 'GPU preview render failed.');
        setActive(false);
        return false;
      }
    },
    clearFeedback() {
      return rendererRef.current?.clearFeedback() || false;
    },
    captureDataURL(type = 'image/png', quality) {
      if (!rendererRef.current || !active) return null;
      try {
        return rendererRef.current.captureDataURL(type, quality);
      } catch (error) {
        console.warn('[Auralith369] GPU Lab capture failed', error);
        setRuntimeError(error?.message || 'GPU preview export failed.');
        return null;
      }
    },
    diagnostics() {
      return rendererRef.current?.getDiagnostics() || {
        backend: capability.supported ? 'three-webgl2-idle' : 'canvas2d-fallback',
        active: false
      };
    },
    status() {
      return status;
    }
  }), [active, capability.supported, status]);

  return (
    <canvas
      ref={canvasRef}
      width={Math.max(1, Math.round(width || 1))}
      height={Math.max(1, Math.round(height || 1))}
      data-testid="gpu-preview-canvas"
      data-gpu-preview={active ? 'active' : 'inactive'}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: enabled && capability.supported ? 'block' : 'none',
        pointerEvents: 'none'
      }}
    />
  );
});

export default GpuLabPreview;
