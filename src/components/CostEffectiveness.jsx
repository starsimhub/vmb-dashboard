import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useVersion } from '../contexts/VersionContext.jsx';
import { efficacyColor, sensitivityLabel } from '../utils/dataTransforms.js';

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

// Scale the HIV portion of a scenario's health-system cost averted by a ratio
// (the selected lifetime cost per HIV case ÷ the default). At ratio = 1 this
// returns the scenario's original baked-in HSCA.
function adjustedHsca(scenario, hivCostRatio = 1) {
  const hivPart = scenario.hsca * scenario.hiv_hsca_pct / 100;
  const ptbPart = scenario.hsca * scenario.ptb_hsca_pct / 100;
  return hivPart * hivCostRatio + ptbPart;
}

// Compute ICER for a given scenario, cost per course, HIV-cost scaling, and an
// optional MTZ cost offset (dollars of BV-treatment cost averted). Returns a
// negative value when cost-saving.
function computeIcer(scenario, costPerCourse, hivCostRatio = 1, mtzOffset = 0) {
  const programCost = scenario.lbp_volume * costPerCourse;
  const net = programCost - adjustedHsca(scenario, hivCostRatio) - mtzOffset;
  return net / scenario.dalys_averted; // can be negative
}

// Standalone ICER for a single indication (HIV or PTB): the indication bears the
// full LBP program cost, offset only by that indication's own health-system cost
// averted. Frames "if the product were justified on this indication alone."
function indicationIcer(s, costPerCourse, hivCostRatio, indication) {
  const dalyPct = indication === 'hiv' ? s.hiv_daly_pct : s.ptb_daly_pct;
  const hscaPct = indication === 'hiv' ? s.hiv_hsca_pct : s.ptb_hsca_pct;
  const dalys = s.dalys_averted * dalyPct / 100;
  if (!dalys) return null;
  let hsca = s.hsca * hscaPct / 100;
  if (indication === 'hiv') hsca *= hivCostRatio;
  const programCost = s.lbp_volume * costPerCourse;
  return (programCost - hsca) / dalys;
}

// Timing-aware discount factor for a flow: (Σ x_t / (1+r)^(t−2035)) / Σ x_t,
// applied to a cumulative total. Returns 1 (no discounting) at r=0, for empty
// streams, or when the stream is ill-conditioned (non-positive / mixed sign).
function discountFactor(stream, years, rate) {
  if (!rate || !stream || !years || stream.length === 0) return 1;
  let num = 0, den = 0;
  for (let i = 0; i < stream.length; i++) {
    num += stream[i] / Math.pow(1 + rate, years[i] - 2035);
    den += stream[i];
  }
  if (den <= 0) return 1;
  const f = num / den;
  return (isFinite(f) && f > 0 && f <= 1.5) ? f : 1;
}

// Drug-substance (DS) cost of goods per course by manufacturing arm, at 20,000 L
// commercial scale (Latham/Sia DS model, July 2026). DS only — drug-product
// fill/finish and delivery are added separately and are still preliminary.
const COGS_ARMS = [
  { id: 'arm2', label: 'Arm 2 · 3-strain (LC-103)', ds: 6.45 },
  { id: 'arm3', label: 'Arm 3 · 3-strain mucoadhesive', ds: 6.45 },
  { id: 'arm5', label: 'Arm 5 · 4-strain (LC-104)', ds: 7.74 },
  { id: 'arm1', label: 'Arm 1 · 6-strain (LC-106)', ds: 16.34 },
  { id: 'arm4', label: 'Arm 4 · 3-strain reduced dose', ds: 1.29 },
];

