import { useState } from 'react'
import { Plus, Search, Download, Eye, Edit2, Filter } from 'lucide-react'
import { documents } from '../data/mockData'

const statusColors = {
  'Active': 'badge-green',
  'Under Review': 'badge-yellow',
  'Overdue Review': 'badge-red',
  'Obsolete': 'badge-gray',
}

const typeOptions = ['All', 'Manual', 'Procedure', 'Work Instruction', 'Plan']

export default function DocumentControl() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const filtered = documents.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || d.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="p-6 space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: documents.length, color: 'text-blue-600' },
          { label: 'Active', value: documents.filter(d => d.status === 'Active').length, color: 'text-green-600' },
          { label: 'Under Review', value: documents.filter(d => d.status === 'Under Review').length, color: 'text-yellow-600' },
          { label: 'Overdue Review', value: documents.filter(d => d.status === 'Overdue Review').length, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="text-xs text-gray-500">{s.label}</span>
            <span className={`text-3xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="form-select text-sm py-2 w-44"
            >
              {typeOptions.map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn-secondary" onClick={() => {}}>
              <Download size={15} /> Export
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> New Document
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Doc ID', 'Title', 'Type', 'Revision', 'Owner', 'Last Review', 'Next Review', 'Status', ''].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-mono text-xs text-blue-600 font-medium">{doc.id}</td>
                  <td className="table-cell font-medium text-gray-900 max-w-xs">{doc.title}</td>
                  <td className="table-cell text-gray-500">{doc.type}</td>
                  <td className="table-cell font-mono text-xs">{doc.revision}</td>
                  <td className="table-cell">{doc.owner}</td>
                  <td className="table-cell text-gray-500">{doc.lastReview}</td>
                  <td className="table-cell text-gray-500">{doc.nextReview}</td>
                  <td className="table-cell">
                    <span className={statusColors[doc.status] || 'badge-gray'}>{doc.status}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {documents.length} documents
        </div>
      </div>

      {/* New Document Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">New Document</h2>
            <div className="space-y-3">
              <div>
                <label className="form-label">Document Title *</label>
                <input className="form-input" placeholder="e.g. SOP-Assembly Procedure" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Type *</label>
                  <select className="form-select">
                    <option>Manual</option>
                    <option>Procedure</option>
                    <option>Work Instruction</option>
                    <option>Form</option>
                    <option>Plan</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Revision</label>
                  <input className="form-input" placeholder="Rev 1" />
                </div>
              </div>
              <div>
                <label className="form-label">Document Owner *</label>
                <input className="form-input" placeholder="Name or department" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Review Date</label>
                  <input type="date" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Next Review</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Brief description of document scope..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowForm(false)}>Create Document</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
