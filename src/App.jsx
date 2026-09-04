import React from 'react';
import { VersionProvider, useVersion } from './contexts/VersionContext.jsx';
import Header from './components/Header.jsx';
import Overview from './components/Overview.jsx';
import ScenarioExplorer from './components/ScenarioExplorer.jsx';
import SensitivityAnalysis from './components/SensitivityAnalysis.jsx';
import RCTEndpoints from './components/RCTEndpoints.jsx';
import KeyFindings from './components/KeyFindings.jsx';
import CostEffectiveness from './components/CostEffectiveness.jsx';
import Methods from './components/Methods.jsx';
import Footer from './components/Footer.jsx';

const Separator = ({ via }) => (
  <div className={`h-px bg-gradient-to-r from-transparent ${via} to-transparent opacity-20`} />
);

function MainContent() {
  const { versionInfo } = useVersion();
  // Some versions omit sections that don't apply to them (e.g. the RCT-endpoints
  // trial-design view, or the cost-effectiveness section).
  const showCea = !versionInfo?.hide_cea;
  const showRct = !versionInfo?.hide_rct;

  return (
    <main className="flex-1">
      <Overview />

      {showRct && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-30" />
          <RCTEndpoints />
        </>
      )}

      <Separator via="via-brand-blue" />

      <ScenarioExplorer />

      <Separator via="via-brand-blue" />

      <SensitivityAnalysis />

      {showCea && (
        <>
          <Separator via="via-brand-teal" />
          <CostEffectiveness />
        </>
      )}

      <Separator via="via-brand-blue" />

      <KeyFindings />

      <Methods />
    </main>
  );
}

export default function App() {
  return (
    <VersionProvider>
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <MainContent />
      <Footer />
    </div>
    </VersionProvider>
  );
}
