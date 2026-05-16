# Marketplace Scanner

Scans eBay UK and Vinted UK for Austin A35 van diecast model listings, matches them against the catalogue, and queues image candidates for review.

## Providers

### eBay (primary)
- **Package:** `ebay-api` (hendt/ebay-api) installed, but the default `EbayScanner` uses **direct HTML scraping** of eBay UK search results (`/sch/i.html`). This requires **no credentials**.
- If you set `EBAY_APP_ID`/`EBAY_CERT_ID`/`EBAY_DEV_ID` you can swap to the wrapper later for the official Browse API.
- Target site: `https://www.ebay.co.uk` (UK only, `LH_PrefLoc=1`).

### Vinted (secondary)
- **Package:** `vinted-api` (github:Androz2091/vinted-api)
- **Why this one:** simplest public-search surface; no auth required (library auto-fetches a guest session cookie). Alternatives (vinted-monitor, VintedAPI, vinted-client) are heavier (websockets/monitoring loops) or less maintained for one-shot search.
- Best effort — if Vinted blocks requests or the package fails, scan-runner logs the error and continues with eBay.

## How it works

```
hardcoded-queries.ts -> scan-runner.ts -> {EbayScanner, VintedScanner}
                              |
                              v
                  matcher.ts (classify each listing)
                              |
                              v
              Supabase: marketplace_listings
                              |
                              v
                     item_image_candidates (if image + matched + item not verified)
                              |
                              v
                     marketplace_scan_runs (summary)
```

Match tiers:
- **matched** (>=0.6): reference number hit + manufacturer + Austin/A35 context
- **possible_match** (0.3-0.6): partial signals
- **new_candidate**: looks like A35 van but no catalogue match
- **rejected**: keywords like "saloon", "Austin A30", books, spares, clothing, "registration"/"MOT"

No listing is auto-added to the catalogue. Image candidates require manual approval. Items with `image_verified=true` are never overwritten automatically.

## Manual scan

1. Go to `/admin`, unlock with password (`coxall12`)
2. Open the **Marketplace Scanner** section
3. Choose provider, enter query, click **Run scan**
4. Review in **Listings** and **Image Candidates** tabs

## Cron (Vercel)

`vercel.json`:
```json
{ "path": "/api/cron/marketplace-scan", "schedule": "0 7,13,20 * * *" }
```
07:00, 13:00, 20:00 UTC daily. Each pass rotates through up to 18 hardcoded queries based on UTC hour.

Auth: `MARKETPLACE_SCAN_CRON_SECRET` via `Authorization: Bearer <secret>` header or `?secret=` query. Vercel auto-accepts via `x-vercel-cron-signature`. If unset, endpoint is open.

## Environment variables

| Var | Purpose | Default |
|---|---|---|
| `MARKETPLACE_SCAN_ENABLED` | Master switch | `true` |
| `EBAY_SCAN_ENABLED` | Enable eBay | `true` |
| `VINTED_SCAN_ENABLED` | Enable Vinted | `true` |
| `MARKETPLACE_SCAN_CRON_SECRET` | Cron auth | _empty_ |
| `EBAY_APP_ID` etc. | Optional eBay official-API credentials | _empty_ |
| `VINTED_BASE_URL` | Override Vinted UK URL | `https://www.vinted.co.uk` |

Disable Vinted: set `VINTED_SCAN_ENABLED=false` in Vercel env.

## Rate limits

- 1.2s delay between eBay queries
- 2.5s delay between Vinted queries
- Cron capped at 18 queries/run, 15 eBay / 12 Vinted results per query
- Normal browser User-Agent used

## Reading scan logs

- Supabase Studio -> `marketplace_scan_runs` (most recent by `started_at`)
- Each row: provider, status, counts, error summary
- Vercel logs: filter path `/api/cron/marketplace-scan` or `/api/admin/marketplace/scan`

## Hardcoded queries

`src/lib/marketplace/hardcoded-queries.ts`:
- eBay exact: 46 reference-specific queries
- eBay discovery: 17 broad queries
- Vinted: 10 simple queries

## Known limitations

- eBay scraping breaks if eBay changes HTML — regex parser needs updating
- Vinted unofficial API can be blocked or rate-limited
- No image verification beyond URL validity — Approve trusts the user's eye
- Catalogue item deletion leaves orphaned `marketplace_listings` (item_id nullified)
