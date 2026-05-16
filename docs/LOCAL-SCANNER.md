# Local Scanner

The marketplace scanner runs on your laptop (residential IP) and writes results to the
**same Supabase project** that powers the live Vercel app. eBay and Vinted block requests
from Vercel's data-center IPs, so scanning from cloud cron is not viable.

## Architecture (single source of truth)

```
       Vercel (live site)              Localhost (scanner only)
              |                                  |
              v                                  v
        Supabase project mxhwyrnitasstkzuwhlr (production)
```

- Vercel reads listings/image candidates and shows them on `/missing`, `/item/[id]`, `/admin`.
- Localhost runs `npm run scan:*` to populate marketplace tables.

## One-time setup

1. Open `.env.local` and verify it points at the **production** Supabase project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://mxhwyrnitasstkzuwhlr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aycwX58T4VlS3V6JEdrlcw_MN2Accl7
   SUPABASE_SERVICE_ROLE_KEY=<paste from Supabase dashboard>
   ```
   Get the service role key from
   https://supabase.com/dashboard/project/mxhwyrnitasstkzuwhlr/settings/api-keys
   (the key starts with `sb_secret_`).

2. Verify the scanner can connect:
   ```powershell
   npm run scan:ebay
   ```

## Commands

| Command | What it does |
|---|---|
| `npm run scan:marketplaces` | Runs all hardcoded queries on **both** eBay and Vinted |
| `npm run scan:ebay` | eBay only - all hardcoded eBay queries |
| `npm run scan:vinted` | Vinted only - all hardcoded Vinted queries |
| `npm run scan:missing` | **Prioritises items you don't own.** Generates 4 targeted queries per missing model. Best for finding what you actually need. |

All commands write to Supabase tables: `marketplace_listings`, `marketplace_scan_runs`,
`item_image_candidates`, and update `items.last_seen_*` for matched models.

## Windows Task Scheduler - 3 times daily

To run automatically at 07:00, 13:00 and 20:00 every day:

```powershell
# Run from project root in an Administrator PowerShell
$ProjDir = "C:\Users\matth\Documents\mini-freds-collection-tracker"

schtasks /Create /TN "MiniFred-ScanMissing-Morning" /SC DAILY /ST 07:00 `
  /TR "powershell -NoProfile -WindowStyle Hidden -Command `"cd '$ProjDir'; npm run scan:missing >> scan.log 2>&1`"" /F

schtasks /Create /TN "MiniFred-ScanMissing-Afternoon" /SC DAILY /ST 13:00 `
  /TR "powershell -NoProfile -WindowStyle Hidden -Command `"cd '$ProjDir'; npm run scan:missing >> scan.log 2>&1`"" /F

schtasks /Create /TN "MiniFred-ScanAll-Evening" /SC DAILY /ST 20:00 `
  /TR "powershell -NoProfile -WindowStyle Hidden -Command `"cd '$ProjDir'; npm run scan:marketplaces >> scan.log 2>&1`"" /F
```

Inspect:
```powershell
schtasks /Query /TN "MiniFred-ScanMissing-Morning" /V /FO LIST
```

Remove:
```powershell
schtasks /Delete /TN "MiniFred-ScanMissing-Morning" /F
schtasks /Delete /TN "MiniFred-ScanMissing-Afternoon" /F
schtasks /Delete /TN "MiniFred-ScanAll-Evening" /F
```

## Checking scan logs

**Terminal output (most recent run):**
The scripts print a summary like:
```
Mini Freds Marketplace Scan
Title:    Missing items only
Provider: eBay + Vinted
Mode:     dynamic queries per missing item

Catalogue items: 52
Owned items:     3
Missing items:   49

Targeting 30 missing items, 240 queries total.

eBay queries run:      120
Vinted queries run:    120
Total queries run:     240
Total listings found:  86
New listings:          14
Image candidates created: 7
New variant candidates: 1

Done.
```

**Persistent history (Supabase):**
Every run is logged to `marketplace_scan_runs`:
- Supabase Studio -> Tables -> `marketplace_scan_runs` (sort by `started_at` desc)
- Or query: `select * from marketplace_scan_runs order by started_at desc limit 10;`

**Task Scheduler log file:**
Output is redirected to `scan.log` in the project root (see the `schtasks` commands above).

## Disabling Vinted

If Vinted blocks the scraper or returns junk:

1. Add to `.env.local`:
   ```env
   VINTED_SCAN_ENABLED=false
   ```

2. Re-run any scan command - Vinted queries will be skipped, eBay continues normally.

To re-enable, remove the line (or set to `true`).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Missing NEXT_PUBLIC_SUPABASE_URL` | Set vars in `.env.local` |
| `eBay search returned 403` | eBay is rate-limiting your IP. Wait 10 min, or rotate IPs. |
| `Vinted package import failed` | `npm install` again, or set `VINTED_SCAN_ENABLED=false` |
| Listings don't appear on `/missing` | Hard-refresh (Ctrl+Shift+R); check that `.env.local` points to **production** Supabase, not localhost |
| Task Scheduler doesn't run | Check "Run whether user is logged on or not" + ensure user has "Log on as a batch job" right |

## Why not Vercel Cron?

- Vercel Hobby allows **once-daily cron** - not enough for active hunting.
- eBay/Vinted detect Vercel's data-center IPs and return 403 / time out.
- Local cron is reliable, free, runs as often as you want, and uses your residential IP.

The `/api/cron/marketplace-scan` endpoint still exists for manual testing or future use,
but is not relied on for regular scanning.
