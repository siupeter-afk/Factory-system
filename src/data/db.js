// FactoryOS data layer — localStorage-backed for Phase 1.
// Every function is async and components subscribe for changes, so this module
// can be swapped for a Supabase adapter without touching any screen.

import {
  seedUsers, seedProducts, seedCustomers, seedOrders, seedBatches,
  seedRawMaterials, seedReceipts, seedFormTemplates,
} from './seed'

const DB_KEY = 'factoryos-db-v3'

// ---- order pipeline ----
export const ORDER_FLOW = [
  'draft', 'confirmed', 'in_production', 'qc_released',
  'scheduled', 'out_for_delivery', 'delivered',
]

// Which roles may advance an order OUT of each status. Owner can always act.
const ADVANCE_ROLES = {
  draft: ['operations'],
  confirmed: ['production'],
  in_production: ['lab'],
  qc_released: ['operations'],
  scheduled: ['driver', 'operations'],
  out_for_delivery: ['driver', 'operations'],
}

// Action label key shown on the advance button, per current status.
export const ADVANCE_ACTION = {
  draft: 'action.confirm',
  confirmed: 'action.startProduction',
  in_production: 'action.qcRelease',
  qc_released: 'action.schedule',
  scheduled: 'action.dispatch',
  out_for_delivery: 'action.markDelivered',
}

export function canAdvance(order, role) {
  if (order.status === 'delivered' || order.status === 'cancelled') return false
  if (role === 'owner') return true
  return (ADVANCE_ROLES[order.status] || []).includes(role)
}

export function canCancel(order, role) {
  return ['draft', 'confirmed'].includes(order.status) && ['owner', 'operations'].includes(role)
}

export function nextStatus(status) {
  const i = ORDER_FLOW.indexOf(status)
  return i >= 0 && i < ORDER_FLOW.length - 1 ? ORDER_FLOW[i + 1] : null
}

// ---- formulation visibility ----
// The recipe stays with the owner and the people who make it.
// Everyone else — including lab — sees only the product name.
export function canSeeFormulation(role) {
  return ['owner', 'production'].includes(role)
}

// ---- units & stock ----
// Product stock is tracked in liters. Non-liter units convert at packaging
// norms; tons approximate 1 t ≈ 1000 L (admixture density ~1.0–1.2) — good
// enough for availability planning, not for invoicing.
const L_PER_UNIT = { l: 1, kg: 1, drum: 200, ibc: 1000, t: 1000 }

export function litersOf(line) {
  return Number(line.qty || 0) * (L_PER_UNIT[line.unit] ?? 0)
}

/** Volume that actually left the plant: the loaded amount when recorded, else the ordered qty. */
export function shippedLitersOf(line) {
  return Number(line.loadedQty ?? line.qty ?? 0) * (L_PER_UNIT[line.unit] ?? 0)
}

/**
 * Per-product volumes in liters:
 *  produced  – all batches ever recorded
 *  shipped   – lines on orders out for delivery or delivered (loaded amounts)
 *  reserved  – lines on confirmed→scheduled orders (not yet on a truck)
 *  available – produced − shipped ± product adjustments
 */
export function computeStock(batches, orders, adjustments = []) {
  const stock = {}
  const bucket = id => (stock[id] ??= { produced: 0, shipped: 0, reserved: 0, adjusted: 0, available: 0 })
  batches.forEach(b => { bucket(b.productId).produced += Number(b.volumeL || 0) })
  orders.forEach(o => {
    if (['out_for_delivery', 'delivered'].includes(o.status)) {
      o.lines.forEach(l => { bucket(l.productId).shipped += shippedLitersOf(l) })
    } else if (!['draft', 'cancelled'].includes(o.status)) {
      o.lines.forEach(l => { bucket(l.productId).reserved += litersOf(l) })
    }
  })
  adjustments.filter(a => a.kind === 'product').forEach(a => {
    bucket(a.productId).adjusted += Number(a.delta || 0)
  })
  Object.values(stock).forEach(s => { s.available = s.produced - s.shipped + s.adjusted })
  return stock
}

