import { useState } from 'react'
import { ClipboardList, CheckCircle2, Plus, ChevronDown, ChevronUp } from 'lucide-react'

const forms = [
  {
    id: 'FC-001',
    name: 'In-Process Inspection Record',
    fields: [
      { id: 'wo', label: 'Work Order Number', type: 'text', required: true },
      { id: 'part', label: 'Part Number', type: 'text', required: true },
      { id: 'qty_inspected', label: 'Quantity Inspected', type: 'number', required: true },
      { id: 'inspector', label: 'Inspector Name', type: 'text', required: true },
      { id: 'date', label: 'Inspection Date', type: 'date', required: true },
      { id: 'dim_check', label: 'Dimensional Check Result', type: 'select', options: ['Pass', 'Fail', 'N/A'], required: true },
      { id: 'visual_check', label: 'Visual Inspection Result', type: 'select', options: ['Pass', 'Fail', 'N/A'], required: true },
      { id: 'defects', label: 'Number of Defects Found', type: 'number', required: false },
      { id: 'notes', label: 'Inspector Notes', type: 'textarea', required: false },
    ]
  },
  {
    id: 'FC-002',
    name: 'Equipment Maintenance Log',
    fields: [
      { id: 'eq_id', label: 'Equipment ID', type: 'text', required: true },
      { id: 'eq_name', label: 'Equipment Name', type: 'text', required: true },
      { id: 'maint_date', label: 'Maintenance Date', type: 'date', required: true },
      { id: 'maint_type', label: 'Maintenance Type', type: 'select', options: ['Preventive', 'Corrective', 'Calibration'], required: true },
      { id: 'performed_by', label: 'Performed By', type: 'text', required: true },
      { id: 'duration', label: 'Duration (hours)', type: 'number', required: false },
      { id: 'parts_replaced', label: 'Parts/Materials Used', type: 'textarea', required: false },
      { id: 'next_service', label: 'Next Service Date', type: 'date', required: true },
      { id: 'status', label: 'Equipment Status After Service', type: 'select', options: ['Operational', 'Requires Follow-up', 'Out of Service'], required: true },
      { id: 'remarks', label: 'Remarks', type: 'textarea', required: false },
    ]
  },
  {
    id: 'FC-003',
    name: 'Production Daily Report',
    fields: [
      { id: 'date', label: 'Report Date', type: 'date', required: true },
      { id: 'shift', label: 'Shift', type: 'select', options: ['Day (06:00-14:00)', 'Afternoon (14:00-22:00)', 'Night (22:00-06:00)'], required: true },
      { id: 'line', label: 'Production Line', type: 'select', options: ['Line A', 'Line B', 'Line C'], required: true },
      { id: 'supervisor', label: 'Shift Supervisor', type: 'text', required: true },
      { id: 'target', label: 'Production Target (units)', type: 'number', required: true },
      { id: 'actual', label: 'Actual Output (units)', type: 'number', required: true },
      { id: 'downtime', label: 'Downtime (minutes)', type: 'number', required: false },
      { id: 'downtime_reason', label: 'Downtime Reason', type: 'textarea', required: false },
      { id: 'scrap', label: 'Scrap Count', type: 'number', required: false },
      { id: 'safety_incidents', label: 'Safety Incidents', type: 'select', options: ['None', '1', '2', '3+'], required: true },
    ]
  },
  {
    id: 'FC-004',
    name: 'Supplier Incoming Inspection',
    fields: [
      { id: 'supplier', label: 'Supplier Name', type: 'text', required: true },
      { id: 'po', label: 'Purchase Order Number', type: 'text', required: true },
      { id: 'material', label: 'Material / Part Description', type: 'text', required: true },
      { id: 'qty_received', label: 'Quantity Received', type: 'number', required: true },
      { id: 'receipt_date', label: 'Receipt Date', type: 'date', required: true },
      { id: 'cert_available', label: 'Material Certificate Available', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'visual_result', label: 'Visual Inspection', type: 'select', options: ['Pass', 'Fail'], required: true },
      { id: 'dim_result', label: 'Dimensional Check', type: 'select', options: ['Pass', 'Fail', 'N/A'], required: true },
      { id: 'qty_accepted', label: 'Quantity Accepted', type: 'number', required: true },
      { id: 'disposition', label: 'Disposition', type: 'select', options: ['Accept', 'Reject – Return to Supplier', 'Conditional Accept', 'Hold for Review'], required: true },
      { id: 'notes', label: 'Notes', type: 'textarea', required: false },
    ]
  },
]

const submittedForms = [
  { id: 'SUB-001', form: 'FC-001', submittedBy: 'J. Smith', date: '2024-06-18 09:42', status: 'Complete' },
  { id: 'SUB-002', form: 'FC-003', submittedBy: 'Line Supervisor', date: '2024-06-18 06:05', status: 'Complete' },
  { id: 'SUB-003', form: 'FC-004', submittedBy: 'L. Patel', date: '2024-06-17 14:30', status: 'Complete' },
  { id: 'SUB-004', form: 'FC-002', submittedBy: 'Maintenance Dept', date: '2024-06-17 11:15', status: 'Complete' },
]

function FormField({ field }) {
  if (field.type === 'textarea') {
    return <textarea className="form-input" rows={3} placeholder={field.required ? 'Required' : 'Optional'} />
  }
  if (field.type === 'select') {
    return (
      <select className="form-select">
        <option value="">Select...</option>
        {field.options.map(o => <option key={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input
      type={field.type}
      className="form-input"
      placeholder={field.required ? 'Required' : 'Optional'}
    />
  )
}

export default function DataCollection() {
  const [activeForm, setActiveForm] = useState(null)
  const [tab, setTab] = useState('forms')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setActiveForm(null)
    }, 2000)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {[['forms', 'Data Entry Forms'], ['submissions', 'Recent Submissions']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'forms' && (
        <div className="space-y-3">
          {forms.map(form => (
            <div key={form.id} className="card overflow-hidden">
              <button
                onClick={() => setActiveForm(activeForm === form.id ? null : form.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <ClipboardList size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{form.name}</p>
                  <p className="text-xs text-gray-400">{form.id} · {form.fields.length} fields</p>
                </div>
                {activeForm === form.id
                  ? <ChevronUp size={16} className="text-gray-400" />
                  : <ChevronDown size={16} className="text-gray-400" />
                }
              </button>

              {activeForm === form.id && (
                <div className="border-t border-gray-100 p-5">
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <CheckCircle2 size={40} className="text-green-500" />
                      <p className="text-base font-semibold text-gray-900">Submitted Successfully</p>
                      <p className="text-sm text-gray-500">Your data has been recorded.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        {form.fields.map(field => (
                          <div key={field.id} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                            <label className="form-label">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <FormField field={field} />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
                        <button type="button" className="btn-secondary" onClick={() => setActiveForm(null)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          <CheckCircle2 size={15} /> Submit Record
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'submissions' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Submission ID', 'Form', 'Submitted By', 'Date & Time', 'Status'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submittedForms.map(s => {
                  const form = forms.find(f => f.id === s.form)
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-mono text-xs text-blue-600 font-medium">{s.id}</td>
                      <td className="table-cell">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{form?.name}</p>
                          <p className="text-xs text-gray-400">{s.form}</p>
                        </div>
                      </td>
                      <td className="table-cell">{s.submittedBy}</td>
                      <td className="table-cell text-gray-500 text-xs">{s.date}</td>
                      <td className="table-cell"><span className="badge-green">{s.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
