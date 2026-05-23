import { useState } from 'react'
import { Plus, Search, Calendar } from 'lucide-react'
import { audits } from '../data/mockData'

const statusColors = { Scheduled: 'badge-blue', Completed: 'badge-green', 'In Progress': 'badge-yellow', Cancelled: 'badge-gray' }
const typeColors = { Internal: 'badge-blue', External: 'badge-green', Supplier: 'badge-yellow' }

export default function Audits() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const filtered = audits.filter(a =>
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.area.toLowerCase().includes(search.toLowerCase()) ||
    a.auditor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Audits (YTD)', value: audits.length, color: 'text-blue-600' },
          { label: 'Completed', value: audits.filter(a => a.status === 'Completed').length, color: 'text-green-600' },
          { label: 'Scheduled', value: audits.filter(a => a.status === 'Scheduled').length, color: 'text-blue-500' },
          { label: 'Open Findings', value: 3, color: 'text-orange-600' },
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
              placeholder="Search audits..."
              className="pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Schedule Audit
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Audit ID', 'Type', 'Scope / Area', 'Lead Auditor', 'Date', 'Status', 'Findings'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(audit => (
                <tr key={audit.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="table-cell font-mono text-xs text-blue-600 font-medium">{audit.id}</td>
                  <td className="table-cell">
                    <span className={typeColors[audit.type] || 'badge-gray'}>{audit.type}</span>
                  </td>
                  <td className="table-cell font-medium text-gray-900">{audit.area}</td>
                  <td className="table-cell text-gray-600">{audit.auditor}</td>
                  <td className="table-cell text-gray-500 text-xs">{audit.scheduledDate}</td>
                  <td className="table-cell">
                    <span className={statusColors[audit.status] || 'badge-gray'}>{audit.status}</span>
                  </td>
                  <td className="table-cell text-gray-500 text-xs">
                    {audit.findings ?? <span className="text-gray-300">—</span>}
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
              <Calendar size={18} className="text-blue-500" />
              <h2 className="text-base font-semibold text-gray-900">Schedule Audit</h2>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Audit Type *</label>
                  <select className="form-select">
                    <option>Internal</option>
                    <option>External</option>
                    <option>Supplier</option>
                    <option>Process</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Scheduled Date *</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Scope / Area *</label>
                <input className="form-input" placeholder="e.g. Production & Assembly, Full ISO 9001:2015" />
              </div>
              <div>
                <label className="form-label">Lead Auditor *</label>
                <input className="form-input" placeholder="Name or team" />
              </div>
              <div>
                <label className="form-label">Audit Criteria / Checklist</label>
                <select className="form-select">
                  <option>ISO 9001:2015 – Full System</option>
                  <option>ISO 9001:2015 – Section 8 (Operations)</option>
                  <option>Internal QMS Checklist</option>
                  <option>Supplier Audit Checklist</option>
                  <option>Process Audit – Assembly</option>
                </select>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} placeholder="Any additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowForm(false)}>Schedule Audit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
