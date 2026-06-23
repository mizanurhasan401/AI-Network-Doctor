/** Small numeric helpers shared by the diagnostic services. */

export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}

export function min(values: readonly number[]): number | null {
  return values.length ? round(Math.min(...values)) : null
}

export function max(values: readonly number[]): number | null {
  return values.length ? round(Math.max(...values)) : null
}

export function avg(values: readonly number[]): number | null {
  if (!values.length) return null
  return round(values.reduce((a, b) => a + b, 0) / values.length)
}

/**
 * Jitter = mean absolute difference between consecutive samples (RFC 3550-style
 * instantaneous variation). Returns null when fewer than two samples exist.
 */
export function jitter(values: readonly number[]): number | null {
  if (values.length < 2) return null
  let total = 0
  for (let i = 1; i < values.length; i++) {
    total += Math.abs(values[i] - values[i - 1])
  }
  return round(total / (values.length - 1))
}

/** Clamp a number into [lo, hi]. */
export function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value))
}
