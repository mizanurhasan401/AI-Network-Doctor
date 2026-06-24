import type { DiagnosticSnapshot } from '@shared/types/report'
import { issueDescription, issueTitle } from '@shared/i18n'
import { Card, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { useLanguage, useT } from '../../../i18n/useT'
import { scoreTone, severityTone } from '../../health/healthPresentation'

const ms = (v: number | null): string => (v === null ? '—' : `${v}ms`)

export function ResultsView({ snapshot }: { snapshot: DiagnosticSnapshot }): JSX.Element {
  const t = useT()
  const language = useLanguage()
  const yesNo = (v: boolean): string => (v ? t('common.yes') : t('common.no'))

  const dash = (v: string | null): string => v ?? '—'

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('results.systemInfo')}</CardTitle>
        </CardHeader>
        <Row label={t('results.hostname')} value={dash(snapshot.system.hostname)} />
        <Row label={t('results.localIp')} value={dash(snapshot.system.localIp)} />
        <Row
          label={t('results.linkSpeed')}
          value={
            (snapshot.system.linkSpeedMbps != null
              ? t('results.linkSpeedValue', { value: snapshot.system.linkSpeedMbps })
              : t('results.linkSpeedUnknown')) +
            (snapshot.system.linkType === 'wireless'
              ? ` · ${t('results.linkWifi')}`
              : snapshot.system.linkType === 'wired'
                ? ` · ${t('results.linkWired')}`
                : '')
          }
        />
        <Row
          label={t('results.routerGateway')}
          value={`${dash(snapshot.system.gatewayIp)} · ${t('results.gatewayReachable')}: ${yesNo(snapshot.connectivity.gateway.alive)}`}
        />
        <Row label={t('results.internetGateway')} value={dash(snapshot.system.publicIp)} />
        <Row
          label={t('results.dnsServersLabel')}
          value={snapshot.system.dnsServers.length > 0 ? snapshot.system.dnsServers.join(', ') : '—'}
        />
        {snapshot.system.linkType === 'wireless' && (
          <p className="mt-2 text-xs text-muted">{t('results.linkWifiNote')}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('results.connectivity')}</CardTitle>
        </CardHeader>
        <Row label={t('results.gatewayPing')} value={`${yesNo(snapshot.connectivity.gateway.alive)} · ${ms(snapshot.connectivity.gateway.avgMs)}`} />
        <Row label={t('results.internetPing')} value={`${yesNo(snapshot.connectivity.internet.alive)} · ${ms(snapshot.connectivity.internet.avgMs)}`} />
        <Row label={t('results.httpHttps')} value={`${yesNo(snapshot.connectivity.http.ok)} / ${yesNo(snapshot.connectivity.https.ok)}`} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('results.latencyPacketLoss')}</CardTitle>
        </CardHeader>
        <Row label={t('results.packetLoss')} value={`${snapshot.packetLoss.lossPercent}%`} />
        <Row label={t('results.avgLatency')} value={ms(snapshot.packetLoss.latencyAvgMs)} />
        <Row label={t('results.jitter')} value={ms(snapshot.packetLoss.jitterMs)} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('results.dns')}</CardTitle>
        </CardHeader>
        <Row label={t('results.avgResolution')} value={ms(snapshot.dns.avgResolveMs)} />
        {snapshot.dns.servers.map((s) => (
          <Row key={s.server} label={s.server} value={s.reachable ? ms(s.resolveMs) : t('results.noResponse')} />
        ))}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('results.speedTest')}</CardTitle>
        </CardHeader>
        {snapshot.speedTest.available ? (
          <>
            <Row label={t('results.download')} value={`${snapshot.speedTest.downloadMbps ?? '—'} Mbps`} />
            <Row label={t('results.upload')} value={`${snapshot.speedTest.uploadMbps ?? '—'} Mbps`} />
            <Row label={t('results.ping')} value={ms(snapshot.speedTest.pingMs)} />
          </>
        ) : (
          <p className="text-sm text-muted">{t('results.speedUnavailable')}</p>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('results.healthComponents')}</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {snapshot.health.components.map((c) => (
            <div key={c.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{t(`health.${c.key}`)}</span>
                <span className="text-muted">{c.measured ? `${c.score}/100` : t('results.notMeasured')}</span>
              </div>
              <Progress value={c.measured ? c.score : 0} tone={scoreTone(c.score)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('results.detectedIssues', { count: snapshot.issues.length })}</CardTitle>
        </CardHeader>
        {snapshot.issues.length === 0 ? (
          <p className="text-sm text-muted">{t('results.noIssues')}</p>
        ) : (
          <ul className="space-y-2">
            {snapshot.issues.map((i) => (
              <li key={i.id} className="flex items-start gap-3">
                <Badge tone={severityTone(i.severity)}>{t(`severity.${i.severity}`)}</Badge>
                <div>
                  <p className="text-sm font-medium">{issueTitle(language, i)}</p>
                  <p className="text-xs text-muted">{issueDescription(language, i)}</p>
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
