import type { SpeedTestResult } from '@shared/types/diagnostics'
import { commandExists, execCommand } from '../../core/exec'
import { childLogger } from '../../core/logger'
import { round } from '../../core/stats'

const log = childLogger('SpeedTest')

interface OoklaJson {
  ping?: { latency?: number; jitter?: number }
  download?: { bandwidth?: number }
  upload?: { bandwidth?: number }
  isp?: string
  server?: { name?: string }
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

/**
 * Wraps the Ookla Speedtest CLI. The CLI is an *optional* dependency: if it is
 * not installed we degrade gracefully with `available: false` and an actionable
 * message, rather than failing the whole diagnostic run.
 */
export class SpeedTestService {
  async run(): Promise<SpeedTestResult> {
    if (!(await commandExists('speedtest'))) {
      return UNAVAILABLE('Ookla Speedtest CLI পাওয়া যায়নি। গতি পরীক্ষা করতে CLI ইনস্টল করুন।')
    }

    try {
      const { stdout } = await execCommand(
        'speedtest',
        ['--format=json', '--accept-license', '--accept-gdpr'],
        { timeoutMs: 90_000 }
      )
      const data = JSON.parse(stdout) as OoklaJson
      return this.fromOokla(data)
    } catch (err) {
      log.warn({ err }, 'speedtest run failed')
      return UNAVAILABLE('গতি পরীক্ষা সম্পন্ন করা যায়নি।')
    }
  }

  private fromOokla(data: OoklaJson): SpeedTestResult {
    const toMbps = (bytesPerSec?: number): number | null =>
      typeof bytesPerSec === 'number' ? round((bytesPerSec * 8) / 1_000_000) : null

    return {
      available: true,
      downloadMbps: toMbps(data.download?.bandwidth),
      uploadMbps: toMbps(data.upload?.bandwidth),
      pingMs: typeof data.ping?.latency === 'number' ? round(data.ping.latency) : null,
      jitterMs: typeof data.ping?.jitter === 'number' ? round(data.ping.jitter) : null,
      isp: data.isp ?? null,
      serverName: data.server?.name ?? null,
      error: null
    }
  }
}
