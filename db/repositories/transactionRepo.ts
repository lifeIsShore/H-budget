/**
 * db/repositories/transactionRepo.ts
 *
 * Full CRUD for `transactions` + audit_log writes.
 *
 * Amount convention:
 *   - Stored in the DB as INTEGER cents (positive always).
 *   - The `type` column ('income' | 'expense' | 'adjustment') carries the sign.
 *   - The UI-facing `TransactionUI` shape uses a signed float (negative = expense)
 *     for backward-compat with all existing screen components.
 */

import { getDb } from "@/db/database";
import * as Crypto from "expo-crypto";

// ─── types ────────────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense" | "adjustment";

/** Raw DB row (all amounts in cents, positive) */
export interface TransactionRow {
  id: string;
  type: TransactionType;
  amountCents: number;
  date: string;       // ISO 8601 date "YYYY-MM-DD"
  vendor: string | null;
  purposeId: string | null;
  categoryId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Row enriched with purpose/category names — what the UI consumes */
export interface TransactionUI extends TransactionRow {
  purposeName: string | null;
  categoryName: string | null;
  /** Signed float in major currency units — negative for expense */
  amount: number;
}

export interface InsertTransactionInput {
  type: TransactionType;
  amountCents: number;
  date: string;
  vendor?: string | null;
  purposeId?: string | null;
  categoryId?: string | null;
  note?: string | null;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amountCents?: number;
  date?: string;
  vendor?: string | null;
  purposeId?: string | null;
  categoryId?: string | null;
  note?: string | null;
}

export interface TransactionFilters {
  type?: TransactionType;
  purposeId?: string | null;
  categoryId?: string | null;
  dateFrom?: string; // ISO date
  dateTo?: string;
  unassignedOnly?: boolean;
  limit?: number;
  offset?: number;
}

// ─── read ─────────────────────────────────────────────────────────────────────

export async function getTransactions(
  filters?: TransactionFilters
): Promise<TransactionUI[]> {
  const clauses: string[] = [];
  const params: (string | number | null)[] = [];

  if (filters?.type) {
    clauses.push("t.type = ?");
    params.push(filters.type);
  }
  if (filters?.unassignedOnly) {
    clauses.push("t.purpose_id IS NULL");
  } else if (filters?.purposeId !== undefined) {
    clauses.push("t.purpose_id = ?");
    params.push(filters.purposeId);
  }
  if (filters?.categoryId !== undefined && filters.categoryId !== null) {
    clauses.push("t.category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters?.dateFrom) {
    clauses.push("t.date >= ?");
    params.push(filters.dateFrom);
  }
  if (filters?.dateTo) {
    clauses.push("t.date <= ?");
    params.push(filters.dateTo);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit =
    filters?.limit != null ? `LIMIT ${filters.limit}` : "";
  const offset =
    filters?.offset != null ? `OFFSET ${filters.offset}` : "";

  const sql = `
    SELECT
      t.id, t.type, t.amount, t.date, t.vendor,
      t.purpose_id, t.category_id, t.note, t.created_at, t.updated_at,
      p.name AS purpose_name,
      c.name AS category_name
    FROM transactions t
    LEFT JOIN purposes  p ON p.id = t.purpose_id
    LEFT JOIN categories c ON c.id = t.category_id
    ${where}
    ORDER BY t.date DESC, t.created_at DESC
    ${limit} ${offset}
  `;

  const rows = await getDb().getAllAsync<RawJoinRow>(sql, params);
  return rows.map(mapJoinRow);
}

export async function getTransactionById(id: string): Promise<TransactionUI | null> {
  const row = await getDb().getFirstAsync<RawJoinRow>(
    `SELECT
      t.id, t.type, t.amount, t.date, t.vendor,
      t.purpose_id, t.category_id, t.note, t.created_at, t.updated_at,
      p.name AS purpose_name,
      c.name AS category_name
    FROM transactions t
    LEFT JOIN purposes  p ON p.id = t.purpose_id
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.id = ?`,
    [id]
  );
  return row ? mapJoinRow(row) : null;
}

export async function getVendorSuggestions(prefix: string): Promise<string[]> {
  if (!prefix.trim()) return [];
  const rows = await getDb().getAllAsync<{ vendor: string }>(
    `SELECT DISTINCT vendor FROM transactions
     WHERE vendor IS NOT NULL AND vendor LIKE ? COLLATE NOCASE
     ORDER BY vendor ASC
     LIMIT 8`,
    [`${prefix.trim()}%`]
  );
  return rows.map((r: { vendor: string }) => r.vendor);
}

export async function getUnassignedCount(): Promise<number> {
  const row = await getDb().getFirstAsync<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM transactions WHERE purpose_id IS NULL"
  );
  return row?.cnt ?? 0;
}

// ─── write ────────────────────────────────────────────────────────────────────

export async function insertTransaction(
  data: InsertTransactionInput
): Promise<TransactionUI> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await getDb().runAsync(
    `INSERT INTO transactions
       (id, type, amount, date, vendor, purpose_id, category_id, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.type,
      data.amountCents,
      data.date,
      data.vendor ?? null,
      data.purposeId ?? null,
      data.categoryId ?? null,
      data.note ?? null,
      now,
      now,
    ]
  );

  await writeAuditLog({
    transactionId: id,
    action: "create",
    previousState: null,
    newState: { id, ...data, created_at: now, updated_at: now },
  });

  return (await getTransactionById(id))!;
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput
): Promise<TransactionUI> {
  const existing = await getTransactionById(id);
  if (!existing) throw new Error(`Transaction ${id} not found.`);

  const now = new Date().toISOString();
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.type !== undefined) { fields.push("type = ?"); params.push(data.type); }
  if (data.amountCents !== undefined) { fields.push("amount = ?"); params.push(data.amountCents); }
  if (data.date !== undefined) { fields.push("date = ?"); params.push(data.date); }
  if ("vendor" in data) { fields.push("vendor = ?"); params.push(data.vendor ?? null); }
  if ("purposeId" in data) { fields.push("purpose_id = ?"); params.push(data.purposeId ?? null); }
  if ("categoryId" in data) { fields.push("category_id = ?"); params.push(data.categoryId ?? null); }
  if ("note" in data) { fields.push("note = ?"); params.push(data.note ?? null); }

  fields.push("updated_at = ?");
  params.push(now);
  params.push(id);

  await getDb().runAsync(
    `UPDATE transactions SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  await writeAuditLog({
    transactionId: id,
    action: "update",
    previousState: existing,
    newState: { ...existing, ...data, updatedAt: now },
  });

  return (await getTransactionById(id))!;
}

export async function deleteTransaction(id: string): Promise<TransactionUI> {
  const existing = await getTransactionById(id);
  if (!existing) throw new Error(`Transaction ${id} not found.`);

  await writeAuditLog({
    transactionId: id,
    action: "delete",
    previousState: existing,
    newState: null,
  });

  await getDb().runAsync("DELETE FROM transactions WHERE id = ?", [id]);
  return existing; // returned so callers can Undo (re-insert)
}

/** Re-insert a previously deleted transaction (used by Undo toast) */
export async function restoreTransaction(t: TransactionUI): Promise<void> {
  await getDb().runAsync(
    `INSERT OR IGNORE INTO transactions
       (id, type, amount, date, vendor, purpose_id, category_id, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      t.id,
      t.type,
      t.amountCents,
      t.date,
      t.vendor,
      t.purposeId,
      t.categoryId,
      t.note,
      t.createdAt,
      t.updatedAt,
    ]
  );
}

// ─── audit log ────────────────────────────────────────────────────────────────

async function writeAuditLog(entry: {
  transactionId: string;
  action: "create" | "update" | "delete";
  previousState: object | null;
  newState: object | null;
}): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO audit_log (id, transaction_id, action, previous_state, new_state, changed_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      Crypto.randomUUID(),
      entry.transactionId,
      entry.action,
      entry.previousState ? JSON.stringify(entry.previousState) : null,
      entry.newState ? JSON.stringify(entry.newState) : null,
      new Date().toISOString(),
    ]
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

interface RawJoinRow {
  id: string;
  type: TransactionType;
  amount: number;      // integer cents from DB
  date: string;
  vendor: string | null;
  purpose_id: string | null;
  category_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  purpose_name: string | null;
  category_name: string | null;
}

function mapJoinRow(r: RawJoinRow): TransactionUI {
  const signedAmount = r.type === "income" ? r.amount / 100 : -(r.amount / 100);
  return {
    id: r.id,
    type: r.type,
    amountCents: r.amount,
    amount: signedAmount,
    date: r.date,
    vendor: r.vendor,
    purposeId: r.purpose_id,
    categoryId: r.category_id,
    note: r.note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    purposeName: r.purpose_name,
    categoryName: r.category_name,
  };
}
