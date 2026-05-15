import type { ItemRarity, ItemStatus } from "./item";

export type SortField = "name" | "manufacturer" | "reference_number" | "rarity" | "status" | "updated_at";
export type SortDirection = "asc" | "desc";
export type CollectFilter = "all" | "owned" | "missing";
export type ViewMode = "grid" | "list";

export interface CatalogueFilters {
  query: string;
  manufacturers: string[];
  scales: string[];
  rarities: ItemRarity[];
  statuses: ItemStatus[];
  collectFilter: CollectFilter;
}

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export const DEFAULT_FILTERS: CatalogueFilters = {
  query: "",
  manufacturers: [],
  scales: [],
  rarities: [],
  statuses: [],
  collectFilter: "all",
};

export const DEFAULT_SORT: SortOption = {
  field: "manufacturer",
  direction: "asc",
};