/**
 * Per-material stock in kg:
 *  received – accepted (QC-passed) receipts
 *  used     – batch material usage (actual when recorded, else planned)
 *  adjusted – manual corrections
 * Batch usage matches materials by name (case-insensitive) — formulation
 * ingredient names should match the raw material names.
 */
export function computeMaterialStock(materials, receipts, batches, adjustments = []) {
  const byName = {}
  materials.forEach(m => { byName[m.name.trim().toLowerCase()] = m.id })
  const stock = {}
  const bucket = id => (stock[id] ??= { received: 0, used: 0, adjusted: 0, onHand: 0 })
  receipts.filter(r => r.qcStatus === 'passed').forEach(r => {
    bucket(r.materialId).received += Number(r.qtyKg || 0)
  })
  batches.forEach(b => {
    (b.materials || []).forEach(m => {
      const id = byName[m.name?.trim().toLowerCase()]
      if (id) bucket(id).used += Number(m.actualKg ?? m.plannedKg ?? 0)
    })
  })
  adjustments.filter(a => a.kind === 'material').forEach(a => {
    bucket(a.materialId).adjusted += Number(a.delta || 0)
  })
  Object.values(stock).forEach(s => { s.onHand = s.received - s.used + s.adjusted })
  return stock
}

// ---- QC ----
// Batch release: pot test then tank test, both passing.
// Returns 'pot_pending' | 'tank_pending' | 'released' | 'failed'
export function batchQcStatus(batch, tests) {
  const own = tests.filter(t => t.batchId === batch.id)
  const failed = own.some(t => !t.pass && !own.some(u => u.stage === t.stage && u.pass && u.at > t.at))
  const potPass = own.some(t => t.stage === 'pot' && t.pass)
  const tankPass = own.some(t => t.stage === 'tank' && t.pass)
  if (potPass && tankPass) return 'released'
  if (failed) return 'failed'
  if (!potPass) return 'pot_pending'
  return 'tank_pending'
}

/** Every order line's product needs at least one released batch before QC release. */
export function qcBlockReason(order, batches, tests) {
  const releasedProducts = new Set(
    batches.filter(b => batchQcStatus(b, tests) === 'released').map(b => b.productId)
  )
  const missing = order.lines.filter(l => !releasedProducts.has(l.productId))
  return missing.length ? missing.map(l => l.productId) : null
}

// ---- storage ----
function load() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const db = JSON.parse(raw)
      // additive migrations for records created before a field existed
      db.batches ??= []
      db.rawMaterials ??= []
      db.receipts ??= []
      db.adjustments ??= []
      db.qcTests ??= []
      db.deviations ??= []
      db.formTemplates ??= []
      db.formSubmissions ??= []
      db.counters.batch ??= 1006
      db.counters.receipt ??= 100
      return db
    }
  } catch { /* corrupted -> reseed */ }
  const fresh = {
    users: seedUsers,
    products: seedProducts,
    customers: seedCustomers,
    orders: seedOrders,
    batches: seedBatches,
    rawMaterials: seedRawMaterials,
    receipts: seedReceipts,
    adjustments: [],
    qcTests: [],
    deviations: [],
    formTemplates: seedFormTemplates,
    formSubmissions: [],
    counters: { order: 1008, batch: 1006, receipt: 103 },
  }
  localStorage.setItem(DB_KEY, JSON.stringify(fresh))
  return fresh
}

function save(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  listeners.forEach(fn => fn())
}

const listeners = new Set()

