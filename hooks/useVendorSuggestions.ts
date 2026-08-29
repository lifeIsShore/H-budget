/**
 * hooks/useVendorSuggestions.ts
 *
 * Debounced prefix query for the Quick-Add vendor autocomplete field.
 * Returns distinct vendor names from real transactions instead of the
 * old static sampleData list.
 */

import { useEffect, useState } from "react";
import { getVendorSuggestions } from "@/db/repositories/transactionRepo";

export function useVendorSuggestions(prefix: string, delayMs = 120) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const trimmed = prefix.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await getVendorSuggestions(trimmed);
        // Filter out exact matches (already typed)
        setSuggestions(results.filter((v) => v.toLowerCase() !== trimmed.toLowerCase()));
      } catch {
        setSuggestions([]);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [prefix, delayMs]);

  return suggestions;
}
