import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import sensitivityScenarios from '../data/sensitivity_scenarios.json';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shortenLabel(label) {
  const map = {
    'Reference (80%, 12m)': 'Reference',
    'High Stability (stability=1.0)': 'Low LBP fitness',
    'Later Introduction (2040)': 'Later intro (2040)',
    'Asymptomatic Screening (Prenatal)': 'Asymptomatic prenatal screening',
    'Intermediate LBP (Prenatal + Intermediate)': 'Asymptomatic prenatal screening + LBP for Nugent 4–6',
    'CST4 Responder Rate 100%': 'LBP effective in MTZ non-responders',
    'Non-BV VDS = 10%': '−10% non-BV vaginal symptoms',
    'Non-BV VDS = 30%': '+10% non-BV vaginal symptoms',
  };
  return map[label] || label;
}

// ---------------------------------------------------------------------------
// Descriptions shown on row label hover
// ---------------------------------------------------------------------------

const descriptions = {
  'Low LBP fitness': 'Reduced competitive fitness of the LBP strain against BV-associated bacteria, leading to less durable colonization and higher probability of reversion to BV.',
  'Later intro (2040)': 'Delays product availability by 5 years, reducing the cumulative intervention window within the modeled time horizon.',
  'Asymptomatic prenatal screening': 'Women are screened for BV at prenatal visits regardless of symptoms, creating an additional care-seeking pathway beyond symptom-driven presentation.',
  'Asymptomatic prenatal screening + LBP for Nugent 4–6': 'Extends prenatal BV screening and LBP treatment eligibility to women with intermediate Nugent scores (4–6), not just those meeting the full BV diagnosis threshold (Nugent 7+).',
  'LBP effective in MTZ non-responders': 'Allows LBP to colonize and establish CST I even in women who fail to clear BV with metronidazole, decoupling LBP efficacy from antibiotic response.',
  '−10% non-BV vaginal symptoms': 'Varies the rate at which women present with vaginal symptoms unrelated to BV (e.g., yeast infections, irritation), which affects how often BV is incidentally detected and treated through symptom-driven care-seeking.',
  '+10% non-BV vaginal symptoms': 'Varies the rate at which women present with vaginal symptoms unrelated to BV (e.g., yeast infections, irritation), which affects how often BV is incidentally detected and treated through symptom-driven care-seeking.',
};

// ---------------------------------------------------------------------------
// Prepare data — exclude reference row
// ---------------------------------------------------------------------------

const hivBase = sensitivityScenarios
  .filter((s) => s.id !== 'reference')
  .map((s) => ({
    label:       shortenLabel(s.label),
    delta:       s.hiv_delta_median,
    delta_p5:    s.hiv_delta_p5,
    delta_p95:   s.hiv_delta_p95,
    pct_change:  s.hiv_pct_change,
  }));

const ptbBase = sensitivityScenarios
  .filter((s) => s.id !== 'reference')
  .map((s) => ({
    label:       shortenLabel(s.label),
    delta:       s.ptb_delta_median,
    delta_p5:    s.ptb_delta_p5,
    delta_p95:   s.ptb_delta_p95,
    pct_change:  s.ptb_pct_change,
  }));

// ---------------------------------------------------------------------------
// Custom Y-axis tick with hover tooltip
// ---------------------------------------------------------------------------

