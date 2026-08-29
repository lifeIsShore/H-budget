/**
 * db/repositories/settingsRepo.ts
 *
 * Key-value settings table access. All callers use typed getters/setters
 * so nothing ever reads raw strings directly from the DB.
 */

import { getDb } from "@/db/database";

export interface AppSettings {
  openingBalance: number; // integer cents
  currency: string;       // e.g. "EUR"
  currencySymbol: string; // e.g. "EUR"
  onboardingCompleted: boolean;
  appVersion: string;
}

// ─── read ─────────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    [key]
  );
  return row?.value ?? null;
}

export async function getAllSettings(): Promise<AppSettings> {
  const rows = await getDb().getAllAsync<{ key: string; value: string }>(
    "SELECT key, value FROM settings"
  );
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  return {
    openingBalance: parseInt(map["opening_balance"] ?? "0", 10),
    currency: map["currency"] ?? "EUR",
    currencySymbol: map["currency_symbol"] ?? "EUR",
    onboardingCompleted: map["onboarding_completed"] === "true",
    appVersion: map["app_version"] ?? "1.0.0",
  };
}

// ─── write ────────────────────────────────────────────────────────────────────

export async function setSetting(key: string, value: string): Promise<void> {
  await getDb().runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value]
  );
}

/** Convenience: store opening balance as integer cents */
export async function setOpeningBalance(euros: number): Promise<void> {
  const cents = Math.round(euros * 100);
  await setSetting("opening_balance", String(cents));
}
