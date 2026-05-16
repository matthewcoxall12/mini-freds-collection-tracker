'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useCollection } from '@/context/CollectionContext';

interface MarketplaceSummary {
  ebay_count: number;
  vinted_count: number;
  total_count: number;
  lowest_price: number | null;
  lowest_price_currency: string | null;
  last_seen_at: string | null;
  best_image_url: string | null;
  best_listing_url: string | null;
}

interface MissingItem {
  id: string;
  name: string;
  manufacturer: string;
  range_name: string | null;
  reference_number: string;
  scale: string;
  rarity: string;
  status: string;
  image_url: string | null;
  user_item: {
    id: string;
    priority_wanted: boolean | null;
    watch_url: string | null;
  } | null;
  marketplace: MarketplaceSummary;
}

type ActiveFilter =
  | 'priority' | 'no_image' | 'confirmed' | '1:43' | 'uncertain'
  | 'has_ebay' | 'has_vinted' | 'has_marketplace';

type SortMode = 'priority' | 'manufacturer' | 'rarity' | 'reference' | 'lowest_price' | 'last_seen';

const RARITY_ORDER: Record<string, number> = {
  legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4,
};

const STATUS_COLOURS: Record<string, string> = {
  uncertain: 'text-yellow-600 dark:text-yellow-400',
  duplicate: 'text-orange-600 dark:text-orange-400',
  kit: 'text-sky-600 dark:text-sky-400',
  'non-1:43': 'text-zinc-500',
};

const RARITY_COLOURS: Record<string, string> = {
  legendary: 'text-amber-600 dark:text-amber-400',
  epic: 'text-purple-600 dark:text-purple-400',
  rare: 'text-blue-600 dark:text-blue-400',
  uncommon: 'text-green-600 dark:text-green-400',
};

function fmtPrice(p: number | null | undefined, ccy: string | null | undefined): string {
  if (p == null) return '';
  const sym = ccy === 'GBP' ? '£' : ccy === 'USD' ? '$' : ccy === 'EUR' ? '€' : '';
  return `${sym}${p.toFixed(2)}`;
}

function fmtAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function buildEbayUrl(item: MissingItem): string {
  const q = encodeURIComponent(`${item.manufacturer} ${item.reference_number} Austin A35`.trim());
  return `https://www.ebay.co.uk/sch/i.html?_nkw=${q}&LH_PrefLoc=1`;
}

function buildVintedUrl(item: MissingItem): string {
  const q = encodeURIComponent(`${item.manufacturer} ${item.reference_number}`.trim());
  return `https://www.vinted.co.uk/catalog?search_text=${q}`;
}

