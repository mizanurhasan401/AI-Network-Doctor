import { Play, RotateCw } from 'lucide-react'
import type { MessageKey } from '@shared/i18n'
import type { ProgressEvent } from '@shared/ipc/contract'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { useDiagnosticStore } from '../../store/diagnosticStore'
import { useT, type TFunction } from '../../i18n/useT'
import { useProgressSubscription, useRunDiagnostic } from './useDiagnostics'
import { ResultsView } from './components/ResultsView'
import { AiPanel } from '../ai/AiPanel'
import { ReportPanel } from '../report/ReportPanel'

/** Localizes a live progress event from its stage (and speed sub-phase). */
function progressLabel(t: TFunction, progress: ProgressEvent): string {
  if (progress.stage === 'speedTest' && progress.phase) {
    return t(`progress.speed.${progress.phase}`)
  }
  return t(`progress.${progress.stage}` as MessageKey)
}

export default function DiagnosticsPage(): JSX.Element {
  useProgressSubscription()
  const snapshot = useDiagnosticStore((s) => s.snapshot)
  const progress = useDiagnosticStore((s) => s.progress)
  const run = useRunDiagnostic()
  const t = useT()

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('diagnostics.title')}</h1>
          <p className="text-sm text-muted">{t('diagnostics.subtitle')}</p>
        </div>
        <Button onClick={() => run.mutate()} disabled={run.isPending}>
          {run.isPending ? <RotateCw className="animate-spin" size={16} /> : <Play size={16} />}
          {run.isPending ? t('diagnostics.running') : t('diagnostics.startButton')}
        </Button>
      </header>

      {run.isPending && progress && (
        <Card>
          <div className="mb-2 flex justify-between text-sm">
            <span>{progressLabel(t, progress)}</span>
            <span className="text-muted">
              {progress.stage === 'speedTest' && progress.currentMbps != null
                ? `${progress.currentMbps} Mbps · ${progress.percent}%`
                : `${progress.percent}%`}
            </span>
          </div>
          <Progress value={progress.percent} />
        </Card>
      )}

      {run.isError && (
        <Card>
          <p className="text-danger">{t('diagnostics.failed')}</p>
        </Card>
      )}

      {snapshot && (
        <>
          <ResultsView snapshot={snapshot} />
          <AiPanel snapshot={snapshot} />
          <ReportPanel snapshot={snapshot} />
        </>
      )}

      {!snapshot && !run.isPending && (
        <Card className="text-center text-muted">{t('diagnostics.empty')}</Card>
      )}
    </div>
  )
}
