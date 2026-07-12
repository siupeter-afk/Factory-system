import { useEffect, useState } from 'react'
import { Factory, Languages } from 'lucide-react'
import { getUsers } from '../data/db'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

const ROLE_TINT = {
  owner: 'bg-brand text-white',
  operations: 'bg-sky-600 text-white',
  production: 'bg-teal-600 text-white',
  lab: 'bg-violet-600 text-white',
  engineering: 'bg-amber-600 text-white',
  driver: 'bg-emerald-600 text-white',
  accountant: 'bg-slate-600 text-white',
}

export default function Login() {
  const [users, setUsers] = useState([])
  const { signIn } = useAuth()
  const { t, toggle } = useI18n()

  useEffect(() => { getUsers().then(setUsers) }, [])

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
          <button
            key={u.id}
            onClick={() => signIn(u)}
            className="group bg-white border border-line rounded-2xl p-5 flex flex-col items-center gap-3
                       hover:border-brand hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand
                       outline-none transition-all min-h-[132px]"
          >
            <span className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-display font-bold ${ROLE_TINT[u.role] || 'bg-slate-500 text-white'}`}>
              {u.name.charAt(0)}
            </span>
            <span className="text-center">
              <span className="block text-sm font-semibold text-ink">{u.name}</span>
              <span className="block text-xs text-muted mt-0.5">{t(`role.${u.role}`)}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted mt-10">{t('login.footer')}</p>
    </div>
  )
}
