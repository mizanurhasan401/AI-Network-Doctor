import type { DiagnosticSnapshot } from '@shared/types/report'
import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useDiagnosticStore } from '../../store/diagnosticStore'
import { useT } from '../../i18n/useT'
import { useAnalyze } from '../diagnostics/useDiagnostics'
import { severityTone } from '../health/healthPresentation'

export function AiPanel({ snapshot }: { snapshot: DiagnosticSnapshot }): JSX.Element {
  const recommendation = useDiagnosticStore((s) => s.recommendation)
  const aiConfig = useDiagnosticStore((s) => s.aiConfig)
  const setAiConfig = useDiagnosticStore((s) => s.setAiConfig)
  const analyze = useAnalyze()
  const t = useT()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={18} /> {t('ai.title')}
        </CardTitle>
        <Button
          size="sm"
          onClick={() => analyze.mutate(snapshot)}
          disabled={analyze.isPending}
        >
          {analyze.isPending ? t('ai.analyzing') : t('ai.analyzeButton')}
        </Button>
      </CardHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="password"
          placeholder={t('ai.apiKeyPlaceholder')}
          value={aiConfig.apiKey ?? ''}
          onChange={(e) => setAiConfig({ apiKey: e.target.value })}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <span className="text-xs text-muted">{t('ai.apiKeyHelper')}</span>
      </div>

      {analyze.isError && <p className="text-sm text-danger">{t('ai.failed')}</p>}

      {recommendation && (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge tone={severityTone(recommendation.priority === 'low' ? 'info' : recommendation.priority === 'medium' ? 'warning' : 'critical')}>
              {t('ai.priority')}: {t(`priority.${recommendation.priority}`)}
            </Badge>
            <span className="text-muted">{t('ai.confidence')}: {(recommendation.confidence * 100).toFixed(0)}%</span>
            {recommendation.generatedByFallback && <Badge tone="neutral">{t('ai.offline')}</Badge>}
          </div>
          <Field label={t('ai.problemSummary')} value={recommendation.problemSummaryBn} />
          <Field label={t('ai.rootCause')} value={recommendation.rootCauseBn} />
          <Field label={t('ai.impact')} value={recommendation.impactBn} />
          <div>
            <p className="font-semibold text-muted">{t('ai.solutions')}</p>
            <ol className="ml-5 list-decimal space-y-1">
              {recommendation.solutionsBn.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Card>
  )
}

function Field({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <p className="font-semibold text-muted">{label}</p>
      <p>{value}</p>
    </div>
  )
}
