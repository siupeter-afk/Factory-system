import { useState } from 'react'
import { Plus, Search, CheckCircle2 } from 'lucide-react'
import { capas } from '../data/mockData'

const statusColors = { Open: 'badge-red', 'In Progress': 'badge-yellow', Completed: 'badge-green' }
const typeColors = { Corrective: 'badge-red', Preventive: 'badge-blue' }
const effectColors = { Effective: 'badge-green', 'Partially Effective': 'badge-yellow', 'Not Effective': 'badge-red' }

export default function CAPA() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const filtered = capas.filter(c => {
    const matchSearch = c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || c.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total CAPAs', value: capas.length, color: 'text-blue-600' },
          { label: 'Open', value: capas.filter(c => c.status === 'Open').length, color: 'text-red-600' },
          { label: 'In Progress', value: capas.filter(c => c.status === 'In Progress').length, color: 'text-yellow-600' },
          { label: 'Completed', value: capas.filter(c => c.status === 'Completed').length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="text-xs text-gray-500">{s.label}</span>
            <span className={`text-3xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search CAPAs..."
              className="pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-select text-sm py-2">
              {['All', 'Corrective', 'Preventive'].map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> New CAPA
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['CAPA ID', 'Type', 'Title', 'Source', 'Owner', 'Due Date', 'Status', 'Effectiveness'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(capa => (
                <tr key={capa.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="table-cell font-mono text-xs text-blue-600 font-medium">{capa.id}</td>
                  <td className="table-cell">
                    <span className={typeColors[capa.type] || 'badge-gray'}>{capa.type}</span>
                  </td>
                  <td className="table-cell font-medium text-gray-900 max-w-xs">
                    <p className="truncate">{capa.title}</p>
                  </td>
                  <td className="table-cell text-gray-500 text-xs">{capa.source}</td>
                  <td className="table-cell">{capa.owner}</td>
                  <td className="table-cell text-gray-500 text-xs">{capa.dueDate}</td>
                  <td className="table-cell">
                    <span className={statusColors[capa.status] || 'badge-gray'}>{capa.status}</span>
                  </td>
                  <td className="table-cell">
                    {capa.effectiveness ? (
                      <span className={effectColors[capa.effectiveness] || 'badge-gray'}>{capa.effectiveness}</span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-blue-500" />
              <h2 className="text-base font-semibold text-gray-900">New CAPA</h2>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Type *</label>
                  <select className="form-select">
                    <option>Corrective</option>
                    <option>Preventive</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Source *</label>
                  <input className="form-input" placeholder="NCR ID / Audit / Complaint" />
                </div>
              </div>
              <div>
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Brief title of the CAPA" />
              </div>
              <div>
                <label className="form-label">Root Cause Analysis</label>
                <textarea className="form-input" rows={3} placeholder="Describe the root cause..." />
              </div>
              <div>
                <label className="form-label">Action Plan *</label>
                <textarea className="form-input" rows={3} placeholder="Describe the actions to be taken..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Owner *</label>
                  <input className="form-input" placeholder="Responsible person/dept" />
                </div>
                <div>
                  <label className="form-label">Due Date *</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowForm(false)}>Create CAPA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
