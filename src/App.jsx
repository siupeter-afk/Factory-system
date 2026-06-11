import { useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import DocumentControl from './pages/DocumentControl'
import NonConformances from './pages/NonConformances'
import CAPA from './pages/CAPA'
import Audits from './pages/Audits'
import Production from './pages/Production'
import Equipment from './pages/Equipment'
import DataCollection from './pages/DataCollection'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

const pageMeta = {
  '/': { title: 'Dashboard', subtitle: 'Factory overview and KPI summary' },
  '/compliance/documents': { title: 'Document Control', subtitle: 'Manage ISO procedures, manuals and work instructions' },
  '/compliance/audits': { title: 'Audits', subtitle: 'Schedule and track internal, external and supplier audits' },
  '/compliance/ncr': { title: 'Non-Conformances', subtitle: 'Log and manage non-conformance reports (NCRs)' },
  '/compliance/capa': { title: 'CAPA', subtitle: 'Corrective and Preventive Action tracking' },
  '/production': { title: 'Production', subtitle: 'Work orders, scheduling and quality inspections' },
  '/equipment': { title: 'Equipment & Calibration', subtitle: 'Asset registry, maintenance and calibration schedules' },
  '/data-collection': { title: 'Data Collection', subtitle: 'Digital forms for production and quality data entry' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Compliance reports and KPI analysis' },
  '/settings': { title: 'Settings', subtitle: 'Company configuration and system preferences' },
}

function Layout() {
  const [expanded, setExpanded] = useState(1)
  const location = useLocation()
  const meta = pageMeta[location.pathname] || { title: 'FactoryOS', subtitle: '' }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compliance/documents" element={<DocumentControl />} />
            <Route path="/compliance/audits" element={<Audits />} />
            <Route path="/compliance/ncr" element={<NonConformances />} />
            <Route path="/compliance/capa" element={<CAPA />} />
            <Route path="/production" element={<Production />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/data-collection" element={<DataCollection />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}
