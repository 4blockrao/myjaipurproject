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

---

## `web-next` — real codebase, not just the dormant `vercel.json` lines (2026-09-17)

This is a **finding, not a decision** — whether to resume, finish, or
permanently defer this migration is still open and is Prav's call. Nothing
below implies that call has been made.

The placeholder `REPLACE-WITH-WEB-NEXT-URL.vercel.app` lines that caused the
2026-09-17 production outage (documented elsewhere in this session's
history) turned out to have real code behind them, investigated directly:

- **Real Next.js 16.2.10 / App Router codebase**, committed in a single
  commit (`ae08d68`, 2026-07-12). Also found to exist as a live, uncommitted
  working directory with a build output (`.next/`) dated 2026-08-15 — over a
  month after the last commit — meaning someone ran it locally after the
  commit and never pushed anything further.
- **One working route**: `/jaipur/[slug]` — locality pages only, with
  genuine ISR (Incremental Static Regeneration). Nothing for `/guide/*`,
  `/merchant/*`, or anything else, despite the project's own `DEPLOY.md`
  explicitly naming merchants as the planned next tier — that step was
  never started.
- **Blocked only by one missing dependency**: `@supabase/supabase-js` was
  never added to `package.json` despite being imported directly in
  `src/lib/supabase-server.ts`. Adding it (`^2.45.4`) and running
  `npm install && npm run build` was sufficient on its own — no further
  errors surfaced. Clean TypeScript, clean compile, all 107 real locality
  pages statically generated with working 1-hour-revalidate ISR. This fix is
  applied locally (`web-next/package.json` + `package-lock.json`) but
  **deliberately left uncommitted** pending the resume/defer decision.
- **8 dependency vulnerabilities surfaced on `npm install`** (1 critical, 6
  high, 1 moderate) — not investigated or addressed, just noted as a real
  fact about this dependency tree's current state.
- **The project's own `DEPLOY.md` already documented the exact risk that
  caused the outage**, in bold: *"Order matters — do NOT push the
  vercel.json change until web-next is live... every locality page breaks
  on production"* if the documented 4-step deploy order isn't followed. The
  outage happened because that order wasn't followed (the `vercel.json`
  lines were bundled into an unrelated commit), not because the risk was
  unknown or undocumented.

**Net finding**: this is not a stalled-but-complete migration, and it's not
an empty routing rule with nothing behind it either. It's a single-route
pilot, genuinely close to deployable for that one route, abandoned mid-pilot
before the documented next step (merchants) was ever started.

---

## `/artists/:slug` returns 404 for real, existing artist rows (2026-09-17)

Discovered as a side effect of the proxy-layer cache-control spot-check, not
by investigating artists directly — flagging as a separate, real finding
rather than chasing it further under that task's scope.

**What was observed:** 5 real slugs pulled directly from the live `artists`
table via service-role SQL (`vikas-kush-sharma`, `sonu-nigam`, `karthik`,
`pranit-more`, `rahul-shah`) all returned a live 404 through
`/artists/:slug` → `api/artist-proxy.ts` → `artist-ssr`. `artist-ssr`'s query
is a simple, unfiltered `.eq("slug", slug).maybeSingle()` against the same
table the slugs were pulled from — nothing in the visible query logic
explains a miss.

**What's confirmed working correctly, so this isn't the proxy fix's bug:**
`x-artist-proxy: true` on the response proves the request reaches the fixed
proxy code, and the real `no-store` from `artist-ssr`'s not-found path is
forwarded correctly, not overridden — the forwarding mechanism itself is
proven sound on this exact request. The defect is upstream of the proxy.

**Leading hypothesis, not verified:** a data-matching mismatch between the
`artist_slug` field used elsewhere (e.g. on `events`) and whatever
table/column/key `artist-ssr` is actually resolving against — possibly a
different slug format, a different table, or a join that isn't matching real
rows. Not investigated further here.

**Status:** a real, currently-broken page type. No urgency implied — logging
it so it doesn't get lost, not because it's blocking anything else. Worth a
dedicated look later.

---

## Lovable's "Upgrade to TanStack Start" does not apply to this project's SSR problem (2026-09-17)

