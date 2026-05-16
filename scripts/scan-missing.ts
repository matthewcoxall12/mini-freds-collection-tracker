#!/usr/bin/env tsx
import { loadEnv } from "./lib/env";
loadEnv();

import { runScan } from "../src/lib/marketplace/scan-runner";
import { printHeader, printSummary } from "./lib/print-summary";
import { createAdminClient } from "../src/lib/supabase";
import type { MarketplaceQuery } from "../src/lib/marketplace/types";

const MAX_ITEMS = 30;
const EBAY_LIMIT_PER_QUERY = 10;
const VINTED_LIMIT_PER_QUERY = 8;

function buildQueriesForItem(item: {
  manufacturer: string;
  reference_number: string | null;
  livery: string | null;
}): string[] {
  const queries: string[] = [];
  const ref = item.reference_number?.trim();
  const mfr = item.manufacturer?.trim();
  const liv = item.livery?.trim();

  if (ref) queries.push(`${ref} Austin A35`);
  if (mfr && ref) queries.push(`${mfr} ${ref}`);
  if (mfr && liv) queries.push(`${mfr} Austin A35 ${liv}`);
  if (liv) queries.push(`Austin A35 ${liv}`);

  return Array.from(new Set(queries.filter((q) => q.length >= 6)));
}

async function main() {
  const supabase = createAdminClient();

  const { data: catalogue, count: catalogueCount } = await supabase
    .from("items")
    .select("id, manufacturer, reference_number, livery, scale", { count: "exact" });
  const { data: owned } = await supabase
    .from("user_items")
    .select("item_id")
    .eq("collected", true);

  const ownedIds = new Set((owned ?? []).map((r) => r.item_id));
  const missing = (catalogue ?? []).filter((i) => !ownedIds.has(i.id));

  printHeader({
    title: "Missing items only",
    provider: "eBay + Vinted",
    mode: "dynamic queries per missing item",
    catalogueCount: catalogueCount ?? 0,
    ownedCount: ownedIds.size,
    missingCount: missing.length,
  });

  const target = missing.slice(0, MAX_ITEMS);

  const queries: MarketplaceQuery[] = [];
  for (const item of target) {
    const qstrings = buildQueriesForItem(item);
    for (const q of qstrings) {
      queries.push({
        provider: "ebay",
        query: q,
        itemId: item.id,
        queryType: "exact_item",
        priority: 10,
        limit: EBAY_LIMIT_PER_QUERY,
      });
      const vintedQuery = q.length > 40 ? q.replace(/\s+Austin A35.*$/i, "") : q;
      queries.push({
        provider: "vinted",
        query: vintedQuery,
        itemId: item.id,
        queryType: "exact_item",
        priority: 10,
        limit: VINTED_LIMIT_PER_QUERY,
      });
    }
  }

  console.log(`Targeting ${target.length} missing items, ${queries.length} queries total.`);
  console.log("");

  const ebayQueries = queries.filter((q) => q.provider === "ebay").length;
  const vintedQueries = queries.filter((q) => q.provider === "vinted").length;

  const summary = await runScan({ queries, providerLabel: "all" });

  printSummary(summary, { ebayQueriesRun: ebayQueries, vintedQueriesRun: vintedQueries });
}

main().catch((e) => { console.error(e); process.exit(1); });