/** Subscribe to any data change. Returns an unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

const uid = prefix => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const nowIso = () => new Date().toISOString()

function pushDeviation(db, { kind, refId, description, byName }) {
  db.deviations.push({
    id: uid('d'), kind, refId, description,
    status: 'open', at: nowIso(), byName,
    reviewedBy: null, reviewedAt: null,
  })
}

// ---- reads ----
export async function getUsers() { return load().users }
export async function getProducts() { return load().products }
export async function getCustomers() { return load().customers }
export async function getOrders() { return load().orders }
export async function getBatches() { return load().batches }
export async function getRawMaterials() { return load().rawMaterials }
export async function getReceipts() { return load().receipts }
export async function getAdjustments() { return load().adjustments }
export async function getQcTests() { return load().qcTests }
export async function getDeviations() { return load().deviations }
export async function getFormTemplates() { return load().formTemplates }
export async function getFormSubmissions() { return load().formSubmissions }

// ---- users / customers ----
export async function createUser({ name, role }) {
  const db = load()
  const user = { id: uid('u'), name: name.trim(), role }
  db.users.push(user)
  save(db)
  return user
}

export async function createCustomer(name) {
  const db = load()
  const customer = { id: uid('c'), name: name.trim() }
  db.customers.push(customer)
  save(db)
  return customer
}

// ---- products & formulations ----
export async function createProduct({ code, name, family, formulation, specs }) {
  const db = load()
  const product = {
    id: uid('p'),
    code: code.trim(),
    name: name.trim(),
    family,
    active: true,
    // { version, ingredients: [{name, pct}], notes, updatedAt, updatedBy }
    formulation: formulation
      ? { version: 1, ...formulation, updatedAt: nowIso(), updatedBy: null }
      : null,
    formulationHistory: [],
    // QC spec ranges: [{param, unit, min, max}] — owned by lab
    specs: specs || [],
  }
  db.products.push(product)
  save(db)
  return product
}

export async function updateProduct(id, patch, user) {
  const db = load()
  const product = db.products.find(p => p.id === id)
  if (!product) throw new Error(`Product not found: ${id}`)
  // formulation edits are versioned: prior version goes to history
  if (patch.formulation) {
    const prev = product.formulation
    const version = (prev?.version || 0) + 1
    if (prev) {
      product.formulationHistory ??= []
      product.formulationHistory.push(prev)
    }
    patch = {
      ...patch,
      formulation: {
        version,
        ...patch.formulation,
        updatedAt: nowIso(),
        updatedBy: user?.name || null,
      },
    }
  }
  Object.assign(product, patch)
  save(db)
  return product
}

// ---- batches ----
export async function createBatch({ productId, volumeL, number, note, materials, user }) {
  const db = load()
  let batchNumber = (number || '').trim()
  if (!batchNumber) {
    db.counters.batch += 1
    batchNumber = `B-${db.counters.batch}`
  }
  const product = db.products.find(p => p.id === productId)
  const batch = {
    id: uid('b'),
    number: batchNumber,
    productId,
    volumeL: Number(volumeL),
    note: note || '',
    // per-ingredient usage: [{name, pct, plannedKg, actualKg}] — recorded
    // against the formulation at production time
    materials: materials || null,
    formulationVersion: product?.formulation?.version ?? null,
    at: nowIso(),
    byName: user.name,
  }
  db.batches.push(batch)
  // material usage more than 2% off plan opens a deviation for review
  ;(materials || []).forEach(m => {
    if (m.actualKg != null && m.plannedKg > 0) {
      const off = Math.abs(m.actualKg - m.plannedKg) / m.plannedKg
      if (off > 0.02) {
        pushDeviation(db, {
          kind: 'material_usage',
          refId: batch.id,
          description: `${batchNumber} · ${m.name}: ${m.actualKg} kg vs plan ${m.plannedKg} kg (${(off * 100).toFixed(1)}% off)`,
          byName: user.name,
        })
      }
    }
  })
  save(db)
  return batch
}

// ---- raw materials ----
export async function createRawMaterial({ name, minLevelKg }) {
  const db = load()
  const material = { id: uid('m'), name: name.trim(), minLevelKg: Number(minLevelKg) || 0 }
  db.rawMaterials.push(material)
  save(db)
  return material
}

export async function updateRawMaterial(id, patch) {
  const db = load()
  const material = db.rawMaterials.find(m => m.id === id)
  if (!material) throw new Error(`Material not found: ${id}`)
  Object.assign(material, patch)
  save(db)
  return material
}

export async function createReceipt({ materialId, supplier, lotNo, qtyKg, note, user }) {
  const db = load()
  db.counters.receipt += 1
  const receipt = {
    id: uid('r'),
    number: `RCV-${db.counters.receipt}`,
    materialId,
    supplier: supplier?.trim() || '',
    lotNo: lotNo?.trim() || '',
    qtyKg: Number(qtyKg),
    note: note || '',
    qcStatus: 'pending', // stock counts only after lab passes it
    at: nowIso(),
    byName: user.name,
  }
  db.receipts.push(receipt)
  save(db)
  return receipt
}

export async function createAdjustment({ kind, materialId, productId, delta, reason, user }) {
  const db = load()
  const adjustment = {
    id: uid('a'),
    kind, // 'material' (kg) | 'product' (L)
    materialId: materialId || null,
    productId: productId || null,
    delta: Number(delta),
    reason: reason?.trim() || '',
    at: nowIso(),
    byName: user.name,
  }
  db.adjustments.push(adjustment)
  pushDeviation(db, {
    kind: 'stock_adjustment',
    refId: adjustment.id,
    description: `${reason || 'Stock adjustment'}: ${delta > 0 ? '+' : ''}${delta} ${kind === 'material' ? 'kg' : 'L'}`,
    byName: user.name,
  })
  save(db)
  return adjustment
}

/**
 * Owner stocktake: set counted values for any number of materials (kg) and
 * products (L) in one pass. Deltas against computed stock are booked as
 * adjustments; one summary deviation records the whole count.
 */
