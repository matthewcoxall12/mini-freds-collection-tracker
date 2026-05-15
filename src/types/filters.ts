import type { ItemRarity, ItemStatus, ItemScale } from "./item";

export type SortField = "name" | "manufacturer" | "release_year" | "rarity";
export type SortDirection = "asc" | "desc";

export interface CatalogueFilters {
  query: string;
  manufacturers: string[];
  scales: ItemScale[];
  rarities: ItemRarity[];
  statuses: ItemStatus[];
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
};

export const DEFAULT_SORT: SortOption = {
  field: "manufacturer",
  direction: "asc",
};
