/**
 * db/database.ts
 *
 * Single entry-point for SQLite. Opens the database file, runs the schema
 * migration (idempotent — safe to call on every launch), and seeds default
 * Purposes, Categories, and Settings on first run.
 *
 * ALL monetary amounts are stored as INTEGER cents (e.g. EUR 23.50 → 2350).
 * Never store or read floats for money — convert at the UI boundary only.
 *
 * Usage:
 *   import { getDb, initDb } from '@/db/database';
 *   await initDb();          // call once in _layout.tsx
 *   const db = getDb();      // then call anywhere
 */

import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

// ─── singleton ────────────────────────────────────────────────────────────────

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error("Database not initialised — call initDb() first.");
  return _db;
}

// ─── schema ───────────────────────────────────────────────────────────────────

const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS purposes (
  id          TEXT PRIMARY KEY NOT NULL,
  name        TEXT NOT NULL UNIQUE,
  color       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY NOT NULL,
  name        TEXT NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id           TEXT PRIMARY KEY NOT NULL,
  type         TEXT NOT NULL CHECK(type IN ('income','expense','adjustment')),
  amount       INTEGER NOT NULL,
  date         TEXT NOT NULL,
  vendor       TEXT,
  purpose_id   TEXT REFERENCES purposes(id),
  category_id  TEXT REFERENCES categories(id),
  note         TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_purpose  ON transactions(purpose_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type     ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor   ON transactions(vendor COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id             TEXT PRIMARY KEY NOT NULL,
  transaction_id TEXT NOT NULL,
  action         TEXT NOT NULL CHECK(action IN ('create','update','delete')),
  previous_state TEXT,
  new_state      TEXT,
  changed_at     TEXT NOT NULL
);
`;

// ─── seed data ────────────────────────────────────────────────────────────────

const DEFAULT_PURPOSES = ["High School", "University", "General"];
const DEFAULT_CATEGORIES = ["Travel", "Food", "Equipment", "Software", "Other"];

const DEFAULT_SETTINGS: Record<string, string> = {
  opening_balance: "0",
  currency: "EUR",
  currency_symbol: "EUR",
  onboarding_completed: "false",
  app_version: "1.0.0",
};

// ─── init ─────────────────────────────────────────────────────────────────────

export async function initDb(): Promise<void> {
  if (_db) return; // already initialised

  _db = await SQLite.openDatabaseAsync("h-budget.db");

  // Run schema migration — each statement is idempotent (IF NOT EXISTS)
  await _db.execAsync(SCHEMA_SQL);

  // Seed defaults only on first run (check settings table)
  await seedIfFirstRun(_db);
}

async function seedIfFirstRun(db: SQLite.SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'onboarding_completed'"
  );

  if (existing) return; // already seeded

  const now = new Date().toISOString();

  // Insert default settings
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.runAsync(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      [key, value]
    );
  }

  // Insert default purposes
  for (let i = 0; i < DEFAULT_PURPOSES.length; i++) {
    await db.runAsync(
      `INSERT OR IGNORE INTO purposes (id, name, sort_order, is_active, created_at)
       VALUES (?, ?, ?, 1, ?)`,
      [Crypto.randomUUID(), DEFAULT_PURPOSES[i], i, now]
    );
  }

  // Insert default categories
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, name, sort_order, is_active, created_at)
       VALUES (?, ?, ?, 1, ?)`,
      [Crypto.randomUUID(), DEFAULT_CATEGORIES[i], i, now]
    );
  }

  // Mark seeding done
  await db.runAsync(
    "UPDATE settings SET value = 'true' WHERE key = 'onboarding_completed'"
  );
}
