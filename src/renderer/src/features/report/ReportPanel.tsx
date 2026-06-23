import type { DiagnosticSnapshot, ReportFormat } from '@shared/types/report'
import { Download, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useExportReport } from '../diagnostics/useDiagnostics'

const FORMATS: readonly { format: ReportFormat; label: string }[] = [
  { format: 'pdf', label: 'PDF' },
  { format: 'docx', label: 'DOCX' },
  { format: 'txt', label: 'TXT' }
]

export function ReportPanel({ snapshot }: { snapshot: DiagnosticSnapshot }): JSX.Element {
  const exportReport = useExportReport()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={18} /> রিপোর্ট রপ্তানি
        </CardTitle>
      </CardHeader>
      <p className="mb-4 text-sm text-muted">
        সম্পূর্ণ বাংলা রিপোর্ট তৈরি করুন — গ্রাহক বা আইএসপির কাছে জমা দেওয়ার উপযোগী।
      </p>
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
        <p className="mt-3 text-sm text-success">সংরক্ষিত হয়েছে: {exportReport.data.filePath}</p>
      )}
      {exportReport.isError && <p className="mt-3 text-sm text-danger">রপ্তানি বাতিল বা ব্যর্থ হয়েছে।</p>}
    </Card>
  )
}
