import React, { useMemo } from 'react';
import { useVersion } from '../contexts/VersionContext.jsx';

// ---------------------------------------------------------------------------
// Findings are derived at render time from the active version's
// population_scenarios.json and rct_endpoints.json, so the numbers always
// match the selected data version (e.g. permanence vs no-permanence).
// ---------------------------------------------------------------------------

const ICONS = [
  (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M17 4.5V3M17 9.5V11M14.5 7H13M19.5 7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
];

const PERIOD = '2035–2050';

function commas(n) {
  return n === null || n === undefined || isNaN(n) ? '—' : Math.round(n).toLocaleString();
}
function kfmt(n) {
  return n === null || n === undefined || isNaN(n) ? '—' : `~${Math.round(n / 1000)}k`;
}

function buildFindings(pop, rct) {
  const pget = (eff, dur) =>
    pop.find((s) => !s.is_baseline && s.efficacy_pct === eff && s.duration_months === dur);
  const cget = (eff, dur) =>
    rct.find((r) => r.efficacy_pct === eff && r.duration_months === dur)?.cst1_6m_median;

  const ref  = pget(80, 12);   // reference: 80% eff, 12m
  const best = pget(80, 18);   // best case: 80% eff, 18m
  const low  = pget(80, 6);    // 80% eff, 6m
  const e50  = pget(50, 12);   // 50% eff, 12m
  if (!ref || !best || !low || !e50) return null;

  const ratio18v6 = best.hiv_averted_median / low.hiv_averted_median; // duration effect
  const effRatio  = ref.hiv_averted_median / e50.hiv_averted_median;  // efficacy effect
  const cstRef = cget(80, 12);   // CST I at 6m, reference
  const cstLow = cget(50, 6);    // CST I at 6m, 50%/6m

  return [
    {
      icon: ICONS[0],
      number: '01',
      headline: 'Duration drives HIV impact',
      summary:
        `Products with 18-month duration of protection avert ~${ratio18v6.toFixed(1)}× more HIV infections ` +
        `than 6-month products at the same 80% efficacy (${commas(best.hiv_averted_median)} vs ` +
        `${commas(low.hiv_averted_median)} infections averted, ${PERIOD}). Products with shorter durations ` +
        `disproportionately limit network-level transmission reduction.`,
      stat: `~${ratio18v6.toFixed(1)}× more HIV averted`,
      statLabel: '18m vs 6m at 80% efficacy',
      color: 'blue',
    },
    {
      icon: ICONS[1],
      number: '02',
      headline: 'Efficacy drives outcomes',
      summary:
        `The 80% efficacy, 12-month reference scenario averts ${commas(ref.hiv_averted_median)} HIV infections ` +
        `(${ref.hiv_pct_median}% of projected total) and ${commas(ref.ptb_averted_median)} preterm births ` +
        `(${ref.ptb_pct_median}%) over ${PERIOD}, compared to ${commas(e50.hiv_averted_median)} HIV ` +
        `(${e50.hiv_pct_median}%) and ${commas(e50.ptb_averted_median)} PTB (${e50.ptb_pct_median}%) for 50% ` +
        `efficacy at the same duration. Higher-efficacy products deliver ~${effRatio.toFixed(1)}× the HIV impact.`,
      stat: `${ref.hiv_pct_median}% HIV reduction`,
      statLabel: 'at 80% efficacy, 12m (reference)',
      color: 'teal',
    },
    {
      icon: ICONS[2],
      number: '03',
      headline: 'CST I is the key predictor',
      summary:
        `Durable Lactobacillus crispatus colonization (CST I) at 6 months reaches ${cstRef ?? '—'}% for the ` +
        `80% efficacy, 12-month product, compared to only ${cstLow ?? '—'}% for the 50% efficacy, 6-month ` +
        `product. Across all modeled scenarios, CST I establishment rate is the strongest single predictor of ` +
        `both HIV and preterm birth averted.`,
      stat: `${cstRef ?? '—'}% CST I`,
      statLabel: 'at 6m for 80% eff, 12m product',
      color: 'gold',
    },
    {
      icon: ICONS[3],
      number: '04',
      headline: 'Both outcomes are achievable together',
      summary:
        `The reference scenario (80% efficacy, 12-month duration) simultaneously averts ` +
        `${commas(ref.hiv_averted_median)} HIV infections and ${commas(ref.ptb_averted_median)} preterm births ` +
        `over ${PERIOD}. The best-case scenario (80% eff, 18m) reaches ${commas(best.hiv_averted_median)} HIV ` +
        `and ${commas(best.ptb_averted_median)} PTB averted — demonstrating that co-benefits across both ` +
        `outcomes are robust to scenario assumptions.`,
      stat: `${kfmt(ref.hiv_averted_median)} + ${kfmt(ref.ptb_averted_median)}`,
      statLabel: `HIV + PTB averted (reference, ${PERIOD})`,
      color: 'teal',
    },
  ];
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-brand-blue', border: 'border-blue-100', number: 'text-blue-200', stat: 'text-brand-blue' },
  teal: { bg: 'bg-teal-50', icon: 'text-brand-teal', border: 'border-teal-100', number: 'text-teal-200', stat: 'text-brand-teal' },
  gold: { bg: 'bg-amber-50', icon: 'text-brand-gold', border: 'border-amber-100', number: 'text-amber-200', stat: 'text-brand-gold' },
};

export default function KeyFindings() {
  const { populationScenarios, rctEndpoints } = useVersion();
  const findings = useMemo(
    () => buildFindings(populationScenarios || [], rctEndpoints || []),
    [populationScenarios, rctEndpoints]
  );

  if (!findings) return null;

  return (
    <section id="findings" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">
            Key findings
          </p>
          <h2 className="section-heading">What the model tells us</h2>
          <p className="section-subheading max-w-2xl">
            Four robust findings emerge from the modeled scenarios, grounded in real model outputs
            for {PERIOD}.
          </p>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {findings.map((finding) => {
            const c = colorMap[finding.color];
            return (
              <div
                key={finding.number}
                className={`rounded-2xl border ${c.border} ${c.bg} p-6 relative overflow-hidden`}
              >
                {/* Large background number */}
                <span
                  className={`absolute top-3 right-4 font-serif font-bold text-6xl select-none pointer-events-none ${c.number}`}
                  aria-hidden="true"
                >
                  {finding.number}
                </span>

                {/* Icon */}
                <div className={`${c.icon} mb-4`}>{finding.icon}</div>

                {/* Headline */}
                <h3 className="font-serif font-semibold text-xl text-gray-900 mb-2 leading-snug">
                  {finding.headline}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-600 font-sans leading-relaxed mb-4">
                  {finding.summary}
                </p>

                {/* Stat callout */}
                <div className="flex items-baseline gap-2 pt-3 border-t border-white border-opacity-60">
                  <span className={`font-serif font-bold text-lg ${c.stat}`}>
                    {finding.stat}
                  </span>
                  <span className="text-xs text-gray-500 font-sans">{finding.statLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
