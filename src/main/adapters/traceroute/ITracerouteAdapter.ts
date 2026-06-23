import type { TracerouteHop } from '@shared/types/diagnostics'

export interface TracerouteOptions {
  readonly maxHops: number
}

export interface ITracerouteAdapter {
  trace(target: string, options: TracerouteOptions): Promise<{
    hops: TracerouteHop[]
    completed: boolean
  }>
}
