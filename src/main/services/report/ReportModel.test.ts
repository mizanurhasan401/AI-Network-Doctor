import { describe, expect, it } from 'vitest'
import { makeSnapshot } from '../../../test/fixtures'
import { buildReportModel } from './ReportModel'

describe('buildReportModel', () => {
  it('produces the eight required Bangla sections in order', () => {
    const model = buildReportModel({ snapshot: makeSnapshot(), format: 'txt', language: 'bn' })
    expect(model.sections).toHaveLength(8)
    expect(model.sections.map((s) => s.title)).toEqual([
      '১. রিপোর্ট সারাংশ',
      '২. নেটওয়ার্ক তথ্য',
      '৩. পরীক্ষার ফলাফল',
      '৪. সনাক্তকৃত সমস্যা',
      '৫. AI বিশ্লেষণ',
      '৬. করণীয় সমাধান',
      '৭. নেটওয়ার্ক স্বাস্থ্য স্কোর',
      '৮. প্রস্তুতের সময়'
    ])
  })

  it('produces English sections when language is English (default)', () => {
    const model = buildReportModel({ snapshot: makeSnapshot(), format: 'txt' })
    expect(model.sections.map((s) => s.title)).toEqual([
      '1. Report Summary',
      '2. Network Information',
      '3. Test Results',
      '4. Detected Issues',
      '5. AI Analysis',
      '6. Recommended Actions',
      '7. Network Health Score',
      '8. Generated At'
    ])
  })

  it('includes AI recommendation content when provided', () => {
    const model = buildReportModel({
      snapshot: makeSnapshot(),
      format: 'txt',
      recommendation: {
        problemSummaryBn: 'সারাংশ',
        rootCauseBn: 'কারণ',
        impactBn: 'প্রভাব',
        solutionsBn: ['সমাধান-১'],
        priority: 'high',
        confidence: 0.8,
        generatedByFallback: false
      }
    })
    const aiSection = model.sections[4]
    expect(aiSection.lines.join(' ')).toContain('সারাংশ')
    expect(model.sections[5].lines[0]).toContain('সমাধান-১')
  })
})
