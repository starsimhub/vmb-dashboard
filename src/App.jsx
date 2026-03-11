import React from 'react';
import Header from './components/Header.jsx';
import Overview from './components/Overview.jsx';
import ScenarioExplorer from './components/ScenarioExplorer.jsx';
import SensitivityAnalysis from './components/SensitivityAnalysis.jsx';
import RCTEndpoints from './components/RCTEndpoints.jsx';
import KeyFindings from './components/KeyFindings.jsx';
import CostEffectiveness from './components/CostEffectiveness.jsx';
import Methods from './components/Methods.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        <Overview />

        {/* Visual separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-30" />

        <RCTEndpoints />

        <div className="h-px bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-20" />

        <ScenarioExplorer />

        <div className="h-px bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-20" />

        <SensitivityAnalysis />

        <div className="h-px bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-20" />

        <CostEffectiveness />

        <div className="h-px bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-20" />

        <KeyFindings />

        <Methods />
      </main>
      <Footer />
    </div>
  );
}
