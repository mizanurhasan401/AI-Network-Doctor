import { describe, expect, it } from 'vitest'
import { issueDescription, issueTitle, translate } from './index'

describe('i18n catalog', () => {
  it('translates a plain key per language', () => {
    expect(translate('en', 'nav.dashboard')).toBe('Dashboard')
    expect(translate('bn', 'nav.dashboard')).toBe('ড্যাশবোর্ড')
  })

  it('interpolates {param} placeholders', () => {
    expect(translate('en', 'results.detectedIssues', { count: 3 })).toBe('Detected issues (3)')
    expect(translate('bn', 'report.savedTo', { path: '/tmp/r.pdf' })).toContain('/tmp/r.pdf')
  })

  it('leaves unknown placeholders intact', () => {
    expect(translate('en', 'issue.packet-loss.title')).toBe('Packet loss {lossPercent}%')
  })

  it('localizes a detected issue from its id + params', () => {
    const issue = { id: 'packet-loss', params: { lossPercent: 12 } }
    expect(issueTitle('en', issue)).toBe('Packet loss 12%')
    expect(issueTitle('bn', issue)).toBe('প্যাকেট লস 12%')
    expect(issueDescription('en', issue)).toContain('packet loss')
  })

  it('falls back to the key for an unknown issue id', () => {
    expect(issueTitle('en', { id: 'made-up' })).toBe('issue.made-up.title')
  })
})