function MissingRow({
  item,
  onPriorityToggle,
}: {
  item: MissingItem;
  onPriorityToggle: (itemId: string, current: boolean) => void;
}) {
  const { collectedIds, toggle } = useCollection();
  const [toggling, setToggling] = useState(false);
  const isPriority = item.user_item?.priority_wanted ?? false;
  const isCollected = collectedIds.has(item.id);
  const mp = item.marketplace;

  const handleCollect = async (e: React.MouseEvent) => {
    e.preventDefault();
    setToggling(true);
    await toggle(item.id, !isCollected);
    setToggling(false);
  };

  if (isCollected) return null;

  const hasMarketplace = mp.total_count > 0;

  return (
    <div className="flex items-start gap-3 px-3 py-3 border-b border-border last:border-0 hover:bg-surface-muted transition group">
      <button
        type="button"
        onClick={() => onPriorityToggle(item.id, isPriority)}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition text-sm mt-1',
          isPriority ? 'text-amber-500 hover:text-amber-400' : 'text-muted-foreground/30 hover:text-amber-400'
        )}
        title={isPriority ? 'Remove from priority' : 'Mark as priority'}
      >
        ★
      </button>

      <div className="w-12 h-12 flex-shrink-0 rounded bg-surface-muted flex items-center justify-center overflow-hidden">
        {item.image_url || mp.best_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url ?? mp.best_image_url ?? ''} alt="" className="w-full h-full object-contain" />
        ) : (
          <span className="text-[8px] font-bold text-muted-foreground/30">A35</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={`/item/${item.id}`} className="block min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-accent transition">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.manufacturer}
            {item.reference_number && <span className="font-mono ml-1.5">#{item.reference_number}</span>}
            {item.range_name && <span className="ml-1.5">· {item.range_name}</span>}
          </p>
        </Link>

        {hasMarketplace && (
          <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[11px]">
            {mp.ebay_count > 0 && (
              <a href={buildEbayUrl(item)} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:opacity-80 transition">
                <strong>eBay {mp.ebay_count}</strong>
              </a>
            )}
            {mp.vinted_count > 0 && (
              <a href={buildVintedUrl(item)} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 hover:opacity-80 transition">
                <strong>Vinted {mp.vinted_count}</strong>
              </a>
            )}
            {mp.lowest_price != null && (
              <a href={mp.best_listing_url ?? '#'} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-foreground font-semibold hover:text-accent">
                from {fmtPrice(mp.lowest_price, mp.lowest_price_currency)}
              </a>
            )}
            {mp.last_seen_at && (
              <span className="text-muted-foreground">· seen {fmtAgo(mp.last_seen_at)}</span>
            )}
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-2 flex-shrink-0 mt-1">
        {item.scale && item.scale !== '1:43' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground">{item.scale}</span>
        )}
        {item.status && item.status !== 'confirmed' && (
          <span className={cn('text-[10px] capitalize', STATUS_COLOURS[item.status] ?? 'text-muted-foreground')}>{item.status}</span>
        )}
        {item.rarity && item.rarity !== 'common' && (
          <span className={cn('text-[10px] capitalize', RARITY_COLOURS[item.rarity] ?? 'text-muted-foreground/60')}>{item.rarity}</span>
        )}
        {item.user_item?.watch_url && (
          <a href={item.user_item.watch_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent hover:bg-accent/20 transition">
            Watch →
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={handleCollect}
        disabled={toggling}
        className={cn('flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition mt-1', 'border-border hover:border-accent')}
        title="Mark as collected"
      >
        {toggling && <span className="text-[8px]">…</span>}
      </button>
    </div>
  );
}

export default function MissingPage() {
  const [items, setItems] = useState<MissingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Set<ActiveFilter>>(new Set());
  const [sort, setSort] = useState<SortMode>('priority');
  const [priorityIds, setPriorityIds] = useState<Set<string>>(new Set());

  const retry = () => setFetchTrigger(n => n + 1);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/missing?limit=500&_=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        const data = await res.json();
        const fetched: MissingItem[] = data.data || [];
        if (cancelled) return;
        setItems(fetched);
        setPriorityIds(new Set(fetched.filter(i => i.user_item?.priority_wanted).map(i => i.id)));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [fetchTrigger]);

  const toggleFilter = (f: ActiveFilter) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const handlePriorityToggle = useCallback(async (itemId: string, current: boolean) => {
    const next = !current;
    setPriorityIds(prev => {
      const s = new Set(prev);
      if (next) s.add(itemId); else s.delete(itemId);
      return s;
    });
    setItems(prev => prev.map(i =>
      i.id === itemId
        ? { ...i, user_item: { ...(i.user_item ?? { id: '', watch_url: null }), priority_wanted: next } }
        : i
    ));
    const res = await fetch('/api/collection/priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, priority_wanted: next }),
    });
    if (!res.ok) {
      setPriorityIds(prev => {
        const s = new Set(prev);
        if (current) s.add(itemId); else s.delete(itemId);
        return s;
      });
      setItems(prev => prev.map(i =>
        i.id === itemId
          ? { ...i, user_item: { ...(i.user_item ?? { id: '', watch_url: null }), priority_wanted: current } }
          : i
      ));
    }
  }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (activeFilters.has('priority')) result = result.filter(i => priorityIds.has(i.id));
    if (activeFilters.has('no_image')) result = result.filter(i => !i.image_url);
    if (activeFilters.has('confirmed')) result = result.filter(i => i.status === 'confirmed');
    if (activeFilters.has('1:43')) result = result.filter(i => i.scale === '1:43');
    if (activeFilters.has('uncertain')) result = result.filter(i => i.status === 'uncertain');
    if (activeFilters.has('has_ebay')) result = result.filter(i => i.marketplace.ebay_count > 0);
    if (activeFilters.has('has_vinted')) result = result.filter(i => i.marketplace.vinted_count > 0);
    if (activeFilters.has('has_marketplace')) result = result.filter(i => i.marketplace.total_count > 0);

    return [...result].sort((a, b) => {
      if (sort === 'priority') {
        const ap = priorityIds.has(a.id) ? 0 : 1;
        const bp = priorityIds.has(b.id) ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return a.manufacturer.localeCompare(b.manufacturer) || a.name.localeCompare(b.name);
      }
      if (sort === 'rarity') {
        const ar = RARITY_ORDER[a.rarity] ?? 4;
        const br = RARITY_ORDER[b.rarity] ?? 4;
        if (ar !== br) return ar - br;
        return a.name.localeCompare(b.name);
      }
      if (sort === 'reference') {
        return (a.reference_number ?? '').localeCompare(b.reference_number ?? '', undefined, { numeric: true });
      }
      if (sort === 'lowest_price') {
        const ap = a.marketplace.lowest_price ?? Number.POSITIVE_INFINITY;
        const bp = b.marketplace.lowest_price ?? Number.POSITIVE_INFINITY;
        if (ap !== bp) return ap - bp;
        return a.name.localeCompare(b.name);
      }
      if (sort === 'last_seen') {
        const at = a.marketplace.last_seen_at ?? '';
        const bt = b.marketplace.last_seen_at ?? '';
        if (at !== bt) return bt.localeCompare(at);
        return a.name.localeCompare(b.name);
      }
      return a.manufacturer.localeCompare(b.manufacturer) || a.name.localeCompare(b.name);
    });
  }, [items, activeFilters, sort, priorityIds]);

  const priorityCount = priorityIds.size;
  const noImageCount = items.filter(i => !i.image_url).length;
  const ebayCount = items.filter(i => i.marketplace.ebay_count > 0).length;
  const vintedCount = items.filter(i => i.marketplace.vinted_count > 0).length;
  const marketplaceCount = items.filter(i => i.marketplace.total_count > 0).length;

  const FILTERS: { key: ActiveFilter; label: string; count?: number }[] = [
    { key: 'priority', label: '★ Priority', count: priorityCount },
    { key: 'has_marketplace', label: 'Has listings', count: marketplaceCount },
    { key: 'has_ebay', label: 'eBay', count: ebayCount },
    { key: 'has_vinted', label: 'Vinted', count: vintedCount },
    { key: 'no_image', label: 'No image', count: noImageCount },
    { key: 'confirmed', label: 'Confirmed only' },
    { key: '1:43', label: '1:43 only' },
    { key: 'uncertain', label: 'Uncertain' },
  ];

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Hunting</p>
        <h1 className="text-4xl font-semibold tracking-tight">Still to Find</h1>
        <p className="text-muted-foreground">Your shopping list — catalogue items not yet in your collection, with live marketplace matches.</p>
      </header>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-border bg-surface animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button onClick={retry} className="text-sm underline hover:no-underline flex-shrink-0">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-border bg-surface">
          <p className="font-medium text-foreground">You have them all.</p>
          <p className="text-sm text-muted-foreground mt-1">No missing items in your collection.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <button key={f.key} type="button" onClick={() => toggleFilter(f.key)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border transition',
                    activeFilters.has(f.key)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface border-border text-muted-foreground hover:border-accent/50 hover:text-foreground'
                  )}>
                  {f.label}
                  {f.count !== undefined && f.count > 0 && <span className="ml-1 opacity-70">{f.count}</span>}
                </button>
              ))}
            </div>

            <div className="sm:ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <select value={sort} onChange={e => setSort(e.target.value as SortMode)}
                className="text-xs rounded border border-border bg-surface px-2 py-1 text-foreground focus:outline-none focus:border-accent">
                <option value="priority">Priority first</option>
                <option value="lowest_price">Lowest price</option>
                <option value="last_seen">Recently seen</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="rarity">Rarity</option>
                <option value="reference">Reference #</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} to find
            {priorityCount > 0 && <span className="ml-2 text-amber-500">· {priorityCount} priority</span>}
            {marketplaceCount > 0 && <span className="ml-2 text-accent">· {marketplaceCount} with live listings</span>}
          </div>

          <section className="rounded-lg border border-border bg-surface overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">No items match the active filters.</div>
            ) : (
              filtered.map(item => (
                <MissingRow key={item.id} item={item} onPriorityToggle={handlePriorityToggle} />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
