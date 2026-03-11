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
            <a href="/VMB_MANUSCRIPT_DRAFT_v2.pdf" className="text-brand-teal hover:underline">
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
              Bacterial vaginosis — a disruption of the vaginal microbiome affecting up to 50% of
              women of reproductive age in sub-Saharan Africa — is independently associated with
              increased risk of both HIV acquisition and spontaneous preterm birth. A new class of
              live biotherapeutic products (LBPs) aims to restore a protective,{' '}
              <em>Lactobacillus crispatus</em>–dominant vaginal microbiome (known as Community State
              Type I, or CST I), but critical questions remain about what product characteristics
              would be needed to deliver meaningful population-level health impact, and how clinical
              trial endpoints should be defined to capture that potential.
            </p>

            <p>
              This study uses a population-level agent-based model built in the Starsim framework
              to simulate the introduction of vaginal microbiome interventions among women aged
              15–49 in South Africa. The model integrates BV natural history, HIV transmission
              dynamics, and pregnancy and birth outcomes to project the health impact of
              hypothetical LBPs across a range of product profiles — varying in efficacy, duration
              of effect, and probability of durable CST I establishment. Rather than evaluating a
              single product candidate, the model maps the landscape of product characteristics to
              population outcomes, identifying the minimum viable product profiles for HIV
              prevention, preterm birth reduction, and combined impact.
            </p>

            <p>
              A central finding is that the pathways to HIV prevention and preterm birth prevention
              diverge sharply in what they require of a product. Reducing population-level HIV
              incidence demands a long-acting intervention — products with fewer than 12 months of
              sustained effect show minimal impact on HIV regardless of their efficacy against BV
              recurrence. In contrast, preterm birth reduction is driven primarily by efficacy:
              even a short-acting product administered during pregnancy can meaningfully reduce
              preterm births if it is effective at resolving BV. Across both outcomes, the single
              strongest predictor of population health impact is the probability of durable CST I
              establishment — the restoration of a stable,{' '}
              <em>Lactobacillus crispatus</em>–dominant microbiome that persists after treatment
              ends. This finding provided quantitative support for a strategic decision to reframe
              the primary clinical trial endpoint from BV recurrence reduction to durable
              microbiome cure anchored on CST I.
            </p>

            <p>
              This dashboard presents the full scenario results interactively, allowing users to
              explore how different product profiles translate to projected health outcomes and
              cost-effectiveness estimates across time horizons.
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
