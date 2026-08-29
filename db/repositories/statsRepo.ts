/**
 * db/repositories/statsRepo.ts
 *
 * Read-only aggregation queries for the Statistics screen.
 * All amounts returned as integer cents — callers divide by 100 for display.
 */

import { getDb } from "@/db/database";

// ─── types ────────────────────────────────────────────────────────────────────

export interface MonthSummary {
  receivedCents: number;
  spentCents: number;
}

export interface PurposeStat {
  purposeId: string;
  purposeName: string;
  receivedCents: number;
  spentCents: number;
}

export interface CategoryStat {
  categoryId: string | null;
  categoryName: string;
  totalCents: number;
  pctOfTotal: number;
  transactionCount: number;
}

export interface VendorStat {
  vendor: string;
  totalCents: number;
  pctOfTotal: number;
  transactionCount: number;
}

// ─── month helpers ────────────────────────────────────────────────────────────

/** Returns "YYYY-MM" strings for every month that has at least one transaction */
export async function getAvailableMonths(): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ ym: string }>(
    `SELECT DISTINCT substr(date, 1, 7) AS ym
     FROM transactions
     ORDER BY ym DESC`
  );
  return rows.map((r) => r.ym);
}

// ─── summary ──────────────────────────────────────────────────────────────────

export async function getMonthSummary(
  year: number,
  month: number
): Promise<MonthSummary> {
  const ym = toYM(year, month);
  const row = await getDb().getFirstAsync<{
    received_cents: number;
    spent_cents: number;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS received_cents,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS spent_cents
     FROM transactions
     WHERE substr(date, 1, 7) = ?`,
    [ym]
  );
  return {
    receivedCents: row?.received_cents ?? 0,
    spentCents: row?.spent_cents ?? 0,
  };
}

// ─── by purpose ───────────────────────────────────────────────────────────────

export async function getStatsByPurpose(
  year: number,
  month: number
): Promise<PurposeStat[]> {
  const ym = toYM(year, month);
  const rows = await getDb().getAllAsync<{
    purpose_id: string;
    purpose_name: string;
    received_cents: number;
    spent_cents: number;
  }>(
    `SELECT
       p.id   AS purpose_id,
       p.name AS purpose_name,
       COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS received_cents,
       COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_cents
     FROM purposes p
     LEFT JOIN transactions t
       ON t.purpose_id = p.id AND substr(t.date, 1, 7) = ?
     WHERE p.is_active = 1
     GROUP BY p.id
     ORDER BY spent_cents DESC, received_cents DESC`,
    [ym]
  );
  return rows.map((r) => ({
    purposeId: r.purpose_id,
    purposeName: r.purpose_name,
    receivedCents: r.received_cents,
    spentCents: r.spent_cents,
  }));
}

// ─── by category ─────────────────────────────────────────────────────────────

export async function getStatsByCategory(
  year: number,
  month: number
): Promise<CategoryStat[]> {
  const ym = toYM(year, month);
  const rows = await getDb().getAllAsync<{
    category_id: string | null;
    category_name: string;
    total_cents: number;
    transaction_count: number;
  }>(
    `SELECT
       t.category_id,
       COALESCE(c.name, 'Uncategorized') AS category_name,
       SUM(t.amount)                     AS total_cents,
       COUNT(*)                          AS transaction_count
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.type = 'expense' AND substr(t.date, 1, 7) = ?
     GROUP BY t.category_id
     ORDER BY total_cents DESC`,
    [ym]
  );

  const grandTotal = rows.reduce((s, r) => s + r.total_cents, 0);

  return rows.map((r) => ({
    categoryId: r.category_id,
    categoryName: r.category_name,
    totalCents: r.total_cents,
    pctOfTotal: grandTotal > 0 ? r.total_cents / grandTotal : 0,
    transactionCount: r.transaction_count,
  }));
}

// ─── by vendor ────────────────────────────────────────────────────────────────

export async function getStatsByVendor(
  year: number,
  month: number
): Promise<VendorStat[]> {
  const ym = toYM(year, month);
  const rows = await getDb().getAllAsync<{
    vendor: string;
    total_cents: number;
    transaction_count: number;
  }>(
    `SELECT
       COALESCE(vendor, '(no vendor)') AS vendor,
       SUM(amount)                      AS total_cents,
       COUNT(*)                         AS transaction_count
     FROM transactions
     WHERE type = 'expense' AND substr(date, 1, 7) = ?
     GROUP BY vendor
     ORDER BY total_cents DESC`,
    [ym]
  );

  const grandTotal = rows.reduce((s, r) => s + r.total_cents, 0);

  return rows.map((r) => ({
    vendor: r.vendor,
    totalCents: r.total_cents,
    pctOfTotal: grandTotal > 0 ? r.total_cents / grandTotal : 0,
    transactionCount: r.transaction_count,
  }));
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function toYM(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}
