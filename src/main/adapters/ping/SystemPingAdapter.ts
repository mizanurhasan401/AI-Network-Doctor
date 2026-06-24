import { execCommand } from '../../core/exec'
import type { IPingAdapter, PingProbeOptions, PingProbeResult } from './IPingAdapter'

/**
 * Default ping adapter: shells out to the OS `ping` binary and parses its output.
 *
 * Why not `node-net-ping`? Raw ICMP sockets require root/admin on Linux & macOS
 * and a native build that frequently breaks cross-platform packaging. The system
 * binary is always present, needs no elevated privileges, and behaves the same on
 * every supported OS. The adapter seam keeps the door open to swap it later.
 */
export class SystemPingAdapter implements IPingAdapter {
  async ping(host: string, options: PingProbeOptions): Promise<PingProbeResult> {
    const count = Math.max(1, options.count)
    const isWindows = process.platform === 'win32'
    const args = isWindows ? ['-n', String(count)] : ['-c', String(count)]
    // Custom payload size: `-l` on Windows, `-s` on Unix. Both take payload bytes.
    if (typeof options.sizeBytes === 'number' && Number.isFinite(options.sizeBytes) && options.sizeBytes >= 0) {
      const size = Math.floor(options.sizeBytes)
      args.push(isWindows ? '-l' : '-s', String(size))
    }
    args.push(host)
    // Generous overall budget: count pings + per-reply wait, capped by exec timeout.
    const timeoutMs = Math.max(8000, count * 1500 + 4000)

    let output = ''
    try {
      const { stdout } = await execCommand(isWindows ? 'ping' : 'ping', args, {
        timeoutMs,
        allowNonZeroExit: true // unreachable host exits non-zero; we still parse it
      })
      output = stdout
    } catch {
      // Total failure (binary missing / timeout) → host treated as fully unreachable.
      return { host, alive: false, sent: count, received: 0, lossPercent: 100, rttsMs: [] }
    }

    const rttsMs = this.parseRtts(output)
    const received = rttsMs.length
    const lossPercent = count > 0 ? ((count - received) / count) * 100 : 100

    return {
      host,
      alive: received > 0,
      sent: count,
      received,
      lossPercent: Math.round(lossPercent * 100) / 100,
      rttsMs
    }
  }

  /** Extract every reply RTT. `time=12.3 ms`, `time=12ms`, `time<1ms` all match. */
  private parseRtts(output: string): number[] {
    const rtts: number[] = []
    const re = /time[=<]\s*([\d.]+)\s*ms/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(output)) !== null) {
      const value = Number.parseFloat(m[1])
      if (Number.isFinite(value)) rtts.push(value)
    }
    return rtts
  }
}
