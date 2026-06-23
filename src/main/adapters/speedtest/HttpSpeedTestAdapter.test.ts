import { afterEach, describe, expect, it, vi } from 'vitest'

// The logger pulls in electron's `app` at load — stub it for node-environment tests.
vi.mock('../../core/logger', () => ({
  childLogger: () => ({ debug() {}, info() {}, warn() {}, error() {} })
}))

// Shrink the measurement windows so the throughput phases finish in milliseconds.
vi.mock('@shared/constants', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/constants')>()
  return {
    ...actual,
    SPEED_TEST_DOWNLOAD_DURATION_MS: 40,
    SPEED_TEST_UPLOAD_DURATION_MS: 40,
    SPEED_TEST_LATENCY_SAMPLES: 2,
    SPEED_TEST_PARALLEL_STREAMS: 1
  }
})

import { HttpSpeedTestAdapter } from './HttpSpeedTestAdapter'

/** A response whose body streams a single 1 MB chunk then ends. */
function downloadResponse(): Response {
  return {
    body: {
      getReader() {
        let sent = false
        return {
          async read() {
            if (sent) return { done: true, value: undefined }
            sent = true
            return { done: false, value: new Uint8Array(1_000_000) }
          },
          async cancel() {}
        }
      }
    }
  } as unknown as Response
}

describe('HttpSpeedTestAdapter', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('is always available (no install required)', async () => {
    await expect(new HttpSpeedTestAdapter().isAvailable()).resolves.toBe(true)
  })

  it('measures throughput and maps ISP/server from Cloudflare meta', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, opts?: RequestInit) => {
        const u = String(url)
        if (u.includes('ip-api.com')) {
          return { json: async () => ({ status: 'success', isp: 'Test ISP', city: 'Dhaka' }) } as unknown as Response
        }
        if (u.includes('/cdn-cgi/trace')) {
          return { text: async () => 'colo=DAC\nloc=BD\n' } as unknown as Response
        }
        if (opts?.method === 'POST') return {} as Response // upload sink
        if (u.includes('bytes=0')) return {} as Response // latency probe
        if (u.includes('__down')) return downloadResponse()
        return {} as Response
      })
    )

    const progress: number[] = []
    const result = await new HttpSpeedTestAdapter().run((p) => progress.push(p.percent))

    expect(result.available).toBe(true)
    expect(result.isp).toBe('Test ISP')
    expect(result.serverName).toBe('Cloudflare DAC')
    expect(result.downloadMbps).toBeGreaterThan(0)
    expect(result.uploadMbps).toBeGreaterThan(0)
    expect(result.pingMs).not.toBeNull()
    // progress should be monotonic-ish and stay within 0–100
    expect(progress.length).toBeGreaterThan(0)
    expect(Math.max(...progress)).toBeLessThanOrEqual(100)
  })

  it('degrades gracefully when the network is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))

    const result = await new HttpSpeedTestAdapter().run()

    expect(result.available).toBe(false)
    expect(result.downloadMbps).toBeNull()
    expect(result.uploadMbps).toBeNull()
    expect(result.error).toBeTruthy()
  })
})
