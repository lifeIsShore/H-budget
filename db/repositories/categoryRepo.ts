/**
 * db/repositories/categoryRepo.ts
 *
 * CRUD for the `categories` table. Mirrors purposeRepo but without
 * balance aggregation — categories are pure classification, not funding pools.
 */

import { getDb } from "@/db/database";
import * as Crypto from "expo-crypto";

// ─── types ────────────────────────────────────────────────────────────────────

export interface CategoryRow {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

// ─── read ─────────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryRow[]> {
  const rows = await getDb().getAllAsync<{
    id: string;
    name: string;
    sort_order: number;
    is_active: number;
    created_at: string;
  }>(
    "SELECT id, name, sort_order, is_active, created_at FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC"
  );
  return rows.map(mapRow);
}

export async function getCategoryById(id: string): Promise<CategoryRow | null> {
  const row = await getDb().getFirstAsync<{
    id: string;
    name: string;
    sort_order: number;
    is_active: number;
    created_at: string;
  }>(
    "SELECT id, name, sort_order, is_active, created_at FROM categories WHERE id = ?",
    [id]
  );
  return row ? mapRow(row) : null;
}

export async function isCategoryInUse(id: string): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM transactions WHERE category_id = ?",
    [id]
  );
  return (row?.cnt ?? 0) > 0;
}

// ─── write ────────────────────────────────────────────────────────────────────

export async function insertCategory(name: string): Promise<CategoryRow> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const sortOrder = await nextSortOrder();
  await getDb().runAsync(
    "INSERT INTO categories (id, name, sort_order, is_active, created_at) VALUES (?, ?, ?, 1, ?)",
    [id, name.trim(), sortOrder, now]
  );
  return { id, name: name.trim(), sortOrder, isActive: true, createdAt: now };
}

export async function updateCategory(id: string, name: string): Promise<void> {
  await getDb().runAsync(
    "UPDATE categories SET name = ? WHERE id = ?",
    [name.trim(), id]
  );
}

/**
 * Soft-delete a category if no transactions reference it.
 * Note: categories have no minimum count constraint (unlike purposes).
 */
export async function deleteCategory(id: string): Promise<void> {
  if (await isCategoryInUse(id)) {
    throw new Error("Cannot delete a category that has transactions.");
  }
  await getDb().runAsync(
    "UPDATE categories SET is_active = 0 WHERE id = ?",
    [id]
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function mapRow(r: {
  id: string;
  name: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}): CategoryRow {
  return {
    id: r.id,
    name: r.name,
    sortOrder: r.sort_order,
    isActive: r.is_active === 1,
    createdAt: r.created_at,
  };
}

async function nextSortOrder(): Promise<number> {
  const row = await getDb().getFirstAsync<{ max_order: number | null }>(
    "SELECT MAX(sort_order) AS max_order FROM categories"
  );
  return (row?.max_order ?? -1) + 1;
}
