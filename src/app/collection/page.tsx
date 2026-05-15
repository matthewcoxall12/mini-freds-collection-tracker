'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CollectedItem {
  id: string;
  collected: boolean;
  condition: string | null;
  boxed_status: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  personal_notes: string | null;
  item: {
    id: string;
    name: string;
    manufacturer: string;
    range_name: string | null;
    reference_number: string;
    scale: string;
    rarity: string;
    status: string;
    image_url: string | null;
  } | null;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function OwnedRow({ entry }: { entry: CollectedItem }) {
  const item = entry.item;
  if (!item) return null;
  return (
    <div className="flex items-center gap-3 px-3 py-3 border-b border-border last:border-0 hover:bg-surface-muted transition">
      <div className="w-10 h-10 flex-shrink-0 rounded bg-surface-muted flex items-center justify-center overflow-hidden">
        {item.image_url
          ? <img src={item.image_url} alt="" className="w-full h-full object-contain" />
          : <span className="text-[8px] font-bold text-muted-foreground/30">A35</span>}
      </div>
      <Link href={`/item/${item.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate hover:text-accent transition">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.manufacturer} {item.reference_number && `· #${item.reference_number}`}</p>
      </Link>
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
        {entry.condition && <span className="capitalize">{entry.condition}</span>}
        {entry.boxed_status && <span className="capitalize">{entry.boxed_status}</span>}
        {entry.purchase_price != null && <span className="text-foreground font-medium">£{entry.purchase_price.toFixed(2)}</span>}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const [items, setItems] = useState<CollectedItem[]>([]);
  const [catalogueTotal, setCatalogueTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const retry = () => setFetchTrigger(n => n + 1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [collRes, catRes] = await Promise.all([
          fetch('/api/collection?limit=200'),
          fetch('/api/items?limit=1'),
        ]);
        if (collRes.status === 401) {
          window.location.href = '/signin?redirect=/collection';
          return;
        }
        if (!collRes.ok) throw new Error(`Server error (${collRes.status})`);
        const [collData, catData] = await Promise.all([collRes.json(), catRes.json()]);
        setItems(collData.data || []);
        setCatalogueTotal(catData.total ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchTrigger]);

  const totalValue = items.reduce((sum, e) => sum + (e.purchase_price ?? 0), 0);
  const avgPrice = items.length > 0 ? totalValue / items.length : 0;
  const completion = catalogueTotal > 0 ? Math.round((items.length / catalogueTotal) * 100) : 0;

  const byMfr = items.reduce((acc, e) => {
    const mfr = e.item?.manufacturer ?? 'Unknown';
    acc[mfr] = (acc[mfr] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Personal</p>
        <h1 className="text-4xl font-semibold tracking-tight">My Collection</h1>
        <p className="text-muted-foreground">Items logged as owned from the Austin A35 van catalogue.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4 animate-pulse">
              <div className="h-2.5 bg-surface-muted rounded w-2/3 mb-2" />
              <div className="h-7 bg-surface-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button onClick={retry} className="text-sm underline hover:no-underline flex-shrink-0">Retry</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Owned" value={items.length} sub={`of ${catalogueTotal}`} />
            <StatCard label="Completion" value={`${completion}%`} />
            <StatCard label="Collection Value" value={`£${totalValue.toFixed(2)}`} />
            <StatCard label="Avg Price" value={`£${avgPrice.toFixed(2)}`} />
          </div>

          {Object.keys(byMfr).length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">By manufacturer</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(byMfr).sort((a, b) => b[1] - a[1]).map(([mfr, count]) => (
                  <span key={mfr} className="text-xs px-2.5 py-1 rounded-full bg-surface-muted border border-border text-foreground">
                    {mfr} <span className="text-accent font-semibold">{count}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {items.length === 0 ? (
            <div className="text-center py-16 rounded-lg border border-border bg-surface">
              <p className="text-muted-foreground">You haven&apos;t marked any items as owned yet.</p>
              <Link href="/catalogue" className="mt-2 inline-block text-sm text-accent hover:underline">Browse the catalogue →</Link>
            </div>
          ) : (
            <section className="rounded-lg border border-border bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{items.length} owned item{items.length !== 1 ? 's' : ''}</p>
                <Link href="/missing" className="text-xs text-accent hover:underline">View missing →</Link>
              </div>
              {items.map(entry => <OwnedRow key={entry.id} entry={entry} />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}
