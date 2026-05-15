'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(authError === 'auth_failed' ? 'Sign-in link expired. Try again.' : null);

  const supabase = getSupabaseBrowser();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email — a sign-in link has been sent.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push(redirect);
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Private</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            <span className="text-accent">Mini</span> Freds
          </h1>
          <p className="text-sm text-muted-foreground">Austin A35 Collection Tracker</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition placeholder:text-muted-foreground/50"
              placeholder="your@email.com"
            />
          </div>

          {mode === 'password' && (
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent transition"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : mode === 'magic' ? 'Send sign-in link' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'password' ? 'magic' : 'password'); setError(null); setMessage(null); }}
            className="w-full text-xs text-muted-foreground hover:text-foreground text-center transition py-1"
          >
            {mode === 'password' ? 'Use magic link instead →' : '← Use password instead'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
