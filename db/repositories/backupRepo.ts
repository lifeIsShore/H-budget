/**
 * db/repositories/backupRepo.ts
 *
 * Export and restore functionality:
 *   - exportCsv()   → UTF-8 CSV string of all transactions
 *   - exportJson()  → full JSON backup (all tables, per 04_Data_Model.md)
 *   - importJson()  → validate, clear, and re-insert from backup JSON
 *
 * File I/O (expo-file-system / expo-sharing) is handled in the Settings
 * screen hook — this layer is pure data serialisation.
 */

import { getDb } from "@/db/database";
import { getAllSettings, setSetting } from "./settingsRepo";

// ─── CSV export ───────────────────────────────────────────────────────────────

export async function exportCsv(): Promise<string> {
  const rows = await getDb().getAllAsync<{
    id: string;
    type: string;
    amount: number;
    date: string;
    vendor: string | null;
    purpose_name: string | null;
    category_name: string | null;
    note: string | null;
    created_at: string;
  }>(
    `SELECT
       t.id, t.type, t.amount, t.date, t.vendor,
       p.name AS purpose_name,
       c.name AS category_name,
       t.note, t.created_at
     FROM transactions t
     LEFT JOIN purposes  p ON p.id = t.purpose_id
     LEFT JOIN categories c ON c.id = t.category_id
     ORDER BY t.date DESC, t.created_at DESC`
  );

  const header = "id,type,amount_cents,date,vendor,purpose,category,note,created_at";
  const escapeCell = (v: string | number | null | undefined): string => {
    if (v == null) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = rows.map((r: any) =>
    [r.id, r.type, r.amount, r.date, r.vendor, r.purpose_name, r.category_name, r.note, r.created_at]
      .map(escapeCell)
      .join(",")
  );

  return [header, ...lines].join("\n");
}

// ─── JSON export ──────────────────────────────────────────────────────────────

export interface BackupJson {
  app: "h-budget";
  version: string;
  exported_at: string;
  data: {
    settings: Record<string, string>;
    purposes: object[];
    categories: object[];
    transactions: object[];
  };
}

export async function exportJson(): Promise<BackupJson> {
  const db = getDb();
  const settings = await getAllSettings();
  const settingsMap: Record<string, string> = {
    opening_balance: String(settings.openingBalance),
    currency: settings.currency,
    currency_symbol: settings.currencySymbol,
    onboarding_completed: String(settings.onboardingCompleted),
    app_version: settings.appVersion,
  };

  const purposes = await db.getAllAsync(
    "SELECT id, name, color, sort_order, is_active, created_at FROM purposes"
  );
  const categories = await db.getAllAsync(
    "SELECT id, name, sort_order, is_active, created_at FROM categories"
  );
  const transactions = await db.getAllAsync(
    `SELECT id, type, amount, date, vendor, purpose_id, category_id, note, created_at, updated_at
     FROM transactions ORDER BY date ASC, created_at ASC`
  );

  return {
    app: "h-budget",
    version: settings.appVersion,
    exported_at: new Date().toISOString(),
    data: {
      settings: settingsMap,
      purposes: purposes as object[],
      categories: categories as object[],
      transactions: transactions as object[],
    },
  };
}

// ─── JSON import ──────────────────────────────────────────────────────────────

export async function importJson(jsonString: string): Promise<void> {
  let backup: BackupJson;
  try {
    backup = JSON.parse(jsonString) as BackupJson;
  } catch {
    throw new Error("Invalid backup file — could not parse JSON.");
  }

  if (backup.app !== "h-budget") {
    throw new Error('Invalid backup file — "app" field must be "h-budget".');
  }
  if (!backup.data) {
    throw new Error("Invalid backup file — missing data section.");
  }

  const db = getDb();

  // Clear all tables (order matters — transactions reference purposes/categories)
  await db.execAsync(`
    DELETE FROM audit_log;
    DELETE FROM transactions;
    DELETE FROM categories;
    DELETE FROM purposes;
    DELETE FROM settings;
  `);

  // Restore settings
  for (const [key, value] of Object.entries(backup.data.settings ?? {})) {
    await setSetting(key, String(value));
  }

  // Restore purposes
  for (const p of backup.data.purposes ?? []) {
    const r = p as Record<string, unknown>;
    await db.runAsync(
      `INSERT OR IGNORE INTO purposes (id, name, color, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [r.id, r.name, r.color ?? null, r.sort_order ?? 0, r.is_active ?? 1, r.created_at] as any[]
    );
  }

  // Restore categories
  for (const c of backup.data.categories ?? []) {
    const r = c as Record<string, unknown>;
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, name, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [r.id, r.name, r.sort_order ?? 0, r.is_active ?? 1, r.created_at] as any[]
    );
  }

  // Restore transactions
  for (const t of backup.data.transactions ?? []) {
    const r = t as Record<string, unknown>;
    await db.runAsync(
      `INSERT OR IGNORE INTO transactions
         (id, type, amount, date, vendor, purpose_id, category_id, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.id, r.type, r.amount, r.date,
        r.vendor ?? null, r.purpose_id ?? null, r.category_id ?? null,
        r.note ?? null, r.created_at, r.updated_at ?? r.created_at,
      ] as any[]
    );
  }
}
