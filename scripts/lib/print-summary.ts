import type { ScanSummary } from "../../src/lib/marketplace/types";

export function printHeader(opts: {
  title: string;
  provider: string;
  mode?: string;
  catalogueCount?: number;
  ownedCount?: number;
  missingCount?: number;
}): void {
  console.log("");
  console.log(`Mini Freds Marketplace Scan`);
  console.log(`Title:    ${opts.title}`);
  console.log(`Provider: ${opts.provider}`);
  if (opts.mode) console.log(`Mode:     ${opts.mode}`);
  console.log("");
  if (opts.catalogueCount !== undefined) console.log(`Catalogue items: ${opts.catalogueCount}`);
  if (opts.ownedCount !== undefined) console.log(`Owned items:     ${opts.ownedCount}`);
  if (opts.missingCount !== undefined) console.log(`Missing items:   ${opts.missingCount}`);
  console.log("");
}

export function printSummary(summary: ScanSummary, breakdown?: {
  ebayQueriesRun?: number;
  ebayListings?: number;
  vintedQueriesRun?: number;
  vintedListings?: number;
}): void {
  if (breakdown) {
    if (breakdown.ebayQueriesRun !== undefined) {
      console.log(`eBay queries run:     ${breakdown.ebayQueriesRun}`);
      console.log(`eBay listings found:  ${breakdown.ebayListings ?? 0}`);
    }
    if (breakdown.vintedQueriesRun !== undefined) {
      console.log(`Vinted queries run:    ${breakdown.vintedQueriesRun}`);
      console.log(`Vinted listings found: ${breakdown.vintedListings ?? 0}`);
    }
    console.log("");
  }
  console.log(`Total queries run:        ${summary.queriesRun}`);
  console.log(`Total listings found:     ${summary.listingsFound}`);
  console.log(`New listings:             ${summary.newListings}`);
  console.log(`Image candidates created: ${summary.imageCandidatesCreated}`);
  console.log(`New variant candidates:   ${summary.newCatalogueCandidates}`);
  if (summary.errors.length > 0) {
    console.log("");
    console.warn(`Errors: ${summary.errors.length}`);
    for (const e of summary.errors.slice(0, 8)) console.warn(`  - ${e}`);
  }
  console.log("");
  console.log("Done.");
}
