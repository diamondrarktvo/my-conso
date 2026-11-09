import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { randomUUID } from 'expo-crypto';
import { cacheStorage } from '@/src/providers/cache-provider';
import { computeConsumption } from '@/src/lib/consumption';
import { DEFAULT_SETTINGS, type FuelEntry, type Settings } from './types';

const mmkvStorage: StateStorage = {
   getItem: name => cacheStorage.getString(name) ?? null,
   setItem: (name, value) => cacheStorage.set(name, value),
   removeItem: name => {
      cacheStorage.remove(name);
   },
};

export type FuelEntryInput = Omit<FuelEntry, 'id' | 'createdAt' | 'updatedAt'>;

interface FuelState {
   entries: FuelEntry[];
   settings: Settings;
   addEntry: (input: FuelEntryInput) => FuelEntry;
   updateEntry: (id: string, input: FuelEntryInput) => void;
   deleteEntry: (id: string) => void;
   updateSettings: (patch: Partial<Settings>) => void;
   /** Replace everything (import) */
   replaceAll: (data: { entries: FuelEntry[]; settings: Settings }) => void;
   clearAll: () => void;
}

export const useFuelStore = create<FuelState>()(
   persist(
      set => ({
         entries: [],
         settings: DEFAULT_SETTINGS,

         addEntry: input => {
            const now = new Date().toISOString();
            const entry: FuelEntry = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
            set(s => ({ entries: [...s.entries, entry] }));
            return entry;
         },

         updateEntry: (id, input) =>
            set(s => ({
               entries: s.entries.map(e =>
                  e.id === id ? { ...e, ...input, id, createdAt: e.createdAt, updatedAt: new Date().toISOString() } : e,
               ),
            })),

         deleteEntry: id => set(s => ({ entries: s.entries.filter(e => e.id !== id) })),

         updateSettings: patch => set(s => ({ settings: { ...s.settings, ...patch } })),

         replaceAll: ({ entries, settings }) => set({ entries, settings: { ...DEFAULT_SETTINGS, ...settings } }),

         clearAll: () => set({ entries: [], settings: DEFAULT_SETTINGS }),
      }),
      {
         name: 'my-conso-fuel',
         version: 1,
         storage: createJSONStorage(() => mmkvStorage),
         // Only persist data, never derived values or functions
         partialize: s => ({ entries: s.entries, settings: s.settings }),
      },
   ),
);

/** Derived values, recomputed from the entries every time they change. */
export function useConsumption() {
   const entries = useFuelStore(s => s.entries);
   return useMemo(() => computeConsumption(entries), [entries]);
}
