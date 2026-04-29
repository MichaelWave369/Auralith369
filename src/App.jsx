import Auralith369 from './Auralith369';
import ErrorBoundary from './ErrorBoundary';

export default function App() {
  return (
    <>
      <div style={{ padding: '0.75rem 1rem 0', color: '#f7f0ff', background: '#120c1f' }}>
        <strong>Auralith369</strong> · <span>v0.1.0-alpha</span> · <span>Local-first visual alchemy</span>
      </div>
      <ErrorBoundary>
        <Auralith369 />
      </ErrorBoundary>
    </>
  );
}
