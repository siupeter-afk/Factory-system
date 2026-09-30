import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import DocumentControl from './pages/DocumentControl'
import NonConformances from './pages/NonConformances'
import CAPA from './pages/CAPA'
import Audits from './pages/Audits'
import ProductionLog from './pages/ProductionLog'
import Materials from './pages/Materials'
import QC from './pages/QC'
import Forms from './pages/Forms'
import Deviations from './pages/Deviations'
import Stocktake from './pages/Stocktake'
import MixDesign from './pages/MixDesign'
import Equipment from './pages/Equipment'
import DataCollection from './pages/DataCollection'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { AuthProvider, useAuth, homeFor } from './auth/AuthContext'
import { I18nProvider, useI18n } from './i18n'

// Routes each role may open. Deep links outside the list bounce to the role home.
const ROLE_ROUTES = {
  owner: null, // all
  operations: ['/orders', '/materials', '/products', '/forms'],
  production: ['/orders', '/production', '/materials', '/products', '/forms', '/deviations'],
  lab: ['/qc', '/mix-design', '/orders', '/materials', '/products', '/forms', '/deviations'],
  driver: ['/orders', '/forms'],
  engineering: ['/equipment', '/forms'],
  accountant: ['/reports', '/orders', '/forms'],
}

function pageMeta(t) {
  return {
    '/': { title: t('nav.dashboard'), subtitle: '' },
    '/orders': { title: t('orders.title'), subtitle: t('orders.subtitle') },
    '/products': { title: t('products.title'), subtitle: t('products.subtitle') },
    '/compliance/documents': { title: t('nav.documents'), subtitle: '' },
    '/compliance/audits': { title: t('nav.audits'), subtitle: '' },
    '/compliance/ncr': { title: t('nav.ncr'), subtitle: '' },
    '/compliance/capa': { title: t('nav.capa'), subtitle: '' },
    '/production': { title: t('nav.productionLog'), subtitle: t('batches.subtitle') },
    '/materials': { title: t('nav.materials'), subtitle: t('materials.subtitle') },
    '/qc': { title: t('nav.qc'), subtitle: t('qc.subtitle') },
    '/forms': { title: t('nav.forms'), subtitle: t('forms.subtitle') },
    '/deviations': { title: t('nav.deviations'), subtitle: t('deviations.subtitle') },
    '/stocktake': { title: t('nav.stocktake'), subtitle: t('stocktake.subtitle') },
    '/mix-design': { title: t('nav.mixDesign'), subtitle: t('mix.subtitle') },
    '/equipment': { title: t('nav.equipment'), subtitle: '' },
    '/data-collection': { title: t('nav.dataCollection'), subtitle: '' },
    '/reports': { title: t('nav.reports'), subtitle: '' },
    '/settings': { title: t('nav.settings'), subtitle: '' },
  }
}

function Shell() {
  const [expanded, setExpanded] = useState(null)
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useI18n()

  const allowed = ROLE_ROUTES[user.role]
  if (allowed && !allowed.includes(location.pathname)) {
    return <Navigate to={homeFor(user.role)} replace />
  }

  const meta = pageMeta(t)[location.pathname] || { title: t('app.name'), subtitle: '' }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={user.role === 'owner' ? <Dashboard /> : <Navigate to={homeFor(user.role)} replace />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/compliance/documents" element={<DocumentControl />} />
            <Route path="/compliance/audits" element={<Audits />} />
            <Route path="/compliance/ncr" element={<NonConformances />} />
            <Route path="/compliance/capa" element={<CAPA />} />
            <Route path="/production" element={<ProductionLog />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/qc" element={<QC />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/deviations" element={<Deviations />} />
            <Route path="/stocktake" element={user.role === 'owner' ? <Stocktake /> : <Navigate to={homeFor(user.role)} replace />} />
            <Route path="/mix-design" element={<MixDesign />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/data-collection" element={<DataCollection />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to={homeFor(user.role)} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function Gate() {
  const { user } = useAuth()
  return user ? <Shell /> : <Login />
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <HashRouter>
          <Gate />
        </HashRouter>
      </AuthProvider>
    </I18nProvider>
  )
}
