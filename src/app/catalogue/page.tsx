'use client';

import { useEffect, useState } from 'react';
import { ItemGrid } from '@/components/items/ItemGrid';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterBar } from '@/components/filters/FilterBar';
import { ItemWithCollection } from '@/types/item';
import { CatalogueFilters } from '@/types/filters';

const DEFAULT_FILTERS: CatalogueFilters = {
  query: '',
  manufacturers: [],
  scales: [],
  rarities: [],
  statuses: []
};

export default function CataloguePage() {
  const [items, setItems] = useState<ItemWithCollection[]>([]);
  const [filters, setFilters] = useState<CatalogueFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (filters.query) query.append('query', filters.query);
        if (filters.manufacturers.length > 0) query.append('manufacturers', filters.manufacturers.join(','));
        if (filters.scales.length > 0) query.append('scales', filters.scales.join(','));
        if (filters.rarities.length > 0) query.append('rarities', filters.rarities.join(','));
        if (filters.statuses.length > 0) query.append('statuses', filters.statuses.join(','));

        const response = await fetch(`/api/items?${query}`);
        if (!response.ok) throw new Error('Failed to fetch items');
        const data = await response.json();
        setItems(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Collection</p>
        <h1 className="text-4xl font-semibold tracking-tight">Catalogue</h1>
        <p className="text-muted-foreground max-w-2xl">Browse the complete collection of known Austin A35 van diecast models.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex-shrink-0">
          <FilterBar filters={filters} />
        </div>

        <div className="flex-1 space-y-6">
          <SearchBar placeholder="Search by name, manufacturer, livery..." onSearch={handleSearch} />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading catalogue...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{items.length} items</p>
              <ItemGrid items={items} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
