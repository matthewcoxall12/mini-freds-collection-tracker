import { type NextRequest } from "next/server";
import { runScan } from "@/lib/marketplace/scan-runner";
import { getHardcodedQueries } from "@/lib/marketplace/hardcoded-queries";
import { ok, unauthorized, internalError } from "@/lib/responses";
import type { MarketplaceProvider, MarketplaceQuery } from "@/lib/marketplace/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 300;

const MAX_QUERIES_PER_RUN = 18;
const EBAY_LIMIT_PER_QUERY = 15;
const VINTED_LIMIT_PER_QUERY = 12;

function authorize(request: NextRequest): boolean {
  const secret = process.env.MARKETPLACE_SCAN_CRON_SECRET;
  if (!secret) return true;
  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  if (request.nextUrl.searchParams.get("secret") === secret) return true;
  if (request.headers.get("x-vercel-cron-signature")) return true;
  return false;
}

async function handle(request: NextRequest): Promise<Response> {
  if (!authorize(request)) return unauthorized();
  if (process.env.MARKETPLACE_SCAN_ENABLED === "false") {
    return ok({ skipped: true, reason: "MARKETPLACE_SCAN_ENABLED=false" });
  }

  const ebayEnabled = process.env.EBAY_SCAN_ENABLED !== "false";
  const vintedEnabled = process.env.VINTED_SCAN_ENABLED !== "false";

  const all = getHardcodedQueries();
  const filtered = all.filter((q) => {
    if (q.provider === "ebay") return ebayEnabled;
    if (q.provider === "vinted") return vintedEnabled;
    return false;
  });

  const hour = new Date().getUTCHours();
  const offset = filtered.length > 0 ? (hour * MAX_QUERIES_PER_RUN) % filtered.length : 0;
  const rotated = [...filtered.slice(offset), ...filtered.slice(0, offset)];

  const queries: MarketplaceQuery[] = rotated.slice(0, MAX_QUERIES_PER_RUN).map((q) => ({
    ...q,
    limit: q.provider === "ebay" ? EBAY_LIMIT_PER_QUERY : VINTED_LIMIT_PER_QUERY,
  }));

  const providerLabel: MarketplaceProvider | "all" =
    ebayEnabled && vintedEnabled ? "all" : ebayEnabled ? "ebay" : "vinted";

  try {
    const summary = await runScan({ queries, providerLabel });
    return ok(summary);
  } catch (err) {
    console.error("[cron marketplace-scan]", err);
    return internalError(err instanceof Error ? err.message : "Cron scan failed");
  }
}

export async function GET(request: NextRequest) { return handle(request); }
export async function POST(request: NextRequest) { return handle(request); }
