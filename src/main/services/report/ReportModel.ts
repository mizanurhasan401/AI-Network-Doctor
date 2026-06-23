import type { DiagnosticSnapshot, ReportRequest } from '@shared/types/report'
import type { AiRecommendation } from '@shared/types/ai'

export interface ReportSection {
  readonly titleBn: string
  readonly lines: readonly string[]
}

export interface ReportModel {
  readonly titleBn: string
  readonly generatedAtBn: string
  readonly sections: readonly ReportSection[]
}

const fmt = (value: number | null, unit = ''): string => (value === null ? 'প্রযোজ্য নয়' : `${value}${unit}`)
const yesNo = (value: boolean): string => (value ? 'হ্যাঁ' : 'না')

/**
 * Builds the canonical 8-section Bangla report model from a snapshot (+ optional
 * AI recommendation). All three exporters render from this single model, so the
 * formats can never drift apart in content.
 */
export function buildReportModel(request: ReportRequest): ReportModel {
  const s = request.snapshot
  const rec = request.recommendation

  return {
    titleBn: 'NetDoctor AI — নেটওয়ার্ক ডায়াগনস্টিক রিপোর্ট',
    generatedAtBn: new Date(s.createdAt).toLocaleString('bn-BD'),
    sections: [
      summarySection(s),
      networkInfoSection(s),
      testResultsSection(s),
      issuesSection(s),
      aiAnalysisSection(rec),
      solutionsSection(rec),
      healthScoreSection(s),
      { titleBn: '৮. প্রস্তুতের সময়', lines: [new Date(s.createdAt).toLocaleString('bn-BD')] }
    ]
  }
}

function summarySection(s: DiagnosticSnapshot): ReportSection {
  return {
    titleBn: '১. রিপোর্ট সারাংশ',
    lines: [
      `সামগ্রিক স্বাস্থ্য স্কোর: ${s.health.overall}/100 (${s.health.grade})`,
      `ইন্টারনেট সংযোগ: ${yesNo(s.connectivity.internet.alive)}`,
      `শনাক্তকৃত সমস্যা: ${s.issues.length}টি`
    ]
  }
}

function networkInfoSection(s: DiagnosticSnapshot): ReportSection {
  return {
    titleBn: '২. নেটওয়ার্ক তথ্য',
    lines: [
      `হোস্টনেম: ${s.system.hostname}`,
      `লোকাল আইপি: ${s.system.localIp}`,
      `গেটওয়ে আইপি: ${s.system.gatewayIp ?? 'অজানা'}`,
      `পাবলিক আইপি: ${s.system.publicIp ?? 'অজানা'}`,
      `ম্যাক ঠিকানা: ${s.system.macAddress ?? 'অজানা'}`,
      `ডিএনএস সার্ভার: ${s.system.dnsServers.join(', ') || 'নেই'}`,
      `অপারেটিং সিস্টেম: ${s.system.os.distro} ${s.system.os.release} (${s.system.os.arch})`,
      `সিপিইউ: ${s.system.cpu.brand} (${s.system.cpu.cores} কোর)`,
      `র‍্যাম: ${(s.system.ram.totalBytes / 1_073_741_824).toFixed(1)} GB`
    ]
  }
}

function testResultsSection(s: DiagnosticSnapshot): ReportSection {
  return {
    titleBn: '৩. পরীক্ষার ফলাফল',
    lines: [
      `গেটওয়ে পিং: ${yesNo(s.connectivity.gateway.alive)}, গড় ${fmt(s.connectivity.gateway.avgMs, 'ms')}`,
      `ইন্টারনেট পিং: ${yesNo(s.connectivity.internet.alive)}, গড় ${fmt(s.connectivity.internet.avgMs, 'ms')}`,
      `HTTP: ${yesNo(s.connectivity.http.ok)}, HTTPS: ${yesNo(s.connectivity.https.ok)}`,
      `প্যাকেট লস: ${fmt(s.packetLoss.lossPercent, '%')}, জিটার ${fmt(s.packetLoss.jitterMs, 'ms')}`,
      `ডিএনএস গড় রেজোলিউশন: ${fmt(s.dns.avgResolveMs, 'ms')}`,
      `ডাউনলোড গতি: ${fmt(s.speedTest.downloadMbps, ' Mbps')}`,
      `আপলোড গতি: ${fmt(s.speedTest.uploadMbps, ' Mbps')}`,
      `ট্রেসরুট হপ সংখ্যা: ${s.traceroute.hops.length}`
    ]
  }
}

function issuesSection(s: DiagnosticSnapshot): ReportSection {
  if (s.issues.length === 0) {
    return { titleBn: '৪. সনাক্তকৃত সমস্যা', lines: ['কোনো সমস্যা শনাক্ত হয়নি।'] }
  }
  return {
    titleBn: '৪. সনাক্তকৃত সমস্যা',
    lines: s.issues.map((i) => `• [${i.severity}] ${i.titleBn} — ${i.descriptionBn}`)
  }
}

function aiAnalysisSection(rec: AiRecommendation | undefined): ReportSection {
  if (!rec) return { titleBn: '৫. AI বিশ্লেষণ', lines: ['AI বিশ্লেষণ পাওয়া যায়নি।'] }
  return {
    titleBn: '৫. AI বিশ্লেষণ',
    lines: [
      `সমস্যা সারাংশ: ${rec.problemSummaryBn}`,
      `সম্ভাব্য মূল কারণ: ${rec.rootCauseBn}`,
      `প্রভাব: ${rec.impactBn}`,
      `অগ্রাধিকার স্তর: ${rec.priority}`,
      `কনফিডেন্স স্কোর: ${(rec.confidence * 100).toFixed(0)}%`
    ]
  }
}

function solutionsSection(rec: AiRecommendation | undefined): ReportSection {
  if (!rec || rec.solutionsBn.length === 0) {
    return { titleBn: '৬. করণীয় সমাধান', lines: ['কোনো নির্দিষ্ট সমাধান নেই।'] }
  }
  return {
    titleBn: '৬. করণীয় সমাধান',
    lines: rec.solutionsBn.map((sol, idx) => `${idx + 1}. ${sol}`)
  }
}

function healthScoreSection(s: DiagnosticSnapshot): ReportSection {
  return {
    titleBn: '৭. নেটওয়ার্ক স্বাস্থ্য স্কোর',
    lines: [
      `সামগ্রিক: ${s.health.overall}/100 (${s.health.grade})`,
      ...s.health.components.map(
        (c) => `${c.labelBn}: ${c.measured ? `${c.score}/100` : 'পরিমাপ করা হয়নি'}`
      )
    ]
  }
}
