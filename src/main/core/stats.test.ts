import { describe, expect, it } from 'vitest'
import { avg, clamp, jitter, max, min, round } from './stats'

describe('stats', () => {
  it('rounds to given decimals', () => {
    expect(round(1.23456, 2)).toBe(1.23)
    expect(round(1.236, 2)).toBe(1.24)
    expect(round(12.5, 0)).toBe(13)
  })

  it('handles empty arrays as null', () => {
    expect(min([])).toBeNull()
    expect(max([])).toBeNull()
    expect(avg([])).toBeNull()
    expect(jitter([])).toBeNull()
  })

  it('computes min/max/avg', () => {
    expect(min([5, 1, 3])).toBe(1)
    expect(max([5, 1, 3])).toBe(5)
    expect(avg([2, 4, 6])).toBe(4)
  })

  it('computes jitter as mean consecutive delta', () => {
    expect(jitter([10, 12, 11])).toBe(1.5)
    expect(jitter([10])).toBeNull()
  })

  it('clamps into range', () => {
    expect(clamp(-5, 0, 100)).toBe(0)
    expect(clamp(150, 0, 100)).toBe(100)
    expect(clamp(50, 0, 100)).toBe(50)
  })
})
