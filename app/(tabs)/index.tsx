import { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Amount } from "@/components/ui/Amount";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useTransactions, useUnassignedCount } from "@/hooks/useTransactions";
import { usePurposesWithBalances } from "@/hooks/usePurposes";
import { useSettings } from "@/hooks/useSettings";
import type { TransactionUI } from "@/db/repositories/transactionRepo";
import type { PurposeWithBalance } from "@/db/repositories/purposeRepo";

/**
 * Dashboard — wired to real SQLite data.
 * Reloads on every focus so it stays fresh after Quick-Add inserts.
 */

export default function Dashboard() {
  const { transactions, loading: txLoading, reload: reloadTx } = useTransactions({ limit: 6 });
  const { purposes, loading: purposeLoading, reload: reloadPurposes } = usePurposesWithBalances();
  const { count: unassignedCount, reload: reloadUnassigned } = useUnassignedCount();
  const { openingBalanceEuros, currency, reload: reloadSettings } = useSettings();

  // Reload data every time the tab gains focus (e.g. after Quick-Add, or
  // after changing opening balance / currency in Settings)
  useFocusEffect(
    useCallback(() => {
      reloadTx();
      reloadPurposes();
      reloadUnassigned();
      reloadSettings();
    }, [reloadTx, reloadPurposes, reloadUnassigned, reloadSettings])
  );

  const loading = txLoading || purposeLoading;

  const { received, spent, balance } = useMemo(() => {
    const openingCents = (openingBalanceEuros ?? 0) * 100;
    const receivedCents = purposes.reduce((s, p) => s + p.receivedCents, 0);
    const spentCents = purposes.reduce((s, p) => s + p.spentCents, 0);
    return {
      received: receivedCents / 100,
      spent: spentCents / 100,
      balance: (openingCents + receivedCents - spentCents) / 100,
    };
  }, [purposes, openingBalanceEuros]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
        <TopBar unassignedCount={0} />
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <TopBar unassignedCount={unassignedCount} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroBalanceCard
          balance={balance}
          received={received}
          spent={spent}
          openingBalance={openingBalanceEuros ?? 0}
          currency={currency}
        />

        {unassignedCount > 0 && <WarningBanner count={unassignedCount} />}

        {purposes.length > 0 && (
          <View className="px-4 mt-5">
            <Text className="font-sans-semibold text-[15px] text-ink mb-3">
              Balances by Purpose
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {purposes.map((p) => (
                <PurposeCard key={p.id} purpose={p} />
              ))}
            </View>
          </View>
        )}

        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-sans-semibold text-[15px] text-ink">Recent Activity</Text>
            <Pressable onPress={() => router.push("/ledger")} hitSlop={8}>
              <Text className="font-sans-medium text-[12px] text-accent">View All</Text>
            </Pressable>
          </View>

          {transactions.length === 0 ? (
            <EmptyState
              icon="receipt-long"
              title="No transactions yet"
              subtitle="Tap + Income or - Expense below to get started."
            />
          ) : (
            <View className="gap-2">
              {transactions.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <StickyActionBar />
    </SafeAreaView>
  );
}

function TopBar({ unassignedCount }: { unassignedCount: number }) {
  const reconciled = unassignedCount === 0;
  return (
    <View
      className="flex-row items-center justify-between px-4 border-b border-border bg-bg"
      style={{ height: 56 }}
    >
      <Text className="font-sans-semibold text-[20px] text-ink">H-Budget</Text>
      <View className="flex-row items-center gap-1.5">
        <View
          className={`w-1.5 h-1.5 rounded-full ${reconciled ? "bg-positive" : "bg-warning"}`}
        />
        <Text className={`font-sans-medium text-[12px] ${reconciled ? "text-positive" : "text-warning"}`}>
          {reconciled ? "Reconciled" : "Action needed"}
        </Text>
      </View>
    </View>
  );
}

function HeroBalanceCard({
  balance,
  received,
  spent,
  openingBalance,
  currency,
}: {
  balance: number;
  received: number;
  spent: number;
  openingBalance: number;
  currency: string;
}) {
  return (
    <View className="mx-4 mt-4 bg-surface border border-border rounded-card p-5">
      <Text className="font-sans text-[12.5px] text-ink-muted tracking-wide">
        Total Available Balance
      </Text>
      <Amount value={balance} size="hero" signed={false} className="mt-1" />
      {/* Signature accent rule under the hero number — see DESIGN_SYSTEM.md */}
      <View className="h-[2px] w-10 bg-accent rounded-full mt-2 mb-3" />

      <View className="flex-row gap-4">
        <Amount value={received} size="row" />
        <Amount value={-spent} size="row" />
      </View>

      <View className="h-px bg-border my-3" />
      <Text className="font-mono text-[12px] text-ink-faint">
        Opening Balance: {currency}{" "}
        {openingBalance.toLocaleString("en-IE", { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

function WarningBanner({ count }: { count: number }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/ledger", params: { filter: "unassigned" } })}
      className="mx-4 mt-4 bg-warning-subtle border border-warning rounded-card p-3.5 flex-row items-center active:opacity-80"
    >
      <MaterialIcons name="warning-amber" size={20} color="#B8862E" />
      <Text className="font-sans text-[13.5px] text-ink flex-1 ml-2.5">
        {count} transaction{count === 1 ? "" : "s"} need classification
      </Text>
      <Text className="font-sans-medium text-[12px] text-accent">Classify ›</Text>
    </Pressable>
  );
}

function PurposeCard({ purpose }: { purpose: PurposeWithBalance }) {
  const received = purpose.receivedCents / 100;
  const spent = purpose.spentCents / 100;
  const remaining = received - spent;
  const pctSpent = received > 0 ? Math.min(spent / received, 1) : 0;

  return (
    <Card className="flex-1 min-w-[45%]">
      <Text className="font-sans-medium text-[14px] text-ink mb-2">{purpose.name}</Text>
      <View className="gap-0.5">
        <Amount value={received} size="row" className="text-[13px]" />
        <Amount value={-spent} size="row" className="text-[13px]" />
      </View>
      <View className="h-px bg-border my-2.5" />
      <Amount
        value={remaining}
        size="row"
        signed={false}
        className={remaining >= 0 ? "text-ink" : "text-negative"}
      />
      <View className="h-1 bg-surface-alt rounded-full mt-2.5 overflow-hidden">
        <View
          className={`h-full rounded-full ${pctSpent >= 1 ? "bg-negative" : "bg-brand"}`}
          style={{ width: `${pctSpent * 100}%` }}
        />
      </View>
    </Card>
  );
}

function TransactionRow({ transaction }: { transaction: TransactionUI }) {
  const isExpense = transaction.type === "expense";
  // Format ISO date as a short label for display
  const dateLabel = new Date(transaction.date + "T00:00:00").toLocaleDateString("en-IE", {
    month: "short",
    day: "numeric",
  });

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/transaction/[id]", params: { id: transaction.id } })
      }
      className="flex-row items-center bg-surface border border-border rounded-card px-3.5 active:opacity-70"
      style={{ minHeight: 64 }}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          isExpense ? "bg-negative-subtle" : "bg-positive-subtle"
        }`}
      >
        <MaterialIcons
          name={isExpense ? "arrow-downward" : "arrow-upward"}
          size={18}
          color={isExpense ? "#B5473A" : "#3F7A5C"}
        />
      </View>

      <View className="flex-1 py-2.5">
        <Text
          className={`font-sans-medium text-[14px] ${
            transaction.vendor ? "text-ink" : "text-ink-faint italic"
          }`}
        >
          {transaction.vendor ?? "No vendor"}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          {transaction.purposeName ? (
            <View className="bg-surface-alt px-1.5 py-0.5 rounded">
              <Text className="font-sans text-[10.5px] text-ink-muted">
                {transaction.purposeName}
              </Text>
            </View>
          ) : (
            <View className="bg-warning-subtle px-1.5 py-0.5 rounded">
              <Text className="font-sans text-[10.5px] text-warning">Unassigned</Text>
            </View>
          )}
          {transaction.categoryName && (
            <Text className="font-sans text-[11px] text-ink-muted">{transaction.categoryName}</Text>
          )}
        </View>
      </View>

      <View className="items-end">
        <Amount value={transaction.amount} size="row" />
        <Text className="font-sans text-[10px] text-ink-faint mt-0.5">{dateLabel}</Text>
      </View>
    </Pressable>
  );
}

function StickyActionBar() {
  return (
    <View className="flex-row gap-2 px-4 pt-2.5 pb-3 border-t border-border bg-surface">
      <View className="flex-1">
        <Button
          label="Income"
          variant="positive"
          onPress={() => router.push({ pathname: "/quick-add", params: { mode: "income" } })}
        />
      </View>
      <View className="flex-1">
        <Button
          label="Expense"
          variant="negative"
          onPress={() => router.push({ pathname: "/quick-add", params: { mode: "expense" } })}
        />
      </View>
    </View>
  );
}
