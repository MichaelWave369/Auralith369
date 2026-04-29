import './styles.css';

const root = document.getElementById('root');

function setBootMessage(message) {
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;background:#120c1f;color:#f7f0ff;padding:1rem;font-family:Inter,system-ui,sans-serif;">
      <div style="display:inline-flex;gap:.75rem;align-items:center;padding:.9rem 1rem;border:1px solid #4d3280;background:#1c1230;border-radius:10px;max-width:100%;">
        <strong>Auralith369 failed to boot</strong>
        <span>${message}</span>
      </div>
      <div style="margin-top:.6rem;color:#d6c6f5;">Open browser console for full stack trace.</div>
    </div>
  `;
}

window.addEventListener('error', (event) => {
  console.error('[Auralith369] Boot window error', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Auralith369] Boot unhandled rejection', event.reason);
});

async function boot() {
  if (!root) return;

  try {
    const React = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { default: App } = await import('./App.jsx');

    createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('[Auralith369] Failed to boot app', error);
    setBootMessage(String(error?.message || error));
  }
}

boot();
