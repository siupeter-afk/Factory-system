import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ShieldCheck, FileText, AlertTriangle,
  Wrench, ClipboardList, BarChart3, Settings, Factory,
  ChevronRight, Calendar
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  {
    label: 'ISO Compliance',
    icon: ShieldCheck,
    children: [
      { to: '/compliance/documents', label: 'Document Control' },
      { to: '/compliance/audits', label: 'Audits' },
      { to: '/compliance/ncr', label: 'Non-Conformances' },
      { to: '/compliance/capa', label: 'CAPA' },
    ]
  },
  { to: '/production', icon: Factory, label: 'Production' },
  { to: '/equipment', icon: Wrench, label: 'Equipment' },
  { to: '/data-collection', icon: ClipboardList, label: 'Data Collection' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
]

function NavSection({ item, expanded, onToggle }) {
  if (item.children) {
    return (
      <div>
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`
      }
    >
      <item.icon size={18} className="shrink-0" />
      {item.label}
    </NavLink>
  )
}

export default function Sidebar({ expanded, setExpanded }) {
  return (
    <aside className="w-60 shrink-0 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Factory size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">FactoryOS</p>
          <p className="text-xs text-gray-400 leading-tight">ISO & Management</p>
        </div>
      </div>

      {/* Nav */}
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

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700">ISO 9001:2015</p>
          <p className="text-xs text-gray-400">Certified – Valid to Dec 2025</p>
          <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '72%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Renewal in 18 months</p>
        </div>
      </div>
    </aside>
  )
}
