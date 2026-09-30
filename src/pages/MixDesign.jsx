import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Settings2, Download, Printer, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  getTrialMixes, getMixSettings, getProducts, getCustomers,
  createTrialMix, recordFreshProperties, addStrengthBreaks, updateMixSettings,
  downloadCsv, subscribe,
} from '../data/db'
import {
  MIX_INGREDIENTS, binderKg, admixtureKg, wcm, scmFraction, absoluteVolumes,
  solveAggregates, gwpEstimate, strengthByAge, strengthAt, compareMixes,
  BOXCRETE_HEADER, boxcreteRows,
} from '../data/mix'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

const AGES = [1, 3, 7, 28, 56]
const f0 = n => (n == null ? '—' : Math.round(n).toLocaleString())
const f1 = n => (n == null ? '—' : Number(n).toFixed(1))
const f2 = n => (n == null ? '—' : Number(n).toFixed(2))
const pctStr = n => (n == null ? '—' : `${n > 0 ? '+' : ''}${(n * 100).toFixed(1)}%`)
const signed = (n, fmt = f0) => (n == null ? '—' : `${n > 0 ? '+' : ''}${fmt(n)}`)

function fmtDate(iso, lang) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function Modal({ title, onClose, children, footer, t, wide }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] flex flex-col`}>
        <header className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
          <h2 className="font-display font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">{children}</div>
        {footer && <footer className="p-4 border-t border-line flex gap-2 shrink-0">{footer}</footer>}
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white'
const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5'
const primaryBtn = 'flex-1 px-4 py-3 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors'
const secondaryBtn = 'px-4 py-3 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors'
const toolBtn = 'flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted border border-line rounded-lg hover:text-ink hover:bg-white transition-colors'

function NumField({ label, unit, value, onChange, step = 'any' }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input type="number" min="0" step={step} inputMode="decimal" value={value ?? ''} onChange={e => onChange(e.target.value)}
          className={`${inputCls} ${unit ? 'pr-14' : ''} tabular-nums`} />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{unit}</span>}
      </div>
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`font-display font-bold tabular-nums ${tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

/** Derived numbers for a design — shown live while entering and on the detail view. */
function DerivedPanel({ mix, settings, t }) {
  const vol = absoluteVolumes(mix, settings.sg)
  const yieldGood = Math.abs(vol.total - 1) <= 0.02
  return (
    <div className="bg-surface rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
      <Stat label={t('mix.binder')} value={`${f0(binderKg(mix.materials))} kg`} />
      <Stat label={t('mix.wcm')} value={f2(wcm(mix))} />
      <Stat label={t('mix.scm')} value={`${f0(scmFraction(mix.materials) * 100)}%`} />
      <Stat label={t('mix.yield')} value={`${vol.total.toFixed(3)} m³`} tone={yieldGood ? 'ok' : 'warn'} />
      <Stat label={t('mix.gwp')} value={`${f0(gwpEstimate(mix, settings.gwp).total)} kg`} />
    </div>
  )
}

const EMPTY_MATERIALS = { cement: '', flyAsh: '', slag: '', water: '', fineAgg: '', coarseAgg: '' }

function NewMixModal({ mixes, products, customers, settings, user, onClose, t }) {
  const [form, setForm] = useState({
    title: '', partnerId: '', productId: '', dosagePct: '', admixtureSolidsPct: '', admixtureGwp: '',
    referenceId: '', materials: EMPTY_MATERIALS, airPct: '2', targetMpa: '', targetSlumpMm: '', notes: '',
  })
  const [sandPct, setSandPct] = useState('42')
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setMat = (k, v) => setForm(f => ({ ...f, materials: { ...f.materials, [k]: v } }))

  // Variations are the normal case: start from an existing design and change one thing.
  function copyFrom(id) {
    const src = mixes.find(m => m.id === id)
    if (!src) return
    setForm(f => ({
      ...f,
      partnerId: src.partnerId || '', productId: src.productId || '',
      dosagePct: src.dosagePct ?? '', admixtureSolidsPct: src.admixtureSolidsPct ?? '',
      admixtureGwp: src.admixtureGwp ?? '', referenceId: src.referenceId || src.id,
      materials: { ...EMPTY_MATERIALS, ...src.materials }, airPct: src.airPct ?? '',
      targetMpa: src.targetMpa ?? '', targetSlumpMm: src.targetSlumpMm ?? '',
    }))
  }

  function fillAggregates() {
    const agg = solveAggregates(form, Number(sandPct) / 100, settings.sg)
    if (!agg) { setError(t('mix.errOverfill')); return }
    setError('')
    setForm(f => ({ ...f, materials: { ...f.materials, ...agg } }))
  }

  async function submit() {
    if (!(binderKg(form.materials) > 0)) { setError(t('mix.errBinder')); return }
    if (!(Number(form.materials.water) > 0)) { setError(t('mix.errWater')); return }
    const materials = Object.fromEntries(MIX_INGREDIENTS.map(k => [k, Number(form.materials[k] || 0)]))
    await createTrialMix({ ...form, materials }, user)
    onClose()
  }

  const matLabel = k => t(`mix.m_${k}`)

  return (
    <Modal wide title={t('mix.new')} onClose={onClose} t={t} footer={
      <>
        <button onClick={submit} className={primaryBtn}>{t('mix.save')}</button>
        <button onClick={onClose} className={secondaryBtn}>{t('common.cancel')}</button>
      </>
    }>
      {mixes.length > 0 && (
        <div>
          <label className={labelCls}>{t('mix.copyFrom')}</label>
          <select defaultValue="" onChange={e => copyFrom(e.target.value)} className={inputCls}>
            <option value="">—</option>
            {[...mixes].reverse().map(m => <option key={m.id} value={m.id}>{m.number} · {m.title}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t('mix.title')}</label>
          <input autoFocus value={form.title} onChange={e => set('title', e.target.value)} placeholder={t('mix.titlePlaceholder')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t('mix.partner')}</label>
          <select value={form.partnerId} onChange={e => set('partnerId', e.target.value)} className={inputCls}>
            <option value="">{t('mix.inHouse')}</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink mt-1">{t('mix.admixture')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>{t('mix.product')}</label>
          <select value={form.productId} onChange={e => set('productId', e.target.value)} className={inputCls}>
            <option value="">{t('mix.noAdmixture')}</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
          </select>
        </div>
        <NumField label={t('mix.dosage')} unit={t('mix.pctBinder')} value={form.dosagePct} onChange={v => set('dosagePct', v)} />
        <NumField label={t('mix.solids')} unit="%" value={form.admixtureSolidsPct} onChange={v => set('admixtureSolidsPct', v)} />
      </div>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink mt-1">{t('mix.proportions')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MIX_INGREDIENTS.map(k => (
          <NumField key={k} label={matLabel(k)} unit="kg/m³" value={form.materials[k]} onChange={v => setMat(k, v)} />
        ))}
        <NumField label={t('mix.air')} unit="%" value={form.airPct} onChange={v => set('airPct', v)} />
      </div>
      <div className="flex items-end gap-2">
        <div className="w-40">
          <NumField label={t('mix.sandPct')} unit="%" value={sandPct} onChange={setSandPct} />
        </div>
        <button type="button" onClick={fillAggregates} className={toolBtn}>{t('mix.fillAggregates')}</button>
      </div>
      <p className="text-xs text-muted -mt-2">{t('mix.fillHint')}</p>

      <DerivedPanel mix={{ ...form, dosagePct: Number(form.dosagePct || 0) }} settings={settings} t={t} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NumField label={t('mix.targetMpa')} unit="MPa" value={form.targetMpa} onChange={v => set('targetMpa', v)} />
        <NumField label={t('mix.targetSlump')} unit="mm" value={form.targetSlumpMm} onChange={v => set('targetSlumpMm', v)} />
        <div className="col-span-2">
          <label className={labelCls}>{t('mix.reference')}</label>
          <select value={form.referenceId} onChange={e => set('referenceId', e.target.value)} className={inputCls}>
            <option value="">—</option>
            {mixes.map(m => <option key={m.id} value={m.id}>{m.number} · {m.title}</option>)}
          </select>
        </div>
      </div>
      <NumField label={t('mix.admixtureGwp')} unit="kg CO₂e/kg" value={form.admixtureGwp} onChange={v => set('admixtureGwp', v)} />
      <div>
        <label className={labelCls}>{t('mix.notes')}</label>
        <input value={form.notes} onChange={e => set('notes', e.target.value)} className={inputCls} />
      </div>
      {error && <p className="text-sm text-crit font-medium">{error}</p>}
    </Modal>
  )
}

function StrengthChart({ mix, reference, t }) {
  const ages = [...new Set([...strengthByAge(mix.breaks), ...strengthByAge(reference?.breaks)].map(s => s.ageDays))].sort((a, b) => a - b)
  if (!ages.length) return null
  const data = ages.map(age => ({
    age,
    trial: strengthAt(mix, age),
    reference: reference ? strengthAt(reference, age) : null,
  }))
  return (
    <div className="h-56 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--c-line)" strokeDasharray="3 3" />
          <XAxis dataKey="age" type="number" domain={[0, 'dataMax']} ticks={data.map(d => d.age)} tick={{ fontSize: 12 }} unit="d" />
          <YAxis tick={{ fontSize: 12 }} unit=" MPa" width={64} />
          <Tooltip formatter={v => (v == null ? '—' : `${f1(v)} MPa`)} labelFormatter={a => `${a} ${t('mix.days')}`} />
          <Legend />
          <Line type="monotone" dataKey="trial" name={mix.number} stroke="var(--c-brand)" strokeWidth={2} connectNulls dot isAnimationActive={false} />
          {reference && <Line type="monotone" dataKey="reference" name={reference.number} stroke="var(--c-muted)" strokeDasharray="5 4" connectNulls dot isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ComparisonTable({ mix, reference, settings, t }) {
  const c = compareMixes(mix, reference, settings)
  const rows = [
    [t('mix.m_cement'), `${signed(c.cementDelta)} kg/m³`, pctStr(c.cementPct), c.cementDelta < 0],
    [t('mix.binder'), `${signed(c.binderDelta)} kg/m³`, '', c.binderDelta < 0],
    [t('mix.wcm'), signed(c.wcmDelta, f2), '', null],
    [t('mix.strength28'), c.strength28Delta == null ? t('mix.notBroken') : `${signed(c.strength28Delta, f1)} MPa`, pctStr(c.strength28Pct), c.strength28Delta == null ? null : c.strength28Delta >= 0],
    [t('mix.gwp'), `${signed(c.gwpDelta)} kg CO₂e/m³`, pctStr(c.gwpPct), c.gwpDelta < 0],
  ]
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-line">
        {rows.map(([label, abs, rel, good]) => (
          <tr key={label}>
            <td className="py-2 text-muted">{label}</td>
            <td className={`py-2 text-right tabular-nums font-semibold ${good === true ? 'text-ok' : good === false ? 'text-crit' : 'text-ink'}`}>{abs}</td>
            <td className="py-2 pl-3 text-right tabular-nums text-muted w-20">{rel}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function FreshForm({ mix, user, t }) {
  const [fresh, setFresh] = useState({ slumpMm: '', airPct: '', tempC: '', densityKgM3: '', ...mix.fresh })
  const set = (k, v) => setFresh(f => ({ ...f, [k]: v }))
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NumField label={t('mix.slump')} unit="mm" value={fresh.slumpMm} onChange={v => set('slumpMm', v)} />
        <NumField label={t('mix.air')} unit="%" value={fresh.airPct} onChange={v => set('airPct', v)} />
        <NumField label={t('mix.temp')} unit="°C" value={fresh.tempC} onChange={v => set('tempC', v)} />
        <NumField label={t('mix.density')} unit="kg/m³" value={fresh.densityKgM3} onChange={v => set('densityKgM3', v)} />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => recordFreshProperties(mix.id, {
          slumpMm: fresh.slumpMm, airPct: fresh.airPct, tempC: fresh.tempC, densityKgM3: fresh.densityKgM3,
        }, user)} className={toolBtn}>{t('mix.saveFresh')}</button>
        {mix.fresh?.at && <span className="text-xs text-muted">{mix.fresh.byName}</span>}
      </div>
    </div>
  )
}

function BreakForm({ mix, user, t }) {
  const [ageDays, setAgeDays] = useState(7)
  const [values, setValues] = useState(['', '', ''])
  const [error, setError] = useState('')
  async function submit() {
    const nums = values.filter(v => v !== '').map(Number)
    if (!nums.length || nums.some(v => !(v > 0))) { setError(t('mix.errBreak')); return }
    await addStrengthBreaks(mix.id, { ageDays, values: nums }, user)
    setValues(['', '', ''])
    setError('')
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2 flex-wrap">
        <div>
          <label className={labelCls}>{t('mix.age')}</label>
          <select value={ageDays} onChange={e => setAgeDays(Number(e.target.value))} className={`${inputCls} w-28`}>
            {AGES.map(a => <option key={a} value={a}>{a} {t('mix.days')}</option>)}
          </select>
        </div>
        {values.map((v, i) => (
          <div key={i} className="w-28">
            <NumField label={`${t('mix.specimen')} ${i + 1}`} unit="MPa" value={v}
              onChange={x => setValues(vs => vs.map((y, j) => (j === i ? x : y)))} />
          </div>
        ))}
        <button onClick={submit} className={toolBtn}><Plus size={15} /> {t('mix.addBreaks')}</button>
      </div>
      {error && <p className="text-sm text-crit font-medium">{error}</p>}
    </div>
  )
}

function printPartnerReport({ mix, reference, partner, product, settings, t, lang }) {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const row = (label, a, b) => `<tr><td>${esc(label)}</td><td>${esc(a)}</td>${reference ? `<td>${esc(b)}</td>` : ''}</tr>`
  const g = m => f0(gwpEstimate(m, settings.gwp).total)
  const mat = k => row(`${t(`mix.m_${k}`)} (kg/m³)`, f0(mix.materials[k]), reference ? f0(reference.materials[k]) : '')
  const strengthRows = [...new Set([...strengthByAge(mix.breaks), ...strengthByAge(reference?.breaks)].map(s => s.ageDays))]
    .sort((a, b) => a - b)
    .map(a => row(`${t('mix.strength')} ${a} ${t('mix.days')} (MPa)`, f1(strengthAt(mix, a)), reference ? f1(strengthAt(reference, a)) : ''))
    .join('')
  const c = reference ? compareMixes(mix, reference, settings) : null
  const html = `<!doctype html><html lang="${lang === 'zh' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><title>${esc(mix.number)}</title>
<style>
body{font-family:-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#16202e;margin:32px;font-size:13px}
h1{font-size:18px;margin:0 0 4px}p.sub{color:#5a6a7e;margin:0 0 20px}
table{border-collapse:collapse;width:100%;margin-bottom:20px}td,th{border-bottom:1px solid #dbe2ec;padding:6px 8px;text-align:left}
td:not(:first-child),th:not(:first-child){text-align:right;font-variant-numeric:tabular-nums}
th{font-size:11px;text-transform:uppercase;color:#5a6a7e}
.note{border:1px solid #b45309;color:#b45309;padding:8px 12px;border-radius:6px;font-size:12px}
</style></head><body>
<h1>${esc(mix.number)} · ${esc(mix.title)}</h1>
<p class="sub">${esc(partner?.name || t('mix.inHouse'))} · ${esc(fmtDate(mix.at, lang))}${product ? ` · ${esc(product.code)} @ ${esc(mix.dosagePct)} ${esc(t('mix.pctBinder'))}` : ''}</p>
<table><thead><tr><th></th><th>${esc(mix.number)}</th>${reference ? `<th>${esc(reference.number)} (${esc(t('mix.reference'))})</th>` : ''}</tr></thead><tbody>
${MIX_INGREDIENTS.map(mat).join('')}
${row(`${t('mix.admixture')} (kg/m³)`, f2(admixtureKg(mix)), reference ? f2(admixtureKg(reference)) : '')}
${row(t('mix.wcm'), f2(wcm(mix)), reference ? f2(wcm(reference)) : '')}
${row(`${t('mix.slump')} (mm)`, mix.fresh?.slumpMm || '—', reference ? reference.fresh?.slumpMm || '—' : '')}
${strengthRows}
${row(`${t('mix.gwp')} (kg CO₂e/m³)`, g(mix), reference ? g(reference) : '')}
</tbody></table>
${c ? `<p><strong>${esc(t('mix.vsReference'))}:</strong> ${esc(t('mix.m_cement'))} ${signed(c.cementDelta)} kg/m³ (${pctStr(c.cementPct)}) · ${esc(t('mix.gwp'))} ${signed(c.gwpDelta)} kg CO₂e/m³ (${pctStr(c.gwpPct)})${c.strength28Delta != null ? ` · 28d ${signed(c.strength28Delta, f1)} MPa` : ''}</p>` : ''}
<p class="note">${esc(t('mix.gwpDisclaimer'))}</p>
</body></html>`
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  w.print()
}

function MixDetailModal({ mix, mixes, products, customers, settings, user, onClose, t, lang }) {
  const reference = mixes.find(m => m.id === mix.referenceId)
  const product = products.find(p => p.id === mix.productId)
  const partner = customers.find(c => c.id === mix.partnerId)
  const strengths = strengthByAge(mix.breaks)
  return (
    <Modal wide title={`${mix.number} · ${mix.title}`} onClose={onClose} t={t} footer={
      <>
        <button onClick={() => printPartnerReport({ mix, reference, partner, product, settings, t, lang })} className={`${primaryBtn} flex items-center justify-center gap-2`}>
          <Printer size={16} /> {t('mix.printReport')}
        </button>
        <button onClick={onClose} className={secondaryBtn}>{t('common.cancel')}</button>
      </>
    }>
      <p className="text-sm text-muted">
        {partner?.name || t('mix.inHouse')} · {product ? `${product.code} @ ${mix.dosagePct} ${t('mix.pctBinder')}` : t('mix.noAdmixture')} · {fmtDate(mix.at, lang)} · {mix.byName}
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm">
        {MIX_INGREDIENTS.map(k => (
          <div key={k} className="border border-line rounded-lg px-3 py-2">
            <p className="text-xs text-muted">{t(`mix.m_${k}`)}</p>
            <p className="font-semibold tabular-nums">{f0(mix.materials[k])}</p>
          </div>
        ))}
      </div>
      <DerivedPanel mix={mix} settings={settings} t={t} />
      {mix.notes && <p className="text-sm text-ink">{mix.notes}</p>}

      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink">{t('mix.fresh')}</h3>
      <FreshForm key={mix.id} mix={mix} user={user} t={t} />

      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink">{t('mix.strength')}</h3>
      {strengths.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wide">
              <th className="py-1">{t('mix.age')}</th><th className="py-1">{t('mix.specimens')}</th>
              <th className="py-1 text-right">{t('mix.mean')}</th><th className="py-1 text-right">SD</th>
              {mix.targetMpa && <th className="py-1 text-right">{t('mix.targetMpa')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {strengths.map(s => (
              <tr key={s.ageDays}>
                <td className="py-2">{s.ageDays} {t('mix.days')}</td>
                <td className="py-2 tabular-nums text-muted">{s.values.map(f1).join(' · ')}</td>
                <td className="py-2 text-right tabular-nums font-semibold">{f1(s.mean)}</td>
                <td className="py-2 text-right tabular-nums text-muted">{f1(s.std)}</td>
                {mix.targetMpa && <td className={`py-2 text-right tabular-nums ${s.ageDays === 28 ? (s.mean >= Number(mix.targetMpa) ? 'text-ok' : 'text-crit') : 'text-muted'}`}>{s.ageDays === 28 ? mix.targetMpa : ''}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <BreakForm mix={mix} user={user} t={t} />
      <StrengthChart mix={mix} reference={reference} t={t} />

      {reference && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink">{t('mix.vsReference')} {reference.number}</h3>
          <ComparisonTable mix={mix} reference={reference} settings={settings} t={t} />
        </>
      )}
      <p className="text-xs text-warn">{t('mix.gwpDisclaimer')}</p>
    </Modal>
  )
}

function SettingsModal({ settings, onClose, t }) {
  const keys = [...MIX_INGREDIENTS, 'admixture']
  const [sg, setSg] = useState({ ...settings.sg })
  const [gwp, setGwp] = useState({ ...settings.gwp })
  async function submit() {
    const nums = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Number(v)]))
    await updateMixSettings({ sg: nums(sg), gwp: nums(gwp) })
    onClose()
  }
  return (
    <Modal title={t('mix.settings')} onClose={onClose} t={t} footer={
      <>
        <button onClick={submit} className={primaryBtn}>{t('common.save')}</button>
        <button onClick={onClose} className={secondaryBtn}>{t('common.cancel')}</button>
      </>
    }>
      <p className="text-xs text-muted">{t('mix.settingsHint')}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted uppercase tracking-wide">
            <th className="py-1" /><th className="py-1">{t('mix.sg')}</th><th className="py-1">kg CO₂e/kg</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k}>
              <td className="py-1 pr-2 text-ink">{k === 'admixture' ? t('mix.admixture') : t(`mix.m_${k}`)}</td>
              <td className="py-1 pr-2"><input type="number" step="any" value={sg[k]} onChange={e => setSg(s => ({ ...s, [k]: e.target.value }))} className={`${inputCls} tabular-nums`} /></td>
              <td className="py-1"><input type="number" step="any" value={gwp[k]} onChange={e => setGwp(s => ({ ...s, [k]: e.target.value }))} className={`${inputCls} tabular-nums`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}

export default function MixDesign() {
  const [mixes, setMixes] = useState([])
  const [settings, setSettings] = useState(null)
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [partnerFilter, setPartnerFilter] = useState('all')
  const [modal, setModal] = useState(null) // 'new' | 'settings' | {detail: id}
  const { user } = useAuth()
  const { t, lang } = useI18n()

  useEffect(() => {
    let alive = true
    const refresh = () =>
      Promise.all([getTrialMixes(), getMixSettings(), getProducts(), getCustomers()]).then(([m, s, p, c]) => {
        if (alive) { setMixes(m); setSettings(s); setProducts(p); setCustomers(c) }
      })
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const visible = useMemo(() => {
    const list = partnerFilter === 'all' ? mixes
      : partnerFilter === 'inhouse' ? mixes.filter(m => !m.partnerId)
        : mixes.filter(m => m.partnerId === partnerFilter)
    return [...list].sort((a, b) => b.at.localeCompare(a.at))
  }, [mixes, partnerFilter])

  const byId = useMemo(() => Object.fromEntries(mixes.map(m => [m.id, m])), [mixes])
  const productById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products])
  const customerById = useMemo(() => Object.fromEntries(customers.map(c => [c.id, c])), [customers])
  const partnersInUse = customers.filter(c => mixes.some(m => m.partnerId === c.id))

  if (!settings) return <div className="p-6 text-muted">{t('common.loading')}</div>

  const withBreaks = visible.filter(m => m.breaks.length)
  function exportCsv() {
    const suffix = partnerFilter === 'all' ? 'all' : partnerFilter === 'inhouse' ? 'inhouse' : (customerById[partnerFilter]?.name || 'partner')
    downloadCsv(`trial-mixes-${suffix}.csv`, BOXCRETE_HEADER, boxcreteRows(withBreaks, { gwp: settings.gwp }))
  }

  const detail = modal?.detail ? byId[modal.detail] : null

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <select value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white">
          <option value="all">{t('mix.allMixes')}</option>
          <option value="inhouse">{t('mix.inHouse')}</option>
          {partnersInUse.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={() => setModal('settings')} className={toolBtn}><Settings2 size={15} /> {t('mix.settings')}</button>
          <button onClick={exportCsv} disabled={!withBreaks.length} className={`${toolBtn} disabled:opacity-40 disabled:pointer-events-none`} title={t('mix.exportHint')}>
            <Download size={15} /> {t('mix.export')}
          </button>
          <button onClick={() => setModal('new')}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors">
            <Plus size={16} /> {t('mix.new')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {['#', t('mix.title'), t('mix.partner'), t('mix.admixture'), t('mix.binder'), t('mix.wcm'), '7d (MPa)', '28d (MPa)', t('mix.gwp'), t('mix.vsReference')].map((h, i) => (
                  // unit headers keep their case — MPa is not MPA
                  <th key={i} className={`px-4 py-3 text-xs font-semibold tracking-wide text-muted whitespace-nowrap ${i === 6 || i === 7 ? '' : 'uppercase'} ${i >= 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map(m => {
                const ref = byId[m.referenceId]
                const c = ref ? compareMixes(m, ref, settings) : null
                const yieldBad = Math.abs(absoluteVolumes(m, settings.sg).total - 1) > 0.02
                return (
                  <tr key={m.id} onClick={() => setModal({ detail: m.id })} className="cursor-pointer hover:bg-surface">
                    <td className="px-4 py-3 font-display font-semibold text-ink tabular-nums whitespace-nowrap">
                      {m.number}
                      {yieldBad && <AlertTriangle size={13} className="inline ml-1 text-warn" aria-label={t('mix.yieldWarn')} />}
                    </td>
                    <td className="px-4 py-3 text-ink">{m.title}</td>
                    <td className="px-4 py-3 text-muted">{customerById[m.partnerId]?.name || t('mix.inHouse')}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{productById[m.productId] ? `${productById[m.productId].code} · ${m.dosagePct}%` : '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{f0(binderKg(m.materials))}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{f2(wcm(m))}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{f1(strengthAt(m, 7))}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{f1(strengthAt(m, 28))}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{f0(gwpEstimate(m, settings.gwp).total)}</td>
                    <td className={`px-4 py-3 text-right tabular-nums whitespace-nowrap ${c ? (c.gwpDelta < 0 ? 'text-ok' : 'text-crit') : 'text-muted'}`}>
                      {c ? `${ref.number} · ${pctStr(c.gwpPct)}` : '—'}
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-muted">{t('mix.none')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted">{t('mix.gwpDisclaimer')}</p>

      {modal === 'new' && <NewMixModal mixes={mixes} products={products} customers={customers} settings={settings} user={user} onClose={() => setModal(null)} t={t} />}
      {modal === 'settings' && <SettingsModal settings={settings} onClose={() => setModal(null)} t={t} />}
      {detail && <MixDetailModal mix={detail} mixes={mixes} products={products} customers={customers} settings={settings} user={user} onClose={() => setModal(null)} t={t} lang={lang} />}
    </div>
  )
}
