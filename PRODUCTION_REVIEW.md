# Production readiness review

Review date: 2026-11-11. This is a targeted code and regression-test review, not a penetration test or a guarantee that the entire application is vulnerability-free.

## Addressed

- **Archive inflation budgets:** ZIP-declared sizes remain an early rejection check; JSON extraction now checks actual streamed bytes before retaining decoded output. A shared per-archive high-water budget prevents session rereads from being charged repeatedly. Forged-size regression coverage was added.
- **Form merge complexity:** Species-addition form matching now uses indexed lookups rather than repeated linear searches, with processing checkpoints and a work budget.
- **Trainer upload compatibility:** Upload validation accepts trainer paths across namespaces using the same nesting rules as the parser.
- **External lookup availability:** Pokédex requests have a 15-second timeout, including response-body reading, and abort on unmount. HTTP 404, rate limiting, and service failures have distinct messages.
- **Cache freshness:** Cached species names display immediately and refresh in the background; failed refreshes retain usable cached names.
- **Deployment gates:** Unit tests and desktop/mobile browser tests run before the production artifact is uploaded.
- **Homepage layout:** Storage/privacy information uses two readable columns at desktop widths rather than a narrow text block inside a full-width empty panel.

## Remaining production considerations

### Dependency advisories

The review's `npm audit --omit=dev --json` reported advisories in the installed dependency tree, including a critical classification for Next.js 15.3.9. The audit offered Next.js 15.5.29 as a non-major remediation at review time. Upgrade Next.js and its matching ESLint configuration together, regenerate the lockfile, rerun the audit, and validate the static export. Package versions were not changed in this pass.

Severity must be evaluated against deployment: this project publishes a static `out` directory, not a production Next.js server, and image optimization is disabled. No exploit path for the reported server-specific advisories was demonstrated. Reassess before switching to server hosting. Static hosting does not eliminate build-time or development dependency risk.

### Main-thread resource isolation

Streamed output limits prevent retaining oversized extracted JSON, but they do not make all processing interruptible. JSZip loading, a synchronous inflate call already in progress, and JSON parsing can still occupy the main thread. JSZip has no public destroy API; cancellation uses immediate pause and feature-detected worker teardown. A dedicated, terminable Web Worker remains the stronger isolation boundary for untrusted archives.

Upload validation is structural and does not inflate every entry before persistence. Extraction limits protect subsequent reads rather than proving every stored archive is safe to process in advance.

### External service recovery and trust

A failed initial species-list fetch now ends with an error instead of loading indefinitely, but it does not offer an in-place retry action. Reloading/remounting retries. A retry control would improve recovery further.

PokéAPI, remote images, the tutorial video, and Giscus remain external availability/privacy dependencies. Giscus intentionally executes third-party JavaScript. Host-level security headers/CSP should be assessed for the actual deployment platform and tested against these integrations; this review did not introduce an untested restrictive policy.

## Checks without confirmed findings

- Reviewed active persistence paths use atomic transactions for archive metadata/blob writes, deduplication/quota accounting, report commits, and purges, with stale-commit guards.
- No `dangerouslySetInnerHTML` sink or demonstrated exploitable XSS was found in the reviewed source paths. Declared Markdown dependencies alone do not establish unsafe HTML rendering.
- Browser tests cover desktop and mobile workflows, including request ordering and the newly added network failure/cache cases. Passing functional tests is not a substitute for visual accessibility testing or a security assessment.
