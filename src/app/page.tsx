'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCollection } from '@/context/CollectionContext';

interface DashStats {
  owned: number;
  catalogueTotal: number;
  totalValue: number;
  priorityCount: number;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function DashLink({ href, title, desc, badge }: { href: string; title: string; desc: string; badge?: string | number }) {
  return (
    <Link href={href} className="rounded-lg border border-border bg-surface p-5 hover:border-accent hover:bg-surface-muted transition flex items-start justify-between gap-3">
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      {badge !== undefined && badge !== 0 && (
        <span className="flex-shrink-0 mt-0.5 text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </Link>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const [collRes, catRes, missingRes] = await Promise.all([
          fetch('/api/collection?limit=500', { cache: 'no-store' }),
          fetch('/api/items?limit=1', { cache: 'no-store' }),
          fetch('/api/missing?limit=1', { cache: 'no-store' }),
        ]);
        if (!collRes.ok || !catRes.ok) return;
        const [collData, catData] = await Promise.all([collRes.json(), catRes.json()]);
        const items: Array<{ purchase_price: number | null; user_item?: { priority_wanted?: boolean } }> = collData.data ?? [];
        const totalValue = items.reduce((sum, e) => sum + (e.purchase_price ?? 0), 0);

        let priorityCount = 0;
        if (missingRes.ok) {
          const missingData = await missingRes.json();
          priorityCount = missingData.data?.filter((i: { user_item?: { priority_wanted?: boolean } }) => i.user_item?.priority_wanted).length ?? 0;
        }

        setStats({
          owned: collData.total ?? items.length,
          catalogueTotal: catData.total ?? 0,
          totalValue,
          priorityCount,
        });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const completion = stats && stats.catalogueTotal > 0
    ? Math.round((stats.owned / stats.catalogueTotal) * 100)
    : 0;

  const missing = stats ? stats.catalogueTotal - stats.owned : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Dashboard</p>
        <h1 className="text-4xl font-semibold tracking-tight">Mini Freds</h1>
        <p className="text-muted-foreground max-w-2xl">Track every Austin A35 van diecast model you own, what you&apos;re hunting for, and your completion percentage.</p>
      </header>

      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4 animate-pulse">
              <div className="h-2.5 bg-surface-muted rounded w-2/3 mb-2" />
              <div className="h-7 bg-surface-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Owned" value={stats.owned} sub={`of ${stats.catalogueTotal}`} />
          <StatCard label="Missing" value={missing} />
          <StatCard label="Completion" value={`${completion}%`} />
          <StatCard label="Collection Value" value={`£${stats.totalValue.toFixed(2)}`} />
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4">
        <DashLink
          href="/catalogue"
          title="Browse Catalogue"
          desc="Explore all known Austin A35 van models."
          badge={stats?.catalogueTotal}
        />
        <DashLink
          href="/collection"
          title="My Collection"
          desc="Items you've logged as owned."
          badge={stats?.owned}
        />
        <DashLink
          href="/missing"
          title="Still to Find"
          desc="Your shopping and hunting list."
          badge={missing || undefined}
        />
        <DashLink href="/admin" title="Admin Tools" desc="Manage the catalogue and audit images." />
      </div>
    </div>
  );
}
