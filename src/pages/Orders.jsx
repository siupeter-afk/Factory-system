import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, X, ChevronRight, Columns3, ListChecks } from 'lucide-react'
import {
  getOrders, getCustomers, getProducts, getBatches, subscribe,
  createOrder, advanceOrder, cancelOrder, createCustomer,
  ORDER_FLOW, ADVANCE_ACTION, canAdvance, canCancel,
  computeStock, litersOf,
} from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

// Pipeline stage colors: slate -> blue -> cyan -> teal -> emerald -> green.
// Progress reads as color before you read a word.
const STATUS_COLOR = {
  draft: '#64748B',
  confirmed: '#2563EB',
  in_production: '#0E7490',
  qc_released: '#0D9488',
  scheduled: '#059669',
  out_for_delivery: '#16A34A',
  delivered: '#15803D',
  cancelled: '#B91C1C',
}

// Which statuses each role works on — their default queue.
const ROLE_QUEUE = {
  production: ['confirmed', 'in_production'],
  lab: ['in_production'],
  driver: ['scheduled', 'out_for_delivery'],
}

const isOverdue = o =>
  o.requestedDate < new Date().toISOString().slice(0, 10) &&
  !['delivered', 'cancelled'].includes(o.status)

function useFactoryData() {
  const [data, setData] = useState({ orders: [], customers: [], products: [], batches: [] })
  useEffect(() => {
    let alive = true
    const refresh = () =>
      Promise.all([getOrders(), getCustomers(), getProducts(), getBatches()]).then(
        ([orders, customers, products, batches]) => alive && setData({ orders, customers, products, batches })
      )
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])
  return data
}

const fmtL = n => `${Number(n).toLocaleString()} L`

function StatusPill({ status, t }) {
  const c = STATUS_COLOR[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: c, backgroundColor: c + '14' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
      {t(`status.${status}`)}
    </span>
  )
}

function fmtDate(iso, lang) {
  if (!iso) return ''
  const d = new Date(iso + (iso.length === 10 ? 'T00:00' : ''))
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
}

function OrderCard({ order, customer, onOpen, onAdvance, user, t, lang }) {
  const overdue = isOverdue(order)
  const totalL = order.lines.reduce((s, l) => s + litersOf(l), 0)
  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-white border border-line rounded-xl overflow-hidden
                 hover:shadow-md hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand
                 outline-none transition-all flex"
    >
      <span className="w-1 shrink-0" style={{ backgroundColor: STATUS_COLOR[order.status] }} />
      <span className="flex-1 p-3 min-w-0">
        <span className="flex items-center justify-between gap-2">
          <span className="font-display font-semibold text-sm text-ink tabular-nums">{order.number}</span>
          <span className="text-xs text-muted tabular-nums">{fmtL(totalL)}</span>
        </span>
        <span className="block text-sm text-ink truncate mt-0.5">{customer?.name}</span>
        <span className="flex items-center justify-between mt-2">
          <span className={`text-xs tabular-nums ${overdue ? 'text-crit font-semibold' : 'text-muted'}`}>
            {overdue ? t('orders.overdue') + ' · ' : ''}{fmtDate(order.requestedDate, lang)}
          </span>
          <span className="text-xs text-muted">{order.lines.length} {t('orders.lines')}</span>
        </span>
        {canAdvance(order, user.role) && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onAdvance() }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onAdvance() } }}
            className="mt-2.5 w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5
                       bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-deep transition-colors"
          >
            {t(ADVANCE_ACTION[order.status])}
            <ChevronRight size={13} />
          </span>
        )}
      </span>
    </button>
  )
}

