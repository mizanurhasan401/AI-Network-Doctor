import { NavLink, Outlet } from 'react-router-dom'
import { Activity, LayoutDashboard, Stethoscope } from 'lucide-react'
import { cn } from '../lib/utils'

const NAV = [
  { to: '/', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, end: true },
  { to: '/diagnostics', label: 'ডায়াগনস্টিক', icon: Stethoscope, end: false }
] as const

export function Layout(): JSX.Element {
  return (
    <div className="flex h-full">
      <aside className="flex w-60 flex-col border-r border-border bg-surface p-4">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Activity className="text-primary" size={22} />
          <span className="text-lg font-bold">NetDoctor AI</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-2'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs text-muted">স্থানীয় ডায়াগনস্টিক · কোনো ডেটা সংরক্ষিত হয় না</p>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
