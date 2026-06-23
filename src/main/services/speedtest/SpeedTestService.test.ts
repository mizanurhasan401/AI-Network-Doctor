import { describe, expect, it, vi } from 'vitest'

// The logger pulls in electron's `app` at load — stub it for node-environment tests.
vi.mock('../../core/logger', () => ({
  childLogger: () => ({ debug() {}, info() {}, warn() {}, error() {} })
}))

import type { SpeedTestResult } from '@shared/types/diagnostics'
import type { ISpeedTestAdapter, SpeedProgressEmitter } from '../../adapters/speedtest/ISpeedTestAdapter'
import { SpeedTestService } from './SpeedTestService'

const RESULT = (download: number): SpeedTestResult => ({
  available: true,
  downloadMbps: download,
  uploadMbps: 10,
  pingMs: 12,
  jitterMs: 2,
  isp: 'ISP',
  serverName: 'Server',
  error: null
})

class StubAdapter implements ISpeedTestAdapter {
  readonly run = vi.fn(async (_onProgress?: SpeedProgressEmitter) => this.result)
  constructor(
    readonly name: string,
    private readonly available: boolean,
    private readonly result: SpeedTestResult
  ) {}
  isAvailable(): Promise<boolean> {
    return Promise.resolve(this.available)
  }
}

describe('SpeedTestService', () => {
  it('uses the Ookla adapter when its CLI is available', async () => {
    const http = new StubAdapter('cloudflare', true, RESULT(100))
    const ookla = new StubAdapter('ookla', true, RESULT(200))

    const result = await new SpeedTestService(http, ookla).run()

    expect(result.downloadMbps).toBe(200)
    expect(ookla.run).toHaveBeenCalledTimes(1)
    expect(http.run).not.toHaveBeenCalled()
  })

  it('falls back to the HTTP adapter when Ookla is unavailable', async () => {
    const http = new StubAdapter('cloudflare', true, RESULT(100))
    const ookla = new StubAdapter('ookla', false, RESULT(200))

    const result = await new SpeedTestService(http, ookla).run()

    expect(result.downloadMbps).toBe(100)
    expect(http.run).toHaveBeenCalledTimes(1)
    expect(ookla.run).not.toHaveBeenCalled()
  })

  it('forwards the progress callback to the chosen adapter', async () => {
    const http = new StubAdapter('cloudflare', true, RESULT(100))
    const ookla = new StubAdapter('ookla', false, RESULT(200))
    const onProgress = vi.fn()

    await new SpeedTestService(http, ookla).run(onProgress)

    expect(http.run).toHaveBeenCalledWith(onProgress)
  })
})
