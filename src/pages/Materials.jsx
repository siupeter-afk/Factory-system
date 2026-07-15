import { useEffect, useMemo, useState } from 'react'
import { Plus, X, AlertTriangle, PackagePlus, Scale } from 'lucide-react'
import {
  getRawMaterials, getReceipts, getBatches, getAdjustments,
  createRawMaterial, createReceipt, createAdjustment,
  computeMaterialStock, subscribe,
} from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

const fmtKg = n => `${Number(n).toLocaleString()} kg`

function fmtDate(iso, lang) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
}

function Modal({ title, onClose, children, footer, t }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">{children}</div>
        <footer className="p-4 border-t border-line flex gap-2 shrink-0">{footer}</footer>
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white'
const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5'

function ReceiveModal({ materials, user, onClose, t }) {
  const [materialId, setMaterialId] = useState('')
  const [supplier, setSupplier] = useState('')
  const [lotNo, setLotNo] = useState('')
  const [qtyKg, setQtyKg] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    if (!materialId) { setError(t('materials.errMaterial')); return }
    if (!(Number(qtyKg) > 0)) { setError(t('materials.errQty')); return }
    await createReceipt({ materialId, supplier, lotNo, qtyKg, user })
    onClose()
  }

  return (
    <Modal title={t('materials.receive')} onClose={onClose} t={t} footer={
      <>
        <button onClick={submit} className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors">
          {t('materials.saveReceipt')}
        </button>
        <button onClick={onClose} className="px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
          {t('common.cancel')}
        </button>
      </>
    }>
      <div>
        <label className={labelCls}>{t('materials.material')}</label>
        <select autoFocus value={materialId} onChange={e => setMaterialId(e.target.value)} className={inputCls}>
          <option value="">{t('materials.selectMaterial')}</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>{t('materials.supplier')}</label>
        <input value={supplier} onChange={e => setSupplier(e.target.value)} className={inputCls} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls}>{t('materials.lotNo')}</label>
          <input value={lotNo} onChange={e => setLotNo(e.target.value)} className={`${inputCls} tabular-nums`} />
        </div>
        <div className="flex-1">
          <label className={labelCls}>{t('materials.qty')}</label>
          <div className="relative">
            <input type="number" min="0" inputMode="numeric" value={qtyKg} onChange={e => setQtyKg(e.target.value)}
              className={`${inputCls} pr-9 tabular-nums`} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted">{t('materials.qcNote')}</p>
      {error && <p className="text-sm text-crit font-medium">{error}</p>}
    </Modal>
  )
}

function AdjustModal({ materials, user, onClose, t }) {
  const [materialId, setMaterialId] = useState('')
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    if (!materialId) { setError(t('materials.errMaterial')); return }
    if (!Number(delta)) { setError(t('materials.errDelta')); return }
    if (!reason.trim()) { setError(t('materials.errReason')); return }
    await createAdjustment({ kind: 'material', materialId, delta, reason, user })
    onClose()
  }

  return (
    <Modal title={t('materials.adjust')} onClose={onClose} t={t} footer={
      <>
        <button onClick={submit} className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors">
          {t('materials.saveAdjustment')}
        </button>
        <button onClick={onClose} className="px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
          {t('common.cancel')}
        </button>
      </>
    }>
      <div>
        <label className={labelCls}>{t('materials.material')}</label>
        <select autoFocus value={materialId} onChange={e => setMaterialId(e.target.value)} className={inputCls}>
          <option value="">{t('materials.selectMaterial')}</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>{t('materials.delta')}</label>
        <div className="relative">
          <input type="number" inputMode="decimal" value={delta} onChange={e => setDelta(e.target.value)}
            placeholder="-150" className={`${inputCls} pr-9 tabular-nums`} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
        </div>
        <p className="text-xs text-muted mt-1">{t('materials.deltaHint')}</p>
      </div>
      <div>
        <label className={labelCls}>{t('materials.reason')}</label>
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder={t('materials.reasonPlaceholder')} className={inputCls} />
      </div>
      {error && <p className="text-sm text-crit font-medium">{error}</p>}
    </Modal>
  )
}

function AddMaterialModal({ user, onClose, t }) {
  const [name, setName] = useState('')
  const [minLevelKg, setMinLevelKg] = useState('')

  async function submit() {
    if (!name.trim()) return
    await createRawMaterial({ name, minLevelKg })
    onClose()
  }

  return (
    <Modal title={t('materials.add')} onClose={onClose} t={t} footer={
      <>
        <button onClick={submit} className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors">
          {t('common.save')}
        </button>
        <button onClick={onClose} className="px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
          {t('common.cancel')}
        </button>
      </>
    }>
      <div>
        <label className={labelCls}>{t('materials.name')}</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} className={inputCls} />
        <p className="text-xs text-muted mt-1">{t('materials.nameHint')}</p>
      </div>
      <div>
        <label className={labelCls}>{t('materials.minLevel')}</label>
        <div className="relative">
          <input type="number" min="0" inputMode="numeric" value={minLevelKg} onChange={e => setMinLevelKg(e.target.value)}
            className={`${inputCls} pr-9 tabular-nums`} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
        </div>
      </div>
    </Modal>
  )
}

const QC_TINT = { pending: '#B45309', passed: '#15803D', failed: '#B91C1C' }

