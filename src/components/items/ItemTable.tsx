import type { ItemWithCollection } from "@/types";

export function ItemTable({ items = [] }: { items?: ItemWithCollection[] }) {
  if (!items.length) return <div className="py-8 text-center text-muted-foreground">No items found.</div>;
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm"><thead className="bg-surface-muted text-left text-xs uppercase text-muted-foreground">
        <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Manufacturer</th><th className="px-3 py-2">Year</th><th className="px-3 py-2">Rarity</th><th className="px-3 py-2">Owned</th></tr>
      </thead><tbody>{items.map(item => <tr key={item.id} className="border-t border-border hover:bg-surface-muted">
        <td className="px-3 py-2 font-medium">{item.name}</td><td className="px-3 py-2">{item.manufacturer}</td><td className="px-3 py-2">{item.release_year || "-"}</td><td className="px-3 py-2 text-accent">{item.rarity}</td><td className="px-3 py-2">{item.user_item ? "✓" : "-"}</td>
      </tr>)}</tbody></table>
    </div>
  );
}
