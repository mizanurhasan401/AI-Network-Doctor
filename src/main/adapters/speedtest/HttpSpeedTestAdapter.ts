import {
  CLOUDFLARE_SPEEDTEST_DOWN_URL,
  CLOUDFLARE_SPEEDTEST_UP_URL,
  CLOUDFLARE_TRACE_URL,
  IP_GEO_LOOKUP_URL,
  SPEED_TEST_DOWNLOAD_DURATION_MS,
  SPEED_TEST_LATENCY_SAMPLES,
  SPEED_TEST_PARALLEL_STREAMS,
  SPEED_TEST_TIMEOUT_MS,
  SPEED_TEST_UPLOAD_DURATION_MS
} from '@shared/constants'
import type { SpeedTestResult } from '@shared/types/diagnostics'
import { childLogger } from '../../core/logger'
import { clamp, jitter, round } from '../../core/stats'
import type { ISpeedTestAdapter, SpeedProgressEmitter } from './ISpeedTestAdapter'

const log = childLogger('SpeedTest:http')

/** One download request pulls up to this many bytes; we cancel it at the deadline. */
const DOWNLOAD_CHUNK_BYTES = 25_000_000
/** Each upload POST sends this fixed payload; we count completed posts. */
const UPLOAD_CHUNK_BYTES = 2_000_000
/** How often to emit a live throughput sample to the UI. */
const PROGRESS_INTERVAL_MS = 300

/** Phase bands within the overall speed test (0–100). */
const BAND = {
  latencyEnd: 10,
  downloadStart: 10,
  downloadEnd: 55,
  uploadStart: 55,
  uploadEnd: 100
} as const

interface GeoInfo {
  readonly status?: string
  readonly isp?: string
  readonly org?: string
  readonly city?: string
  readonly country?: string
}

const UNAVAILABLE = (error: string): SpeedTestResult => ({
  available: false,
  downloadMbps: null,
  uploadMbps: null,
  pingMs: null,
  jitterMs: null,
  isp: null,
  serverName: null,
  error
})

const mbps = (bytes: number, elapsedMs: number): number =>
  elapsedMs > 0 ? round((bytes * 8) / 1_000_000 / (elapsedMs / 1000)) : 0

/**
 * Install-free speed test against Cloudflare's public speed endpoints (the same
 * backend its browser speed test uses). Runs in the main process so the renderer
 * CSP never applies. Uses parallel streams to saturate fast links — a single TCP
 * stream badly underestimates high-bandwidth connections.
 */
export class HttpSpeedTestAdapter implements ISpeedTestAdapter {
  readonly name = 'cloudflare'

  async isAvailable(): Promise<boolean> {
    return true
  }

