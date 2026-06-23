import type { DiagnosticSnapshot } from '@shared/types/report'
import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useDiagnosticStore } from '../../store/diagnosticStore'
import { useAnalyze } from '../diagnostics/useDiagnostics'
import { PRIORITY_LABEL_BN, severityTone } from '../health/healthPresentation'

export function AiPanel({ snapshot }: { snapshot: DiagnosticSnapshot }): JSX.Element {
  const recommendation = useDiagnosticStore((s) => s.recommendation)
  const aiConfig = useDiagnosticStore((s) => s.aiConfig)
  const setAiConfig = useDiagnosticStore((s) => s.setAiConfig)
  const analyze = useAnalyze()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={18} /> AI বিশ্লেষণ
        </CardTitle>
        <Button
          size="sm"
          onClick={() => analyze.mutate(snapshot)}
          disabled={analyze.isPending}
        >
          {analyze.isPending ? 'বিশ্লেষণ হচ্ছে…' : 'বিশ্লেষণ করুন'}
        </Button>
      </CardHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="password"
          placeholder="OpenAI API কী (ঐচ্ছিক)"
          value={aiConfig.apiKey ?? ''}
          onChange={(e) => setAiConfig({ apiKey: e.target.value })}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <span className="text-xs text-muted">কী না দিলে অফলাইন বিশ্লেষণ ব্যবহৃত হবে</span>
      </div>

      {analyze.isError && (
        <p className="text-sm text-danger">বিশ্লেষণ ব্যর্থ হয়েছে — অফলাইন বিশ্লেষণ চেষ্টা করুন।</p>
      )}

      {recommendation && (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge tone={severityTone(recommendation.priority === 'low' ? 'info' : recommendation.priority === 'medium' ? 'warning' : 'critical')}>
              অগ্রাধিকার: {PRIORITY_LABEL_BN[recommendation.priority]}
            </Badge>
            <span className="text-muted">কনফিডেন্স: {(recommendation.confidence * 100).toFixed(0)}%</span>
            {recommendation.generatedByFallback && <Badge tone="neutral">অফলাইন</Badge>}
          </div>
          <Field label="সমস্যা সারাংশ" value={recommendation.problemSummaryBn} />
          <Field label="সম্ভাব্য মূল কারণ" value={recommendation.rootCauseBn} />
          <Field label="প্রভাব" value={recommendation.impactBn} />
          <div>
            <p className="font-semibold text-muted">করণীয় সমাধান</p>
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
