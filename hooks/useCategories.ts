/**
 * hooks/useCategories.ts
 *
 * Mirrors usePurposes — loads categories and exposes CRUD mutations.
 */

import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  insertCategory,
  updateCategory,
  deleteCategory,
  type CategoryRow,
} from "@/db/repositories/categoryRepo";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await getCategories());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (name: string) => {
      await insertCategory(name);
      await reload();
    },
    [reload]
  );

  const edit = useCallback(
    async (id: string, name: string) => {
      await updateCategory(id, name);
      await reload();
    },
    [reload]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteCategory(id);
      await reload();
    },
    [reload]
  );

  return { categories, loading, reload, add, edit, remove };
}
