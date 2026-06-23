import { Play, RotateCw } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { useDiagnosticStore } from '../../store/diagnosticStore'
import { useProgressSubscription, useRunDiagnostic } from './useDiagnostics'
import { ResultsView } from './components/ResultsView'
import { AiPanel } from '../ai/AiPanel'
import { ReportPanel } from '../report/ReportPanel'

export default function DiagnosticsPage(): JSX.Element {
  useProgressSubscription()
  const snapshot = useDiagnosticStore((s) => s.snapshot)
  const progress = useDiagnosticStore((s) => s.progress)
  const run = useRunDiagnostic()

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ডায়াগনস্টিক</h1>
          <p className="text-sm text-muted">সম্পূর্ণ নেটওয়ার্ক পরীক্ষা চালান ও বিশ্লেষণ করুন</p>
        </div>
        <Button onClick={() => run.mutate()} disabled={run.isPending}>
          {run.isPending ? <RotateCw className="animate-spin" size={16} /> : <Play size={16} />}
          {run.isPending ? 'চলছে…' : 'পরীক্ষা শুরু করুন'}
        </Button>
      </header>

      {run.isPending && progress && (
        <Card>
          <div className="mb-2 flex justify-between text-sm">
            <span>{progress.labelBn}</span>
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
          <p className="text-danger">পরীক্ষা ব্যর্থ হয়েছে। আবার চেষ্টা করুন।</p>
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
        <Card className="text-center text-muted">
          পরীক্ষা শুরু করতে উপরের বোতামে ক্লিক করুন।
        </Card>
      )}
    </div>
  )
}
