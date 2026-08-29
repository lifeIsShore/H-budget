/**
 * hooks/useStats.ts
 *
 * Aggregation queries for the Statistics screen.
 * Loads the full stats bundle (summary + all three view types) for a given
 * month in one shot so the screen can switch sub-tabs without extra fetches.
 */

import { useCallback, useEffect, useState } from "react";
import {
  getMonthSummary,
  getStatsByPurpose,
  getStatsByCategory,
  getStatsByVendor,
  getAvailableMonths,
  type MonthSummary,
  type PurposeStat,
  type CategoryStat,
  type VendorStat,
} from "@/db/repositories/statsRepo";

export interface StatsBundle {
  summary: MonthSummary;
  byPurpose: PurposeStat[];
  byCategory: CategoryStat[];
  byVendor: VendorStat[];
}

export function useStats(year: number, month: number) {
  const [stats, setStats] = useState<StatsBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, byPurpose, byCategory, byVendor] = await Promise.all([
        getMonthSummary(year, month),
        getStatsByPurpose(year, month),
        getStatsByCategory(year, month),
        getStatsByVendor(year, month),
      ]);
      setStats({ summary, byPurpose, byCategory, byVendor });
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { stats, loading, reload };
}

export function useAvailableMonths() {
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setMonths(await getAvailableMonths());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { months, loading, reload };
}
