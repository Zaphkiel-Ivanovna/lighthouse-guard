import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

export type ListLayout = 'list' | 'grid';

type ListLayoutState = { readonly layout: ListLayout };

export const useListLayoutStore = create<ListLayoutState>()(
  persist((): ListLayoutState => ({ layout: 'list' }), {
    name: 'lighthouse-list-layout',
    version: 1,
    storage: createJSONStorage(() => mmkvStateStorage),
  }),
);

export const useListLayout = () => useListLayoutStore((state) => state.layout);

export function toggleListLayout(): void {
  useListLayoutStore.setState((state) => ({ layout: state.layout === 'list' ? 'grid' : 'list' }));
}
