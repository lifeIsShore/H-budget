import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useToast } from "@/components/ToastProvider";

/**
 * UI-only. Opening balance / currency are local state, not persisted or
 * shared with Dashboard's hardcoded 3000 yet — real state (zustand is
 * already a dependency) and SQLite wiring happen in Phase 7. Export/Backup
 * confirmations now go through the global Toast (components/ToastProvider.tsx,
 * Phase 8) instead of a page-local strip — the file operations themselves
 * are still not wired to expo-file-system/expo-sharing.
 */

const currencies = ["EUR", "USD", "GBP", "TRY", "CHF"];

export default function Settings() {
  const toast = useToast();
  const [openingBalance, setOpeningBalance] = useState(3000);
  const [currency, setCurrency] = useState("EUR");

  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [balanceInput, setBalanceInput] = useState(String(openingBalance));

  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  function saveBalance() {
    const parsed = parseFloat(balanceInput);
    if (!Number.isNaN(parsed)) setOpeningBalance(parsed);
    setShowBalanceDialog(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <Text className="font-sans-semibold text-[20px] text-ink">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionHeader label="Account" />
        <Row
          label="Opening Balance"
          value={`${currency} ${openingBalance.toLocaleString("en-IE", { minimumFractionDigits: 2 })}`}
          onPress={() => {
            setBalanceInput(String(openingBalance));
            setShowBalanceDialog(true);
          }}
        />
        <Row label="Currency" value={currency} onPress={() => setShowCurrencySheet(true)} />

        <SectionHeader label="Customization" />
        <Row label="Manage Purposes" onPress={() => router.push("/settings/purposes")} />
        <Row label="Manage Categories" onPress={() => router.push("/settings/categories")} />

        <SectionHeader label="Data & Backup" />
        <Row
          icon="description"
          label="Export CSV Report"
          onPress={() => toast.show("CSV export ready (demo — not yet wired to real data)")}
        />
        <Row
          icon="backup"
          label="Backup Data (JSON)"
          onPress={() => toast.show("Backup created (demo — not yet wired to real data)")}
        />
        <Row
          icon="restore"
          label="Restore Data (JSON)"
          tone="negative"
          onPress={() => setShowRestoreDialog(true)}
        />

        <SectionHeader label="About" />
        <Row label="App Version" value="1.0.0" tappable={false} />
      </ScrollView>

      {/* Opening Balance dialog */}
      <Modal visible={showBalanceDialog} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-[#1C1B1966] px-6">
          <View className="bg-surface rounded-dialog p-6 w-full" style={{ maxWidth: 360 }}>
            <Text className="font-sans-semibold text-[16px] text-ink">Opening Balance</Text>
            <Text className="font-sans text-[12.5px] text-ink-muted mt-1">
              The starting balance before any recorded transactions.
            </Text>
            <View className="flex-row items-center gap-2 mt-4 bg-surface-alt border border-border rounded-input px-3" style={{ height: 48 }}>
              <Text className="font-mono text-[14px] text-ink-muted">{currency}</Text>
              <TextInput
                value={balanceInput}
                onChangeText={(t) => setBalanceInput(t.replace(/[^0-9.]/g, ""))}
                keyboardType="decimal-pad"
                autoFocus
                className="flex-1 font-mono text-[16px] text-ink"
              />
            </View>
            <View className="flex-row justify-end gap-5 mt-5">
              <Pressable onPress={() => setShowBalanceDialog(false)} hitSlop={8} className="h-12 justify-center">
                <Text className="font-sans-medium text-[14px] text-ink-muted">Cancel</Text>
              </Pressable>
              <Pressable onPress={saveBalance}>
                <View className="h-12 px-5 rounded-button items-center justify-center bg-brand">
                  <Text className="font-sans-medium text-[14px] text-surface">Save</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency selection sheet */}
      <Modal visible={showCurrencySheet} transparent animationType="fade">
        <Pressable className="flex-1 justify-end bg-[#1C1B1966]" onPress={() => setShowCurrencySheet(false)}>
          <Pressable className="bg-surface rounded-t-sheet pb-6">
            <View className="items-center pt-2.5">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>
            <Text className="font-sans-semibold text-[15px] text-ink px-4 pt-3 pb-1">
              Select Currency
            </Text>
            {currencies.map((c) => (
              <Pressable
                key={c}
                onPress={() => {
                  setCurrency(c);
                  setShowCurrencySheet(false);
                }}
                className="flex-row items-center justify-between px-4 border-b border-border active:opacity-70"
                style={{ height: 52 }}
              >
                <Text className="font-sans text-[14px] text-ink">{c}</Text>
                {currency === c && <MaterialIcons name="check" size={20} color="#9C7A3C" />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Restore confirmation dialog */}
      <Modal visible={showRestoreDialog} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-[#1C1B1966] px-6">
          <View className="bg-surface rounded-dialog p-6 w-full" style={{ maxWidth: 360 }}>
            <Text className="font-sans-semibold text-[16px] text-ink">Restore from backup?</Text>
            <Text className="font-sans text-[13.5px] text-ink-muted mt-2 leading-5">
              This replaces all current transactions, purposes, and categories with the
              contents of the selected file. This can't be undone.
            </Text>
            <View className="flex-row justify-end gap-5 mt-5">
              <Pressable onPress={() => setShowRestoreDialog(false)} hitSlop={8} className="h-12 justify-center">
                <Text className="font-sans-medium text-[14px] text-ink-muted">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowRestoreDialog(false);
                  toast.show("Restore not yet wired to a real file (demo)", { tone: "negative" });
                }}
              >
                <View className="h-12 px-5 rounded-button items-center justify-center bg-negative">
                  <Text className="font-sans-medium text-[14px] text-surface">Restore</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View className="bg-surface-alt px-4" style={{ height: 32 }}>
      <Text className="font-sans-medium text-[11.5px] text-ink-muted self-center flex-1" style={{ lineHeight: 32 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  tone = "neutral",
  tappable = true,
  onPress,
}: {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  tone?: "neutral" | "negative";
  tappable?: boolean;
  onPress?: () => void;
}) {
  const Wrapper = tappable ? Pressable : View;
  return (
    <Wrapper
      onPress={tappable ? onPress : undefined}
      className={`flex-row items-center px-4 border-b border-border bg-surface ${
        tappable ? "active:opacity-70" : ""
      }`}
      style={{ minHeight: 52 }}
    >
      {icon && (
        <MaterialIcons name={icon} size={19} color={tone === "negative" ? "#B5473A" : "#6B6659"} style={{ marginRight: 12 }} />
      )}
      <Text
        className={`font-sans text-[14px] flex-1 ${tone === "negative" ? "text-negative" : "text-ink"}`}
      >
        {label}
      </Text>
      {value && <Text className="font-sans text-[13px] text-ink-muted mr-1.5">{value}</Text>}
      {tappable && <MaterialIcons name="chevron-right" size={20} color="#A39D8E" />}
    </Wrapper>
  );
}
