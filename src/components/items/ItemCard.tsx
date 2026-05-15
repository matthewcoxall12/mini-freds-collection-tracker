import Link from "next/link";
import { useState } from "react";
import type { ItemWithCollection } from "@/types";
import { useCollection } from "@/context/CollectionContext";
import { cn } from "@/lib/cn";

const RARITY_COLOURS: Record<string, string> = {
  common: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  uncommon: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  rare: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  epic: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  legendary: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

const STATUS_COLOURS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  uncertain: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  duplicate: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  kit: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  "non-1:43": "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

interface ItemCardProps {
  item: ItemWithCollection;
}

export function ItemCard({ item }: ItemCardProps) {
  const { collectedIds, toggle } = useCollection();
  const [toggling, setToggling] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const isCollected = collectedIds.has(item.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    setToggling(true);
    try {
      const { error } = await toggle(item.id, !isCollected);
      if (error) {
        setFeedback(error);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(null);
      }
    } catch (err) {
      console.error('Toggle failed:', err);
      setFeedback('Error updating collection');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={cn("group relative flex flex-col rounded-lg border bg-surface hover:border-accent hover:bg-surface-muted transition overflow-hidden",
      isCollected ? "border-accent/60" : "border-border")}>
      <Link href={`/item/${item.id}`} className="flex flex-col flex-1">
        <div className="aspect-square bg-surface-muted flex flex-col items-center justify-center gap-1 p-3 text-center">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
          ) : (
            <>
              <span className="text-2xl font-bold text-muted-foreground/20">A35</span>
              <span className="text-[9px] text-muted-foreground/40 leading-tight">No image</span>
            </>
          )}
        </div>

        <div className="p-2.5 flex flex-col gap-1 flex-1">
          <h3 className="text-xs font-semibold line-clamp-2 leading-snug group-hover:text-accent">{item.name}</h3>
          <p className="text-[11px] text-muted-foreground leading-tight">{item.manufacturer}</p>
          {item.reference_number && <p className="text-[10px] text-muted-foreground/70 font-mono">#{item.reference_number}</p>}

          <div className="flex flex-wrap gap-1 mt-1">
            {item.scale && item.scale !== '1:43' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 font-medium">{item.scale}</span>
            )}
            {item.status && item.status !== 'confirmed' && (
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", STATUS_COLOURS[item.status] ?? "bg-zinc-100 text-zinc-500")}>{item.status}</span>
            )}
            {item.rarity && item.rarity !== 'common' && (
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", RARITY_COLOURS[item.rarity] ?? "")}>{item.rarity}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Collected toggle */}
      <div className="px-2.5 pb-2.5">
        {feedback && <p className="text-[10px] text-red-500 mb-1">{feedback}</p>}
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          className={cn(
            "w-full text-[11px] py-1 rounded border transition font-medium",
            isCollected
              ? "bg-accent/15 border-accent/50 text-accent hover:bg-accent/25"
              : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
          )}
        >
          {toggling ? '…' : isCollected ? '✓ Owned' : 'Mark owned'}
        </button>
      </div>
    </div>
  );
}
