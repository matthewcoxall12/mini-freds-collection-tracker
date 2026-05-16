#!/usr/bin/env tsx
import { loadEnv } from "./lib/env";
loadEnv();

import { runScan } from "../src/lib/marketplace/scan-runner";
import { getHardcodedQueries } from "../src/lib/marketplace/hardcoded-queries";
import { printHeader, printSummary } from "./lib/print-summary";

async function main() {
  const queries = getHardcodedQueries().filter((q) => q.provider === "ebay");
  printHeader({ title: "eBay UK only", provider: "eBay", mode: "all hardcoded eBay queries" });
  const summary = await runScan({ queries, providerLabel: "ebay" });
  printSummary(summary, { ebayQueriesRun: queries.length });
}

main().catch((e) => { console.error(e); process.exit(1); });
