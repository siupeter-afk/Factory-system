import { useState, useRef, useEffect } from 'react'
import { Languages, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

export default function Header({ title, subtitle }) {
  const { user, signOut } = useAuth()
  const { t, toggle } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const close = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <header className="h-16 bg-white border-b border-line flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors"
        >
          <Languages size={16} />
          {t('header.language')}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 text-sm text-ink hover:bg-surface rounded-lg transition-colors"
          >
            <span className="w-7 h-7 bg-brand/10 rounded-full flex items-center justify-center text-brand text-xs font-display font-bold">
              {user.name.charAt(0)}
            </span>
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted">{t(`role.${user.role}`)}</span>
            <ChevronDown size={14} className="text-muted" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-line rounded-xl shadow-lg py-1 w-44 z-30">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-crit hover:bg-crit/5 transition-colors"
              >
                <LogOut size={15} />
                {t('header.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
