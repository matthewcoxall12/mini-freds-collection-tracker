import Link from "next/link";
import type { ItemWithCollection } from "@/types";

interface ItemCardProps {
  item: ItemWithCollection;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/${item.id}`} className="group block rounded-lg border border-border bg-surface p-3 hover:border-accent hover:bg-surface-muted transition">
      <div className="aspect-square bg-surface-muted rounded-md mb-3 flex items-center justify-center text-xs text-muted-foreground">
        {item.image_url ? "📷" : "No Image"}
      </div>
      <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-accent">{item.name}</h3>
      <p className="text-xs text-muted-foreground">{item.manufacturer}</p>
      {item.reference_number && <p className="text-xs text-muted-foreground">#{item.reference_number}</p>}
      {item.user_item && <span className="mt-2 inline-block text-[10px] uppercase text-accent font-semibold">✓ Owned</span>}
    </Link>
  );
}
