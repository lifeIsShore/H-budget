/**
 * hooks/usePurposes.ts
 *
 * Loads purposes (with optional balance aggregation) and exposes
 * insert/update/delete mutations that reload the list automatically.
 */

import { useCallback, useEffect, useState } from "react";
import {
  getPurposes,
  getPurposesWithBalances,
  insertPurpose,
  updatePurpose,
  deletePurpose,
  type PurposeRow,
  type PurposeWithBalance,
} from "@/db/repositories/purposeRepo";

// ─── basic list (no balance) ──────────────────────────────────────────────────

export function usePurposes() {
  const [purposes, setPurposes] = useState<PurposeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setPurposes(await getPurposes());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (name: string) => {
      await insertPurpose(name);
      await reload();
    },
    [reload]
  );

  const edit = useCallback(
    async (id: string, name: string) => {
      await updatePurpose(id, name);
      await reload();
    },
    [reload]
  );

  const remove = useCallback(
    async (id: string) => {
      await deletePurpose(id);
      await reload();
    },
    [reload]
  );

  return { purposes, loading, reload, add, edit, remove };
}

// ─── with balance aggregation (Dashboard / Stats) ────────────────────────────

export function usePurposesWithBalances() {
  const [purposes, setPurposes] = useState<PurposeWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setPurposes(await getPurposesWithBalances());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { purposes, loading, reload };
}
