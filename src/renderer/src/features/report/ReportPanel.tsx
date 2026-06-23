import type { DiagnosticSnapshot, ReportFormat } from '@shared/types/report'
import { Download, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useT } from '../../i18n/useT'
import { useExportReport } from '../diagnostics/useDiagnostics'

const FORMATS: readonly { format: ReportFormat; label: string }[] = [
  { format: 'pdf', label: 'PDF' },
  { format: 'docx', label: 'DOCX' },
  { format: 'txt', label: 'TXT' }
]

export function ReportPanel({ snapshot }: { snapshot: DiagnosticSnapshot }): JSX.Element {
  const exportReport = useExportReport()
  const t = useT()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={18} /> {t('report.title')}
        </CardTitle>
      </CardHeader>
      <p className="mb-4 text-sm text-muted">{t('report.description')}</p>
      <div className="flex gap-2">
        {FORMATS.map(({ format, label }) => (
          <Button
            key={format}
            variant="secondary"
            onClick={() => exportReport.mutate({ snapshot, format })}
            disabled={exportReport.isPending}
          >
            <Download size={16} /> {label}
          </Button>
        ))}
      </div>
      {exportReport.isSuccess && (
        <p className="mt-3 text-sm text-success">
          {t('report.savedTo', { path: exportReport.data.filePath })}
        </p>
      )}
      {exportReport.isError && (
        <p className="mt-3 text-sm text-danger">{t('report.exportFailed')}</p>
      )}
    </Card>
  )
}
