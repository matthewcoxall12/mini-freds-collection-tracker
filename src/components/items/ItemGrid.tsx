import type { ItemWithCollection } from "@/types";
import { ItemCard } from "./ItemCard";

export function ItemGrid({ items = [], emptyMessage = "No items found." }: { items?: ItemWithCollection[], emptyMessage?: string }) {
  if (!items.length) return <div className="py-16 text-center text-muted-foreground">{emptyMessage}</div>;
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{items.map(item => <ItemCard key={item.id} item={item} />)}</div>;
}
