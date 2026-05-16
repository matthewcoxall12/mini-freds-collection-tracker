import { type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { paginated, internalError } from "@/lib/responses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const supabase = createAdminClient();
    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(sp.get("limit") ?? "50", 10)));
    const offset = (page - 1) * limit;

    let q = supabase
      .from("marketplace_listings")
      .select("*, item:items(id, name, manufacturer, reference_number)", { count: "exact" })
      .order("last_seen_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const provider = sp.get("provider");
    if (provider) q = q.eq("provider", provider);
    const matched = sp.get("matched_status");
    if (matched) q = q.eq("matched_status", matched);
    const itemId = sp.get("item_id");
    if (itemId) q = q.eq("item_id", itemId);
    if (sp.get("active_only") === "true") q = q.eq("listing_status", "active");
    if (sp.get("has_image") === "true") q = q.not("image_url", "is", null);
    const pmin = sp.get("price_min");
    if (pmin) q = q.gte("price", parseFloat(pmin));
    const pmax = sp.get("price_max");
    if (pmax) q = q.lte("price", parseFloat(pmax));

    if (sp.get("missing_only") === "true") {
      const { DEFAULT_USER_ID } = await import("@/lib/constants");
      const { data: owned } = await supabase
        .from("user_items")
        .select("item_id")
        .eq("user_id", DEFAULT_USER_ID)
        .eq("collected", true);
      const ownedIds = (owned ?? []).map((r) => r.item_id);
      q = q.not("item_id", "is", null);
      if (ownedIds.length > 0) {
        q = q.not("item_id", "in", `(${ownedIds.join(",")})`);
      }
    }

    const { data, error, count } = await q;
    if (error) return internalError(error.message);
    return paginated(data ?? [], count ?? 0, page, limit);
  } catch (err) {
    console.error("[GET /api/admin/marketplace/listings]", err);
    return internalError();
  }
}
