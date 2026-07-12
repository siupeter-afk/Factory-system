import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { getProducts, createProduct, updateProduct, subscribe } from '../data/db'
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

function AddProductModal({ onClose, t }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [family, setFamily] = useState(FAMILIES[0])

  async function submit() {
    if (!code.trim() || !name.trim()) return
    await createProduct({ code, name, family })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line">
          <h2 className="font-display font-semibold text-ink">{t('products.add')}</h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('products.code')}</label>
            <input
              autoFocus value={code} onChange={e => setCode(e.target.value)} placeholder={t('products.codePlaceholder')}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('products.name')}</label>
            <input
              value={name} onChange={e => setName(e.target.value)} placeholder={t('products.namePlaceholder')}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('products.family')}</label>
            <select
              value={family} onChange={e => setFamily(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
            >
              {FAMILIES.map(f => <option key={f} value={f}>{t(`family.${f}`)}</option>)}
            </select>
          </div>
        </div>
        <footer className="p-4 border-t border-line flex gap-2">
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

export default function Products() {
  const [products, setProducts] = useState([])
  const [familyFilter, setFamilyFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const { user } = useAuth()
  const { t } = useI18n()

  useEffect(() => {
    let alive = true
    const refresh = () => getProducts().then(p => alive && setProducts(p))
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const visible = useMemo(() => {
    const list = familyFilter ? products.filter(p => p.family === familyFilter) : products
    return [...list].sort((a, b) => a.code.localeCompare(b.code))
  }, [products, familyFilter])

  const canEdit = ['owner', 'operations'].includes(user.role)

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
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('products.code')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('products.name')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('products.family')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted text-right">{t('products.active')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map(p => {
                const tint = FAMILY_TINT[p.family] || '#64748B'
                return (
                  <tr key={p.id} className={p.active ? '' : 'opacity-50'}>
                    <td className="px-4 py-3 font-display font-semibold text-ink tabular-nums whitespace-nowrap">{p.code}</td>
                    <td className="px-4 py-3 text-ink">{p.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: tint, backgroundColor: tint + '14' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tint }} />
                        {t(`family.${p.family}`)}
                      </span>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} t={t} />}
    </div>
  )
}
