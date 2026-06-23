import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { DiagnosticSnapshot, ReportFormat } from '@shared/types/report'
import type { AiRecommendation } from '@shared/types/ai'
import { api, unwrap } from '../../api/client'
import { useDiagnosticStore } from '../../store/diagnosticStore'

/** Subscribes the store to live progress events for the duration of a mount. */
export function useProgressSubscription(): void {
  const setProgress = useDiagnosticStore((s) => s.setProgress)
  useEffect(() => api().onProgress(setProgress), [setProgress])
}

/** Runs the full diagnostic pipeline and stores the resulting snapshot. */
export function useRunDiagnostic() {
  const setSnapshot = useDiagnosticStore((s) => s.setSnapshot)
  const setProgress = useDiagnosticStore((s) => s.setProgress)

  return useMutation<DiagnosticSnapshot>({
    mutationFn: () => unwrap(api().runFullDiagnostic({})),
    onSuccess: (snapshot) => {
      setSnapshot(snapshot)
      setProgress(null)
    }
  })
}

/** Requests an AI (or fallback) recommendation for the current snapshot. */
export function useAnalyze() {
  const setRecommendation = useDiagnosticStore((s) => s.setRecommendation)

  return useMutation<AiRecommendation, Error, DiagnosticSnapshot>({
    mutationFn: (snapshot) => {
      const config = useDiagnosticStore.getState().aiConfig
      return unwrap(api().analyzeWithAi({ snapshot, config }))
    },
    onSuccess: setRecommendation
  })
}

/** Renders + saves the report in the requested format via the OS save dialog. */
export function useExportReport() {
  return useMutation({
    mutationFn: ({ snapshot, format }: { snapshot: DiagnosticSnapshot; format: ReportFormat }) => {
      const recommendation = useDiagnosticStore.getState().recommendation ?? undefined
      return unwrap(
        api().exportReport({
          snapshot,
          format,
          ...(recommendation ? { recommendation } : {})
        })
      )
    }
  })
}
