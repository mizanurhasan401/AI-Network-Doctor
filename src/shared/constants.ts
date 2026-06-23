/** Cross-process constants. No secrets, no machine-specific values. */

/** Default public host used as the "internet" probe target. */
export const DEFAULT_PROBE_HOST = '8.8.8.8'

/** Domain used to measure DNS resolution speed. */
export const DEFAULT_DNS_TEST_DOMAIN = 'cloudflare.com'

/** Public well-known DNS resolvers used as fallbacks/health references. */
export const REFERENCE_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'] as const

/** Endpoints used for HTTP/HTTPS reachability checks. */
export const HTTP_CHECK_URL = 'http://www.gstatic.com/generate_204'
export const HTTPS_CHECK_URL = 'https://www.google.com/generate_204'

/** Service used to discover the public IP without third-party SDKs. */
export const PUBLIC_IP_URL = 'https://api.ipify.org'

export const PING_SAMPLE_COUNT = 5
export const PACKET_LOSS_SAMPLE_COUNT = 20
export const TRACEROUTE_MAX_HOPS = 30
