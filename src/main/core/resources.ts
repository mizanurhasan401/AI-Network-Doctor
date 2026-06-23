import { app } from 'electron'
import { join } from 'node:path'

/**
 * Resolves bundled resource files in both dev and packaged builds. In production
 * `resources/` is shipped via electron-builder's `extraResources`/`asarUnpack`;
 * in dev it lives at the project root.
 */
export function resourcePath(...segments: string[]): string {
  const base = app.isPackaged ? process.resourcesPath : app.getAppPath()
  return join(base, 'resources', ...segments)
}

export const BANGLA_FONT_PATH = (): string => resourcePath('fonts', 'NotoSansBengali-Regular.ttf')
