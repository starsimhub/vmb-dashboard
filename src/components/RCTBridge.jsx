import React from 'react';

const FLOW_BOXES = [
  {
    id: 'rct',
    title: 'RCT inputs',
    color: 'blue',
    bullets: [
      'Nugent score / Amsel criteria',
      'CST classification (16S rRNA)',
      'Treatment arm assignment',
      'Gestational age at enrollment',
      'HIV status at baseline',
      'Sexual behavior covariates',
    ],
  },
  {
    id: 'model',
    title: 'Agent-based model',
    color: 'teal',
    bullets: [
      'BV natural history (CST transitions)',
      'Dynamic sexual network',
      'HIV transmission probability',
      'Pregnancy module (PTB risk)',
      'Intervention uptake + adherence',
      'Stochastic simulation (Starsim)',
    ],
  },
  {
    id: 'outcomes',
    title: 'Population outcomes',
    color: 'gold',
    bullets: [
      'HIV infections averted (10y / 20y)',
      'Preterm births averted',
      'DALYs averted',
      'Cost per DALY (ICER)',
      'Uncertainty intervals',
      'Scenario sensitivity',
    ],
  },
];

const PARAM_MAPPING = [
  { rct: 'Nugent score ≥7', model: 'BV_state = "dysbiotic" at baseline' },
  { rct: 'CST classification (16S)', model: 'cst_state ∈ {CST-I, II, III, IV, V}' },
  { rct: 'Treatment duration (days)', model: 'duration_months (converted)' },
  { rct: 'BV recurrence rate (12 wk)', model: 'transition_rate CST-I → CST-IV' },
  { rct: 'CST I persistence (6 mo)', model: 'cst1_establishment_rate' },
  { rct: 'Per-protocol efficacy (%)', model: 'efficacy parameter' },
  { rct: 'HIV incidence (per 100 PY)', model: 'beta_HIV × network exposure' },
  { rct: 'Gestational age at birth', model: 'ptb_flag (< 37 weeks)' },
  { rct: 'Proportion symptomatic BV', model: 'coverage × target_population filter' },
  { rct: 'Adherence / completion rate', model: 'effective_coverage adjustment' },
];

const colorMap = {
  blue: {
    header: 'bg-brand-blue text-white',
    border: 'border-brand-blue',
    bullet: 'bg-brand-blue',
    arrow: 'text-brand-blue',
  },
  teal: {
    header: 'bg-brand-teal text-white',
    border: 'border-brand-teal',
    bullet: 'bg-brand-teal',
    arrow: 'text-brand-teal',
  },
  gold: {
    header: 'bg-brand-gold text-white',
    border: 'border-brand-gold',
    bullet: 'bg-brand-gold',
    arrow: 'text-brand-gold',
  },
};

function ArrowConnector() {
  return (
    <div className="flex-shrink-0 hidden lg:flex items-center justify-center w-12">
      <div className="flex flex-col items-center">
        <div className="w-8 h-0.5 bg-gray-300" />
        <svg
          className="w-4 h-4 text-gray-400 -ml-2"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default function RCTBridge() {
  return (
    <section id="rct-bridge" className="py-16 bg-brand-grayLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">
            Study design
          </p>
          <h2 className="section-heading">Bridging RCT evidence to population modeling</h2>
          <p className="section-subheading max-w-2xl">
            This model translates individual-level trial measurements into population-level
            projections by parameterizing the agent-based model directly from RCT outputs.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0 mb-10">
          {FLOW_BOXES.map((box, idx) => {
            const c = colorMap[box.color];
            return (
              <React.Fragment key={box.id}>
                {idx > 0 && <ArrowConnector />}
                <div className={`flex-1 rounded-2xl border-2 ${c.border} overflow-hidden`}>
                  {/* Header */}
                  <div className={`${c.header} px-5 py-3`}>
                    <h3 className="font-serif font-semibold text-base">{box.title}</h3>
                  </div>
                  {/* Bullets */}
                  <div className="bg-white px-5 py-4">
                    <ul className="space-y-2">
                      {box.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${c.bullet} mt-1.5 flex-shrink-0 opacity-70`}
                          />
                          <span className="text-sm text-gray-600 font-sans leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile arrows for small screens */}
        <div className="lg:hidden flex justify-center mb-6">
          <p className="text-xs text-gray-400 font-sans italic">
            RCT inputs → Agent-based model → Population outcomes
          </p>
        </div>

        {/* Parameter mapping table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-serif font-semibold text-brand-blue text-base">
              RCT parameter → model input mapping
            </h3>
            <p className="text-xs text-gray-500 font-sans mt-1">
              How trial measurements are translated into model parameters.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-1/2">
                    RCT / trial measurement
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-1/2">
                    Model parameter / state variable
                  </th>
                </tr>
              </thead>
              <tbody>
                {PARAM_MAPPING.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-3 text-gray-700 border-r border-gray-100">
                      {row.rct}
                    </td>
                    <td className="px-6 py-3 text-brand-teal font-mono text-xs">
                      {row.model}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