// ICER cell: report "Cost savings" when the offset exceeds program cost,
// otherwise the incremental cost per DALY. No willingness-to-pay threshold is
// applied — we report the ICER and let the reader judge against their own.
function icerCellStyle(icer) {
  if (icer === null || icer === undefined || !isFinite(icer)) return { bg: '#f3f4f6', text: '#6b7280', label: '—' };
  if (icer <= 0) return { bg: '#dcfce7', text: '#15803d', label: 'Cost savings' };
  return { bg: '#eff6ff', text: '#1d4ed8', label: fmtDollar(icer) + '/DALY' };
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

function DalysChart({ sorted, assumptions = {} }) {
  const data = sorted.map((s) => ({
    label: s.label,
    efficacy: s.efficacy_pct,
    hiv_dalys:  Math.round(s.dalys_averted * s.hiv_daly_pct / 100),
    ptb_dalys:  Math.round(s.dalys_averted * s.ptb_daly_pct / 100),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
        DALYs averted (2035–2050)
      </h3>
      <p className="text-xs text-gray-400 font-sans mb-4">
        {assumptions.dalys_per_hiv} DALYs/HIV infection averted · {assumptions.dalys_per_ptb} DALYs/preterm birth averted (GBD 2023, South Africa)
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
            tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
            axisLine={false} tickLine={false}
            label={{ value: 'DALYs averted', position: 'insideBottom', offset: -16, fontSize: 13, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
          />
          <YAxis
            type="category" dataKey="label"
            tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
            axisLine={false} tickLine={false} width={100}
          />
          <Tooltip content={<StackedTooltip valueFormatter={fmtM} />} />
          <Legend
            verticalAlign="top" height={28}
            formatter={(v) => <span style={{ fontSize: 13, fontFamily: 'IBM Plex Sans', color: '#374151' }}>{v}</span>}
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

function HscaChart({ sorted, hivCostRatio, hivCostAverted, assumptions = {} }) {
  const data = sorted.map((s) => ({
    label: s.label,
    hiv_hsca: Math.round(s.hsca * s.hiv_hsca_pct / 100 * hivCostRatio),
    ptb_hsca: Math.round(s.hsca * s.ptb_hsca_pct / 100),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
        Health system costs averted (2035–2050)
      </h3>
      <p className="text-xs text-gray-400 font-sans mb-4">
        ${Math.round(hivCostAverted).toLocaleString()}/HIV infection averted · ${Math.round(assumptions.hsca_per_ptb).toLocaleString()}/preterm birth averted (South Africa, preliminary)
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
            tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
            axisLine={false} tickLine={false}
            label={{ value: 'Health system costs averted (USD)', position: 'insideBottom', offset: -16, fontSize: 13, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
          />
          <YAxis
            type="category" dataKey="label"
            tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
            axisLine={false} tickLine={false} width={100}
          />
          <Tooltip content={<StackedTooltip valueFormatter={fmtB} />} />
          <Legend
            verticalAlign="top" height={28}
            formatter={(v) => <span style={{ fontSize: 13, fontFamily: 'IBM Plex Sans', color: '#374151' }}>{v}</span>}
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

function IcerGrid({ sorted, costPerCourse, hivCostRatio, mtzCost, popMtzById }) {
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
              Combined ICER<br /><span className="font-normal text-gray-400">at ${costPerCourse.toFixed(2)}/course</span>
            </th>
            <th className="text-center text-xs font-semibold text-gray-500 pb-2 px-3 font-sans">HIV-only ICER</th>
            <th className="text-center text-xs font-semibold text-gray-500 pb-2 px-3 font-sans">PTB-only ICER</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const mtzOffset = (popMtzById[s.id] || 0) * (mtzCost || 0);
            const icer      = computeIcer(s, costPerCourse, hivCostRatio, mtzOffset);
            const programCost = s.lbp_volume * costPerCourse;
            const style     = icerCellStyle(icer);
            const hivIcer   = indicationIcer(s, costPerCourse, hivCostRatio, 'hiv');
            const ptbIcer   = indicationIcer(s, costPerCourse, hivCostRatio, 'ptb');
            const hivStyle  = icerCellStyle(hivIcer);
            const ptbStyle  = icerCellStyle(ptbIcer);
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
                  {fmtB(adjustedHsca(s, hivCostRatio) + mtzOffset)}
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
                <td className="py-2 px-3 text-center">
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: hivStyle.bg, color: hivStyle.text }}
                  >
                    {hivStyle.label}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: ptbStyle.bg, color: ptbStyle.text }}
                  >
                    {ptbStyle.label}
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
// ICER drivers chart — how ICER responds to efficacy and duration
// ---------------------------------------------------------------------------

function IcerDriversTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm font-sans">
      <p className="font-semibold text-gray-700 mb-2">{label}-month duration</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.stroke }} className="text-xs">
          {p.name}: {p.value <= 0 ? 'cost-saving' : fmtDollar(p.value) + '/DALY'}
        </p>
      ))}
    </div>
  );
}

function IcerDriversChart({ scenarios, costPerCourse, hivCostRatio, mtzCost, popMtzById }) {
  const durations = useMemo(
    () => [...new Set(scenarios.map((s) => s.duration_months))].sort((a, b) => a - b),
    [scenarios]
  );
  const efficacies = useMemo(
    () => [...new Set(scenarios.map((s) => s.efficacy_pct))].sort((a, b) => a - b),
    [scenarios]
  );
  const data = useMemo(
    () =>
      durations.map((dur) => {
        const row = { duration: dur };
        scenarios
          .filter((s) => s.duration_months === dur)
          .forEach((s) => {
            const mtzOffset = (popMtzById[s.id] || 0) * (mtzCost || 0);
            row[`eff${s.efficacy_pct}`] = Math.round(computeIcer(s, costPerCourse, hivCostRatio, mtzOffset));
          });
        return row;
      }),
    [durations, scenarios, costPerCourse, hivCostRatio, mtzCost, popMtzById]
  );

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 12, right: 32, left: 12, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="duration"
          type="number"
          domain={['dataMin', 'dataMax']}
          ticks={durations}
          tickFormatter={(v) => `${v} mo`}
          tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
          axisLine={false} tickLine={false}
          label={{ value: 'Duration of effect (months)', position: 'insideBottom', offset: -14, fontSize: 13, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
        />
        <YAxis
          tickFormatter={(v) => (v < 0 ? '−$' + Math.abs(v).toLocaleString() : '$' + v.toLocaleString())}
          tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
          axisLine={false} tickLine={false} width={78}
          label={{ value: 'ICER ($/DALY)', angle: -90, position: 'insideLeft', offset: 4, fontSize: 13, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
        />
        <Tooltip content={<IcerDriversTooltip />} />
        <Legend
          verticalAlign="top" height={28}
          formatter={(v) => <span style={{ fontSize: 13, fontFamily: 'IBM Plex Sans', color: '#374151' }}>{v}</span>}
        />
        <ReferenceLine y={0} stroke="#15803d" strokeDasharray="4 2" strokeWidth={1} label={{ value: 'cost-saving', position: 'right', fontSize: 10, fontFamily: 'IBM Plex Sans', fill: '#15803d' }} />
        {efficacies.map((eff) => (
          <Line
            key={eff}
            type="monotone"
            dataKey={`eff${eff}`}
            name={`${eff}% efficacy`}
            stroke={efficacyColor(eff)}
            strokeWidth={2.5}
            dot={{ r: 4, fill: efficacyColor(eff) }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// ICER tornado — how each sensitivity parameter shifts the ICER
// ---------------------------------------------------------------------------

// Derive an ICER for a sensitivity scenario from its model-averted HIV/PTB
// counts, LBP volume, and the per-case DALY / cost-offset assumptions.
// Returns null when the scenario lacks a treatment volume.
function sensitivityIcer(s, costPerCourse, a, hivCostAverted, mtzCost = 0, discountRate = 0) {
  if (s.lbp_volume === null || s.lbp_volume === undefined) return null;
  const ds = s.discount_streams || {};
  const yrs = ds.years || [];
  const hiv = s.hiv_averted_median * discountFactor(ds.hiv_averted, yrs, discountRate);
  const ptb = s.ptb_averted_median * discountFactor(ds.ptb_averted, yrs, discountRate);
  const vol = s.lbp_volume        * discountFactor(ds.lbp_volume, yrs, discountRate);
  const mtz = (s.mtz_averted_median || 0) * discountFactor(ds.mtz_averted, yrs, discountRate);
  const hivCost = hivCostAverted ?? a.hsca_per_hiv;
  const dalys = hiv * a.dalys_per_hiv + ptb * a.dalys_per_ptb;
  if (!dalys) return null;
  const hsca = hiv * hivCost + ptb * a.hsca_per_ptb + mtz * (mtzCost || 0);
  const programCost = vol * costPerCourse;
  return (programCost - hsca) / dalys;
}

function icerBarColor(icer) {
  return icer <= 0 ? '#16a34a' : '#1d4ed8'; // cost-saving (green) vs positive ICER (blue)
}

function IcerTornadoTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm font-sans">
      <p className="font-semibold text-gray-700 mb-1">{d.label}</p>
      <p className="text-xs text-gray-600">
        ICER: <span className="font-semibold">{d.icer <= 0 ? 'cost-saving' : fmtDollar(d.icer) + '/DALY'}</span>
      </p>
      {d.deltaVsRef !== null && !d.isRef && (
        <p className="text-xs text-gray-500">
          vs reference: {d.deltaVsRef >= 0 ? '+' : '−'}{fmtDollar(Math.abs(d.deltaVsRef))}/DALY
        </p>
      )}
    </div>
  );
}

function IcerTornado({ sensitivityScenarios, assumptions, costPerCourse, hivCostAverted, mtzCost, discountRate }) {
  const data = useMemo(() => {
    const rows = sensitivityScenarios
      .map((s) => ({
        id: s.id,
        label: sensitivityLabel(s.label),
        isRef: s.id === 'reference',
        icer: sensitivityIcer(s, costPerCourse, assumptions, hivCostAverted, mtzCost, discountRate),
      }))
      .filter((r) => r.icer !== null);
    const ref = rows.find((r) => r.isRef);
    const refIcer = ref ? ref.icer : null;
    return rows
      .map((r) => ({
        ...r,
        icer: Math.round(r.icer),
        deltaVsRef: refIcer === null ? null : Math.round(r.icer - refIcer),
      }))
      .sort((a, b) => a.icer - b.icer);
  }, [sensitivityScenarios, assumptions, costPerCourse, hivCostAverted, mtzCost, discountRate]);

  if (data.length === 0) return null;
  const refIcer = data.find((d) => d.isRef)?.icer;

  // Anchor the domain at 0 so the cost-saving line and bar origins are always visible.
  const vals = data.map((d) => d.icer);
  const minV = Math.min(0, ...vals);
  const maxV = Math.max(0, ...vals);
  const pad = (maxV - minV) * 0.08 || 100;
  const domainMin = Math.floor((minV - pad) / 50) * 50;
  const domainMax = Math.ceil((maxV + pad) / 50) * 50;

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 28, left: 156, bottom: 28 }} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
        <XAxis
          type="number"
          domain={[domainMin, domainMax]}
          tickFormatter={(v) => (v < 0 ? '−$' + Math.abs(v).toLocaleString() : '$' + v.toLocaleString())}
          tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#9CA3AF' }}
          axisLine={false} tickLine={false}
          label={{ value: 'ICER ($/DALY)', position: 'insideBottom', offset: -16, fontSize: 13, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
        />
        <YAxis
          type="category" dataKey="label"
          tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
          axisLine={false} tickLine={false} width={150}
        />
        <Tooltip content={<IcerTornadoTooltip />} />
        <ReferenceLine x={0} stroke="#15803d" strokeWidth={1.5} />
        {refIcer !== undefined && (
          <ReferenceLine
            x={refIcer} stroke="#6B7280" strokeDasharray="4 2" strokeWidth={1}
            label={{ value: 'reference', position: 'top', fontSize: 10, fontFamily: 'IBM Plex Sans', fill: '#6B7280' }}
          />
        )}
        <Bar dataKey="icer" barSize={16}>
          {data.map((entry) => (
            <Cell key={entry.id} fill={icerBarColor(entry.icer)} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Assumptions card
// ---------------------------------------------------------------------------

function AssumptionsCard({ assumptions }) {
  return (
    <div className="bg-brand-grayLight rounded-xl border border-gray-200 p-5 mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Key assumptions</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'DALYs per HIV infection averted', value: `${assumptions.dalys_per_hiv}`, note: 'GBD 2023, South Africa' },
          { label: 'DALYs per preterm birth averted', value: `${assumptions.dalys_per_ptb}`, note: 'GBD 2023, South Africa' },
          { label: 'Lifetime cost averted per HIV case', value: `$${Math.round(assumptions.hsca_per_hiv).toLocaleString()}`, note: 'ART + care' },
          { label: 'Cost averted per preterm birth', value: `$${Math.round(assumptions.hsca_per_ptb).toLocaleString()}`, note: 'Health system costs (preliminary)' },
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
  const { ceData, sensitivityScenarios, populationScenarios, versionInfo } = useVersion();
  const { assumptions, scenarios } = ceData;
  const ceaInterim = Boolean(versionInfo?.cea_interim);
  const popMtzById = useMemo(
    () => Object.fromEntries((populationScenarios || []).map((p) => [p.id, p.mtz_averted_median || 0])),
    [populationScenarios]
  );
  const sorted = useMemo(
    () => [...scenarios].sort(
      (a, b) => b.duration_months - a.duration_months || a.efficacy_pct - b.efficacy_pct
    ),
    [scenarios]
  );
  // Versions that carry IPM's channel costing (procurement COGS + OTC/Rx delivery)
  // use a simplified cost panel matching IPM's assumptions.
  const cogsPoints = assumptions.cogs_points || [];
  const channels   = assumptions.channels || null;
  const channelMode = Boolean(channels && cogsPoints.length);

  // Fully-loaded cost per course. Default panel = DS CoGs (manufacturing arm) +
  // drug-product/delivery/overhead. Channel panel = procurement COGS + OTC/Rx delivery.
  const [dsCogs, setDsCogs] = useState(6.45);          // Arm 2/3 (3-strain) @ 20kL
  const [addlCost, setAddlCost] = useState(13.55);     // preliminary; total defaults to $20
  const [cogsIdx, setCogsIdx] = useState(0);
  const [channel, setChannel] = useState('otc');
  const cogs = cogsPoints[cogsIdx] ?? cogsPoints[0] ?? 6.45;
  const deliveryCost = channels ? (channel === 'otc' ? channels.otc : channels.rx) : 0;
  const costPerCourse = channelMode
    ? Math.round((cogs + deliveryCost) * 100) / 100
    : Math.round((dsCogs + addlCost) * 100) / 100;

  const defaultHivCost = assumptions.hsca_per_hiv || 11872;
  const [hivCostAverted, setHivCostAverted] = useState(defaultHivCost);
  // Reset the HIV-cost slider to the active version's default when the version changes.
  useEffect(() => { setHivCostAverted(defaultHivCost); }, [defaultHivCost]);
  const hivCostRatio = defaultHivCost ? hivCostAverted / defaultHivCost : 1;
  const [mtzCost, setMtzCost] = useState(0);
  const [discountPct, setDiscountPct] = useState(0);
  // Channel mode matches IPM: no BV/MTZ cost offset, undiscounted.
  const effMtzCost = channelMode ? 0 : mtzCost;
  const discountRate = (channelMode ? 0 : discountPct) / 100;

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
            (ICERs) across the 9 product scenarios, 2035–2050, South Africa.
            {ceaInterim
              ? ' These cost-effectiveness inputs are preliminary and pending IPM validation.'
              : ' Results are from a parallel Gates Foundation / IPM analysis.'}
          </p>
          {ceaInterim && (
            <div className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 max-w-3xl">
              <span className="font-semibold">Preliminary estimate.</span> This cost-effectiveness view uses
              draft DALY-attribution and costing inputs (see the source note below for the specific
              per-case values). It is pending IPM&rsquo;s authoritative refresh — treat absolute ICERs as provisional.
            </div>
          )}
        </div>

        <AssumptionsCard assumptions={assumptions} />

        {/* Two stacked bar charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <DalysChart sorted={sorted} assumptions={assumptions} />
          <HscaChart sorted={sorted} hivCostRatio={hivCostRatio} hivCostAverted={hivCostAverted} assumptions={assumptions} />
        </div>

        {/* ICER interactive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
            Incremental cost-effectiveness ratio (ICER)
          </h3>
          <p className="text-xs text-gray-400 font-sans mb-6">
            Fully loaded cost <span className="font-semibold text-brand-teal">${costPerCourse.toFixed(2)}/course</span>
            {channelMode
              ? ` = procurement $${cogs.toFixed(2)} + ${channel === 'otc' ? 'OTC' : 'Rx'} delivery $${deliveryCost.toFixed(2)}.`
              : ` = DS CoGs $${dsCogs.toFixed(2)} + drug product/delivery/overhead $${addlCost.toFixed(2)}.`}
            {' '}Adjust the inputs below to see which scenarios are cost-saving (health-system costs averted
            exceed program cost) and the incremental cost per DALY averted otherwise. No willingness-to-pay
            threshold is applied — compare the ICER against your own.
          </p>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {channelMode && (
              <>
                {/* Procurement COGS per course (IPM points) */}
                <div className="bg-brand-grayLight rounded-lg p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                    Procurement cost per course
                  </p>
                  <p className="text-xs text-gray-400 font-sans mb-2">
                    IPM CoGs assessment (RHT), range ${Math.min(...cogsPoints).toFixed(2)}–${Math.max(...cogsPoints).toFixed(2)}.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {cogsPoints.map((c, i) => {
                      const active = i === cogsIdx;
                      return (
                        <button
                          key={c}
                          onClick={() => setCogsIdx(i)}
                          className="text-xs font-sans rounded px-2 py-1 border transition-colors"
                          style={active
                            ? { backgroundColor: '#0E7490', color: '#fff', borderColor: '#0E7490' }
                            : { backgroundColor: '#fff', color: '#374151', borderColor: '#E5E7EB' }}
                        >
                          ${c.toFixed(2)}
                        </button>
                      );
                    })}
                  </div>
                  <div className="bg-brand-teal text-white rounded-lg px-3 py-1 inline-block text-center">
                    <span className="font-serif font-bold text-base">${cogs.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery channel toggle (OTC vs Rx) */}
                <div className="bg-brand-grayLight rounded-lg p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                    Delivery channel
                  </p>
                  <p className="text-xs text-gray-400 font-sans mb-2">
                    OTC vs facility/prescriber dispensing (IPM RHT delivery costing).
                  </p>
                  <div className="flex rounded-full border border-gray-200 overflow-hidden text-sm font-sans mb-2">
                    <button
                      onClick={() => setChannel('otc')}
                      className="px-3 py-1 transition-colors duration-150"
                      style={channel === 'otc'
                        ? { backgroundColor: '#0E7490', color: '#fff' }
                        : { backgroundColor: '#fff', color: '#6B7280' }}
                    >
                      OTC ${channels.otc.toFixed(2)}
                    </button>
                    <button
                      onClick={() => setChannel('rx')}
                      className="px-3 py-1 transition-colors duration-150"
                      style={channel === 'rx'
                        ? { backgroundColor: '#0E7490', color: '#fff' }
                        : { backgroundColor: '#fff', color: '#6B7280' }}
                    >
                      Rx ${channels.rx.toFixed(2)}
                    </button>
                  </div>
                  <div className="bg-brand-teal text-white rounded-lg px-3 py-1 inline-block text-center">
                    <span className="font-serif font-bold text-base">${deliveryCost.toFixed(2)} delivery</span>
                  </div>
                </div>
              </>
            )}
            {!channelMode && (<>
            {/* DS CoGs per course (by manufacturing arm) */}
            <div className="bg-brand-grayLight rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                DS CoGs per course (by arm)
              </p>
              <p className="text-xs text-gray-400 font-sans mb-2">
                Drug substance only, 20,000 L commercial scale (Latham/Sia, Jul 2026). TPP target ~$6.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COGS_ARMS.map((a) => {
                  const active = Math.abs(dsCogs - a.ds) < 0.005;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setDsCogs(a.ds)}
                      className="text-xs font-sans rounded px-2 py-1 border transition-colors"
                      style={active
                        ? { backgroundColor: '#0E7490', color: '#fff', borderColor: '#0E7490' }
                        : { backgroundColor: '#fff', color: '#374151', borderColor: '#E5E7EB' }}
                    >
                      {a.label.split(' · ')[0]} ${a.ds}
                    </button>
                  );
                })}
              </div>
              <div className="bg-brand-teal text-white rounded-lg px-3 py-1 inline-block text-center">
                <span className="font-serif font-bold text-base">${dsCogs.toFixed(2)}</span>
              </div>
            </div>

            {/* Drug product + delivery + overhead */}
            <div className="bg-brand-grayLight rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Drug product + delivery + overhead
              </p>
              <p className="text-xs text-gray-400 font-sans mb-3">
                Preliminary — DP fill/finish, cold chain, distribution/tariffs, clinic &amp; dispensing.
                Benchmarks pending.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">$0</span>
                <input
                  type="range" min={0} max={40} step={0.5}
                  value={addlCost}
                  onChange={(e) => setAddlCost(Number(e.target.value))}
                  className="flex-1 accent-brand-teal cursor-pointer"
                />
                <span className="text-xs text-gray-400 w-7">$40</span>
                <div className="bg-brand-teal text-white rounded-lg px-3 py-1 min-w-[56px] text-center">
                  <span className="font-serif font-bold text-base">${addlCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            </>)}
            {/* Lifetime cost averted per HIV case slider */}
            <div className="bg-brand-grayLight rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Lifetime cost averted per HIV case
              </p>
              <p className="text-xs text-gray-400 font-sans mb-3">
                Dominant HSCA lever (HIV ≈ 85–96% of offsets). IPM cost-of-illness range
                $3,957–$15,601 (update pending); prior point estimate ${Math.round(defaultHivCost).toLocaleString()}.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-8">$3.5k</span>
                <input
                  type="range" min={3500} max={18000} step={250}
                  value={hivCostAverted}
                  onChange={(e) => setHivCostAverted(Number(e.target.value))}
                  className="flex-1 accent-brand-teal cursor-pointer"
                />
                <span className="text-xs text-gray-400 w-9">$18k</span>
                <div className="bg-brand-teal text-white rounded-lg px-3 py-1 min-w-[64px] text-center">
                  <span className="font-serif font-bold text-base">${(hivCostAverted / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>

            {!channelMode && (<>
            {/* MTZ cost averted per course slider */}
            <div className="bg-brand-grayLight rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                BV treatment (MTZ) cost averted per course
              </p>
              <p className="text-xs text-gray-400 font-sans mb-3">
                LBP reduces BV recurrence → fewer future metronidazole courses. $0 = excluded (default).
                Use drug-only (~$2) or full care episode (~$25).
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">$0</span>
                <input
                  type="range" min={0} max={50} step={1}
                  value={mtzCost}
                  onChange={(e) => setMtzCost(Number(e.target.value))}
                  className="flex-1 accent-brand-teal cursor-pointer"
                />
                <span className="text-xs text-gray-400 w-7">$50</span>
                <div className="bg-brand-teal text-white rounded-lg px-3 py-1 min-w-[56px] text-center">
                  <span className="font-serif font-bold text-base">${mtzCost}</span>
                </div>
              </div>
            </div>

            {/* Discount rate slider */}
            <div className="bg-brand-grayLight rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Discount rate (model-derived flows)
              </p>
              <p className="text-xs text-gray-400 font-sans mb-3">
                Applied to the sensitivity tornado (costs &amp; DALYs, base year 2035). 0% = undiscounted (default).
                Headline grid uses IPM totals as provided.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">0%</span>
                <input
                  type="range" min={0} max={8} step={0.5}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="flex-1 accent-brand-blue cursor-pointer"
                />
                <span className="text-xs text-gray-400 w-7">8%</span>
                <div className="bg-brand-blue text-white rounded-lg px-3 py-1 min-w-[56px] text-center">
                  <span className="font-serif font-bold text-base">{discountPct}%</span>
                </div>
              </div>
            </div>
            </>)}
          </div>

          {/* Color key */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-sans mb-5">
            <span className="text-gray-500">ICER legend:</span>
            {[
              { bg: '#dcfce7', text: '#15803d', label: 'Cost savings (HSCA > program cost)' },
              { bg: '#eff6ff', text: '#1d4ed8', label: 'Incremental cost per DALY averted' },
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

          <IcerGrid sorted={sorted} costPerCourse={costPerCourse} hivCostRatio={hivCostRatio} mtzCost={effMtzCost} popMtzById={popMtzById} />
        </div>

        {/* ICER drivers: efficacy & durability */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
            ICER drivers: efficacy &amp; durability
          </h3>
          <p className="text-xs text-gray-400 font-sans mb-4">
            How the incremental cost per DALY responds to product efficacy and duration of effect,
            at ${costPerCourse}/course. Lower is better: values on or below the green line (≤ $0) are
            cost-saving. Durability is the dominant lever — longer duration drives ICERs down sharply
            as HIV benefit (and the associated cost offset) accrues.
          </p>
          <IcerDriversChart scenarios={sorted} costPerCourse={costPerCourse} hivCostRatio={hivCostRatio} mtzCost={effMtzCost} popMtzById={popMtzById} />
        </div>

        {/* ICER drivers: sensitivity parameters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h3 className="font-serif font-semibold text-brand-blue text-base mb-1">
            ICER drivers: sensitivity parameters
          </h3>
          <p className="text-xs text-gray-400 font-sans mb-4">
            ICER for each sensitivity scenario at ${costPerCourse}/course, relative to the reference
            (80% efficacy, 12-month duration, dashed line). Bars left of the green line are cost-saving.
            Durability (&ldquo;low LBP fitness&rdquo;) and efficacy in MTZ non-responders are the strongest
            drivers. ICERs here are derived from model-averted HIV/PTB counts and each scenario&rsquo;s LBP
            volume, applying the per-case DALY and cost-offset assumptions above — computed consistently
            across scenarios for comparison, so absolute values may differ from the headline grid.
            When set, the MTZ offset and discount rate apply here (base year 2035). The two non-BV VDS
            scenarios omit the MTZ offset — their model outputs lack a VDS-matched no-LBP baseline, so
            MTZ averted can&rsquo;t be computed reliably.
          </p>
          <IcerTornado
            sensitivityScenarios={sensitivityScenarios}
            assumptions={assumptions}
            costPerCourse={costPerCourse}
            hivCostAverted={hivCostAverted}
            mtzCost={effMtzCost}
            discountRate={discountRate}
          />
        </div>
      </div>
    </section>
  );
}
