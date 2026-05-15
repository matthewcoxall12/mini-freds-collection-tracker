"use client";
import type { CatalogueFilters, SortOption } from "@/types";

export function FilterBar({ filters = {}, sort = { field: "manufacturer", direction: "asc" } }: { filters?: Partial<CatalogueFilters>, sort?: SortOption }) {
  return (
    <aside className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <h2 className="text-sm font-semibold uppercase text-accent">Filters</h2>
      <div className="text-xs text-muted-foreground">
        Query: {filters.query || "(none)"} • Sort: {sort.field} {sort.direction}
      </div>
    </aside>
  );
}
