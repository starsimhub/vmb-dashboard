# CLAUDE.md — Scientific Dashboard Template

This file documents the architecture, conventions, and patterns used in this project. Use it as a template when creating similar interactive scientific communication dashboards.

---

## Project Overview

A Vite + React SPA for presenting scientific modeling results as an interactive, single-page scrollable dashboard. Designed to communicate epidemiological or simulation model outputs to researchers, policymakers, and clinicians.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 (functional components, hooks only) |
| Build tool | Vite 5 |
| Charts | Recharts 2 |
| Styling | Tailwind CSS 3 + custom CSS |
| CSS processing | PostCSS + Autoprefixer |
| Package manager | npm |
| Linting | ESLint |

No TypeScript. No external state management (React useState only). All data is static JSON imported at build time — no API calls.

---

## Project Structure

```
/src
├── components/          # One file per dashboard section + layout components
│   ├── Header.jsx       # Sticky nav with mobile hamburger
│   ├── Footer.jsx       # Branding, links, contact
│   ├── Overview.jsx     # Study context, abstract, key stats (static)
│   ├── [Section].jsx    # One component per interactive section
│   └── ...
├── utils/
│   ├── dataTransforms.js  # formatNumber, efficacyColor, filter functions
│   └── paramDescriptions.js  # Human-readable descriptions for parameters
├── data/
│   ├── [scenario_data].json  # Pre-computed model output scenarios
│   └── schema.md            # Field definitions and data relationships
├── index.css            # Tailwind directives + @layer components
├── App.jsx              # Root layout: sections separated by <hr> or spacer
└── main.jsx             # ReactDOM.createRoot entry point
/public/                 # Static assets (logos, images)
index.html               # Google Fonts, #root mount point
vite.config.js           # Build config with manual chunk splitting
tailwind.config.js       # Brand colors + custom font families
```

---

## Architecture Principles

1. **Self-contained sections** — Each section component imports its own data directly; no prop drilling through App.
2. **Local state only** — Use `useState` for UI controls (toggles, sliders, open/closed accordions). No Redux or Context.
3. **Static data** — All model outputs are pre-computed JSON files imported at build time. Never fetch at runtime.
4. **Utility functions** — Extract shared logic (color maps, number formatters, data filters) to `utils/`.
5. **Composition over abstraction** — Large components are fine. Don't split prematurely; 400–600 line components are acceptable when they are a single cohesive section.

---

## Data Patterns

### JSON file per data type
```
population_scenarios.json  — main scenario grid (efficacy × duration)
rct_endpoints.json         — clinical trial endpoint results
sensitivity_scenarios.json — sensitivity analysis vs reference
ce_results.json            — cost-effectiveness calculations
```

### Scenario structure (typical)
```json
{
  "scenario_id": "eff80_dur12",
  "efficacy_pct": 80,
  "duration_months": 12,
  "hiv_averted_median": 1234,
  "hiv_averted_p5": 900,
  "hiv_averted_p95": 1600,
  "ptb_averted_median": 567,
  ...
}
```

### Data loading
```js
import populationScenarios from '../data/population_scenarios.json'
```

### Pre-computed lookup for performance
```js
const lookup = {};
for (const s of scenarios) {
  lookup[`${s.efficacy_pct}-${s.duration_months}`] = s;
}
```

---

## Component Patterns

### Section template
```jsx
export default function SectionName() {
  // --- State ---
  const [filterA, setFilterA] = useState(defaultA);
  const [filterB, setFilterB] = useState(defaultB);

  // --- Derived data ---
  const chartData = useMemo(() => {
    return rawData.filter(/* ... */);
  }, [filterA, filterB]);

  // --- Render ---
  return (
    <section id="section-id" className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="section-heading">Section Title</h2>
      <p className="section-subheading">Description of what this shows.</p>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        {/* toggles or sliders */}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical">
          {/* ... */}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
```

### Multi-select toggle group
```jsx
const OPTIONS = [50, 65, 80];
const [selected, setSelected] = useState(new Set([50, 65, 80]));

function toggle(val) {
  setSelected(prev => {
    if (prev.size === 1 && prev.has(val)) return prev; // prevent empty selection
    const next = new Set(prev);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  });
}

// Render
{OPTIONS.map(opt => (
  <button
    key={opt}
    onClick={() => toggle(opt)}
    className={selected.has(opt) ? 'toggle-btn-active' : 'toggle-btn-inactive'}
  >
    {opt}%
  </button>
))}
```

### Slider with live value display
```jsx
const [value, setValue] = useState(50);

<div className="flex items-center gap-3">
  <label className="control-label">Parameter</label>
  <input
    type="range"
    min={0} max={100} step={5}
    value={value}
    onChange={e => setValue(Number(e.target.value))}
    className="w-48"
  />
  <span className="font-mono text-sm bg-brand-blue text-white px-2 py-0.5 rounded">
    {value}%
  </span>
</div>
```

### Hover tooltip (fixed-position)
```jsx
const [tooltip, setTooltip] = useState(null); // { x, y, content }

<div
  onMouseMove={e => setTooltip({ x: e.clientX, y: e.clientY, content: 'info' })}
  onMouseLeave={() => setTooltip(null)}
>
  {/* chart or element */}
</div>

{tooltip && (
  <div
    className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg p-3 text-sm pointer-events-none"
    style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
  >
    {tooltip.content}
  </div>
)}
```

### Accordion section
```jsx
const [open, setOpen] = useState(true);

<div>
  <button
    onClick={() => setOpen(o => !o)}
    aria-expanded={open}
    className="flex justify-between w-full py-3 font-semibold"
  >
    Section Title
    <svg className={`transition-transform ${open ? 'rotate-180' : ''}`} .../>
  </button>
  <div className={`accordion-content ${open ? 'accordion-open' : ''}`}>
    {/* content */}
  </div>
</div>
```

