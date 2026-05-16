import type {
  MarketplaceQuery,
  MarketplaceScanner,
  MarketplaceSearchResult,
} from "./types";

const EBAY_UK = "https://www.ebay.co.uk";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function buildSearchUrl(query: string, limit: number): string {
  const params = new URLSearchParams({
    _nkw: query,
    _ipg: String(Math.min(Math.max(limit, 10), 60)),
    LH_PrefLoc: "1",
    _sop: "12",
  });
  return `${EBAY_UK}/sch/i.html?${params.toString()}`;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parsePrice(raw: string): { price?: number; currency?: string } {
  const text = raw.replace(/\s+/g, " ").trim();
  const m = text.match(/(£|\$|€)\s?([\d,]+(?:\.\d{2})?)/);
  if (!m) return {};
  const currency = m[1] === "£" ? "GBP" : m[1] === "$" ? "USD" : "EUR";
  const value = parseFloat(m[2].replace(/,/g, ""));
  if (Number.isNaN(value)) return { currency };
  return { price: value, currency };
}

function extractAttribute(html: string, attr: string): string | undefined {
  const m = html.match(new RegExp(`${attr}\\s*=\\s*"([^"]*)"`, "i"));
  return m ? decodeHtml(m[1]) : undefined;
}

function extractItemId(url: string): string | null {
  const m = url.match(/\/itm\/(?:[^/]+\/)?(\d{9,})/);
  return m ? m[1] : null;
}

function parseListings(html: string): MarketplaceSearchResult[] {
  const results: MarketplaceSearchResult[] = [];
  const blocks = html.split(/<li[^>]+class="[^"]*s-item[^"]*"[^>]*>/i).slice(1);
  for (const block of blocks) {
    const end = block.indexOf("</li>");
    const chunk = end > 0 ? block.slice(0, end) : block;

    const linkMatch = chunk.match(/<a[^>]+class="s-item__link"[^>]+href="([^"]+)"/i);
    if (!linkMatch) continue;
    const href = decodeHtml(linkMatch[1]).split("?")[0];
    const itemId = extractItemId(href);
    if (!itemId) continue;

    const titleMatch =
      chunk.match(/<div[^>]+class="s-item__title"[^>]*>(?:<span[^>]*>[^<]*<\/span>)?\s*<span[^>]*>([^<]+)<\/span>/i) ||
      chunk.match(/<span[^>]+role="heading"[^>]*>([^<]+)<\/span>/i);
    const title = titleMatch ? decodeHtml(titleMatch[1]).trim() : "";
    if (!title || /shop on ebay/i.test(title)) continue;

    const priceMatch = chunk.match(/<span[^>]+class="s-item__price"[^>]*>([\s\S]*?)<\/span>/i);
    const { price, currency } = priceMatch ? parsePrice(decodeHtml(priceMatch[1].replace(/<[^>]+>/g, ""))) : {};

    const imgMatch =
      chunk.match(/<img[^>]+class="s-item__image-img"[^>]*>/i) ||
      chunk.match(/<img[^>]+>/i);
    const imageUrl = imgMatch
      ? extractAttribute(imgMatch[0], "src") || extractAttribute(imgMatch[0], "data-src")
      : undefined;

    const conditionMatch = chunk.match(/<span[^>]+class="SECONDARY_INFO"[^>]*>([^<]+)<\/span>/i);
    const condition = conditionMatch ? decodeHtml(conditionMatch[1]).trim() : undefined;

    const sellerMatch = chunk.match(/<span[^>]+class="s-item__seller-info-text"[^>]*>([^<]+)<\/span>/i);
    const sellerUsername = sellerMatch ? decodeHtml(sellerMatch[1]).trim().split(" ")[0] : undefined;

    results.push({
      provider: "ebay",
      providerItemId: itemId,
      title,
      price,
      currency,
      condition,
      sellerUsername,
      itemWebUrl: href,
      imageUrl: imageUrl && /^https?:\/\//.test(imageUrl) ? imageUrl : undefined,
      listingStatus: "active",
    });
  }
  return results;
}

export class EbayScanner implements MarketplaceScanner {
  readonly provider = "ebay" as const;

  available(): { ok: boolean; reason?: string } {
    return { ok: true };
  }

  async search(query: MarketplaceQuery): Promise<MarketplaceSearchResult[]> {
    const limit = query.limit ?? 25;
    const url = buildSearchUrl(query.query, limit);
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`eBay search returned ${res.status}`);
    }
    const html = await res.text();
    return parseListings(html).slice(0, limit);
  }
}
