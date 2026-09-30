import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  binderKg, admixtureKg, wcm, absoluteVolumes, yieldOk, solveAggregates,
  gwpEstimate, strengthByAge, compareMixes, boxcreteRows, BOXCRETE_HEADER, DEFAULT_SG,
} from './mix.js'

const ref = {
  number: 'TM-1', dosagePct: 0, airPct: 2,
  materials: { cement: 380, flyAsh: 0, slag: 0, water: 190, fineAgg: 0, coarseAgg: 0 },
  breaks: [{ ageDays: 28, mpa: 40 }, { ageDays: 28, mpa: 42 }],
}
const trial = {
  number: 'TM-2', dosagePct: 1, admixtureSolidsPct: 40, airPct: 2,
  materials: { cement: 300, flyAsh: 60, slag: 0, water: 150, fineAgg: 0, coarseAgg: 0 },
  breaks: [{ ageDays: 7, mpa: 30 }, { ageDays: 28, mpa: 44 }],
}

test('binder and admixture mass', () => {
  assert.equal(binderKg(trial.materials), 360)
  assert.equal(admixtureKg(trial), 3.6)
})

test('w/cm counts admixture water', () => {
  // 150 + 3.6 × 0.6 = 152.16 → / 360
  assert.ok(Math.abs(wcm(trial) - 152.16 / 360) < 1e-9)
  assert.equal(wcm({ materials: {} }), null)
})

test('solved aggregates fill exactly 1 m³', () => {
  const agg = solveAggregates(trial, 0.42)
  const full = { ...trial, materials: { ...trial.materials, ...agg } }
  // rounding to whole kg leaves < 0.1% error
  assert.ok(Math.abs(absoluteVolumes(full).total - 1) < 0.001)
  assert.ok(yieldOk(full))
  // sand fraction is by volume
  const v = absoluteVolumes(full)
  assert.ok(Math.abs(v.fineAgg / (v.fineAgg + v.coarseAgg) - 0.42) < 0.001)
})

test('solveAggregates returns null when paste overfills', () => {
  assert.equal(solveAggregates({ materials: { cement: 3000, water: 1000 }, airPct: 0 }, 0.4), null)
})

test('yield check flags under-filled mixes', () => {
  assert.equal(yieldOk(ref, DEFAULT_SG), false)
})

test('gwp is a linear sum with per-mix admixture override', () => {
  const base = gwpEstimate(trial).total
  const override = gwpEstimate({ ...trial, admixtureGwp: 0 }).total
  assert.ok(Math.abs(base - override - 3.6 * 3.1) < 1e-9)
})

test('strength grouped by age with sample std', () => {
  const s = strengthByAge(ref.breaks)
  assert.equal(s.length, 1)
  assert.equal(s[0].mean, 41)
  assert.ok(Math.abs(s[0].std - Math.SQRT2) < 1e-9)
  assert.equal(s[0].n, 2)
})

test('comparison vs reference', () => {
  const c = compareMixes(trial, ref)
  assert.equal(c.cementDelta, -80)
  assert.equal(c.strength28Delta, 3)
  assert.ok(c.gwpDelta < 0)
})

test('boxcrete export: one row per age, header width', () => {
  const rows = boxcreteRows([trial])
  assert.equal(rows.length, 2)
  rows.forEach(r => assert.equal(r.length, BOXCRETE_HEADER.length))
  assert.equal(rows[0][10], 7) // Time
  assert.equal(rows[1][15], Math.round(44 * 145.0377)) // mean psi
})
