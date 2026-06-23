import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './Layout'

// Lazy-loaded routes → code splitting + minimal startup cost (perf requirement).
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const DiagnosticsPage = lazy(() => import('../features/diagnostics/DiagnosticsPage'))

function RouteFallback(): JSX.Element {
  return <div className="text-sm text-muted">লোড হচ্ছে…</div>
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
        </Route>
      </Routes>
    </HashRouter>
  )
}
