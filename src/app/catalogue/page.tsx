'use client';

import { useEffect, useState, useMemo } from 'react';
import { ItemGrid } from '@/components/items/ItemGrid';
import { ItemList } from '@/components/items/ItemList';
import { FilterBar } from '@/components/filters/FilterBar';
import { useCollection } from '@/context/CollectionContext';
import type { ItemWithCollection } from '@/types/item';
import { DEFAULT_FILTERS, DEFAULT_SORT, type CatalogueFilters, type SortOption, type ViewMode } from '@/types/filters';

export default function CataloguePage() {
  const { collectedIds, user } = useCollection();
  const [allItems, setAllItems] = useState<ItemWithCollection[]>([]);
  const [filters, setFilters] = useState<CatalogueFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.query) params.append('query', filters.query);
        if (filters.manufacturers.length > 0) params.append('manufacturers', filters.manufacturers.join(','));
        if (filters.scales.length > 0) params.append('scales', filters.scales.join(','));
        if (filters.rarities.length > 0) params.append('rarities', filters.rarities.join(','));
        if (filters.statuses.length > 0) params.append('statuses', filters.statuses.join(','));
        params.append('sort', sort.field);
        params.append('dir', sort.direction);
        params.append('limit', '200');

        const response = await fetch(`/api/items?${params}`);
        if (!response.ok) throw new Error('Failed to fetch items');
        const data = await response.json();
        setAllItems(data.data || []);
        setTotal(data.total ?? 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, 250);
    return () => clearTimeout(timer);
  }, [filters.query, filters.manufacturers, filters.scales, filters.rarities, filters.statuses, sort]);

  // Client-side collected filter (uses context so it stays in sync)
  const items = useMemo(() => {
    if (filters.collectFilter === 'all') return allItems;
    if (filters.collectFilter === 'owned') return allItems.filter(i => collectedIds.has(i.id));
    return allItems.filter(i => !collectedIds.has(i.id));
  }, [allItems, filters.collectFilter, collectedIds]);

  const handleFilterChange = (partial: Partial<CatalogueFilters>) =>
    setFilters(prev => ({ ...prev, ...partial }));

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Collection</p>
        <h1 className="text-4xl font-semibold tracking-tight">Catalogue</h1>
        <p className="text-muted-foreground">Browse all {total} known Austin A35 van diecast models.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-56 flex-shrink-0">
          <FilterBar filters={filters} sort={sort} onFilterChange={handleFilterChange} onSortChange={setSort} />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          {/* Search + view mode row */}
          <div className="flex gap-2">
            <input
              type="search"
              value={filters.query}
              onChange={e => handleFilterChange({ query: e.target.value })}
              placeholder="Search name, manufacturer, reference, livery…"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent transition"
            />
            <div className="flex border border-border rounded-lg overflow-hidden">
              {(['grid', 'list'] as ViewMode[]).map(m => (
                <button key={m} type="button" onClick={() => setViewMode(m)}
                  className={`px-3 py-2 text-xs transition ${viewMode === m ? 'bg-accent text-white' : 'bg-surface text-muted-foreground hover:text-foreground'}`}>
                  {m === 'grid' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          {!user && (
            <p className="text-xs text-muted-foreground">
              <a href="/signin" className="text-accent hover:underline">Sign in</a> to track which models you own.
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface animate-pulse">
                  <div className="aspect-square bg-surface-muted rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-surface-muted rounded w-3/4" />
                    <div className="h-2.5 bg-surface-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No items match your filters.</p>
              <button type="button" onClick={() => handleFilterChange(DEFAULT_FILTERS)} className="mt-2 text-sm text-accent hover:underline">Clear filters</button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}{filters.collectFilter !== 'all' ? ` (${filters.collectFilter})` : ''}</p>
              {viewMode === 'grid' ? <ItemGrid items={items} /> : <ItemList items={items} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
