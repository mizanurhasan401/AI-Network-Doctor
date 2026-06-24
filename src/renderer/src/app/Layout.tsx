import { NavLink, Outlet } from 'react-router-dom'
import { Activity, LayoutDashboard, Router as RouterIcon, Stethoscope } from 'lucide-react'
import type { MessageKey } from '@shared/i18n'
import { cn } from '../lib/utils'
import { useT } from '../i18n/useT'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const NAV: readonly { to: string; labelKey: MessageKey; icon: typeof LayoutDashboard; end: boolean }[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/diagnostics', labelKey: 'nav.diagnostics', icon: Stethoscope, end: false },
  { to: '/router', labelKey: 'nav.router', icon: RouterIcon, end: false }
]

export function Layout(): JSX.Element {
  const t = useT()
  return (
    <div className="flex h-full">
      <aside className="flex w-60 flex-col border-r border-border bg-surface p-4">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Activity className="text-primary" size={22} />
          <span className="text-lg font-bold">{t('app.name')}</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, labelKey, icon: Icon, end }) => (
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
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <LanguageSwitcher />
          <p className="px-2 text-xs text-muted">{t('app.footer')}</p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
