// Trial concrete mix arithmetic for lab R&D. Pure functions, no storage —
// db.js persists mixes, screens call these to show derived values.
//
// Scope: absolute-volume bookkeeping (ACI 211.1 style) and a GWP *estimate*.
// No strength prediction here — strength comes from the breaks the lab records.

// Binder + water + aggregate ingredients, all kg per m³ of concrete.
export const MIX_INGREDIENTS = ['cement', 'flyAsh', 'slag', 'water', 'fineAgg', 'coarseAgg']
export const BINDERS = ['cement', 'flyAsh', 'slag']

// Specific gravity (relative density) defaults — typical values; the lab
// overwrites them with their own materials' test results in Mix settings.
// Aggregates are SSD values.
export const DEFAULT_SG = {
  cement: 3.15,
  flyAsh: 2.3,
  slag: 2.9,
  water: 1.0,
  fineAgg: 2.65,
  coarseAgg: 2.7,
  admixture: 1.07,
}

// kg CO₂e per kg of ingredient. Placeholders of the right order of magnitude
// (cement ≈ 0.76 and HRWR ≈ 3.1 match BOxCrete's fitted factors) — replace
// with supplier EPD values. Results are estimates, never an EPD.
export const DEFAULT_GWP = {
  cement: 0.76,
  flyAsh: 0.02,
  slag: 0.08,
  water: 0.0003,
  fineAgg: 0.004,
  coarseAgg: 0.004,
  admixture: 3.1,
}

export const MPA_TO_PSI = 145.0377

const num = v => (v === '' || v == null || Number.isNaN(Number(v)) ? 0 : Number(v))

export function binderKg(materials) {
  return BINDERS.reduce((s, k) => s + num(materials?.[k]), 0)
}

/** Admixture mass per m³; dosage is % by mass of total binder (the usual convention). */
export function admixtureKg(mix) {
  return (binderKg(mix.materials) * num(mix.dosagePct)) / 100
}

/**
 * Water / cementitious ratio. Water carried in by the admixture counts
 * (admixture mass × (1 − solids%)), which matters at high dosages.
 */
export function wcm(mix) {
  const binder = binderKg(mix.materials)
  if (!binder) return null
  const solids = mix.admixtureSolidsPct == null || mix.admixtureSolidsPct === ''
    ? 100 : num(mix.admixtureSolidsPct)
  const admixWater = admixtureKg(mix) * (1 - solids / 100)
  return (num(mix.materials?.water) + admixWater) / binder
}

/** SCM share of binder, 0–1. */
export function scmFraction(materials) {
  const binder = binderKg(materials)
  return binder ? (num(materials?.flyAsh) + num(materials?.slag)) / binder : 0
}

/**
 * Absolute volumes (m³) per ingredient plus air. Their sum is the yield of
 * the batch quantities as entered — it should be 1.000 for a per-m³ design.
 */
export function absoluteVolumes(mix, sg = DEFAULT_SG) {
  const v = {}
  MIX_INGREDIENTS.forEach(k => {
    v[k] = num(mix.materials?.[k]) / (num(sg[k]) * 1000 || Infinity)
  })
  v.admixture = admixtureKg(mix) / (num(sg.admixture) * 1000 || Infinity)
  v.air = num(mix.airPct) / 100
  v.total = Object.values(v).reduce((s, x) => s + x, 0)
  return v
}

/** Yield check: |total − 1 m³| within tolerance (default 2%). */
export function yieldOk(mix, sg = DEFAULT_SG, tol = 0.02) {
  return Math.abs(absoluteVolumes(mix, sg).total - 1) <= tol
}

/**
 * ACI 211.1 final step: given binder, water, admixture and air, fill the
 * remaining volume with aggregate at a chosen sand fraction (fine share of
 * total aggregate *by volume*, 0–1). Returns { fineAgg, coarseAgg } in kg/m³,
 * or null if paste + air already exceed 1 m³.
 */
export function solveAggregates(mix, sandFraction, sg = DEFAULT_SG) {
  const v = absoluteVolumes({ ...mix, materials: { ...mix.materials, fineAgg: 0, coarseAgg: 0 } }, sg)
  const aggVol = 1 - v.total
  if (aggVol <= 0) return null
  const s = Math.min(Math.max(num(sandFraction), 0), 1)
  return {
    fineAgg: Math.round(aggVol * s * num(sg.fineAgg) * 1000),
    coarseAgg: Math.round(aggVol * (1 - s) * num(sg.coarseAgg) * 1000),
  }
}

