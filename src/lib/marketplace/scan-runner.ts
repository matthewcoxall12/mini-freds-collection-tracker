import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase";
import { EbayScanner } from "./ebay";
import { VintedScanner } from "./vinted";
import { matchListing } from "./matcher";
import type {
  CatalogueItemRow,
  MarketplaceProvider,
  MarketplaceQuery,
  MarketplaceScanner,
  MarketplaceSearchResult,
  ScanSummary,
} from "./types";

const PROVIDER_DELAY_MS: Record<MarketplaceProvider, number> = {
  ebay: 1200,
  vinted: 2500,
  manual: 0,
};

function getScanner(provider: MarketplaceProvider): MarketplaceScanner | null {
  if (provider === "ebay") return new EbayScanner();
  if (provider === "vinted") return new VintedScanner();
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function stableHashId(provider: string, url: string): string {
  return crypto.createHash("sha1").update(`${provider}::${url}`).digest("hex").slice(0, 24);
}

export type RunScanOptions = {
  queries: MarketplaceQuery[];
  providerLabel?: MarketplaceProvider | "all";
};

export async function runScan(opts: RunScanOptions): Promise<ScanSummary> {
  const supabase = createAdminClient();
  const providerLabel = opts.providerLabel ?? "all";

  const { data: runRow } = await supabase
    .from("marketplace_scan_runs")
    .insert({ provider: providerLabel, status: "running" })
    .select("id")
    .single();
  const runId: string | undefined = runRow?.id;

  const { data: catalogueData } = await supabase
    .from("items")
    .select("id, name, manufacturer, range_name, reference_number, livery, scale");
  const catalogue: CatalogueItemRow[] = (catalogueData ?? []) as CatalogueItemRow[];

  const summary: ScanSummary = {
    provider: providerLabel,
    queriesRun: 0,
    listingsFound: 0,
    newListings: 0,
    imageCandidatesCreated: 0,
    newCatalogueCandidates: 0,
    errors: [],
    runId,
  };

  for (const q of opts.queries) {
    const scanner = getScanner(q.provider);
    if (!scanner) continue;
    const availability = scanner.available();
    if (!availability.ok) {
      summary.errors.push(`${q.provider}:disabled:${availability.reason ?? ""}`);
      continue;
    }

    let results: MarketplaceSearchResult[] = [];
    try {
      results = await scanner.search(q);
      summary.queriesRun += 1;
      summary.listingsFound += results.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      summary.errors.push(`${q.provider}:${q.query}: ${msg}`);
      continue;
    }

    for (const r of results) {
      const providerItemId = r.providerItemId || stableHashId(r.provider, r.itemWebUrl);
      const match = matchListing(r, catalogue);

      const upsert = {
        provider: r.provider,
        provider_item_id: providerItemId,
        item_id: match.itemId,
        matched_status: match.matchedStatus,
        match_confidence: match.confidence,
        match_notes: match.notes,
        title: r.title,
        seller_username: r.sellerUsername,
        price: r.price,
        currency: r.currency,
        condition: r.condition,
        item_web_url: r.itemWebUrl,
        image_url: r.imageUrl,
        additional_image_urls: r.additionalImageUrls ?? null,
        listing_status: r.listingStatus ?? "active",
        last_seen_at: new Date().toISOString(),
        raw_payload: r.rawPayload ?? null,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from("marketplace_listings")
        .select("id")
        .eq("provider", r.provider)
        .eq("provider_item_id", providerItemId)
        .maybeSingle();
      if (!existing) summary.newListings += 1;

      const { error: upsertErr } = await supabase
        .from("marketplace_listings")
        .upsert(upsert, { onConflict: "provider,provider_item_id" });
      if (upsertErr) {
        summary.errors.push(`upsert: ${upsertErr.message}`);
        continue;
      }

      if (
        match.itemId &&
        r.imageUrl &&
        (match.matchedStatus === "matched" || match.matchedStatus === "possible_match")
      ) {
        const { data: item } = await supabase
          .from("items")
          .select("image_verified")
          .eq("id", match.itemId)
          .maybeSingle();

        if (item && !item.image_verified) {
          const { data: existingCandidate } = await supabase
            .from("item_image_candidates")
            .select("id")
            .eq("item_id", match.itemId)
            .eq("image_url", r.imageUrl)
            .maybeSingle();

          if (!existingCandidate) {
            const { error: candErr } = await supabase.from("item_image_candidates").insert({
              item_id: match.itemId,
              provider: r.provider,
              source_url: r.itemWebUrl,
              image_url: r.imageUrl,
              confidence: match.confidence,
              status: "pending",
              notes: match.notes,
            });
            if (!candErr) summary.imageCandidatesCreated += 1;
          }
        }

        if (r.price !== undefined) {
          await supabase
            .from("items")
            .update({
              last_seen_price: r.price,
              last_seen_marketplace: r.provider,
              last_seen_url: r.itemWebUrl,
              last_seen_at: new Date().toISOString(),
            })
            .eq("id", match.itemId);
        }
      }

      if (match.matchedStatus === "new_candidate") summary.newCatalogueCandidates += 1;
    }

    await sleep(PROVIDER_DELAY_MS[q.provider] ?? 1000);
  }

  if (runId) {
    const status =
      summary.errors.length === 0 ? "success" : summary.queriesRun === 0 ? "failed" : "partial";
    await supabase
      .from("marketplace_scan_runs")
      .update({
        finished_at: new Date().toISOString(),
        status,
        queries_run: summary.queriesRun,
        listings_found: summary.listingsFound,
        new_listings: summary.newListings,
        image_candidates_created: summary.imageCandidatesCreated,
        new_catalogue_candidates: summary.newCatalogueCandidates,
        error_message: summary.errors.length > 0 ? summary.errors.slice(0, 5).join(" | ") : null,
        raw_summary: summary,
      })
      .eq("id", runId);
  }

  return summary;
}
