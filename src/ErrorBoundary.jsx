import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Auralith369] Runtime render error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', background: '#120c1f', color: '#f7f0ff', padding: '1.5rem' }}>
          <section style={{ maxWidth: 960, margin: '0 auto', background: '#1c1230', border: '1px solid #4d3280', borderRadius: 12, padding: '1rem' }}>
            <h1 style={{ marginTop: 0 }}>Auralith369 runtime error</h1>
            <p>v0.1.0-alpha · Local-first visual alchemy</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', background: '#130a24', border: '1px solid #39225f', borderRadius: 8, padding: '0.75rem' }}>
              <code>{String(this.state.error?.message || this.state.error)}</code>
            </pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
