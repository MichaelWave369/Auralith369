import { useEffect, useMemo, useRef, useState } from 'react';
import { validateAuralithProject } from './lib/auralithProjectSchema';

const blendModes = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'];
const overlays = ['none', 'phi-grid', '369-grid', 'golden-spiral'];

const initialLayers = [
  { id: crypto.randomUUID(), name: 'Base Layer', visible: true, opacity: 1, blendMode: 'normal', mask: false },
  { id: crypto.randomUUID(), name: 'Poster Accents', visible: true, opacity: 0.85, blendMode: 'overlay', mask: false }
];

export default function Auralith369() {
  const canvasRef = useRef(null);
  const importRef = useRef(null);
  const [title, setTitle] = useState('Auralith Project');
  const [layers, setLayers] = useState(initialLayers);
  const [activeLayerId, setActiveLayerId] = useState(initialLayers[0].id);
  const [tool, setTool] = useState('brush');
  const [overlay, setOverlay] = useState('phi-grid');
  const [snap, setSnap] = useState(true);
  const [caption, setCaption] = useState('Local-first visual alchemy');
  const [dominantColor, setDominantColor] = useState('#000000');
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 520 });
  const [statusMessage, setStatusMessage] = useState('Ready.');

  const activeLayer = useMemo(() => layers.find((layer) => layer.id === activeLayerId), [layers, activeLayerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#191224');
    gradient.addColorStop(1, '#3a1f5a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f8f0ff';
    ctx.font = '700 34px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.fillText('Auralith369 v0.1.0-alpha', 24, 56);
    ctx.font = '500 16px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(caption, 24, 86);

    drawOverlay(ctx, canvas.width, canvas.height, overlay);
    extractDominantColor(ctx, canvas.width, canvas.height, setDominantColor);
  }, [overlay, caption, canvasSize]);

  function addLayer() {
    const layer = { id: crypto.randomUUID(), name: `Layer ${layers.length + 1}`, visible: true, opacity: 1, blendMode: 'normal', mask: false };
    setLayers((prev) => [layer, ...prev]);
    setActiveLayerId(layer.id);
  }

  function updateActiveLayer(updates) {
    setLayers((prev) => prev.map((layer) => (layer.id === activeLayerId ? { ...layer, ...updates } : layer)));
  }

  function saveProject() {
    const payload = { title, version: '0.1.0-alpha', extension: '.auralith', canvas: canvasSize, overlay, snap, tool, layers, caption, updatedAt: new Date().toISOString() };
    downloadFile(`${slugify(title)}.auralith`, JSON.stringify(payload, null, 2), 'application/json');
    setStatusMessage('Saved .auralith project.');
  }

  async function handleImportProject(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = validateAuralithProject(parsed);

      if (!result.ok || !result.project) {
        const reason = result.errors.join(' | ') || 'Invalid Auralith project file.';
        setStatusMessage(`Import failed: ${reason}`);
        console.warn('[Auralith369] Project import rejected', { file: file.name, errors: result.errors, warnings: result.warnings });
        return;
      }

      const next = result.project;
      setTitle(next.title);
      setOverlay(next.overlay);
      setSnap(next.snap);
      setTool(next.tool);
      setCaption(next.caption);
      setLayers(next.layers);
      setActiveLayerId(next.layers[0]?.id ?? '');
      setCanvasSize(next.canvas);
      setStatusMessage(`Loaded ${file.name} successfully.`);
      if (result.warnings.length) {
        console.warn('[Auralith369] Project import warnings', { file: file.name, warnings: result.warnings });
      }
    } catch (error) {
      setStatusMessage('Import failed: file is not valid JSON.');
      console.warn('[Auralith369] Project import parse failure', { file: file.name, error });
    } finally {
      event.target.value = '';
    }
  }

  function exportReceipt() {
    const receipt = { product: 'Auralith369', type: 'Auralith Receipt', extension: '.auralith-receipt.json', snapshots: snapshotCount, dominantColor, time: new Date().toISOString() };
    downloadFile(`${slugify(title)}.auralith-receipt.json`, JSON.stringify(receipt, null, 2), 'application/json');
  }

  function exportManifest() {
    const manifest = ['# Auralith Manifest', '', `Project: ${title}`, `Overlay: ${overlay}`, `Tool: ${tool}`, `Layers: ${layers.length}`, `Dominant color: ${dominantColor}`, `Generated: ${new Date().toISOString()}`].join('\n');
    downloadFile(`${slugify(title)}.auralith-manifest.md`, manifest, 'text/markdown');
  }

  return (
    <main className="auralith-shell">
      <header><h1>Auralith369</h1><p>Local-first visual alchemy workstation by PHI369 Labs.</p></header>
      <section className="grid">
        <aside className="panel">
          <h2>Editor Core</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Project title" />
          <label>Tool Suite</label>
          <select value={tool} onChange={(e) => setTool(e.target.value)}><option>brush</option><option>move</option><option>crop</option><option>transform</option><option>lasso</option><option>magic-wand</option></select>
          <label>Overlay</label>
          <select value={overlay} onChange={(e) => setOverlay(e.target.value)}>{overlays.map((o) => <option key={o}>{o}</option>)}</select>
          <label>Caption Tools</label><input value={caption} onChange={(e) => setCaption(e.target.value)} />
          <label><input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} /> Snap System</label>
          <div className="actions">
            <button onClick={saveProject}>Save .auralith</button>
            <button onClick={() => importRef.current?.click()}>Load .auralith</button>
            <input ref={importRef} type="file" accept=".auralith,application/json" onChange={handleImportProject} hidden />
            <button onClick={exportReceipt}>Auralith Receipt</button>
            <button onClick={exportManifest}>Auralith Manifest</button>
            <button onClick={() => setSnapshotCount((n) => n + 1)}>Version Snapshot</button>
          </div>
          <p>{statusMessage}</p>
        </aside>
        <section className="canvas-panel">
          <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} />
          <p>Dominant color: <span style={{ color: dominantColor }}>{dominantColor}</span></p>
        </section>
        <aside className="panel">
          <h2>Layers</h2><button onClick={addLayer}>Add Layer</button>
          {layers.map((layer) => <article key={layer.id} className={layer.id === activeLayerId ? 'layer active' : 'layer'} onClick={() => setActiveLayerId(layer.id)}><strong>{layer.name}</strong><small>{layer.visible ? 'Visible' : 'Hidden'} · {layer.blendMode}</small></article>)}
          {activeLayer && <div><label>Blend Mode</label><select value={activeLayer.blendMode} onChange={(e) => updateActiveLayer({ blendMode: e.target.value })}>{blendModes.map((m) => <option key={m}>{m}</option>)}</select><label>Opacity {Math.round(activeLayer.opacity * 100)}%</label><input type="range" min="0" max="100" value={Math.round(activeLayer.opacity * 100)} onChange={(e) => updateActiveLayer({ opacity: Number(e.target.value) / 100 })} /><label><input type="checkbox" checked={activeLayer.mask} onChange={(e) => updateActiveLayer({ mask: e.target.checked })} /> Layer Mask</label></div>}
        </aside>
      </section>
    </main>
  );
}

function drawOverlay(ctx, width, height, overlay) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; if (overlay === 'phi-grid' || overlay === '369-grid') { const step = overlay === 'phi-grid' ? Math.round(width / 8) : Math.round(width / 9); for (let x = step; x < width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); } for (let y = step; y < height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); } } if (overlay === 'golden-spiral') { ctx.beginPath(); ctx.arc(width * 0.55, height * 0.55, Math.min(width, height) * 0.28, 0, Math.PI * 1.9); ctx.stroke(); } ctx.restore(); }
function extractDominantColor(ctx, width, height, setColor) { const data = ctx.getImageData(Math.floor(width * 0.45), Math.floor(height * 0.45), 50, 50).data; let r = 0, g = 0, b = 0, c = 0; for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; c += 1; } setColor(`#${[r / c, g / c, b / c].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`); }
function downloadFile(filename, content, type) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }
function slugify(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
