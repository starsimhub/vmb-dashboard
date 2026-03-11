/**
 * dataTransforms.js
 * Utility functions for filtering, transforming, and formatting scenario data.
 */

/**
 * Format a number with k/M suffix for display.
 *
 * @param {number} n
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatNumber(n, decimals = 1) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return (n / 1_000_000).toFixed(decimals) + 'M';
  }
  if (abs >= 1_000) {
    return (n / 1_000).toFixed(decimals) + 'k';
  }
  return n.toLocaleString();
}

/**
 * Get the brand color for an efficacy percentage.
 *
 * @param {number} pct - efficacy percent (50, 65, or 80)
 * @returns {string} hex color string
 */
export function efficacyColor(pct) {
  if (pct === 50) return '#ef4444';
  if (pct === 65) return '#f97316';
  if (pct === 80) return '#22c55e';
  return '#6b7280';
}

/**
 * Filter population scenarios by selected efficacy and duration values.
 * Excludes the baseline (is_baseline = true) scenario.
 *
 * @param {Array} scenarios - Full population_scenarios array
 * @param {Object} filters - { efficacy: number[], duration: number[] }
 * @returns {Array} Matching non-baseline scenarios
 */
export function filterPopulationScenarios(scenarios, filters) {
  return scenarios.filter((s) => {
    if (s.is_baseline) return false;
    if (filters.efficacy && filters.efficacy.length > 0) {
      if (!filters.efficacy.includes(s.efficacy_pct)) return false;
    }
    if (filters.duration && filters.duration.length > 0) {
      if (!filters.duration.includes(s.duration_months)) return false;
    }
    return true;
  });
}
