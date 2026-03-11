# VMB Modeling Study — Interactive Dashboard

An interactive dashboard built with React, Vite, and Tailwind CSS for exploring the population-level outcomes of vaginal microbiome (VMB) interventions across 2,400 modeled scenarios.

---

## Quick start

```bash
cd /Users/jamiecohen/GIT/vmb-dashboard
npm install        # first time only
npm run dev        # start the local dev server
```

Then open **http://localhost:5173** in your browser. The server hot-reloads on every file save — no restart needed when editing components or data.

To stop the server: `Ctrl+C` in the terminal.

---

## Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Install and run locally

```bash
cd /Users/jamiecohen/GIT/vmb-dashboard
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview the build locally with:

```bash
npm run preview
```

---

## Project structure

```
vmb-dashboard/
├── public/                 Static assets (favicon, etc.)
├── src/
│   ├── components/
│   │   ├── Header.jsx      Sticky navigation header
│   │   ├── Overview.jsx    Study summary and abstract
│   │   ├── ScenarioExplorer.jsx  Main interactive explorer (priority component)
│   │   ├── KeyFindings.jsx 2x2 finding cards
│   │   ├── RCTBridge.jsx   Flow diagram + parameter mapping table
│   │   ├── Methods.jsx     Collapsible methods accordion
│   │   └── Footer.jsx      Institutional branding and links
│   ├── data/
│   │   ├── scenarios.json  2,400 pre-computed scenario outcomes
│   │   └── schema.md       Full data schema documentation
│   ├── utils/
│   │   └── dataTransforms.js  Filter, match, and analyze scenario data
│   ├── App.jsx             Root component
│   └── index.css           Tailwind base + custom styles
├── index.html              Entry HTML with Google Fonts
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Replacing placeholder data

### Updating scenarios.json

The `src/data/scenarios.json` file contains 2,400 synthetically generated scenarios. To replace with real model outputs:

1. Ensure your data matches the schema documented in `src/data/schema.md`
2. Required fields per scenario:
   - `id`, `product_type`, `efficacy`, `duration_months`, `cst1_rate`, `coverage`, `target_population`
   - `hiv_infections_averted_10y`, `hiv_infections_averted_20y`
   - `ptb_averted_10y`, `ptb_averted_20y`
   - `dalys_averted`, `cost_per_daly`
   - `hiv_ui_low`, `hiv_ui_high`, `ptb_ui_low`, `ptb_ui_high`
3. Save the file as valid JSON array

The `ScenarioExplorer` component will automatically filter and display real data as long as the schema is preserved.

### Updating placeholder tokens

Search for these tokens and replace them throughout the codebase:

| Token | Replace with |
|---|---|
| `[AUTHOR]` | Author name(s) |
| `[INSTITUTION]` | Institution name |
| `[MANUSCRIPT_URL]` | DOI or preprint URL |
| `[APPENDIX_URL]` | Supplementary appendix URL |
| `[GITHUB_URL]` | GitHub repository URL |
| `[CONTACT_EMAIL]` | Corresponding author email |
| `[YEAR]` | Publication year |
| `[Journal]` | Journal name |

---

## Deployment

### Vercel (recommended)

1. Push to a GitHub repository
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Vite — no configuration needed
4. Deploy

### GitHub Pages

1. Install the gh-pages plugin:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Set `base` in `vite.config.js` to your repo name:
   ```js
   base: '/your-repo-name/'
   ```

4. Run:
   ```bash
   npm run deploy
   ```

### Static hosting (Netlify, S3, etc.)

Run `npm run build` and deploy the `dist/` directory to any static host. The app has no server-side dependencies.

---

## Technology stack

- **React 18** — UI framework
- **Vite 5** — Build tool and dev server
- **Tailwind CSS 3** — Utility-first styling
- **Recharts 2** — Chart components (bar charts, error bars)
- **Source Serif Pro** + **IBM Plex Sans** — Typography (Google Fonts)

---

## License

[LICENSE]
