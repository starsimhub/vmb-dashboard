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
import rctEndpoints from '../data/rct_endpoints.json';
import populationScenarios from '../data/population_scenarios.json';
import { efficacyColor } from '../utils/dataTransforms.js';
import { efficacyDescriptions, durationDescriptions } from '../utils/paramDescriptions.js';

// ---------------------------------------------------------------------------
// Population impact lookup: keyed by "dur-eff"
// ---------------------------------------------------------------------------

const popLookup = {};
for (const s of populationScenarios) {
  if (!s.is_baseline) {
    popLookup[`${s.duration_months}-${s.efficacy_pct}`] = {
      hivPct: s.hiv_pct_median,
      ptbPct: s.ptb_pct_median,
    };
  }
}

// ---------------------------------------------------------------------------
// Build chart data: header rows + data rows grouped by duration (18 → 12 → 6)
// ---------------------------------------------------------------------------

const durations = [18, 12, 6];

const chartData = [];
for (const dur of durations) {
  chartData.push({ name: `${dur}m`, isHeader: true, nugent: null, cst1: null });
  const rows = rctEndpoints
    .filter((d) => d.duration_months === dur)
    .sort((a, b) => b.efficacy_pct - a.efficacy_pct);
  for (const d of rows) {
    const pop = popLookup[`${d.duration_months}-${d.efficacy_pct}`] || {};
    chartData.push({
      name:       `${dur}m / ${d.efficacy_pct}%`,
      label:      `${d.efficacy_pct}% efficacy`,
      isHeader:   false,
      duration:   d.duration_months,
      efficacy:   d.efficacy_pct,
      nugent:     d.nugent_normal_6m_median,
      nugent_p5:  d.nugent_normal_6m_p5,
      nugent_p95: d.nugent_normal_6m_p95,
      cst1:       d.cst1_6m_median,
      cst1_p5:    d.cst1_6m_p5,
      cst1_p95:   d.cst1_6m_p95,
      hivPct:     pop.hivPct,
      ptbPct:     pop.ptbPct,
    });
  }
}

// ---------------------------------------------------------------------------
// Custom YAxis tick
// Shows: duration headers (bold blue) + efficacy rows (gray) with hover desc
// Shows: small colored dot on efficacy rows indicating HIV impact threshold
// ---------------------------------------------------------------------------

function CustomYAxisTick({ x, y, payload, setLabelTooltip, hivThreshold }) {
  const entry = chartData.find((d) => d.name === payload.value);
  if (!entry) return null;

  const handlers = (desc, label) => ({
    style: { cursor: 'help' },
    onMouseEnter: (e) => setLabelTooltip({ label, desc, x: e.clientX, y: e.clientY }),
    onMouseLeave: () => setLabelTooltip(null),
    onMouseMove:  (e) => setLabelTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null),
  });

  if (entry.isHeader) {
    const dur  = parseInt(entry.name);
    const desc = durationDescriptions[dur];
    return (
      <g {...handlers(desc, entry.name)}>
        <text x={x} y={y} dy={4} textAnchor="end"
          fontSize={11} fontFamily="IBM Plex Serif, serif" fontWeight={700} fill="#1e3a5f">
          {entry.name}
        </text>
        <text x={x + 12} y={y} dy={4} textAnchor="start"
          fontSize={9} fontFamily="IBM Plex Sans, sans-serif" fill="#4B5563">
          ⓘ
        </text>
      </g>
    );
  }

  const desc      = efficacyDescriptions[entry.efficacy];
  const meetsHIV  = entry.hivPct != null && entry.hivPct >= hivThreshold;
  const dotColor  = meetsHIV ? '#16a34a' : '#d1d5db';

  return (
    <g {...handlers(desc, entry.label)}>
      {/* pass/fail dot — sits just left of the label text */}
      <circle cx={x - 80} cy={y + 1} r={4} fill={dotColor} />
      <text x={x - 8} y={y} dy={4} textAnchor="end"
        fontSize={11} fontFamily="IBM Plex Sans, sans-serif" fill="#6B7280">
        {entry.label}
      </text>
      <text x={x - 6} y={y} dy={4} textAnchor="start"
        fontSize={10} fontFamily="IBM Plex Sans, sans-serif" fill="#4B5563">
        ⓘ
      </text>
    </g>
  );
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
// Diamond label — rendered on top of the nugent bar, proportional x position
// ---------------------------------------------------------------------------

