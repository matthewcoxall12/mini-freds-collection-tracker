'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

interface CollectionContextType {
  user: User | null;
  isLoading: boolean;
  collectedIds: Set<string>;
  toggle: (itemId: string, collected: boolean) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType>({
  user: null,
  isLoading: true,
  collectedIds: new Set(),
  toggle: async () => ({}),
  signOut: async () => {},
});

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const supabaseRef = useRef<ReturnType<typeof getSupabaseBrowser> | null>(null);

  useEffect(() => {
    if (!supabaseRef.current) supabaseRef.current = getSupabaseBrowser();
    const supabase = supabaseRef.current;
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('user_items')
          .select('item_id')
          .eq('user_id', user.id)
          .eq('collected', true);
        setCollectedIds(new Set((data ?? []).map(d => d.item_id)));
      }
      setIsLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setCollectedIds(new Set());
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggle = useCallback(async (itemId: string, collected: boolean): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not signed in' };

    setCollectedIds(prev => {
      const next = new Set(prev);
      if (collected) next.add(itemId); else next.delete(itemId);
      return next;
    });

    const response = await fetch('/api/collection/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, collected }),
    });

    if (!response.ok) {
      setCollectedIds(prev => {
        const next = new Set(prev);
        if (collected) next.delete(itemId); else next.add(itemId);
        return next;
      });
      return { error: 'Failed to update collection' };
    }

    return {};
  }, [user]);

  const signOut = useCallback(async () => {
    await supabaseRef.current?.auth.signOut();
    setUser(null);
    setCollectedIds(new Set());
    window.location.href = '/signin';
  }, []);

  return (
    <CollectionContext.Provider value={{ user, isLoading, collectedIds, toggle, signOut }}>
      {children}
    </CollectionContext.Provider>
  );
}

export const useCollection = () => useContext(CollectionContext);
