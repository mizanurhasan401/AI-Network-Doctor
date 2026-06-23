import { Resolver } from 'node:dns/promises'
import type { DnsResult, DnsServerResult } from '@shared/types/diagnostics'
import { DEFAULT_DNS_TEST_DOMAIN, REFERENCE_DNS_SERVERS } from '@shared/constants'
import { avg } from '../../core/stats'

export interface DnsRunOptions {
  readonly servers: readonly string[]
  readonly testDomain?: string
}

/**
 * Measures per-resolver availability and resolution latency. Each server is
 * queried in isolation via a dedicated Resolver so one slow/broken resolver
 * never skews another's reading.
 */
export class DnsService {
  async run(options: DnsRunOptions): Promise<DnsResult> {
    const testedDomain = options.testDomain ?? DEFAULT_DNS_TEST_DOMAIN
    const servers = this.normalizeServers(options.servers)

    const results = await Promise.all(servers.map((s) => this.probeServer(s, testedDomain)))
    const okTimes = results.filter((r) => r.reachable && r.resolveMs !== null).map((r) => r.resolveMs as number)

    return { testedDomain, servers: results, avgResolveMs: avg(okTimes) }
  }

  private normalizeServers(servers: readonly string[]): string[] {
    const usable = servers.filter((s) => /^[0-9a-fA-F:.]+$/.test(s))
    return usable.length > 0 ? usable : [...REFERENCE_DNS_SERVERS]
  }

  private async probeServer(server: string, domain: string): Promise<DnsServerResult> {
    const resolver = new Resolver({ timeout: 4000, tries: 1 })
    try {
      resolver.setServers([server])
    } catch (err) {
      return {
        server,
        reachable: false,
        resolveMs: null,
        testedDomain: domain,
        error: err instanceof Error ? err.message : 'invalid server'
      }
    }

    const startedAt = performance.now()
    try {
      await resolver.resolve4(domain)
      return {
        server,
        reachable: true,
        resolveMs: Math.round(performance.now() - startedAt),
        testedDomain: domain,
        error: null
      }
    } catch (err) {
      return {
        server,
        reachable: false,
        resolveMs: null,
        testedDomain: domain,
        error: err instanceof Error ? err.message : String(err)
      }
    }
  }
}
