'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useCollection } from '@/context/CollectionContext';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { Item } from '@/types/item';

interface UserItemDetail {
  id: string;
  condition: string | null;
  boxed_status: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  personal_notes: string | null;
  priority_wanted: boolean | null;
  storage_location: string | null;
  watch_url: string | null;
}

const RARITY_COLOURS: Record<string, string> = {
  legendary: 'text-amber-600 dark:text-amber-400',
  epic: 'text-purple-600 dark:text-purple-400',
  rare: 'text-blue-600 dark:text-blue-400',
  uncommon: 'text-green-600 dark:text-green-400',
  common: 'text-muted-foreground',
};

const STATUS_COLOURS: Record<string, string> = {
  confirmed: 'text-emerald-600 dark:text-emerald-400',
  uncertain: 'text-yellow-600 dark:text-yellow-400',
  duplicate: 'text-orange-600 dark:text-orange-400',
  kit: 'text-sky-600 dark:text-sky-400',
  'non-1:43': 'text-zinc-500',
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-border last:border-0 text-sm">
      <span className="w-32 flex-shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground flex-1">{value}</span>
    </div>
  );
}

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const { collectedIds, toggle, user } = useCollection();
  const [item, setItem] = useState<Item | null>(null);
  const [userItem, setUserItem] = useState<UserItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCollected = collectedIds.has(id);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) { setError('Item not found'); return; }
        const data = await res.json();
        setItem(data.data);
      } catch {
        setError('Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
    const fetchUserItem = async () => {
      if (!user) { setUserItem(null); return; }
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from('user_items')
        .select('id, condition, boxed_status, purchase_price, purchase_date, personal_notes, priority_wanted, storage_location, watch_url')
        .eq('item_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setUserItem(data ?? null);
    };
    fetchUserItem();
  }, [id, user]);

  const handleToggle = async () => {
    if (!user) { window.location.href = `/signin?redirect=/item/${id}`; return; }
    setToggling(true);
    await toggle(id, !isCollected);
    setToggling(false);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-4 bg-surface-muted rounded w-32" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-lg bg-surface-muted" />
          <div className="space-y-4">
            <div className="h-3 bg-surface-muted rounded w-24" />
            <div className="h-9 bg-surface-muted rounded w-3/4" />
            <div className="h-4 bg-surface-muted rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-4">
        <Link href="/catalogue" className="text-sm text-accent hover:underline">← Back to Catalogue</Link>
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted-foreground">{error ?? 'Item not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <Link href="/catalogue" className="text-sm text-accent hover:underline inline-block">
        ← Back to Catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg border border-border bg-surface-muted overflow-hidden flex items-center justify-center">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-4" />
          ) : (
            <div className="text-center space-y-1">
              <p className="text-5xl font-bold text-muted-foreground/20">A35</p>
              <p className="text-xs text-muted-foreground/40">No image available</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-accent">{item.manufacturer}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{item.name}</h1>
            {item.reference_number && (
              <p className="text-muted-foreground font-mono text-sm">#{item.reference_number}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={cn(
              'w-full py-2.5 rounded-lg border font-medium text-sm transition',
              isCollected
                ? 'bg-accent/15 border-accent/50 text-accent hover:bg-accent/25'
                : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground bg-surface'
            )}
          >
            {toggling ? '…' : isCollected ? '✓ In your collection' : 'Mark as owned'}
          </button>

          {isCollected && userItem && (
            <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 space-y-0">
              {userItem.condition && <DetailRow label="Condition" value={<span className="capitalize">{userItem.condition}</span>} />}
              {userItem.boxed_status && <DetailRow label="Box" value={<span className="capitalize">{userItem.boxed_status}</span>} />}
              {userItem.purchase_price != null && <DetailRow label="Paid" value={`£${userItem.purchase_price.toFixed(2)}`} />}
              {userItem.purchase_date && <DetailRow label="Purchased" value={new Date(userItem.purchase_date).toLocaleDateString('en-GB')} />}
              {userItem.storage_location && <DetailRow label="Location" value={userItem.storage_location} />}
              {userItem.personal_notes && <DetailRow label="Notes" value={userItem.personal_notes} />}
              {userItem.watch_url && (
                <DetailRow label="Watch listing" value={
                  <a href={userItem.watch_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate block">
                    {userItem.watch_url}
                  </a>
                } />
              )}
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface p-4 space-y-0">
            <DetailRow label="Scale" value={item.scale} />
            <DetailRow label="Rarity" value={
              <span className={cn('capitalize font-medium', RARITY_COLOURS[item.rarity])}>
                {item.rarity}
              </span>
            } />
            <DetailRow label="Status" value={
              <span className={cn('capitalize', STATUS_COLOURS[item.status] ?? '')}>
                {item.status}
              </span>
            } />
            {item.release_year && <DetailRow label="Release year" value={item.release_year} />}
            {item.range_name && <DetailRow label="Range" value={item.range_name} />}
            {item.livery && <DetailRow label="Livery" value={item.livery} />}
            {item.category && <DetailRow label="Category" value={item.category} />}
          </div>

          {(item.description || item.notes) && (
            <div className="space-y-2 text-sm text-muted-foreground">
              {item.description && <p className="italic">{item.description}</p>}
              {item.notes && <p>{item.notes}</p>}
            </div>
          )}

          {item.image_url && item.image_source_name && (
            <p className="text-xs text-muted-foreground">
              Image:{' '}
              {item.image_source_url
                ? <a href={item.image_source_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{item.image_source_name}</a>
                : item.image_source_name}
              {item.image_verified && <span className="ml-2 text-emerald-600 dark:text-emerald-400">· Verified</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
