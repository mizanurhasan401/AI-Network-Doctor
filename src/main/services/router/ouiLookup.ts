/**
 * Best-effort router vendor identification from a MAC address.
 *
 * A MAC's first 3 bytes (the OUI) identify the hardware maker. We resolve it in
 * two stages (hybrid):
 *   1. An offline table of common consumer-router OUIs — instant, works offline,
 *      covers the brands most users in the region actually own.
 *   2. If the offline table misses AND the internet is reachable, an online
 *      lookup fills the long tail. Failures degrade silently to `null`.
 *
 * This is identification only — no connection is made to the router.
 */

/** Offline OUI → vendor map. Keys are the first 3 MAC bytes, uppercase, no separators. */
const OFFLINE_OUI: Readonly<Record<string, string>> = {
  // TP-Link
  '14CC20': 'TP-Link', '50C7BF': 'TP-Link', A42BB0: 'TP-Link', C46E1F: 'TP-Link',
  EC086B: 'TP-Link', '6466B3': 'TP-Link', B0487A: 'TP-Link', '002586': 'TP-Link',
  '30B5C2': 'TP-Link', '60E327': 'TP-Link', F8D111: 'TP-Link', '0C8063': 'TP-Link',
  '1C61B4': 'TP-Link', '9C5322': 'TP-Link', AC84C6: 'TP-Link', D80D17: 'TP-Link',
  '54AF97': 'TP-Link', '98DAC4': 'TP-Link', '003192': 'TP-Link',
  // Tenda
  C83A35: 'Tenda', D8FEE3: 'Tenda', '50FA84': 'Tenda', '04BAD6': 'Tenda',
  '84A1D1': 'Tenda', '9C9D7E': 'Tenda',
  // Huawei
  '00E0FC': 'Huawei', '286ED4': 'Huawei', '48462B': 'Huawei', '4C5499': 'Huawei',
  '5C7D5E': 'Huawei', '781DBA': 'Huawei', '80B686': 'Huawei', '88E3AB': 'Huawei',
  '9C28EF': 'Huawei', ACE215: 'Huawei', E468A3: 'Huawei', F4559C: 'Huawei',
  '00259E': 'Huawei', '047503': 'Huawei',
  // ZTE
  '0015EB': 'ZTE', '04BD88': 'ZTE', '2C26C5': 'ZTE', '344B50': 'ZTE',
  '4C09B4': 'ZTE', '9CA9E4': 'ZTE', D870B5: 'ZTE',
  // D-Link
  '001346': 'D-Link', '0015E9': 'D-Link', '00179A': 'D-Link', '001CF0': 'D-Link',
  '14D64D': 'D-Link', '1CBDB9': 'D-Link', '28107B': 'D-Link', '340804': 'D-Link',
  '5CD998': 'D-Link', '78321B': 'D-Link', '90940A': 'D-Link', C8BE19: 'D-Link',
  CCB255: 'D-Link', FC7516: 'D-Link',
  // MikroTik
  '4C5E0C': 'MikroTik', '6C3B6B': 'MikroTik', CC2DE0: 'MikroTik', '64D154': 'MikroTik',
  B869F4: 'MikroTik', '18FD74': 'MikroTik', '2CC81B': 'MikroTik', '744D28': 'MikroTik',
  DC2C6E: 'MikroTik', E48D8C: 'MikroTik',
  // Xiaomi
  '286C07': 'Xiaomi', '3413E8': 'Xiaomi', '64096A': 'Xiaomi', '7802F8': 'Xiaomi',
  '8CBEBE': 'Xiaomi',
  // Asus
  '1C872C': 'ASUS', '2C56DC': 'ASUS', '305A3A': 'ASUS', '38D547': 'ASUS',
  '50465D': 'ASUS', '704D7B': 'ASUS', AC220B: 'ASUS', D850E6: 'ASUS',
  // Netgear
  '008EF2': 'Netgear', '20E52A': 'Netgear', '28C68E': 'Netgear', '3498B5': 'Netgear',
  '44A56E': 'Netgear', '6CB0CE': 'Netgear', A040A0: 'Netgear', C03F0E: 'Netgear'
}

/**
 * Normalize a MAC to "001122334455" (upper, no separators). Handles the
 * non-padded form macOS `arp` emits (e.g. "0:1:2:3:4:5" → "000102030405") as
 * well as colon/dash/bare inputs.
 */
export function normalizeMac(mac: string): string | null {
  const parts = mac.trim().split(/[:-]/)
  if (parts.length === 6 && parts.every((p) => /^[0-9a-fA-F]{1,2}$/.test(p))) {
    return parts.map((p) => p.padStart(2, '0')).join('').toUpperCase()
  }
  const hex = mac.replace(/[^0-9a-fA-F]/g, '').toUpperCase()
  return hex.length === 12 ? hex : null
}

/** The OUI (first 3 bytes) of a normalized MAC, or null. */
function ouiOf(mac: string): string | null {
  const norm = normalizeMac(mac)
  return norm ? norm.slice(0, 6) : null
}

/** Offline-only lookup (synchronous, no network). */
export function lookupVendorOffline(mac: string): string | null {
  const oui = ouiOf(mac)
  return oui ? (OFFLINE_OUI[oui] ?? null) : null
}

/**
 * Hybrid lookup: offline table first, then a short online fallback. Best-effort —
 * any network/parse failure returns null rather than throwing.
 */
export async function lookupVendor(mac: string): Promise<string | null> {
  const offline = lookupVendorOffline(mac)
  if (offline) return offline

  const norm = normalizeMac(mac)
  if (!norm) return null

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(`https://api.macvendors.com/${norm}`, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const vendor = (await res.text()).trim()
    return vendor && !vendor.startsWith('{') ? vendor : null
  } catch {
    // Best-effort: offline or rate-limited → unknown vendor, never throws.
    return null
  }
}
