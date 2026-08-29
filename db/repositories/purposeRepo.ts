/**
 * db/repositories/purposeRepo.ts
 *
 * CRUD for the `purposes` table.
 * Balance computations (received / spent) are derived from `transactions`
 * via SQL aggregation — never stored on the purposes row itself.
 */

import { getDb } from "@/db/database";
import * as Crypto from "expo-crypto";

// ─── types ────────────────────────────────────────────────────────────────────

export interface PurposeRow {
  id: string;
  name: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface PurposeWithBalance extends PurposeRow {
  receivedCents: number;
  spentCents: number;
}

// ─── read ─────────────────────────────────────────────────────────────────────

export async function getPurposes(): Promise<PurposeRow[]> {
  const rows = await getDb().getAllAsync<{
    id: string;
    name: string;
    color: string | null;
    sort_order: number;
    is_active: number;
    created_at: string;
  }>(
    "SELECT id, name, color, sort_order, is_active, created_at FROM purposes WHERE is_active = 1 ORDER BY sort_order ASC, name ASC"
  );
  return rows.map(mapRow);
}

export async function getPurposesWithBalances(): Promise<PurposeWithBalance[]> {
  const rows = await getDb().getAllAsync<{
    id: string;
    name: string;
    color: string | null;
    sort_order: number;
    is_active: number;
    created_at: string;
    received_cents: number;
    spent_cents: number;
  }>(`
    SELECT
      p.id, p.name, p.color, p.sort_order, p.is_active, p.created_at,
      COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS received_cents,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_cents
    FROM purposes p
    LEFT JOIN transactions t ON t.purpose_id = p.id
    WHERE p.is_active = 1
    GROUP BY p.id
    ORDER BY p.sort_order ASC, p.name ASC
  `);

  return rows.map((r: {
    id: string;
    name: string;
    color: string | null;
    sort_order: number;
    is_active: number;
    created_at: string;
    received_cents: number;
    spent_cents: number;
  }) => ({
    ...mapRow(r),
    receivedCents: r.received_cents,
    spentCents: r.spent_cents,
  }));
}

export async function getPurposeById(id: string): Promise<PurposeRow | null> {
  const row = await getDb().getFirstAsync<{
    id: string;
    name: string;
    color: string | null;
    sort_order: number;
    is_active: number;
    created_at: string;
  }>(
    "SELECT id, name, color, sort_order, is_active, created_at FROM purposes WHERE id = ?",
    [id]
  );
  return row ? mapRow(row) : null;
}

/** Returns true if any transaction references this purpose_id */
export async function isPurposeInUse(id: string): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM transactions WHERE purpose_id = ?",
    [id]
  );
  return (row?.cnt ?? 0) > 0;
}

/** Returns count of active purposes */
export async function activePurposeCount(): Promise<number> {
  const row = await getDb().getFirstAsync<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM purposes WHERE is_active = 1"
  );
  return row?.cnt ?? 0;
}

// ─── write ────────────────────────────────────────────────────────────────────

export async function insertPurpose(name: string): Promise<PurposeRow> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const sortOrder = await nextSortOrder("purposes");
  await getDb().runAsync(
    "INSERT INTO purposes (id, name, sort_order, is_active, created_at) VALUES (?, ?, ?, 1, ?)",
    [id, name.trim(), sortOrder, now]
  );
  return { id, name: name.trim(), color: null, sortOrder, isActive: true, createdAt: now };
}

export async function updatePurpose(id: string, name: string): Promise<void> {
  await getDb().runAsync(
    "UPDATE purposes SET name = ? WHERE id = ?",
    [name.trim(), id]
  );
}

/**
 * Soft-delete (archive) a purpose if it has no transactions.
 * Throws if still in use or if it's the last active purpose.
 */
export async function deletePurpose(id: string): Promise<void> {
  if (await isPurposeInUse(id)) {
    throw new Error("Cannot delete a purpose that has transactions.");
  }
  if ((await activePurposeCount()) <= 1) {
    throw new Error("Must keep at least one active purpose.");
  }
  await getDb().runAsync(
    "UPDATE purposes SET is_active = 0 WHERE id = ?",
    [id]
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function mapRow(r: {
  id: string;
  name: string;
  color: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}): PurposeRow {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    sortOrder: r.sort_order,
    isActive: r.is_active === 1,
    createdAt: r.created_at,
  };
}

async function nextSortOrder(table: string): Promise<number> {
  const row = await getDb().getFirstAsync<{ max_order: number | null }>(
    `SELECT MAX(sort_order) AS max_order FROM ${table}`
  );
  return (row?.max_order ?? -1) + 1;
}