Investigated in response to a direct question of whether Lovable's own
TanStack Start upgrade feature was a viable third option alongside the
hand-rolled SSR/proxy architecture this session has been building.
**Conclusion: it is confirmed inapplicable, and is a potential active
hazard rather than a neutral non-option if GitHub sync is still live.**

**What the upgrade does, per Lovable's own docs
(`docs.lovable.dev/features/upgrade-to-tanstack-start`):** rewrites the
project's page/routing structure from React+Vite into TanStack Start,
carries over theme/styling/metadata, and moves "internal backend code that
only your own app uses" into the new template. External-integration backend
code and the database are explicitly left untouched. 10–35 credits, any
plan, reversible via version history.

**Why it doesn't reach this project's actual SSR layer:** everything this
whole engagement has built — `locality-ssr`/`merchant-ssr`/`category-ssr`/
etc., the Vercel proxy layer (`api/*-proxy.ts`), the hand-built
`vercel.json` routing table, the author-role RBAC and RLS work — was built
through this Claude Code session directly against the Supabase CLI/
Management API/GitHub Actions, never through Lovable's editor or its native
Supabase integration. Checked precisely via commit authorship, not just
commit-message grepping (an earlier pass grepping messages for "Lovable"
undercounted this — the real signal is the `gpt-engineer-app[bot]` GitHub
App identity Lovable's editor commits through):

- `gpt-engineer-app[bot]` authored **592 of 953 commits (62%)** all-time,
  first commit 2025-06-21, **last commit 2026-04-26**.
- **Zero bot commits in the 144 days since** (through 2026-09-17), despite
  953 total commits in the repo and very heavy, continuous engineering
  activity across that entire window — including 100% of the SSR/proxy/RLS
  work this session and prior sessions this engagement covers.

Lovable's "internal backend code... moves into the new template" clause
almost certainly refers to backend code created through Lovable's own
AI/chat tooling, which it has a record of. This project's SSR layer was
never created that way, so there's no reason to believe Lovable's upgrade
tooling is even aware it exists, let alone would preserve or migrate it.

**Why this is a potential hazard, not just a no-op:** this project's actual
deploy pipeline (GitHub sync → Vercel auto-deploy on push) matches exactly
the pattern Lovable's own external-hosting docs describe as their
recommended integration. If that GitHub sync is still live, running the
upgrade would push a full routing-structure rewrite as a real commit, which
the existing Vercel pipeline would auto-deploy straight to production — the
same pipeline that caused the 2026-04 `vercel.json` outage documented
elsewhere in this file. TanStack Start's own file-based server routing has
no concept of the hand-built `vercel.json` legacy-routes array or the
`api/*-proxy.ts` layer sitting in front of it; nothing in Lovable's docs
addresses reconciling with a custom `vercel.json`. Pushing this upgrade
without first fully untangling the custom routing table is a realistic path
to a second, larger-blast-radius outage.

**GitHub-sync status: unverified from this session, and that's a real
gap.** Checked what's checkable with the access available:

- Classic repo webhooks (`GET /repos/4blockrao/myjaipurproject/hooks`,
  checked with a token confirmed to have `admin: true` on the repo — an
  authoritative check for this specific mechanism): **empty, none
  registered.**
- GitHub App installations (the actual mechanism Lovable's sync would use,
  distinct from classic webhooks): **not checkable from here.**
  `GET /user/installations` returned `403 — You must authenticate with an
  access token authorized to a GitHub App`, meaning the CLI token in use
  this session is the wrong token type for this specific query, not that
  the answer is negative.
- Net: the commit-authorship silence (144 days, zero bot commits through
  heavy repo activity) is strong circumstantial evidence the sync is
  dormant or severed, but it is **not proof** — an installed-but-currently-
  unused GitHub App would produce the exact same silence as an uninstalled
  one, since either way no commits appear unless someone edits inside
  Lovable's UI. **A live Lovable dashboard check (Settings → GitHub, or
  Project actions) is the only way to get a definitive answer**, and that
  needs Prav directly — no further workaround exists from this session's
  access level.
