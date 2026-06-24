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

/**
 * Upper bound on ping count requested from the renderer. A single dropped packet
 * out of 5 reads as 20% loss; sending more packets (e.g. 100) makes the loss
 * figure trustworthy. Capped so a runaway count can't stall the exec timeout.
 */
export const MAX_PING_COUNT = 200

/**
 * Bounds for a custom ICMP payload size (bytes). 0 is valid (header-only probe);
 * the upper bound stays under the classic 65507-byte IPv4 payload ceiling.
 */
export const MIN_PING_SIZE_BYTES = 0
export const MAX_PING_SIZE_BYTES = 65500

/**
 * Cloudflare's public speed-test backend (the same endpoints its browser speed
 * test uses). No API key, global Anycast — lets us measure throughput without the
 * customer installing any CLI. The adapter seam keeps these swappable.
 */
export const CLOUDFLARE_SPEEDTEST_DOWN_URL = 'https://speed.cloudflare.com/__down'
export const CLOUDFLARE_SPEEDTEST_UP_URL = 'https://speed.cloudflare.com/__up'
/** Returns the serving Cloudflare colo (nearest test server) as `key=value` lines. */
export const CLOUDFLARE_TRACE_URL = 'https://speed.cloudflare.com/cdn-cgi/trace'

/** Free, no-key geo-IP lookup used to label the ISP + city (best-effort). */
export const IP_GEO_LOOKUP_URL = 'http://ip-api.com/json/?fields=status,country,city,isp,org'

/** Overall budget for the HTTP speed test before it is aborted. */
export const SPEED_TEST_TIMEOUT_MS = 60_000
/** Steady-state measurement window for each throughput phase. */
export const SPEED_TEST_DOWNLOAD_DURATION_MS = 10_000
export const SPEED_TEST_UPLOAD_DURATION_MS = 10_000
/** Parallel connections used to saturate the link (single stream underestimates). */
export const SPEED_TEST_PARALLEL_STREAMS = 6
/** Number of tiny round-trips sampled to derive latency + jitter. */
export const SPEED_TEST_LATENCY_SAMPLES = 10
