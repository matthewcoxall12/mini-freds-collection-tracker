import type {
  MarketplaceQuery,
  MarketplaceScanner,
  MarketplaceSearchResult,
} from "./types";

const VINTED_BASE = process.env.VINTED_BASE_URL || "https://www.vinted.co.uk";

type VintedItem = {
  id?: number | string;
  title?: string;
  price?: string | number | { amount?: string };
  currency?: string;
  status?: string;
  url?: string;
  photo?: { url?: string; full_size_url?: string };
  user?: { login?: string };
};

function buildVintedSearchUrl(query: string): string {
  const params = new URLSearchParams({
    search_text: query,
    order: "newest_first",
  });
  return `${VINTED_BASE}/catalog?${params.toString()}`;
}

function normalizeVintedItem(it: VintedItem): MarketplaceSearchResult | null {
  if (!it || !it.id) return null;
  const providerItemId = String(it.id);
  let price: number | undefined;
  const currency = it.currency || "GBP";
  if (typeof it.price === "string") price = parseFloat(it.price);
  else if (typeof it.price === "number") price = it.price;
  else if (it.price && typeof it.price === "object" && it.price.amount) {
    price = parseFloat(it.price.amount);
  }
  if (price !== undefined && Number.isNaN(price)) price = undefined;

  const itemWebUrl = it.url || `${VINTED_BASE}/items/${providerItemId}`;
  const imageUrl = it.photo?.full_size_url || it.photo?.url;
  return {
    provider: "vinted",
    providerItemId,
    title: it.title || "",
    price,
    currency,
    sellerUsername: it.user?.login,
    itemWebUrl,
    imageUrl: imageUrl && /^https?:\/\//.test(imageUrl) ? imageUrl : undefined,
    listingStatus: it.status === "sold" ? "sold" : "active",
    rawPayload: it,
  };
}

export class VintedScanner implements MarketplaceScanner {
  readonly provider = "vinted" as const;
  private warnedUnavailable = false;

  available(): { ok: boolean; reason?: string } {
    if (process.env.VINTED_SCAN_ENABLED === "false") {
      return { ok: false, reason: "VINTED_SCAN_ENABLED=false" };
    }
    return { ok: true };
  }

  async search(query: MarketplaceQuery): Promise<MarketplaceSearchResult[]> {
    if (!this.available().ok) {
      if (!this.warnedUnavailable) {
        console.warn("[Vinted] unavailable, skipping");
        this.warnedUnavailable = true;
      }
      return [];
    }

    type VintedModule = { search: (url: string) => Promise<{ items: VintedItem[] }> };
    let vinted: VintedModule;
    try {
      vinted = (await import("vinted-api")) as unknown as VintedModule;
    } catch (err) {
      console.warn("[Vinted] package import failed:", err);
      return [];
    }

    const url = buildVintedSearchUrl(query.query);
    let raw: { items: VintedItem[] };
    try {
      raw = await vinted.search(url);
    } catch (err) {
      console.warn("[Vinted] search failed:", err);
      return [];
    }

    const limit = query.limit ?? 20;
    const items = (raw.items ?? []).slice(0, limit);
    return items
      .map(normalizeVintedItem)
      .filter((it): it is MarketplaceSearchResult => it !== null);
  }
}
