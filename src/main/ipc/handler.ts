import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import type { ZodType } from 'zod'
import type { IpcResult } from '@shared/ipc/contract'
import { ValidationError, toSerializedError } from '@shared/errors/errors'
import { childLogger } from '../core/logger'

const log = childLogger('ipc')

/**
 * Wraps `ipcMain.handle` with: Zod validation of the inbound payload, uniform
 * `IpcResult` success/error envelopes (errors never cross the boundary as thrown
 * exceptions), and structured logging. This is the single choke point where the
 * renderer's untrusted input is validated before reaching any service.
 */
export function registerInvoke<Req, Res>(
  channel: string,
  schema: ZodType<Req> | null,
  handler: (request: Req, event: IpcMainInvokeEvent) => Promise<Res>
): void {
  ipcMain.handle(channel, async (event, rawPayload): Promise<IpcResult<Res>> => {
    try {
      const request = parse(schema, rawPayload)
      const data = await handler(request, event)
      return { ok: true, data }
    } catch (err) {
      log.error({ channel, err }, 'IPC handler failed')
      return { ok: false, error: toSerializedError(err) }
    }
  })
}

function parse<Req>(schema: ZodType<Req> | null, raw: unknown): Req {
  if (!schema) return undefined as Req
  const result = schema.safeParse(raw)
  if (!result.success) {
    throw new ValidationError('অনুরোধের ডেটা যাচাই ব্যর্থ হয়েছে।', { detail: result.error.message })
  }
  return result.data
}