export async function batchStocktake({ materialCounts = [], productCounts = [], note, user }) {
  const db = load()
  const matStock = computeMaterialStock(db.rawMaterials, db.receipts, db.batches, db.adjustments)
  const prodStock = computeStock(db.batches, db.orders, db.adjustments)
  const reason = note?.trim() || 'Stocktake'
  let changed = 0

  materialCounts.forEach(({ materialId, counted }) => {
    const current = matStock[materialId]?.onHand ?? 0
    const delta = Number(counted) - current
    if (!delta) return
    db.adjustments.push({
      id: uid('a'), kind: 'material', materialId, productId: null,
      delta, reason, at: nowIso(), byName: user.name,
    })
    changed += 1
  })
  productCounts.forEach(({ productId, counted }) => {
    const current = prodStock[productId]?.available ?? 0
    const delta = Number(counted) - current
    if (!delta) return
    db.adjustments.push({
      id: uid('a'), kind: 'product', productId, materialId: null,
      delta, reason, at: nowIso(), byName: user.name,
    })
    changed += 1
  })

  if (changed) {
    pushDeviation(db, {
      kind: 'stock_adjustment',
      refId: null,
      description: `${reason}: ${changed} item(s) corrected to counted values`,
      byName: user.name,
    })
    save(db)
  }
  return changed
}

// ---- QC tests ----
// stage: 'pot' | 'tank' | 'incoming'
// results: [{param, unit, value, min, max, pass}] — overall pass = every param passes
export async function createQcTest({ stage, batchId, receiptId, productId, materialId, results, pass, note, user }) {
  const db = load()
  const overall = results?.length ? results.every(r => r.pass) : !!pass
  const test = {
    id: uid('q'),
    stage,
    batchId: batchId || null,
    receiptId: receiptId || null,
    productId: productId || null,
    materialId: materialId || null,
    results: results || [],
    pass: overall,
    note: note || '',
    at: nowIso(),
    byName: user.name,
  }
  db.qcTests.push(test)
  if (receiptId) {
    const receipt = db.receipts.find(r => r.id === receiptId)
    if (receipt) receipt.qcStatus = overall ? 'passed' : 'failed'
  }
  if (!overall) {
    const subject = batchId
      ? db.batches.find(b => b.id === batchId)?.number
      : db.receipts.find(r => r.id === receiptId)?.number
    pushDeviation(db, {
      kind: 'qc_fail',
      refId: test.id,
      description: `${subject || stage} · ${stage} test failed${note ? ` — ${note}` : ''}`,
      byName: user.name,
    })
  }
  save(db)
  return test
}

// ---- deviations ----
export async function reviewDeviation(id, user) {
  const db = load()
  const deviation = db.deviations.find(d => d.id === id)
  if (!deviation) throw new Error(`Deviation not found: ${id}`)
  deviation.status = 'reviewed'
  deviation.reviewedBy = user.name
  deviation.reviewedAt = nowIso()
  save(db)
  return deviation
}

