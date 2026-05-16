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
      .from("item_image_candidates")
      .select("*, item:items(id, name, manufacturer, reference_number, image_url, image_verified)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const status = sp.get("status") ?? "pending";
    if (status !== "all") q = q.eq("status", status);
    const itemId = sp.get("item_id");
    if (itemId) q = q.eq("item_id", itemId);
    const provider = sp.get("provider");
    if (provider) q = q.eq("provider", provider);

    const { data, error, count } = await q;
    if (error) return internalError(error.message);
    return paginated(data ?? [], count ?? 0, page, limit);
  } catch (err) {
    console.error("[GET /api/admin/marketplace/image-candidates]", err);
    return internalError();
  }
}
