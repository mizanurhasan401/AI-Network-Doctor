import { app } from 'electron'
import pino, { type Logger } from 'pino'

/**
 * Structured logging via Pino. Pretty in dev, JSON in production. We never log
 * credentials or AI API keys — callers must pass already-redacted context.
 */
const isDev = !app.isPackaged

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: { app: 'netdoctor', pid: process.pid },
  redact: {
    paths: ['apiKey', '*.apiKey', 'config.apiKey', 'password', '*.password'],
    censor: '[redacted]'
  },
  ...(isDev
    ? {
        transport: {
          target: 'pino/file',
          options: { destination: 1 } // stdout, line-delimited JSON
        }
      }
    : {})
})

export function childLogger(scope: string): Logger {
  return logger.child({ scope })
}
