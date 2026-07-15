import { useState } from 'react'
import { Plus, Search, Factory, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { workOrders, qualityInspections } from '../data/mockData'

const statusColors = {
  'In Progress': 'badge-blue',
  'Completed': 'badge-green',
  'Quality Hold': 'badge-red',
  'Planned': 'badge-gray',
}

const statusIcon = {
  'In Progress': <Clock size={13} className="text-blue-500" />,
  'Completed': <CheckCircle size={13} className="text-green-500" />,
  'Quality Hold': <XCircle size={13} className="text-red-500" />,
  'Planned': <Clock size={13} className="text-gray-400" />,
}

function ProgressBar({ value }) {
  const color = value === 100 ? 'bg-green-500' : value >= 70 ? 'bg-blue-500' : 'bg-orange-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-7 text-right">{value}%</span>
    </div>
  )
}

export default function Production() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [tab, setTab] = useState('workorders')
  const [showForm, setShowForm] = useState(false)

  const filteredWOs = workOrders.filter(wo => {
    const matchSearch = wo.id.toLowerCase().includes(search.toLowerCase()) ||
      wo.product.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || wo.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="text-xs text-gray-500">Active Work Orders</span>
          <span className="text-3xl font-bold text-blue-600">
            {workOrders.filter(w => w.status === 'In Progress').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500">Completed Today</span>
          <span className="text-3xl font-bold text-green-600">
            {workOrders.filter(w => w.status === 'Completed').length}
          </span>
        </div>
        <div className="stat-card border-l-4 border-red-400">
          <span className="text-xs text-gray-500">Quality Holds</span>
          <span className="text-3xl font-bold text-red-600">
            {workOrders.filter(w => w.status === 'Quality Hold').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500">Avg. Line Efficiency</span>
          <span className="text-3xl font-bold text-purple-600">83%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {[['workorders', 'Work Orders'], ['inspections', 'Quality Inspections']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'workorders' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search work orders..."
                className="pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select text-sm py-2">
                {['All', 'Planned', 'In Progress', 'Quality Hold', 'Completed'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={15} /> New Work Order
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Work Order', 'Product', 'Qty', 'Line', 'Planned Start', 'Due Date', 'Progress', 'Status'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWOs.map(wo => (
                  <tr key={wo.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="table-cell font-mono text-xs text-blue-600 font-medium">{wo.id}</td>
                    <td className="table-cell font-medium text-gray-900 max-w-xs">
                      <p className="truncate">{wo.product}</p>
                    </td>
                    <td className="table-cell text-center">{wo.quantity}</td>
                    <td className="table-cell">
                      <span className="badge-blue">{wo.line}</span>
                    </td>
                    <td className="table-cell text-gray-500 text-xs">{wo.planned}</td>
                    <td className="table-cell text-gray-500 text-xs">{wo.due}</td>
                    <td className="table-cell min-w-[120px]">
                      <ProgressBar value={wo.progress} />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        {statusIcon[wo.status]}
                        <span className={statusColors[wo.status] || 'badge-gray'}>{wo.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'inspections' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Inspection ID', 'Date', 'Work Order', 'Type', 'Inspector', 'Sample Size', 'Defects', 'Result'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {qualityInspections.map(qi => (
                  <tr key={qi.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-blue-600 font-medium">{qi.id}</td>
                    <td className="table-cell text-gray-500 text-xs">{qi.date}</td>
                    <td className="table-cell font-mono text-xs">{qi.workOrder}</td>
                    <td className="table-cell text-gray-600">{qi.type}</td>
                    <td className="table-cell">{qi.inspector}</td>
                    <td className="table-cell text-center">{qi.sampleSize}</td>
                    <td className="table-cell text-center">
                      <span className={qi.defects > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                        {qi.defects}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={qi.result === 'Pass' ? 'badge-green' : 'badge-red'}>{qi.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Factory size={18} className="text-blue-500" />
              <h2 className="text-base font-semibold text-gray-900">New Work Order</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="form-label">Product / Part Name *</label>
                <input className="form-input" placeholder="e.g. Frame Assembly FA-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Quantity *</label>
                  <input type="number" className="form-input" placeholder="0" />
                </div>
                <div>
                  <label className="form-label">Production Line *</label>
                  <select className="form-select">
                    <option>Line A</option>
                    <option>Line B</option>
                    <option>Line C</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Planned Start *</label>
                  <input type="date" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Due Date *</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Part Number / Drawing Ref.</label>
                <input className="form-input" placeholder="e.g. DRW-FA-400-Rev3" />
              </div>
              <div>
                <label className="form-label">Special Instructions</label>
                <textarea className="form-input" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowForm(false)}>Create Work Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
