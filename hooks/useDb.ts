/**
 * hooks/useDb.ts
 *
 * Initialises the SQLite database exactly once at app start.
 * Returns { dbReady } — components that need data should wait for true.
 *
 * Usage: call in _layout.tsx, then gate rendering on dbReady.
 */

import { useEffect, useState } from "react";
import { initDb } from "@/db/database";

let _initPromise: Promise<void> | null = null;

export function useDb() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!_initPromise) {
      _initPromise = initDb();
    }
    _initPromise
      .then(() => setDbReady(true))
      .catch((e: Error) => {
        setError(e);
        console.error("[useDb] Failed to initialise database:", e);
      });
  }, []);

  return { dbReady, dbError: error };
}
