import type { ReportModel } from './ReportModel'
import type { IReportGenerator } from './IReportGenerator'

/** Plain UTF-8 text report. Bangla renders natively in any Unicode editor. */
export class TxtReportGenerator implements IReportGenerator {
  readonly format = 'txt' as const
  readonly fileExtension = 'txt'

  async render(model: ReportModel): Promise<Uint8Array> {
    const lines: string[] = []
    lines.push(model.title)
    lines.push('='.repeat(60))
    lines.push(model.generatedAtLine)
    lines.push('')

    for (const section of model.sections) {
      lines.push(section.title)
      lines.push('-'.repeat(40))
      for (const line of section.lines) lines.push(line)
      lines.push('')
    }

    return new TextEncoder().encode(lines.join('\n'))
  }
}
