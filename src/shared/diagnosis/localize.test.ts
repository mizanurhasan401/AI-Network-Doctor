import { describe, expect, it } from 'vitest'
import { localizeProblem } from './localize'

describe('localizeProblem', () => {
  it('blames the local side when the gateway itself is lossy', () => {
    const r = localizeProblem({
      gatewayReachable: true,
      gatewayLossPercent: 15,
      internetLossPercent: 15,
      linkType: 'wireless'
    })
    expect(r.location).toBe('local')
    expect(r.likelyWifi).toBe(true)
  })

  it('blames the ISP when the gateway is clean but the internet loses packets', () => {
    const r = localizeProblem({
      gatewayReachable: true,
      gatewayLossPercent: 0,
      internetLossPercent: 15,
      linkType: 'wired'
    })
    expect(r.location).toBe('isp')
    expect(r.likelyWifi).toBe(false)
  })

  it('reports ok when both segments are clean', () => {
    const r = localizeProblem({
      gatewayReachable: true,
      gatewayLossPercent: 0,
      internetLossPercent: 0,
      linkType: 'wireless'
    })
    expect(r.location).toBe('ok')
  })

  it('treats an unreachable gateway as a local fault', () => {
    const r = localizeProblem({
      gatewayReachable: false,
      gatewayLossPercent: null,
      internetLossPercent: 100,
      linkType: 'wired'
    })
    expect(r.location).toBe('local')
  })
})
