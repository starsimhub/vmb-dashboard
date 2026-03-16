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
            Vaginal microbiome therapies could curb HIV and preterm births — an IDM and IPM model
          </h1>

          {/* Authors / institution */}
          <p className="text-sm text-gray-500 mb-8 font-sans">
            Jamie Cohen, Lauren Snyder, Lillian Dillard &nbsp;·&nbsp; Institute for Disease Modeling &nbsp;·&nbsp;
            <a href="/VMB_MANUSCRIPT_DRAFT_v2.pdf" className="text-brand-teal hover:underline">
              Preprint
            </a>
            &nbsp;·&nbsp;
            <a href="https://github.com/starsimhub/vmb_gr_2026q1" className="text-brand-teal hover:underline">
              Code
            </a>
          </p>

          {/* Abstract-style paragraphs */}
          <div className="space-y-5 text-gray-700 leading-relaxed text-base font-sans">
            <p>
              Bacterial vaginosis (BV) — a disruption of the vaginal microbiome that affects up to
              half of women of reproductive age in sub-Saharan Africa — has been independently
              linked to a heightened risk of HIV infection and spontaneous preterm birth. Now,
              researchers at the Institute for Disease Modeling (IDM) and IPM report new modeling results
              that suggest a next generation of vaginal microbiome therapies could significantly
              reduce both.
            </p>

            <p>
              The therapies, known as live biotherapeutic products (LBPs), are designed to restore
              a protective vaginal microbiome dominated by <em>Lactobacillus crispatus</em>,
              referred to as Community State Type I (CST I). While early clinical research has
              shown promise, major questions have remained about what product characteristics would
              be necessary to achieve meaningful impact at scale — and how clinical trials should
              define success.
            </p>

            <p>
              To answer those questions, IDM scientists developed a population-level agent-based
              model using the Starsim framework to simulate the introduction of vaginal microbiome
              interventions among South African women aged 15 to 49. The model integrates the
              natural history of BV, HIV transmission dynamics, and pregnancy and birth outcomes,
              allowing researchers to test a wide range of hypothetical product profiles.
            </p>

            <p>
              Rather than evaluating a single product candidate, the team mapped how variations in
              the probability and duration of establishing CST I translate into population-level
              outcomes. The objective was to identify the minimum viable product profiles needed to
              reduce HIV incidence, lower preterm birth rates, or achieve both.
            </p>

            <p>
              The findings show that the requirements for preventing HIV and preventing preterm
              birth differ sharply. To reduce HIV incidence at the population level, durability is
              critical — products that provide less than 12 months of sustained effect produce
              minimal impact on HIV transmission, regardless of how effectively they prevent BV
              recurrence in the short term. In contrast, reducing preterm birth depends primarily
              on efficacy: even a short-acting product administered during pregnancy can
              meaningfully lower preterm birth rates if it effectively resolves BV during that
              window.
            </p>

            <p>
              Across both outcomes, the single strongest predictor of impact was the probability of
              durable CST I establishment — the successful restoration of a stable,{' '}
              <em>Lactobacillus crispatus</em>–dominant microbiome that persists after treatment
              ends.
            </p>

            <p>
              The modeling results have already shaped research strategy. Based on the findings,
              investigators have shifted the primary endpoint of planned clinical trials from simply
              reducing BV recurrence to demonstrating a durable microbiome "cure" anchored in
              sustained CST I dominance — a measure more closely aligned with long-term public
              health impact.
            </p>
          </div>

          {/* Quick-stat callouts */}
          <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
            {[
              { value: 'South Africa', label: 'Modeled setting' },
              { value: '15-year', label: 'Primary time horizon (2035–2050)' },
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
