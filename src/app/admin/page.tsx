'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_PASSWORD = 'coxall12';

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setValue('');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-xs space-y-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-accent">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Tools</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition"
          />
          {error && <p className="text-sm text-red-500">Incorrect password.</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  const handleCatalogueImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/import/catalogue', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Import failed');
      setMessage({ type: 'success', text: `Imported ${data.data?.count ?? 0} items` });
      router.refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/import/collection', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Import failed');
      setMessage({ type: 'success', text: `Imported ${data.data?.count ?? 0} collection items` });
      router.refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/export/collection');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collection-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMessage({ type: 'success', text: 'Collection exported successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Export failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Admin</p>
        <h1 className="text-4xl font-semibold tracking-tight">Admin Tools</h1>
        <p className="text-muted-foreground">Manage catalogue and collection data.</p>
      </header>

      {message && (
        <div className={`rounded-lg border p-4 text-sm ${
          message.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Import Catalogue</h2>
            <p className="text-sm text-muted-foreground">Upload a CSV to add items to the catalogue.</p>
          </div>
          <label className="block rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-accent transition">
            <input type="file" accept=".csv" onChange={handleCatalogueImport} disabled={loading} className="hidden" />
            <p className="text-sm text-muted-foreground">{loading ? 'Importing…' : 'Click to select CSV'}</p>
          </label>
          <p className="text-xs text-muted-foreground">Columns: name, manufacturer, reference_number, scale, livery, rarity, status</p>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Import Collection</h2>
            <p className="text-sm text-muted-foreground">Upload a CSV to bulk-update your collection.</p>
          </div>
          <label className="block rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-accent transition">
            <input type="file" accept=".csv" onChange={handleCollectionImport} disabled={loading} className="hidden" />
            <p className="text-sm text-muted-foreground">{loading ? 'Importing…' : 'Click to select CSV'}</p>
          </label>
          <p className="text-xs text-muted-foreground">Columns: item_id, condition, boxed_status, purchase_price</p>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Export Collection</h2>
            <p className="text-sm text-muted-foreground">Download your full collection as CSV.</p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full rounded-lg border border-accent bg-accent/10 px-4 py-2 text-accent font-medium hover:bg-accent/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Exporting…' : 'Download CSV'}
          </button>
        </section>
      </div>
    </div>
  );
}