/** Estimated GWP, kg CO₂e per m³, broken down by ingredient. */
export function gwpEstimate(mix, factors = DEFAULT_GWP) {
  const parts = {}
  MIX_INGREDIENTS.forEach(k => { parts[k] = num(mix.materials?.[k]) * num(factors[k]) })
  parts.admixture = admixtureKg(mix) * num(mix.admixtureGwp ?? factors.admixture)
  const total = Object.values(parts).reduce((s, x) => s + x, 0)
  return { total, parts }
}

/** Breaks grouped by age: [{ ageDays, mean, std, n, values }], ascending age. */
export function strengthByAge(breaks = []) {
  const byAge = {}
  breaks.forEach(b => {
    const v = Number(b.mpa)
    if (!Number.isFinite(v)) return
    ;(byAge[b.ageDays] ??= []).push(v)
  })
  return Object.entries(byAge)
    .map(([age, values]) => {
      const n = values.length
      const mean = values.reduce((s, x) => s + x, 0) / n
      const std = n > 1 ? Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1)) : 0
      return { ageDays: Number(age), mean, std, n, values }
    })
    .sort((a, b) => a.ageDays - b.ageDays)
}

/** Mean strength at an age, or null if not broken yet. */
export function strengthAt(mix, ageDays) {
  return strengthByAge(mix.breaks).find(s => s.ageDays === ageDays)?.mean ?? null
}

/**
 * Trial vs reference mix — the numbers a partner cares about. Positive
 * cement/GWP deltas mean the trial uses/emits MORE than the reference.
 */
export function compareMixes(trial, reference, { sg = DEFAULT_SG, gwp = DEFAULT_GWP } = {}) {
  const pct = (a, b) => (b ? (a - b) / b : null)
  const tCement = num(trial.materials?.cement)
  const rCement = num(reference.materials?.cement)
  const tGwp = gwpEstimate(trial, gwp).total
  const rGwp = gwpEstimate(reference, gwp).total
  const t28 = strengthAt(trial, 28)
  const r28 = strengthAt(reference, 28)
  return {
    cementDelta: tCement - rCement,
    cementPct: pct(tCement, rCement),
    binderDelta: binderKg(trial.materials) - binderKg(reference.materials),
    wcmDelta: (wcm(trial) ?? 0) - (wcm(reference) ?? 0),
    gwpDelta: tGwp - rGwp,
    gwpPct: pct(tGwp, rGwp),
    strength28Delta: t28 != null && r28 != null ? t28 - r28 : null,
    strength28Pct: t28 != null && r28 != null ? pct(t28, r28) : null,
    // efficiency: MPa per kg binder — higher is better use of binder
    binderEfficiency: t28 != null && binderKg(trial.materials) ? t28 / binderKg(trial.materials) : null,
    refBinderEfficiency: r28 != null && binderKg(reference.materials) ? r28 / binderKg(reference.materials) : null,
  }
}

// Column layout of facebookresearch/SustainableConcrete (BOxCrete) data/boxcrete_data.csv,
// so trial data can be fitted offline with their Gaussian-process model.
export const BOXCRETE_HEADER = [
  'Mix Name', 'Material Source', 'Cement (kg/m3)', 'Fly Ash (kg/m3)', 'Slag (kg/m3)',
  'Water (kg/m3)', 'HRWR (kg/m3)', 'Fine Aggregate (kg/m3)', 'Coarse Aggregates (kg/m3)',
  'Temp (C)', 'Time', 'GWP', 'Strength1 (psi)', 'Strength2 (psi)', 'Strength3 (psi)',
  'Strength (Mean)', 'Strength (Std)', '# of measurements', 'Slump (in)',
]

/** One row per (mix, break age). Strength in psi, slump in inches, as BOxCrete expects. */
export function boxcreteRows(mixes, { gwp = DEFAULT_GWP, materialSource = 0 } = {}) {
  const r2 = x => Math.round(x * 100) / 100
  const rows = []
  mixes.forEach(mix => {
    const m = mix.materials || {}
    const g = r2(gwpEstimate(mix, gwp).total)
    const slumpIn = mix.fresh?.slumpMm != null && mix.fresh.slumpMm !== ''
      ? r2(Number(mix.fresh.slumpMm) / 25.4) : ''
    const temp = mix.fresh?.tempC ?? ''
    strengthByAge(mix.breaks).forEach(s => {
      const psi = s.values.map(v => Math.round(v * MPA_TO_PSI))
      rows.push([
        mix.number, materialSource,
        num(m.cement), num(m.flyAsh), num(m.slag), num(m.water),
        r2(admixtureKg(mix)), num(m.fineAgg), num(m.coarseAgg),
        temp, s.ageDays, g,
        psi[0] ?? '', psi[1] ?? '', psi[2] ?? '',
        Math.round(s.mean * MPA_TO_PSI), Math.round(s.std * MPA_TO_PSI), s.n,
        slumpIn,
      ])
    })
  })
  return rows
}
