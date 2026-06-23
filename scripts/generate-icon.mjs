/**
 * Zero-dependency app-icon generator. Emits build/icon.png (1024×1024): a
 * rounded-square blue gradient with a white "activity/pulse" polyline matching
 * the app's lucide `Activity` logo. electron-builder converts this PNG into the
 * platform icons (.icns / .ico) at package time.
 *
 * Run once after changing the design: `node scripts/generate-icon.mjs`
 * (No SVG rasterizer / sharp is required — uses only Node's built-in zlib.)
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SIZE = 1024
const RADIUS = 210 // rounded-square corner radius
const STROKE = 66 // pulse line thickness
const GRAD_TOP = [37, 99, 235] // #2563eb
const GRAD_BOTTOM = [29, 64, 175] // #1d40af
const WHITE = [255, 255, 255]

// lucide "activity" path points in its 24×24 viewBox.
const PATH_24 = [
  [22, 12],
  [18, 12],
  [15, 21],
  [9, 3],
  [6, 12],
  [2, 12]
]
const SCALE = 700 / 24
const OFF = SIZE / 2 - 12 * SCALE // centers the path (its midpoint is 12,12)
const PATH = PATH_24.map(([x, y]) => [x * SCALE + OFF, y * SCALE + OFF])

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a, b, t) => a + (b - a) * t

/** Signed distance from point to an axis-aligned rounded rectangle (centered). */
function roundedRectSdf(px, py) {
  const half = SIZE / 2
  const qx = Math.abs(px - half) - (half - RADIUS)
  const qy = Math.abs(py - half) - (half - RADIUS)
  const ax = Math.max(qx, 0)
  const ay = Math.max(qy, 0)
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - RADIUS
}

/** Distance from point to the pulse polyline (round caps/joins for free). */
function polylineDist(px, py) {
  let best = Infinity
  for (let i = 0; i < PATH.length - 1; i++) {
    const [x1, y1] = PATH[i]
    const [x2, y2] = PATH[i + 1]
    const dx = x2 - x1
    const dy = y2 - y1
    const len2 = dx * dx + dy * dy
    let t = len2 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0
    t = clamp01(t)
    const d = Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
    if (d < best) best = d
  }
  return best
}

const pixels = Buffer.alloc(SIZE * SIZE * 4)
for (let y = 0; y < SIZE; y++) {
  const gt = y / (SIZE - 1)
  const bg = [lerp(GRAD_TOP[0], GRAD_BOTTOM[0], gt), lerp(GRAD_TOP[1], GRAD_BOTTOM[1], gt), lerp(GRAD_TOP[2], GRAD_BOTTOM[2], gt)]
  for (let x = 0; x < SIZE; x++) {
    const bgA = clamp01(0.5 - roundedRectSdf(x + 0.5, y + 0.5)) // AA edge
    const sA = clamp01(STROKE / 2 + 0.5 - polylineDist(x + 0.5, y + 0.5)) // AA stroke

    // Composite white stroke over the gradient (premultiplied), then un-premultiply.
    const outA = sA + bgA * (1 - sA)
    const i = (y * SIZE + x) * 4
    if (outA <= 0) {
      pixels[i] = pixels[i + 1] = pixels[i + 2] = pixels[i + 3] = 0
      continue
    }
    for (let c = 0; c < 3; c++) {
      const pm = WHITE[c] * sA + bg[c] * bgA * (1 - sA)
      pixels[i + c] = Math.round(pm / outA)
    }
    pixels[i + 3] = Math.round(outA * 255)
  }
}

// --- Minimal PNG encoder (RGBA, 8-bit) ---
function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
  }
  return (~c) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // color type RGBA
// 10,11,12 = compression/filter/interlace = 0

// Raw scanlines with filter byte 0 prefixed per row.
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0
  pixels.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4)
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
])

const out = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'build', 'icon.png')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, png)
console.log(`Wrote ${out} (${SIZE}×${SIZE}, ${png.length} bytes)`)
