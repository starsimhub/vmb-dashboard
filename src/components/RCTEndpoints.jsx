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
import { efficacyColor } from '../utils/dataTransforms.js';

// ---------------------------------------------------------------------------
// Build chart data: header rows + data rows grouped by duration (18 → 12 → 6)
// ---------------------------------------------------------------------------

const durations = [18, 12, 6];

const chartData = [];
for (const dur of durations) {
  chartData.push({ name: `${dur}m`, isHeader: true, nugent: null, cst1: null });
  const rows = rctEndpoints
    .filter((d) => d.duration_months === dur)
    .sort((a, b) => a.efficacy_pct - b.efficacy_pct);
  for (const d of rows) {
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
    });
  }
}

// ---------------------------------------------------------------------------
// Custom YAxis tick: bold blue for headers, normal gray for data rows
// ---------------------------------------------------------------------------

function CustomYAxisTick({ x, y, payload }) {
  const entry = chartData.find((d) => d.name === payload.value);
  if (!entry) return null;
  if (entry.isHeader) {
    return (
      <text
        x={x}
        y={y}
        dy={4}
        textAnchor="end"
        fontSize={11}
        fontFamily="IBM Plex Serif, serif"
        fontWeight={700}
        fill="#1e3a5f"
      >
        {entry.name}
      </text>
    );
  }
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={11}
      fontFamily="IBM Plex Sans, sans-serif"
      fill="#6B7280"
    >
      {entry.label}
    </text>
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
// Custom tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload, tppThreshold }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d || d.isHeader) return null;
  const meetsTPP = d.nugent >= tppThreshold;
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
      <p className="text-xs mt-1" style={{ color: meetsTPP ? '#16a34a' : '#dc2626' }}>
        {meetsTPP ? `✓ Meets TPP (≥${tppThreshold}%)` : `✗ Below TPP (<${tppThreshold}%)`}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom legend
// ---------------------------------------------------------------------------

function CustomLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-sans mt-2">
      <div className="flex items-center gap-1.5">
        <div className="h-3 flex items-center">
          <div className="w-6 border-t-2 border-dashed border-gray-400" />
        </div>
        <span className="text-gray-600">TPP threshold</span>
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
          </p>
        </div>

        {/* TPP slider control */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Target product profile threshold
              </p>
              <p className="text-xs text-gray-400 font-sans">
                Drag to set the minimum durable cure rate required for regulatory or payer acceptance.
              </p>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-gray-500 font-sans w-8 text-right">0%</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={tppThreshold}
                onChange={(e) => setTppThreshold(Number(e.target.value))}
                className="w-48 accent-brand-teal cursor-pointer"
              />
              <span className="text-sm text-gray-500 font-sans w-10">100%</span>
              <div className="bg-brand-teal text-white rounded-lg px-4 py-1.5 min-w-[64px] text-center">
                <span className="font-serif font-bold text-lg">{tppThreshold}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-gray-700 font-sans mb-1">
            Durable cure at 6 months by Nugent score 0–3 (bars) and CST I prevalence (◆)
          </p>
          <p className="text-xs text-gray-400 font-sans mb-4">
            By product efficacy and duration; grouped by duration
          </p>
          <ResponsiveContainer width="100%" height={480}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 24, right: 60, left: 120, bottom: 32 }}
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
                tick={<CustomYAxisTick />}
                axisLine={false}
                tickLine={false}
                width={115}
              />
              <Tooltip content={<CustomTooltip tppThreshold={tppThreshold} />} />

              {/* Configurable TPP threshold line */}
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

              {/* Nugent 0-3 bars, colored by efficacy, with diamond labels for CST I */}
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
          <CustomLegend />
        </div>
      </div>
    </section>
  );
}
