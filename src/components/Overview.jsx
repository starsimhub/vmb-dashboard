import React from 'react';

export default function Overview() {
  return (
    <section id="overview" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Label */}
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-4">
            Study overview
          </p>

          {/* Title */}
          <h1 className="font-serif text-4xl font-semibold text-brand-blue leading-tight mb-4">
            Population impact of vaginal microbiome interventions on HIV incidence and preterm birth
          </h1>

          {/* Authors / institution */}
          <p className="text-sm text-gray-500 mb-8 font-sans">
            Jamie Cohen, Lillian Dillard &nbsp;·&nbsp; Institute for Disease Modeling &nbsp;·&nbsp;
            <a href="[MANUSCRIPT_URL]" className="text-brand-teal hover:underline">
              Preprint
            </a>
            &nbsp;·&nbsp;
            <a href="[APPENDIX_URL]" className="text-brand-teal hover:underline">
              Supplementary appendix
            </a>
            &nbsp;·&nbsp;
            <a href="https://github.com/starsimhub/vmb_gr_2026q1" className="text-brand-teal hover:underline">
              Code
            </a>
          </p>

          {/* Abstract-style paragraphs */}
          <div className="space-y-5 text-gray-700 leading-relaxed text-base font-sans">
            <p>
              Bacterial vaginosis (BV) — characterized by displacement of protective{' '}
              <em>Lactobacillus</em>-dominant vaginal microbiome states — affects up to 50% of women of
              reproductive age in sub-Saharan Africa and is an established co-factor for both HIV
              acquisition and spontaneous preterm birth (PTB). Despite this dual burden, the
              population-level impact of interventions that restore a{' '}
              <em>Lactobacillus crispatus</em>-dominant community state type (CST I) has not been
              systematically quantified across intervention modalities, product characteristics, and
              deployment strategies.
            </p>

            <p>
              We developed an agent-based model (ABM) using the Starsim framework, calibrated to a
              cohort of 100,000 women of reproductive age in a high-burden setting. The model
              integrates BV natural history — including dynamic transitions among community state
              types — with HIV transmission dynamics, sexual behavior networks, and a pregnancy
              module capturing gestational age at birth. We parameterized 2,400 intervention
              scenarios spanning two product classes (live biotherapeutic products [LBPs] and
              antibiotics), four efficacy levels, five treatment durations, five CST I establishment
              rates, four coverage levels, and three target populations.
            </p>

            <p>
              Across scenarios, CST I establishment rate — the probability that an individual
              achieves durable <em>Lactobacillus crispatus</em> colonization following treatment —
              was the strongest single predictor of both HIV infections averted and PTBs averted
              over 20 years. Product duration primarily governed HIV impact (products of 3 months
              afforded minimal population benefit; 18–24 months were needed for large effects),
              while per-treatment efficacy was the dominant driver of PTB reduction. These findings
              suggest that the field requires distinct product targets for HIV prevention versus PTB
              prevention, and that population-level benefit is achievable only with high coverage
              in combination with durable microbiome restoration. This dashboard allows interactive
              exploration of all 2,400 modeled scenarios.
            </p>
          </div>

          {/* Quick-stat callouts */}
          <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
            {[
              { value: '2,400', label: 'Scenarios modeled' },
              { value: '20-year', label: 'Primary time horizon' },
              { value: '100k', label: 'Agent population' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl font-semibold text-brand-blue">{stat.value}</p>
                <p className="text-xs text-gray-500 font-sans mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
