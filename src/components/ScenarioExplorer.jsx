import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import populationScenarios from '../data/population_scenarios.json';
import { formatNumber, efficacyColor, filterPopulationScenarios } from '../utils/dataTransforms.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtComma(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Math.round(n).toLocaleString();
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload, label, showPct }) {
  if (!active || !payload || payload.length === 0) return null;
  const fmt = showPct
    ? (v) => (v === null || v === undefined ? '—' : v.toFixed(1) + '%')
    : fmtComma;
  const fmtUI = showPct
    ? (v) => (v === null || v === undefined ? '—' : v.toFixed(1) + '%')
    : fmtComma;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm font-sans">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => {
        if (entry.value === null || entry.value === undefined) return null;
        const d = entry.payload;
        // dataKey looks like "hiv_80" or "hivpct_80" — extract the eff suffix
        const parts  = entry.dataKey.split('_');
        const eff    = parts[parts.length - 1];
        const prefix = parts.slice(0, -1).join('_');
        const lo  = d[`${prefix}_${eff}_p5`];
        const hi  = d[`${prefix}_${eff}_p95`];
        return (
          <p key={entry.dataKey} style={{ color: entry.fill }} className="text-xs">
            {entry.name}: {fmt(entry.value)}
            {lo !== undefined && hi !== undefined && (
              <span className="text-gray-500"> (95% UI: {fmtUI(lo)}–{fmtUI(hi)})</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary cards
// ---------------------------------------------------------------------------

function SummaryCard({ title, subtitle, hiv, ptb, period }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-1">
        {title}
      </p>
      {subtitle && <p className="text-xs text-gray-400 font-sans mb-3">{subtitle}</p>}
      <p className="text-xs text-gray-500 font-sans mb-2">{period}</p>
      <div className="space-y-1">
        <div>
          <span className="font-serif font-bold text-xl text-brand-blue">
            {fmtComma(hiv)}
          </span>
          <span className="text-xs text-gray-500 font-sans ml-1">HIV infections averted</span>
        </div>
        {ptb !== undefined && (
          <div>
            <span className="font-serif font-bold text-xl text-brand-teal">
              {fmtComma(ptb)}
            </span>
            <span className="text-xs text-gray-500 font-sans ml-1">preterm births averted</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BaselineCard({ baselineHiv, baselinePtb }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
        Baseline (no LBP)
      </p>
      <p className="text-xs text-gray-400 font-sans mb-3">2035–2050 projected total</p>
      <div className="space-y-1">
        <div>
          <span className="font-serif font-bold text-xl text-gray-700">
            {fmtComma(baselineHiv)}
          </span>
          <span className="text-xs text-gray-500 font-sans ml-1">HIV infections</span>
        </div>
        <div>
          <span className="font-serif font-bold text-xl text-gray-700">
            {fmtComma(baselinePtb)}
          </span>
          <span className="text-xs text-gray-500 font-sans ml-1">preterm births</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle button group (multi-select)
// ---------------------------------------------------------------------------

function MultiToggle({ label, options, selected, onChange, colorFn }) {
  function toggle(val) {
    if (selected.includes(val)) {
      if (selected.length === 1) return; // keep at least one selected
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 font-sans mr-1">{label}</span>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        const color = colorFn ? colorFn(opt.value) : '#0E7490';
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            style={
              active
                ? { backgroundColor: color, borderColor: color, color: '#fff' }
                : { borderColor: color, color: color }
            }
            className="px-3 py-1 rounded-full text-sm font-medium font-sans border-2 transition-all duration-150"
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ScenarioExplorer() {
  const [selectedEfficacy, setSelectedEfficacy] = useState([50, 65, 80]);
  const [selectedDuration, setSelectedDuration] = useState([6, 12, 18]);
  const [showPct, setShowPct] = useState(false);

  const baseline = populationScenarios.find((s) => s.is_baseline);
  const baselineHiv = baseline?.baseline_hiv_median;
  const baselinePtb = baseline?.baseline_ptb_median;

  const best = populationScenarios.find(
    (s) => s.efficacy_pct === 80 && s.duration_months === 18
  );
  const reference = populationScenarios.find(
    (s) => s.efficacy_pct === 80 && s.duration_months === 12
  );

  const filteredScenarios = useMemo(
    () =>
      filterPopulationScenarios(populationScenarios, {
        efficacy: selectedEfficacy,
        duration: selectedDuration,
      }),
    [selectedEfficacy, selectedDuration]
  );

  // Build grouped chart data: one row per duration, columns per efficacy
  // Stores both absolute and percent fields so toggling doesn't need a rebuild
  const chartData = useMemo(() => {
    return [6, 12, 18].map((dur) => {
      const row = { duration: `${dur}m` };
      for (const eff of [50, 65, 80]) {
        const s = populationScenarios.find(
          (x) => !x.is_baseline && x.efficacy_pct === eff && x.duration_months === dur
        );
        if (s) {
          row[`hiv_${eff}`]     = s.hiv_averted_median;
          row[`hiv_${eff}_p5`]  = s.hiv_averted_p5;
          row[`hiv_${eff}_p95`] = s.hiv_averted_p95;
          row[`hivpct_${eff}`]     = s.hiv_pct_median;
          row[`hivpct_${eff}_p5`]  = s.hiv_pct_p5;
          row[`hivpct_${eff}_p95`] = s.hiv_pct_p95;
          row[`ptb_${eff}`]     = s.ptb_averted_median;
          row[`ptb_${eff}_p5`]  = s.ptb_averted_p5;
          row[`ptb_${eff}_p95`] = s.ptb_averted_p95;
          row[`ptbpct_${eff}`]     = s.ptb_pct_median;
          row[`ptbpct_${eff}_p5`]  = s.ptb_pct_p5;
          row[`ptbpct_${eff}_p95`] = s.ptb_pct_p95;
        }
      }
      return row;
    });
  }, []);

  // Apply filter: set unselected bars to null so they don't render
  const filteredChartData = useMemo(() => {
    return chartData.map((row) => {
      const newRow = { duration: row.duration };
      const durNum = parseInt(row.duration, 10);
      const durActive = selectedDuration.includes(durNum);
      for (const eff of [50, 65, 80]) {
        const effActive = selectedEfficacy.includes(eff) && durActive;
        // absolute
        newRow[`hiv_${eff}`]     = effActive ? row[`hiv_${eff}`] : null;
        newRow[`hiv_${eff}_p5`]  = row[`hiv_${eff}_p5`];
        newRow[`hiv_${eff}_p95`] = row[`hiv_${eff}_p95`];
        newRow[`ptb_${eff}`]     = effActive ? row[`ptb_${eff}`] : null;
        newRow[`ptb_${eff}_p5`]  = row[`ptb_${eff}_p5`];
        newRow[`ptb_${eff}_p95`] = row[`ptb_${eff}_p95`];
        // percent
        newRow[`hivpct_${eff}`]     = effActive ? row[`hivpct_${eff}`] : null;
        newRow[`hivpct_${eff}_p5`]  = row[`hivpct_${eff}_p5`];
        newRow[`hivpct_${eff}_p95`] = row[`hivpct_${eff}_p95`];
        newRow[`ptbpct_${eff}`]     = effActive ? row[`ptbpct_${eff}`] : null;
        newRow[`ptbpct_${eff}_p5`]  = row[`ptbpct_${eff}_p5`];
        newRow[`ptbpct_${eff}_p95`] = row[`ptbpct_${eff}_p95`];
      }
      return newRow;
    });
  }, [chartData, selectedEfficacy, selectedDuration]);

  // Key prefix changes with mode so tooltip logic resolves correctly
  const hivKey  = showPct ? 'hivpct' : 'hiv';
  const ptbKey  = showPct ? 'ptbpct' : 'ptb';
  const xMaxHiv = showPct ? 15 : 310000;
  const xMaxPtb = showPct ? 15 : 310000;

  return (
    <section id="explorer" className="py-16 bg-brand-grayLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">
            Interactive explorer
          </p>
          <h2 className="section-heading">Scenario explorer</h2>
          <p className="section-subheading max-w-2xl">
            Explore projected population-level outcomes for LBP interventions across efficacy levels
            and protection durations, 2035–2050.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-6">
          <MultiToggle
            label="Efficacy:"
            options={[
              { value: 50, label: '50%' },
              { value: 65, label: '65%' },
              { value: 80, label: '80%' },
            ]}
            selected={selectedEfficacy}
            onChange={setSelectedEfficacy}
            colorFn={efficacyColor}
          />
          <MultiToggle
            label="Duration:"
            options={[
              { value: 6, label: '6m' },
              { value: 12, label: '12m' },
              { value: 18, label: '18m' },
            ]}
            selected={selectedDuration}
            onChange={setSelectedDuration}
            colorFn={() => '#0E7490'}
          />
          {/* Absolute / % toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-gray-600 font-sans">Show:</span>
            <div className="flex rounded-full border border-gray-200 overflow-hidden text-sm font-sans">
              <button
                onClick={() => setShowPct(false)}
                className="px-3 py-1 transition-colors duration-150"
                style={!showPct
                  ? { backgroundColor: '#0E7490', color: '#fff' }
                  : { backgroundColor: '#fff', color: '#6B7280' }}
              >
                Absolute
              </button>
              <button
                onClick={() => setShowPct(true)}
                className="px-3 py-1 transition-colors duration-150"
                style={showPct
                  ? { backgroundColor: '#0E7490', color: '#fff' }
                  : { backgroundColor: '#fff', color: '#6B7280' }}
              >
                % averted
              </button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <BaselineCard baselineHiv={baselineHiv} baselinePtb={baselinePtb} />
          <SummaryCard
            title="Best case"
            subtitle="80% efficacy, 18-month duration"
            hiv={best?.hiv_averted_median}
            ptb={best?.ptb_averted_median}
            period="2035–2050"
          />
          <SummaryCard
            title="Reference scenario"
            subtitle="80% efficacy, 12-month duration"
            hiv={reference?.hiv_averted_median}
            ptb={reference?.ptb_averted_median}
            period="2035–2050"
          />
        </div>

        {/* Charts side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HIV chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
              HIV infections averted (2035–2050)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={filteredChartData}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 24 }}
                barCategoryGap="30%"
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, xMaxHiv]}
                  tickFormatter={showPct ? (v) => `${v}%` : (v) => formatNumber(v, 0)}
                  tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: showPct ? '% of infections averted' : 'Infections averted',
                    position: 'insideBottom',
                    offset: -14,
                    fontSize: 11,
                    fontFamily: 'IBM Plex Sans',
                    fill: '#6B7280',
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="duration"
                  tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip showPct={showPct} />} />
                <Legend
                  verticalAlign="top"
                  height={28}
                  formatter={(value) => (
                    <span style={{ fontSize: 12, fontFamily: 'IBM Plex Sans', color: '#374151' }}>
                      {value}
                    </span>
                  )}
                />
                <Bar dataKey={`${hivKey}_50`} name="50% efficacy" fill={efficacyColor(50)} barSize={12} />
                <Bar dataKey={`${hivKey}_65`} name="65% efficacy" fill={efficacyColor(65)} barSize={12} />
                <Bar dataKey={`${hivKey}_80`} name="80% efficacy" fill={efficacyColor(80)} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PTB chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
              Preterm births averted (2035–2050)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={filteredChartData}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 24 }}
                barCategoryGap="30%"
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, xMaxPtb]}
                  tickFormatter={showPct ? (v) => `${v}%` : (v) => formatNumber(v, 0)}
                  tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: showPct ? '% of births averted' : 'Preterm births averted',
                    position: 'insideBottom',
                    offset: -14,
                    fontSize: 11,
                    fontFamily: 'IBM Plex Sans',
                    fill: '#6B7280',
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="duration"
                  tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip showPct={showPct} />} />
                <Legend
                  verticalAlign="top"
                  height={28}
                  formatter={(value) => (
                    <span style={{ fontSize: 12, fontFamily: 'IBM Plex Sans', color: '#374151' }}>
                      {value}
                    </span>
                  )}
                />
                <Bar dataKey={`${ptbKey}_50`} name="50% efficacy" fill={efficacyColor(50)} barSize={12} />
                <Bar dataKey={`${ptbKey}_65`} name="65% efficacy" fill={efficacyColor(65)} barSize={12} />
                <Bar dataKey={`${ptbKey}_80`} name="80% efficacy" fill={efficacyColor(80)} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
