'use client';

import { useEffect, useState } from 'react';
import { ItemTable } from '@/components/items/ItemTable';
import { ItemWithCollection } from '@/types/item';

export default function CollectionPage() {
  const [items, setItems] = useState<ItemWithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/collection');
        if (!response.ok) throw new Error('Failed to fetch collection');
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

    fetchCollection();
  }, []);

  const totalValue = items.reduce((sum, item) => {
    return sum + (item.user_item?.purchase_price || 0);
  }, 0);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Personal</p>
        <h1 className="text-4xl font-semibold tracking-tight">My Collection</h1>
        <p className="text-muted-foreground max-w-2xl">Items you&apos;ve logged as owned in your personal collection.</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Items</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{items.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Collection Value</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">£{totalValue.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg Price</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">£{items.length > 0 ? (totalValue / items.length).toFixed(2) : '0.00'}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading collection...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven&apos;t logged any items yet.</p>
        </div>
      ) : (
        <ItemTable items={items} />
      )}
    </div>
  );
}
