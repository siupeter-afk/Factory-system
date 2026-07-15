import { Building, Users, Bell, Shield, Globe } from 'lucide-react'

export default function Settings() {
  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Company Info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building size={18} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Company Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Company Name</label>
            <input className="form-input" defaultValue="Acme Manufacturing Ltd." />
          </div>
          <div>
            <label className="form-label">Registration Number</label>
            <input className="form-input" defaultValue="12345678" />
          </div>
          <div>
            <label className="form-label">Site / Facility</label>
            <input className="form-input" defaultValue="Main Plant – Building A" />
          </div>
          <div>
            <label className="form-label">Industry Sector</label>
            <select className="form-select">
              <option>Metal Fabrication</option>
              <option>Automotive</option>
              <option>Electronics</option>
              <option>Food & Beverage</option>
              <option>Pharmaceuticals</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* ISO Certification */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">ISO Certification</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Standard</label>
            <select className="form-select">
              <option>ISO 9001:2015</option>
              <option>ISO 14001:2015</option>
              <option>ISO 45001:2018</option>
              <option>IATF 16949:2016</option>
              <option>ISO 13485:2016</option>
            </select>
          </div>
          <div>
            <label className="form-label">Certification Body</label>
            <input className="form-input" defaultValue="Bureau Veritas" />
          </div>
          <div>
            <label className="form-label">Certificate Number</label>
            <input className="form-input" defaultValue="BV-ISO-9001-2024-00123" />
          </div>
          <div>
            <label className="form-label">Expiry Date</label>
            <input type="date" className="form-input" defaultValue="2025-12-31" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Notifications & Alerts</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'NCR Raised', desc: 'Alert when a new non-conformance is opened' },
            { label: 'CAPA Overdue', desc: 'Alert when a CAPA action passes its due date' },
            { label: 'Calibration Due', desc: 'Remind 30 days before equipment calibration is due' },
            { label: 'Document Review Due', desc: 'Remind when document review date is approaching (30 days)' },
            { label: 'Audit Scheduled', desc: 'Notify relevant teams when an audit is scheduled' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">User Roles</h2>
        </div>
        <div className="space-y-2">
          {[
            { name: 'QA Director', role: 'Admin', email: 'qa.director@acme.com' },
            { name: 'QA Manager', role: 'Quality Manager', email: 'qa.manager@acme.com' },
            { name: 'J. Smith', role: 'Inspector', email: 'j.smith@acme.com' },
            { name: 'M. Chen', role: 'Production Supervisor', email: 'm.chen@acme.com' },
          ].map(u => (
            <div key={u.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                  {u.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
              <span className="badge-blue">{u.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn-secondary">Discard Changes</button>
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  )
}
