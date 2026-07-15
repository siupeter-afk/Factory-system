import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Download, ClipboardList, Flag } from 'lucide-react'
import {
  getFormTemplates, getFormSubmissions,
  createFormTemplate, updateFormTemplate, submitForm, downloadCsv,
  subscribe,
} from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

const ROLES = ['all', 'operations', 'production', 'lab', 'engineering', 'driver', 'accountant']
const FIELD_TYPES = ['text', 'number', 'select', 'checkbox', 'date']

const inputCls = 'w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white'
const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5'

function fmtDateTime(iso, lang) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const newFieldId = () => `fld-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

// ---------- builder ----------
function BuilderModal({ template, user, onClose, t }) {
  const [title, setTitle] = useState(template?.title || '')
  const [department, setDepartment] = useState(template?.department || 'all')
  const [fields, setFields] = useState(
    template?.fields?.map(f => ({ ...f })) || [{ id: newFieldId(), label: '', type: 'text', required: false }]
  )
  const [error, setError] = useState('')

  const setField = (i, patch) => setFields(fs => fs.map((f, j) => (j === i ? { ...f, ...patch } : f)))

  async function submit() {
    if (!title.trim()) { setError(t('forms.errTitle')); return }
    const cleaned = fields
      .filter(f => f.label.trim())
      .map(f => ({
        ...f,
        label: f.label.trim(),
        options: f.type === 'select'
          ? (typeof f.options === 'string' ? f.options.split(',').map(s => s.trim()).filter(Boolean) : f.options || [])
          : undefined,
      }))
    if (!cleaned.length) { setError(t('forms.errFields')); return }
    if (template) {
      await updateFormTemplate(template.id, { title, department, fields: cleaned }, user)
    } else {
      await createFormTemplate({ title, department, fields: cleaned, user })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">
            {template ? t('forms.editForm') : t('forms.newForm')}
            {template && <span className="ml-2 text-xs font-normal text-muted">v{template.version} → v{template.version + 1}</span>}
          </h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className={labelCls}>{t('forms.formTitle')}</label>
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                placeholder={t('forms.titlePlaceholder')} className={inputCls} />
            </div>
            <div className="w-44">
              <label className={labelCls}>{t('forms.department')}</label>
              <select value={department} onChange={e => setDepartment(e.target.value)} className={inputCls}>
                {ROLES.map(r => <option key={r} value={r}>{r === 'all' ? t('forms.allDepartments') : t(`role.${r}`)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t('forms.fields')}</label>
            <div className="flex flex-col gap-3">
              {fields.map((f, i) => (
                <div key={f.id} className="border border-line rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <input value={f.label} onChange={e => setField(i, { label: e.target.value })}
                      placeholder={t('forms.fieldLabel')} className={`${inputCls} flex-1`} />
                    <select value={f.type} onChange={e => setField(i, { type: e.target.value })}
                      className="w-32 px-2 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white">
                      {FIELD_TYPES.map(ty => <option key={ty} value={ty}>{t(`forms.type_${ty}`)}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap cursor-pointer">
                      <input type="checkbox" checked={!!f.required} onChange={e => setField(i, { required: e.target.checked })}
                        className="accent-[var(--c-brand)]" />
                      {t('forms.required')}
                    </label>
                    {fields.length > 1 && (
                      <button onClick={() => setFields(fs => fs.filter((_, j) => j !== i))}
                        aria-label={t('common.cancel')} className="p-1.5 text-muted hover:text-crit rounded-lg transition-colors">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  {f.type === 'select' && (
                    <input
                      value={typeof f.options === 'string' ? f.options : (f.options || []).join(', ')}
                      onChange={e => setField(i, { options: e.target.value })}
                      placeholder={t('forms.optionsPlaceholder')} className={inputCls}
                    />
                  )}
                  {f.type === 'number' && (
                    <div className="flex gap-2">
                      <input value={f.unit || ''} onChange={e => setField(i, { unit: e.target.value })}
                        placeholder={t('forms.unit')} className={`${inputCls} w-28`} />
                      <input type="number" step="any" value={f.min ?? ''} onChange={e => setField(i, { min: e.target.value })}
                        placeholder={t('forms.min')} className={`${inputCls} w-28 tabular-nums`} />
                      <input type="number" step="any" value={f.max ?? ''} onChange={e => setField(i, { max: e.target.value })}
                        placeholder={t('forms.max')} className={`${inputCls} w-28 tabular-nums`} />
                      <p className="text-xs text-muted self-center">{t('forms.rangeHint')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setFields(fs => [...fs, { id: newFieldId(), label: '', type: 'text', required: false }])}
              className="mt-2 text-xs font-medium text-brand hover:underline"
            >
              {t('forms.addField')}
            </button>
          </div>
          {error && <p className="text-sm text-crit font-medium">{error}</p>}
        </div>
        <footer className="p-4 border-t border-line flex gap-2 shrink-0">
          <button onClick={submit} className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors">
            {t('forms.saveForm')}
          </button>
          <button onClick={onClose} className="px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
            {t('common.cancel')}
          </button>
        </footer>
      </div>
    </div>
  )
}

// ---------- filling ----------
function FillModal({ template, user, onClose, t }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(template.fields.map(f => [f.id, f.type === 'checkbox' ? false : '']))
  )
  const [error, setError] = useState('')

  async function submit() {
    const missing = template.fields.filter(f =>
      f.required && (f.type === 'checkbox' ? !values[f.id] : values[f.id] === '' || values[f.id] == null)
    )
    if (missing.length) { setError(`${t('forms.errRequired')}: ${missing.map(f => f.label).join(', ')}`); return }
    await submitForm({ templateId: template.id, values, user })
    onClose()
  }

  const set = (id, v) => setValues(vals => ({ ...vals, [id]: v }))

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">{template.title}</h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {template.fields.map(f => (
            <div key={f.id}>
              <label className={labelCls}>
                {f.label}{f.required && <span className="text-crit"> *</span>}
                {f.type === 'number' && (f.min != null || f.max != null) && (
                  <span className="ml-2 font-normal normal-case text-muted tabular-nums">({f.min ?? '—'} – {f.max ?? '—'}{f.unit ? ` ${f.unit}` : ''})</span>
                )}
              </label>
              {f.type === 'text' && (
                <input value={values[f.id]} onChange={e => set(f.id, e.target.value)} className={inputCls} />
              )}
              {f.type === 'number' && (
                <div className="relative">
                  <input type="number" step="any" inputMode="decimal" value={values[f.id]}
                    onChange={e => set(f.id, e.target.value)} className={`${inputCls} tabular-nums ${f.unit ? 'pr-12' : ''}`} />
                  {f.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{f.unit}</span>}
                </div>
              )}
              {f.type === 'select' && (
                <select value={values[f.id]} onChange={e => set(f.id, e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {f.type === 'checkbox' && (
                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer py-1">
                  <input type="checkbox" checked={!!values[f.id]} onChange={e => set(f.id, e.target.checked)}
                    className="w-5 h-5 accent-[var(--c-brand)]" />
                  {t('forms.yes')}
                </label>
              )}
              {f.type === 'date' && (
                <input type="date" value={values[f.id]} onChange={e => set(f.id, e.target.value)} className={`${inputCls} tabular-nums`} />
              )}
            </div>
          ))}
          {error && <p className="text-sm text-crit font-medium">{error}</p>}
        </div>
        <footer className="p-4 border-t border-line flex gap-2 shrink-0">
          <button onClick={submit} className="flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors">
            {t('forms.submit')}
          </button>
          <button onClick={onClose} className="px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
            {t('common.cancel')}
          </button>
        </footer>
      </div>
    </div>
  )
}

// ---------- submissions ----------
function SubmissionsModal({ template, submissions, onClose, t, lang }) {
  const rows = useMemo(
    () => submissions.filter(s => s.templateId === template.id).sort((a, b) => b.at.localeCompare(a.at)),
    [submissions, template]
  )

  function exportCsv() {
    const header = [t('forms.submittedAt'), t('order.by'), ...template.fields.map(f => f.label + (f.unit ? ` (${f.unit})` : ''))]
    const data = rows.map(s => [
      new Date(s.at).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US'),
      s.byName,
      ...template.fields.map(f => {
        const v = s.values[f.id]
        if (f.type === 'checkbox') return v ? 'Y' : 'N'
        return v ?? ''
      }),
    ])
    downloadCsv(`${template.title.replace(/[^\w一-鿿-]+/g, '_')}.csv`, header, data)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">
            {template.title} <span className="text-xs font-normal text-muted">· {rows.length} {t('forms.entries')}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand border border-brand/30 rounded-lg hover:bg-brand/5 transition-colors">
              <Download size={15} /> {t('forms.exportCsv')}
            </button>
            <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white shadow-[0_1px_0_var(--c-line)]">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">{t('forms.submittedAt')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('order.by')}</th>
                {template.fields.map(f => (
                  <th key={f.id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">
                    {f.label}{f.unit ? ` (${f.unit})` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(s => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-muted tabular-nums whitespace-nowrap">{fmtDateTime(s.at, lang)}</td>
                  <td className="px-4 py-3 text-ink whitespace-nowrap">{s.byName}</td>
                  {template.fields.map(f => {
                    const v = s.values[f.id]
                    const flagged = s.flags?.includes(f.id)
                    return (
                      <td key={f.id} className={`px-4 py-3 tabular-nums ${flagged ? 'text-warn font-semibold' : 'text-ink'}`}>
                        {f.type === 'checkbox' ? (v ? '✓' : '—') : (v === '' || v == null ? '—' : String(v))}
                        {flagged && <Flag size={11} className="inline ml-1 -mt-0.5 text-warn" />}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={2 + template.fields.length} className="px-4 py-10 text-center text-muted">{t('forms.noEntries')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------- page ----------
export default function Forms() {
  const [templates, setTemplates] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [building, setBuilding] = useState(null)   // null | 'new' | template
  const [filling, setFilling] = useState(null)
  const [viewing, setViewing] = useState(null)
  const { user } = useAuth()
  const { t, lang } = useI18n()

  useEffect(() => {
    let alive = true
    const refresh = () =>
      Promise.all([getFormTemplates(), getFormSubmissions()]).then(
        ([f, s]) => { if (alive) { setTemplates(f); setSubmissions(s) } }
      )
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const isOwner = user.role === 'owner'
  const visible = templates.filter(f =>
    f.active && (isOwner || f.department === 'all' || f.department === user.role)
  )
  const countFor = id => submissions.filter(s => s.templateId === id).length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">{t('forms.title')}</h2>
        {isOwner && (
          <button onClick={() => setBuilding('new')}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors">
            <Plus size={16} /> {t('forms.newForm')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map(f => (
          <div key={f.id} className="bg-white border border-line rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
                <ClipboardList size={17} className="text-brand" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{f.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {f.department === 'all' ? t('forms.allDepartments') : t(`role.${f.department}`)} · v{f.version}
                  {' · '}{countFor(f.id)} {t('forms.entries')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              <button onClick={() => setFilling(f)}
                className="flex-1 px-3 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors">
                {t('forms.fill')}
              </button>
              <button onClick={() => setViewing(f)}
                className="px-3 py-2.5 text-sm font-semibold text-muted border border-line rounded-lg hover:text-ink hover:bg-surface transition-colors">
                {t('forms.entriesBtn')}
              </button>
              {isOwner && (
                <button onClick={() => setBuilding(f)}
                  className="px-3 py-2.5 text-sm font-semibold text-muted border border-line rounded-lg hover:text-ink hover:bg-surface transition-colors">
                  {t('products.edit')}
                </button>
              )}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="col-span-full border border-dashed border-line rounded-xl py-14 text-center text-sm text-muted">
            {t('forms.empty')}
          </div>
        )}
      </div>

      {building && (
        <BuilderModal template={building === 'new' ? null : building} user={user}
          onClose={() => setBuilding(null)} t={t} />
      )}
      {filling && <FillModal template={filling} user={user} onClose={() => setFilling(null)} t={t} />}
      {viewing && <SubmissionsModal template={viewing} submissions={submissions} onClose={() => setViewing(null)} t={t} lang={lang} />}
    </div>
  )
}