// ---- forms ----
// template: { id, title, department: 'all'|role, version, fields: [{id, label,
//   type: 'text'|'number'|'select'|'checkbox'|'date', unit?, options?, min?, max?, required}],
//   active, history: [prior {version, fields, title}] }
export async function createFormTemplate({ title, department, fields, user }) {
  const db = load()
  const template = {
    id: uid('f'),
    title: title.trim(),
    department,
    version: 1,
    fields,
    active: true,
    history: [],
    at: nowIso(),
    byName: user.name,
  }
  db.formTemplates.push(template)
  save(db)
  return template
}

export async function updateFormTemplate(id, { title, department, fields, active }, user) {
  const db = load()
  const template = db.formTemplates.find(f => f.id === id)
  if (!template) throw new Error(`Form template not found: ${id}`)
  if (fields) {
    // structural change -> new version; old submissions keep their version's meaning
    template.history.push({ version: template.version, title: template.title, fields: template.fields })
    template.version += 1
    template.fields = fields
  }
  if (title != null) template.title = title.trim()
  if (department != null) template.department = department
  if (active != null) template.active = active
  template.updatedAt = nowIso()
  template.updatedBy = user?.name || null
  save(db)
  return template
}

export async function submitForm({ templateId, values, user }) {
  const db = load()
  const template = db.formTemplates.find(f => f.id === templateId)
  if (!template) throw new Error(`Form template not found: ${templateId}`)
  // out-of-range numbers get flagged, not blocked — the truth is the truth
  const flags = template.fields
    .filter(f => f.type === 'number' && values[f.id] !== '' && values[f.id] != null)
    .filter(f => {
      const v = Number(values[f.id])
      return (f.min != null && f.min !== '' && v < Number(f.min)) ||
             (f.max != null && f.max !== '' && v > Number(f.max))
    })
    .map(f => f.id)
  const submission = {
    id: uid('s'),
    templateId,
    templateVersion: template.version,
    values,
    flags,
    at: nowIso(),
    byName: user.name,
  }
  db.formSubmissions.push(submission)
  save(db)
  return submission
}

// ---- orders ----
export async function createOrder({ customerId, requestedDate, lines, notes, user }) {
  const db = load()
  db.counters.order += 1
  const order = {
    id: uid('o'),
    number: `ORD-${db.counters.order}`,
    customerId,
    status: 'draft',
    requestedDate,
    notes: notes || '',
    lines,
    history: [{ status: 'draft', at: nowIso(), byName: user.name }],
  }
  db.orders.push(order)
  save(db)
  return order
}

export async function advanceOrder(id, user, payload) {
  const db = load()
  const order = db.orders.find(o => o.id === id)
  if (!order) throw new Error(`Order not found: ${id}`)
  if (!canAdvance(order, user.role)) throw new Error('Not permitted for this role')
  const next = nextStatus(order.status)
  if (!next) return order
  // QC release gate: every line's product needs a released batch (pot + tank passed)
  if (order.status === 'in_production') {
    const blocked = qcBlockReason(order, db.batches, db.qcTests)
    if (blocked) {
      const codes = blocked.map(pid => db.products.find(p => p.id === pid)?.code || pid)
      const err = new Error(`QC_BLOCKED:${codes.join(', ')}`)
      err.qcBlocked = codes
      throw err
    }
  }
  // dispatch step: record actual loaded amount per line (blank = as ordered)
  if (order.status === 'scheduled' && payload?.loadedQtys) {
    order.lines = order.lines.map((l, i) => {
      const v = payload.loadedQtys[i]
      return v != null && v !== '' ? { ...l, loadedQty: Number(v) } : l
    })
  }
  order.status = next
  order.history.push({ status: next, at: nowIso(), byName: user.name })
  save(db)
  return order
}

export async function cancelOrder(id, user) {
  const db = load()
  const order = db.orders.find(o => o.id === id)
  if (!order) throw new Error(`Order not found: ${id}`)
  if (!canCancel(order, user.role)) throw new Error('Not permitted for this role')
  order.status = 'cancelled'
  order.history.push({ status: 'cancelled', at: nowIso(), byName: user.name })
  save(db)
  return order
}

// ---- CSV export (Excel-compatible, incl. Chinese text via UTF-8 BOM) ----
export function downloadCsv(filename, headerRow, rows) {
  const esc = v => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headerRow, ...rows].map(r => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
