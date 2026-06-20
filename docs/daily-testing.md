# Daily testing system for clouts.com

Two layers, because some things can only be verified with a real browser
session and some things should never depend on a human remembering to run
them.

> **Setup note:** `.github/workflows/daily-smoke-test.yml` is included in
> this repo's working tree but could not be pushed automatically — GitHub
> rejects commits that add/modify files under `.github/workflows/` unless
> the pushing token has the `workflow` OAuth scope, which this
> environment's token doesn't have. The file is correct and ready; it
> just needs one manual step to land: either push it yourself with a
> token that has `workflow` scope, or copy its contents into a new file
> at that exact path via the GitHub web UI. Once it's in the repo, the
> "Why it's a plain script" section below and everything after it applies
> as written.

## Layer 1 — Automated daily smoke test (`scripts/daily-smoke-test.mjs`)

Runs automatically every day at 09:00 UTC via GitHub Actions
(`.github/workflows/daily-smoke-test.yml`), plus immediately after every
push to `main` (catches deploy regressions same-day instead of waiting for
tomorrow's cron). Also runnable on demand from the Actions tab
("Run workflow") or locally:

```bash
node scripts/daily-smoke-test.mjs
```

### What it covers
- **15 public pages** return 200 and contain their expected marker text
  (homepage, pricing, demo, agencies, all 4 blog posts, legal pages, all 3
  auth pages)
- **Infra contracts**: `/api/health` shape, `/sitemap.xml` has ≥10 URLs,
  `/robots.txt` disallows the right paths, custom 404 page renders
- **5 protected API routes** correctly reject unauthenticated requests
  (401/403) — `brands`, `scrape`, `clips/upload`, `agents/run`,
  `admin/stats`
- **`/dashboard` redirects** unauthenticated visitors to login
- **Public share report regression guard** — this is the most important
  check in the suite. On 2026-06-19 the `/r/[slug]` page broke in two
  separate ways (a Server Component event-handler crash, then a missing
  RLS read policy) that **both passed `npm run build` cleanly** and were
  only caught by manually clicking through the live site. This check
  fetches a known share-report slug and asserts (a) no error boundary
  text appears and (b) real report content is present — so if this class
  of bug reappears, it fails the very next day instead of sitting
  undetected.
- **`/api/badge`** returns actual SVG markup (depends on the same RLS
  policy as the share report, so it's a second independent signal on that
  code path)
- **Supabase Auth health** — confirms the test account can still log in
  against the Auth backend and that token introspection returns the right
  user. (See Layer 2 for *why* this doesn't extend to full in-app plan
  enforcement checks.)

### Setting it up (one-time)
Add these as **GitHub repo secrets** (Settings → Secrets and variables →
Actions):

| Secret | Value |
|---|---|
| `SMOKE_TEST_EMAIL` | A dedicated test account email — **not** a real customer. Suggest a new signup just for this, kept permanently on the Free plan. |
| `SMOKE_TEST_PASSWORD` | That account's password |
| `SMOKE_TEST_SUPABASE_URL` | Same value as `NEXT_PUBLIC_SUPABASE_URL` |
| `SMOKE_TEST_SUPABASE_ANON_KEY` | Same value as `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SLACK_WEBHOOK_URL` | *(optional)* Incoming webhook URL — posts a failure summary to a channel of your choice |

If you skip the `SMOKE_TEST_*` auth secrets, the script still runs all the
public/infra/regression checks above and just skips the authenticated
section with a warning — it will never silently report green when checks
were actually skipped due to misconfiguration; missing secrets show up
explicitly in the log.

### Why it's a plain script, not Playwright/Cypress
Deliberately dependency-light: it's `fetch()` calls against the *live*
production URL, runs in under a minute, needs no browser binary in CI,
and every check is something a real visitor or API client could trigger.
The trade-off is it can't drive actual UI interactions (clicking buttons,
filling forms) — that's Layer 2.

## Layer 2 — Monthly (or pre-release) browser walkthrough

Things that need a real authenticated browser session with cookies, which
the script above explicitly cannot do (Clouts' API routes read the
Supabase SSR session cookie, not a bearer token):

- [ ] Log in as the Free-tier test account
- [ ] Confirm AI Visibility page shows ChatGPT/Gemini/Grok/Claude as
      **Locked**, only Perplexity scannable
- [ ] Attempt to create a 2nd brand → confirm **403 + clear error message**
      (regression guard for the 2026-06-20 plan-limits fix — this is the
      one check in this whole doc that most directly maps to "did the
      membership-tier bug come back")
- [ ] Attempt to create a clip → confirm blocked with upgrade message
- [ ] Run a scan requesting all 5 engines via the UI → confirm only
      Perplexity actually executes (server clamps it even if a future UI
      bug re-exposes the picker)
- [ ] Switch brands via the sidebar dropdown → confirm the Overview page
      updates without requiring a manual refresh (known minor bug as of
      2026-06-19, not yet fixed — sidebar selection updates but page data
      is stale until reload)
- [ ] If a Pro/Team test account exists: confirm all 5 engines unlocked,
      brand limit raised to 5 / unlimited, clips allowed
- [ ] Click through Settings → Share Report → Preview → confirm public
      report renders, embed badge image actually paints (not just 200)
- [ ] Sign up a brand-new account end-to-end (real email confirmation) at
      least once per release to catch onboarding-flow regressions the
      smoke test can't reach (it never creates new accounts, to avoid
      polluting the database on every run)

This layer doesn't need to be a script — it's a checklist for whoever is
testing a release, or can be promoted into a real Playwright suite later
once it's worth the CI runtime/maintenance cost.

## Known open items as of 2026-06-20

1. **Brand switcher stale-data bug** (Layer 2 checklist item above) —
   confirmed reproducible, not yet fixed.
2. **Plan limits now enforced server-side** (`src/lib/plan-limits.ts`,
   shipped 2026-06-20) for brands, mention quota, and engine access, and
   clips. **Not yet covered by an automated check** — Layer 1 can't
   exercise it (cookie auth), so it's Layer 2 checklist-only until
   promoted to a real Playwright suite.
3. **AEO agent is intentionally left ungated** on the Free plan despite
   `PLANS.free.limits.agents = 0` in `src/lib/stripe/index.ts` — see the
   comment in `src/app/api/agents/run/route.ts`. Worth a deliberate
   product decision rather than the engineering default.
