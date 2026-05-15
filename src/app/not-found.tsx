import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-y-8 text-center py-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Item Not Found</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">This model doesn&apos;t exist in our catalogue, or it may have been removed.</p>
      </div>

      <Link href="/catalogue" className="inline-block rounded-lg border border-accent bg-accent/10 px-4 py-2 text-accent hover:bg-accent/20 transition">
        Browse Catalogue
      </Link>
    </div>
  );
}
