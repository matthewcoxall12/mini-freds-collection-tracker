import { type NextRequest } from "next/server";
import { runScan } from "@/lib/marketplace/scan-runner";
import { ok, badRequest, internalError } from "@/lib/responses";
import type { MarketplaceProvider, MarketplaceQuery } from "@/lib/marketplace/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let body: unknown;
    try { body = await request.json(); } catch {
      return badRequest("Request body must be valid JSON");
    }

    const { provider, query, item_id, limit } = body as Record<string, unknown>;
    if (typeof query !== "string" || query.trim().length === 0) {
      return badRequest("query is required");
    }
    if (provider !== "ebay" && provider !== "vinted" && provider !== "all") {
      return badRequest("provider must be 'ebay', 'vinted', or 'all'");
    }
    const lim = typeof limit === "number" && limit > 0 ? Math.min(limit, 50) : 20;

    const providers: MarketplaceProvider[] =
      provider === "all" ? ["ebay", "vinted"] : [provider as MarketplaceProvider];

    const queries: MarketplaceQuery[] = providers.map((p) => ({
      provider: p,
      query: query.trim(),
      itemId: typeof item_id === "string" ? item_id : null,
      queryType: "manufacturer_ref",
      limit: lim,
    }));

    const summary = await runScan({ queries, providerLabel: provider as MarketplaceProvider | "all" });
    return ok(summary);
  } catch (err) {
    console.error("[POST /api/admin/marketplace/scan]", err);
    return internalError(err instanceof Error ? err.message : "Scan failed");
  }
}
