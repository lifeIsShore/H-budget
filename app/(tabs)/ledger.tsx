import { useMemo, useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { SwipeableTransactionRow } from "@/components/SwipeableTransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTransactions } from "@/hooks/useTransactions";
import { useFilterStore } from "@/stores/filterStore";
import type { TransactionUI } from "@/db/repositories/transactionRepo";

/**
 * Ledger screen — wired to real SQLite data.
 * Active filters come from the shared Zustand filterStore (written by filter.tsx).
 * The deep-link param ?filter=unassigned (from the Dashboard warning banner) is
 * still supported and sets unassignedOnly in the store on mount.
 */

export default function Ledger() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const { filters, setFilters, hasActiveFilters, resetFilters } = useFilterStore();
  const [query, setQuery] = useState("");

  // Handle the Dashboard's "unassigned" deep-link: set filter on mount
  useFocusEffect(
    useCallback(() => {
      if (filter === "unassigned") {
        setFilters({ unassignedOnly: true });
      }
    }, [filter, setFilters])
  );

  // Build the DB filter from the store (search is handled client-side on the loaded list)
  const dbFilters = useMemo(
    () => ({
      type: filters.type ?? undefined,
      unassignedOnly: filters.unassignedOnly,
      purposeId: filters.purposeId ?? undefined,
      categoryId: filters.categoryId ?? undefined,
      dateFrom: filters.dateFrom ?? undefined,
      dateTo: filters.dateTo ?? undefined,
    }),
    [filters]
  );

  const { transactions, reload } = useTransactions(dbFilters);

  // Reload on every focus so the list stays fresh after edits/deletes
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  // Client-side text search on vendor, category name, and amount
  const filtered = useMemo(() => {
    if (!query.trim()) return transactions;
    const q = query.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        t.vendor?.toLowerCase().includes(q) ||
        t.categoryName?.toLowerCase().includes(q) ||
        t.purposeName?.toLowerCase().includes(q) ||
        String(Math.abs(t.amount)).includes(q)
    );
  }, [transactions, query]);

  // Group by ISO date for section list
  const sections = useMemo(() => {
    const groups = new Map<string, TransactionUI[]>();
    for (const t of filtered) {
      const arr = groups.get(t.date) ?? [];
      arr.push(t);
      groups.set(t.date, arr);
    }
    return Array.from(groups.entries()).map(([date, data]) => ({
      title: formatSectionDate(date),
      total: data.reduce((s, t) => s + t.amount, 0),
      data,
    }));
  }, [filtered]);

  // Active filter chip labels
  const filterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.type) labels.push(filters.type.charAt(0).toUpperCase() + filters.type.slice(1));
    if (filters.unassignedOnly) labels.push("Unassigned only");
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom ? formatShortDate(filters.dateFrom) : "—";
      const to = filters.dateTo ? formatShortDate(filters.dateTo) : "—";
      labels.push(`${from} → ${to}`);
    }
    return labels;
  }, [filters]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      {/* Search + filter row */}
      <View className="flex-row items-center gap-2 px-4 pt-3 pb-2">
        <View
          className="flex-1 flex-row items-center bg-surface-alt border border-border rounded-input px-3"
          style={{ height: 48 }}
        >
          <MaterialIcons name="search" size={18} color="#A39D8E" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search vendor, category, or amount..."
            placeholderTextColor="#A39D8E"
            className="flex-1 font-sans text-[13.5px] text-ink ml-2"
          />
        </View>
        <Pressable
          onPress={() => router.push("/filter")}
          style={{ width: 48, height: 48 }}
          className="items-center justify-center rounded-input border border-border bg-surface-alt active:opacity-70"
        >
          <MaterialIcons name="filter-list" size={20} color="#22211F" />
          {hasActiveFilters && (
            <View className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </Pressable>
      </View>

      {/* Active filter chip bar */}
      {(hasActiveFilters || filterLabels.length > 0) && (
        <View className="flex-row items-center px-4 pb-2 gap-2 flex-wrap">
          {filterLabels.map((label) => (
            <View key={label} className="bg-brand-subtle px-2.5 py-1 rounded-full flex-row items-center gap-1">
              <Text className="font-sans-medium text-[11.5px] text-brand">{label}</Text>
            </View>
          ))}
          <Pressable onPress={resetFilters} hitSlop={8}>
            <Text className="font-sans-medium text-[11.5px] text-negative">Clear All</Text>
          </Pressable>
        </View>
      )}

      {sections.length === 0 ? (
        <EmptyState
          icon="receipt-long"
          title="No transactions found."
          subtitle={
            query || hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Start by adding your first transaction."
          }
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View
              className="flex-row items-center justify-between bg-surface-alt px-4"
              style={{ height: 32 }}
            >
              <Text className="font-sans-medium text-[11.5px] text-ink-muted">
                {section.title}
              </Text>
              <Text
                className={`font-mono text-[11.5px] ${
                  section.total >= 0 ? "text-positive" : "text-negative"
                }`}
              >
                {section.total >= 0 ? "+" : "-"}EUR{" "}
                {Math.abs(section.total).toLocaleString("en-IE", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <SwipeableTransactionRow
              transaction={item}
              onPress={() =>
                router.push({ pathname: "/transaction/[id]", params: { id: item.id } })
              }
              onEdit={() =>
                router.push({
                  pathname: "/transaction/[id]",
                  params: { id: item.id, edit: "1" },
                })
              }
              onDelete={() =>
                router.push({
                  pathname: "/transaction/[id]",
                  params: { id: item.id, confirmDelete: "1" },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatSectionDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IE", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(isoDate: string): string {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-IE", {
    month: "short",
    day: "numeric",
  });
}
