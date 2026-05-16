#!/usr/bin/env tsx
import { loadEnv } from "./lib/env";
loadEnv();

import { runScan } from "../src/lib/marketplace/scan-runner";
import { getHardcodedQueries } from "../src/lib/marketplace/hardcoded-queries";
import { printHeader, printSummary } from "./lib/print-summary";

async function main() {
  const queries = getHardcodedQueries().filter((q) => q.provider === "vinted");
  printHeader({ title: "Vinted UK only", provider: "Vinted", mode: "all hardcoded Vinted queries" });
  const summary = await runScan({ queries, providerLabel: "vinted" });
  printSummary(summary, { vintedQueriesRun: queries.length });
}

main().catch((e) => { console.error(e); process.exit(1); });
