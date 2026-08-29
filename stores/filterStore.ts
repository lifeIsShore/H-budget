/**
 * stores/filterStore.ts
 *
 * Zustand store for the Ledger's active filter state.
 * The Filter Sheet writes here; the Ledger screen reads from here.
 * This replaces the old router-params-only approach and fixes the open
 * TODO: "Filter Sheet selections don't flow back to Ledger."
 */

import { create } from "zustand";
import type { TransactionType } from "@/db/repositories/transactionRepo";

export interface FilterState {
  type: TransactionType | null;
  purposeId: string | null;
  categoryId: string | null;
  dateFrom: string | null; // ISO date "YYYY-MM-DD"
  dateTo: string | null;
  unassignedOnly: boolean;
}

const EMPTY: FilterState = {
  type: null,
  purposeId: null,
  categoryId: null,
  dateFrom: null,
  dateTo: null,
  unassignedOnly: false,
};

interface FilterStore {
  filters: FilterState;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: EMPTY,
  setFilters: (f) => {
    const next = { ...get().filters, ...f };
    set({
      filters: next,
      hasActiveFilters: !isEmptyFilter(next),
    });
  },
  resetFilters: () => set({ filters: EMPTY, hasActiveFilters: false }),
  hasActiveFilters: false,
}));

function isEmptyFilter(f: FilterState): boolean {
  return (
    f.type === null &&
    f.purposeId === null &&
    f.categoryId === null &&
    f.dateFrom === null &&
    f.dateTo === null &&
    !f.unassignedOnly
  );
}
