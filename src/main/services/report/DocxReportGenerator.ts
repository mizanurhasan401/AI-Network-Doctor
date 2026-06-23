import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import type { ReportModel } from './ReportModel'
import type { IReportGenerator } from './IReportGenerator'

/**
 * DOCX report. Word resolves Bangla glyphs via the system/Office fonts, so no
 * font embedding is required here. Suitable for ISP submission and editing.
 */
export class DocxReportGenerator implements IReportGenerator {
  readonly format = 'docx' as const
  readonly fileExtension = 'docx'

  async render(model: ReportModel): Promise<Uint8Array> {
    const children: Paragraph[] = [
      new Paragraph({ text: model.titleBn, heading: HeadingLevel.TITLE }),
      new Paragraph({ children: [new TextRun({ text: `প্রস্তুতের সময়: ${model.generatedAtBn}`, italics: true })] }),
      new Paragraph({ text: '' })
    ]

    for (const section of model.sections) {
      children.push(new Paragraph({ text: section.titleBn, heading: HeadingLevel.HEADING_2 }))
      for (const line of section.lines) {
        children.push(new Paragraph({ children: [new TextRun(line)] }))
      }
      children.push(new Paragraph({ text: '' }))
    }

    const doc = new Document({ sections: [{ children }] })
    const buffer = await Packer.toBuffer(doc)
    return new Uint8Array(buffer)
  }
}
