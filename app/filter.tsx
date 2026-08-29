import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { usePurposes } from "@/hooks/usePurposes";
import { useCategories } from "@/hooks/useCategories";
import { useFilterStore } from "@/stores/filterStore";
import type { TransactionType } from "@/db/repositories/transactionRepo";

/**
 * Filter Sheet — wired to the shared Zustand filterStore.
 * Selections now persist back to the Ledger screen when Apply is tapped.
 * Purposes and categories loaded from real SQLite data.
 */
export default function FilterSheet() {
  const { filters, setFilters, resetFilters } = useFilterStore();
  const { purposes } = usePurposes();
  const { categories } = useCategories();

  // Local state — only committed to store on Apply
  const [typeFilter, setTypeFilter] = useState<TransactionType | "All">(
    filters.type ?? "All"
  );
  const [selectedPurposeId, setSelectedPurposeId] = useState<string | null | "unassigned">(
    filters.unassignedOnly ? "unassigned" : (filters.purposeId ?? null)
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    filters.categoryId ?? null
  );
  const [fromDate, setFromDate] = useState<Date | null>(
    filters.dateFrom ? new Date(filters.dateFrom) : null
  );
  const [toDate, setToDate] = useState<Date | null>(
    filters.dateTo ? new Date(filters.dateTo) : null
  );

  function reset() {
    setTypeFilter("All");
    setSelectedPurposeId(null);
    setSelectedCategoryId(null);
    setFromDate(null);
    setToDate(null);
  }

  function apply() {
    setFilters({
      type: typeFilter === "All" ? null : (typeFilter as TransactionType),
      unassignedOnly: selectedPurposeId === "unassigned",
      purposeId: selectedPurposeId === "unassigned" || selectedPurposeId === null
        ? null
        : selectedPurposeId,
      categoryId: selectedCategoryId,
      dateFrom: fromDate ? fromDate.toISOString().split("T")[0] : null,
      dateTo: toDate ? toDate.toISOString().split("T")[0] : null,
    });
    router.back();
  }

  function handleReset() {
    reset();
    resetFilters();
    router.back();
  }

  function close() {
    router.back();
  }

  return (
    <View className="flex-1 justify-end">
      <Pressable className="absolute inset-0 bg-[#1C1B1966]" onPress={close} />

      <SafeAreaView edges={["bottom"]} className="bg-surface rounded-t-sheet max-h-[80%]">
        <View className="items-center pt-2.5">
          <View className="w-10 h-1 rounded-full bg-border" />
        </View>

        <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
          <Text className="font-sans-semibold text-[15px] text-ink">Filter Transactions</Text>
          <Pressable
            onPress={close}
            hitSlop={12}
            style={{ width: 48, height: 48 }}
            className="items-end justify-center"
          >
            <MaterialIcons name="close" size={22} color="#6B6659" />
          </Pressable>
        </View>

        <View className="px-4 pb-2 flex-1">
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <FilterGroup label="Transaction Type">
              {(["All", "income", "expense"] as const).map((t) => (
                <Chip
                  key={t}
                  label={t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                  selected={typeFilter === t}
                  onPress={() => setTypeFilter(t)}
                />
              ))}
            </FilterGroup>

            <View className="mt-4">
              <Text className="font-sans text-[12.5px] text-ink-muted mb-1.5">Date Range</Text>
              <View className="flex-row gap-2.5">
                <DatePickerField
                  label=""
                  value={fromDate}
                  onChange={setFromDate}
                  maxDate={toDate ?? new Date()}
                  placeholder="From"
                />
                <DatePickerField
                  label=""
                  value={toDate}
                  onChange={setToDate}
                  minDate={fromDate ?? undefined}
                  maxDate={new Date()}
                  placeholder="To"
                />
              </View>
            </View>

            <FilterGroup label="Purpose">
              {purposes.map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  selected={selectedPurposeId === p.id}
                  onPress={() =>
                    setSelectedPurposeId(selectedPurposeId === p.id ? null : p.id)
                  }
                />
              ))}
              <Chip
                label="Unassigned"
                dashed
                tone="warning"
                selected={selectedPurposeId === "unassigned"}
                onPress={() =>
                  setSelectedPurposeId(
                    selectedPurposeId === "unassigned" ? null : "unassigned"
                  )
                }
              />
            </FilterGroup>

            <FilterGroup label="Category">
              {categories.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  selected={selectedCategoryId === c.id}
                  onPress={() =>
                    setSelectedCategoryId(selectedCategoryId === c.id ? null : c.id)
                  }
                />
              ))}
            </FilterGroup>

            <View className="flex-row gap-3 mt-5 mb-2">
              <View className="flex-1">
                <Button label="Reset" variant="outline" onPress={handleReset} />
              </View>
              <View className="flex-1">
                <Button label="Apply" variant="primary" onPress={apply} />
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mt-4">
      <Text className="font-sans text-[12.5px] text-ink-muted mb-1.5">{label}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}
