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
import ceData from '../data/ce_results.json';
import { efficacyColor } from '../utils/dataTransforms.js';

const { assumptions, scenarios } = ceData;

// Sort: 18m first → 6m last, within group ascending efficacy (matches PDF)
const sorted = [...scenarios].sort(
  (a, b) => b.duration_months - a.duration_months || a.efficacy_pct - b.efficacy_pct
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtM(n) {
  if (n === null || n === undefined) return '—';
  return (n / 1_000_000).toFixed(2) + 'M';
}
function fmtB(n) {
  if (n === null || n === undefined) return '—';
  if (Math.abs(n) >= 1_000_000_000) return '$' + (n / 1_000_000_000).toFixed(2) + 'B';
  return '$' + (n / 1_000_000).toFixed(0) + 'M';
}
function fmtDollar(n) {
  if (n === null || n === undefined) return '—';
  return '$' + Math.round(n).toLocaleString();
}

// Compute ICER for a given scenario and cost per course
// Returns null when cost-saving (negative ICER)
function computeIcer(scenario, costPerCourse) {
  const programCost = scenario.lbp_volume * costPerCourse;
  const net = programCost - scenario.hsca;
  return net / scenario.dalys_averted; // can be negative
}

// Color for ICER cell
function icerCellStyle(icer, wtpThreshold) {
  if (icer <= 0)     return { bg: '#dcfce7', text: '#15803d', label: 'Cost savings' };
  if (icer <= wtpThreshold * 0.5) return { bg: '#dbeafe', text: '#1d4ed8', label: fmtDollar(icer) };
  if (icer <= wtpThreshold) return { bg: '#fef9c3', text: '#854d0e', label: fmtDollar(icer) };
  return { bg: '#fee2e2', text: '#991b1b', label: fmtDollar(icer) };
}

// ---------------------------------------------------------------------------
// Stacked bar tooltip
// ---------------------------------------------------------------------------

function StackedTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm font-sans">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="text-xs">
          {p.name}: {valueFormatter(p.value)}
        </p>
      ))}
      <p className="text-xs text-gray-500 mt-1 border-t border-gray-100 pt-1">
        Total: {valueFormatter(total)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DALYs averted chart
// ---------------------------------------------------------------------------

function DalysChart() {
  const data = sorted.map((s) => ({
    label: s.label,
    efficacy: s.efficacy_pct,
    hiv_dalys:  Math.round(s.dalys_averted * s.hiv_daly_pct / 100),
    ptb_dalys:  Math.round(s.dalys_averted * s.ptb_daly_pct / 100),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
        DALYs averted (2026–2050)
      </h3>
      <p className="text-xs text-gray-400 font-sans mb-4">
        15 DALYs/HIV infection averted · 2.74 DALYs/preterm birth averted (GBD 2023, South Africa)
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 80, left: 106, bottom: 24 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'k')}
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
            axisLine={false} tickLine={false}
            label={{ value: 'DALYs averted', position: 'insideBottom', offset: -16, fontSize: 11, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
          />
          <YAxis
            type="category" dataKey="label"
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
            axisLine={false} tickLine={false} width={100}
          />
          <Tooltip content={<StackedTooltip valueFormatter={fmtM} />} />
          <Legend
            verticalAlign="top" height={28}
            formatter={(v) => <span style={{ fontSize: 11, fontFamily: 'IBM Plex Sans', color: '#374151' }}>{v}</span>}
          />
          <Bar dataKey="hiv_dalys" name="HIV"   stackId="a" fill="#ef4444" opacity={0.85} barSize={18} />
          <Bar dataKey="ptb_dalys" name="Preterm birth" stackId="a" fill="#3b82f6" opacity={0.85} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Health system costs averted chart
// ---------------------------------------------------------------------------

function HscaChart() {
  const data = sorted.map((s) => ({
    label: s.label,
    hiv_hsca: Math.round(s.hsca * s.hiv_hsca_pct / 100),
    ptb_hsca: Math.round(s.hsca * s.ptb_hsca_pct / 100),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
        Health system costs averted (2026–2050)
      </h3>
      <p className="text-xs text-gray-400 font-sans mb-4">
        $11,872/HIV infection averted · $448/preterm birth averted (South Africa, preliminary)
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 80, left: 106, bottom: 24 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => {
              if (Math.abs(v) >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
              return '$' + (v / 1e6).toFixed(0) + 'M';
            }}
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
            axisLine={false} tickLine={false}
            label={{ value: 'Health system costs averted (USD)', position: 'insideBottom', offset: -16, fontSize: 11, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
          />
          <YAxis
            type="category" dataKey="label"
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
            axisLine={false} tickLine={false} width={100}
          />
          <Tooltip content={<StackedTooltip valueFormatter={fmtB} />} />
          <Legend
            verticalAlign="top" height={28}
            formatter={(v) => <span style={{ fontSize: 11, fontFamily: 'IBM Plex Sans', color: '#374151' }}>{v}</span>}
          />
          <Bar dataKey="hiv_hsca" name="HIV"   stackId="a" fill="#ef4444" opacity={0.85} barSize={18} />
          <Bar dataKey="ptb_hsca" name="Preterm birth" stackId="a" fill="#3b82f6" opacity={0.85} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ICER interactive grid
// ---------------------------------------------------------------------------

function IcerGrid({ costPerCourse, wtpThreshold }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-sans border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4 font-sans">Scenario</th>
            <th className="text-right text-xs font-semibold text-gray-500 pb-2 px-3 font-sans">DALYs averted</th>
            <th className="text-right text-xs font-semibold text-gray-500 pb-2 px-3 font-sans">HSCA</th>
            <th className="text-right text-xs font-semibold text-gray-500 pb-2 px-3 font-sans">Program cost</th>
            <th className="text-center text-xs font-semibold text-gray-500 pb-2 px-3 font-sans">
              ICER at ${costPerCourse}/course
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const icer      = computeIcer(s, costPerCourse);
            const programCost = s.lbp_volume * costPerCourse;
            const style     = icerCellStyle(icer, wtpThreshold);
            return (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="py-2 pr-4 text-xs text-gray-700 font-sans whitespace-nowrap">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: efficacyColor(s.efficacy_pct) }}
                  />
                  {s.label}
                </td>
                <td className="py-2 px-3 text-xs text-gray-600 text-right tabular-nums">
                  {s.dalys_averted.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-xs text-gray-600 text-right tabular-nums">
                  {fmtB(s.hsca)}
                </td>
                <td className="py-2 px-3 text-xs text-gray-600 text-right tabular-nums">
                  {fmtB(programCost)}
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {style.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assumptions card
// ---------------------------------------------------------------------------

function AssumptionsCard() {
  return (
    <div className="bg-brand-grayLight rounded-xl border border-gray-200 p-5 mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Key assumptions</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'DALYs per HIV infection averted', value: '15', note: 'Conservative; GBD SA ≈17' },
          { label: 'DALYs per preterm birth averted', value: '2.74', note: 'GBD 2023, South Africa' },
          { label: 'Lifetime cost averted per HIV case', value: '$11,872', note: 'ART + care, 30y, 79% coverage' },
          { label: 'Cost averted per preterm birth', value: '$448', note: 'Direct medical costs (preliminary)' },
        ].map((a) => (
          <div key={a.label}>
            <p className="text-xs text-gray-500 font-sans leading-snug">{a.label}</p>
            <p className="font-serif font-bold text-lg text-brand-blue mt-0.5">{a.value}</p>
            <p className="text-xs text-gray-400 font-sans">{a.note}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 font-sans mt-3 italic">
        Source: {assumptions.source}. Analysis period: {assumptions.analysis_period}, {assumptions.setting}.
        Costs are preliminary and subject to revision as UW START literature review completes.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CostEffectiveness() {
  const [costPerCourse, setCostPerCourse] = useState(20);
  const [wtpThreshold, setWtpThreshold]   = useState(3000);

  return (
    <section id="ce" className="py-16 bg-brand-grayLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">
            Economic value
          </p>
          <h2 className="section-heading">DALYs averted &amp; cost-effectiveness</h2>
          <p className="section-subheading max-w-2xl">
            DALYs averted, health system costs averted, and incremental cost-effectiveness ratios
            (ICERs) across the 9 product scenarios. Results are from a parallel Gates Foundation
            analysis spanning 2026–2050 in South Africa.
          </p>
        </div>

        <AssumptionsCard />

        {/* Two stacked bar charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <DalysChart />
          <HscaChart />
        </div>

        {/* ICER interactive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
            Incremental cost-effectiveness ratio (ICER)
          </h3>
          <p className="text-xs text-gray-400 font-sans mb-6">
            Adjust the fully loaded LBP cost per course and your willingness-to-pay threshold to
            see which scenarios are cost-saving or cost-effective.
          </p>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Cost per course slider */}
            <div className="bg-brand-grayLight rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                LBP cost per course (fully loaded)
              </p>
              <p className="text-xs text-gray-400 font-sans mb-3">
                Includes procurement, manufacturing, delivery. TPP target: $6/course.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-5">$5</span>
                <input
                  type="range" min={5} max={50} step={1}
                  value={costPerCourse}
                  onChange={(e) => setCostPerCourse(Number(e.target.value))}
                  className="flex-1 accent-brand-teal cursor-pointer"
                />
                <span className="text-xs text-gray-400 w-7">$50</span>
                <div className="bg-brand-teal text-white rounded-lg px-3 py-1 min-w-[56px] text-center">
                  <span className="font-serif font-bold text-base">${costPerCourse}</span>
                </div>
              </div>
            </div>

            {/* WTP threshold slider */}
            <div className="bg-brand-grayLight rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Willingness-to-pay threshold ($/DALY)
              </p>
              <p className="text-xs text-gray-400 font-sans mb-3">
                SA GDP per capita ≈ $6,200. WHO 1–3× GDP threshold: $6,200–$18,600/DALY.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-8">$500</span>
                <input
                  type="range" min={500} max={20000} step={500}
                  value={wtpThreshold}
                  onChange={(e) => setWtpThreshold(Number(e.target.value))}
                  className="flex-1 accent-brand-blue cursor-pointer"
                />
                <span className="text-xs text-gray-400 w-10">$20k</span>
                <div className="bg-brand-blue text-white rounded-lg px-3 py-1 min-w-[72px] text-center">
                  <span className="font-serif font-bold text-base">${(wtpThreshold / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>
          </div>

          {/* Color key */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-sans mb-5">
            <span className="text-gray-500">ICER legend:</span>
            {[
              { bg: '#dcfce7', text: '#15803d', label: 'Cost savings (HSCA > program cost)' },
              { bg: '#dbeafe', text: '#1d4ed8', label: `< ½ WTP threshold` },
              { bg: '#fef9c3', text: '#854d0e', label: `> ½ WTP, ≤ WTP threshold` },
              { bg: '#fee2e2', text: '#991b1b', label: `> WTP threshold` },
            ].map((k) => (
              <span
                key={k.label}
                className="inline-flex items-center gap-1.5 rounded px-2 py-0.5"
                style={{ backgroundColor: k.bg, color: k.text }}
              >
                {k.label}
              </span>
            ))}
          </div>

          <IcerGrid costPerCourse={costPerCourse} wtpThreshold={wtpThreshold} />
        </div>
      </div>
    </section>
  );
}
