import type { SpeedTestResult } from '@shared/types/diagnostics'

/**
 * Speed-test backend abstraction. Services depend on this interface, never on a
 * concrete implementation — so the install-free HTTP backend (Cloudflare) and the
 * optional Ookla CLI can be swapped without touching the service, mirroring the
 * `IPingAdapter` / `ITracerouteAdapter` convention.
 */
export type SpeedPhase = 'latency' | 'download' | 'upload'

export interface SpeedProgress {
  readonly phase: SpeedPhase
  /** Progress within the whole speed test, 0–100. */
  readonly percent: number
  /** Running throughput for the active phase (null during latency sampling). */
  readonly currentMbps: number | null
}

export type SpeedProgressEmitter = (progress: SpeedProgress) => void

export interface ISpeedTestAdapter {
  /** Human label for logs / diagnostics, e.g. 'cloudflare' | 'ookla'. */
  readonly name: string
  /** Whether this adapter can run right now (e.g. the Ookla CLI is on PATH). */
  isAvailable(): Promise<boolean>
  run(onProgress?: SpeedProgressEmitter): Promise<SpeedTestResult>
}
