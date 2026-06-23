import type { DiagnosticSnapshot, ReportRequest } from '@shared/types/report'
import type { AiRecommendation } from '@shared/types/ai'
import {
  DEFAULT_LANGUAGE,
  dateLocale,
  issueDescription,
  issueTitle,
  translate,
  type Language,
  type MessageKey,
  type TranslateParams
} from '@shared/i18n'

export interface ReportSection {
  readonly title: string
  readonly lines: readonly string[]
}

export interface ReportModel {
  readonly title: string
  readonly generatedAtLine: string
  readonly sections: readonly ReportSection[]
}

/**
 * Builds the canonical 8-section report model from a snapshot (+ optional AI
 * recommendation), localized to `request.language` (default English). All three
 * exporters render from this single model, so formats can never drift apart.
 */
export function buildReportModel(request: ReportRequest): ReportModel {
  const s = request.snapshot
  const rec = request.recommendation
  const lang: Language = request.language ?? DEFAULT_LANGUAGE
  const tt = (key: MessageKey, params?: TranslateParams): string => translate(lang, key, params)

  const na = tt('report.na')
  const unknown = tt('report.unknown')
  const fmt = (value: number | null, unit = ''): string => (value === null ? na : `${value}${unit}`)
  const yesNo = (value: boolean): string => (value ? tt('common.yes') : tt('common.no'))
  const dateStr = new Date(s.createdAt).toLocaleString(dateLocale(lang))

  return {
    title: tt('report.doc.title'),
    generatedAtLine: tt('report.generatedBy', { label: dateStr }),
    sections: [
      summarySection(s, tt, yesNo),
      networkInfoSection(s, tt, unknown),
      testResultsSection(s, tt, fmt, yesNo),
      issuesSection(s, lang, tt),
      aiAnalysisSection(rec, tt),
      solutionsSection(rec, tt),
      healthScoreSection(s, tt),
      { title: tt('report.section.generatedAt'), lines: [dateStr] }
    ]
  }
}

type TT = (key: MessageKey, params?: TranslateParams) => string

function summarySection(s: DiagnosticSnapshot, tt: TT, yesNo: (v: boolean) => string): ReportSection {
  return {
    title: tt('report.section.summary'),
    lines: [
      tt('report.field.overallHealth', { score: s.health.overall, grade: tt(`grade.${s.health.grade}`) }),
      tt('report.field.internetConnection', { value: yesNo(s.connectivity.internet.alive) }),
      tt('report.field.issueCount', { count: s.issues.length })
    ]
  }
}

function networkInfoSection(s: DiagnosticSnapshot, tt: TT, unknown: string): ReportSection {
  return {
    title: tt('report.section.network'),
    lines: [
      tt('report.field.hostname', { value: s.system.hostname }),
      tt('report.field.localIp', { value: s.system.localIp }),
      tt('report.field.gatewayIp', { value: s.system.gatewayIp ?? unknown }),
      tt('report.field.publicIp', { value: s.system.publicIp ?? unknown }),
      tt('report.field.macAddress', { value: s.system.macAddress ?? unknown }),
      tt('report.field.dnsServers', { value: s.system.dnsServers.join(', ') || tt('report.none') }),
      tt('report.field.os', {
        distro: s.system.os.distro,
        release: s.system.os.release,
        arch: s.system.os.arch
      }),
      tt('report.field.cpu', { brand: s.system.cpu.brand, cores: s.system.cpu.cores }),
      tt('report.field.ram', { gb: (s.system.ram.totalBytes / 1_073_741_824).toFixed(1) })
    ]
  }
}

function testResultsSection(
  s: DiagnosticSnapshot,
  tt: TT,
  fmt: (v: number | null, unit?: string) => string,
  yesNo: (v: boolean) => string
): ReportSection {
  return {
    title: tt('report.section.testResults'),
    lines: [
      tt('report.field.gatewayPingLine', {
        alive: yesNo(s.connectivity.gateway.alive),
        avg: fmt(s.connectivity.gateway.avgMs, 'ms')
      }),
      tt('report.field.internetPingLine', {
        alive: yesNo(s.connectivity.internet.alive),
        avg: fmt(s.connectivity.internet.avgMs, 'ms')
      }),
      tt('report.field.httpHttpsLine', {
        http: yesNo(s.connectivity.http.ok),
        https: yesNo(s.connectivity.https.ok)
      }),
      tt('report.field.packetLossLine', {
        loss: fmt(s.packetLoss.lossPercent, '%'),
        jitter: fmt(s.packetLoss.jitterMs, 'ms')
      }),
      tt('report.field.dnsResolveLine', { value: fmt(s.dns.avgResolveMs, 'ms') }),
      tt('report.field.downloadLine', { value: fmt(s.speedTest.downloadMbps, ' Mbps') }),
      tt('report.field.uploadLine', { value: fmt(s.speedTest.uploadMbps, ' Mbps') }),
      tt('report.field.tracerouteHops', { count: s.traceroute.hops.length })
    ]
  }
}

function issuesSection(s: DiagnosticSnapshot, lang: Language, tt: TT): ReportSection {
  if (s.issues.length === 0) {
    return { title: tt('report.section.issues'), lines: [tt('report.empty.issues')] }
  }
  return {
    title: tt('report.section.issues'),
    lines: s.issues.map(
      (i) => `• [${tt(`severity.${i.severity}`)}] ${issueTitle(lang, i)} — ${issueDescription(lang, i)}`
    )
  }
}

function aiAnalysisSection(rec: AiRecommendation | undefined, tt: TT): ReportSection {
  if (!rec) return { title: tt('report.section.ai'), lines: [tt('report.empty.ai')] }
  return {
    title: tt('report.section.ai'),
    lines: [
      tt('report.field.problemSummary', { value: rec.problemSummaryBn }),
      tt('report.field.rootCause', { value: rec.rootCauseBn }),
      tt('report.field.impact', { value: rec.impactBn }),
      tt('report.field.priorityLevel', { value: tt(`priority.${rec.priority}`) }),
      tt('report.field.confidenceScore', { value: (rec.confidence * 100).toFixed(0) })
    ]
  }
}

function solutionsSection(rec: AiRecommendation | undefined, tt: TT): ReportSection {
  if (!rec || rec.solutionsBn.length === 0) {
    return { title: tt('report.section.solutions'), lines: [tt('report.empty.solutions')] }
  }
  return {
    title: tt('report.section.solutions'),
    lines: rec.solutionsBn.map((sol, idx) => `${idx + 1}. ${sol}`)
  }
}

function healthScoreSection(s: DiagnosticSnapshot, tt: TT): ReportSection {
  return {
    title: tt('report.section.healthScore'),
    lines: [
      tt('report.field.overall', { score: s.health.overall, grade: tt(`grade.${s.health.grade}`) }),
      ...s.health.components.map((c) =>
        tt('report.field.componentScore', {
          label: tt(`health.${c.key}`),
          value: c.measured ? `${c.score}/100` : tt('report.notMeasured')
        })
      )
    ]
  }
}
