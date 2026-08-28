import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

/**
 * UI-only — form state is local; wire onSave to the SQLite insert once the
 * data layer exists. Matches the field set in 03_Features.md section 2 and
 * the component spec in 05_UI_UX_Specification.md Screen 2.
 */

const purposes = ["University", "High School", "General"];
const categories = ["Travel", "Food", "Equipment", "Software", "Other"];

export default function QuickAddSheet() {
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<"expense" | "income">(
    initialMode === "income" ? "income" : "expense",
  );
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [purpose, setPurpose] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const isExpense = mode === "expense";
  const numericAmount = parseFloat(amount);
  const canSave = !Number.isNaN(numericAmount) && numericAmount > 0;

  const amountColor = useMemo(() => (isExpense ? "#B5473A" : "#3F7A5C"), [isExpense]);

  function close() {
    router.back();
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    // TODO: insert into SQLite `transactions` table (see 04_Data_Model.md).
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    close();
  }

  return (
    <View className="flex-1 justify-end">
      <Pressable className="absolute inset-0 bg-[#1C1B1966]" onPress={close} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="max-h-[85%]"
      >
        <SafeAreaView edges={["bottom"]} className="bg-surface rounded-t-sheet">
          {/* Handle */}
          <View className="items-center pt-2.5">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
            <Text className="font-sans-semibold text-[15px] text-ink">New Transaction</Text>
            <Pressable onPress={close} hitSlop={12} style={{ width: 48, height: 48 }} className="items-end justify-center">
              <MaterialIcons name="close" size={22} color="#6B6659" />
            </Pressable>
          </View>

          <View className="px-4 pb-2">
            {/* Type toggle */}
            <View className="flex-row bg-surface-alt rounded-full p-1 mt-1">
              <ModeSegment label="Expense" active={isExpense} tone="negative" onPress={() => setMode("expense")} />
              <ModeSegment label="Income" active={!isExpense} tone="positive" onPress={() => setMode("income")} />
            </View>

            {/* Amount */}
            <View className="items-center mt-5">
              <View className="flex-row items-baseline gap-2">
                <Text className="font-mono text-[15px] text-ink-muted">EUR</Text>
                <TextInput
                  value={amount}
                  onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  placeholderTextColor="#A39D8E"
                  keyboardType="decimal-pad"
                  autoFocus
                  style={{ color: amount ? amountColor : "#A39D8E" }}
                  className="font-mono text-[34px] min-w-[140px] text-center"
                />
              </View>
              <View className="h-px bg-border w-full mt-3" />
            </View>

            {/* Vendor / Source */}
            <Field label={isExpense ? "Vendor / Store" : "Source / Payer"}>
              <TextInput
                value={vendor}
                onChangeText={setVendor}
                placeholder={isExpense ? "e.g. Deutsche Bahn" : "e.g. Mentorship Grant"}
                placeholderTextColor="#A39D8E"
                className="font-sans text-[14px] text-ink bg-surface-alt border border-border rounded-input px-3"
                style={{ height: 48 }}
              />
            </Field>

            {/* Purpose */}
            <Field label="Purpose">
              <View className="flex-row flex-wrap gap-2">
                {purposes.map((p) => (
                  <Chip key={p} label={p} selected={purpose === p} onPress={() => setPurpose(p)} />
                ))}
                <Chip
                  label="Unassigned"
                  dashed
                  tone="warning"
                  selected={purpose === null && purpose !== undefined}
                  onPress={() => setPurpose(null)}
                />
              </View>
            </Field>

            {/* Category */}
            <Field label="Category">
              <View className="flex-row flex-wrap gap-2">
                {categories.map((c) => (
                  <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
                ))}
              </View>
            </Field>

            {/* Note */}
            <Field label="Note (optional)">
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Trip to Mannheim"
                placeholderTextColor="#A39D8E"
                className="font-sans text-[14px] text-ink bg-surface-alt border border-border rounded-input px-3"
                style={{ height: 48 }}
              />
            </Field>

            <View className="mt-5 mb-2">
              <Button
                label="Save Transaction"
                variant={isExpense ? "negative" : "positive"}
                disabled={!canSave}
                loading={saving}
                onPress={handleSave}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ModeSegment({
  label,
  active,
  tone,
  onPress,
}: {
  label: string;
  active: boolean;
  tone: "positive" | "negative";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center justify-center rounded-full ${
        active ? (tone === "positive" ? "bg-positive" : "bg-negative") : ""
      }`}
      style={{ height: 40 }}
    >
      <Text className={`font-sans-medium text-[13.5px] ${active ? "text-surface" : "text-ink-muted"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mt-4">
      <Text className="font-sans text-[12.5px] text-ink-muted mb-1.5">{label}</Text>
      {children}
    </View>
  );
}
