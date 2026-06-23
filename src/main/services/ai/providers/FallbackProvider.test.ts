import { describe, expect, it } from 'vitest'
import { makeSnapshot } from '../../../../test/fixtures'
import { FallbackProvider } from './FallbackProvider'

describe('FallbackProvider', () => {
  const provider = new FallbackProvider()

  it('returns a low-priority Bangla recommendation for a healthy network', async () => {
    const rec = await provider.analyze({ snapshot: makeSnapshot() })
    expect(rec.priority).toBe('low')
    expect(rec.generatedByFallback).toBe(true)
    expect(rec.solutionsBn.length).toBeGreaterThan(0)
    expect(rec.problemSummaryBn).toMatch(/[ঀ-৿]/) // contains Bangla glyphs
  })

  it('escalates to critical when a critical issue exists', async () => {
    const snapshot = makeSnapshot({
      connectivity: {
        ...makeSnapshot().connectivity,
        internet: { host: '8.8.8.8', alive: false, sent: 5, received: 0, packetLossPercent: 100, minMs: null, avgMs: null, maxMs: null, jitterMs: null }
      },
      issues: [{ id: 'no-internet', area: 'connectivity', severity: 'critical', titleBn: 'x', descriptionBn: 'y' }]
    })
    const rec = await provider.analyze({ snapshot })
    expect(rec.priority).toBe('critical')
    expect(rec.rootCauseBn).toContain('আপলিঙ্ক')
  })
})
