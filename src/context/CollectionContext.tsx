'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CollectionContextType {
  collectedIds: Set<string>;
  toggle: (itemId: string, collected: boolean) => Promise<{ error?: string }>;
}

const CollectionContext = createContext<CollectionContextType>({
  collectedIds: new Set(),
  toggle: async () => ({}),
});

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadCollection = async () => {
      try {
        const res = await fetch('/api/collection?limit=500', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setCollectedIds(new Set((data.data ?? []).map((d: { item_id: string }) => d.item_id)));
      } catch (err) {
        console.error('Failed to load collection:', err);
      }
    };

    loadCollection();
  }, []);

  const toggle = useCallback(async (itemId: string, collected: boolean): Promise<{ error?: string }> => {
    setCollectedIds(prev => {
      const next = new Set(prev);
      if (collected) next.add(itemId); else next.delete(itemId);
      return next;
    });

    try {
      const response = await fetch('/api/collection/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, collected }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        setCollectedIds(prev => {
          const next = new Set(prev);
          if (collected) next.delete(itemId); else next.add(itemId);
          return next;
        });
        return { error: data.error || 'Failed to update collection' };
      }

      return {};
    } catch (err) {
      console.error('Toggle error:', err);
      setCollectedIds(prev => {
        const next = new Set(prev);
        if (collected) next.delete(itemId); else next.add(itemId);
        return next;
      });
      return { error: 'Network error - failed to update collection' };
    }
  }, []);

  return (
    <CollectionContext.Provider value={{ collectedIds, toggle }}>
      {children}
    </CollectionContext.Provider>
  );
}

export const useCollection = () => useContext(CollectionContext);
