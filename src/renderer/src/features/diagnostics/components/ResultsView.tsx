import type { DiagnosticSnapshot } from '@shared/types/report'
import { Card, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { scoreTone, SEVERITY_LABEL_BN, severityTone } from '../../health/healthPresentation'

const ms = (v: number | null): string => (v === null ? '—' : `${v}ms`)
const yesNo = (v: boolean): string => (v ? 'হ্যাঁ' : 'না')

export function ResultsView({ snapshot }: { snapshot: DiagnosticSnapshot }): JSX.Element {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>সংযোগ</CardTitle>
        </CardHeader>
        <Row label="গেটওয়ে পিং" value={`${yesNo(snapshot.connectivity.gateway.alive)} · ${ms(snapshot.connectivity.gateway.avgMs)}`} />
        <Row label="ইন্টারনেট পিং" value={`${yesNo(snapshot.connectivity.internet.alive)} · ${ms(snapshot.connectivity.internet.avgMs)}`} />
        <Row label="HTTP / HTTPS" value={`${yesNo(snapshot.connectivity.http.ok)} / ${yesNo(snapshot.connectivity.https.ok)}`} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>লেটেন্সি ও প্যাকেট লস</CardTitle>
        </CardHeader>
        <Row label="প্যাকেট লস" value={`${snapshot.packetLoss.lossPercent}%`} />
        <Row label="গড় লেটেন্সি" value={ms(snapshot.packetLoss.latencyAvgMs)} />
        <Row label="জিটার" value={ms(snapshot.packetLoss.jitterMs)} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ডিএনএস</CardTitle>
        </CardHeader>
        <Row label="গড় রেজোলিউশন" value={ms(snapshot.dns.avgResolveMs)} />
        {snapshot.dns.servers.map((s) => (
          <Row key={s.server} label={s.server} value={s.reachable ? ms(s.resolveMs) : 'সাড়া নেই'} />
        ))}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>গতি পরীক্ষা</CardTitle>
        </CardHeader>
        {snapshot.speedTest.available ? (
          <>
            <Row label="ডাউনলোড" value={`${snapshot.speedTest.downloadMbps ?? '—'} Mbps`} />
            <Row label="আপলোড" value={`${snapshot.speedTest.uploadMbps ?? '—'} Mbps`} />
            <Row label="পিং" value={ms(snapshot.speedTest.pingMs)} />
          </>
        ) : (
          <p className="text-sm text-muted">{snapshot.speedTest.error ?? 'গতি পরীক্ষা উপলব্ধ নয়।'}</p>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>স্বাস্থ্য উপাদান</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {snapshot.health.components.map((c) => (
            <div key={c.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{c.labelBn}</span>
                <span className="text-muted">{c.measured ? `${c.score}/100` : 'পরিমাপ হয়নি'}</span>
              </div>
              <Progress value={c.measured ? c.score : 0} tone={scoreTone(c.score)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>সনাক্তকৃত সমস্যা ({snapshot.issues.length})</CardTitle>
        </CardHeader>
        {snapshot.issues.length === 0 ? (
          <p className="text-sm text-muted">কোনো সমস্যা শনাক্ত হয়নি।</p>
        ) : (
          <ul className="space-y-2">
            {snapshot.issues.map((i) => (
              <li key={i.id} className="flex items-start gap-3">
                <Badge tone={severityTone(i.severity)}>{SEVERITY_LABEL_BN[i.severity]}</Badge>
                <div>
                  <p className="text-sm font-medium">{i.titleBn}</p>
                  <p className="text-xs text-muted">{i.descriptionBn}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex justify-between border-b border-border/50 py-1.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
