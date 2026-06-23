import { readFile } from 'node:fs/promises'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { childLogger } from '../../core/logger'
import { BANGLA_FONT_PATH } from '../../core/resources'
import type { ReportModel, ReportSection } from './ReportModel'
import type { IReportGenerator } from './IReportGenerator'

const log = childLogger('PdfReport')

const MARGIN = 50
const PAGE = { width: 595.28, height: 841.89 } // A4 in points
const TITLE_SIZE = 16
const HEADING_SIZE = 12
const BODY_SIZE = 10
const LINE_GAP = 6

/**
 * PDF report via pdf-lib. pdf-lib's StandardFonts are Latin-only, so Bangla
 * requires embedding a Unicode Bengali TTF (Noto Sans Bengali) registered through
 * fontkit. If the font asset is missing we fall back to Helvetica and log a
 * warning — Latin/numeric content still renders; Bangla would otherwise be tofu.
 * Drop the font at resources/fonts/NotoSansBengali-Regular.ttf to enable Bangla.
 */
export class PdfReportGenerator implements IReportGenerator {
  readonly format = 'pdf' as const
  readonly fileExtension = 'pdf'

  async render(model: ReportModel): Promise<Uint8Array> {
    const doc = await PDFDocument.create()
    doc.registerFontkit(fontkit)

    const font = await this.loadFont(doc)
    const layout = new PdfLayout(doc, font)

    layout.text(model.title, TITLE_SIZE)
    layout.text(model.generatedAtLine, BODY_SIZE)
    layout.gap()

    for (const section of model.sections) this.renderSection(layout, section)

    return doc.save()
  }

  private renderSection(layout: PdfLayout, section: ReportSection): void {
    layout.text(section.title, HEADING_SIZE)
    for (const line of section.lines) layout.text(line, BODY_SIZE)
    layout.gap()
  }

  private async loadFont(doc: PDFDocument): Promise<PDFFont> {
    try {
      const bytes = await readFile(BANGLA_FONT_PATH())
      return await doc.embedFont(bytes, { subset: true })
    } catch {
      log.warn('Bengali font not found at resources/fonts — PDF Bangla glyphs will not render')
      return doc.embedFont(StandardFonts.Helvetica)
    }
  }
}

/** Minimal flowing-text layout engine with automatic pagination + word wrap. */
class PdfLayout {
  private page: PDFPage
  private y: number

  constructor(
    private readonly doc: PDFDocument,
    private readonly font: PDFFont
  ) {
    this.page = doc.addPage([PAGE.width, PAGE.height])
    this.y = PAGE.height - MARGIN
  }

  gap(): void {
    this.y -= LINE_GAP * 2
  }

  text(value: string, size: number): void {
    const maxWidth = PAGE.width - MARGIN * 2
    for (const line of this.wrap(value, size, maxWidth)) {
      if (this.y < MARGIN + size) {
        this.page = this.doc.addPage([PAGE.width, PAGE.height])
        this.y = PAGE.height - MARGIN
      }
      this.page.drawText(line, { x: MARGIN, y: this.y, size, font: this.font, color: rgb(0.1, 0.1, 0.12) })
      this.y -= size + LINE_GAP
    }
  }

  private wrap(value: string, size: number, maxWidth: number): string[] {
    const words = value.split(/\s+/)
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (this.widthOf(candidate, size) > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = candidate
      }
    }
    if (current) lines.push(current)
    return lines.length ? lines : ['']
  }

  private widthOf(text: string, size: number): number {
    try {
      return this.font.widthOfTextAtSize(text, size)
    } catch {
      // Embedded subset may lack a glyph mid-measure; approximate to keep flowing.
      return text.length * size * 0.5
    }
  }
}
