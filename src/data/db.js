// FactoryOS data layer — localStorage-backed for Phase 1.
// Every function is async and components subscribe for changes, so this module
// can be swapped for a Supabase adapter without touching any screen.

import { seedUsers, seedProducts, seedCustomers, seedOrders, seedBatches } from './seed'

const DB_KEY = 'factoryos-db-v2'

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
// Stock is tracked in liters. Non-liter units convert at packaging norms;
// tons approximate 1 t ≈ 1000 L (admixture density ~1.0–1.2) — good enough
// for availability planning, not for invoicing.
const L_PER_UNIT = { l: 1, kg: 1, drum: 200, ibc: 1000, t: 1000 }

export function litersOf(line) {
  return Number(line.qty || 0) * (L_PER_UNIT[line.unit] ?? 0)
}

/**
 * Per-product volumes in liters:
 *  produced  – all batches ever recorded
 *  shipped   – lines on orders out for delivery or delivered
 *  reserved  – lines on confirmed→scheduled orders (not yet on a truck)
 *  available – produced − shipped
 */
export function computeStock(batches, orders) {
  const stock = {}
  const bucket = id => (stock[id] ??= { produced: 0, shipped: 0, reserved: 0, available: 0 })
  batches.forEach(b => { bucket(b.productId).produced += Number(b.volumeL || 0) })
  orders.forEach(o => {
    if (['out_for_delivery', 'delivered'].includes(o.status)) {
      o.lines.forEach(l => { bucket(l.productId).shipped += litersOf(l) })
    } else if (!['draft', 'cancelled'].includes(o.status)) {
      o.lines.forEach(l => { bucket(l.productId).reserved += litersOf(l) })
    }
  })
  Object.values(stock).forEach(s => { s.available = s.produced - s.shipped })
  return stock
}

// ---- storage ----
function load() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const db = JSON.parse(raw)
      // additive migrations for records created before a field existed
      db.batches ??= []
      db.counters.batch ??= 1006
      return db
    }
  } catch { /* corrupted -> reseed */ }
  const fresh = {
    users: seedUsers,
    products: seedProducts,
    customers: seedCustomers,
    orders: seedOrders,
    batches: seedBatches,
    counters: { order: 1008, batch: 1006 },
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

// ---- reads ----
export async function getUsers() { return load().users }
export async function getProducts() { return load().products }
export async function getCustomers() { return load().customers }
export async function getOrders() { return load().orders }
export async function getBatches() { return load().batches }

// ---- writes ----
export async function createCustomer(name) {
  const db = load()
  const customer = { id: uid('c'), name: name.trim() }
  db.customers.push(customer)
  save(db)
  return customer
}

export async function createProduct({ code, name, family, formulation }) {
  const db = load()
  const product = {
    id: uid('p'),
    code: code.trim(),
    name: name.trim(),
    family,
    active: true,
    // { ingredients: [{name, pct}], notes } — visible per canSeeFormulation()
    formulation: formulation || null,
  }
  db.products.push(product)
  save(db)
  return product
}

export async function updateProduct(id, patch) {
  const db = load()
  const product = db.products.find(p => p.id === id)
  if (!product) throw new Error(`Product not found: ${id}`)
  Object.assign(product, patch)
  save(db)
  return product
}

export async function createBatch({ productId, volumeL, number, note, user }) {
  const db = load()
  let batchNumber = (number || '').trim()
  if (!batchNumber) {
    db.counters.batch += 1
    batchNumber = `B-${db.counters.batch}`
  }
  const batch = {
    id: uid('b'),
    number: batchNumber,
    productId,
    volumeL: Number(volumeL),
    note: note || '',
    at: nowIso(),
    byName: user.name,
  }
  db.batches.push(batch)
  save(db)
  return batch
}

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

export async function advanceOrder(id, user) {
  const db = load()
  const order = db.orders.find(o => o.id === id)
  if (!order) throw new Error(`Order not found: ${id}`)
  if (!canAdvance(order, user.role)) throw new Error('Not permitted for this role')
  const next = nextStatus(order.status)
  if (!next) return order
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