function CustomYAxisTick({ x, y, payload, setLabelTooltip }) {
  const label = payload?.value;
  const hasDesc = Boolean(descriptions[label]);
  return (
    <g
      style={{ cursor: hasDesc ? 'help' : 'default' }}
      onMouseEnter={(e) => {
        if (hasDesc) {
          setLabelTooltip({ label, x: e.clientX, y: e.clientY });
        }
      }}
      onMouseLeave={() => setLabelTooltip(null)}
      onMouseMove={(e) => {
        if (hasDesc) {
          setLabelTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
        }
      }}
    >
      <text
        x={x - (hasDesc ? 14 : 4)}
        y={y}
        dy={4}
        textAnchor="end"
        fontSize={10}
        fontFamily="IBM Plex Sans, sans-serif"
        fill={hasDesc ? '#0E7490' : '#6B7280'}
      >
        {label}
      </text>
      {hasDesc && (
        <text
          x={x - 4}
          y={y}
          dy={4}
          textAnchor="end"
          fontSize={9}
          fontFamily="IBM Plex Sans, sans-serif"
          fill="#4B5563"
        >
          ⓘ
        </text>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Floating label tooltip (portal-style, fixed position)
// ---------------------------------------------------------------------------

function LabelTooltip({ tooltip }) {
  if (!tooltip) return null;
  const OFFSET = 14;
  return (
    <div
      style={{
        position: 'fixed',
        left: tooltip.x + OFFSET,
        top: tooltip.y + OFFSET,
        zIndex: 9999,
        maxWidth: 280,
        pointerEvents: 'none',
      }}
      className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-xs font-sans"
    >
      <p className="font-semibold text-gray-700 mb-1">{tooltip.label}</p>
      <p className="text-gray-500 leading-relaxed">{descriptions[tooltip.label]}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom bar tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload, showPct }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const value   = showPct ? d.pct_change : d.delta;
  const isPos   = value >= 0;
  const fmtVal  = showPct
    ? `${isPos ? '+' : ''}${value?.toFixed(1)}%`
    : `${isPos ? '+' : '−'}${Math.abs(Math.round(value)).toLocaleString()}`;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm font-sans">
      <p className="font-semibold text-gray-700 mb-1">{d.label}</p>
      <p className="text-xs text-gray-600">
        Delta vs reference:{' '}
        <span className="font-semibold" style={{ color: isPos ? '#16a34a' : '#dc2626' }}>
          {fmtVal}
        </span>
      </p>
      {!showPct && (
        <p className="text-xs text-gray-500">
          95% UI: {Math.round(d.delta_p5).toLocaleString()} to {Math.round(d.delta_p95).toLocaleString()}
        </p>
      )}
      {showPct && (
        <p className="text-xs text-gray-500">
          Absolute delta: {d.delta >= 0 ? '+' : '−'}{Math.abs(Math.round(d.delta)).toLocaleString()}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tornado panel
// ---------------------------------------------------------------------------

function TornadoPanel({ title, data, showPct }) {
  const [labelTooltip, setLabelTooltip] = useState(null);

  const values  = data.map((d) => showPct ? d.pct_change : d.delta);
  const absMax  = Math.max(...values.map(Math.abs)) * 1.15 || 1;
  const step    = showPct ? 5 : 10000;
  const domainMin = -Math.ceil(absMax / step) * step;
  const domainMax =  Math.ceil(absMax / step) * step;

  const sortedData = [...data].sort((a, b) => {
    const va = showPct ? a.pct_change : a.delta;
    const vb = showPct ? b.pct_change : b.delta;
    return va - vb;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-serif font-semibold text-brand-blue text-base mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 148, bottom: 28 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            domain={[domainMin, domainMax]}
            tickFormatter={(v) => {
              if (showPct) return `${v > 0 ? '+' : ''}${v.toFixed(0)}%`;
              const abs = Math.abs(v);
              if (abs >= 1000) return (v / 1000).toFixed(0) + 'k';
              return v.toLocaleString();
            }}
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            label={{
              value: showPct ? 'Change vs reference (%)' : 'Delta vs reference (count)',
              position: 'insideBottom',
              offset: -16,
              fontSize: 11,
              fontFamily: 'IBM Plex Sans',
              fill: '#6B7280',
            }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={<CustomYAxisTick setLabelTooltip={setLabelTooltip} />}
            axisLine={false}
            tickLine={false}
            width={142}
          />
          <Tooltip content={<CustomTooltip showPct={showPct} />} />
          <ReferenceLine x={0} stroke="#9CA3AF" strokeWidth={1.5} />
          <Bar dataKey={showPct ? 'pct_change' : 'delta'} barSize={16}>
            {sortedData.map((entry, index) => {
              const v = showPct ? entry.pct_change : entry.delta;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={v >= 0 ? '#16a34a' : '#dc2626'}
                  opacity={0.85}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs font-sans">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a', opacity: 0.85 }} />
          <span className="text-gray-500">More impact than reference</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#dc2626', opacity: 0.85 }} />
          <span className="text-gray-500">Less impact than reference</span>
        </div>
      </div>
      <LabelTooltip tooltip={labelTooltip} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SensitivityAnalysis() {
  const [showPct, setShowPct] = useState(false);

  return (
    <section id="sensitivity" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">
            Sensitivity analysis
          </p>
          <h2 className="section-heading">Parameter sensitivity</h2>
          <p className="section-subheading max-w-2xl">
            Change in averted outcomes vs the reference scenario (80% efficacy, 12-month
            duration) for each sensitivity assumption. Positive values indicate more benefit
            than the reference. Hover over a row label for details.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-gray-600 font-sans">Show:</span>
          <div className="flex rounded-full border border-gray-200 overflow-hidden text-sm font-sans">
            <button
              onClick={() => setShowPct(false)}
              className="px-3 py-1 transition-colors duration-150"
              style={!showPct
                ? { backgroundColor: '#0E7490', color: '#fff' }
                : { backgroundColor: '#fff', color: '#6B7280' }}
            >
              Absolute delta
            </button>
            <button
              onClick={() => setShowPct(true)}
              className="px-3 py-1 transition-colors duration-150"
              style={showPct
                ? { backgroundColor: '#0E7490', color: '#fff' }
                : { backgroundColor: '#fff', color: '#6B7280' }}
            >
              % change
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TornadoPanel
            title="HIV infections averted — delta vs reference"
            data={hivBase}
            showPct={showPct}
          />
          <TornadoPanel
            title="Preterm births averted — delta vs reference"
            data={ptbBase}
            showPct={showPct}
          />
        </div>
      </div>
    </section>
  );
}
