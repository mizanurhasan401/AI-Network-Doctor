import type { ReportFormat, ReportRequest } from '@shared/types/report'
import { ValidationError } from '@shared/errors/errors'
import { DEFAULT_LANGUAGE, translate } from '@shared/i18n'
import { buildReportModel } from './ReportModel'
import { PdfReportGenerator } from './PdfReportGenerator'
import { DocxReportGenerator } from './DocxReportGenerator'
import { TxtReportGenerator } from './TxtReportGenerator'
import type { IReportGenerator } from './IReportGenerator'

/**
 * Report facade. Holds the format→generator registry and renders bytes. File
 * persistence (save dialog + write) is the IPC layer's concern, keeping this
 * service free of Electron dependencies and trivially unit-testable.
 */
export class ReportService {
  private readonly generators: ReadonlyMap<ReportFormat, IReportGenerator>

  constructor(generators?: readonly IReportGenerator[]) {
    const list = generators ?? [
      new PdfReportGenerator(),
      new DocxReportGenerator(),
      new TxtReportGenerator()
    ]
    this.generators = new Map(list.map((g) => [g.format, g]))
  }

  private resolve(format: ReportFormat): IReportGenerator {
    const generator = this.generators.get(format)
    if (!generator) {
      throw new ValidationError(translate(DEFAULT_LANGUAGE, 'report.unsupportedFormat', { format }))
    }
    return generator
  }

  async render(request: ReportRequest): Promise<Uint8Array> {
    const model = buildReportModel(request)
    return this.resolve(request.format).render(model)
  }

  extensionFor(format: ReportFormat): string {
    return this.resolve(format).fileExtension
  }

  suggestedFileName(request: ReportRequest): string {
    const stamp = request.snapshot.createdAt.replace(/[:.]/g, '-')
    return `netdoctor-report-${stamp}.${this.extensionFor(request.format)}`
  }
}
