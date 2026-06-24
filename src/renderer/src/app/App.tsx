import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './Layout'
import { useT } from '../i18n/useT'

// Lazy-loaded routes → code splitting + minimal startup cost (perf requirement).
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const DiagnosticsPage = lazy(() => import('../features/diagnostics/DiagnosticsPage'))
const RouterPage = lazy(() => import('../features/router/RouterPage'))

function RouteFallback(): JSX.Element {
  const t = useT()
  return <div className="text-sm text-muted">{t('app.loading')}</div>
}

export function App(): JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="diagnostics"
            element={
              <Suspense fallback={<RouteFallback />}>
                <DiagnosticsPage />
              </Suspense>
            }
          />
          <Route
            path="router"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RouterPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  )
}
