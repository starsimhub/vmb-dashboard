import React, { useState, useRef, useEffect } from 'react';
import { useVersion } from '../contexts/VersionContext.jsx';

export default function VersionSelector() {
  const { versions, versionId, versionInfo, setVersionId } = useVersion();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Don't render if only one version
  if (versions.length <= 1) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-brand-teal text-xs font-sans text-gray-600 hover:text-brand-teal transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span>{versionInfo.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Results version</p>
          </div>
          {versions.map((v) => {
            const isActive = v.id === versionId;
            return (
              <button
                key={v.id}
                onClick={() => { setVersionId(v.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${isActive ? 'bg-brand-grayLight' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-sans ${isActive ? 'font-semibold text-brand-teal' : 'text-gray-700'}`}>
                    {v.label}
                  </span>
                  <span className="text-xs text-gray-400 font-sans">{v.date}</span>
                </div>
                {v.description && (
                  <p className="text-xs text-gray-500 font-sans mt-0.5 leading-snug">{v.description}</p>
                )}
                {isActive && (
                  <span className="text-xs text-brand-teal font-sans mt-0.5 inline-block">Currently viewing</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
