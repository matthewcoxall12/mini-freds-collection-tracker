import type { CatalogueItemRow, MarketplaceSearchResult, MatchResult } from "./types";

const REJECT_KEYWORDS = [
  "saloon", "estate", "countryman",
  "austin a30", "austin a40", "austin seven",
  "mini van", "morris mini",
  "manual", "handbook", "workshop manual",
  "brochure", "magazine", "book",
  "spare part", "spares", "wheel only",
  "decal", "transfer", "sticker",
  "clothing", "t-shirt", "tshirt", "hoodie",
  "mug", "keyring", "badge only",
];

const FULL_SIZE_CAR_HINTS = [
  "running", "registration", "tax", "mot",
  "barn find", "project car", "needs restoration",
  "px swap", "private plate",
];

const A35_VAN_HINTS = ["a35 van", "austin a35 van", "a35van", "a/35 van"];
const SCALE_HINTS_OK = ["1:43", "1/43", "1:76", "1/76", "diecast", "die-cast", "die cast"];
const KNOWN_MANUFACTURERS = [
  "corgi", "lledo", "vanguards", "days gone",
  "src", "promod", "pocketbond", "classix", "oxford",
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenizeRef(ref: string | null | undefined): string[] {
  if (!ref) return [];
  const base = ref.toLowerCase();
  const stripped = base.replace(/[^a-z0-9]/g, "");
  return Array.from(new Set([base, stripped]));
}

export function matchListing(
  listing: MarketplaceSearchResult,
  catalogue: CatalogueItemRow[]
): MatchResult {
  const title = listing.title ?? "";
  const lower = title.toLowerCase();
  const norm = normalize(title);

  for (const bad of REJECT_KEYWORDS) {
    if (lower.includes(bad)) {
      return { itemId: null, matchedStatus: "rejected", confidence: 0.05, notes: `Rejection keyword: "${bad}"` };
    }
  }

  if (FULL_SIZE_CAR_HINTS.some((h) => lower.includes(h))) {
    return { itemId: null, matchedStatus: "rejected", confidence: 0.1, notes: "Looks like real full-size car" };
  }

  if (!lower.includes("austin") && !lower.includes("a35")) {
    return { itemId: null, matchedStatus: "rejected", confidence: 0.1, notes: "No Austin/A35 reference" };
  }

  const hasVanHint = A35_VAN_HINTS.some((h) => lower.includes(h)) || lower.includes("van");
  const hasScaleHint = SCALE_HINTS_OK.some((h) => lower.includes(h));
  const manufacturerMentioned = KNOWN_MANUFACTURERS.find((m) => lower.includes(m)) ?? null;

  let best: { item: CatalogueItemRow; score: number; reason: string } | null = null;
  for (const item of catalogue) {
    let score = 0;
    const reasons: string[] = [];

    const refTokens = tokenizeRef(item.reference_number);
    const normNoSpaces = norm.replace(/\s+/g, "");
    const refHit = refTokens.find((t) => t.length >= 4 && (norm.includes(t) || normNoSpaces.includes(t)));
    if (refHit) { score += 0.6; reasons.push(`ref "${refHit}"`); }

    if (item.manufacturer && lower.includes(item.manufacturer.toLowerCase())) {
      score += 0.15; reasons.push(`mfr "${item.manufacturer}"`);
    }

    if (item.livery && item.livery.length > 3) {
      const liveryWords = item.livery.toLowerCase().split(/[\s/-]+/).filter((w) => w.length > 3);
      const liveryHit = liveryWords.find((w) => lower.includes(w));
      if (liveryHit) { score += 0.15; reasons.push(`livery "${liveryHit}"`); }
    }

    if (hasVanHint) score += 0.05;
    if (hasScaleHint) score += 0.05;

    if (!best || score > best.score) best = { item, score, reason: reasons.join(", ") };
  }

  if (best && best.score >= 0.6) {
    return { itemId: best.item.id, matchedStatus: "matched", confidence: Math.min(0.99, best.score), notes: `High: ${best.reason}` };
  }
  if (best && best.score >= 0.3) {
    return { itemId: best.item.id, matchedStatus: "possible_match", confidence: best.score, notes: `Possible: ${best.reason}` };
  }
  if (hasVanHint && (manufacturerMentioned || hasScaleHint)) {
    return { itemId: null, matchedStatus: "new_candidate", confidence: 0.4, notes: `Unknown variant${manufacturerMentioned ? ` (${manufacturerMentioned})` : ""}` };
  }
  return { itemId: null, matchedStatus: "rejected", confidence: 0.2, notes: "Insufficient A35 van model indicators" };
}
