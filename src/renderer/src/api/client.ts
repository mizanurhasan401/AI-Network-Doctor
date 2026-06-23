import type { IpcResult } from '@shared/ipc/contract'
import type { SerializedError } from '@shared/errors/errors'

/** Renderer-side error carrying the structured code from the main process. */
export class IpcCallError extends Error {
  constructor(public readonly serialized: SerializedError) {
    super(serialized.message)
    this.name = 'IpcCallError'
  }
}

/**
 * Unwraps an `IpcResult` envelope: returns data on success, throws a typed error
 * on failure. This is the single adapter between the preload bridge's safe
 * envelopes and TanStack Query's throw-based error model.
 */
export async function unwrap<T>(promise: Promise<IpcResult<T>>): Promise<T> {
  const result = await promise
  if (result.ok) return result.data
  throw new IpcCallError(result.error)
}

/** Thin, typed accessor for the preload API (fails loud if bridge is missing). */
export function api(): Window['netdoctor'] {
  if (!window.netdoctor) {
    throw new Error('NetDoctor bridge unavailable — preload failed to load.')
  }
  return window.netdoctor
}
