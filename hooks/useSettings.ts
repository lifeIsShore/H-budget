/**
 * hooks/useSettings.ts
 *
 * Read and write the app-wide settings stored in the SQLite `settings` table.
 * Opening balance is exposed in major currency units (euros) for the UI,
 * stored internally as integer cents.
 */

import { useCallback, useEffect, useState } from "react";
import {
  getAllSettings,
  setSetting,
  setOpeningBalance as dbSetOpeningBalance,
  type AppSettings,
} from "@/db/repositories/settingsRepo";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const s = await getAllSettings();
      setSettings(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveOpeningBalance = useCallback(
    async (euros: number) => {
      await dbSetOpeningBalance(euros);
      await reload();
    },
    [reload]
  );

  const saveCurrency = useCallback(
    async (code: string) => {
      await setSetting("currency", code);
      await setSetting("currency_symbol", code); // keep them in sync for now
      await reload();
    },
    [reload]
  );

  return {
    settings,
    loading,
    reload,
    saveOpeningBalance,
    saveCurrency,
    /** Opening balance as a display float (e.g. 3000.00), null while loading */
    openingBalanceEuros: settings ? settings.openingBalance / 100 : null,
    currency: settings?.currency ?? "EUR",
  };
}
