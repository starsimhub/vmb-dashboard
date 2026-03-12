import React, { useState } from 'react';

const ACCORDION_SECTIONS = [
  {
    id: 'daly-attribution',
    title: 'DALY attribution',
    content: (
      <div className="space-y-5 text-sm text-gray-600 font-sans leading-relaxed">
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Source: Gates Foundation / IPM cost-effectiveness analysis, March 2026 (preliminary).
          Analysis period 2026–2050, South Africa only.
        </p>

        {/* HIV */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">HIV infections averted</h4>
          <p className="mb-2">
            A conservative estimate of <strong>15 DALYs per HIV infection averted</strong> was
            used, informed by IHME Global Burden of Disease 2023 data filtered to South Africa
            (GBD 2023 estimate: ~17 DALYs/case). The WHO Global Health Observatory suggests
            approximately 30 DALYs/case globally (crude approximation); the GBD South Africa
            figure is more appropriate given high ART coverage in this setting.
          </p>
          <p className="mb-3">
            IHME disability weights for HIV: symptomatic HIV (DW&nbsp;=&nbsp;0.274), AIDS with
            ARVs (DW&nbsp;=&nbsp;0.078), AIDS without ARVs (DW&nbsp;=&nbsp;0.582). HIV treatment
            coverage was derived from UNAIDS 2025 country reports (adult ART coverage: 79%).
          </p>
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">Source</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-700 border border-gray-200">DALYs/case (South Africa)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['IHME GBD 2023', '~17'],
                  ['WHO Global Health Observatory (global)', '~30'],
                  ['This analysis (conservative)', '15'],
                ].map(([src, val]) => (
                  <tr key={src}>
                    <td className="px-3 py-1.5 border border-gray-200 text-gray-600">{src}</td>
                    <td className="px-3 py-1.5 border border-gray-200 text-gray-700 text-right font-medium">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PTB */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Preterm births averted</h4>
          <p className="mb-2">
            <strong>2.74 DALYs per preterm birth averted</strong> was applied, derived from
            IHME GBD 2023 data for South Africa. DALY attribution is limited to the IHME
            assessment of preterm birth DALYs per case because gestational age data are not
            available in the model; this method is consistent with MNCHN and other foundation
            valuations including PTB.
          </p>
          <p className="text-xs text-gray-400 italic">
            Note: new IHME Future Health Scenarios data and methods are anticipated to enable
            trend-based incidence-per-case estimates in future analyses.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'costing',
    title: 'Health system costs averted & product costing',
    content: (
      <div className="space-y-5 text-sm text-gray-600 font-sans leading-relaxed">
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Preliminary results. PTB costing inputs are subject to revision pending the UW START
          systematic literature review (expected completion within 1 month of March 2026).
        </p>

        {/* HIV HSCA */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">HIV: health system costs averted</h4>
          <p className="mb-3">
            Lifetime health system costs averted per HIV infection prevented were estimated from
            MIHPSA costing data (provided by Avenir Health). ART was assumed to represent{' '}
            <strong>43% of total yearly costs per person living with HIV</strong> (Gutierrez et
            al., <em>Lancet</em>, 2004). Treatment duration assumptions: 30 years for adult
            infections, 15 years for paediatric cases averted, and 10 years for cases in persons
            aged 50+. Costs were adjusted for treatment coverage from UNAIDS 2025 country reports.
          </p>
          <div className="overflow-x-auto mb-2">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">Parameter</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-700 border border-gray-200">South Africa</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Yearly adult ART cost', '$215.40'],
                  ['Yearly paediatric ART cost', '$236.70'],
                  ['Adult ART coverage', '79%'],
                  ['Paediatric ART coverage', '67%'],
                  ['Lifetime HSCA per adult HIV case averted', '$11,872'],
                  ['Lifetime HSCA per paediatric HIV case averted', '$15,601'],
                  ['Lifetime HSCA per HIV case averted (age 50+)', '$3,957'],
                ].map(([param, val]) => (
                  <tr key={param}>
                    <td className="px-3 py-1.5 border border-gray-200 text-gray-600">{param}</td>
                    <td className="px-3 py-1.5 border border-gray-200 text-gray-700 text-right font-medium tabular-nums">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400">
            HSCA associated with HIV treatment and care include costs beyond ART alone (testing
            and counselling, OI prophylaxis, OI treatment, ART monitoring, universal precautions,
            support activities, palliative care, other programme costs). ART represents ~43% of
            the total in this decomposition.
          </p>
        </div>

        {/* PTB HSCA */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Preterm birth: health system costs averted</h4>
          <p className="mb-2">
            A cost of <strong>$447.68 per preterm birth averted</strong> (preliminary) was applied,
            derived from a South African cost-effectiveness analysis of a pregnancy support grant
            (Moolla et al., <em>PLOS Global Public Health</em>, 2024). Costs were converted to USD
            and adjusted for inflation. This estimate is under review: the Gates Foundation is
            funding a UW START systematic literature review of preterm birth direct medical costs
            for sub-Saharan Africa that will serve as the reference standard.
          </p>
          <p className="text-xs text-gray-500 mb-1">
            For context, a 2020 systematic review (Mori et al., <em>Health Econ Rev</em>) reported
            health system costs for preterm/LBW care in Ghana, Mozambique, and Nigeria of
            approximately $514 (2018 USD) = $542 (2021 USD), consistent with the current estimate.
          </p>
          <p className="text-xs text-gray-400">
            Reference: Moolla A, Mdewa W, Erzse A, Hofman K, Thsehla E, et al. (2024). A
            cost-effectiveness analysis of a South African pregnancy support grant.{' '}
            <em>PLOS Global Public Health</em> 4(2): e0002781.
          </p>
        </div>

        {/* Product costing */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">LBP product costing assumptions</h4>
          <p className="mb-3">
            Due to high uncertainty in costing assumptions, a wide range of fully loaded costs
            (COGs + presentation/manufacturing + delivery) from $10–$40 per course were evaluated
            in the ICER analysis. Key reference points:
          </p>
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">Component</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-700 border border-gray-200">Estimate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Procurement cost (TPP v2.0 target)', '$6/course'],
                  ['Cold chain cost per course', '~$0.10–$0.38'],
                  ['Delivery cost (VDS/syndromic pathway)', 'Unknown'],
                  ['Delivery cost (ANC pathway)', 'Unknown'],
                  ['Additional diagnostic (Nugent/microscopy)', '$3.50 ($6.10 incl. overhead)'],
                  ['Product introduction year', '2035'],
                  ['Scale-up period', '5 years'],
                  ['Peak treatment/prevention ratio (PTR S)', '0.1'],
                ].map(([comp, est]) => (
                  <tr key={comp}>
                    <td className="px-3 py-1.5 border border-gray-200 text-gray-600">{comp}</td>
                    <td className="px-3 py-1.5 border border-gray-200 text-gray-700 text-right">{est}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Diagnostic cost reference: Frontiers in Public Health (2023). Cold chain reference:
            Heroza / Fraser-Edoka, <em>Influenza &amp; Resp Viruses</em> (2022).
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'starsim',
    title: 'Starsim framework overview',
    content: (
      <div className="space-y-3 text-sm text-gray-600 font-sans leading-relaxed">
        <p>
          All simulations were implemented in{' '}
          <a
            href="https://github.com/starsimhub/starsim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-teal hover:underline"
          >
            Starsim
          </a>{' '}
          (v3.x), an open-source Python framework for agent-based modeling of disease spread via
          dynamic transmission networks. Starsim uses Numba-accelerated random number generation,
          supports co-transmission of multiple pathogens, and provides modular components for
          networks, diseases, demographics, and interventions.
        </p>
        <p>
          The framework's modular architecture allowed us to combine a BV natural history module
          (managing CST state transitions), an HIV transmission module, a pregnancy module tracking
          gestational age, and an intervention module representing product deployment — all within a
          single coherent simulation loop.
        </p>
        <p>
          Stochastic uncertainty was characterized by running each scenario 100 times with
          different random seeds. Reported uncertainty intervals represent the 2.5th–97.5th
          percentile of outcomes across replicate runs.
        </p>
      </div>
    ),
  },
  {
    id: 'model-structure',
    title: 'Model structure',
    content: (
      <div className="space-y-4 text-sm text-gray-600 font-sans leading-relaxed">
        <div>
          <h4 className="font-semibold text-gray-800 mb-1.5">Agents</h4>
          <p>
            Each simulation initializes 100,000 female agents of reproductive age (15–49 years),
            with age-stratified HIV prevalence, BV prevalence, and pregnancy rates drawn from
            calibration data. Male agents are represented implicitly through a partnership network
            that transmits HIV risk.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-1.5">BV natural history</h4>
          <p>
            Vaginal microbiome state is represented as one of five community state types (CST I–V),
            with empirically calibrated monthly transition probabilities. CST IV (
            <em>Gardnerella</em>-dominant, dysbiotic) is the primary BV state. CST I (
            <em>L. crispatus</em>-dominant) is the protective state. Transition rates are modified by
            sexual behavior, menstruation, and antibiotic use. Intervention products modify the CST
            IV → CST I transition probability.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-1.5">HIV transmission</h4>
          <p>
            Per-act HIV transmission probability is stratified by CST state, with CST IV associated
            with a 1.8-fold increase relative to CST I (based on meta-analytic estimates). The
            sexual contact network uses a dynamic pair-formation model with empirically calibrated
            partnership rates and duration distributions.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-1.5">Pregnancy and PTB</h4>
          <p>
            Agents become pregnant at an empirically calibrated monthly rate. Gestational age at
            birth is drawn from a mixed-effects model conditioned on CST state during pregnancy.
            BV / CST IV during the second trimester carries a 1.6-fold elevated PTB risk (OR from
            meta-analysis). Intervention products reduce PTB risk by shifting CST state prior to or
            during early pregnancy.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-1.5">Care-seeking and intervention delivery</h4>
          <p>
            In the reference scenario, LBP is delivered through a symptom-driven care-seeking
            pathway. Women with vaginal symptoms seek care at an assumed rate of{' '}
            <strong>20% per symptomatic episode</strong>. At each care-seeking encounter, women
            presenting with BV (CST IV) are eligible to receive the LBP. This care-seeking rate
            is applied uniformly across the modeled population and represents the primary delivery
            channel in all base-case and efficacy × duration scenarios. Sensitivity scenarios also
            explore asymptomatic prenatal screening as an additional pathway.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'calibration',
    title: 'Calibration data sources',
    content: (
      <div className="space-y-3 text-sm text-gray-600 font-sans leading-relaxed">
        <p>
          The model was calibrated using a multi-objective approach (Starsim's built-in calibration
          framework) targeting the following empirical data sources:
        </p>
        <ul className="space-y-2 ml-4">
          {[
            'HIV incidence and prevalence by age: PHIA household surveys (Kenya, South Africa, Uganda, 2016–2020)',
            'BV prevalence and CST distribution: WISH cohort, CAPRISA cohort, and pooled meta-analysis (Ravel et al. 2011)',
            'CST transition rates: LACTIN-V trial longitudinal microbiome data and unpublished cohort follow-up',
            'HIV–BV risk association: systematic review and meta-analysis (Muzny et al. 2019; Mitchell et al. 2021)',
            'PTB–BV risk association: Cochrane review (Brocklehurst et al. 2013) and PROMISE trial sub-study',
            'Sexual behavior parameters: Population-based surveys (DHS, NATSAL) and published network studies',
            'Pregnancy rates and gestational age distribution: WHO global health estimates, regional hospital registers',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5 flex-shrink-0 opacity-70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="pt-2">
          Calibration targets were matched using approximate Bayesian computation (ABC) with a
          sequential Monte Carlo sampler, retaining parameter sets within the 10th percentile of
          distance to all targets simultaneously. Full calibration diagnostics will be available in the supplementary appendix (forthcoming).
        </p>
      </div>
    ),
  },
];

function AccordionSection({ section, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-serif font-semibold text-brand-blue text-base">
          {section.title}
        </span>
        <span
          className={`flex-shrink-0 w-5 h-5 ml-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
        }}
      >
        <div className="px-6 pb-5">{section.content}</div>
      </div>
    </div>
  );
}

export default function Methods() {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (id) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <section id="methods" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">
            Methodology
          </p>
          <h2 className="section-heading">Model and methods</h2>
          <p className="section-subheading max-w-2xl">
            Technical details on the simulation framework, model structure, calibration data
            sources, DALY attribution, and health system costing assumptions. Click each section
            to expand.
          </p>
        </div>

        <div className="max-w-3xl">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {ACCORDION_SECTIONS.map((section) => (
              <AccordionSection
                key={section.id}
                section={section}
                isOpen={openSection === section.id}
                onToggle={() => toggle(section.id)}
              />
            ))}
          </div>

          {/* Citation note */}
          <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              <span className="font-semibold text-gray-700">Cite this work:</span>{' '}
              Cohen J, Dillard L, et al. "Population impact of vaginal microbiome interventions on HIV
              incidence and preterm birth: an agent-based modeling study." <em>Manuscript in preparation</em>, 2026.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
