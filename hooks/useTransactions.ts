/**
 * hooks/useTransactions.ts
 *
 * Loads transactions (with optional filters), provides a single-record lookup,
 * and exposes insert/update/delete mutations.
 *
 * The deleted snapshot is returned from `remove()` so callers can pass it to
 * an Undo toast action that calls `restoreTransaction()`.
 */

import { useCallback, useEffect, useState } from "react";
import {
  getTransactions,
  getTransactionById,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  restoreTransaction,
  getUnassignedCount,
  type TransactionUI,
  type InsertTransactionInput,
  type UpdateTransactionInput,
  type TransactionFilters,
} from "@/db/repositories/transactionRepo";

// ─── list ─────────────────────────────────────────────────────────────────────

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<TransactionUI[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTransactions(await getTransactions(filters));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (data: InsertTransactionInput): Promise<TransactionUI> => {
      const t = await insertTransaction(data);
      await reload();
      return t;
    },
    [reload]
  );

  const edit = useCallback(
    async (id: string, data: UpdateTransactionInput): Promise<TransactionUI> => {
      const t = await updateTransaction(id, data);
      await reload();
      return t;
    },
    [reload]
  );

  /**
   * Deletes a transaction and returns the snapshot.
   * Pass the snapshot to an Undo action that calls `undo()`.
   */
  const remove = useCallback(
    async (id: string): Promise<{ snapshot: TransactionUI; undo: () => Promise<void> }> => {
      const snapshot = await deleteTransaction(id);
      await reload();
      return {
        snapshot,
        undo: async () => {
          await restoreTransaction(snapshot);
          await reload();
        },
      };
    },
    [reload]
  );

  return { transactions, loading, reload, add, edit, remove };
}

// ─── single record ────────────────────────────────────────────────────────────

export function useTransaction(id: string) {
  const [transaction, setTransaction] = useState<TransactionUI | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTransaction(await getTransactionById(id));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const edit = useCallback(
    async (data: UpdateTransactionInput): Promise<TransactionUI> => {
      const t = await updateTransaction(id, data);
      setTransaction(t);
      return t;
    },
    [id]
  );

  const remove = useCallback(async (): Promise<{ snapshot: TransactionUI; undo: () => Promise<void> }> => {
    const snapshot = await deleteTransaction(id);
    setTransaction(null);
    return {
      snapshot,
      undo: async () => {
        await restoreTransaction(snapshot);
        setTransaction(snapshot);
      },
    };
  }, [id]);

  return { transaction, loading, reload, edit, remove };
}

// ─── unassigned count (Dashboard badge) ──────────────────────────────────────

export function useUnassignedCount() {
  const [count, setCount] = useState(0);

  const reload = useCallback(async () => {
    setCount(await getUnassignedCount());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { count, reload };
}