function DiamondLabel(props) {
  const { x, y, width, height, value, index } = props;
  const entry = chartData[index];
  if (!entry || entry.isHeader || !entry.cst1 || !value) return null;
  const cx = x + (entry.cst1 / value) * width;
  const cy = y + height / 2;
  const s = 5;
  const color = efficacyColor(entry.efficacy);
  return (
    <polygon
      points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
      fill={color}
      stroke="white"
      strokeWidth={1}
    />
  );
}

// ---------------------------------------------------------------------------
// Custom bar tooltip — includes HIV % averted
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload, tppThreshold, hivThreshold }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d || d.isHeader) return null;
  const meetsTPP = d.nugent >= tppThreshold;
  const meetsHIV = d.hivPct != null && d.hivPct >= hivThreshold;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm font-sans">
      <p className="font-semibold text-gray-700 mb-2">{d.name}</p>
      <p className="text-xs text-gray-600">
        Nugent 0–3 at 6m:{' '}
        <span className="font-semibold">{d.nugent?.toFixed(1)}%</span>
        <span className="text-gray-400"> (95% UI: {d.nugent_p5?.toFixed(1)}–{d.nugent_p95?.toFixed(1)}%)</span>
      </p>
      <p className="text-xs text-gray-600">
        CST I at 6m:{' '}
        <span className="font-semibold">{d.cst1?.toFixed(1)}%</span>
        <span className="text-gray-400"> (95% UI: {d.cst1_p5?.toFixed(1)}–{d.cst1_p95?.toFixed(1)}%)</span>
      </p>
      <div className="border-t border-gray-100 mt-2 pt-2 space-y-0.5">
        <p className="text-xs" style={{ color: meetsTPP ? '#16a34a' : '#dc2626' }}>
          {meetsTPP ? `✓ Meets durable cure TPP (≥${tppThreshold}%)` : `✗ Below durable cure TPP (<${tppThreshold}%)`}
        </p>
        <p className="text-xs" style={{ color: meetsHIV ? '#16a34a' : '#9ca3af' }}>
          {meetsHIV
            ? `✓ Meets HIV impact target (${d.hivPct?.toFixed(1)}% ≥ ${hivThreshold}% averted)`
            : `✗ Below HIV impact target (${d.hivPct?.toFixed(1)}% < ${hivThreshold}% averted)`}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

