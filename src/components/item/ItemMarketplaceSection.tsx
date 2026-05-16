'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type Listing = {
  id: string;
  provider: string;
  title: string;
  price: number | null;
  currency: string | null;
  seller_username: string | null;
  matched_status: string | null;
  match_confidence: number | null;
  item_web_url: string;
  image_url: string | null;
  listing_status: string | null;
  last_seen_at: string;
};

type ImageCandidate = {
  id: string;
  provider: string;
  image_url: string;
  source_url: string | null;
  confidence: number | null;
  status: string;
};

function ProviderBadge({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    ebay: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    vinted: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  };
  return (
    <span className={cn('text-[10px] uppercase px-1.5 py-0.5 rounded font-medium', colors[provider] ?? 'bg-zinc-100 text-zinc-700')}>
      {provider}
    </span>
  );
}

function fmtPrice(p: number | null | undefined, ccy: string | null | undefined): string {
  if (p == null) return '';
  const sym = ccy === 'GBP' ? '£' : ccy === 'USD' ? '$' : ccy === 'EUR' ? '€' : '';
  return `${sym}${p.toFixed(2)}`;
}

export function ItemMarketplaceSection({ itemId }: { itemId: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [candidates, setCandidates] = useState<ImageCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const [listRes, candRes] = await Promise.all([
          fetch(`/api/admin/marketplace/listings?item_id=${itemId}&active_only=true&limit=50&_=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/admin/marketplace/image-candidates?item_id=${itemId}&status=pending&limit=20&_=${Date.now()}`, { cache: 'no-store' }),
        ]);
        const listData = listRes.ok ? await listRes.json() : { data: [] };
        const candData = candRes.ok ? await candRes.json() : { data: [] };
        if (!cancelled) {
          setListings(listData.data || []);
          setCandidates(candData.data || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [itemId, refreshTick]);

  const reviewCandidate = async (id: string, status: 'approved' | 'rejected') => {
    setReviewing(id);
    try {
      const res = await fetch(`/api/admin/marketplace/image-candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
        if (status === 'approved') setTimeout(() => window.location.reload(), 600);
      }
    } finally {
      setReviewing(null);
    }
  };

  const ebayListings = listings.filter((l) => l.provider === 'ebay');
  const vintedListings = listings.filter((l) => l.provider === 'vinted');
  const lowestPrice = listings.reduce<Listing | null>((best, l) => {
    if (l.price == null) return best;
    if (!best || (best.price != null && l.price < best.price)) return l;
    return best;
  }, null);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs text-muted-foreground">Loading marketplace data...</p>
      </div>
    );
  }

  if (listings.length === 0 && candidates.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Marketplace</h3>
        <p className="text-xs text-muted-foreground">No live eBay or Vinted listings yet for this model. Run <code className="text-foreground">npm run scan:missing</code> locally to find some.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Marketplace</h3>
        <button onClick={() => setRefreshTick((n) => n + 1)} className="text-[10px] text-muted-foreground hover:text-foreground">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded border border-border p-2">
          <p className="text-muted-foreground">eBay</p>
          <p className="text-lg font-semibold">{ebayListings.length}</p>
        </div>
        <div className="rounded border border-border p-2">
          <p className="text-muted-foreground">Vinted</p>
          <p className="text-lg font-semibold">{vintedListings.length}</p>
        </div>
        <div className="rounded border border-border p-2">
          <p className="text-muted-foreground">Lowest</p>
          <p className="text-lg font-semibold">{lowestPrice?.price != null ? fmtPrice(lowestPrice.price, lowestPrice.currency) : '-'}</p>
        </div>
      </div>

      {candidates.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Image candidates ({candidates.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {candidates.map((c) => (
              <div key={c.id} className="rounded border border-border overflow-hidden flex flex-col">
                <div className="aspect-square bg-surface-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image_url} alt="" className="absolute inset-0 w-full h-full object-contain" />
                  <div className="absolute top-1 left-1"><ProviderBadge provider={c.provider} /></div>
                </div>
                <div className="p-1.5 flex gap-1">
                  <button disabled={reviewing === c.id} onClick={() => reviewCandidate(c.id, 'approved')}
                    className="flex-1 rounded bg-accent px-1.5 py-1 text-[10px] text-white hover:bg-accent-hover transition disabled:opacity-50">
                    Approve
                  </button>
                  <button disabled={reviewing === c.id} onClick={() => reviewCandidate(c.id, 'rejected')}
                    className="flex-1 rounded border border-border px-1.5 py-1 text-[10px] hover:bg-surface-muted transition disabled:opacity-50">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {listings.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Active listings ({listings.length})</p>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {listings.map((l) => (
              <a key={l.id} href={l.item_web_url} target="_blank" rel="noopener noreferrer"
                className="flex gap-2 rounded border border-border hover:border-accent/50 transition p-2">
                <div className="w-12 h-12 flex-shrink-0 rounded bg-surface-muted overflow-hidden flex items-center justify-center">
                  {l.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] text-muted-foreground">no img</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <ProviderBadge provider={l.provider} />
                    {l.matched_status === 'matched' && (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">MATCHED</span>
                    )}
                    {l.matched_status === 'possible_match' && (
                      <span className="text-[9px] text-yellow-600 dark:text-yellow-400 font-medium">POSSIBLE</span>
                    )}
                  </div>
                  <p className="text-[11px] line-clamp-1 hover:text-accent">{l.title}</p>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    {l.price != null && <span className="font-medium text-foreground">{fmtPrice(l.price, l.currency)}</span>}
                    {l.seller_username && <span>{l.seller_username}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
