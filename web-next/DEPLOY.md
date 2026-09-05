# Strangler deploy runbook — locality pilot

This is the first route-flip of the SPA → Next.js migration. It serves `/jaipur/:slug`
(locality pages) from the new Next.js app in `web-next/`, while **everything else stays on the
live Vite app + edge SSR**. Blast radius is limited to locality pages.

## How the flip works

The live app's `vercel.json` owns the domain (`jaipurcircle.com`). Two routes there proxy to the
new app's Vercel deployment (legacy `routes` already proxy externally, e.g. `/api/rest/v1/*`):

| Route | Goes to | Why |
|-------|---------|-----|
| `^/jaipur/([^/]+)/?$` | `web-next` `/jaipur/$1` | the migrated locality pages |
| `^/_next/(.*)$` | `web-next` `/_next/$1` | so the new app's CSS/JS assets resolve on the main domain |
| `^/jaipur/(localities\|zones)/?$` | old `jaipur-proxy` | reserved words — preserved exactly as today |
| `/jaipur`, `/jaipur/all`, `/jaipur/:a/:b` | old (hub / cluster) | not migrated yet |

Both new-app routes currently point at the placeholder `REPLACE-WITH-WEB-NEXT-URL.vercel.app`.

## ⚠️ Order matters — do NOT push the vercel.json change until web-next is live

If the old app is deployed with the placeholder (or a URL that isn't live yet), **every locality
page breaks on production**. Follow this order:

### 1. Deploy web-next as its own Vercel project
- New Vercel project, **Root Directory = `web-next`**, Framework = Next.js (auto-detected).
- Env vars (Project Settings → Environment Variables):
  - `SUPABASE_URL` = `https://rbenryjgtbrjvqvxbigq.supabase.co`
  - `SUPABASE_ANON_KEY` = (anon/publishable key from `web-next/.env.local`)
  - `SITE_ORIGIN` = `https://www.jaipurcircle.com`
  - *(optional)* `SUPABASE_SERVICE_ROLE_KEY` — only if RLS ever blocks a build read; the anon key
    is sufficient today.
- Deploy. Note the **stable production URL**, e.g. `https://<project>.vercel.app` (this alias always
  points at the latest production deploy — use it, not a per-deploy hash URL).

### 2. Smoke-test the new app in isolation (before wiring the domain)
```
curl -sI  https://<project>.vercel.app/jaipur/c-scheme        # expect 200
curl -s   https://<project>.vercel.app/jaipur/c-scheme | grep -o '<title>[^<]*</title>'
curl -sI  https://<project>.vercel.app/jaipur/does-not-exist  # expect 404
```

### 3. Wire the domain — replace the placeholder in the live vercel.json
In `/Users/praveenyadav/jaipurcircle/vercel.json`, replace **both** occurrences of
`REPLACE-WITH-WEB-NEXT-URL.vercel.app` with your `<project>.vercel.app` host, then deploy the main app.

### 4. Verify the flip on the real domain
```
curl -sI https://www.jaipurcircle.com/jaipur/c-scheme               # 200, served from web-next
curl -s  https://www.jaipurcircle.com/_next/static/ -o /dev/null -w "%{http_code}\n"  # assets resolve
curl -sI https://www.jaipurcircle.com/jaipur                        # 200, still the old hub
curl -sI https://www.jaipurcircle.com/jaipur/c-scheme/restaurants   # 200, still the old cluster
```
Confirm a locality page renders **with styling** (proves `/_next` assets proxy correctly) and that
`view-source` contains the JSON-LD.

## Rollback (instant)
Revert the two `vercel.json` route changes (point `/jaipur/([^/]+)` back to `/api/jaipur-proxy?slug=$1`
and remove the `/_next` route) and redeploy the main app. The old edge SSR is untouched, so this is a
one-commit revert with no data or backend changes.

## Notes / follow-ups
- **Perf:** direct edge proxy (no serverless double-hop), so the new app's ISR/CDN caching is
  preserved. Later, consider `next/image` (pilot uses `<img loading=lazy>`) and on-demand
  `revalidatePath` via a Supabase webhook on content edits.
- **Next tier:** merchants — port `merchant-ssr`, reuse the existing reviews UI, then flip
  `^/merchant/([^/]+)` the same way.
