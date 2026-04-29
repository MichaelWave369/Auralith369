import React from 'react';
import Auralith369 from './Auralith369';
import ErrorBoundary from './ErrorBoundary';

export default function App() {
  return (
    <div className="auralith-app-shell">
      <ErrorBoundary>
        <Auralith369 />
      </ErrorBoundary>
    </div>
  );
}
