import type { TracerouteHop } from '@shared/types/diagnostics'
import { avg } from '../../core/stats'
import { execCommand } from '../../core/exec'
import type { ITracerouteAdapter, TracerouteOptions } from './ITracerouteAdapter'

/**
 * Traceroute via the OS binary (`tracert` on Windows, `traceroute` on Unix).
 * The npm `traceroute` package merely wraps these binaries, so depending on it
 * adds no value and another native-ish failure mode. Parsing is platform-aware
 * because Windows prints latencies *before* the host and Unix prints them after.
 */
export class SystemTracerouteAdapter implements ITracerouteAdapter {
  async trace(
    target: string,
    options: TracerouteOptions
  ): Promise<{ hops: TracerouteHop[]; completed: boolean }> {
    const isWindows = process.platform === 'win32'
    const command = isWindows ? 'tracert' : 'traceroute'
    const args = isWindows
      ? ['-d', '-h', String(options.maxHops), target]
      : ['-n', '-m', String(options.maxHops), '-q', '3', target]

    let stdout = ''
    try {
      const res = await execCommand(command, args, {
        timeoutMs: Math.max(20_000, options.maxHops * 1500),
        allowNonZeroExit: true
      })
      stdout = res.stdout
    } catch {
      return { hops: [], completed: false }
    }

    const hops = isWindows ? this.parseWindows(stdout) : this.parseUnix(stdout)
    return { hops, completed: hops.length > 0 }
  }

  private parseUnix(output: string): TracerouteHop[] {
    const hops: TracerouteHop[] = []
    for (const line of output.split('\n')) {
      const m = line.match(/^\s*(\d+)\s+(.*)$/)
      if (!m) continue
      const hop = Number.parseInt(m[1], 10)
      const rest = m[2].trim()
      if (rest.startsWith('*') && !/\d/.test(rest.replace(/\*/g, ''))) {
        hops.push({ hop, host: null, ip: null, avgMs: null, timedOut: true })
        continue
      }
      const ip = rest.match(/(\d{1,3}(?:\.\d{1,3}){3})/)?.[1] ?? null
      const times = [...rest.matchAll(/([\d.]+)\s*ms/g)].map((t) => Number.parseFloat(t[1]))
      hops.push({ hop, host: ip, ip, avgMs: avg(times), timedOut: times.length === 0 })
    }
    return hops
  }

  private parseWindows(output: string): TracerouteHop[] {
    const hops: TracerouteHop[] = []
    for (const line of output.split('\n')) {
      const m = line.match(/^\s*(\d+)\s+(.*)$/)
      if (!m) continue
      const hop = Number.parseInt(m[1], 10)
      const rest = m[2].trim()
      if (/request timed out/i.test(rest)) {
        hops.push({ hop, host: null, ip: null, avgMs: null, timedOut: true })
        continue
      }
      const ip = rest.match(/(\d{1,3}(?:\.\d{1,3}){3})/)?.[1] ?? null
      const times = [...rest.matchAll(/(?:<\s*)?(\d+)\s*ms/g)].map((t) => Number.parseFloat(t[1]))
      hops.push({ hop, host: ip, ip, avgMs: avg(times), timedOut: times.length === 0 })
    }
    return hops
  }
}
