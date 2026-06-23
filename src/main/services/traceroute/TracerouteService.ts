import type { TracerouteResult } from '@shared/types/diagnostics'
import { DEFAULT_PROBE_HOST, TRACEROUTE_MAX_HOPS } from '@shared/constants'
import type { ITracerouteAdapter } from '../../adapters/traceroute/ITracerouteAdapter'

/** Thin orchestration over the traceroute adapter; target + max-hop policy live here. */
export class TracerouteService {
  constructor(private readonly tracer: ITracerouteAdapter) {}

  async run(options: { probeHost?: string } = {}): Promise<TracerouteResult> {
    const target = options.probeHost ?? DEFAULT_PROBE_HOST
    const { hops, completed } = await this.tracer.trace(target, { maxHops: TRACEROUTE_MAX_HOPS })
    return { target, hops, completed }
  }
}
