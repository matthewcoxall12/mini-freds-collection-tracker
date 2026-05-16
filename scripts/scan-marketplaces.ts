#!/usr/bin/env tsx
import { loadEnv } from "./lib/env";
loadEnv();

import { runScan } from "../src/lib/marketplace/scan-runner";
import { getHardcodedQueries } from "../src/lib/marketplace/hardcoded-queries";
import { printHeader, printSummary } from "./lib/print-summary";
import { createAdminClient } from "../src/lib/supabase";

async function main() {
  const supabase = createAdminClient();
  const [{ count: catalogueCount }, { data: collected }] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }),
    supabase.from("user_items").select("item_id").eq("collected", true),
  ]);
  const ownedCount = (collected ?? []).length;

  const all = getHardcodedQueries();
  printHeader({
    title: "Hardcoded queries (eBay + Vinted)",
    provider: "eBay + Vinted",
    mode: "all hardcoded",
    catalogueCount: catalogueCount ?? 0,
    ownedCount,
    missingCount: (catalogueCount ?? 0) - ownedCount,
  });

  const ebayQueries = all.filter((q) => q.provider === "ebay");
  const vintedQueries = all.filter((q) => q.provider === "vinted");

  const summary = await runScan({ queries: all, providerLabel: "all" });

  printSummary(summary, {
    ebayQueriesRun: ebayQueries.length,
    vintedQueriesRun: vintedQueries.length,
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