  async run(onProgress?: SpeedProgressEmitter): Promise<SpeedTestResult> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), SPEED_TEST_TIMEOUT_MS)
    const { signal } = controller

    try {
      const meta = await this.fetchMeta(signal)
      const { pingMs, jitterMs } = await this.measureLatency(signal, onProgress)
      const downloadMbps = await this.measureDownload(signal, onProgress)
      const uploadMbps = await this.measureUpload(signal, onProgress)

      if (downloadMbps === null && uploadMbps === null) {
        return UNAVAILABLE('গতি পরীক্ষা সম্পন্ন করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।')
      }

      return {
        available: true,
        downloadMbps,
        uploadMbps,
        pingMs,
        jitterMs,
        isp: meta.isp,
        serverName: meta.serverName,
        error: null
      }
    } catch (err) {
      log.warn({ err }, 'cloudflare speed test failed')
      return UNAVAILABLE('গতি পরীক্ষা সম্পন্ন করা যায়নি।')
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * ISP label + nearest Cloudflare data centre, both best-effort (never throw):
   * ISP/city from a free geo-IP lookup, the serving colo from Cloudflare's trace.
   */
  private async fetchMeta(signal: AbortSignal): Promise<{ isp: string | null; serverName: string | null }> {
    const [geo, colo] = await Promise.all([this.fetchGeo(signal), this.fetchColo(signal)])
    return {
      isp: geo.isp ?? geo.org ?? null,
      serverName: colo ? `Cloudflare ${colo}` : (geo.city ?? null)
    }
  }

  private async fetchGeo(signal: AbortSignal): Promise<GeoInfo> {
    try {
      const res = await fetch(IP_GEO_LOOKUP_URL, { signal })
      const data = (await res.json()) as GeoInfo
      return data.status === 'success' ? data : {}
    } catch (err) {
      log.debug({ err }, 'geo-IP lookup failed')
      return {}
    }
  }

  /** Reads the serving Cloudflare colo code (e.g. "DAC") from the trace endpoint. */
  private async fetchColo(signal: AbortSignal): Promise<string | null> {
    try {
      const res = await fetch(CLOUDFLARE_TRACE_URL, { signal })
      const match = (await res.text()).match(/^colo=(.+)$/m)
      return match ? match[1].trim() : null
    } catch (err) {
      log.debug({ err }, 'cloudflare trace lookup failed')
      return null
    }
  }

  /** Latency + jitter from tiny zero-byte round-trips. */
  private async measureLatency(
    signal: AbortSignal,
    onProgress?: SpeedProgressEmitter
  ): Promise<{ pingMs: number | null; jitterMs: number | null }> {
    const rtts: number[] = []
    for (let i = 0; i < SPEED_TEST_LATENCY_SAMPLES; i++) {
      if (signal.aborted) break
      const t0 = performance.now()
      try {
        await fetch(`${CLOUDFLARE_SPEEDTEST_DOWN_URL}?bytes=0`, { signal })
        rtts.push(performance.now() - t0)
      } catch {
        /* a dropped sample just lowers the sample count */
      }
      onProgress?.({
        phase: 'latency',
        percent: round(((i + 1) / SPEED_TEST_LATENCY_SAMPLES) * BAND.latencyEnd),
        currentMbps: null
      })
    }
    if (rtts.length === 0) return { pingMs: null, jitterMs: null }
    const sorted = [...rtts].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    return { pingMs: round(median), jitterMs: jitter(rtts) }
  }

  /** Download throughput over a fixed window with N parallel streams. */
  private async measureDownload(
    signal: AbortSignal,
    onProgress?: SpeedProgressEmitter
  ): Promise<number | null> {
    const start = performance.now()
    const deadline = start + SPEED_TEST_DOWNLOAD_DURATION_MS
    let totalBytes = 0
    let lastEmit = start

    const worker = async (): Promise<void> => {
      try {
        while (performance.now() < deadline && !signal.aborted) {
          const res = await fetch(`${CLOUDFLARE_SPEEDTEST_DOWN_URL}?bytes=${DOWNLOAD_CHUNK_BYTES}`, {
            signal
          })
          if (!res.body) {
            totalBytes += (await res.arrayBuffer()).byteLength
            continue
          }
          const reader = res.body.getReader()
          for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            totalBytes += value.byteLength
            const now = performance.now()
            if (now - lastEmit >= PROGRESS_INTERVAL_MS) {
              lastEmit = now
              this.emitWindow(onProgress, 'download', start, now, totalBytes)
            }
            if (now >= deadline) {
              await reader.cancel()
              break
            }
          }
        }
      } catch (err) {
        if (!signal.aborted) log.debug({ err }, 'download stream ended early')
      }
    }

    await Promise.all(Array.from({ length: SPEED_TEST_PARALLEL_STREAMS }, () => worker()))
    const elapsed = performance.now() - start
    return totalBytes > 0 ? mbps(totalBytes, elapsed) : null
  }

  /** Upload throughput: count completed POSTs of a fixed payload over the window. */
  private async measureUpload(
    signal: AbortSignal,
    onProgress?: SpeedProgressEmitter
  ): Promise<number | null> {
    const payload = new Uint8Array(UPLOAD_CHUNK_BYTES)
    const start = performance.now()
    const deadline = start + SPEED_TEST_UPLOAD_DURATION_MS
    let totalBytes = 0

    const worker = async (): Promise<void> => {
      try {
        while (performance.now() < deadline && !signal.aborted) {
          await fetch(CLOUDFLARE_SPEEDTEST_UP_URL, {
            method: 'POST',
            body: payload,
            signal
          })
          totalBytes += payload.byteLength
          this.emitWindow(onProgress, 'upload', start, performance.now(), totalBytes)
        }
      } catch (err) {
        if (!signal.aborted) log.debug({ err }, 'upload stream ended early')
      }
    }

    await Promise.all(Array.from({ length: SPEED_TEST_PARALLEL_STREAMS }, () => worker()))
    const elapsed = performance.now() - start
    return totalBytes > 0 ? mbps(totalBytes, elapsed) : null
  }

  private emitWindow(
    onProgress: SpeedProgressEmitter | undefined,
    phase: 'download' | 'upload',
    start: number,
    now: number,
    totalBytes: number
  ): void {
    if (!onProgress) return
    const [from, to, duration] =
      phase === 'download'
        ? [BAND.downloadStart, BAND.downloadEnd, SPEED_TEST_DOWNLOAD_DURATION_MS]
        : [BAND.uploadStart, BAND.uploadEnd, SPEED_TEST_UPLOAD_DURATION_MS]
    const frac = clamp((now - start) / duration, 0, 1)
    onProgress({
      phase,
      percent: round(from + frac * (to - from)),
      currentMbps: mbps(totalBytes, now - start)
    })
  }
}
