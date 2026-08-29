import { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Amount } from "@/components/ui/Amount";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStats, useAvailableMonths } from "@/hooks/useStats";
import type { PurposeStat, CategoryStat, VendorStat } from "@/db/repositories/statsRepo";

/**
 * Statistics screen — wired to real SQLite aggregation queries.
 * Month navigation uses getAvailableMonths() so arrows enable/disable
 * dynamically as real multi-month data exists.
 */

type SubTab = "purpose" | "category" | "vendor";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Stats() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [tab, setTab] = useState<SubTab>("purpose");

  const { stats, loading, reload } = useStats(year, month);
  const { months: availableMonths, reload: reloadMonths } = useAvailableMonths();

  useFocusEffect(
    useCallback(() => {
      reload();
      reloadMonths();
    }, [reload, reloadMonths]),
  );

  // Compute prev/next month and whether navigation is possible
  const { prevYM, nextYM } = useMemo(() => {
    const ym = `${year}-${String(month).padStart(2, "0")}`;
    const sorted = [...availableMonths].sort();
    const idx = sorted.indexOf(ym);
    return {
      prevYM: idx > 0 ? sorted[idx - 1] : null,
      nextYM: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null,
    };
  }, [year, month, availableMonths]);

  function navigate(ym: string | null) {
    if (!ym) return;
    const [y, m] = ym.split("-").map(Number);
    setYear(y);
    setMonth(m);
  }

  const hasData =
    stats &&
    (stats.summary.receivedCents > 0 ||
      stats.summary.spentCents > 0 ||
      stats.byPurpose.some((p) => p.receivedCents > 0 || p.spentCents > 0));

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <Text className="font-sans-semibold text-[20px] text-ink">Statistics</Text>
      </View>

      {/* Month selector */}
      <View className="flex-row items-center justify-center px-4 py-2">
        <Pressable
          onPress={() => navigate(prevYM)}
          disabled={!prevYM}
          style={{ width: 48, height: 48 }}
          className="items-center justify-center"
        >
          <MaterialIcons name="chevron-left" size={24} color={prevYM ? "#22211F" : "#A39D8E"} />
        </Pressable>
        <Text className="font-sans-semibold text-[15px] text-ink mx-3">
          {MONTH_NAMES[month - 1]} {year}
        </Text>
        <Pressable
          onPress={() => navigate(nextYM)}
          disabled={!nextYM}
          style={{ width: 48, height: 48 }}
          className="items-center justify-center"
        >
          <MaterialIcons name="chevron-right" size={24} color={nextYM ? "#22211F" : "#A39D8E"} />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#22211F" />
        </View>
      ) : !hasData ? (
        <EmptyState icon="bar-chart" title="No data for this month." />
      ) : (
        <>
          {/* Summary cards */}
          <View className="flex-row gap-3 px-4 mt-3">
            <SummaryCard
              label="Received"
              value={stats!.summary.receivedCents / 100}
              tone="positive"
            />
            <SummaryCard
              label="Spent"
              value={-(stats!.summary.spentCents / 100)}
              tone="negative"
            />
          </View>

          <SubTabSwitcher tab={tab} onChange={setTab} />

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingTop: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {tab === "purpose" && <ByPurposeView data={stats!.byPurpose} />}
            {tab === "category" && <ByCategoryView data={stats!.byCategory} />}
            {tab === "vendor" && <ByVendorView data={stats!.byVendor} />}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

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

// ─── Sub-tab switcher ─────────────────────────────────────────────────────────

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
            className="mr-6"
            style={{ minHeight: 44, justifyContent: "flex-end", paddingBottom: 10 }}
            hitSlop={{ top: 8 }}
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

// ─── By Purpose ───────────────────────────────────────────────────────────────

function ByPurposeView({ data }: { data: PurposeStat[] }) {
  if (data.length === 0) return <EmptyState icon="folder-open" title="No purposes yet." />;
  return (
    <View className="gap-3">
      {data.map((p) => {
        const received = p.receivedCents / 100;
        const spent = p.spentCents / 100;
        const net = received - spent;
        const pctSpent = received > 0 ? Math.min(spent / received, 1) : 0;
        const overspent = spent > received;
        return (
          <View key={p.purposeId} className="bg-surface border border-border rounded-card p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-sans-medium text-[14px] text-ink">{p.purposeName}</Text>
              <Amount
                value={net}
                size="row"
                signed={false}
                className={net >= 0 ? "text-ink" : "text-negative"}
              />
            </View>
            <View className="flex-row gap-4 mb-2.5">
              <Amount value={received} size="row" className="text-[12.5px]" />
              <Amount value={-spent} size="row" className="text-[12.5px]" />
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

// ─── By Category ─────────────────────────────────────────────────────────────

function ByCategoryView({ data }: { data: CategoryStat[] }) {
  if (data.length === 0) return <EmptyState icon="bar-chart" title="No spending data." />;
  const top = data[0]?.totalCents ?? 1;
  return (
    <View className="gap-1">
      {data.map((item, i) => (
        <View key={item.categoryId ?? "uncategorized"} className="py-3 border-b border-border">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center flex-1 gap-2.5">
              <Text className="font-mono text-[12px] text-ink-faint w-5">{i + 1}</Text>
              <Text className="font-sans-medium text-[14px] text-ink flex-1" numberOfLines={1}>
                {item.categoryName}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-mono text-[14px] text-ink">
                EUR {(item.totalCents / 100).toLocaleString("en-IE", { minimumFractionDigits: 2 })}
              </Text>
              <Text className="font-sans text-[11px] text-ink-faint">
                {Math.round(item.pctOfTotal * 100)}%
              </Text>
            </View>
          </View>
          <View className="h-1 bg-surface-alt rounded-full overflow-hidden ml-7">
            <View
              className="h-full rounded-full bg-brand"
              style={{ width: `${(item.totalCents / top) * 100}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── By Vendor ────────────────────────────────────────────────────────────────

function ByVendorView({ data }: { data: VendorStat[] }) {
  if (data.length === 0) return <EmptyState icon="storefront" title="No spending data." />;
  const top = data[0]?.totalCents ?? 1;
  return (
    <View className="gap-1">
      {data.map((item, i) => (
        <View key={item.vendor} className="py-3 border-b border-border">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center flex-1 gap-2.5">
              <Text className="font-mono text-[12px] text-ink-faint w-5">{i + 1}</Text>
              <Text className="font-sans-medium text-[14px] text-ink flex-1" numberOfLines={1}>
                {item.vendor}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-mono text-[14px] text-ink">
                EUR {(item.totalCents / 100).toLocaleString("en-IE", { minimumFractionDigits: 2 })}
              </Text>
              <Text className="font-sans text-[11px] text-ink-faint">
                {Math.round(item.pctOfTotal * 100)}%{" "}
                · {item.transactionCount} transaction{item.transactionCount === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
          <View className="h-1 bg-surface-alt rounded-full overflow-hidden ml-7">
            <View
              className="h-full rounded-full bg-brand"
              style={{ width: `${(item.totalCents / top) * 100}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
