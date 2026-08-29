import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useToast } from "@/components/ToastProvider";
import { useSettings } from "@/hooks/useSettings";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { exportCsv, exportJson, importJson } from "@/db/repositories/backupRepo";

/**
 * Settings screen — all state now persists to SQLite via useSettings().
 * Opening balance and currency are real, shared values. Export/Backup/Restore
 * use expo-file-system + expo-sharing + expo-document-picker.
 */

const currencies = ["EUR", "USD", "GBP", "TRY", "CHF"];

export default function Settings() {
  const toast = useToast();
  const { settings, loading, openingBalanceEuros, currency, saveOpeningBalance, saveCurrency } =
    useSettings();

  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [savingBalance, setSavingBalance] = useState(false);

  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleSaveBalance() {
    const parsed = parseFloat(balanceInput);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setSavingBalance(true);
    try {
      await saveOpeningBalance(parsed);
      toast.show("Opening balance saved");
    } catch {
      toast.show("Failed to save balance", { tone: "negative" });
    } finally {
      setSavingBalance(false);
      setShowBalanceDialog(false);
    }
  }

  async function handleCurrencySelect(c: string) {
    try {
      await saveCurrency(c);
    } catch {
      toast.show("Failed to save currency", { tone: "negative" });
    } finally {
      setShowCurrencySheet(false);
    }
  }

  async function handleExportCsv() {
    if (exporting) return;
    setExporting(true);
    try {
      const csv = await exportCsv();
      const path = `${FileSystem.cacheDirectory}h-budget-export.csv`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: "text/csv", UTI: "public.comma-separated-values-text" });
      toast.show("CSV export shared");
    } catch (e) {
      toast.show("Export failed — " + (e instanceof Error ? e.message : "unknown error"), {
        tone: "negative",
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleBackupJson() {
    if (exporting) return;
    setExporting(true);
    try {
      const backup = await exportJson();
      const json = JSON.stringify(backup, null, 2);
      const path = `${FileSystem.cacheDirectory}h-budget-backup.json`;
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: "application/json", UTI: "public.json" });
      toast.show("Backup shared");
    } catch (e) {
      toast.show("Backup failed — " + (e instanceof Error ? e.message : "unknown error"), {
        tone: "negative",
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleRestore() {
    setShowRestoreDialog(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (!file?.uri) return;

      setRestoring(true);
      const json = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await importJson(json);
      toast.show("Data restored successfully");
    } catch (e) {
      toast.show("Restore failed — " + (e instanceof Error ? e.message : "invalid file"), {
        tone: "negative",
      });
    } finally {
      setRestoring(false);
    }
  }

  if (loading && !settings) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center" edges={["top"]}>
        <ActivityIndicator color="#22211F" />
      </SafeAreaView>
    );
  }

  const displayBalance =
    openingBalanceEuros != null
      ? openingBalanceEuros.toLocaleString("en-IE", { minimumFractionDigits: 2 })
      : "—";

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <Text className="font-sans-semibold text-[20px] text-ink">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionHeader label="Account" />
        <Row
          label="Opening Balance"
          value={`${currency} ${displayBalance}`}
          onPress={() => {
            setBalanceInput(openingBalanceEuros != null ? String(openingBalanceEuros) : "0");
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
          label={exporting ? "Exporting…" : "Export CSV Report"}
          onPress={handleExportCsv}
        />
        <Row
          icon="backup"
          label={exporting ? "Creating backup…" : "Backup Data (JSON)"}
          onPress={handleBackupJson}
        />
        <Row
          icon="restore"
          label={restoring ? "Restoring…" : "Restore Data (JSON)"}
          tone="negative"
          onPress={() => setShowRestoreDialog(true)}
        />

        <SectionHeader label="About" />
        <Row label="App Version" value={settings?.appVersion ?? "1.0.0"} tappable={false} />
      </ScrollView>

      {/* Opening Balance dialog */}
      <Modal visible={showBalanceDialog} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-[#1C1B1966] px-6">
          <View className="bg-surface rounded-dialog p-6 w-full" style={{ maxWidth: 360 }}>
            <Text className="font-sans-semibold text-[16px] text-ink">Opening Balance</Text>
            <Text className="font-sans text-[12.5px] text-ink-muted mt-1">
              The starting balance before any recorded transactions.
            </Text>
            <View
              className="flex-row items-center gap-2 mt-4 bg-surface-alt border border-border rounded-input px-3"
              style={{ height: 48 }}
            >
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
              <Pressable
                onPress={() => setShowBalanceDialog(false)}
                hitSlop={8}
                className="h-12 justify-center"
              >
                <Text className="font-sans-medium text-[14px] text-ink-muted">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSaveBalance} disabled={savingBalance}>
                <View className="h-12 px-5 rounded-button items-center justify-center bg-brand">
                  {savingBalance ? (
                    <ActivityIndicator color="#FAF9F6" size="small" />
                  ) : (
                    <Text className="font-sans-medium text-[14px] text-surface">Save</Text>
                  )}
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
                onPress={() => handleCurrencySelect(c)}
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
              This replaces all current transactions, purposes, and categories with the contents of
              the selected file. This cannot be undone.
            </Text>
            <View className="flex-row justify-end gap-5 mt-5">
              <Pressable
                onPress={() => setShowRestoreDialog(false)}
                hitSlop={8}
                className="h-12 justify-center"
              >
                <Text className="font-sans-medium text-[14px] text-ink-muted">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleRestore}>
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
      <Text
        className="font-sans-medium text-[11.5px] text-ink-muted self-center flex-1"
        style={{ lineHeight: 32 }}
      >
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
        <MaterialIcons
          name={icon}
          size={19}
          color={tone === "negative" ? "#B5473A" : "#6B6659"}
          style={{ marginRight: 12 }}
        />
      )}
      <Text className={`font-sans text-[14px] flex-1 ${tone === "negative" ? "text-negative" : "text-ink"}`}>
        {label}
      </Text>
      {value && <Text className="font-sans text-[13px] text-ink-muted mr-1.5">{value}</Text>}
      {tappable && <MaterialIcons name="chevron-right" size={20} color="#A39D8E" />}
    </Wrapper>
  );
}
