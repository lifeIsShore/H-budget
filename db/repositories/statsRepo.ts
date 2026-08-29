/**
 * db/repositories/statsRepo.ts
 *
 * Read-only aggregation queries for the Statistics screen.
 * All amounts returned as integer cents — callers divide by 100 for display.
 *
 * Month filtering uses a `date >= ? AND date < ?` range rather than
 * `substr(date, 1, 7) = ?`. Wrapping an indexed column in a SQL function
 * prevents SQLite from using idx_transactions_date for a seek — it falls
 * back to a full table scan every time. A range comparison on the raw
 * column lets the index do its job; ISO "YYYY-MM-DD" strings sort
 * correctly as text, so this is a pure performance fix with identical
 * results.
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

/**
 * [start, end) half-open range for a given year/month, as ISO date strings.
 * `date >= start AND date < end` is index-friendly, unlike substr(date,1,7)=ym.
 */
function monthRange(year: number, month: number): { start: string; end: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${pad(nextMonth)}-01`;
  return { start, end };
}

// ─── summary ──────────────────────────────────────────────────────────────────

export async function getMonthSummary(
  year: number,
  month: number
): Promise<MonthSummary> {
  const { start, end } = monthRange(year, month);
  const row = await getDb().getFirstAsync<{
    received_cents: number;
    spent_cents: number;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS received_cents,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS spent_cents
     FROM transactions
     WHERE date >= ? AND date < ?`,
    [start, end]
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
  const { start, end } = monthRange(year, month);
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
       ON t.purpose_id = p.id AND t.date >= ? AND t.date < ?
     WHERE p.is_active = 1
     GROUP BY p.id
     ORDER BY spent_cents DESC, received_cents DESC`,
    [start, end]
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
  const { start, end } = monthRange(year, month);
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
     WHERE t.type = 'expense' AND t.date >= ? AND t.date < ?
     GROUP BY t.category_id
     ORDER BY total_cents DESC`,
    [start, end]
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
  const { start, end } = monthRange(year, month);
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
     WHERE type = 'expense' AND date >= ? AND date < ?
     GROUP BY vendor
     ORDER BY total_cents DESC`,
    [start, end]
  );

  const grandTotal = rows.reduce((s, r) => s + r.total_cents, 0);

  return rows.map((r) => ({
    vendor: r.vendor,
    totalCents: r.total_cents,
    pctOfTotal: grandTotal > 0 ? r.total_cents / grandTotal : 0,
    transactionCount: r.transaction_count,
  }));
}
