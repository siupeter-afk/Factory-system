import { useEffect, useMemo, useState } from 'react'
import { Plus, X, ChevronDown, ChevronRight, FlaskConical } from 'lucide-react'
import { getBatches, getProducts, getOrders, createBatch, computeStock, canSeeFormulation, subscribe } from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

const fmtL = n => `${Number(n).toLocaleString()} L`

function fmtDate(iso, lang) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
}

function RecordBatchModal({ products, user, onClose, t }) {
  const [productId, setProductId] = useState('')
  const [volumeL, setVolumeL] = useState('')
  const [number, setNumber] = useState('')
  const [note, setNote] = useState('')
  const [actuals, setActuals] = useState([])
  const [error, setError] = useState('')

  const activeProducts = products.filter(p => p.active)
  const product = products.find(p => p.id === productId)
  const showMaterials = canSeeFormulation(user.role) && product?.formulation?.ingredients?.length > 0
  const ingredients = showMaterials ? product.formulation.ingredients : []

  // planned usage per ingredient, from formulation % of the batch volume (1 L ≈ 1 kg)
  const plannedKg = pct => (Number(volumeL) > 0 ? Number(volumeL) * Number(pct) / 100 : null)

  function pickProduct(id) {
    setProductId(id)
    const p = products.find(x => x.id === id)
    setActuals((p?.formulation?.ingredients || []).map(() => ''))
  }

  async function submit() {
    if (!productId) { setError(t('batches.errProduct')); return }
    if (!(Number(volumeL) > 0)) { setError(t('batches.errVolume')); return }
    const materials = showMaterials
      ? ingredients.map((ing, i) => ({
          name: ing.name,
          pct: ing.pct,
          plannedKg: plannedKg(ing.pct),
          actualKg: actuals[i] !== '' ? Number(actuals[i]) : null,
        }))
      : null
    await createBatch({ productId, volumeL, number, note, materials, user })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">{t('batches.record')}</h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('batches.product')}</label>
            <select
              autoFocus value={productId} onChange={e => pickProduct(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
            >
              <option value="">{t('newOrder.selectProduct')}</option>
              {activeProducts.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('batches.volume')}</label>
              <div className="relative">
                <input
                  type="number" min="0" step="100" value={volumeL} onChange={e => setVolumeL(e.target.value)}
                  inputMode="numeric" placeholder="5000"
                  className="w-full px-3 py-2.5 pr-8 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">L</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('batches.number')}</label>
              <input
                value={number} onChange={e => setNumber(e.target.value)} placeholder={t('batches.numberAuto')}
                className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand tabular-nums"
              />
            </div>
          </div>
          {showMaterials && (
            <div className="border border-line rounded-xl p-4 bg-surface/60">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical size={15} className="text-brand" />
                <span className="text-xs font-semibold uppercase tracking-wide text-ink">{t('batches.materials')}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-2 items-center text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('batches.material')}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('batches.planned')}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('batches.actual')}</span>
                {ingredients.map((ing, i) => {
                  const planned = plannedKg(ing.pct)
                  return (
                    <FragmentRow key={i}>
                      <span className="text-ink min-w-0 truncate">{ing.name} <span className="text-muted text-xs">({ing.pct}%)</span></span>
                      <span className="text-right tabular-nums text-muted whitespace-nowrap">
                        {planned != null ? `${planned.toLocaleString()} kg` : '—'}
                      </span>
                      <span className="relative w-28">
                        <input
                          type="number" min="0" step="0.1" inputMode="decimal"
                          value={actuals[i] ?? ''}
                          placeholder={planned != null ? String(planned) : ''}
                          onChange={e => setActuals(a => a.map((v, j) => (j === i ? e.target.value : v)))}
                          className="w-full px-2 py-1.5 pr-8 text-sm text-right border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand tabular-nums bg-white"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">kg</span>
                      </span>
                    </FragmentRow>
                  )
                })}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('batches.note')}</label>
            <input
              value={note} onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          {error && <p className="text-sm text-crit font-medium">{error}</p>}
        </div>
        <footer className="p-4 border-t border-line flex gap-2 shrink-0">
          <button
            onClick={submit}
            className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors"
          >
            {t('batches.save')}
          </button>
          <button onClick={onClose} className="px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
            {t('common.cancel')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default function ProductionLog() {
  const [batches, setBatches] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [showRecord, setShowRecord] = useState(false)
  const [openBatch, setOpenBatch] = useState(null)
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const seesMaterials = canSeeFormulation(user.role)

  useEffect(() => {
    let alive = true
    const refresh = () =>
      Promise.all([getBatches(), getProducts(), getOrders()]).then(([b, p, o]) => {
        if (alive) { setBatches(b); setProducts(p); setOrders(o) }
      })
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const productById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products])
  const stock = useMemo(() => computeStock(batches, orders), [batches, orders])
  const recent = useMemo(() => [...batches].sort((a, b) => b.at.localeCompare(a.at)), [batches])

  const stocked = products
    .filter(p => stock[p.id]?.produced > 0)
    .sort((a, b) => (stock[b.id]?.available || 0) - (stock[a.id]?.available || 0))

  const canRecord = ['owner', 'production'].includes(user.role)

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">{t('batches.stockTitle')}</h2>
        {canRecord && (
          <button
            onClick={() => setShowRecord(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors"
          >
            <Plus size={16} /> {t('batches.record')}
          </button>
        )}
      </div>

      {/* Stock summary — available to ship per product */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stocked.map(p => {
          const s = stock[p.id]
          const low = s.available - s.reserved < 0
          return (
            <div key={p.id} className="bg-white border border-line rounded-xl p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display font-semibold text-ink tabular-nums">{p.code}</span>
                <span className={`font-display text-lg font-bold tabular-nums ${low ? 'text-crit' : 'text-ink'}`}>
                  {fmtL(s.available)}
                </span>
              </div>
              <p className="text-sm text-muted truncate mt-0.5">{p.name}</p>
              <p className="text-xs text-muted mt-2 tabular-nums">
                {t('batches.produced')} {fmtL(s.produced)} · {t('batches.reserved')} {fmtL(s.reserved)}
              </p>
            </div>
          )
        })}
        {stocked.length === 0 && (
          <div className="col-span-full border border-dashed border-line rounded-xl py-10 text-center text-sm text-muted">
            {t('batches.empty')}
          </div>
        )}
      </div>

      {/* Batch history */}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('batches.title')}</h2>
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  {seesMaterials && <th className="w-8" />}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('batches.number')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('batches.product')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('batches.volume')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('batches.date')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('order.by')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map(b => {
                  const p = productById[b.productId]
                  const hasMaterials = seesMaterials && b.materials?.length > 0
                  const open = openBatch === b.id
                  return (
                    <FragmentRow key={b.id}>
                      <tr>
                        {seesMaterials && (
                          <td className="pl-3">
                            {hasMaterials && (
                              <button
                                onClick={() => setOpenBatch(open ? null : b.id)}
                                aria-label={t('batches.materials')}
                                aria-expanded={open}
                                className="p-1 text-muted hover:text-brand rounded transition-colors"
                              >
                                {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                              </button>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3 font-display font-semibold text-ink tabular-nums whitespace-nowrap">{b.number}</td>
                        <td className="px-4 py-3 text-ink">{p ? `${p.code} — ${p.name}` : b.productId}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-ink whitespace-nowrap">{fmtL(b.volumeL)}</td>
                        <td className="px-4 py-3 text-muted tabular-nums whitespace-nowrap">{fmtDate(b.at, lang)}</td>
                        <td className="px-4 py-3 text-muted whitespace-nowrap">{b.byName}</td>
                      </tr>
                      {hasMaterials && open && (
                        <tr>
                          <td colSpan={6} className="p-0 border-t border-line/60">
                            <div className="px-6 py-4 bg-surface/60">
                              <table className="text-sm max-w-md w-full">
                                <thead>
                                  <tr className="text-left">
                                    <th className="pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t('batches.material')}</th>
                                    <th className="pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('batches.planned')}</th>
                                    <th className="pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('batches.actual')}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-line/60">
                                  {b.materials.map((m, i) => {
                                    const off = m.actualKg != null && m.plannedKg > 0 &&
                                      Math.abs(m.actualKg - m.plannedKg) / m.plannedKg > 0.02
                                    return (
                                      <tr key={i}>
                                        <td className="py-1.5 text-ink">{m.name}</td>
                                        <td className="py-1.5 text-right tabular-nums text-muted whitespace-nowrap">
                                          {m.plannedKg != null ? `${Number(m.plannedKg).toLocaleString()} kg` : '—'}
                                        </td>
                                        <td className={`py-1.5 text-right tabular-nums whitespace-nowrap ${off ? 'text-warn font-semibold' : 'text-ink font-medium'}`}>
                                          {m.actualKg != null ? `${Number(m.actualKg).toLocaleString()} kg` : '—'}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </FragmentRow>
                  )
                })}
                {recent.length === 0 && (
                  <tr><td colSpan={seesMaterials ? 6 : 5} className="px-4 py-8 text-center text-muted">{t('batches.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showRecord && <RecordBatchModal products={products} user={user} onClose={() => setShowRecord(false)} t={t} />}
    </div>
  )
}

// Table rows can't be wrapped in a div; a fragment keeps row pairs together.
function FragmentRow({ children }) {
  return <>{children}</>
}
