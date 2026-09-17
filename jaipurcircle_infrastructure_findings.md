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

**One real anomaly, flagged not fixed:** `swift-processor` is the only
function with `verify_jwt: true`, and — separately — it has **no local
source anywhere in `supabase/functions/`** and **zero references anywhere
in this codebase** (checked directly, `grep -rln "swift-processor"` across
the whole repo returns nothing). Same pattern as `publication-ssr` was
before this: a function deployed and live on the project with no trace in
version control. Unlike `publication-ssr` (which serves real, confirmed-live
traffic), what `swift-processor` does, who deployed it, or whether it's
still needed is genuinely unknown from what's checkable here — not
investigated further, flagged as an open question.

**What this means going forward:** any function newly created (not just
redeployed — redeploying an existing function via `supabase functions
deploy <name>` does not reset this setting, confirmed empirically across
many redeploys this session) will default to `verify_jwt: true` and 401
silently the same way `category-ssr` did, if it's meant to be called by an
unauthenticated proxy. Check this setting explicitly for any new
public-facing function before assuming a "successful" deploy means it
actually works.
