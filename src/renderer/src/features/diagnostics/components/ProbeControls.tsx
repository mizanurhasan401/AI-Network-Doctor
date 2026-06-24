import { Card, CardHeader, CardTitle } from '../../../components/ui/card'
import { useDiagnosticStore } from '../../../store/diagnosticStore'
import { useT } from '../../../i18n/useT'

/** Preset ping counts. `null` = service default (connectivity 5 / packet-loss 20). */
const PING_COUNTS: readonly (number | null)[] = [null, 20, 50, 100]
/** Preset ICMP payload sizes in bytes. `null` = OS default. */
const PACKET_SIZES: readonly (number | null)[] = [null, 32, 56, 1472]

/**
 * Lets the user raise the ping count (so packet-loss % is trustworthy — 1 drop of
 * 100 is 1%, not 20%) and pick a custom ICMP payload size before running a test.
 */
export function ProbeControls(): JSX.Element {
  const t = useT()
  const probeConfig = useDiagnosticStore((s) => s.probeConfig)
  const setProbeConfig = useDiagnosticStore((s) => s.setProbeConfig)

  const parse = (v: string): number | null => (v === '' ? null : Number(v))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('probe.title')}</CardTitle>
      </CardHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">{t('probe.pingCount')}</span>
          <select
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={probeConfig.pingCount ?? ''}
            onChange={(e) => setProbeConfig({ pingCount: parse(e.target.value) })}
          >
            {PING_COUNTS.map((c) => (
              <option key={String(c)} value={c ?? ''}>
                {c === null ? t('probe.default') : c}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-muted">{t('probe.countHint')}</span>
        </label>

        <label className="block text-sm">
          <span className="text-muted">{t('probe.packetSize')}</span>
          <select
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={probeConfig.packetSizeBytes ?? ''}
            onChange={(e) => setProbeConfig({ packetSizeBytes: parse(e.target.value) })}
          >
            {PACKET_SIZES.map((s) => (
              <option key={String(s)} value={s ?? ''}>
                {s === null ? t('probe.default') : t('probe.bytes', { value: s })}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-muted">{t('probe.sizeHint')}</span>
        </label>
      </div>
    </Card>
  )
}
