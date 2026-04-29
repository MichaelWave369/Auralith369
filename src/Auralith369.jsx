import { useEffect, useMemo, useRef, useState } from 'react';

const blendModes = ['normal', 'multiply', 'screen', 'overlay', 'soft-light'];
const overlays = ['none', 'phi-grid', '369-grid', 'golden-spiral'];

const initialLayers = [
  { id: crypto.randomUUID(), name: 'Base Layer', visible: true, opacity: 100, blendMode: 'normal', mask: false },
  { id: crypto.randomUUID(), name: 'Poster Accents', visible: true, opacity: 85, blendMode: 'overlay', mask: false }
];

export default function Auralith369() {
  const canvasRef = useRef(null);
  const [title, setTitle] = useState('Auralith Project');
  const [layers, setLayers] = useState(initialLayers);
  const [activeLayerId, setActiveLayerId] = useState(initialLayers[0].id);
  const [tool, setTool] = useState('brush');
  const [overlay, setOverlay] = useState('phi-grid');
  const [snap, setSnap] = useState(true);
  const [caption, setCaption] = useState('Local-first visual alchemy');
  const [dominantColor, setDominantColor] = useState('#000000');
  const [snapshotCount, setSnapshotCount] = useState(0);

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
  }, [overlay, caption]);

  function addLayer() {
    const layer = {
      id: crypto.randomUUID(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      mask: false
    };
    setLayers((prev) => [layer, ...prev]);
    setActiveLayerId(layer.id);
  }

  function updateActiveLayer(updates) {
    setLayers((prev) => prev.map((layer) => (layer.id === activeLayerId ? { ...layer, ...updates } : layer)));
  }

  function saveProject() {
    const payload = {
      title,
      version: '0.1.0-alpha',
      extension: '.auralith',
      overlay,
      snap,
      tool,
      layers,
      caption,
      updatedAt: new Date().toISOString()
    };
    downloadFile(`${slugify(title)}.auralith`, JSON.stringify(payload, null, 2), 'application/json');
  }

  function exportReceipt() {
    const receipt = {
      product: 'Auralith369',
      type: 'Auralith Receipt',
      extension: '.auralith-receipt.json',
      snapshots: snapshotCount,
      dominantColor,
      time: new Date().toISOString()
    };
    downloadFile(`${slugify(title)}.auralith-receipt.json`, JSON.stringify(receipt, null, 2), 'application/json');
  }

  function exportManifest() {
    const manifest = [
      '# Auralith Manifest',
      '',
      `Project: ${title}`,
      `Overlay: ${overlay}`,
      `Tool: ${tool}`,
      `Layers: ${layers.length}`,
      `Dominant color: ${dominantColor}`,
      `Generated: ${new Date().toISOString()}`
    ].join('\n');
    downloadFile(`${slugify(title)}.auralith-manifest.md`, manifest, 'text/markdown');
  }

  return (
    <main className="auralith-shell">
      <header>
        <h1>Auralith369</h1>
        <p>Local-first visual alchemy workstation by PHI369 Labs.</p>
      </header>
      <section className="grid">
        <aside className="panel">
          <h2>Editor Core</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Project title" />
          <label>Tool Suite</label>
          <select value={tool} onChange={(e) => setTool(e.target.value)}>
            <option>brush</option><option>move</option><option>crop</option><option>transform</option><option>lasso</option><option>magic-wand</option>
          </select>
          <label>Overlay</label>
          <select value={overlay} onChange={(e) => setOverlay(e.target.value)}>{overlays.map((o) => <option key={o}>{o}</option>)}</select>
          <label>Caption Tools</label>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
          <label><input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} /> Snap System</label>
          <div className="actions">
            <button onClick={saveProject}>Save .auralith</button>
            <button onClick={exportReceipt}>Auralith Receipt</button>
            <button onClick={exportManifest}>Auralith Manifest</button>
            <button onClick={() => setSnapshotCount((n) => n + 1)}>Version Snapshot</button>
          </div>
          <ul>
            <li>Poster Forge</li><li>Style Cards</li><li>Social Pack Export</li><li>Plugins + LUTs + Gradient Maps</li><li>Masks + Blend Modes + Filters</li>
          </ul>
        </aside>
        <section className="canvas-panel">
          <canvas ref={canvasRef} width={900} height={520} />
          <p>Dominant color: <span style={{ color: dominantColor }}>{dominantColor}</span></p>
        </section>
        <aside className="panel">
          <h2>Layers</h2>
          <button onClick={addLayer}>Add Layer</button>
          {layers.map((layer) => (
            <article key={layer.id} className={layer.id === activeLayerId ? 'layer active' : 'layer'} onClick={() => setActiveLayerId(layer.id)}>
              <strong>{layer.name}</strong>
              <small>{layer.visible ? 'Visible' : 'Hidden'} · {layer.blendMode}</small>
            </article>
          ))}
          {activeLayer && (
            <div>
              <label>Blend Mode</label>
              <select value={activeLayer.blendMode} onChange={(e) => updateActiveLayer({ blendMode: e.target.value })}>{blendModes.map((m) => <option key={m}>{m}</option>)}</select>
              <label>Opacity {activeLayer.opacity}%</label>
              <input type="range" min="0" max="100" value={activeLayer.opacity} onChange={(e) => updateActiveLayer({ opacity: Number(e.target.value) })} />
              <label><input type="checkbox" checked={activeLayer.mask} onChange={(e) => updateActiveLayer({ mask: e.target.checked })} /> Layer Mask</label>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function drawOverlay(ctx, width, height, overlay) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  if (overlay === 'phi-grid' || overlay === '369-grid') {
    const step = overlay === 'phi-grid' ? Math.round(width / 8) : Math.round(width / 9);
    for (let x = step; x < width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = step; y < height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
  }
  if (overlay === 'golden-spiral') {
    ctx.beginPath();
    ctx.arc(width * 0.55, height * 0.55, Math.min(width, height) * 0.28, 0, Math.PI * 1.9);
    ctx.stroke();
  }
  ctx.restore();
}

function extractDominantColor(ctx, width, height, setColor) {
  const data = ctx.getImageData(Math.floor(width * 0.45), Math.floor(height * 0.45), 50, 50).data;
  let r = 0, g = 0, b = 0, c = 0;
  for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; c += 1; }
  setColor(`#${[r / c, g / c, b / c].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`);
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
