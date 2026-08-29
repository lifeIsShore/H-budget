import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { DatePickerField } from "@/components/ui/DatePickerField";

const purposes = ["University", "High School", "General"];
const categories = ["Travel", "Food", "Equipment", "Software", "Other"];

/**
 * UI-only — selections don't persist back to the Ledger screen yet (no
 * shared filter state / router params wiring).
 */
export default function FilterSheet() {
  const [types, setTypes] = useState<string[]>(["All"]);
  const [selPurposes, setSelPurposes] = useState<string[]>([]);
  const [selCategories, setSelCategories] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function toggleType(value: string) {
    if (value === "All") {
      setTypes(["All"]);
      return;
    }
    const next = types.filter((t) => t !== "All");
    setTypes(next.includes(value) ? next.filter((t) => t !== value) : [...next, value]);
  }

  function reset() {
    setTypes(["All"]);
    setSelPurposes([]);
    setSelCategories([]);
    setFromDate(null);
    setToDate(null);
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
          <Pressable onPress={close} hitSlop={12} style={{ width: 48, height: 48 }} className="items-end justify-center">
            <MaterialIcons name="close" size={22} color="#6B6659" />
          </Pressable>
        </View>

        <View className="px-4 pb-2 flex-1">
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <FilterGroup label="Transaction Type">
            {["All", "Income", "Expense"].map((t) => (
              <Chip key={t} label={t} selected={types.includes(t)} onPress={() => toggleType(t)} />
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
                key={p}
                label={p}
                selected={selPurposes.includes(p)}
                onPress={() => toggle(selPurposes, setSelPurposes, p)}
              />
            ))}
            <Chip
              label="Unassigned"
              dashed
              tone="warning"
              selected={selPurposes.includes("Unassigned")}
              onPress={() => toggle(selPurposes, setSelPurposes, "Unassigned")}
            />
          </FilterGroup>

          <FilterGroup label="Category">
            {categories.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={selCategories.includes(c)}
                onPress={() => toggle(selCategories, setSelCategories, c)}
              />
            ))}
          </FilterGroup>

          <View className="flex-row gap-3 mt-5 mb-2">
            <View className="flex-1">
              <Button label="Reset" variant="outline" onPress={reset} />
            </View>
            <View className="flex-1">
              <Button label="Apply" variant="primary" onPress={close} />
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