---

## Chart Patterns (Recharts)

### Horizontal bar chart (standard)
```jsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={chartData}
    layout="vertical"
    margin={{ top: 8, right: 40, left: 160, bottom: 8 }}
  >
    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
    <XAxis type="number" tickFormatter={v => `${v}%`} />
    <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 13 }} />
    <Tooltip content={<CustomTooltip />} />
    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
      {chartData.map((entry, i) => (
        <Cell key={i} fill={efficacyColor(entry.efficacy_pct)} opacity={0.85} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

### Custom tooltip component
```jsx
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded shadow p-3 text-sm">
      <p className="font-semibold">{label}</p>
      <p>Value: <strong>{formatNumber(d.value)}</strong></p>
      <p className="text-gray-500">95% CI: {formatNumber(d.p5)} – {formatNumber(d.p95)}</p>
    </div>
  );
}
```

### Tornado plot (sensitivity)
```jsx
// Bars: red for negative delta, green for positive
<Bar dataKey="delta">
  {data.map((entry, i) => (
    <Cell key={i} fill={entry.delta < 0 ? '#DC2626' : '#16A34A'} />
  ))}
</Bar>
<ReferenceLine x={0} stroke="#374151" strokeWidth={1.5} />
```

---

## Styling Conventions

### Tailwind config additions
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        blue: '#1B4F72',
        blueMid: '#2E86C1',
        teal: '#0E7490',
        tealLight: '#0891B2',
        gold: '#D4A017',
        grayLight: '#F3F4F6',
      }
    },
    fontFamily: {
      sans: ['IBM Plex Sans', 'sans-serif'],
      serif: ['Source Serif Pro', 'serif'],
    }
  }
}
```

### Custom CSS components (`index.css`)
```css
@layer components {
  .section-heading   { @apply text-3xl font-serif font-bold text-brand-blue mb-3; }
  .section-subheading { @apply text-gray-600 text-lg mb-8 max-w-3xl; }
  .metric-card       { @apply bg-white rounded-xl shadow p-6 transition-all hover:shadow-md; }
  .control-label     { @apply text-xs font-semibold uppercase tracking-wide text-gray-500; }
  .toggle-btn-active   { @apply px-4 py-1.5 rounded-full text-sm font-medium bg-brand-blue text-white; }
  .toggle-btn-inactive { @apply px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200; }
  .accordion-content { @apply max-h-0 overflow-hidden transition-all duration-300; }
  .accordion-open    { @apply max-h-[2000px]; }
}
```

---

## Utility Functions (`utils/dataTransforms.js`)

```js
// Number formatting with k/M suffixes
export function formatNumber(n, decimals = 0) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return n.toFixed(decimals);
}

// Map efficacy percentage to brand color
export function efficacyColor(pct) {
  if (pct >= 80) return '#16A34A';  // green
  if (pct >= 65) return '#D97706';  // orange
  return '#DC2626';                  // red
}

// Filter scenarios by selected efficacy/duration values
export function filterScenarios(scenarios, { efficacies, durations }) {
  return scenarios.filter(s =>
    efficacies.includes(s.efficacy_pct) &&
    durations.includes(s.duration_months)
  );
}
```

---

## App Layout (`App.jsx`)

```jsx
import Header from './components/Header'
import Overview from './components/Overview'
// ... other section imports

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main>
        <Overview />
        <hr className="border-gray-200" />
        <SectionTwo />
        <hr className="border-gray-200" />
        {/* ... repeat for each section */}
      </main>
      <Footer />
    </div>
  );
}
```

---

## Navigation (Header)

- Section IDs match nav link hrefs: `id="overview"`, `id="explorer"`, etc.
- Smooth scroll via CSS: `html { scroll-behavior: smooth; }`
- Mobile: hamburger button toggles a vertical menu overlay
- Sticky positioning: `className="sticky top-0 z-50 bg-white"`
- Shadow on scroll: via `scroll` event listener + `useState`

---

## Vite Config

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // relative paths for deployment flexibility
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 1500,
  }
})
```

---

## Typical Dashboard Sections

When creating a new dashboard, consider these section types:

| Section | Purpose | Interactivity |
|---------|---------|---------------|
| Header | Sticky nav | Mobile menu |
| Overview | Abstract + key stats | None (static) |
| Primary results | Main scenario comparison | Multi-select toggles, absolute/percent toggle |
| Clinical endpoints | Trial-level outcomes | Dual sliders for thresholds |
| Sensitivity analysis | Tornado plots vs reference | Hover descriptions, delta/percent toggle |
| Cost-effectiveness | ICER table + DALYs | Cost slider, WTP slider, color-coded table |
| Key findings | Summary cards | None (static) |
| Methods | Detailed assumptions | Accordion |
| Footer | Attribution | None |

---

## Creating a New Dashboard — Checklist

1. **Copy project** — Clone this repo or scaffold with `npm create vite@latest myapp -- --template react`
2. **Install deps** — `npm install recharts tailwindcss postcss autoprefixer`
3. **Configure Tailwind** — Add brand colors and fonts to `tailwind.config.js`
4. **Add Google Fonts** — Link in `index.html`, register in Tailwind config
5. **Create data files** — One JSON per data type; document schema in `schema.md`
6. **Add utility functions** — Color maps, number formatters, filter helpers
7. **Build sections** — One component per section; self-contained with local state
8. **Wire App.jsx** — Import sections, add section IDs, connect nav links
9. **Configure Vite** — Set `base: './'`, add manual chunks for vendor and charts
10. **Test responsive** — Check mobile layout, especially nav and chart widths
11. **Build** — `npm run build`; verify `/dist` output

---

## Commands

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Production build to /dist
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```
