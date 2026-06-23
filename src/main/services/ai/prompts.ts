import type { DiagnosticSnapshot } from '@shared/types/report'
import { issueDescription, issueTitle, translate, type Language } from '@shared/i18n'

/**
 * Prompt builders, localized to the requested output language. The system prompt
 * instructs the model to answer in that language and to emit a strict JSON schema
 * so responses stay machine-parseable.
 */
export function buildSystemPrompt(language: Language): string {
  return translate(language, 'aiprompt.system')
}

export function buildGroundingFacts(language: Language, s: DiagnosticSnapshot): string {
  const tt = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>): string =>
    translate(language, key, params)
  const lines: string[] = [
    tt('aiprompt.fact.health', { score: s.health.overall, grade: s.health.grade }),
    tt('aiprompt.fact.internet', {
      alive: String(s.connectivity.internet.alive),
      avg: String(s.connectivity.internet.avgMs),
      loss: s.connectivity.internet.packetLossPercent
    }),
    tt('aiprompt.fact.gateway', { alive: String(s.connectivity.gateway.alive) }),
    tt('aiprompt.fact.httpHttps', {
      http: String(s.connectivity.http.ok),
      https: String(s.connectivity.https.ok)
    }),
    tt('aiprompt.fact.packetLoss', {
      loss: s.packetLoss.lossPercent,
      jitter: String(s.packetLoss.jitterMs)
    }),
    tt('aiprompt.fact.dns', { value: String(s.dns.avgResolveMs), count: s.dns.servers.length }),
    tt('aiprompt.fact.speed', {
      available: String(s.speedTest.available),
      download: String(s.speedTest.downloadMbps),
      upload: String(s.speedTest.uploadMbps)
    })
  ]
  if (s.issues.length) {
    lines.push(tt('aiprompt.fact.issuesHeader'))
    for (const issue of s.issues) {
      lines.push(`- [${issue.severity}] ${issueTitle(language, issue)}: ${issueDescription(language, issue)}`)
    }
  } else {
    lines.push(tt('aiprompt.fact.noIssues'))
  }
  return lines.join('\n')
}

export function buildUserPrompt(language: Language, snapshot: DiagnosticSnapshot): string {
  return `${translate(language, 'aiprompt.user')}\n\n${buildGroundingFacts(language, snapshot)}`
}
