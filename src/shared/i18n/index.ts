/**
 * Cross-process i18n catalog. Imported by BOTH the renderer (live UI switching)
 * and the main process (reports + AI output), so every surface stays consistent
 * and the two never drift. English is the default; Bangla is the second locale.
 *
 * Keys are flat dotted strings. `bn` is typed against `en`'s keys, so a missing
 * Bangla translation is a compile error. Interpolate with `{name}` placeholders.
 */

export type Language = 'en' | 'bn'

export const LANGUAGES: readonly Language[] = ['en', 'bn']
export const DEFAULT_LANGUAGE: Language = 'en'

export type TranslateParams = Record<string, string | number>

const en = {
  // App shell / navigation
  'app.name': 'NetDoctor AI',
  'app.loading': 'Loading…',
  'app.footer': 'Local diagnostics · no data is stored',
  'nav.dashboard': 'Dashboard',
  'nav.diagnostics': 'Diagnostics',
  'lang.label': 'Language',
  'lang.en': 'English',
  'lang.bn': 'বাংলা',

  // Common
  'common.yes': 'Yes',
  'common.no': 'No',

  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.subtitle': 'Network health overview',
  'dashboard.runButton': 'Run diagnostic',
  'dashboard.empty': 'No diagnostic has been run yet. Click “Run diagnostic” to start.',
  'dashboard.healthScore': 'Network health score',
  'status.internet': 'Internet',
  'status.router': 'Router',
  'status.https': 'HTTPS',
  'status.dns': 'DNS',
  'status.active': 'Active',
  'status.inactive': 'Inactive',

  // Diagnostics page
  'diagnostics.title': 'Diagnostics',
  'diagnostics.subtitle': 'Run a full network test and analyze it',
  'diagnostics.running': 'Running…',
  'diagnostics.startButton': 'Start test',
  'diagnostics.failed': 'Test failed. Please try again.',
  'diagnostics.empty': 'Click the button above to start the test.',

  // Results view
  'results.connectivity': 'Connectivity',
  'results.gatewayPing': 'Gateway ping',
  'results.internetPing': 'Internet ping',
  'results.httpHttps': 'HTTP / HTTPS',
  'results.latencyPacketLoss': 'Latency & packet loss',
  'results.packetLoss': 'Packet loss',
  'results.avgLatency': 'Avg latency',
  'results.jitter': 'Jitter',
  'results.dns': 'DNS',
  'results.avgResolution': 'Avg resolution',
  'results.noResponse': 'No response',
  'results.speedTest': 'Speed test',
  'results.download': 'Download',
  'results.upload': 'Upload',
  'results.ping': 'Ping',
  'results.speedUnavailable': 'Speed test is not available.',
  'results.healthComponents': 'Health components',
  'results.notMeasured': 'Not measured',
  'results.detectedIssues': 'Detected issues ({count})',
  'results.noIssues': 'No issues detected.',

  // Health component labels (by HealthComponentKey)
  'health.connectivity': 'Connectivity',
  'health.dns': 'DNS',
  'health.packetLoss': 'Packet loss',
  'health.latency': 'Latency',
  'health.speed': 'Speed',

  // Health grades
  'grade.excellent': 'Excellent',
  'grade.good': 'Good',
  'grade.fair': 'Fair',
  'grade.poor': 'Poor',
  'grade.critical': 'Critical',

  // Severity
  'severity.info': 'Info',
  'severity.warning': 'Warning',
  'severity.critical': 'Critical',

  // Priority
  'priority.low': 'Low',
  'priority.medium': 'Medium',
  'priority.high': 'High',
  'priority.critical': 'Critical',

  // AI panel
  'ai.title': 'AI analysis',
  'ai.analyzing': 'Analyzing…',
  'ai.analyzeButton': 'Analyze',
  'ai.apiKeyPlaceholder': 'OpenAI API key (optional)',
  'ai.apiKeyHelper': 'Offline analysis is used if no key is provided',
  'ai.failed': 'Analysis failed — try the offline analysis.',
  'ai.priority': 'Priority',
  'ai.confidence': 'Confidence',
  'ai.offline': 'Offline',
  'ai.problemSummary': 'Problem summary',
  'ai.rootCause': 'Possible root cause',
  'ai.impact': 'Impact',
  'ai.solutions': 'Recommended actions',

  // Report panel
  'report.title': 'Export report',
  'report.description':
    'Generate a full report — suitable for submitting to the customer or the ISP.',
  'report.savedTo': 'Saved to: {path}',
  'report.exportFailed': 'Export cancelled or failed.',

  // Progress (by diagnostic stage / speed sub-phase)
  'progress.system': 'Scanning system',
  'progress.connectivity': 'Checking connectivity',
  'progress.dns': 'Analyzing DNS',
  'progress.packetLoss': 'Measuring packet loss',
  'progress.traceroute': 'Tracing the network path',
  'progress.speedTest': 'Running speed test',
  'progress.health': 'Computing health score',
  'progress.done': 'Done',
  'progress.speed.latency': 'Measuring latency',
  'progress.speed.download': 'Measuring download speed',
  'progress.speed.upload': 'Measuring upload speed',

  // Detected issues (titles may interpolate measured values)
  'issue.no-internet.title': 'No internet connection',
  'issue.no-internet.desc':
    'Ping to the public host failed — the internet connection appears to be down.',
  'issue.gateway-unreachable.title': 'Router/gateway unreachable',
  'issue.gateway-unreachable.desc':
    'Ping to the local gateway failed — there may be a problem with the router or local connection.',
  'issue.packet-loss.title': 'Packet loss {lossPercent}%',
  'issue.packet-loss.desc':
    'Significant packet loss detected — video calls and gaming may be disrupted.',
  'issue.high-latency.title': 'High latency ({avgMs}ms)',
  'issue.high-latency.desc':
    'Average latency is high — browsing and real-time apps may feel slow.',
  'issue.dns-unreachable.title': 'DNS resolution problem',
  'issue.dns-unreachable.desc':
    '{count} DNS server(s) did not respond — name resolution may fail.',
  'issue.slow-dns.title': 'Slow DNS resolution',
  'issue.slow-dns.desc':
    'Average DNS resolution time is {avgResolveMs}ms — consider using a faster DNS.',
  'issue.low-bandwidth.title': 'Low download speed ({downloadMbps} Mbps)',
  'issue.low-bandwidth.desc':
    'Download speed is lower than expected — check your plan or line quality.',

  // Report document
  'report.doc.title': 'NetDoctor AI — Network Diagnostic Report',
  'report.na': 'N/A',
  'report.unknown': 'Unknown',
  'report.none': 'None',
  'report.notMeasured': 'Not measured',
  'report.section.summary': '1. Report Summary',
  'report.section.network': '2. Network Information',
  'report.section.testResults': '3. Test Results',
  'report.section.issues': '4. Detected Issues',
  'report.section.ai': '5. AI Analysis',
  'report.section.solutions': '6. Recommended Actions',
  'report.section.healthScore': '7. Network Health Score',
  'report.section.generatedAt': '8. Generated At',
  'report.field.overallHealth': 'Overall health score: {score}/100 ({grade})',
  'report.field.internetConnection': 'Internet connection: {value}',
  'report.field.issueCount': 'Detected issues: {count}',
  'report.field.hostname': 'Hostname: {value}',
  'report.field.localIp': 'Local IP: {value}',
  'report.field.gatewayIp': 'Gateway IP: {value}',
  'report.field.publicIp': 'Public IP: {value}',
  'report.field.macAddress': 'MAC address: {value}',
  'report.field.dnsServers': 'DNS servers: {value}',
  'report.field.os': 'Operating system: {distro} {release} ({arch})',
  'report.field.cpu': 'CPU: {brand} ({cores} cores)',
  'report.field.ram': 'RAM: {gb} GB',
  'report.field.gatewayPingLine': 'Gateway ping: {alive}, avg {avg}',
  'report.field.internetPingLine': 'Internet ping: {alive}, avg {avg}',
  'report.field.httpHttpsLine': 'HTTP: {http}, HTTPS: {https}',
  'report.field.packetLossLine': 'Packet loss: {loss}, jitter {jitter}',
  'report.field.dnsResolveLine': 'DNS avg resolution: {value}',
  'report.field.downloadLine': 'Download speed: {value}',
  'report.field.uploadLine': 'Upload speed: {value}',
  'report.field.tracerouteHops': 'Traceroute hop count: {count}',
  'report.field.problemSummary': 'Problem summary: {value}',
  'report.field.rootCause': 'Possible root cause: {value}',
  'report.field.impact': 'Impact: {value}',
  'report.field.priorityLevel': 'Priority level: {value}',
  'report.field.confidenceScore': 'Confidence score: {value}%',
  'report.field.overall': 'Overall: {score}/100 ({grade})',
  'report.field.componentScore': '{label}: {value}',
  'report.empty.issues': 'No issues detected.',
  'report.empty.ai': 'AI analysis is not available.',
  'report.empty.solutions': 'No specific actions.',
  'report.generatedBy': 'Generated by: {label}',
  'report.unsupportedFormat': 'Unsupported report format: {format}',
  'report.saveCancelled': 'Report save was cancelled.',

  // AI offline fallback text
  'aifb.summary.none':
    'Network health score {score}/100 — no significant issues were detected.',
  'aifb.summary.issues':
    '{critical} critical and {warnings} warning issue(s) detected. Health score {score}/100.',
  'aifb.rootCause.internet': 'The internet uplink or ISP connection is down.',
  'aifb.rootCause.gateway': 'There is a problem with the local router or gateway.',
  'aifb.rootCause.packetLoss': 'Packet loss due to line quality or congestion.',
  'aifb.rootCause.dns': 'A DNS server configuration or availability problem.',
  'aifb.rootCause.none':
    'No specific root cause was detected automatically; measurements are within normal range.',
  'aifb.impact.critical': 'Internet use is severely disrupted.',
  'aifb.impact.high': 'Browsing, calls and streaming are noticeably disrupted.',
  'aifb.impact.medium': 'Some services may feel occasionally slow.',
  'aifb.impact.low': 'Little to no impact on the user.',
  'aifb.solution.internet': 'Restart the modem/router and check the ISP line status.',
  'aifb.solution.gateway': 'Check the router power and cable connections.',
  'aifb.solution.packetLoss':
    'Inspect cables/connectors and use Ethernet instead of Wi‑Fi where possible.',
  'aifb.solution.dns': 'Try using 1.1.1.1 or 8.8.8.8 as your DNS.',
  'aifb.solution.speed': 'Confirm your plan speed and line quality with the ISP.',
  'aifb.solution.none': 'No action is needed right now; re-test periodically.',

  // AI prompt scaffolding (sent to the model)
  'aiprompt.system': [
    'You are an experienced network diagnostics expert.',
    'You will be given the results of a network test.',
    'Your entire answer MUST be in English.',
    'Return only a valid JSON object with exactly the following keys, nothing else:',
    '{',
    '  "problemSummaryBn": string,',
    '  "rootCauseBn": string,',
    '  "impactBn": string,',
    '  "solutionsBn": string[],',
    '  "priority": "low" | "medium" | "high" | "critical",',
    '  "confidence": number (0 to 1)',
    '}',
    'Do not assume anything beyond the provided measurements.'
  ].join('\n'),
  'aiprompt.user': 'Analyze the following network test results:',
  'aiprompt.fact.health': 'Health score: {score}/100 ({grade})',
  'aiprompt.fact.internet': 'Internet ping: alive={alive}, avg={avg}ms, loss={loss}%',
  'aiprompt.fact.gateway': 'Gateway: alive={alive}',
  'aiprompt.fact.httpHttps': 'HTTP={http}, HTTPS={https}',
  'aiprompt.fact.packetLoss': 'Packet loss: {loss}%, jitter={jitter}ms',
  'aiprompt.fact.dns': 'DNS avg resolution: {value}ms, server count={count}',
  'aiprompt.fact.speed': 'Speed: available={available}, download={download}Mbps, upload={upload}Mbps',
  'aiprompt.fact.issuesHeader': 'Detected issues:',
  'aiprompt.fact.noIssues': 'No issues were detected automatically.'
} as const