export default function Materials() {
  const [materials, setMaterials] = useState([])
  const [receipts, setReceipts] = useState([])
  const [batches, setBatches] = useState([])
  const [adjustments, setAdjustments] = useState([])
  const [modal, setModal] = useState(null) // 'receive' | 'adjust' | 'add'
  const { user } = useAuth()
  const { t, lang } = useI18n()

  useEffect(() => {
    let alive = true
    const refresh = () =>
      Promise.all([getRawMaterials(), getReceipts(), getBatches(), getAdjustments()]).then(
        ([m, r, b, a]) => { if (alive) { setMaterials(m); setReceipts(r); setBatches(b); setAdjustments(a) } }
      )
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const stock = useMemo(
    () => computeMaterialStock(materials, receipts, batches, adjustments),
    [materials, receipts, batches, adjustments]
  )
  const materialById = useMemo(() => Object.fromEntries(materials.map(m => [m.id, m])), [materials])

  const lowStock = materials.filter(m => m.minLevelKg > 0 && (stock[m.id]?.onHand ?? 0) < m.minLevelKg)
  const recentReceipts = useMemo(() => [...receipts].sort((a, b) => b.at.localeCompare(a.at)), [receipts])
  const recentAdjustments = useMemo(
    () => [...adjustments].filter(a => a.kind === 'material').sort((a, b) => b.at.localeCompare(a.at)),
    [adjustments]
  )

  return (
    <div className="p-6 flex flex-col gap-6">
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 bg-warn/10 border border-warn/30 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-warn shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-ink">{t('materials.lowTitle')}</p>
            <p className="text-muted">
              {lowStock.map(m => `${m.name} (${fmtKg(stock[m.id]?.onHand ?? 0)} / ${fmtKg(m.minLevelKg)})`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">{t('materials.stockTitle')}</h2>
        <div className="flex gap-2">
          <button onClick={() => setModal('add')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted border border-line rounded-lg hover:text-ink hover:bg-white transition-colors">
            <Plus size={15} /> {t('materials.add')}
          </button>
          <button onClick={() => setModal('adjust')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted border border-line rounded-lg hover:text-ink hover:bg-white transition-colors">
            <Scale size={15} /> {t('materials.adjust')}
          </button>
          <button onClick={() => setModal('receive')}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors">
            <PackagePlus size={16} /> {t('materials.receive')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {materials.map(m => {
          const s = stock[m.id] ?? { onHand: 0, received: 0, used: 0 }
          const low = m.minLevelKg > 0 && s.onHand < m.minLevelKg
          return (
            <div key={m.id} className={`bg-white border rounded-xl p-4 ${low ? 'border-warn/50' : 'border-line'}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-ink truncate">{m.name}</span>
                <span className={`font-display text-lg font-bold tabular-nums shrink-0 ${low ? 'text-warn' : 'text-ink'}`}>
                  {fmtKg(s.onHand)}
                </span>
              </div>
              <p className="text-xs text-muted mt-2 tabular-nums">
                {t('materials.received')} {fmtKg(s.received)} · {t('materials.used')} {fmtKg(s.used)}
                {m.minLevelKg > 0 && ` · ${t('materials.min')} ${fmtKg(m.minLevelKg)}`}
              </p>
            </div>
          )
        })}
      </div>

      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('materials.receiptsTitle')}</h2>
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">#</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('materials.material')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('materials.supplier')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('materials.lotNo')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('materials.qty')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('materials.qcStatus')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('batches.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentReceipts.map(r => {
                  const tint = QC_TINT[r.qcStatus]
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-display font-semibold text-ink tabular-nums whitespace-nowrap">{r.number}</td>
                      <td className="px-4 py-3 text-ink">{materialById[r.materialId]?.name || r.materialId}</td>
                      <td className="px-4 py-3 text-muted">{r.supplier}</td>
                      <td className="px-4 py-3 text-muted tabular-nums">{r.lotNo}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink whitespace-nowrap">{fmtKg(r.qtyKg)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ color: tint, backgroundColor: tint + '14' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tint }} />
                          {t(`materials.qc_${r.qcStatus}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted tabular-nums whitespace-nowrap">{fmtDate(r.at, lang)}</td>
                    </tr>
                  )
                })}
                {recentReceipts.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">{t('materials.noReceipts')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {recentAdjustments.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('materials.adjustmentsTitle')}</h2>
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {recentAdjustments.map(a => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-ink">{materialById[a.materialId]?.name || a.materialId}</td>
                    <td className={`px-4 py-3 text-right tabular-nums font-semibold whitespace-nowrap ${a.delta < 0 ? 'text-crit' : 'text-ok'}`}>
                      {a.delta > 0 ? '+' : ''}{fmtKg(a.delta)}
                    </td>
                    <td className="px-4 py-3 text-muted">{a.reason}</td>
                    <td className="px-4 py-3 text-muted tabular-nums whitespace-nowrap">{fmtDate(a.at, lang)} · {a.byName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal === 'receive' && <ReceiveModal materials={materials} user={user} onClose={() => setModal(null)} t={t} />}
      {modal === 'adjust' && <AdjustModal materials={materials} user={user} onClose={() => setModal(null)} t={t} />}
      {modal === 'add' && <AddMaterialModal user={user} onClose={() => setModal(null)} t={t} />}
    </div>
  )
}
