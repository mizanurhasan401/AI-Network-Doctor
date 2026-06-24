import { z } from 'zod'
import { MAX_PING_COUNT, MAX_PING_SIZE_BYTES, MIN_PING_SIZE_BYTES } from '../constants'

/**
 * Zod schemas validate every inbound IPC payload at the main-process boundary
 * (defense in depth — the renderer is treated as untrusted). Keep these in sync
 * with the request types in `contract.ts`.
 */

const hostname = z
  .string()
  .trim()
  .min(1)
  .max(253)
  .regex(/^[a-zA-Z0-9.:_-]+$/, 'Invalid host')

export const runDiagnosticOptionsSchema = z
  .object({
    probeHost: hostname.optional(),
    pingCount: z.number().int().min(1).max(MAX_PING_COUNT).optional(),
    packetSizeBytes: z.number().int().min(MIN_PING_SIZE_BYTES).max(MAX_PING_SIZE_BYTES).optional()
  })
  .strict()

export const aiProviderConfigSchema = z
  .object({
    provider: z.enum(['openai', 'claude', 'gemini', 'local']),
    model: z.string().trim().min(1).max(100),
    apiKey: z.string().trim().min(1).max(400).optional(),
    baseUrl: z.string().url().max(400).optional(),
    temperature: z.number().min(0).max(2).optional()
  })
  .strict()

const severity = z.enum(['info', 'warning', 'critical'])

const language = z.enum(['en', 'bn'])

const detectedIssueSchema = z.object({
  id: z.string(),
  area: z.enum(['connectivity', 'dns', 'packetLoss', 'speed', 'latency', 'system']),
  severity,
  params: z.record(z.union([z.string(), z.number()])).optional()
})

// The snapshot is produced by our own main process, so we validate shape
// loosely (structure present) rather than re-deriving every nested measurement.
export const diagnosticSnapshotSchema = z
  .object({
    id: z.string().min(1),
    createdAt: z.string().min(1),
    system: z.object({}).passthrough(),
    connectivity: z.object({}).passthrough(),
    dns: z.object({}).passthrough(),
    packetLoss: z.object({}).passthrough(),
    traceroute: z.object({}).passthrough(),
    speedTest: z.object({}).passthrough(),
    health: z.object({}).passthrough(),
    issues: z.array(detectedIssueSchema)
  })
  .passthrough()

export const analyzeRequestSchema = z
  .object({
    snapshot: diagnosticSnapshotSchema,
    config: aiProviderConfigSchema,
    language: language.optional()
  })
  .strict()

export const reportRequestSchema = z
  .object({
    snapshot: diagnosticSnapshotSchema,
    recommendation: z.object({}).passthrough().optional(),
    format: z.enum(['pdf', 'docx', 'txt']),
    language: language.optional()
  })
  .strict()
