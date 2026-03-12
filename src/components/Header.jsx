import React, { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Overview',     href: '#overview' },
  { label: 'RCT endpoints', href: '#rct' },
  { label: 'Explorer',     href: '#explorer' },
  { label: 'Sensitivity',  href: '#sensitivity' },
  { label: 'Cost-effectiveness', href: '#ce' },
  { label: 'Key findings', href: '#findings' },
  { label: 'Methods',     href: '#methods' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-header' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: title */}
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center">
              <img src="/IDMicon.png" alt="VMB Logo"/>
            </div>
            <div>
              <span className="font-serif font-semibold text-brand-blue text-base leading-tight hidden sm:block">
                VMB Modeling Study
              </span>
              <span className="font-serif font-semibold text-brand-blue text-sm leading-tight sm:hidden">
                VMB Dashboard
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1.5 rounded text-gray-500 hover:text-brand-blue hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <nav className="md:hidden border-t border-gray-100 py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-2 py-2 text-sm text-gray-700 hover:text-brand-blue"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
