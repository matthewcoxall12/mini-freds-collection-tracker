'use client';
import Link from "next/link";
import { useState } from "react";
import type { ItemWithCollection } from "@/types";
import { useCollection } from "@/context/CollectionContext";
import { cn } from "@/lib/cn";

const STATUS_COLOURS: Record<string, string> = {
  uncertain: "text-yellow-600 dark:text-yellow-400",
  duplicate: "text-orange-600 dark:text-orange-400",
  kit: "text-sky-600 dark:text-sky-400",
  "non-1:43": "text-zinc-500",
};

function ListRow({ item }: { item: ItemWithCollection }) {
  const { collectedIds, toggle } = useCollection();
  const [toggling, setToggling] = useState(false);
  const isCollected = collectedIds.has(item.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { window.location.href = `/signin?redirect=/catalogue`; return; }
    setToggling(true);
    await toggle(item.id, !isCollected);
    setToggling(false);
  };

  return (
    <div className={cn("flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0 hover:bg-surface-muted transition group",
      isCollected && "bg-accent/5")}>
      <button type="button" onClick={handleToggle} disabled={toggling}
        className={cn("flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition",
          isCollected ? "border-accent bg-accent text-white" : "border-border hover:border-accent")}>
        {isCollected && <span className="text-[10px] font-bold leading-none">✓</span>}
      </button>

      <div className="w-8 h-8 flex-shrink-0 rounded bg-surface-muted flex items-center justify-center overflow-hidden">
        {item.image_url
          ? <img src={item.image_url} alt="" className="w-full h-full object-contain" />
          : <span className="text-[8px] text-muted-foreground/40 font-bold">A35</span>}
      </div>

      <Link href={`/item/${item.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate group-hover:text-accent transition">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.manufacturer}</p>
      </Link>

      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
        {item.reference_number && <span className="font-mono text-[11px]">#{item.reference_number}</span>}
        {item.scale && item.scale !== '1:43' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border">{item.scale}</span>
        )}
        {item.status && item.status !== 'confirmed' && (
          <span className={cn("text-[10px] capitalize", STATUS_COLOURS[item.status])}>{item.status}</span>
        )}
        {item.rarity && item.rarity !== 'common' && (
          <span className="text-[10px] capitalize text-muted-foreground/60">{item.rarity}</span>
        )}
      </div>
    </div>
  );
}

export function ItemList({ items }: { items: ItemWithCollection[] }) {
  if (!items.length) return <div className="py-16 text-center text-muted-foreground">No items found.</div>;
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden divide-y divide-border">
      {items.map(item => <ListRow key={item.id} item={item} />)}
    </div>
  );
}
