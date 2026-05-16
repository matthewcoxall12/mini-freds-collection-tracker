import { type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { ok, badRequest, internalError, notFound } from "@/lib/responses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROVIDER_LABELS: Record<string, string> = {
  ebay: "eBay UK",
  vinted: "Vinted UK",
  manual: "Manual",
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await context.params;
    if (!id) return badRequest("id required");

    let body: unknown;
    try { body = await request.json(); } catch {
      return badRequest("Request body must be valid JSON");
    }
    const { status } = body as Record<string, unknown>;
    if (status !== "approved" && status !== "rejected") {
      return badRequest("status must be 'approved' or 'rejected'");
    }

    const supabase = createAdminClient();
    const { data: candidate, error: fetchErr } = await supabase
      .from("item_image_candidates")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) return internalError(fetchErr.message);
    if (!candidate) return notFound("Image candidate");

    const now = new Date().toISOString();
    const { error: candErr } = await supabase
      .from("item_image_candidates")
      .update({ status, reviewed_at: now })
      .eq("id", id);
    if (candErr) return internalError(candErr.message);

    if (status === "approved") {
      const sourceName = PROVIDER_LABELS[candidate.provider] ?? candidate.provider;
      const { error: itemErr } = await supabase
        .from("items")
        .update({
          image_url: candidate.image_url,
          image_source_url: candidate.source_url,
          image_source_name: sourceName,
          image_verified: true,
          image_verified_at: now,
          updated_at: now,
        })
        .eq("id", candidate.item_id);
      if (itemErr) return internalError(`Approved but failed to update item: ${itemErr.message}`);
    }

    return ok({ id, status });
  } catch (err) {
    console.error("[PATCH /api/admin/marketplace/image-candidates/:id]", err);
    return internalError();
  }
}
