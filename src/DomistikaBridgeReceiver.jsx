import React, { useEffect, useMemo, useState } from 'react';
import './domistikaBridge.css';

const BRIDGE_KEY = 'parallax-creative-bridge-v1';
const DOMISTIKA_URL = 'https://michaelwave369.github.io/Domistika/';

function readBridge() {
  try {
    const payload = JSON.parse(localStorage.getItem(BRIDGE_KEY));
    if (payload?.protocol !== 'parallax-creative-bridge') return null;
    if (payload?.source !== 'domistika' || payload?.target !== 'auralith369') return null;
    if (!String(payload.image || '').startsWith('data:image/')) return null;
    return payload;
  } catch {
    return null;
  }
}

function downloadArtwork(payload) {
  const anchor = document.createElement('a');
  const safeName = String(payload.name || 'domistika-artwork')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'domistika-artwork';
  anchor.href = payload.image;
  anchor.download = `${safeName}-from-domistika.webp`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export default function DomistikaBridgeReceiver() {
  const [payload, setPayload] = useState(() => readBridge());
  const [open, setOpen] = useState(() => location.hash === '#domistika-import' && Boolean(readBridge()));
  const [referenceVisible, setReferenceVisible] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const palette = useMemo(() => Array.isArray(payload?.palette) ? payload.palette.slice(0, 24) : [], [payload]);

  useEffect(() => {
    const receive = () => {
      const next = readBridge();
      if (!next) return;
      setPayload(next);
      setOpen(true);
      window.dispatchEvent(new CustomEvent('auralith:domistika-bridge', { detail: next }));
    };
    if (location.hash === '#domistika-import') receive();
    const onStorage = (event) => { if (event.key === BRIDGE_KEY) receive(); };
    const onHash = () => { if (location.hash === '#domistika-import') receive(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('hashchange', onHash);
    window.auralithDomistikaBridge = {
      receive,
      clear: () => {
        localStorage.removeItem(BRIDGE_KEY);
        setPayload(null);
        setOpen(false);
        setReferenceVisible(false);
        setBackdropVisible(false);
      },
      get: () => readBridge(),
    };
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hashchange', onHash);
      delete window.auralithDomistikaBridge;
    };
  }, []);

  const clearTransfer = () => {
    localStorage.removeItem(BRIDGE_KEY);
    setPayload(null);
    setOpen(false);
    setReferenceVisible(false);
    setBackdropVisible(false);
    if (location.hash === '#domistika-import') history.replaceState({}, '', `${location.pathname}${location.search}`);
  };

  if (!payload) return null;

  return (
    <>
      {backdropVisible && (
        <div
          className="domistika-bridge-backdrop"
          style={{ backgroundImage: `url(${payload.image})` }}
          aria-hidden="true"
        />
      )}

      {referenceVisible && (
        <aside className="domistika-bridge-reference" aria-label="Domistika artwork reference">
          <div className="domistika-bridge-reference-head">
            <div>
              <strong>Domistika Reference</strong>
              <small>{payload.name || 'Untitled artwork'}</small>
            </div>
            <button type="button" onClick={() => setReferenceVisible(false)} aria-label="Close reference">×</button>
          </div>
          <img src={payload.image} alt={payload.name || 'Artwork transferred from Domistika'} />
          <div className="domistika-bridge-reference-actions">
            <button type="button" onClick={() => setOpen(true)}>Bridge controls</button>
            <button type="button" onClick={() => downloadArtwork(payload)}>Save image</button>
          </div>
        </aside>
      )}

      {open && (
        <div className="domistika-bridge-modal-wrap" role="dialog" aria-modal="true" aria-labelledby="domistikaBridgeTitle">
          <section className="domistika-bridge-modal">
            <header>
              <div className="domistika-bridge-mark">D◇A</div>
              <div>
                <span className="domistika-bridge-kicker">Parallax Creative Bridge v1</span>
                <h2 id="domistikaBridgeTitle">Domistika artwork received</h2>
                <p>Move the Carbon spark into Auralith369 as a visual reference or workspace atmosphere.</p>
              </div>
              <button className="domistika-bridge-close" type="button" onClick={() => setOpen(false)} aria-label="Close bridge">×</button>
            </header>

            <div className="domistika-bridge-body">
              <div className="domistika-bridge-preview">
                <img src={payload.image} alt={payload.name || 'Artwork transferred from Domistika'} />
              </div>
              <div className="domistika-bridge-info">
                <dl>
                  <div><dt>Project</dt><dd>{payload.name || 'Untitled Domistika'}</dd></div>
                  <div><dt>Canvas</dt><dd>{payload.canvas ? `${payload.canvas.width} × ${payload.canvas.height}` : 'Unknown'}</dd></div>
                  <div><dt>Symmetry</dt><dd>{payload.symmetry || 'none'}</dd></div>
                  <div><dt>Transfer</dt><dd>{payload.createdAt ? new Date(payload.createdAt).toLocaleString() : 'Local bridge'}</dd></div>
                </dl>
                {palette.length > 0 && (
                  <div className="domistika-bridge-palette" aria-label="Domistika favorite color palette">
                    {palette.map((color) => <span key={color} title={color} style={{ backgroundColor: color }} />)}
                  </div>
                )}
                <p className="domistika-bridge-note">The image and metadata came through same-origin browser storage. Nothing was uploaded by the bridge.</p>
              </div>
            </div>

            <div className="domistika-bridge-actions">
              <button type="button" className="primary" onClick={() => { setReferenceVisible(true); setOpen(false); }}>Use as floating reference</button>
              <button type="button" onClick={() => { setBackdropVisible((value) => !value); setOpen(false); }}>{backdropVisible ? 'Remove workspace backdrop' : 'Use as workspace backdrop'}</button>
              <button type="button" onClick={() => downloadArtwork(payload)}>Download artwork</button>
              <button type="button" onClick={() => window.open(DOMISTIKA_URL, '_blank', 'noopener,noreferrer')}>Open Domistika</button>
              <button type="button" className="danger" onClick={clearTransfer}>Clear transfer</button>
            </div>
          </section>
        </div>
      )}

      {!open && !referenceVisible && (
        <button className="domistika-bridge-reopen" type="button" onClick={() => setOpen(true)} title="Open Domistika bridge controls">D◇A</button>
      )}
    </>
  );
}
