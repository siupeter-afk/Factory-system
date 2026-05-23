import { useState } from 'react'
import { Plus, Search, Wrench, AlertTriangle } from 'lucide-react'
import { equipment } from '../data/mockData'

const statusColors = {
  Operational: 'badge-green',
  'Under Maintenance': 'badge-yellow',
  'Calibration Due': 'badge-red',
  'Out of Service': 'badge-gray',
}

export default function Equipment() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const filtered = equipment.filter(eq => {
    const matchSearch = eq.id.toLowerCase().includes(search.toLowerCase()) ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || eq.status === statusFilter
    return matchSearch && matchStatus
  })

  const calibOverdue = equipment.filter(e => e.status === 'Calibration Due').length
  const underMaint = equipment.filter(e => e.status === 'Under Maintenance').length

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="text-xs text-gray-500">Total Assets</span>
          <span className="text-3xl font-bold text-blue-600">{equipment.length}</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500">Operational</span>
          <span className="text-3xl font-bold text-green-600">
            {equipment.filter(e => e.status === 'Operational').length}
          </span>
        </div>
        <div className="stat-card border-l-4 border-yellow-400">
          <span className="text-xs text-gray-500">Under Maintenance</span>
          <span className="text-3xl font-bold text-yellow-600">{underMaint}</span>
        </div>
        <div className="stat-card border-l-4 border-red-400">
          <span className="text-xs text-gray-500">Calibration Overdue</span>
          <span className="text-3xl font-bold text-red-600">{calibOverdue}</span>
        </div>
      </div>

      {(calibOverdue > 0) && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Calibration Action Required</p>
            <p className="text-xs text-red-600 mt-0.5">
              {calibOverdue} item(s) have calibration overdue. Immediate action required to maintain measurement traceability and ISO 9001 compliance.
            </p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className="pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select text-sm py-2">
              {['All', 'Operational', 'Under Maintenance', 'Calibration Due', 'Out of Service'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Add Equipment
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Asset ID', 'Name', 'Model', 'Location', 'Last Maint.', 'Next Maint.', 'Calib. Due', 'Status'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(eq => (
                <tr key={eq.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="table-cell font-mono text-xs text-blue-600 font-medium">{eq.id}</td>
                  <td className="table-cell font-medium text-gray-900">{eq.name}</td>
                  <td className="table-cell text-gray-500 text-xs">{eq.model}</td>
                  <td className="table-cell">
                    <span className="badge-blue">{eq.location}</span>
                  </td>
                  <td className="table-cell text-gray-500 text-xs">{eq.lastMaint}</td>
                  <td className="table-cell text-gray-500 text-xs">{eq.nextMaint}</td>
                  <td className="table-cell">
                    {eq.calibDue ? (
                      <span className={`text-xs font-medium ${eq.status === 'Calibration Due' ? 'text-red-600' : 'text-gray-600'}`}>
                        {eq.calibDue}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={statusColors[eq.status] || 'badge-gray'}>{eq.status}</span>
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
              <Wrench size={18} className="text-blue-500" />
              <h2 className="text-base font-semibold text-gray-900">Register Equipment</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="form-label">Equipment Name *</label>
                <input className="form-input" placeholder="e.g. CNC Machining Center" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Model / Make</label>
                  <input className="form-input" placeholder="e.g. Haas VF-4" />
                </div>
                <div>
                  <label className="form-label">Serial Number</label>
                  <input className="form-input" placeholder="SN-XXXXXX" />
                </div>
              </div>
              <div>
                <label className="form-label">Location *</label>
                <input className="form-input" placeholder="e.g. Machining Bay 1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Maintenance Frequency</label>
                  <select className="form-select">
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Semi-Annual</option>
                    <option>Annual</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Calibration Required?</label>
                  <select className="form-select">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Last Maintenance</label>
                  <input type="date" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Calibration Due</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowForm(false)}>Register Equipment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
