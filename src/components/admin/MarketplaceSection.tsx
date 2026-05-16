'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type Tab = 'scanner' | 'listings' | 'images' | 'candidates' | 'missing';

type ScanSummary = {
  provider: string;
  queriesRun: number;
  listingsFound: number;
  newListings: number;
  imageCandidatesCreated: number;
  newCatalogueCandidates: number;
  errors: string[];
};

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
  item: { id: string; name: string; manufacturer: string; reference_number: string | null } | null;
};

type ImageCandidate = {
  id: string;
  item_id: string;
  provider: string;
  source_url: string | null;
  image_url: string;
  confidence: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  item: { id: string; name: string; manufacturer: string; reference_number: string | null; image_url: string | null; image_verified: boolean } | null;
};

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-sm rounded-md transition',
        active ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
      )}
    >
      {children}
    </button>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    ebay: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    vinted: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    manual: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  };
  return (
    <span className={cn('text-[10px] uppercase px-1.5 py-0.5 rounded font-medium', colors[provider] ?? colors.manual)}>
      {provider}
    </span>
  );
}

function ScannerTab() {
  const [provider, setProvider] = useState<'ebay' | 'vinted' | 'all'>('ebay');
  const [query, setQuery] = useState('Corgi CC80501 Austin A35');
  const [limit, setLimit] = useState(20);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setRunning(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch('/api/admin/marketplace/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, query, limit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setSummary(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search query"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as 'ebay' | 'vinted' | 'all')}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="ebay">eBay</option>
          <option value="vinted">Vinted</option>
          <option value="all">All</option>
        </select>
        <input
          type="number"
          value={limit}
          min={1}
          max={50}
          onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
          className="w-20 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleScan}
          disabled={running || !query.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition disabled:opacity-50"
        >
          {running ? 'Scanning…' : 'Run scan'}
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
      {summary && (
        <div className="rounded-lg border border-border bg-surface-muted p-4 space-y-2 text-sm">
          <div className="font-semibold">Scan summary ({summary.provider})</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div><span className="text-muted-foreground">Queries:</span> <strong>{summary.queriesRun}</strong></div>
            <div><span className="text-muted-foreground">Listings:</span> <strong>{summary.listingsFound}</strong></div>
            <div><span className="text-muted-foreground">New:</span> <strong>{summary.newListings}</strong></div>
            <div><span className="text-muted-foreground">Image cands:</span> <strong>{summary.imageCandidatesCreated}</strong></div>
            <div><span className="text-muted-foreground">New variants:</span> <strong>{summary.newCatalogueCandidates}</strong></div>
          </div>
          {summary.errors.length > 0 && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">{summary.errors.length} error(s)</summary>
              <ul className="mt-1 list-disc list-inside space-y-0.5">{summary.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function ListingsTab({ filter, missingOnly }: { filter?: string; missingOnly?: boolean }) {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');
  const [matched, setMatched] = useState(filter ?? '');
  const [refreshTick, setRefreshTick] = useState(0);

  const load = () => setRefreshTick((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const sp = new URLSearchParams({ limit: '100', active_only: 'true' });
        if (provider) sp.set('provider', provider);
        if (matched) sp.set('matched_status', matched);
        if (missingOnly) sp.set('missing_only', 'true');
        const res = await fetch(`/api/admin/marketplace/listings?${sp}`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setItems(data.data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [provider, matched, refreshTick, missingOnly]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded border border-border bg-surface px-2 py-1 text-xs">
          <option value="">All providers</option>
          <option value="ebay">eBay</option>
          <option value="vinted">Vinted</option>
        </select>
        <select value={matched} onChange={(e) => setMatched(e.target.value)} className="rounded border border-border bg-surface px-2 py-1 text-xs">
          <option value="">All matches</option>
          <option value="matched">Matched</option>
          <option value="possible_match">Possible</option>
          <option value="new_candidate">New candidates</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={load} className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-muted">Refresh</button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No listings yet. Run a scan first.</p>
          ) : items.map((l) => (
            <div key={l.id} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
              <div className="w-16 h-16 flex-shrink-0 rounded bg-surface-muted overflow-hidden flex items-center justify-center">
                {l.image_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={l.image_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xs text-muted-foreground">no img</span>}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <ProviderBadge provider={l.provider} />
                  {l.matched_status && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{l.matched_status}</span>}
                  {l.match_confidence != null && <span className="text-[10px] text-muted-foreground">{(l.match_confidence * 100).toFixed(0)}%</span>}
                </div>
                <a href={l.item_web_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-accent line-clamp-2">{l.title}</a>
                <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                  {l.price != null && <span className="font-medium text-foreground">{l.currency === 'GBP' ? '£' : ''}{l.price.toFixed(2)}</span>}
                  {l.seller_username && <span>{l.seller_username}</span>}
                  {l.item && <span>→ {l.item.manufacturer} {l.item.reference_number ?? ''}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageCandidatesTab() {
  const [items, setItems] = useState<ImageCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const load = () => setRefreshTick((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/marketplace/image-candidates?status=pending&limit=100', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setItems(data.data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [refreshTick]);

  const review = async (id: string, status: 'approved' | 'rejected') => {
    setReviewing(id);
    try {
      const res = await fetch(`/api/admin/marketplace/image-candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setItems((prev) => prev.filter((it) => it.id !== id));
    } finally { setReviewing(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">{items.length} pending</p>
        <button onClick={load} className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-muted">Refresh</button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground py-8 text-center">No pending image candidates.</p>
          ) : items.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-surface overflow-hidden flex flex-col">
              <div className="aspect-square bg-surface-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image_url} alt="" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute top-1 left-1"><ProviderBadge provider={c.provider} /></div>
              </div>
              <div className="p-3 space-y-2 flex-1 flex flex-col">
                <div>
                  <p className="text-sm font-medium line-clamp-1">{c.item?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{c.item?.manufacturer} {c.item?.reference_number ?? ''}</p>
                  {c.item?.image_verified && <p className="text-[10px] text-amber-600 mt-1">Already has verified image</p>}
                </div>
                {c.confidence != null && <p className="text-[10px] text-muted-foreground">Confidence: {(c.confidence * 100).toFixed(0)}%</p>}
                <div className="flex gap-2 mt-auto">
                  <button disabled={reviewing === c.id} onClick={() => review(c.id, 'approved')} className="flex-1 rounded bg-accent px-2 py-1 text-xs text-white hover:bg-accent-hover transition disabled:opacity-50">Approve</button>
                  <button disabled={reviewing === c.id} onClick={() => review(c.id, 'rejected')} className="flex-1 rounded border border-border px-2 py-1 text-xs hover:bg-surface-muted transition disabled:opacity-50">Reject</button>
                </div>
                {c.source_url && <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline truncate block">Source link</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarketplaceSection() {
  const [tab, setTab] = useState<Tab>('scanner');

  return (
    <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Marketplace Scanner</h2>
        <p className="text-sm text-muted-foreground">Scan eBay UK and Vinted for Austin A35 van listings.</p>
      </div>

      <div className="flex gap-1 border-b border-border pb-2 flex-wrap">
        <TabBtn active={tab === 'scanner'} onClick={() => setTab('scanner')}>Scanner</TabBtn>
        <TabBtn active={tab === 'missing'} onClick={() => setTab('missing')}>Missing Finds</TabBtn>
        <TabBtn active={tab === 'listings'} onClick={() => setTab('listings')}>All Listings</TabBtn>
        <TabBtn active={tab === 'images'} onClick={() => setTab('images')}>Image Candidates</TabBtn>
        <TabBtn active={tab === 'candidates'} onClick={() => setTab('candidates')}>New Variants</TabBtn>
      </div>

      {tab === 'scanner' && <ScannerTab />}
      {tab === 'missing' && <ListingsTab missingOnly />}
      {tab === 'listings' && <ListingsTab />}
      {tab === 'images' && <ImageCandidatesTab />}
      {tab === 'candidates' && <ListingsTab filter="new_candidate" />}
    </section>
  );
}
