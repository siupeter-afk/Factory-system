import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Lock, FlaskConical, ChevronDown, ChevronRight } from 'lucide-react'
import {
  getProducts, getBatches, getOrders, createProduct, updateProduct,
  computeStock, canSeeFormulation, subscribe,
} from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

const FAMILIES = [
  'water_reducer', 'foaming_agent', 'retarder', 'accelerator',
  'air_entrainer', 'waterproofing', 'corrosion_inhibitor', 'viscosity_modifier',
]

const FAMILY_TINT = {
  water_reducer: '#2563EB',
  foaming_agent: '#0D9488',
  retarder: '#B45309',
  accelerator: '#DC2626',
  air_entrainer: '#0E7490',
  waterproofing: '#4F46E5',
  corrosion_inhibitor: '#57534E',
  viscosity_modifier: '#7C3AED',
}

const fmtL = n => `${Number(n).toLocaleString()} L`

function IngredientRows({ ingredients, setIngredients, t }) {
  const setRow = (i, patch) =>
    setIngredients(rows => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  return (
    <div className="flex flex-col gap-2">
      {ingredients.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={row.name} onChange={e => setRow(i, { name: e.target.value })}
            placeholder={t('products.ingredientName')}
            className="flex-1 min-w-0 px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <div className="relative w-24">
            <input
              type="number" min="0" max="100" step="0.1" value={row.pct}
              onChange={e => setRow(i, { pct: e.target.value })}
              className="w-full px-3 py-2 pr-7 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand tabular-nums"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
          </div>
          {ingredients.length > 1 && (
            <button
              onClick={() => setIngredients(rows => rows.filter((_, j) => j !== i))}
              aria-label={t('common.cancel')}
              className="p-2 text-muted hover:text-crit rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => setIngredients(rows => [...rows, { name: '', pct: '' }])}
        className="self-start text-xs font-medium text-brand hover:underline"
      >
        {t('products.addIngredient')}
      </button>
    </div>
  )
}

function AddProductModal({ onClose, withFormulation, t }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [family, setFamily] = useState(FAMILIES[0])
  const [ingredients, setIngredients] = useState([{ name: '', pct: '' }])
  const [notes, setNotes] = useState('')

  async function submit() {
    if (!code.trim() || !name.trim()) return
    const rows = ingredients
      .filter(r => r.name.trim())
      .map(r => ({ name: r.name.trim(), pct: Number(r.pct) || 0 }))
    const formulation = withFormulation && (rows.length || notes.trim())
      ? { ingredients: rows, notes: notes.trim() }
      : null
    await createProduct({ code, name, family, formulation })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">{t('products.add')}</h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-32">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('products.code')}</label>
              <input
                autoFocus value={code} onChange={e => setCode(e.target.value)} placeholder={t('products.codePlaceholder')}
                className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand tabular-nums"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('products.family')}</label>
              <select
                value={family} onChange={e => setFamily(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              >
                {FAMILIES.map(f => <option key={f} value={f}>{t(`family.${f}`)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('products.name')}</label>
            <input
              value={name} onChange={e => setName(e.target.value)} placeholder={t('products.namePlaceholder')}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {withFormulation && (
            <div className="border border-line rounded-xl p-4 bg-surface/60">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical size={15} className="text-brand" />
                <span className="text-xs font-semibold uppercase tracking-wide text-ink">{t('products.formulation')}</span>
                <span className="flex items-center gap-1 text-xs text-muted ml-auto"><Lock size={11} />{t('products.restricted')}</span>
              </div>
              <IngredientRows ingredients={ingredients} setIngredients={setIngredients} t={t} />
              <input
                value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('products.formulationNotes')}
                className="mt-3 w-full px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
              />
            </div>
          )}
        </div>
        <footer className="p-4 border-t border-line flex gap-2 shrink-0">
          <button
            onClick={submit}
            className="flex-1 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors"
          >
            {t('products.save')}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
            {t('common.cancel')}
          </button>
        </footer>
      </div>
    </div>
  )
}

function FormulationPanel({ product, canEdit, t }) {
  const [editing, setEditing] = useState(false)
  const [ingredients, setIngredients] = useState(
    product.formulation?.ingredients?.length ? product.formulation.ingredients : [{ name: '', pct: '' }]
  )
  const [notes, setNotes] = useState(product.formulation?.notes || '')

  async function saveEdit() {
    const rows = ingredients
      .filter(r => String(r.name).trim())
      .map(r => ({ name: String(r.name).trim(), pct: Number(r.pct) || 0 }))
    await updateProduct(product.id, { formulation: { ingredients: rows, notes: notes.trim() } })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-4 py-4 bg-surface/60">
        <IngredientRows ingredients={ingredients} setIngredients={setIngredients} t={t} />
        <input
          value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('products.formulationNotes')}
          className="mt-3 w-full max-w-md px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
        />
        <div className="flex gap-2 mt-3">
          <button onClick={saveEdit} className="px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-deep transition-colors">
            {t('products.save')}
          </button>
          <button onClick={() => setEditing(false)} className="px-4 py-2 text-muted text-xs font-semibold rounded-lg border border-line hover:bg-white transition-colors">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    )
  }

  const f = product.formulation
  return (
    <div className="px-4 py-4 bg-surface/60">
      {f?.ingredients?.length ? (
        <table className="text-sm max-w-md w-full">
          <tbody className="divide-y divide-line/60">
            {f.ingredients.map((r, i) => (
              <tr key={i}>
                <td className="py-1.5 text-ink">{r.name}</td>
                <td className="py-1.5 text-right tabular-nums text-ink font-medium">{r.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted">{t('products.noFormulation')}</p>
      )}
      {f?.notes && <p className="text-xs text-muted mt-2">{f.notes}</p>}
      {canEdit && (
        <button onClick={() => setEditing(true)} className="mt-3 text-xs font-medium text-brand hover:underline">
          {t('products.edit')}
        </button>
      )}
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [batches, setBatches] = useState([])
  const [orders, setOrders] = useState([])
  const [familyFilter, setFamilyFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [openRow, setOpenRow] = useState(null)
  const { user } = useAuth()
  const { t } = useI18n()

  useEffect(() => {
    let alive = true
    const refresh = () =>
      Promise.all([getProducts(), getBatches(), getOrders()]).then(([p, b, o]) => {
        if (alive) { setProducts(p); setBatches(b); setOrders(o) }
      })
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const stock = useMemo(() => computeStock(batches, orders), [batches, orders])

  const visible = useMemo(() => {
    const list = familyFilter ? products.filter(p => p.family === familyFilter) : products
    return [...list].sort((a, b) => a.code.localeCompare(b.code))
  }, [products, familyFilter])

  const canEdit = ['owner', 'operations', 'production', 'lab'].includes(user.role)
  const seesFormulation = canSeeFormulation(user.role)
  const editsFormulation = ['owner', 'production', 'lab'].includes(user.role)

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <select
          value={familyFilter} onChange={e => setFamilyFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">{t('products.allFamilies')}</option>
          {FAMILIES.map(f => <option key={f} value={f}>{t(`family.${f}`)}</option>)}
        </select>
        {canEdit && (
          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors"
          >
            <Plus size={16} /> {t('products.add')}
          </button>
        )}
      </div>

      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {seesFormulation && <th className="w-8" />}
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('products.code')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('products.name')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('products.family')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('products.stock')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('products.active')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map(p => {
                const tint = FAMILY_TINT[p.family] || '#64748B'
                const s = stock[p.id]
                const open = openRow === p.id
                return (
                  <FragmentRow key={p.id}>
                    <tr className={p.active ? '' : 'opacity-50'}>
                      {seesFormulation && (
                        <td className="pl-3">
                          <button
                            onClick={() => setOpenRow(open ? null : p.id)}
                            aria-label={t('products.formulation')}
                            aria-expanded={open}
                            className="p-1 text-muted hover:text-brand rounded transition-colors"
                          >
                            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-3 font-display font-semibold text-ink tabular-nums whitespace-nowrap">{p.code}</td>
                      <td className="px-4 py-3 text-ink">
                        <span className="flex items-center gap-2">
                          {p.name}
                          {!seesFormulation && p.formulation && (
                            <span title={t('products.restricted')}><Lock size={12} className="text-muted shrink-0" /></span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ color: tint, backgroundColor: tint + '14' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tint }} />
                          {t(`family.${p.family}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                        {s ? (
                          <span className={s.available - s.reserved < 0 ? 'text-crit font-semibold' : 'text-ink font-medium'}>
                            {fmtL(s.available)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canEdit ? (
                          <button
                            onClick={() => updateProduct(p.id, { active: !p.active })}
                            role="switch" aria-checked={p.active}
                            className={`relative w-9 h-5 rounded-full transition-colors ${p.active ? 'bg-ok' : 'bg-line'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.active ? 'left-[18px]' : 'left-0.5'}`} />
                          </button>
                        ) : (
                          <span className="text-xs text-muted">{p.active ? t('products.active') : t('products.inactive')}</span>
                        )}
                      </td>
                    </tr>
                    {seesFormulation && open && (
                      <tr>
                        <td colSpan={6} className="p-0 border-t border-line/60">
                          <FormulationPanel product={p} canEdit={editsFormulation} t={t} />
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddProductModal onClose={() => setShowAdd(false)} withFormulation={editsFormulation} t={t} />
      )}
    </div>
  )
}

// Table rows can't be wrapped in a div; a fragment keeps the pair together.
function FragmentRow({ children }) {
  return <>{children}</>
}
