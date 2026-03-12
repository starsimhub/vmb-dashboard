import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import populationScenarios from '../data/population_scenarios.json';
import { formatNumber, efficacyColor, filterPopulationScenarios } from '../utils/dataTransforms.js';
import { efficacyDescriptions, durationDescriptions } from '../utils/paramDescriptions.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtComma(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Math.round(n).toLocaleString();
}

// ---------------------------------------------------------------------------
// Floating label tooltip (fixed position)
// ---------------------------------------------------------------------------

function LabelTooltip({ tooltip }) {
  if (!tooltip) return null;
  return (
    <div
      style={{ position: 'fixed', left: tooltip.x + 14, top: tooltip.y + 14,
        zIndex: 9999, maxWidth: 280, pointerEvents: 'none' }}
      className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-xs font-sans"
    >
      <p className="font-semibold text-gray-700 mb-1">{tooltip.label}</p>
      <p className="text-gray-500 leading-relaxed">{tooltip.desc}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom YAxis tick for duration labels (e.g. "6m", "12m", "18m")
// ---------------------------------------------------------------------------

function DurationTick({ x, y, payload, setLabelTooltip }) {
  const dur  = parseInt(payload?.value);
  const desc = durationDescriptions[dur];
  return (
    <g
      style={{ cursor: 'help' }}
      onMouseEnter={(e) => setLabelTooltip({ label: payload.value, desc, x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setLabelTooltip(null)}
      onMouseMove={(e) => setLabelTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
    >
      <text x={x - 10} y={y} dy={4} textAnchor="end"
        fontSize={12} fontFamily="IBM Plex Sans, sans-serif" fill="#6B7280">
        {payload.value}
      </text>
      <text x={x - 2} y={y} dy={4} textAnchor="end"
        fontSize={9} fontFamily="IBM Plex Sans, sans-serif" fill="#4B5563">
        ⓘ
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Custom legend with hover descriptions for efficacy
// ---------------------------------------------------------------------------

function EfficacyLegend({ payload, setLabelTooltip }) {
  if (!payload || payload.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-4 pb-2 text-xs font-sans">
      {payload.map((entry) => {
        const effMatch = entry.value.match(/^(\d+)%/);
        const effNum   = effMatch ? parseInt(effMatch[1]) : null;
        const desc     = effNum ? efficacyDescriptions[effNum] : null;
        return (
          <div
            key={entry.value}
            className="flex items-center gap-1.5"
            style={{ cursor: desc ? 'help' : 'default' }}
            onMouseEnter={(e) => desc && setLabelTooltip({ label: entry.value, desc, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setLabelTooltip(null)}
            onMouseMove={(e) => setLabelTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
          >
            <div style={{ width: 12, height: 12, backgroundColor: entry.color, borderRadius: 2 }} />
            <span style={{ color: '#374151' }}>{entry.value}</span>
            {desc && <span style={{ fontSize: 9, color: '#4B5563', lineHeight: 1 }}>ⓘ</span>}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom bar tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload, label, showPct }) {
  if (!active || !payload || payload.length === 0) return null;
  const fmt   = showPct ? (v) => (v === null || v === undefined ? '—' : v.toFixed(1) + '%') : fmtComma;
  const fmtUI = showPct ? (v) => (v === null || v === undefined ? '—' : v.toFixed(1) + '%') : fmtComma;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm font-sans">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => {
        if (entry.value === null || entry.value === undefined) return null;
        const d      = entry.payload;
        const parts  = entry.dataKey.split('_');
        const eff    = parts[parts.length - 1];
        const prefix = parts.slice(0, -1).join('_');
        const lo     = d[`${prefix}_${eff}_p5`];
        const hi     = d[`${prefix}_${eff}_p95`];
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
      if (selected.length === 1) return;
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
        const color  = colorFn ? colorFn(opt.value) : '#0E7490';
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
  const [labelTooltip, setLabelTooltip] = useState(null);

  const baseline    = populationScenarios.find((s) => s.is_baseline);
  const baselineHiv = baseline?.baseline_hiv_median;
  const baselinePtb = baseline?.baseline_ptb_median;

  const best = populationScenarios.find(
    (s) => s.efficacy_pct === 80 && s.duration_months === 18
  );
  const reference = populationScenarios.find(
    (s) => s.efficacy_pct === 80 && s.duration_months === 12
  );

  const filteredScenarios = useMemo(
    () => filterPopulationScenarios(populationScenarios, {
      efficacy: selectedEfficacy,
      duration: selectedDuration,
    }),
    [selectedEfficacy, selectedDuration]
  );

  const chartData = useMemo(() => {
    return [6, 12, 18].map((dur) => {
      const row = { duration: `${dur}m` };
      for (const eff of [50, 65, 80]) {
        const s = populationScenarios.find(
          (x) => !x.is_baseline && x.efficacy_pct === eff && x.duration_months === dur
        );
        if (s) {
          row[`hiv_${eff}`]        = s.hiv_averted_median;
          row[`hiv_${eff}_p5`]     = s.hiv_averted_p5;
          row[`hiv_${eff}_p95`]    = s.hiv_averted_p95;
          row[`hivpct_${eff}`]     = s.hiv_pct_median;
          row[`hivpct_${eff}_p5`]  = s.hiv_pct_p5;
          row[`hivpct_${eff}_p95`] = s.hiv_pct_p95;
          row[`ptb_${eff}`]        = s.ptb_averted_median;
          row[`ptb_${eff}_p5`]     = s.ptb_averted_p5;
          row[`ptb_${eff}_p95`]    = s.ptb_averted_p95;
          row[`ptbpct_${eff}`]     = s.ptb_pct_median;
          row[`ptbpct_${eff}_p5`]  = s.ptb_pct_p5;
          row[`ptbpct_${eff}_p95`] = s.ptb_pct_p95;
        }
      }
      return row;
    });
  }, []);

  const filteredChartData = useMemo(() => {
    return chartData.map((row) => {
      const newRow  = { duration: row.duration };
      const durNum  = parseInt(row.duration, 10);
      const durActive = selectedDuration.includes(durNum);
      for (const eff of [50, 65, 80]) {
        const effActive = selectedEfficacy.includes(eff) && durActive;
        newRow[`hiv_${eff}`]        = effActive ? row[`hiv_${eff}`] : null;
        newRow[`hiv_${eff}_p5`]     = row[`hiv_${eff}_p5`];
        newRow[`hiv_${eff}_p95`]    = row[`hiv_${eff}_p95`];
        newRow[`ptb_${eff}`]        = effActive ? row[`ptb_${eff}`] : null;
        newRow[`ptb_${eff}_p5`]     = row[`ptb_${eff}_p5`];
        newRow[`ptb_${eff}_p95`]    = row[`ptb_${eff}_p95`];
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

  const hivKey  = showPct ? 'hivpct' : 'hiv';
  const ptbKey  = showPct ? 'ptbpct' : 'ptb';
  const xMaxHiv = showPct ? 15 : 310000;
  const xMaxPtb = showPct ? 15 : 310000;

  // Shared legend content for both charts
  const legendContent = ({ payload }) => (
    <EfficacyLegend payload={payload} setLabelTooltip={setLabelTooltip} />
  );

  // Shared duration tick for both charts
  const durationTick = <DurationTick setLabelTooltip={setLabelTooltip} />;

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
            and protection durations, 2035–2050. Hover over axis labels and legend items for
            parameter definitions.
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
              { value: 6,  label: '6m' },
              { value: 12, label: '12m' },
              { value: 18, label: '18m' },
            ]}
            selected={selectedDuration}
            onChange={setSelectedDuration}
            colorFn={() => '#0E7490'}
          />
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
                  tick={durationTick}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip showPct={showPct} />} />
                <Bar dataKey={`${hivKey}_50`} name="50% efficacy" fill={efficacyColor(50)} barSize={12} />
                <Bar dataKey={`${hivKey}_65`} name="65% efficacy" fill={efficacyColor(65)} barSize={12} />
                <Bar dataKey={`${hivKey}_80`} name="80% efficacy" fill={efficacyColor(80)} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
            <EfficacyLegend
              payload={[
                { value: '50% efficacy', color: efficacyColor(50) },
                { value: '65% efficacy', color: efficacyColor(65) },
                { value: '80% efficacy', color: efficacyColor(80) },
              ]}
              setLabelTooltip={setLabelTooltip}
            />
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
                  tick={durationTick}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip showPct={showPct} />} />
                <Bar dataKey={`${ptbKey}_50`} name="50% efficacy" fill={efficacyColor(50)} barSize={12} />
                <Bar dataKey={`${ptbKey}_65`} name="65% efficacy" fill={efficacyColor(65)} barSize={12} />
                <Bar dataKey={`${ptbKey}_80`} name="80% efficacy" fill={efficacyColor(80)} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
            <EfficacyLegend
              payload={[
                { value: '50% efficacy', color: efficacyColor(50) },
                { value: '65% efficacy', color: efficacyColor(65) },
                { value: '80% efficacy', color: efficacyColor(80) },
              ]}
              setLabelTooltip={setLabelTooltip}
            />
          </div>
        </div>
      </div>
      <LabelTooltip tooltip={labelTooltip} />
    </section>
  );
}
