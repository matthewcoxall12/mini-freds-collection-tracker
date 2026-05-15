'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setError('Not logged in. Please log in to access admin tools.');
          setLoading(false);
          return;
        }

        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        if (!adminEmail) {
          setError('Admin email not configured');
          setLoading(false);
          return;
        }

        if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
          setError('You are not authorised to access this page.');
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        setLoading(false);
      } catch {
        setError('Error checking authentication');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleCatalogueImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/catalogue', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setMessage({ type: 'success', text: `Imported ${data.data?.count || 0} items` });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' });
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

      const response = await fetch('/api/import/collection', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setMessage({ type: 'success', text: `Imported ${data.data?.count || 0} collection items` });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/export/collection');

      if (!response.ok) {
        throw new Error('Export failed');
      }

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
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Export failed' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-accent">Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight">Admin Tools</h1>
        </header>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-accent">Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight">Admin Tools</h1>
        </header>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error || 'Not authorised'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Admin</p>
        <h1 className="text-4xl font-semibold tracking-tight">Admin Tools</h1>
        <p className="text-muted-foreground max-w-2xl">Manage catalogue and collection data.</p>
      </header>

      {message && (
        <div className={`rounded-lg border p-4 ${
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
            <p className="text-sm text-muted-foreground">Upload a CSV file to add items to the catalogue.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-accent transition">
              <input
                type="file"
                accept=".csv"
                onChange={handleCatalogueImport}
                disabled={loading}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                {loading ? 'Importing...' : 'Click to select CSV file'}
              </p>
            </label>
            <p className="text-xs text-muted-foreground">
              CSV format: name, manufacturer, reference_number, scale, livery, rarity, status
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Import Collection</h2>
            <p className="text-sm text-muted-foreground">Upload a CSV file to add items to your collection.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-accent transition">
              <input
                type="file"
                accept=".csv"
                onChange={handleCollectionImport}
                disabled={loading}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                {loading ? 'Importing...' : 'Click to select CSV file'}
              </p>
            </label>
            <p className="text-xs text-muted-foreground">
              CSV format: item_id, condition, boxed_status, purchase_price
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Export Collection</h2>
            <p className="text-sm text-muted-foreground">Download your collection as a CSV file.</p>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full rounded-lg border border-accent bg-accent/10 px-4 py-2 text-accent font-medium hover:bg-accent/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Exporting...' : 'Download CSV'}
          </button>
        </section>
      </div>
    </div>
  );
}
