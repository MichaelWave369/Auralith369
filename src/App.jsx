import React from 'react';
import Auralith369 from './Auralith369';
import ErrorBoundary from './ErrorBoundary';

export default function App() {
  return (
    <div className="auralith-app-shell">
      <div
        style={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 999999,
          pointerEvents: 'none',
          color: '#f7f0ff',
          background: '#120c1fde',
          border: '1px solid #4d3280',
          borderRadius: 8,
          padding: '0.3rem 0.55rem',
          fontSize: 12
        }}
      >
        Auralith369 · v0.1.0-alpha · Online alpha
      </div>
      <ErrorBoundary>
        <Auralith369 />
      </ErrorBoundary>
    </div>
  );
}
