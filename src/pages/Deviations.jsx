import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { getDeviations, reviewDeviation, subscribe } from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

function fmtDateTime(iso, lang) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const KIND_TINT = {
  material_usage: '#B45309',
  qc_fail: '#B91C1C',
  stock_adjustment: '#0E7490',
}

export default function Deviations() {
  const [deviations, setDeviations] = useState([])
  const { user } = useAuth()
  const { t, lang } = useI18n()

  useEffect(() => {
    let alive = true
    const refresh = () => getDeviations().then(d => alive && setDeviations(d))
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  const open = useMemo(() => deviations.filter(d => d.status === 'open').sort((a, b) => b.at.localeCompare(a.at)), [deviations])
  const reviewed = useMemo(() => deviations.filter(d => d.status === 'reviewed').sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20), [deviations])

  const canReview = ['owner', 'lab'].includes(user.role)

  const Row = ({ d }) => {
    const tint = KIND_TINT[d.kind] || '#64748B'
    return (
      <div className="bg-white border border-line rounded-xl flex items-center p-4 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ color: tint, backgroundColor: tint + '14' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tint }} />
              {t(`deviations.kind_${d.kind}`)}
            </span>
            <span className="text-xs text-muted tabular-nums">{fmtDateTime(d.at, lang)} · {d.byName}</span>
          </div>
          <p className="text-sm text-ink mt-1.5">{d.description}</p>
          {d.status === 'reviewed' && (
            <p className="text-xs text-muted mt-1 tabular-nums">
              {t('deviations.reviewedBy')} {d.reviewedBy} · {fmtDateTime(d.reviewedAt, lang)}
            </p>
          )}
        </div>
        {d.status === 'open' && canReview && (
          <button onClick={() => reviewDeviation(d.id, user)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-ok border border-ok/30 rounded-xl hover:bg-ok/5 transition-colors shrink-0">
            <CheckCircle2 size={15} /> {t('deviations.review')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">
          {t('deviations.openTitle')} {open.length > 0 && <span className="text-crit">({open.length})</span>}
        </h2>
        {open.length === 0 ? (
          <div className="border border-dashed border-line rounded-xl py-10 text-center text-sm text-muted">{t('deviations.noneOpen')}</div>
        ) : (
          <div className="flex flex-col gap-2">{open.map(d => <Row key={d.id} d={d} />)}</div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted mb-3">{t('deviations.reviewedTitle')}</h2>
          <div className="flex flex-col gap-2 opacity-70">{reviewed.map(d => <Row key={d.id} d={d} />)}</div>
        </div>
      )}
    </div>
  )
}
