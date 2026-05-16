export type MarketplaceProvider = "ebay" | "vinted" | "manual";

export type MarketplaceQueryType =
  | "exact_item"
  | "manufacturer_ref"
  | "general_discovery"
  | "image_search";

export type ListingStatus = "active" | "sold" | "ended" | "reserved" | "unknown";

export type MatchedStatus = "matched" | "possible_match" | "new_candidate" | "rejected";

export type MarketplaceSearchResult = {
  provider: MarketplaceProvider;
  providerItemId: string;
  title: string;
  price?: number;
  currency?: string;
  condition?: string;
  sellerUsername?: string;
  itemWebUrl: string;
  imageUrl?: string;
  additionalImageUrls?: string[];
  listingStatus?: ListingStatus;
  rawPayload?: unknown;
};

export type MarketplaceQuery = {
  provider: MarketplaceProvider;
  query: string;
  itemId?: string | null;
  queryType?: MarketplaceQueryType;
  priority?: number;
  limit?: number;
};

export interface MarketplaceScanner {
  provider: MarketplaceProvider;
  search(query: MarketplaceQuery): Promise<MarketplaceSearchResult[]>;
  available(): { ok: boolean; reason?: string };
}

export type MatchResult = {
  itemId: string | null;
  matchedStatus: MatchedStatus;
  confidence: number;
  notes: string;
};

export type CatalogueItemRow = {
  id: string;
  name: string;
  manufacturer: string;
  range_name: string | null;
  reference_number: string | null;
  livery: string | null;
  scale: string | null;
};

export type ScanSummary = {
  provider: MarketplaceProvider | "all";
  queriesRun: number;
  listingsFound: number;
  newListings: number;
  imageCandidatesCreated: number;
  newCatalogueCandidates: number;
  errors: string[];
  runId?: string;
};
