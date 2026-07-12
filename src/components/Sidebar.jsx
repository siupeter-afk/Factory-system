import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ShieldCheck, Wrench, ClipboardList, BarChart3,
  Settings, Factory, ChevronRight, PackageOpen, FlaskConical, Truck, Beaker,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n'

// Each role sees only its own world. Owner sees everything.
function navFor(role, t) {
  const orders = { to: '/orders', icon: PackageOpen, label: t('nav.orders') }
  const products = { to: '/products', icon: Beaker, label: t('nav.products') }
  const equipment = { to: '/equipment', icon: Wrench, label: t('nav.equipment') }
  const reports = { to: '/reports', icon: BarChart3, label: t('nav.reports') }

  switch (role) {
    case 'owner':
      return [
        { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
        orders,
        products,
        {
          label: t('nav.compliance'),
          icon: ShieldCheck,
          children: [
            { to: '/compliance/documents', label: t('nav.documents') },
            { to: '/compliance/audits', label: t('nav.audits') },
            { to: '/compliance/ncr', label: t('nav.ncr') },
            { to: '/compliance/capa', label: t('nav.capa') },
          ],
        },
        { to: '/production', icon: Factory, label: t('nav.production') },
        equipment,
        { to: '/data-collection', icon: ClipboardList, label: t('nav.dataCollection') },
        reports,
      ]
    case 'operations':
      return [orders, products]
    case 'production':
      return [{ ...orders, icon: Factory, label: t('nav.productionQueue') }]
    case 'lab':
      return [{ ...orders, icon: FlaskConical, label: t('nav.qcQueue') }]
    case 'driver':
      return [{ ...orders, icon: Truck, label: t('nav.deliveries') }]
    case 'engineering':
      return [equipment]
    case 'accountant':
      return [reports, orders]
    default:
      return [orders]
  }
}

function NavSection({ item, expanded, onToggle }) {
  if (item.children) {
    return (
      <div>
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors"
        >
          <item.icon size={18} className="shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        {expanded && (
          <div className="ml-6 mt-1 flex flex-col gap-0.5">
            {item.children.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand/10 text-brand font-medium'
                      : 'text-muted hover:text-ink hover:bg-surface'
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-brand text-white shadow-sm'
            : 'text-muted hover:text-ink hover:bg-surface'
        }`
      }
    >
      <item.icon size={18} className="shrink-0" />
      {item.label}
    </NavLink>
  )
}

export default function Sidebar({ expanded, setExpanded }) {
  const { user } = useAuth()
  const { t } = useI18n()
  const navItems = navFor(user.role, t)

  return (
    <aside className="w-60 shrink-0 h-screen bg-white border-r border-line flex flex-col">
      <div className="h-16 flex items-center gap-3 px-4 border-b border-line/60">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
          <Factory size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-ink leading-tight">{t('app.name')}</p>
          <p className="text-xs text-muted leading-tight">{t('app.tagline')}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {navItems.map((item, i) => (
          <NavSection
            key={i}
            item={item}
            expanded={expanded === i}
            onToggle={() => setExpanded(expanded === i ? null : i)}
          />
        ))}
      </nav>

      {user.role === 'owner' && (
        <div className="p-3 border-t border-line/60">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-brand text-white' : 'text-muted hover:text-ink hover:bg-surface'
              }`
            }
          >
            <Settings size={18} />
            {t('nav.settings')}
          </NavLink>
        </div>
      )}
    </aside>
  )
}
