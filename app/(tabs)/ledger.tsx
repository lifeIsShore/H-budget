import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SwipeableTransactionRow } from "@/components/SwipeableTransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { sampleTransactions } from "@/data/sampleData";

/**
 * UI-only, sample data (data/sampleData.ts) — shapes match 04_Data_Model.md
 * so wiring real SQLite queries later is a drop-in. Filter Sheet selections
 * don't persist back here yet (no shared filter state / router params).
 */

// Toggle while building — remove once wired to real data.
const DEMO_STATE: "loaded" | "empty" = "loaded";

export default function Ledger() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const [query, setQuery] = useState("");
  const [showUnassignedOnly] = useState(filter === "unassigned");

  const filtered = useMemo(() => {
    let list = DEMO_STATE === "empty" ? [] : sampleTransactions;
    if (showUnassignedOnly) list = list.filter((t) => !t.purpose);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.vendor?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          String(Math.abs(t.amount)).includes(q),
      );
    }
    return list;
  }, [query, showUnassignedOnly]);

  const sections = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const arr = groups.get(t.date) ?? [];
      arr.push(t);
      groups.set(t.date, arr);
    }
    return Array.from(groups.entries()).map(([date, data]) => ({
      title: date,
      total: data.reduce((s, t) => s + t.amount, 0),
      data,
    }));
  }, [filtered]);

  const hasActiveFilters = showUnassignedOnly;

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
            placeholder="Search vendor, note, or amount..."
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

      {/* Active filter bar */}
      {hasActiveFilters && (
        <View className="flex-row items-center px-4 pb-2 gap-2">
          <View className="bg-brand-subtle px-2.5 py-1 rounded-full flex-row items-center gap-1">
            <Text className="font-sans-medium text-[11.5px] text-brand">Unassigned only</Text>
          </View>
          <Pressable onPress={() => router.setParams({ filter: undefined })} hitSlop={8}>
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
              onPress={() => router.push({ pathname: "/transaction/[id]", params: { id: item.id } })}
              onEdit={() => router.push({ pathname: "/transaction/[id]", params: { id: item.id, edit: "1" } })}
              onDelete={() => router.push({ pathname: "/transaction/[id]", params: { id: item.id, confirmDelete: "1" } })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
