import { useEffect, useMemo, useState } from 'react'
import { X, FlaskConical, CheckCircle2, XCircle } from 'lucide-react'
import {
  getBatches, getProducts, getReceipts, getRawMaterials, getQcTests,
  createQcTest, batchQcStatus, subscribe,
} from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

function fmtDate(iso, lang) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
}

const STATUS_TINT = {
  pot_pending: '#B45309',
  tank_pending: '#0E7490',
  released: '#15803D',
  failed: '#B91C1C',
}

const inputCls = 'w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white'

// Test a batch (pot/tank, params from product specs) or an incoming receipt (pass/fail).
function TestModal({ target, products, materials, user, onClose, t }) {
  const isIncoming = target.kind === 'incoming'
  const product = isIncoming ? null : products.find(p => p.id === target.batch.productId)
  const specs = product?.specs || []
  const [values, setValues] = useState(specs.map(() => ''))
  const [incomingPass, setIncomingPass] = useState(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const evaluated = specs.map((s, i) => {
    const v = values[i]
    if (v === '') return { ...s, value: null, pass: null }
    const n = Number(v)
    const pass = (s.min == null || n >= s.min) && (s.max == null || n <= s.max)
    return { ...s, value: n, pass }
  })

  async function submit() {
    if (isIncoming) {
      if (incomingPass == null) { setError(t('qc.errVerdict')); return }
      await createQcTest({
        stage: 'incoming',
        receiptId: target.receipt.id,
        materialId: target.receipt.materialId,
        results: [],
        pass: incomingPass,
        note, user,
      })
    } else {
      if (specs.length && evaluated.some(r => r.value == null)) { setError(t('qc.errValues')); return }
      if (!specs.length && incomingPass == null) { setError(t('qc.errVerdict')); return }
      await createQcTest({
        stage: target.stage,
        batchId: target.batch.id,
        productId: target.batch.productId,
        results: specs.length ? evaluated.map(r => ({ param: r.param, unit: r.unit, value: r.value, min: r.min, max: r.max, pass: r.pass })) : [],
        pass: specs.length ? undefined : incomingPass,
        note, user,
      })
    }
    onClose()
  }

  const title = isIncoming
    ? `${t('qc.stage_incoming')} — ${target.receipt.number}`
    : `${t(`qc.stage_${target.stage}`)} — ${target.batch.number}`
  const subject = isIncoming
    ? materials.find(m => m.id === target.receipt.materialId)?.name
    : `${product?.code} — ${product?.name}`

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <p className="text-sm text-ink font-medium -mt-1">{subject}</p>

          {!isIncoming && specs.length > 0 && (
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-2 items-center text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('qc.param')}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('qc.range')}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('qc.value')}</span>
              {evaluated.map((r, i) => (
                <FragmentRow key={i}>
                  <span className="text-ink truncate">{r.param}{r.unit ? ` (${r.unit})` : ''}</span>
                  <span className="text-right tabular-nums text-muted whitespace-nowrap">{r.min ?? '—'} – {r.max ?? '—'}</span>
                  <span className="relative w-28 inline-flex items-center">
                    <input
                      type="number" step="any" inputMode="decimal" value={values[i]}
                      onChange={e => setValues(a => a.map((v, j) => (j === i ? e.target.value : v)))}
                      className={`w-full px-2 py-1.5 text-sm text-right border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand tabular-nums bg-white ${
                        r.pass === false ? 'border-crit ring-1 ring-crit/40' : r.pass ? 'border-ok' : 'border-line'
                      }`}
                    />
                    {r.pass != null && (
                      <span className="absolute -right-0.5 -top-1.5">
                        {r.pass
                          ? <CheckCircle2 size={13} className="text-ok" />
                          : <XCircle size={13} className="text-crit" />}
                      </span>
                    )}
                  </span>
                </FragmentRow>
              ))}
            </div>
          )}

          {(isIncoming || !specs.length) && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('qc.verdict')}</label>
              <div className="flex gap-2">
                <button onClick={() => setIncomingPass(true)} aria-pressed={incomingPass === true}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border transition-colors ${
                    incomingPass === true ? 'border-ok bg-ok/10 text-ok' : 'border-line text-muted hover:text-ink'
                  }`}>
                  <CheckCircle2 size={16} /> {t('qc.pass')}
                </button>
                <button onClick={() => setIncomingPass(false)} aria-pressed={incomingPass === false}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border transition-colors ${
                    incomingPass === false ? 'border-crit bg-crit/10 text-crit' : 'border-line text-muted hover:text-ink'
                  }`}>
                  <XCircle size={16} /> {t('qc.fail')}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('batches.note')}</label>
            <input value={note} onChange={e => setNote(e.target.value)} className={inputCls} />
          </div>
          {error && <p className="text-sm text-crit font-medium">{error}</p>}
        </div>
        <footer className="p-4 border-t border-line flex gap-2 shrink-0">
          <button onClick={submit} className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors">
            {t('qc.saveTest')}
          </button>
          <button onClick={onClose} className="px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
            {t('common.cancel')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default function QC() {
  const [batches, setBatches] = useState([])
  const [products, setProducts] = useState([])
  const [receipts, setReceipts] = useState([])
  const [materials, setMaterials] = useState([])
  const [tests, setTests] = useState([])
  const [testing, setTesting] = useState(null)
  const { user } = useAuth()
  const { t, lang } = useI18n()

  useEffect(() => {
    let alive = true
    const refresh = () =>
      Promise.all([getBatches(), getProducts(), getReceipts(), getRawMaterials(), getQcTests()]).then(
        ([b, p, r, m, q]) => { if (alive) { setBatches(b); setProducts(p); setReceipts(r); setMaterials(m); setTests(q) } }
      )
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const productById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products])
  const materialById = useMemo(() => Object.fromEntries(materials.map(m => [m.id, m])), [materials])

  const pendingIncoming = receipts.filter(r => r.qcStatus === 'pending')
  const batchQueue = useMemo(() =>
    [...batches]
      .map(b => ({ batch: b, status: batchQcStatus(b, tests) }))
      .filter(x => x.status === 'pot_pending' || x.status === 'tank_pending')
      .sort((a, b) => a.batch.at.localeCompare(b.batch.at)),
    [batches, tests])
  const recentTests = useMemo(() => [...tests].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 30), [tests])

  const canTest = ['owner', 'lab'].includes(user.role)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Incoming materials queue */}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('qc.incomingTitle')}</h2>
        {pendingIncoming.length === 0 ? (
          <div className="border border-dashed border-line rounded-xl py-6 text-center text-sm text-muted">{t('qc.noneIncoming')}</div>
        ) : (
          <div className="flex flex-col gap-2 max-w-2xl">
            {pendingIncoming.map(r => (
              <div key={r.id} className="bg-white border border-line rounded-xl flex items-center p-4 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {materialById[r.materialId]?.name} · <span className="tabular-nums">{Number(r.qtyKg).toLocaleString()} kg</span>
                  </p>
                  <p className="text-xs text-muted tabular-nums">{r.number} · {r.supplier} · {t('materials.lotNo')} {r.lotNo}</p>
                </div>
                {canTest && (
                  <button onClick={() => setTesting({ kind: 'incoming', receipt: r })}
                    className="px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors shrink-0">
                    {t('qc.test')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch queue */}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('qc.batchTitle')}</h2>
        {batchQueue.length === 0 ? (
          <div className="border border-dashed border-line rounded-xl py-6 text-center text-sm text-muted">{t('qc.noneBatches')}</div>
        ) : (
          <div className="flex flex-col gap-2 max-w-2xl">
            {batchQueue.map(({ batch, status }) => {
              const p = productById[batch.productId]
              const stage = status === 'pot_pending' ? 'pot' : 'tank'
              const tint = STATUS_TINT[status]
              return (
                <div key={batch.id} className="bg-white border border-line rounded-xl flex items-center p-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-ink tabular-nums">{batch.number}</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: tint, backgroundColor: tint + '14' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tint }} />
                        {t(`qc.status_${status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-ink truncate mt-0.5">{p ? `${p.code} — ${p.name}` : batch.productId}</p>
                    <p className="text-xs text-muted tabular-nums">{Number(batch.volumeL).toLocaleString()} L · {fmtDate(batch.at, lang)}</p>
                  </div>
                  {canTest && (
                    <button onClick={() => setTesting({ kind: 'batch', stage, batch })}
                      className="px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors shrink-0">
                      {t(`qc.stage_${stage}`)}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Test history */}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('qc.historyTitle')}</h2>
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('qc.stageCol')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('qc.subject')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('qc.resultCol')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('qc.values')}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('batches.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentTests.map(q => {
                  const subject = q.batchId
                    ? batches.find(b => b.id === q.batchId)?.number
                    : receipts.find(r => r.id === q.receiptId)?.number
                  const tint = q.pass ? '#15803D' : '#B91C1C'
                  return (
                    <tr key={q.id}>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">{t(`qc.stage_${q.stage}`)}</td>
                      <td className="px-4 py-3 font-display font-semibold text-ink tabular-nums whitespace-nowrap">{subject}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ color: tint, backgroundColor: tint + '14' }}>
                          {q.pass ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {q.pass ? t('qc.pass') : t('qc.fail')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted tabular-nums">
                        {q.results.map(r => `${r.param} ${r.value}`).join(' · ') || q.note || '—'}
                      </td>
                      <td className="px-4 py-3 text-muted tabular-nums whitespace-nowrap">{fmtDate(q.at, lang)} · {q.byName}</td>
                    </tr>
                  )
                })}
                {recentTests.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">{t('qc.noTests')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {testing && (
        <TestModal target={testing} products={products} materials={materials} user={user}
          onClose={() => setTesting(null)} t={t} />
      )}
    </div>
  )
}

function FragmentRow({ children }) {
  return <>{children}</>
}
