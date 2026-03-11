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
// Sort: 18m top → 6m bottom, within each group ascending efficacy
// ---------------------------------------------------------------------------

const chartData = [...rctEndpoints]
  .sort(
    (a, b) =>
      b.duration_months - a.duration_months || a.efficacy_pct - b.efficacy_pct
  )
  .map((d) => ({
    name: `${d.duration_months}m / ${d.efficacy_pct}%`,
    duration: d.duration_months,
    efficacy: d.efficacy_pct,
    nugent: d.nugent_normal_6m_median,
    nugent_p5: d.nugent_normal_6m_p5,
    nugent_p95: d.nugent_normal_6m_p95,
    cst1: d.cst1_6m_median,
    cst1_p5: d.cst1_6m_p5,
    cst1_p95: d.cst1_6m_p95,
  }));

// ---------------------------------------------------------------------------
// Diamond shape for CST I markers
// ---------------------------------------------------------------------------

function DiamondShape(props) {
  const { x, y, width, height, value, efficacy } = props;
  if (value === null || value === undefined) return null;
  const cx = x + width;
  const cy = y + height / 2;
  const size = 5;
  const color = efficacyColor(efficacy);
  return (
    <polygon
      points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
      fill={color}
      stroke={color}
      strokeWidth={1}
      opacity={0.9}
    />
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload, label, tppThreshold }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
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
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: efficacyColor(50), opacity: 0.8 }} />
        <span className="text-gray-600">50% efficacy</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: efficacyColor(65), opacity: 0.8 }} />
        <span className="text-gray-600">65% efficacy</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: efficacyColor(80), opacity: 0.8 }} />
        <span className="text-gray-600">80% efficacy</span>
      </div>
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
        <span className="text-gray-600">CST I (◆ marker)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-2 rounded-sm bg-gray-300" />
        <span className="text-gray-600">Nugent 0–3 (bar)</span>
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
            (Lactobacillus crispatus-dominant) establishment rate.
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
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 24, right: 60, left: 120, bottom: 32 }}
              barCategoryGap="20%"
              barGap={1}
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
                tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
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

              {/* Nugent 0-3 bars, colored by efficacy */}
              <Bar dataKey="nugent" name="Nugent 0–3 at 6m" barSize={16} opacity={0.85}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={efficacyColor(entry.efficacy)} />
                ))}
              </Bar>

              {/* CST I diamonds as a bar with custom shape */}
              <Bar
                dataKey="cst1"
                name="CST I at 6m"
                barSize={16}
                fill="none"
                shape={(props) => {
                  const entry = chartData[props.index];
                  const eff = entry ? entry.efficacy : 80;
                  return <DiamondShape {...props} efficacy={eff} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <CustomLegend />
        </div>
      </div>
    </section>
  );
}
