import { useNavigate } from 'react-router-dom'
import { Globe, Router, ShieldCheck, Wifi } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardValue } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { useDiagnosticStore } from '../../store/diagnosticStore'
import { GRADE_LABEL_BN, gradeTone, scoreTone } from '../health/healthPresentation'

export default function DashboardPage(): JSX.Element {
  const snapshot = useDiagnosticStore((s) => s.snapshot)
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
          <p className="text-sm text-muted">নেটওয়ার্ক স্বাস্থ্যের সারসংক্ষেপ</p>
        </div>
        <Button onClick={() => navigate('/diagnostics')}>ডায়াগনস্টিক চালান</Button>
      </header>

      {!snapshot ? (
        <Card className="text-center">
          <p className="text-muted">
            এখনো কোনো ডায়াগনস্টিক চালানো হয়নি। শুরু করতে “ডায়াগনস্টিক চালান” ক্লিক করুন।
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>নেটওয়ার্ক স্বাস্থ্য স্কোর</CardTitle>
              <Badge tone={gradeTone(snapshot.health.grade)}>
                {GRADE_LABEL_BN[snapshot.health.grade]}
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
              title="ইন্টারনেট"
              ok={snapshot.connectivity.internet.alive}
            />
            <StatusCard
              icon={<Router size={18} />}
              title="রাউটার"
              ok={snapshot.connectivity.gateway.alive}
            />
            <StatusCard
              icon={<ShieldCheck size={18} />}
              title="HTTPS"
              ok={snapshot.connectivity.https.ok}
            />
            <StatusCard
              icon={<Wifi size={18} />}
              title="DNS"
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <Badge tone={ok ? 'success' : 'danger'}>{ok ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</Badge>
    </Card>
  )
}