export type MessageKey = keyof typeof en

const bn: Record<MessageKey, string> = {
  // App shell / navigation
  'app.name': 'NetDoctor AI',
  'app.loading': 'লোড হচ্ছে…',
  'app.footer': 'স্থানীয় ডায়াগনস্টিক · কোনো ডেটা সংরক্ষিত হয় না',
  'nav.dashboard': 'ড্যাশবোর্ড',
  'nav.diagnostics': 'ডায়াগনস্টিক',
  'lang.label': 'ভাষা',
  'lang.en': 'English',
  'lang.bn': 'বাংলা',

  // Common
  'common.yes': 'হ্যাঁ',
  'common.no': 'না',

  // Dashboard
  'dashboard.title': 'ড্যাশবোর্ড',
  'dashboard.subtitle': 'নেটওয়ার্ক স্বাস্থ্যের সারসংক্ষেপ',
  'dashboard.runButton': 'ডায়াগনস্টিক চালান',
  'dashboard.empty': 'এখনো কোনো ডায়াগনস্টিক চালানো হয়নি। শুরু করতে “ডায়াগনস্টিক চালান” ক্লিক করুন।',
  'dashboard.healthScore': 'নেটওয়ার্ক স্বাস্থ্য স্কোর',
  'status.internet': 'ইন্টারনেট',
  'status.router': 'রাউটার',
  'status.https': 'HTTPS',
  'status.dns': 'DNS',
  'status.active': 'সক্রিয়',
  'status.inactive': 'নিষ্ক্রিয়',

  // Diagnostics page
  'diagnostics.title': 'ডায়াগনস্টিক',
  'diagnostics.subtitle': 'সম্পূর্ণ নেটওয়ার্ক পরীক্ষা চালান ও বিশ্লেষণ করুন',
  'diagnostics.running': 'চলছে…',
  'diagnostics.startButton': 'পরীক্ষা শুরু করুন',
  'diagnostics.failed': 'পরীক্ষা ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
  'diagnostics.empty': 'পরীক্ষা শুরু করতে উপরের বোতামে ক্লিক করুন।',

  // Results view
  'results.connectivity': 'সংযোগ',
  'results.gatewayPing': 'গেটওয়ে পিং',
  'results.internetPing': 'ইন্টারনেট পিং',
  'results.httpHttps': 'HTTP / HTTPS',
  'results.latencyPacketLoss': 'লেটেন্সি ও প্যাকেট লস',
  'results.packetLoss': 'প্যাকেট লস',
  'results.avgLatency': 'গড় লেটেন্সি',
  'results.jitter': 'জিটার',
  'results.dns': 'ডিএনএস',
  'results.avgResolution': 'গড় রেজোলিউশন',
  'results.noResponse': 'সাড়া নেই',
  'results.speedTest': 'গতি পরীক্ষা',
  'results.download': 'ডাউনলোড',
  'results.upload': 'আপলোড',
  'results.ping': 'পিং',
  'results.speedUnavailable': 'গতি পরীক্ষা উপলব্ধ নয়।',
  'results.healthComponents': 'স্বাস্থ্য উপাদান',
  'results.notMeasured': 'পরিমাপ হয়নি',
  'results.detectedIssues': 'সনাক্তকৃত সমস্যা ({count})',
  'results.noIssues': 'কোনো সমস্যা শনাক্ত হয়নি।',

  // Health component labels
  'health.connectivity': 'সংযোগ',
  'health.dns': 'ডিএনএস',
  'health.packetLoss': 'প্যাকেট লস',
  'health.latency': 'লেটেন্সি',
  'health.speed': 'গতি',

  // Health grades
  'grade.excellent': 'চমৎকার',
  'grade.good': 'ভালো',
  'grade.fair': 'মোটামুটি',
  'grade.poor': 'দুর্বল',
  'grade.critical': 'সংকটাপন্ন',

  // Severity
  'severity.info': 'তথ্য',
  'severity.warning': 'সতর্কতা',
  'severity.critical': 'গুরুতর',

  // Priority
  'priority.low': 'নিম্ন',
  'priority.medium': 'মাঝারি',
  'priority.high': 'উচ্চ',
  'priority.critical': 'সর্বোচ্চ',

  // AI panel
  'ai.title': 'AI বিশ্লেষণ',
  'ai.analyzing': 'বিশ্লেষণ হচ্ছে…',
  'ai.analyzeButton': 'বিশ্লেষণ করুন',
  'ai.apiKeyPlaceholder': 'OpenAI API কী (ঐচ্ছিক)',
  'ai.apiKeyHelper': 'কী না দিলে অফলাইন বিশ্লেষণ ব্যবহৃত হবে',
  'ai.failed': 'বিশ্লেষণ ব্যর্থ হয়েছে — অফলাইন বিশ্লেষণ চেষ্টা করুন।',
  'ai.priority': 'অগ্রাধিকার',
  'ai.confidence': 'কনফিডেন্স',
  'ai.offline': 'অফলাইন',
  'ai.problemSummary': 'সমস্যা সারাংশ',
  'ai.rootCause': 'সম্ভাব্য মূল কারণ',
  'ai.impact': 'প্রভাব',
  'ai.solutions': 'করণীয় সমাধান',

  // Report panel
  'report.title': 'রিপোর্ট রপ্তানি',
  'report.description': 'সম্পূর্ণ রিপোর্ট তৈরি করুন — গ্রাহক বা আইএসপির কাছে জমা দেওয়ার উপযোগী।',
  'report.savedTo': 'সংরক্ষিত হয়েছে: {path}',
  'report.exportFailed': 'রপ্তানি বাতিল বা ব্যর্থ হয়েছে।',

  // Progress
  'progress.system': 'সিস্টেম স্ক্যান হচ্ছে',
  'progress.connectivity': 'সংযোগ পরীক্ষা হচ্ছে',
  'progress.dns': 'ডিএনএস বিশ্লেষণ হচ্ছে',
  'progress.packetLoss': 'প্যাকেট লস পরিমাপ হচ্ছে',
  'progress.traceroute': 'নেটওয়ার্ক পথ অনুসন্ধান হচ্ছে',
  'progress.speedTest': 'গতি পরীক্ষা চলছে',
  'progress.health': 'স্বাস্থ্য স্কোর গণনা হচ্ছে',
  'progress.done': 'সম্পন্ন',
  'progress.speed.latency': 'লেটেন্সি মাপা হচ্ছে',
  'progress.speed.download': 'ডাউনলোড গতি মাপা হচ্ছে',
  'progress.speed.upload': 'আপলোড গতি মাপা হচ্ছে',

  // Detected issues
  'issue.no-internet.title': 'ইন্টারনেট সংযোগ নেই',
  'issue.no-internet.desc': 'পাবলিক হোস্টে পিং ব্যর্থ হয়েছে — ইন্টারনেট সংযোগ বিচ্ছিন্ন বলে মনে হচ্ছে।',
  'issue.gateway-unreachable.title': 'রাউটার/গেটওয়েতে পৌঁছানো যাচ্ছে না',
  'issue.gateway-unreachable.desc': 'লোকাল গেটওয়েতে পিং ব্যর্থ — রাউটার বা স্থানীয় সংযোগে সমস্যা থাকতে পারে।',
  'issue.packet-loss.title': 'প্যাকেট লস {lossPercent}%',
  'issue.packet-loss.desc': 'উল্লেখযোগ্য প্যাকেট লস শনাক্ত হয়েছে — ভিডিও কল ও গেমিংয়ে বিঘ্ন ঘটতে পারে।',
  'issue.high-latency.title': 'উচ্চ লেটেন্সি ({avgMs}ms)',
  'issue.high-latency.desc': 'গড় লেটেন্সি বেশি — ব্রাউজিং ও রিয়েল-টাইম অ্যাপ ধীর মনে হতে পারে।',
  'issue.dns-unreachable.title': 'ডিএনএস রেজোলিউশন সমস্যা',
  'issue.dns-unreachable.desc': '{count}টি ডিএনএস সার্ভার সাড়া দেয়নি — নাম রেজোলিউশন ব্যর্থ হতে পারে।',
  'issue.slow-dns.title': 'ডিএনএস রেজোলিউশন ধীর',
  'issue.slow-dns.desc': 'গড় ডিএনএস রেজোলিউশন সময় {avgResolveMs}ms — দ্রুততর ডিএনএস ব্যবহার বিবেচনা করুন।',
  'issue.low-bandwidth.title': 'ডাউনলোড গতি কম ({downloadMbps} Mbps)',
  'issue.low-bandwidth.desc': 'ডাউনলোড গতি প্রত্যাশার চেয়ে কম — প্ল্যান বা লাইন কোয়ালিটি যাচাই করুন।',

  // Report document
  'report.doc.title': 'NetDoctor AI — নেটওয়ার্ক ডায়াগনস্টিক রিপোর্ট',
  'report.na': 'প্রযোজ্য নয়',
  'report.unknown': 'অজানা',
  'report.none': 'নেই',
  'report.notMeasured': 'পরিমাপ করা হয়নি',
  'report.section.summary': '১. রিপোর্ট সারাংশ',
  'report.section.network': '২. নেটওয়ার্ক তথ্য',
  'report.section.testResults': '৩. পরীক্ষার ফলাফল',
  'report.section.issues': '৪. সনাক্তকৃত সমস্যা',
  'report.section.ai': '৫. AI বিশ্লেষণ',
  'report.section.solutions': '৬. করণীয় সমাধান',
  'report.section.healthScore': '৭. নেটওয়ার্ক স্বাস্থ্য স্কোর',
  'report.section.generatedAt': '৮. প্রস্তুতের সময়',
  'report.field.overallHealth': 'সামগ্রিক স্বাস্থ্য স্কোর: {score}/100 ({grade})',
  'report.field.internetConnection': 'ইন্টারনেট সংযোগ: {value}',
  'report.field.issueCount': 'শনাক্তকৃত সমস্যা: {count}টি',
  'report.field.hostname': 'হোস্টনেম: {value}',
  'report.field.localIp': 'লোকাল আইপি: {value}',
  'report.field.gatewayIp': 'গেটওয়ে আইপি: {value}',
  'report.field.publicIp': 'পাবলিক আইপি: {value}',
  'report.field.macAddress': 'ম্যাক ঠিকানা: {value}',
  'report.field.dnsServers': 'ডিএনএস সার্ভার: {value}',
  'report.field.os': 'অপারেটিং সিস্টেম: {distro} {release} ({arch})',
  'report.field.cpu': 'সিপিইউ: {brand} ({cores} কোর)',
  'report.field.ram': 'র‍্যাম: {gb} GB',
  'report.field.gatewayPingLine': 'গেটওয়ে পিং: {alive}, গড় {avg}',
  'report.field.internetPingLine': 'ইন্টারনেট পিং: {alive}, গড় {avg}',
  'report.field.httpHttpsLine': 'HTTP: {http}, HTTPS: {https}',
  'report.field.packetLossLine': 'প্যাকেট লস: {loss}, জিটার {jitter}',
  'report.field.dnsResolveLine': 'ডিএনএস গড় রেজোলিউশন: {value}',
  'report.field.downloadLine': 'ডাউনলোড গতি: {value}',
  'report.field.uploadLine': 'আপলোড গতি: {value}',
  'report.field.tracerouteHops': 'ট্রেসরুট হপ সংখ্যা: {count}',
  'report.field.problemSummary': 'সমস্যা সারাংশ: {value}',
  'report.field.rootCause': 'সম্ভাব্য মূল কারণ: {value}',
  'report.field.impact': 'প্রভাব: {value}',
  'report.field.priorityLevel': 'অগ্রাধিকার স্তর: {value}',
  'report.field.confidenceScore': 'কনফিডেন্স স্কোর: {value}%',
  'report.field.overall': 'সামগ্রিক: {score}/100 ({grade})',
  'report.field.componentScore': '{label}: {value}',
  'report.empty.issues': 'কোনো সমস্যা শনাক্ত হয়নি।',
  'report.empty.ai': 'AI বিশ্লেষণ পাওয়া যায়নি।',
  'report.empty.solutions': 'কোনো নির্দিষ্ট সমাধান নেই।',
  'report.generatedBy': 'প্রস্তুতের সময়: {label}',
  'report.unsupportedFormat': 'অসমর্থিত রিপোর্ট ফরম্যাট: {format}',
  'report.saveCancelled': 'রিপোর্ট সংরক্ষণ বাতিল করা হয়েছে।',

  // AI offline fallback text
  'aifb.summary.none': 'নেটওয়ার্ক স্বাস্থ্য স্কোর {score}/100 — কোনো উল্লেখযোগ্য সমস্যা শনাক্ত হয়নি।',
  'aifb.summary.issues':
    '{critical}টি গুরুতর এবং {warnings}টি সতর্কতামূলক সমস্যা শনাক্ত হয়েছে। স্বাস্থ্য স্কোর {score}/100।',
  'aifb.rootCause.internet': 'ইন্টারনেট আপলিঙ্ক বা আইএসপি সংযোগ বিচ্ছিন্ন।',
  'aifb.rootCause.gateway': 'স্থানীয় রাউটার বা গেটওয়ে সংযোগে সমস্যা।',
  'aifb.rootCause.packetLoss': 'লাইন কোয়ালিটি বা ভিড়জনিত কারণে প্যাকেট লস।',
  'aifb.rootCause.dns': 'ডিএনএস সার্ভার কনফিগারেশন বা প্রাপ্যতার সমস্যা।',
  'aifb.rootCause.none': 'নির্দিষ্ট কোনো মূল কারণ স্বয়ংক্রিয়ভাবে শনাক্ত হয়নি; পরিমাপ স্বাভাবিক সীমার মধ্যে।',
  'aifb.impact.critical': 'ইন্টারনেট ব্যবহার মারাত্মকভাবে ব্যাহত হচ্ছে।',
  'aifb.impact.high': 'ব্রাউজিং, কল ও স্ট্রিমিংয়ে লক্ষণীয় বিঘ্ন ঘটছে।',
  'aifb.impact.medium': 'কিছু পরিষেবায় মাঝে মাঝে ধীরগতি অনুভূত হতে পারে।',
  'aifb.impact.low': 'ব্যবহারকারীর উপর সামান্য বা কোনো প্রভাব নেই।',
  'aifb.solution.internet': 'মডেম/রাউটার পুনরায় চালু করুন এবং আইএসপি লাইন স্ট্যাটাস যাচাই করুন।',
  'aifb.solution.gateway': 'রাউটারের পাওয়ার ও কেবল সংযোগ পরীক্ষা করুন।',
  'aifb.solution.packetLoss': 'তার/কানেক্টর পরীক্ষা করুন এবং সম্ভব হলে ওয়াইফাইয়ের বদলে ইথারনেট ব্যবহার করুন।',
  'aifb.solution.dns': 'ডিএনএস হিসেবে 1.1.1.1 বা 8.8.8.8 ব্যবহার করে দেখুন।',
  'aifb.solution.speed': 'আইএসপির সাথে আপনার প্ল্যানের গতি ও লাইন কোয়ালিটি নিশ্চিত করুন।',
  'aifb.solution.none': 'বর্তমানে কোনো পদক্ষেপ প্রয়োজন নেই; পর্যায়ক্রমে পুনরায় পরীক্ষা করুন।',

  // AI prompt scaffolding
  'aiprompt.system': [
    'আপনি একজন অভিজ্ঞ নেটওয়ার্ক ডায়াগনস্টিক বিশেষজ্ঞ।',
    'আপনাকে নেটওয়ার্ক পরীক্ষার ফলাফল দেওয়া হবে।',
    'আপনার সম্পূর্ণ উত্তর অবশ্যই বাংলায় হতে হবে।',
    'শুধুমাত্র নিচের কী সহ একটি বৈধ JSON অবজেক্ট প্রদান করুন, অন্য কোনো লেখা নয়:',
    '{',
    '  "problemSummaryBn": string,',
    '  "rootCauseBn": string,',
    '  "impactBn": string,',
    '  "solutionsBn": string[],',
    '  "priority": "low" | "medium" | "high" | "critical",',
    '  "confidence": number (0 থেকে 1)',
    '}',
    'প্রদত্ত পরিমাপের বাইরে কিছু অনুমান করবেন না।'
  ].join('\n'),
  'aiprompt.user': 'নিম্নলিখিত নেটওয়ার্ক পরীক্ষার ফলাফল বিশ্লেষণ করুন:',
  'aiprompt.fact.health': 'স্বাস্থ্য স্কোর: {score}/100 ({grade})',
  'aiprompt.fact.internet': 'ইন্টারনেট পিং: alive={alive}, গড়={avg}ms, লস={loss}%',
  'aiprompt.fact.gateway': 'গেটওয়ে: alive={alive}',
  'aiprompt.fact.httpHttps': 'HTTP={http}, HTTPS={https}',
  'aiprompt.fact.packetLoss': 'প্যাকেট লস: {loss}%, জিটার={jitter}ms',
  'aiprompt.fact.dns': 'ডিএনএস গড় রেজোলিউশন: {value}ms, সার্ভার সংখ্যা={count}',
  'aiprompt.fact.speed': 'গতি: available={available}, download={download}Mbps, upload={upload}Mbps',
  'aiprompt.fact.issuesHeader': 'শনাক্তকৃত সমস্যা:',
  'aiprompt.fact.noIssues': 'কোনো সমস্যা স্বয়ংক্রিয়ভাবে শনাক্ত হয়নি।'
}

const catalog: Record<Language, Record<MessageKey, string>> = { en, bn }

/** Translate a key for the given language, interpolating `{param}` placeholders. */
export function translate(language: Language, key: MessageKey, params?: TranslateParams): string {
  const template = catalog[language]?.[key] ?? catalog[DEFAULT_LANGUAGE][key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
    name in params ? String(params[name]) : `{${name}}`
  )
}

/** Locale tag for `Date.toLocaleString` per language. */
export function dateLocale(language: Language): string {
  return language === 'bn' ? 'bn-BD' : 'en-US'
}

/** Localized title for a detected issue (keyed by its stable `id`). */
export function issueTitle(
  language: Language,
  issue: { readonly id: string; readonly params?: TranslateParams }
): string {
  return translate(language, `issue.${issue.id}.title` as MessageKey, issue.params)
}

/** Localized description for a detected issue (keyed by its stable `id`). */
export function issueDescription(
  language: Language,
  issue: { readonly id: string; readonly params?: TranslateParams }
): string {
  return translate(language, `issue.${issue.id}.desc` as MessageKey, issue.params)
}
