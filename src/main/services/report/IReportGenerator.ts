import type { ReportFormat } from '@shared/types/report'
import type { ReportModel } from './ReportModel'

/** Strategy for rendering a ReportModel to a specific binary format. */
export interface IReportGenerator {
  readonly format: ReportFormat
  readonly fileExtension: string
  render(model: ReportModel): Promise<Uint8Array>
}
