import React from 'react';
import Auralith369 from './Auralith369';
import DomistikaBridgeReceiver from './DomistikaBridgeReceiver';
import ErrorBoundary from './ErrorBoundary';
import { installAuralithRuntimeGlobals } from './lib/auralithRuntime.js';
import { installAuralithStableSdk } from './lib/auralithStableSdk.js';
import { installAuralithSiteToolsGlobal } from './lib/auralithSiteTools.js';

installAuralithRuntimeGlobals();
installAuralithStableSdk();
installAuralithSiteToolsGlobal();

export default function App() {
  return (
    <div className="auralith-app-shell">
      <DomistikaBridgeReceiver />
      <ErrorBoundary>
        <Auralith369 />
      </ErrorBoundary>
    </div>
  );
}
