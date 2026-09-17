# JaipurCircle infrastructure findings

Durable notes on live project configuration that doesn't live in version
control — the kind of thing that's invisible until it silently breaks
something. First entry below; add more here as they're found, don't let
this rot into a one-off.

---

## `verify_jwt` setting on Edge Functions (2026-09-17)

**What it is:** a per-function, project-level Supabase setting controlling
whether the platform requires a valid `Authorization` JWT header before a
request ever reaches the function's own code. It is **not** stored in this
repo, not in `supabase/config.toml`, not in any deploy workflow — it lives
only in the live Supabase project (dashboard, or via the Management API).
New functions default to `verify_jwt: true`.

**Why this matters:** every SSR proxy in this codebase (`api/*-proxy.ts`,
fetching `locality-ssr`/`merchant-ssr`/`category-ssr`/etc.) sends **no**
`Authorization` header — by design, since these are public, unauthenticated
crawler-facing pages. If `verify_jwt` is `true` for a function those proxies
call, every request 401s with `UNAUTHORIZED_NO_AUTH_HEADER` before the
function's own code runs at all — no error in the function logs, no clue
from the deploy Action (which reports success regardless), just a silent
401 on the live URL. This exact failure hit `category-ssr` on its first
deploy (2026-09-17) — confirmed live, root-caused via the Management API,
fixed with a direct `verify_jwt: false` PATCH, not a redeploy.

**Full list, checked directly via the Management API
(`GET /v1/projects/rbenryjgtbrjvqvxbigq/functions`), 2026-09-17 — not
inferred, not assumed from which functions are in the CI deploy list:**

| Function | `verify_jwt` | Status |
|---|---|---|
| artist-ssr | `false` | ACTIVE |
| campaign-ssr | `false` | ACTIVE |
| category-ssr | `false` | ACTIVE |
| cluster-ssr | `false` | ACTIVE |
| deals-list-ssr | `false` | ACTIVE |
| deals-ssr | `false` | ACTIVE |
| enrich-event | `false` | ACTIVE |
| event-ssr | `false` | ACTIVE |
| events-list-ssr | `false` | ACTIVE |
| generate-news-article | `false` | ACTIVE |
| import-bookmyshow-events | `false` | ACTIVE |
| import-events-from-json | `false` | ACTIVE |
| locality-ssr | `false` | ACTIVE |
| merchant-ssr | `false` | ACTIVE |
| page-ssr | `false` | ACTIVE |
| publication-ssr | `false` | ACTIVE |
| register-for-event | `false` | ACTIVE |
| scrape-bookmyshow-events | `false` | ACTIVE |
| seed-cars-data | `false` | ACTIVE |
| seed-nightlife-article | `false` | ACTIVE |
| seed-tata-sierra-article | `false` | ACTIVE |
| sitemap | `false` | ACTIVE |
| sitemap-artists | `false` | ACTIVE |
| sitemap-stories | `false` | ACTIVE |
| stories-index-ssr | `false` | ACTIVE |
| story-ssr | `false` | ACTIVE |
| **swift-processor** | **`true`** | ACTIVE |
| validate-schema | `false` | ACTIVE |
| venue-ssr | `false` | ACTIVE |

**29 functions total live. 28 of 29 have `verify_jwt: false` — this is the
de facto standard for this project, not an exception for one or two
functions.** `category-ssr` now matches that standard.

**One real anomaly — `swift-processor`, investigated 2026-09-17:**

- Created `2026-04-25`, `version: 1`, `updated_at` identical to `created_at`
  — deployed exactly once, never modified since. Five months dormant as of
  this investigation.
- `verify_jwt: true` — the only function of the 29 with this set (see table
  above).
- **Zero references anywhere in this codebase** — checked exhaustively, not
  just an exact-name grep: no local source in `supabase/functions/`, no hit
  in `vercel.json`, no hit in any other edge function, and a broad substring
  search for both `swift` and `processor` separately (not just the exact
  hyphenated name) across every `.ts`/`.tsx`/`.js`/`.json`/`.yml` file in
  the repo. The only `swift` hits are the unrelated Maruti Suzuki Swift car
  model in the cars section; the only `processor` hits are build-artifact
  noise from the separate `web-next/` side-project.
- **Invocation history unavailable at this access level** — the logs query
  tool returned the same permission-denied error as every other MCP call
  against this project all session; a direct Management API analytics
  endpoint attempt returned 404 (wrong/nonexistent path). No way to
  determine recency, frequency, or callers from here.
- **Risk assessment: low.** It already defaults to the safe setting
  (`verify_jwt: true`, unlike the near-miss this whole entry started from),
  and nothing in this codebase calls it, so it isn't a live risk to anything
  currently working.
- **Still unexplained, and that's a real gap, not just tidiness.** What this
  function does, who deployed it, and whether it's still needed can't be
  determined from this session's access. Resolving it needs Prav to check
  the function's actual source and real invocation logs directly in the
  Supabase dashboard — not further investigation from here; this session
  has exhausted what's checkable with the current access level.

**What this means going forward:** any function newly created (not just
redeployed — redeploying an existing function via `supabase functions
deploy <name>` does not reset this setting, confirmed empirically across
many redeploys this session) will default to `verify_jwt: true` and 401
silently the same way `category-ssr` did, if it's meant to be called by an
unauthenticated proxy. Check this setting explicitly for any new
public-facing function before assuming a "successful" deploy means it
actually works.
