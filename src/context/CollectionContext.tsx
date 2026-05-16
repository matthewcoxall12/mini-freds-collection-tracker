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
        console.log('[CollectionContext] Loading collection from /api/collection');
        const res = await fetch('/api/collection?limit=500', { cache: 'no-store' });
        console.log('[CollectionContext] Response status:', res.status);
        if (!res.ok) {
          console.error('[CollectionContext] Failed response:', res.status, await res.text());
          return;
        }
        const data = await res.json();
        console.log('[CollectionContext] Loaded items:', data.data?.length ?? 0, data);
        setCollectedIds(new Set((data.data ?? []).map((d: { item_id: string }) => d.item_id)));
      } catch (err) {
        console.error('[CollectionContext] Failed to load collection:', err);
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
      console.log('[Toggle] POST /api/collection/toggle', { item_id: itemId, collected });
      const response = await fetch('/api/collection/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, collected }),
      });
      console.log('[Toggle] Response status:', response.status);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Toggle] Failed:', data);
        setCollectedIds(prev => {
          const next = new Set(prev);
          if (collected) next.delete(itemId); else next.add(itemId);
          return next;
        });
        return { error: data.error || 'Failed to update collection' };
      }

      const result = await response.json();
      console.log('[Toggle] Success:', result);
      return {};
    } catch (err) {
      console.error('[Toggle] Network error:', err);
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
