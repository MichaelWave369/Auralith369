import React, { useEffect, useMemo, useState } from 'react';
import { verifyCreativeBridge } from './parallaxBridgeAdapter.js';
import './domistikaBridge.css';

const BRIDGE_KEYS = ['parallax-creative-bridge-v2', 'parallax-creative-bridge-v1'];
const DOMISTIKA_URL = 'https://michaelwave369.github.io/Domistika/';

function readBridgeCandidate() {
  for (const key of BRIDGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const payload = JSON.parse(raw);
      if (payload?.protocol !== 'parallax-creative-bridge') continue;
      if (payload?.source !== 'domistika' || payload?.target !== 'auralith369') continue;
      if (![1, 2].includes(payload?.version)) continue;
      if (!String(payload.image || '').startsWith('data:image/')) continue;
      return payload;
    } catch {
      // Try the next compatible bridge key.
    }
  }
  return null;
}

function ArtworkStack({ payload, alt }) {
  const overlays = Array.isArray(payload?.overlays) ? payload.overlays.slice(0, 16) : [];
  return (
    <div className="domistika-bridge-art-stack">
      <img className="domistika-bridge-art-base" src={payload.image} alt={alt} />
      {overlays.map((overlay, index) => (
        <img
          key={overlay.id || `overlay-${index}`}
          className="domistika-bridge-art-overlay"
          src={overlay.image}
          alt=""
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function loadBridgeImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function downloadArtwork(payload) {
  const safeName = String(payload.name || 'domistika-artwork')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'domistika-artwork';
  const overlays = Array.isArray(payload.overlays) ? payload.overlays.slice(0, 16) : [];

  if (!overlays.length) {
    const anchor = document.createElement('a');
    anchor.href = payload.image;
    anchor.download = `${safeName}-from-domistika.webp`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return true;
  }

  const base = await loadBridgeImage(payload.image);
  const canvas = document.createElement('canvas');
  canvas.width = base.width;
  canvas.height = base.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('AURALITH_BRIDGE_DOWNLOAD_CONTEXT_UNAVAILABLE');
  ctx.drawImage(base, 0, 0);

  for (const overlay of overlays) {
    const image = await loadBridgeImage(overlay.image);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, Number(overlay.opacity ?? 1)));
    ctx.globalCompositeOperation = String(overlay.blendMode || 'normal');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('AURALITH_BRIDGE_DOWNLOAD_FAILED')), 'image/png');
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName}-from-domistika.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
  return true;
}

export default function DomistikaBridgeReceiver() {
  const [payload, setPayload] = useState(null);
  const [open, setOpen] = useState(false);
  const [referenceVisible, setReferenceVisible] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const palette = useMemo(() => Array.isArray(payload?.palette) ? payload.palette.slice(0, 24) : [], [payload]);

  useEffect(() => {
    const receive = async () => {
      const next = readBridgeCandidate();
      if (!next) return null;
      try {
        await verifyCreativeBridge(next);
        setPayload(next);
        setOpen(true);
        window.dispatchEvent(new CustomEvent('auralith:domistika-bridge', { detail: next }));
        return next;
      } catch (error) {
        setPayload(null);
        setOpen(false);
        setReferenceVisible(false);
        setBackdropVisible(false);
        window.dispatchEvent(new CustomEvent('auralith:domistika-bridge-rejected', {
          detail: { reason: String(error) },
        }));
        console.warn('Auralith rejected Domistika bridge integrity check', error);
        return null;
      }
    };
    if (location.hash === '#domistika-import') void receive();
    const onStorage = (event) => { if (BRIDGE_KEYS.includes(event.key)) void receive(); };
    const onHash = () => { if (location.hash === '#domistika-import') void receive(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('hashchange', onHash);
    window.auralithDomistikaBridge = {
      receive,
      clear: () => {
        BRIDGE_KEYS.forEach((key) => localStorage.removeItem(key));
        setPayload(null);
        setOpen(false);
        setReferenceVisible(false);
        setBackdropVisible(false);
      },
      get: async () => {
        const next = readBridgeCandidate();
        if (!next) return null;
        await verifyCreativeBridge(next);
        return next;
      },
    };
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hashchange', onHash);
      delete window.auralithDomistikaBridge;
    };
  }, []);

  const clearTransfer = () => {
    BRIDGE_KEYS.forEach((key) => localStorage.removeItem(key));
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
          <ArtworkStack payload={payload} alt={payload.name || 'Artwork transferred from Domistika'} />
          <div className="domistika-bridge-reference-actions">
            <button type="button" onClick={() => setOpen(true)}>Bridge controls</button>
            <button type="button" onClick={() => { void downloadArtwork(payload); }}>Save image</button>
          </div>
        </aside>
      )}

      {open && (
        <div className="domistika-bridge-modal-wrap" role="dialog" aria-modal="true" aria-labelledby="domistikaBridgeTitle">
          <section className="domistika-bridge-modal">
            <header>
              <div className="domistika-bridge-mark">D◇A</div>
              <div>
                <span className="domistika-bridge-kicker">Parallax Creative Bridge v{payload.version || 1}</span>
                <h2 id="domistikaBridgeTitle">Domistika artwork received</h2>
                <p>Move the Carbon spark into Auralith369 as a visual reference or workspace atmosphere.</p>
              </div>
              <button className="domistika-bridge-close" type="button" onClick={() => setOpen(false)} aria-label="Close bridge">×</button>
            </header>

            <div className="domistika-bridge-body">
              <div className="domistika-bridge-preview">
                <ArtworkStack payload={payload} alt={payload.name || 'Artwork transferred from Domistika'} />
              </div>
              <div className="domistika-bridge-info">
                <dl>
                  <div><dt>Project</dt><dd>{payload.name || 'Untitled Domistika'}</dd></div>
                  <div><dt>Canvas</dt><dd>{payload.canvas ? `${payload.canvas.width} × ${payload.canvas.height}` : 'Unknown'}</dd></div>
                  <div><dt>Symmetry</dt><dd>{payload.symmetry || 'none'}</dd></div>
                  <div><dt>Transfer</dt><dd>{payload.createdAt ? new Date(payload.createdAt).toLocaleString() : 'Local bridge'}</dd></div>
                  <div><dt>Protected overlays</dt><dd>{Array.isArray(payload.overlays) ? payload.overlays.length : 0}</dd></div>
                </dl>
                {palette.length > 0 && (
                  <div className="domistika-bridge-palette" aria-label="Domistika favorite color palette">
                    {palette.map((color) => <span key={color} title={color} style={{ backgroundColor: color }} />)}
                  </div>
                )}
                <p className="domistika-bridge-note">The image and metadata came through same-origin browser storage and passed a local SHA-256 integrity check. Creative Bridge v2 also verifies protected overlay bytes and manifest metadata. Nothing was uploaded by the bridge.</p>
              </div>
            </div>

            <div className="domistika-bridge-actions">
              <button type="button" className="primary" onClick={() => { setReferenceVisible(true); setOpen(false); }}>Use as floating reference</button>
              <button type="button" onClick={() => { setBackdropVisible((value) => !value); setOpen(false); }}>{backdropVisible ? 'Remove workspace backdrop' : 'Use as workspace backdrop'}</button>
              <button type="button" onClick={() => { void downloadArtwork(payload); }}>Download artwork</button>
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
