import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import {
  getRawMaterials, getReceipts, getBatches, getOrders, getAdjustments, getProducts,
  computeMaterialStock, computeStock, batchStocktake, updateRawMaterial, subscribe,
} from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

const inputCls = 'w-28 px-2 py-2 text-sm text-right border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand tabular-nums bg-white'

export default function Stocktake() {
  const [materials, setMaterials] = useState([])
  const [products, setProducts] = useState([])
  const [receipts, setReceipts] = useState([])
  const [batches, setBatches] = useState([])
  const [orders, setOrders] = useState([])
  const [adjustments, setAdjustments] = useState([])
  const [matCounts, setMatCounts] = useState({})   // materialId -> string
  const [prodCounts, setProdCounts] = useState({}) // productId -> string
  const [minEdits, setMinEdits] = useState({})     // materialId -> string
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()
  const { t } = useI18n()

  useEffect(() => {
    let alive = true
    const refresh = () =>
      Promise.all([getRawMaterials(), getProducts(), getReceipts(), getBatches(), getOrders(), getAdjustments()]).then(
        ([m, p, r, b, o, a]) => { if (alive) { setMaterials(m); setProducts(p); setReceipts(r); setBatches(b); setOrders(o); setAdjustments(a) } }
      )
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const matStock = useMemo(() => computeMaterialStock(materials, receipts, batches, adjustments), [materials, receipts, batches, adjustments])
  const prodStock = useMemo(() => computeStock(batches, orders, adjustments), [batches, orders, adjustments])

  const matDelta = m => {
    const v = matCounts[m.id]
    if (v === undefined || v === '') return null
    return Number(v) - (matStock[m.id]?.onHand ?? 0)
  }
  const prodDelta = p => {
    const v = prodCounts[p.id]
    if (v === undefined || v === '') return null
    return Number(v) - (prodStock[p.id]?.available ?? 0)
  }

  const changes =
    materials.filter(m => matDelta(m)).length +
    products.filter(p => prodDelta(p)).length
  const minChanges = Object.entries(minEdits).filter(([id, v]) =>
    v !== '' && Number(v) !== (materials.find(m => m.id === id)?.minLevelKg ?? 0)
  )

  async function saveAll() {
    for (const [id, v] of minChanges) {
      await updateRawMaterial(id, { minLevelKg: Number(v) })
    }
    if (changes) {
      await batchStocktake({
        materialCounts: materials
          .filter(m => matDelta(m))
          .map(m => ({ materialId: m.id, counted: Number(matCounts[m.id]) })),
        productCounts: products
          .filter(p => prodDelta(p))
          .map(p => ({ productId: p.id, counted: Number(prodCounts[p.id]) })),
        note, user,
      })
    }
    setMatCounts({}); setProdCounts({}); setMinEdits({}); setNote('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const DeltaCell = ({ delta, unit }) => {
    if (delta == null) return <span className="text-muted">—</span>
    if (delta === 0) return <span className="text-muted">0</span>
    return (
      <span className={`font-semibold ${delta < 0 ? 'text-crit' : 'text-ok'}`}>
        {delta > 0 ? '+' : ''}{delta.toLocaleString()} {unit}
      </span>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <p className="text-sm text-muted -mb-2">{t('stocktake.hint')}</p>

      {/* Raw materials */}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('nav.materials')}</h2>
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('materials.material')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('stocktake.system')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('stocktake.counted')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('stocktake.delta')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('materials.minLevel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {materials.map(m => {
                  const current = matStock[m.id]?.onHand ?? 0
                  return (
                    <tr key={m.id}>
                      <td className="px-4 py-2.5 text-ink">{m.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted whitespace-nowrap">{current.toLocaleString()} kg</td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number" step="any" inputMode="decimal"
                          value={matCounts[m.id] ?? ''}
                          placeholder={String(current)}
                          onChange={e => setMatCounts(c => ({ ...c, [m.id]: e.target.value }))}
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                        <DeltaCell delta={matDelta(m)} unit="kg" />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number" min="0" inputMode="numeric"
                          value={minEdits[m.id] ?? m.minLevelKg}
                          onChange={e => setMinEdits(c => ({ ...c, [m.id]: e.target.value }))}
                          className={inputCls}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('nav.products')}</h2>
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('products.name')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('stocktake.system')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('stocktake.counted')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('stocktake.delta')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.filter(p => p.active).map(p => {
                  const current = prodStock[p.id]?.available ?? 0
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-2.5 text-ink">
                        <span className="font-display font-semibold tabular-nums">{p.code}</span>
                        <span className="text-muted"> — {p.name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted whitespace-nowrap">{current.toLocaleString()} L</td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number" step="any" inputMode="decimal"
                          value={prodCounts[p.id] ?? ''}
                          placeholder={String(current)}
                          onChange={e => setProdCounts(c => ({ ...c, [p.id]: e.target.value }))}
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                        <DeltaCell delta={prodDelta(p)} unit="L" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 bg-surface/95 backdrop-blur border-t border-line -mx-6 px-6 py-4 flex items-center gap-3 flex-wrap">
        <input
          value={note} onChange={e => setNote(e.target.value)}
          placeholder={t('stocktake.notePlaceholder')}
          className="flex-1 min-w-52 px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
        />
        <button
          onClick={saveAll}
          disabled={changes === 0 && minChanges.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl
                     hover:bg-brand-deep disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ClipboardCheck size={16} />
          {t('stocktake.save')}{changes > 0 ? ` (${changes})` : ''}
        </button>
        {saved && <span className="text-sm font-medium text-ok">{t('stocktake.saved')}</span>}
      </div>
    </div>
  )
}
