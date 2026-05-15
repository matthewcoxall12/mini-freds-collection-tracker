import Link from "next/link";

export default function HomePage() {
  const stats = { owned: 0, missing: 0, completion: 0 };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Dashboard</p>
        <h1 className="text-4xl font-semibold tracking-tight">Your collection at a glance</h1>
        <p className="text-muted-foreground max-w-2xl">Track every Austin A35 van model you own, what you&apos;re hunting for, and your completion percentage.</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Owned" value={stats.owned} />
        <StatCard label="Missing" value={stats.missing} />
        <StatCard label="Completion" value={`${stats.completion}%`} />
        <StatCard label="Collection Value" value="£0" />
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <DashLink href="/catalogue" title="Browse Catalogue" desc="Explore all known Austin A35 van models." />
        <DashLink href="/collection" title="My Collection" desc="Items you&apos;ve logged as owned." />
        <DashLink href="/missing" title="Missing Items" desc="Your shopping/hunting list." />
        <DashLink href="/admin" title="Admin Tools" desc="Manage the catalogue (restricted)." />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DashLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rounded-lg border border-border bg-surface p-5 hover:border-accent hover:bg-surface-muted transition">
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
