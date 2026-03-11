# Data Schema — VMB Modeling Study Scenarios

## File: `scenarios.json`

Each object in the array represents one fully-specified intervention scenario evaluated by the agent-based model.

---

## Fields

### Scenario identity

| Field | Type | Description |
|---|---|---|
| `id` | string | Zero-padded unique identifier (e.g. `"0001"`) |

### Intervention parameters

| Field | Type | Valid values | Description |
|---|---|---|---|
| `product_type` | string | `"LBP"`, `"antibiotic"` | Intervention modality. LBP = live biotherapeutic product (probiotic); antibiotic = standard BV treatment. LBPs have more durable effects. |
| `efficacy` | number | `0.3`, `0.5`, `0.7`, `0.9` | Per-exposure probability of successful BV resolution / Lactobacillus colonization induction. |
| `duration_months` | number | `3`, `6`, `12`, `18`, `24` | Duration of product effect on vaginal microbiome composition (months). Non-linear impact on HIV: minimal at 3 months, large at 18–24 months. |
| `cst1_rate` | number | `0.1`, `0.2`, `0.4`, `0.6`, `0.8` | Probability that a treated woman establishes durable CST I (Lactobacillus crispatus–dominant) state. This is the single strongest predictor of both HIV and PTB outcomes. |
| `coverage` | number | `0.2`, `0.4`, `0.6`, `0.8` | Fraction of the eligible target population that receives the intervention. |
| `target_population` | string | `"all_women"`, `"pregnant_only"`, `"bv_symptomatic"` | Eligibility criterion for receiving the intervention. `pregnant_only` gives strong PTB effect and weaker HIV prevention; `all_women` gives balanced outcomes; `bv_symptomatic` gives moderate effects on both. |

### Outcomes — HIV

| Field | Type | Description |
|---|---|---|
| `hiv_infections_averted_10y` | integer | Cumulative HIV infections averted over 10 years in a population of 100,000 women. |
| `hiv_infections_averted_20y` | integer | Cumulative HIV infections averted over 20 years (primary endpoint). |
| `hiv_ui_low` | integer | Lower bound of 95% uncertainty interval for `hiv_infections_averted_20y`. Approximately 78–85% of median. |
| `hiv_ui_high` | integer | Upper bound of 95% uncertainty interval for `hiv_infections_averted_20y`. Approximately 118–123% of median. |

### Outcomes — Preterm birth

| Field | Type | Description |
|---|---|---|
| `ptb_averted_10y` | integer | Cumulative preterm births averted over 10 years. |
| `ptb_averted_20y` | integer | Cumulative preterm births averted over 20 years. |
| `ptb_ui_low` | integer | Lower bound of 95% uncertainty interval for `ptb_averted_20y`. |
| `ptb_ui_high` | integer | Upper bound of 95% uncertainty interval for `ptb_averted_20y`. |

### Summary metrics

| Field | Type | Description |
|---|---|---|
| `dalys_averted` | integer | Total disability-adjusted life years averted (HIV: ~28 DALYs/infection; PTB: ~1.4 DALYs/birth). |
| `cost_per_daly` | integer | Incremental cost-effectiveness ratio in USD per DALY averted. Values above 3× GDP per capita (~$3,000 for sub-Saharan Africa context) are considered not cost-effective. |

---

## Baseline population parameters

- **Population size**: 100,000 women of reproductive age
- **Baseline HIV incidence**: ~2,700 infections/year (27,000 per 10-year window; 40,500 per 15-year window used in calibration)
- **Baseline PTB rate**: ~2,300 preterm births/year (23,000 per 10-year window)
- **Time horizon**: Primary outcomes at 20 years; secondary at 10 years

---

## Key relationships embedded in data

1. **Duration → HIV impact**: Non-linear. Products with 3-month duration avert ~5% of achievable HIV infections; 12 months ~30%; 18–24 months ~55–75%.
2. **Efficacy → PTB impact**: Linear-ish. PTB outcomes scale more directly with per-episode efficacy than HIV outcomes.
3. **CST I establishment rate**: Strongest single predictor. Acts as a multiplier on all downstream outcomes.
4. **LBP vs antibiotic**: LBP achieves 100% of modeled HIV benefit; antibiotic achieves ~72% (less durable microbiome shift). PTB: LBP 100%, antibiotic 80%.
5. **Coverage**: Scales all outcomes proportionally.
6. **Target population**: `pregnant_only` concentrates PTB benefit; `all_women` maximizes HIV prevention reach.

---

## Uncertainty intervals

Generated from a pseudo-random seed per scenario. UI low ≈ 78–85% of median; UI high ≈ 118–123% of median. These represent model parameter uncertainty from calibration runs, not sampling uncertainty.