function Board({ orders, customers, user, onOpen, onAdvance, t, lang }) {
  const byId = useMemo(() => Object.fromEntries(customers.map(c => [c.id, c])), [customers])
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 h-full items-start">
      {ORDER_FLOW.map(status => {
        const col = orders.filter(o => o.status === status)
        return (
          <div key={status} className="w-64 shrink-0 flex flex-col max-h-full">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: STATUS_COLOR[status] }}>
                {t(`status.${status}`)}
              </span>
              <span className="text-xs text-muted tabular-nums">{col.length}</span>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto pr-0.5">
              {col.map(o => (
                <OrderCard
                  key={o.id} order={o} customer={byId[o.customerId]}
                  onOpen={() => onOpen(o)} onAdvance={() => onAdvance(o)}
                  user={user} t={t} lang={lang}
                />
              ))}
              {col.length === 0 && (
                <div className="border border-dashed border-line rounded-xl py-6 text-center text-xs text-muted">
                  {t('orders.empty')}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Queue({ orders, customers, user, onOpen, onAdvance, t, lang }) {
  const byId = useMemo(() => Object.fromEntries(customers.map(c => [c.id, c])), [customers])
  if (orders.length === 0) {
    return <div className="border border-dashed border-line rounded-xl py-16 text-center text-sm text-muted">{t('orders.empty')}</div>
  }
  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {orders.map(o => (
        <div key={o.id} className="bg-white border border-line rounded-xl flex overflow-hidden">
          <span className="w-1.5 shrink-0" style={{ backgroundColor: STATUS_COLOR[o.status] }} />
          <button onClick={() => onOpen(o)} className="flex-1 text-left p-4 min-w-0 outline-none focus-visible:bg-surface">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-display font-semibold text-ink tabular-nums">{o.number}</span>
              <StatusPill status={o.status} t={t} />
              {isOverdue(o) && <span className="text-xs font-semibold text-crit">{t('orders.overdue')}</span>}
            </div>
            <p className="text-sm text-ink mt-1">{byId[o.customerId]?.name}</p>
            <p className="text-xs text-muted mt-0.5 tabular-nums">
              {t('orders.requested')}: {fmtDate(o.requestedDate, lang)} · {o.lines.length} {t('orders.lines')}
            </p>
          </button>
          {canAdvance(o, user.role) && (
            <div className="flex items-center pr-4">
              <button
                onClick={() => onAdvance(o)}
                className="px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors min-h-[48px]"
              >
                {t(ADVANCE_ACTION[o.status])}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function OrderDrawer({ order, customers, products, user, onClose, onAdvance, onCancel, t, lang }) {
  if (!order) return null
  const customer = customers.find(c => c.id === order.customerId)
  const productById = Object.fromEntries(products.map(p => [p.id, p]))
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-ink tabular-nums">{order.number}</span>
            <StatusPill status={order.status} t={t} />
          </div>
          <button onClick={onClose} aria-label={t('order.close')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">{t('order.customer')}</h3>
            <p className="text-ink font-medium">{customer?.name}</p>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">{t('order.requestedDate')}</h3>
            <p className={`tabular-nums ${isOverdue(order) ? 'text-crit font-semibold' : 'text-ink'}`}>
              {fmtDate(order.requestedDate, lang)}{isOverdue(order) ? ` · ${t('orders.overdue')}` : ''}
            </p>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{t('order.products')}</h3>
            <div className="border border-line rounded-xl divide-y divide-line">
              {order.lines.map((l, i) => {
                const p = productById[l.productId]
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{p?.name || l.productId}</p>
                      <p className="text-xs text-muted">{p?.code} · {t(`family.${p?.family}`)}</p>
                    </div>
                    <span className="text-sm font-semibold text-ink tabular-nums shrink-0 pl-3">
                      {l.qty} {t(`unit.${l.unit}`)}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
          {order.notes && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">{t('order.notes')}</h3>
              <p className="text-sm text-ink whitespace-pre-wrap">{order.notes}</p>
            </section>
          )}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{t('order.history')}</h3>
            <ol className="flex flex-col gap-2">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[h.status] }} />
                  <span className="text-ink">{t(`status.${h.status}`)}</span>
                  <span className="text-xs text-muted ml-auto tabular-nums">
                    {fmtDate(h.at, lang)} · {h.byName}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className="p-4 border-t border-line flex gap-2 shrink-0">
          {canAdvance(order, user.role) && (
            <button
              onClick={() => onAdvance(order)}
              className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors"
            >
              {t(ADVANCE_ACTION[order.status])}
            </button>
          )}
          {canCancel(order, user.role) && (
            <button
              onClick={() => onCancel(order)}
              className="px-4 py-3 text-crit text-sm font-semibold rounded-xl border border-line hover:bg-crit/5 transition-colors"
            >
              {t('action.cancel')}
            </button>
          )}
        </footer>
      </aside>
    </div>
  )
}

function NewOrderModal({ customers, products, stock, user, onClose, t }) {
  const [customerId, setCustomerId] = useState('')
  const [newCustomer, setNewCustomer] = useState('')
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [requestedDate, setRequestedDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3)
    return d.toISOString().slice(0, 10)
  })
  const [lines, setLines] = useState([{ productId: '', qty: '', unit: 'l' }])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const activeProducts = products.filter(p => p.active)

  const setLine = (i, patch) =>
    setLines(ls => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)))

  async function submit() {
    setError('')
    let cid = customerId
    if (addingCustomer && newCustomer.trim()) {
      const c = await createCustomer(newCustomer)
      cid = c.id
    }
    if (!cid) { setError(t('newOrder.errCustomer')); return }
    const validLines = lines.filter(l => l.productId && Number(l.qty) > 0)
    if (validLines.length === 0) { setError(t('newOrder.errLines')); return }
    setBusy(true)
    await createOrder({ customerId: cid, requestedDate, lines: validLines, notes, user })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">{t('newOrder.title')}</h2>
          <button onClick={onClose} aria-label={t('newOrder.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('newOrder.customer')}</label>
            {addingCustomer ? (
              <input
                autoFocus value={newCustomer} onChange={e => setNewCustomer(e.target.value)}
                placeholder={t('newOrder.customerName')}
                className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              />
            ) : (
              <select
                value={customerId} onChange={e => setCustomerId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              >
                <option value="">{t('newOrder.selectCustomer')}</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <button
              onClick={() => setAddingCustomer(v => !v)}
              className="mt-1.5 text-xs font-medium text-brand hover:underline"
            >
              {addingCustomer ? t('newOrder.selectCustomer') : t('newOrder.addCustomer')}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('newOrder.requestedDate')}</label>
            <input
              type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('order.products')}</label>
            <div className="flex flex-col gap-2">
              {lines.map((l, i) => {
                const s = l.productId ? stock[l.productId] : null
                const available = s ? s.available - s.reserved : null
                const wantL = litersOf(l)
                const short = available != null && wantL > 0 && wantL > available
                return (
                  <div key={i}>
                    <div className="flex gap-2">
                      <select
                        value={l.productId} onChange={e => setLine(i, { productId: e.target.value })}
                        className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                      >
                        <option value="">{t('newOrder.selectProduct')}</option>
                        {activeProducts.map(p => {
                          const ps = stock[p.id]
                          const avail = ps ? ps.available - ps.reserved : 0
                          return (
                            <option key={p.id} value={p.id}>
                              {p.code} — {p.name} · {fmtL(Math.max(avail, 0))}
                            </option>
                          )
                        })}
                      </select>
                      <input
                        type="number" min="0" step="100" value={l.qty} placeholder={t('newOrder.qty')}
                        onChange={e => setLine(i, { qty: e.target.value })} inputMode="numeric"
                        className="w-24 px-2 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white tabular-nums"
                      />
                      <select
                        value={l.unit} onChange={e => setLine(i, { unit: e.target.value })}
                        className="w-24 px-2 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                      >
                        {['l', 'drum', 'ibc', 't', 'kg'].map(u => <option key={u} value={u}>{t(`unit.${u}`)}</option>)}
                      </select>
                      {lines.length > 1 && (
                        <button onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} aria-label="Remove line"
                          className="p-2 text-muted hover:text-crit rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {l.productId && (
                      <p className={`text-xs mt-1 tabular-nums ${short ? 'text-warn font-medium' : 'text-muted'}`}>
                        {t('newOrder.available')}: {fmtL(Math.max(available ?? 0, 0))}
                        {short && ` — ${t('newOrder.insufficient')}`}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setLines(ls => [...ls, { productId: '', qty: '', unit: 't' }])}
              className="mt-2 text-xs font-medium text-brand hover:underline"
            >
              {t('newOrder.addLine')}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('newOrder.notes')}</label>
            <textarea
              rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white resize-none"
            />
          </div>

          {error && <p className="text-sm text-crit font-medium">{error}</p>}
        </div>

        <footer className="p-4 border-t border-line flex gap-2 shrink-0">
          <button
            onClick={submit} disabled={busy}
            className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep disabled:opacity-60 transition-colors"
          >
            {busy ? t('newOrder.creating') : t('newOrder.create')}
          </button>
          <button onClick={onClose} className="px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
            {t('newOrder.cancel')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default function Orders() {
  const { orders, customers, products, batches } = useFactoryData()
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const roleQueue = ROLE_QUEUE[user.role]
  const [view, setView] = useState(roleQueue ? 'queue' : 'board')
  const [query, setQuery] = useState('')
  const [openOrder, setOpenOrder] = useState(null)
  const [showNew, setShowNew] = useState(false)

  const customerById = useMemo(() => Object.fromEntries(customers.map(c => [c.id, c])), [customers])
  const stock = useMemo(() => computeStock(batches, orders), [batches, orders])

  const visible = useMemo(() => {
    let list = orders.filter(o => o.status !== 'cancelled')
    if (view === 'queue' && roleQueue) list = list.filter(o => roleQueue.includes(o.status))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(o =>
        o.number.toLowerCase().includes(q) ||
        customerById[o.customerId]?.name.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => a.requestedDate.localeCompare(b.requestedDate))
  }, [orders, view, roleQueue, query, customerById])

  // Keep the drawer showing live data after advance/cancel
  const openLive = openOrder ? orders.find(o => o.id === openOrder.id) : null

  const doAdvance = o => advanceOrder(o.id, user)
  const doCancel = o => cancelOrder(o.id, user).then(() => setOpenOrder(null))
  const canCreate = ['owner', 'operations'].includes(user.role)

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 flex-wrap mb-5 shrink-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder={t('orders.searchPlaceholder')}
            className="pl-9 pr-3 py-2 text-sm bg-white border border-line rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        {roleQueue && (
          <div className="flex bg-white border border-line rounded-lg p-0.5">
            <button
              onClick={() => setView('queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${view === 'queue' ? 'bg-brand text-white' : 'text-muted hover:text-ink'}`}
            >
              <ListChecks size={14} /> {t('orders.myQueue')}
            </button>
            <button
              onClick={() => setView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${view === 'board' ? 'bg-brand text-white' : 'text-muted hover:text-ink'}`}
            >
              <Columns3 size={14} /> {t('orders.viewAll')}
            </button>
          </div>
        )}
        {canCreate && (
          <button
            onClick={() => setShowNew(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors"
          >
            <Plus size={16} /> {t('orders.new')}
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {view === 'board' ? (
          <Board orders={visible} customers={customers} user={user}
            onOpen={setOpenOrder} onAdvance={doAdvance} t={t} lang={lang} />
        ) : (
          <Queue orders={visible} customers={customers} user={user}
            onOpen={setOpenOrder} onAdvance={doAdvance} t={t} lang={lang} />
        )}
      </div>

      {openLive && (
        <OrderDrawer
          order={openLive} customers={customers} products={products} user={user}
          onClose={() => setOpenOrder(null)} onAdvance={doAdvance} onCancel={doCancel}
          t={t} lang={lang}
        />
      )}
      {showNew && (
        <NewOrderModal
          customers={customers} products={products} stock={stock} user={user}
          onClose={() => setShowNew(false)} t={t}
        />
      )}
    </div>
  )
}
