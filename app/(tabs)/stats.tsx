import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Amount } from "@/components/ui/Amount";
import { EmptyState } from "@/components/ui/EmptyState";
import { sampleTransactions, samplePurposes } from "@/data/sampleData";

/**
 * UI-only — computed from data/sampleData.ts. Month navigation is
 * demo-scoped: the sample data only spans "August 2026", so both arrows
 * are disabled, which also happens to demonstrate the spec's
 * earliest/latest-month disabled-arrow states correctly. Swap in a real
 * month-scoped SQLite query in Phase 7 and both arrows will un-disable
 * naturally once more months exist.
 */

type SubTab = "purpose" | "category" | "vendor";

export default function Stats() {
  const [tab, setTab] = useState<SubTab>("purpose");

  const { received, spent } = useMemo(() => {
    const received = sampleTransactions
      .filter((t) => t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const spent = Math.abs(
      sampleTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0),
    );
    return { received, spent };
  }, []);

  const hasData = sampleTransactions.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <Text className="font-sans-semibold text-[20px] text-ink">Statistics</Text>
      </View>

      <MonthSelector />

      {!hasData ? (
        <EmptyState icon="bar-chart" title="No data for this month." />
      ) : (
        <>
          <View className="flex-row gap-3 px-4 mt-3">
            <SummaryCard label="Received" value={received} tone="positive" />
            <SummaryCard label="Spent" value={-spent} tone="negative" />
          </View>

          <SubTabSwitcher tab={tab} onChange={setTab} />

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingTop: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {tab === "purpose" && <ByPurposeView />}
            {tab === "category" && <ByCategoryView />}
            {tab === "vendor" && <ByVendorView />}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

function MonthSelector() {
  return (
    <View className="flex-row items-center justify-center px-4 py-2">
      <Pressable disabled style={{ width: 48, height: 48 }} className="items-center justify-center">
        <MaterialIcons name="chevron-left" size={24} color="#D8D5CB" />
      </Pressable>
      <Text className="font-sans-semibold text-[15px] text-ink mx-3">August 2026</Text>
      <Pressable disabled style={{ width: 48, height: 48 }} className="items-center justify-center">
        <MaterialIcons name="chevron-right" size={24} color="#D8D5CB" />
      </Pressable>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "negative";
}) {
  return (
    <View className="flex-1 bg-surface border border-border rounded-card p-3.5">
      <Text className="font-sans text-[11.5px] text-ink-muted mb-1">{label}</Text>
      <Amount value={value} size="row" className="text-[16px]" />
    </View>
  );
}

function SubTabSwitcher({ tab, onChange }: { tab: SubTab; onChange: (t: SubTab) => void }) {
  const items: { key: SubTab; label: string }[] = [
    { key: "purpose", label: "By Purpose" },
    { key: "category", label: "By Category" },
    { key: "vendor", label: "By Vendor" },
  ];
  return (
    <View className="flex-row px-4 mt-4 border-b border-border">
      {items.map((item) => {
        const active = tab === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            className="mr-6 pb-2.5"
          >
            <Text
              className={`font-sans-medium text-[13.5px] ${
                active ? "text-ink" : "text-ink-muted"
              }`}
            >
              {item.label}
            </Text>
            {active && <View className="h-[2px] bg-accent rounded-full mt-2.5" />}
          </Pressable>
        );
      })}
    </View>
  );
}

function ByPurposeView() {
  const sorted = useMemo(
    () => [...samplePurposes].sort((a, b) => b.spent - a.spent),
    [],
  );

  if (sorted.length === 0) {
    return <EmptyState icon="folder-open" title="No purposes yet." />;
  }

  return (
    <View className="gap-3">
      {sorted.map((p) => {
        const net = p.received - p.spent;
        const pctSpent = p.received > 0 ? Math.min(p.spent / p.received, 1) : 0;
        const overspent = p.spent > p.received;
        return (
          <View key={p.id} className="bg-surface border border-border rounded-card p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-sans-medium text-[14px] text-ink">{p.name}</Text>
              <Amount value={net} size="row" signed={false} className={net >= 0 ? "text-ink" : "text-negative"} />
            </View>
            <View className="flex-row gap-4 mb-2.5">
              <Amount value={p.received} size="row" className="text-[12.5px]" />
              <Amount value={-p.spent} size="row" className="text-[12.5px]" />
            </View>
            <View className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${overspent ? "bg-negative" : "bg-brand"}`}
                style={{ width: `${pctSpent * 100}%` }}
              />
            </View>
            <Text className="font-sans text-[11px] text-ink-faint mt-1.5">
              {Math.round(pctSpent * 100)}% spent
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ByCategoryView() {
  const ranked = useRanked((t) => t.category ?? "Uncategorized");
  if (ranked.length === 0) return <EmptyState icon="bar-chart" title="No spending data." />;
  return <RankedList items={ranked} />;
}

function ByVendorView() {
  const ranked = useRanked((t) => t.vendor ?? "No vendor");
  if (ranked.length === 0) return <EmptyState icon="storefront" title="No spending data." />;
  return <RankedList items={ranked} showCount />;
}

function useRanked(keyFn: (t: (typeof sampleTransactions)[number]) => string) {
  return useMemo(() => {
    const totals = new Map<string, { amount: number; count: number }>();
    for (const t of sampleTransactions) {
      if (t.amount >= 0) continue;
      const key = keyFn(t);
      const entry = totals.get(key) ?? { amount: 0, count: 0 };
      entry.amount += Math.abs(t.amount);
      entry.count += 1;
      totals.set(key, entry);
    }
    const totalSpent = Array.from(totals.values()).reduce((s, v) => s + v.amount, 0);
    const list = Array.from(totals.entries())
      .map(([name, v]) => ({
        name,
        amount: v.amount,
        count: v.count,
        pct: totalSpent > 0 ? v.amount / totalSpent : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
    const top = list[0]?.amount ?? 1;
    return list.map((item) => ({ ...item, barWidth: item.amount / top }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function RankedList({
  items,
  showCount = false,
}: {
  items: { name: string; amount: number; count: number; pct: number; barWidth: number }[];
  showCount?: boolean;
}) {
  return (
    <View className="gap-1">
      {items.map((item, i) => (
        <View key={item.name} className="py-3 border-b border-border">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center flex-1 gap-2.5">
              <Text className="font-mono text-[12px] text-ink-faint w-5">{i + 1}</Text>
              <Text className="font-sans-medium text-[14px] text-ink flex-1" numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-mono text-[14px] text-ink">
                EUR {item.amount.toLocaleString("en-IE", { minimumFractionDigits: 2 })}
              </Text>
              <Text className="font-sans text-[11px] text-ink-faint">
                {Math.round(item.pct * 100)}%
                {showCount ? ` · ${item.count} transaction${item.count === 1 ? "" : "s"}` : ""}
              </Text>
            </View>
          </View>
          <View className="h-1 bg-surface-alt rounded-full overflow-hidden ml-7">
            <View
              className="h-full rounded-full bg-brand"
              style={{ width: `${item.barWidth * 100}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
