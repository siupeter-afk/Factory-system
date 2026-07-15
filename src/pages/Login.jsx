import { useEffect, useState } from 'react'
import { Factory, Languages, UserPlus, UserCog, X } from 'lucide-react'
import { getUsers, createUser, deleteUser, subscribe } from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

const ROLES = ['owner', 'operations', 'production', 'lab', 'engineering', 'driver', 'accountant']

const ROLE_TINT = {
  owner: 'bg-brand text-white',
  operations: 'bg-sky-600 text-white',
  production: 'bg-teal-600 text-white',
  lab: 'bg-violet-600 text-white',
  engineering: 'bg-amber-600 text-white',
  driver: 'bg-emerald-600 text-white',
  accountant: 'bg-slate-600 text-white',
}

function AddWorkerModal({ onClose, t }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('production')
  const [error, setError] = useState('')

  async function submit() {
    if (!name.trim()) { setError(t('login.errName')); return }
    await createUser({ name, role })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <header className="flex items-center justify-between px-5 h-14 border-b border-line">
          <h2 className="font-display font-semibold text-ink">{t('login.addWorker')}</h2>
          <button onClick={onClose} aria-label={t('common.cancel')} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
            <X size={18} />
          </button>
        </header>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('login.workerName')}</label>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">{t('login.position')}</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors text-left ${
                    role === r
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-line text-muted hover:text-ink hover:bg-surface'
                  }`}
                >
                  {t(`role.${r}`)}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-crit font-medium">{error}</p>}
        </div>
        <footer className="p-4 border-t border-line flex gap-2">
          <button
            onClick={submit}
            className="flex-1 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-deep transition-colors"
          >
            {t('login.create')}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 text-muted text-sm font-semibold rounded-xl border border-line hover:bg-surface transition-colors">
            {t('common.cancel')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default function Login() {
  const [users, setUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [managing, setManaging] = useState(false)
  const { signIn } = useAuth()
  const { t, toggle } = useI18n()

  async function remove(u) {
    if (!window.confirm(`${t('login.confirmRemove')} — ${u.name}`)) return
    try {
      await deleteUser(u.id)
    } catch (e) {
      if (e.message === 'LAST_OWNER') window.alert(t('login.errLastOwner'))
      else throw e
    }
  }

  useEffect(() => {
    let alive = true
    const refresh = () => getUsers().then(u => alive && setUsers(u))
    refresh()
    const unsub = subscribe(refresh)
    return () => { alive = false; unsub() }
  }, [])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-10">
      <button
        onClick={toggle}
        className="absolute top-5 right-5 flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-ink hover:bg-white rounded-lg transition-colors"
      >
        <Languages size={16} />
        {t('header.language')}
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-sm">
          <Factory size={26} className="text-white" />
        </div>
        <div>
          <p className="font-display text-xl font-bold text-ink leading-tight">{t('app.name')}</p>
          <p className="text-sm text-muted leading-tight">{t('app.tagline')}</p>
        </div>
      </div>

      <h1 className="font-display text-2xl font-semibold text-ink mt-10 mb-1 text-balance">{t('login.title')}</h1>
      <p className="text-sm text-muted mb-8">{t('login.subtitle')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl w-full">
        {users.map(u => (
          <div key={u.id} className="relative">
            <button
              onClick={() => (managing ? remove(u) : signIn(u))}
              className={`group w-full bg-white border rounded-2xl p-5 flex flex-col items-center gap-3
                         focus-visible:ring-2 outline-none transition-all min-h-[132px] ${
                           managing
                             ? 'border-crit/40 hover:border-crit hover:shadow-md focus-visible:ring-crit'
                             : 'border-line hover:border-brand hover:shadow-md focus-visible:ring-brand'
                         }`}
            >
              <span className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-display font-bold ${managing ? 'opacity-60 ' : ''}${ROLE_TINT[u.role] || 'bg-slate-500 text-white'}`}>
                {u.name.charAt(0)}
              </span>
              <span className="text-center">
                <span className="block text-sm font-semibold text-ink">{u.name}</span>
                <span className="block text-xs text-muted mt-0.5">{t(`role.${u.role}`)}</span>
              </span>
            </button>
            {managing && (
              <span className="absolute -top-2 -right-2 w-7 h-7 bg-crit text-white rounded-full flex items-center justify-center shadow pointer-events-none">
                <X size={15} />
              </span>
            )}
          </div>
        ))}

        {!managing && (
          <button
            onClick={() => setShowAdd(true)}
            className="border-2 border-dashed border-line rounded-2xl p-5 flex flex-col items-center justify-center gap-3
                       text-muted hover:text-brand hover:border-brand focus-visible:ring-2 focus-visible:ring-brand
                       outline-none transition-all min-h-[132px]"
          >
            <span className="w-14 h-14 rounded-full flex items-center justify-center bg-surface">
              <UserPlus size={22} />
            </span>
            <span className="text-sm font-semibold">{t('login.addWorker')}</span>
          </button>
        )}
      </div>

      <button
        onClick={() => setManaging(v => !v)}
        className={`mt-8 flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          managing ? 'text-brand bg-brand/10' : 'text-muted hover:text-ink hover:bg-white'
        }`}
      >
        <UserCog size={15} />
        {managing ? t('login.doneManaging') : t('login.manage')}
      </button>
      {managing && <p className="text-xs text-crit mt-2">{t('login.manageHint')}</p>}

      <p className="text-xs text-muted mt-6">{t('login.footer')}</p>

      {showAdd && <AddWorkerModal onClose={() => setShowAdd(false)} t={t} />}
    </div>
  )
}
