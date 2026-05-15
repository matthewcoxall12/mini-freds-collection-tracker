import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ItemWithCollection } from '@/types/item';

async function getItem(id: string): Promise<ItemWithCollection | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/items/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return { title: 'Not Found' };
  return {
    title: `${item.name} | Mini Freds Collection Tracker`,
    description: `${item.manufacturer} ${item.name} (${item.reference_number})`
  };
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  const rarityColors = {
    common: 'text-gray-500',
    uncommon: 'text-green-600 dark:text-green-400',
    rare: 'text-blue-600 dark:text-blue-400',
    epic: 'text-purple-600 dark:text-purple-400',
    legendary: 'text-yellow-600 dark:text-yellow-400'
  };

  return (
    <div className="space-y-8">
      <Link href="/catalogue" className="text-sm text-accent hover:underline">
        ← Back to Catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg border border-border bg-surface-muted overflow-hidden">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-accent">{item.manufacturer}</p>
            <h1 className="text-4xl font-semibold tracking-tight">{item.name}</h1>
            <p className="text-muted-foreground">{item.reference_number}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Scale</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{item.scale}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Year</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{item.release_year}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Rarity</p>
              <p className={`mt-1 text-lg font-semibold capitalize ${rarityColors[item.rarity]}`}>{item.rarity}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
              <p className="mt-1 text-lg font-semibold text-foreground capitalize">{item.status}</p>
            </div>
          </div>

          {item.user_item && (
            <div className="rounded-lg border border-accent/50 bg-accent/10 p-4 space-y-2">
              <p className="text-sm font-semibold text-accent">In Your Collection</p>
              {item.user_item.condition && (
                <p className="text-sm"><span className="text-muted-foreground">Condition:</span> <span className="capitalize">{item.user_item.condition}</span></p>
              )}
              {item.user_item.boxed_status && (
                <p className="text-sm"><span className="text-muted-foreground">Box:</span> <span className="capitalize">{item.user_item.boxed_status}</span></p>
              )}
              {item.user_item.purchase_price && (
                <p className="text-sm"><span className="text-muted-foreground">Paid:</span> £{item.user_item.purchase_price.toFixed(2)}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h2 className="font-semibold text-foreground">Details</h2>
            {item.livery && <p className="text-sm"><span className="text-muted-foreground">Livery:</span> {item.livery}</p>}
            {item.range_name && <p className="text-sm"><span className="text-muted-foreground">Range:</span> {item.range_name}</p>}
            {item.category && <p className="text-sm"><span className="text-muted-foreground">Category:</span> {item.category}</p>}
            {item.description && <p className="text-sm text-muted-foreground italic">{item.description}</p>}
            {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
