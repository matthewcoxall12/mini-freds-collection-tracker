'use client';

import { useEffect, useState } from 'react';
import { ItemGrid } from '@/components/items/ItemGrid';
import { ItemWithCollection } from '@/types/item';

export default function MissingPage() {
  const [items, setItems] = useState<ItemWithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissing = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/missing');
        if (!response.ok) throw new Error('Failed to fetch missing items');
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

    fetchMissing();
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Hunting</p>
        <h1 className="text-4xl font-semibold tracking-tight">Missing Items</h1>
        <p className="text-muted-foreground max-w-2xl">Models you want to add to your collection. Your personal shopping list.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading missing items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No missing items marked. You might have them all!</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{items.length} items wanted</p>
          <ItemGrid items={items} />
        </>
      )}
    </div>
  );
}
