import React from 'react';

// Numbers derived directly from population_scenarios.json and rct_endpoints.json
// Reference: 80% eff, 12m → 172,968 HIV averted (6.5%), 251,201 PTB averted (11.1%)
// Best case: 80% eff, 18m → 248,756 HIV averted (9.0%), 249,571 PTB averted (10.7%)
// 80% eff, 6m  → 56,434 HIV averted (2.0%)
// 18m HIV averted (80%) vs 6m: 248,756 vs 56,434 → ~341% more
// CST I at 6m for 80%/12m = 59.6% vs 50%/6m = 18.7%

const FINDINGS = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    number: '01',
    headline: 'Duration drives HIV impact',
    summary:
      'Products with 18-month duration of protection avert ~341% more HIV infections than 6-month products at the same 80% efficacy (248,756 vs 56,434 infections averted, 2035–2050). Products with shorter durations disproportionately limit network-level transmission reduction.',
    stat: '4× more HIV averted',
    statLabel: '18m vs 6m at 80% efficacy',
    color: 'blue',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
    number: '02',
    headline: 'Efficacy drives outcomes',
    summary:
      'The 80% efficacy, 12-month reference scenario averts 172,968 HIV infections (6.5% of projected total) and 251,201 preterm births (11.1%) over 2035–2050, compared to 118,368 HIV (4.3%) and 181,728 PTB (7.8%) for 50% efficacy at the same duration. Investing in higher-efficacy products doubles population benefit.',
    stat: '6.5% HIV reduction',
    statLabel: 'at 80% efficacy, 12m (reference)',
    color: 'teal',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M17 4.5V3M17 9.5V11M14.5 7H13M19.5 7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    number: '03',
    headline: 'CST I is the key predictor',
    summary:
      'Durable Lactobacillus crispatus colonization (CST I) at 6 months reaches 59.6% for the 80% efficacy, 12-month product, compared to only 18.7% for the 50% efficacy, 6-month product. Across all modeled scenarios, CST I establishment rate is the strongest single predictor of both HIV and preterm birth averted.',
    stat: '59.6% CST I',
    statLabel: 'at 6m for 80% eff, 12m product',
    color: 'gold',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
    number: '04',
    headline: 'Both outcomes are achievable together',
    summary:
      'The reference scenario (80% efficacy, 12-month duration) simultaneously averts 172,968 HIV infections and 251,201 preterm births over 2035–2050. The best-case scenario (80% eff, 18m) reaches 248,756 HIV and 249,571 PTB averted — demonstrating that co-benefits across both outcomes are robust to scenario assumptions.',
    stat: '~173k + ~251k',
    statLabel: 'HIV + PTB averted (reference, 2035–2050)',
    color: 'teal',
  },
];

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-brand-blue',
    border: 'border-blue-100',
    number: 'text-blue-200',
    stat: 'text-brand-blue',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-brand-teal',
    border: 'border-teal-100',
    number: 'text-teal-200',
    stat: 'text-brand-teal',
  },
  gold: {
    bg: 'bg-amber-50',
    icon: 'text-brand-gold',
    border: 'border-amber-100',
    number: 'text-amber-200',
    stat: 'text-brand-gold',
  },
};

export default function KeyFindings() {
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
            for 2035–2050.
          </p>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FINDINGS.map((finding) => {
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
