// FactoryOS data layer — localStorage-backed for Phase 1.
// Every function is async and components subscribe for changes, so this module
// can be swapped for a Supabase adapter without touching any screen.

import { seedUsers, seedProducts, seedCustomers, seedOrders } from './seed'

const DB_KEY = 'factoryos-db-v1'

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

// ---- storage ----
function load() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted -> reseed */ }
  const fresh = {
    users: seedUsers,
    products: seedProducts,
    customers: seedCustomers,
    orders: seedOrders,
    counters: { order: 1008 },
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

// ---- writes ----
export async function createCustomer(name) {
  const db = load()
  const customer = { id: uid('c'), name: name.trim() }
  db.customers.push(customer)
  save(db)
  return customer
}

export async function createProduct({ code, name, family }) {
  const db = load()
  const product = { id: uid('p'), code: code.trim(), name: name.trim(), family, active: true }
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
