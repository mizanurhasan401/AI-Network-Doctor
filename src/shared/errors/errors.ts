/**
 * Centralized error taxonomy. Lives in `shared` so the main process can throw
 * rich errors and the renderer can reason about them by `code`.
 *
 * IMPORTANT: class instances do not survive Electron's structured-clone IPC.
 * Always transport errors as `SerializedError` (see `toSerializedError`) and
 * never `throw` a class across the boundary.
 */

export type ErrorCode =
  | 'APP_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AI_ERROR'
  | 'IPC_ERROR'
  | 'DEPENDENCY_MISSING'

export interface SerializedError {
  readonly name: string
  readonly code: ErrorCode
  readonly message: string
  /** Safe, user-presentable detail (already sanitized — never raw secrets). */
  readonly detail?: string
  readonly cause?: string
}

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode
  readonly detail: string | undefined

  // Public so concrete subclasses can be constructed anywhere; the class stays
  // abstract, so `new AppError()` itself remains impossible.
  constructor(message: string, options?: { detail?: string; cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined)
    this.name = new.target.name
    this.detail = options?.detail
    // Restore prototype chain (TS + extending built-ins).
    Object.setPrototypeOf(this, new.target.prototype)
  }

  toSerialized(): SerializedError {
    const base: SerializedError = {
      name: this.name,
      code: this.code,
      message: this.message
    }
    return {
      ...base,
      ...(this.detail !== undefined ? { detail: this.detail } : {}),
      ...(this.cause !== undefined ? { cause: stringifyCause(this.cause) } : {})
    }
  }
}

export class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR' as const
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR' as const
}

export class AIError extends AppError {
  readonly code = 'AI_ERROR' as const
}

export class DependencyMissingError extends AppError {
  readonly code = 'DEPENDENCY_MISSING' as const
}

export class GenericAppError extends AppError {
  readonly code = 'APP_ERROR' as const
}

function stringifyCause(cause: unknown): string {
  if (cause instanceof Error) return `${cause.name}: ${cause.message}`
  if (typeof cause === 'string') return cause
  try {
    return JSON.stringify(cause)
  } catch {
    return String(cause)
  }
}

/** Normalize any thrown value into a transport-safe DTO. */
export function toSerializedError(error: unknown): SerializedError {
  if (error instanceof AppError) return error.toSerialized()
  if (error instanceof Error) {
    return { name: error.name, code: 'APP_ERROR', message: error.message }
  }
  return { name: 'UnknownError', code: 'APP_ERROR', message: String(error) }
}
