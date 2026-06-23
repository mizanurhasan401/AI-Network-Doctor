import type { DiagnosticSnapshot } from '@shared/types/report'

/**
 * Prompt templates are configurable: a caller may override `systemPrompt` or the
 * grounding builder without changing provider code. The default enforces Bangla
 * output and a strict JSON schema so responses are machine-parseable.
 */
export interface AiPromptConfig {
  readonly systemPrompt: string
  buildUserPrompt(snapshot: DiagnosticSnapshot): string
}

export const DEFAULT_SYSTEM_PROMPT = [
  'আপনি একজন অভিজ্ঞ নেটওয়ার্ক ডায়াগনস্টিক বিশেষজ্ঞ।',
  'আপনাকে নেটওয়ার্ক পরীক্ষার ফলাফল দেওয়া হবে।',
  'আপনার সম্পূর্ণ উত্তর অবশ্যই বাংলায় হতে হবে।',
  'শুধুমাত্র নিচের কী সহ একটি বৈধ JSON অবজেক্ট প্রদান করুন, অন্য কোনো লেখা নয়:',
  '{',
  '  "problemSummaryBn": string,',
  '  "rootCauseBn": string,',
  '  "impactBn": string,',
  '  "solutionsBn": string[],',
  '  "priority": "low" | "medium" | "high" | "critical",',
  '  "confidence": number (0 থেকে 1)',
  '}',
  'প্রদত্ত পরিমাপের বাইরে কিছু অনুমান করবেন না।'
].join('\n')

export function buildGroundingFacts(s: DiagnosticSnapshot): string {
  const lines: string[] = []
  lines.push(`স্বাস্থ্য স্কোর: ${s.health.overall}/100 (${s.health.grade})`)
  lines.push(`ইন্টারনেট পিং: alive=${s.connectivity.internet.alive}, গড়=${s.connectivity.internet.avgMs}ms, লস=${s.connectivity.internet.packetLossPercent}%`)
  lines.push(`গেটওয়ে: alive=${s.connectivity.gateway.alive}`)
  lines.push(`HTTP=${s.connectivity.http.ok}, HTTPS=${s.connectivity.https.ok}`)
  lines.push(`প্যাকেট লস: ${s.packetLoss.lossPercent}%, জিটার=${s.packetLoss.jitterMs}ms`)
  lines.push(`ডিএনএস গড় রেজোলিউশন: ${s.dns.avgResolveMs}ms, সার্ভার সংখ্যা=${s.dns.servers.length}`)
  lines.push(
    `গতি: available=${s.speedTest.available}, download=${s.speedTest.downloadMbps}Mbps, upload=${s.speedTest.uploadMbps}Mbps`
  )
  if (s.issues.length) {
    lines.push('শনাক্তকৃত সমস্যা:')
    for (const issue of s.issues) lines.push(`- [${issue.severity}] ${issue.titleBn}: ${issue.descriptionBn}`)
  } else {
    lines.push('কোনো সমস্যা স্বয়ংক্রিয়ভাবে শনাক্ত হয়নি।')
  }
  return lines.join('\n')
}

export const defaultPromptConfig: AiPromptConfig = {
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  buildUserPrompt: (snapshot) =>
    `নিম্নলিখিত নেটওয়ার্ক পরীক্ষার ফলাফল বিশ্লেষণ করুন:\n\n${buildGroundingFacts(snapshot)}`
}
