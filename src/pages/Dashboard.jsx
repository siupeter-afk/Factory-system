import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, FileText, Wrench, Factory, Activity
} from 'lucide-react'
import { kpiData, complianceData, productionTrend, recentActivity } from '../data/mockData'

const COLORS = ['#22c55e', '#f59e0b', '#ef4444']

function StatCard({ label, value, unit, change, icon: Icon, color }) {
  const isPositive = change >= 0
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div className="flex items-end gap-2 mt-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
      </div>
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{Math.abs(change)}% vs last month</span>
      </div>
    </div>
  )
}

function ActivityIcon({ type }) {
  const map = {
    ncr: { icon: AlertTriangle, cls: 'text-orange-500' },
    wo: { icon: Factory, cls: 'text-blue-500' },
    doc: { icon: FileText, cls: 'text-purple-500' },
    capa: { icon: CheckCircle, cls: 'text-green-500' },
    audit: { icon: Activity, cls: 'text-blue-400' },
    equip: { icon: Wrench, cls: 'text-red-500' },
  }
  const { icon: Icon, cls } = map[type] || { icon: Activity, cls: 'text-gray-400' }
  return <Icon size={15} className={cls} />
}

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Overall Equipment Effectiveness" value="87" unit="%" change={4.8} icon={Factory} color="bg-blue-500" />
        <StatCard label="Quality Rate" value="98.2" unit="%" change={1.2} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="On-Time Delivery" value="96" unit="%" change={-1.0} icon={Clock} color="bg-purple-500" />
        <StatCard label="Open NCRs" value="4" unit="" change={-20.0} icon={AlertTriangle} color="bg-orange-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* OEE & Quality Trend */}
        <div className="card p-5 col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">KPI Trends – Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={kpiData}>
              <defs>
                <linearGradient id="oeeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="oee" name="OEE %" stroke="#3b82f6" fill="url(#oeeGrad)" strokeWidth={2} dot={{ r: 3 }} />
              <Area type="monotone" dataKey="quality" name="Quality %" stroke="#22c55e" fill="url(#qualGrad)" strokeWidth={2} dot={{ r: 3 }} />
              <Area type="monotone" dataKey="delivery" name="Delivery %" stroke="#a855f7" fill="none" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Overview */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">ISO Compliance Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={complianceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {complianceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {complianceData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Chart + Activity */}
      <div className="grid grid-cols-3 gap-4">
        {/* Production vs Target */}
        <div className="card p-5 col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Production vs Target</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productionTrend} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="defects" name="Defects" fill="#f97316" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map(a => (
              <div key={a.id} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <ActivityIcon type={a.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
