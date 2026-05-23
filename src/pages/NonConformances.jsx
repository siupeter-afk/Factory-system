import { useState } from 'react'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import { nonConformances } from '../data/mockData'

const severityColors = { Minor: 'badge-yellow', Major: 'badge-red', Critical: 'badge bg-red-700 text-white' }
const statusColors = { Open: 'badge-red', 'In Progress': 'badge-yellow', Closed: 'badge-green' }

export default function NonConformances() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const filtered = nonConformances.filter(n => {
    const matchSearch = n.id.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()) ||
      n.area.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || n.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    open: nonConformances.filter(n => n.status === 'Open').length,
    inProgress: nonConformances.filter(n => n.status === 'In Progress').length,
    closed: nonConformances.filter(n => n.status === 'Closed').length,
    critical: nonConformances.filter(n => n.severity === 'Critical').length,
  }

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card border-l-4 border-red-500">
          <span className="text-xs text-gray-500">Open</span>
          <span className="text-3xl font-bold text-red-600">{counts.open}</span>
        </div>
        <div className="stat-card border-l-4 border-yellow-500">
          <span className="text-xs text-gray-500">In Progress</span>
          <span className="text-3xl font-bold text-yellow-600">{counts.inProgress}</span>
        </div>
        <div className="stat-card border-l-4 border-green-500">
          <span className="text-xs text-gray-500">Closed</span>
          <span className="text-3xl font-bold text-green-600">{counts.closed}</span>
        </div>
        <div className="stat-card border-l-4 border-red-800">
          <span className="text-xs text-gray-500">Critical</span>
          <span className="text-3xl font-bold text-red-800">{counts.critical}</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search NCRs..."
              className="pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select text-sm py-2"
            >
              {['All', 'Open', 'In Progress', 'Closed'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Raise NCR
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['NCR ID', 'Date', 'Area', 'Description', 'Severity', 'Assigned To', 'Due Date', 'Status'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ncr => (
                <tr key={ncr.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="table-cell font-mono text-xs text-blue-600 font-medium">{ncr.id}</td>
                  <td className="table-cell text-gray-500 text-xs">{ncr.date}</td>
                  <td className="table-cell">
                    <span className="badge-blue">{ncr.area}</span>
                  </td>
                  <td className="table-cell max-w-xs">
                    <p className="text-sm text-gray-700 truncate">{ncr.description}</p>
                  </td>
                  <td className="table-cell">
                    <span className={severityColors[ncr.severity] || 'badge-gray'}>{ncr.severity}</span>
                  </td>
                  <td className="table-cell text-gray-600">{ncr.assignedTo}</td>
                  <td className="table-cell text-gray-500 text-xs">{ncr.dueDate}</td>
                  <td className="table-cell">
                    <span className={statusColors[ncr.status] || 'badge-gray'}>{ncr.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {nonConformances.length} records
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-orange-500" />
              <h2 className="text-base font-semibold text-gray-900">Raise Non-Conformance Report</h2>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Date Detected *</label>
                  <input type="date" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Area / Department *</label>
                  <select className="form-select">
                    {['Assembly', 'Welding', 'Machining', 'Paint', 'Incoming', 'QC Final', 'Shipping'].map(a => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={3} placeholder="Describe the non-conformance in detail..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Severity *</label>
                  <select className="form-select">
                    <option>Minor</option>
                    <option>Major</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Immediate Action</label>
                  <select className="form-select">
                    <option>Quarantine</option>
                    <option>Rework</option>
                    <option>Scrap</option>
                    <option>Use-As-Is</option>
                    <option>Return to Supplier</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Assigned To *</label>
                  <input className="form-input" placeholder="Responsible person" />
                </div>
                <div>
                  <label className="form-label">Due Date *</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Reference (Work Order / Part No.)</label>
                <input className="form-input" placeholder="e.g. WO-2024-1892 / Part #A-2291" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowForm(false)}>Raise NCR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
