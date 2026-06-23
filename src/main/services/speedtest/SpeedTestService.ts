import type { SpeedTestResult } from '@shared/types/diagnostics'
import { childLogger } from '../../core/logger'
import type { ISpeedTestAdapter, SpeedProgressEmitter } from '../../adapters/speedtest/ISpeedTestAdapter'

const log = childLogger('SpeedTest')

/**
 * Picks a speed-test backend at runtime. The install-free HTTP backend
 * (Cloudflare) works on every machine and is the default; if the optional Ookla
 * CLI is detected on PATH we use it instead for higher accuracy. Same "always
 * works, better when available" pattern the AI provider layer uses.
 */
export class SpeedTestService {
  constructor(
    private readonly http: ISpeedTestAdapter,
    private readonly ookla: ISpeedTestAdapter
  ) {}

  async run(onProgress?: SpeedProgressEmitter): Promise<SpeedTestResult> {
    const adapter = (await this.ookla.isAvailable()) ? this.ookla : this.http
    log.debug({ adapter: adapter.name }, 'running speed test')
    return adapter.run(onProgress)
  }
}
