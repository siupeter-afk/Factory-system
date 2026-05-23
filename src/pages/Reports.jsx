import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, FileText, TrendingUp, Shield } from 'lucide-react'
import { kpiData, productionTrend } from '../data/mockData'

const reportTemplates = [
  { icon: Shield, title: 'ISO Compliance Summary', desc: 'NCR status, CAPA completion, document review compliance', color: 'text-blue-600 bg-blue-50' },
  { icon: TrendingUp, title: 'Production Performance Report', desc: 'OEE, output vs target, defect rates, line efficiency', color: 'text-green-600 bg-green-50' },
  { icon: FileText, title: 'Audit Findings Report', desc: 'Internal/external audit results, open findings, closure status', color: 'text-purple-600 bg-purple-50' },
  { icon: FileText, title: 'Equipment Calibration Report', desc: 'Calibration status, upcoming due dates, overdue items', color: 'text-orange-600 bg-orange-50' },
  { icon: FileText, title: 'Management Review Package', desc: 'Full QMS metrics for management review meeting', color: 'text-red-600 bg-red-50' },
  { icon: FileText, title: 'Supplier Quality Report', desc: 'Incoming inspection results, supplier NCRs, performance ratings', color: 'text-teal-600 bg-teal-50' },
]

const ncrTrend = [
  { month: 'Jan', raised: 6, closed: 5 },
  { month: 'Feb', raised: 4, closed: 6 },
  { month: 'Mar', raised: 8, closed: 7 },
  { month: 'Apr', raised: 5, closed: 6 },
  { month: 'May', raised: 3, closed: 4 },
  { month: 'Jun', raised: 6, closed: 4 },
]

export default function Reports() {
  return (
    <div className="p-6 space-y-6">
      {/* Quick Export Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Report Templates</h2>
        <div className="grid grid-cols-3 gap-4">
          {reportTemplates.map(r => (
            <div key={r.title} className="card p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.color}`}>
                <r.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{r.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-blue-600">
                <Download size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">NCR Trend – Raised vs Closed</h3>
            <button className="btn-secondary text-xs py-1">
              <Download size={13} /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ncrTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="raised" name="NCRs Raised" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="closed" name="NCRs Closed" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Production vs Target (Units)</h3>
            <button className="btn-secondary text-xs py-1">
              <Download size={13} /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={productionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">KPI Summary – Last 6 Months</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Month', 'OEE (%)', 'Quality Rate (%)', 'On-Time Delivery (%)', 'NCRs Raised', 'NCRs Closed', 'Status'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kpiData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium">{row.month}</td>
                  <td className="table-cell">
                    <span className={`font-semibold ${row.oee >= 85 ? 'text-green-600' : row.oee >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {row.oee}%
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`font-semibold ${row.quality >= 97 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {row.quality}%
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`font-semibold ${row.delivery >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {row.delivery}%
                    </span>
                  </td>
                  <td className="table-cell text-center">{ncrTrend[i]?.raised ?? '—'}</td>
                  <td className="table-cell text-center">{ncrTrend[i]?.closed ?? '—'}</td>
                  <td className="table-cell">
                    <span className={row.oee >= 85 && row.quality >= 97 ? 'badge-green' : 'badge-yellow'}>
                      {row.oee >= 85 && row.quality >= 97 ? 'On Target' : 'Monitor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
