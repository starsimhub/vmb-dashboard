import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-brand-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-serif font-semibold text-sm">VMB Modeling Study</span>
            </div>
            <p className="text-xs text-blue-200 font-sans leading-relaxed">
              An agent-based modeling study of vaginal microbiome interventions and their
              population-level impact on HIV incidence and preterm birth in sub-Saharan Africa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-300 mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Manuscript (preprint)', href: '[MANUSCRIPT_URL]' },
                { label: 'Supplementary appendix', href: '[APPENDIX_URL]' },
                { label: 'GitHub repository', href: '[GITHUB_URL]' },
                { label: 'Starsim framework', href: 'https://github.com/starsimhub/starsim' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-blue-200 hover:text-white transition-colors font-sans"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-300 mb-3">
              Contact
            </h4>
            <p className="text-sm text-blue-200 font-sans leading-relaxed mb-1">
              [AUTHOR]
            </p>
            <p className="text-sm text-blue-200 font-sans leading-relaxed mb-1">
              [INSTITUTION]
            </p>
            <a
              href="mailto:[CONTACT_EMAIL]"
              className="text-sm text-blue-200 hover:text-white transition-colors font-sans"
            >
              [CONTACT_EMAIL]
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-700 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-blue-300 font-sans">
              © [YEAR] [INSTITUTION]. All rights reserved.
            </p>
            <p className="text-xs text-blue-300 font-sans">
              Built with{' '}
              <a
                href="https://github.com/starsimhub/starsim"
                className="text-blue-200 hover:text-white"
              >
                Starsim
              </a>
              {' '}·{' '}
              <a
                href="https://react.dev"
                className="text-blue-200 hover:text-white"
              >
                React
              </a>
              {' '}·{' '}
              <a
                href="https://recharts.org"
                className="text-blue-200 hover:text-white"
              >
                Recharts
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
