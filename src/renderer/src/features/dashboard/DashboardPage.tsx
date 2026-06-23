import { useNavigate } from 'react-router-dom'
import { Globe, Router, ShieldCheck, Wifi } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardValue } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { useDiagnosticStore } from '../../store/diagnosticStore'
import { useT } from '../../i18n/useT'
import { gradeTone, scoreTone } from '../health/healthPresentation'

export default function DashboardPage(): JSX.Element {
  const snapshot = useDiagnosticStore((s) => s.snapshot)
  const navigate = useNavigate()
  const t = useT()

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted">{t('dashboard.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/diagnostics')}>{t('dashboard.runButton')}</Button>
      </header>

      {!snapshot ? (
        <Card className="text-center">
          <p className="text-muted">{t('dashboard.empty')}</p>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.healthScore')}</CardTitle>
              <Badge tone={gradeTone(snapshot.health.grade)}>
                {t(`grade.${snapshot.health.grade}`)}
              </Badge>
            </CardHeader>
            <div className="flex items-end gap-4">
              <CardValue className="text-5xl">{snapshot.health.overall}</CardValue>
              <span className="pb-2 text-muted">/ 100</span>
            </div>
            <Progress
              className="mt-4"
              value={snapshot.health.overall}
              tone={scoreTone(snapshot.health.overall)}
            />
          </Card>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatusCard
              icon={<Globe size={18} />}
              title={t('status.internet')}
              ok={snapshot.connectivity.internet.alive}
            />
            <StatusCard
              icon={<Router size={18} />}
              title={t('status.router')}
              ok={snapshot.connectivity.gateway.alive}
            />
            <StatusCard
              icon={<ShieldCheck size={18} />}
              title={t('status.https')}
              ok={snapshot.connectivity.https.ok}
            />
            <StatusCard
              icon={<Wifi size={18} />}
              title={t('status.dns')}
              ok={snapshot.dns.servers.some((d) => d.reachable)}
            />
          </div>
        </>
      )}
    </div>
  )
}

function StatusCard({
  icon,
  title,
  ok
}: {
  icon: JSX.Element
  title: string
  ok: boolean
}): JSX.Element {
  const t = useT()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <Badge tone={ok ? 'success' : 'danger'}>{ok ? t('status.active') : t('status.inactive')}</Badge>
    </Card>
  )
}
