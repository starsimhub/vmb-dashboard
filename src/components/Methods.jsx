import React, { useState } from 'react';

const ACCORDION_SECTIONS = [
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
          distance to all targets simultaneously. Full calibration diagnostics are available in the{' '}
          <a href="[APPENDIX_URL]" className="text-brand-teal hover:underline">
            supplementary appendix
          </a>
          .
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
            Technical details on the simulation framework, model structure, and calibration data
            sources. Click each section to expand.
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
              [AUTHOR] et al. "Population impact of vaginal microbiome interventions on HIV
              incidence and preterm birth: an agent-based modeling study." <em>[Journal]</em>, [Year].
              DOI: [MANUSCRIPT_URL]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
