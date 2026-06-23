import { spawn } from 'node:child_process'
import { NetworkError } from '@shared/errors/errors'

export interface ExecResult {
  readonly stdout: string
  readonly stderr: string
  readonly code: number | null
}

export interface ExecOptions {
  readonly timeoutMs?: number
  /** Treat a non-zero exit as success and return its output anyway. */
  readonly allowNonZeroExit?: boolean
}

/**
 * Run a system binary safely. We pass arguments as an array with `shell: false`,
 * so user-influenced values (hosts) cannot inject shell syntax. A hard timeout
 * guarantees a diagnostic can never hang the main process.
 */
export function execCommand(
  command: string,
  args: readonly string[],
  options: ExecOptions = {}
): Promise<ExecResult> {
  const { timeoutMs = 15_000, allowNonZeroExit = false } = options

  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], { shell: false, windowsHide: true })

    let stdout = ''
    let stderr = ''
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill('SIGKILL')
      reject(new NetworkError(`Command timed out: ${command}`, { detail: `${command} exceeded ${timeoutMs}ms` }))
    }, timeoutMs)

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8')
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
    })

    child.on('error', (err) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(new NetworkError(`Failed to run ${command}`, { cause: err, detail: err.message }))
    })

    child.on('close', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (code !== 0 && !allowNonZeroExit) {
        reject(
          new NetworkError(`Command exited with code ${code}: ${command}`, {
            detail: stderr.trim() || stdout.trim()
          })
        )
        return
      }
      resolve({ stdout, stderr, code })
    })
  })
}

/** True if a binary is resolvable on PATH (used for optional deps like speedtest). */
export async function commandExists(command: string): Promise<boolean> {
  const probe = process.platform === 'win32' ? 'where' : 'which'
  try {
    const { code } = await execCommand(probe, [command], { timeoutMs: 4000, allowNonZeroExit: true })
    return code === 0
  } catch {
    return false
  }
}
