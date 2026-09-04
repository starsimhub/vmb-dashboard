import React, { createContext, useContext, useState, useMemo } from 'react';
import versions from '../data/versions.json';

// ---------------------------------------------------------------------------
// Eagerly load all versioned JSON files via Vite glob imports
// ---------------------------------------------------------------------------

const populationFiles  = import.meta.glob('../data/*/population_scenarios.json',  { eager: true });
const rctEndpointFiles = import.meta.glob('../data/*/rct_endpoints.json',         { eager: true });
const sensitivityFiles = import.meta.glob('../data/*/sensitivity_scenarios.json',  { eager: true });
const ceFiles          = import.meta.glob('../data/*/ce_results.json',            { eager: true });

function resolve(globMap, versionId) {
  const key = Object.keys(globMap).find((k) => k.includes(`/${versionId}/`));
  return key ? globMap[key].default : null;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const VersionContext = createContext(null);

export function VersionProvider({ children }) {
  const defaultVersion = versions.find((v) => v.default) || versions[0];
  const [versionId, setVersionId] = useState(defaultVersion.id);
  // Central estimate (median | mean) shared across the Scenario Explorer and CEA.
  const [centralStat, setCentralStat] = useState('median');

  const value = useMemo(() => {
    const versionInfo = versions.find((v) => v.id === versionId) || defaultVersion;
    return {
      versions,
      versionId,
      versionInfo,
      setVersionId,
      centralStat,
      setCentralStat,
      populationScenarios:  resolve(populationFiles, versionId)  || [],
      rctEndpoints:         resolve(rctEndpointFiles, versionId) || [],
      sensitivityScenarios: resolve(sensitivityFiles, versionId) || [],
      ceData:               resolve(ceFiles, versionId)          || { assumptions: {}, scenarios: [] },
    };
  }, [versionId, centralStat]);

  return (
    <VersionContext.Provider value={value}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion() {
  const ctx = useContext(VersionContext);
  if (!ctx) throw new Error('useVersion must be used within a VersionProvider');
  return ctx;
}