function CustomLegend({ hivThreshold }) {
  return (
    <div className="flex flex-wrap items-center gap-5 text-xs font-sans mt-3">
      <div className="flex items-center gap-3 border-r border-gray-100 pr-5">
        <span className="text-gray-400 uppercase tracking-wide font-semibold">HIV impact:</span>
        <div className="flex items-center gap-1.5">
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#16a34a" /></svg>
          <span className="text-gray-600">≥ {hivThreshold}% HIV infections averted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#d1d5db" /></svg>
          <span className="text-gray-600">Below target</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 flex items-center">
          <div className="w-6 border-t-2 border-dashed border-gray-400" />
        </div>
        <span className="text-gray-600">Durable cure TPP threshold</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" className="flex-shrink-0">
          <polygon points="7,0 14,7 7,14 0,7" fill="#374151" opacity="0.85" />
        </svg>
        <span className="text-gray-600">CST I prevalence at 6 months</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RCTEndpoints() {
  const [tppThreshold, setTppThreshold] = useState(70);
  const [hivThreshold, setHivThreshold] = useState(5);
  const [labelTooltip, setLabelTooltip] = useState(null);

  return (
    <section id="rct" className="py-16 bg-brand-grayLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">
            Trial endpoints
          </p>
          <h2 className="section-heading">RCT durable cure endpoints</h2>
          <p className="section-subheading max-w-2xl">
            Predicted durable cure endpoints at 6 months post-treatment for each efficacy ×
            duration scenario. Bars show Nugent score 0–3 (% participants); diamonds show CST I
            (<em>Lactobacillus crispatus</em>-dominant) prevalence at 6 months.
            Hover over row labels for parameter definitions.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 space-y-4">
          {/* TPP threshold */}
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Durable cure threshold (TPP)
              </p>
              <p className="text-xs text-gray-400 font-sans">
                Minimum durable cure rate required for regulatory or payer acceptance.
              </p>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-gray-500 font-sans w-8 text-right">0%</span>
              <input
                type="range" min={0} max={100} step={1} value={tppThreshold}
                onChange={(e) => setTppThreshold(Number(e.target.value))}
                className="w-48 accent-brand-teal cursor-pointer"
              />
              <span className="text-sm text-gray-500 font-sans w-10">100%</span>
              <div className="bg-brand-teal text-white rounded-lg px-4 py-1.5 min-w-[64px] text-center">
                <span className="font-serif font-bold text-lg">{tppThreshold}%</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* HIV impact threshold */}
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Population HIV impact target
              </p>
              <p className="text-xs text-gray-400 font-sans">
                Minimum % of HIV infections averted (2035–2050) for a scenario to meet the population impact target.
              </p>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-gray-500 font-sans w-8 text-right">0%</span>
              <input
                type="range" min={0} max={10} step={0.5} value={hivThreshold}
                onChange={(e) => setHivThreshold(Number(e.target.value))}
                className="w-48 accent-brand-teal cursor-pointer"
              />
              <span className="text-sm text-gray-500 font-sans w-10">10%</span>
              <div className="bg-brand-teal text-white rounded-lg px-4 py-1.5 min-w-[64px] text-center">
                <span className="font-serif font-bold text-lg">{hivThreshold}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-gray-700 font-sans mb-1">
            Durable cure at 6 months by Nugent score 0–3 (bars) and CST I prevalence (◆)
          </p>
          <p className="text-xs text-gray-400 font-sans mb-4">
            By product efficacy and duration; grouped by duration. Dot color indicates whether scenario meets the HIV impact target.
          </p>
          <ResponsiveContainer width="100%" height={480}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 24, right: 60, left: 130, bottom: 32 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'Durable cure (%)',
                  position: 'insideBottom',
                  offset: -18,
                  fontSize: 11,
                  fontFamily: 'IBM Plex Sans',
                  fill: '#6B7280',
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={<CustomYAxisTick setLabelTooltip={setLabelTooltip} hivThreshold={hivThreshold} />}
                axisLine={false}
                tickLine={false}
                width={125}
              />
              <Tooltip className="pl-2" content={<CustomTooltip tppThreshold={tppThreshold} hivThreshold={hivThreshold} />} />

              <ReferenceLine
                x={tppThreshold}
                stroke="#0E7490"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                label={{
                  value: `TPP: ${tppThreshold}%`,
                  position: 'top',
                  fontSize: 10,
                  fontFamily: 'IBM Plex Sans',
                  fill: '#0E7490',
                  fontWeight: 600,
                }}
              />

              <Bar dataKey="nugent" name="Nugent 0–3 at 6m" barSize={16} opacity={0.85}
                label={<DiamondLabel />}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isHeader ? 'transparent' : efficacyColor(entry.efficacy)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <CustomLegend hivThreshold={hivThreshold} />
        </div>
      </div>
      <LabelTooltip tooltip={labelTooltip} />
    </section>
  );
}
