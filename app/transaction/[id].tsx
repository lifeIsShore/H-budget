import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Amount } from "@/components/ui/Amount";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ToastProvider";
import { sampleTransactions } from "@/data/sampleData";

/**
 * UI-only — View Mode, Edit Mode, and Delete Confirmation per
 * 05_UI_UX_Specification.md Screen 4. Save/Delete are not wired to SQLite
 * yet (Phase 7); this screen mutates nothing, it only demonstrates the
 * full interaction, including the Undo toast on delete (Phase 8's global
 * Toast, wired here — tapping Undo currently just dismisses the toast,
 * since there's no real delete underneath it to reverse yet). Open
 * directly into Edit Mode via ?edit=1, or straight to the delete dialog
 * via ?confirmDelete=1 (both set by Ledger's swipe actions).
 */

const purposes = ["University", "High School", "General"];
const categories = ["Travel", "Food", "Equipment", "Software", "Other"];

export default function TransactionDetail() {
  const toast = useToast();
  const { id, edit, confirmDelete } = useLocalSearchParams<{
    id: string;
    edit?: string;
    confirmDelete?: string;
  }>();

  const original = useMemo(() => sampleTransactions.find((t) => t.id === id), [id]);

  const [mode, setMode] = useState<"view" | "edit">(edit === "1" ? "edit" : "view");
  const [showDeleteDialog, setShowDeleteDialog] = useState(confirmDelete === "1");
  const [deleting, setDeleting] = useState(false);

  const [amountText, setAmountText] = useState(
    original ? Math.abs(original.amount).toFixed(2) : "",
  );
  const [vendor, setVendor] = useState(original?.vendor ?? "");
  const [purpose, setPurpose] = useState<string | null>(original?.purpose ?? null);
  const [category, setCategory] = useState<string | null>(original?.category ?? null);
  const [note, setNote] = useState(original?.note ?? "");

  if (!original) {
    return (
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-[#1C1B1966]" onPress={() => router.back()} />
        <SafeAreaView edges={["bottom"]} className="bg-surface rounded-t-sheet">
          <EmptyState icon="receipt-long" title="Transaction not found" />
        </SafeAreaView>
      </View>
    );
  }

  const isExpense = original.amount < 0;
  const numericAmount = parseFloat(amountText) || 0;
  const signedNewAmount = isExpense ? -numericAmount : numericAmount;
  const amountChanged = signedNewAmount !== original.amount;
  const hasChanges =
    amountChanged ||
    vendor !== (original.vendor ?? "") ||
    purpose !== original.purpose ||
    category !== original.category ||
    note !== (original.note ?? "");

  function close() {
    router.back();
  }

  function handleDelete() {
    setDeleting(true);
    // TODO: DELETE from SQLite (Phase 7). Undo currently has nothing to
    // reverse — once real deletes exist, Undo should re-insert the row.
    setTimeout(() => {
      setDeleting(false);
      close();
      toast.show(
        `Deleted ${original.vendor ?? "transaction"} — EUR ${Math.abs(original.amount).toFixed(2)}`,
        { actionLabel: "Undo", tone: "negative", onAction: () => {} },
      );
    }, 400);
  }

  return (
    <View className="flex-1 justify-end">
      <Pressable className="absolute inset-0 bg-[#1C1B1966]" onPress={close} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ maxHeight: "75%" }}
      >
        <SafeAreaView edges={["bottom"]} className="bg-surface rounded-t-sheet">
          <View className="items-center pt-2.5">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
            <Text className="font-sans-semibold text-[15px] text-ink">
              {mode === "view" ? "Transaction Details" : "Edit Transaction"}
            </Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              style={{ width: 48, height: 48 }}
              className="items-end justify-center"
            >
              <MaterialIcons name="close" size={22} color="#6B6659" />
            </Pressable>
          </View>

          <View className="px-4 pb-4">
            {mode === "view" ? (
              <ViewMode
                transaction={original}
                onEdit={() => setMode("edit")}
                onDelete={() => setShowDeleteDialog(true)}
              />
            ) : (
              <EditMode
                isExpense={isExpense}
                amountText={amountText}
                setAmountText={setAmountText}
                vendor={vendor}
                setVendor={setVendor}
                purpose={purpose}
                setPurpose={setPurpose}
                category={category}
                setCategory={setCategory}
                note={note}
                setNote={setNote}
                amountChanged={amountChanged}
                originalAmount={original.amount}
                newAmount={signedNewAmount}
                hasChanges={hasChanges}
                onCancel={() => setMode("view")}
                onSave={close}
              />
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <Modal visible={showDeleteDialog} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-[#1C1B1966] px-6">
          <View className="bg-surface rounded-dialog p-6 w-full" style={{ maxWidth: 360 }}>
            <Text className="font-sans-semibold text-[16px] text-ink">
              Delete this transaction?
            </Text>
            <Text className="font-sans text-[13.5px] text-ink-muted mt-2 leading-5">
              This will remove{" "}
              <Text className="font-sans-medium text-ink">
                EUR {Math.abs(original.amount).toFixed(2)}
              </Text>{" "}
              and restore it to your Total Balance
              {original.purpose ? ` and ${original.purpose} pool` : ""}.
            </Text>
            <View className="flex-row justify-end gap-5 mt-5">
              <Pressable
                onPress={() => setShowDeleteDialog(false)}
                hitSlop={8}
                className="h-12 justify-center"
              >
                <Text className="font-sans-medium text-[14px] text-ink-muted">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleDelete} disabled={deleting}>
                <View
                  className={`h-12 px-5 rounded-button items-center justify-center ${
                    deleting ? "bg-surface-alt border border-border" : "bg-negative"
                  }`}
                >
                  <Text
                    className={`font-sans-medium text-[14px] ${
                      deleting ? "text-ink-faint" : "text-surface"
                    }`}
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ViewMode({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: (typeof sampleTransactions)[number];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isExpense = transaction.amount < 0;

  return (
    <View>
      <View className="items-center mt-1 mb-2">
        <Amount value={transaction.amount} size="hero" />
        <Text className="font-sans text-[12.5px] text-ink-muted mt-1.5">
          {transaction.date} at {transaction.time}
        </Text>
      </View>

      <View className="h-px bg-border my-3" />

      <DetailRow label="Type">
        <View className="flex-row items-center gap-1.5">
          <View
            className={`w-2 h-2 rounded-full ${isExpense ? "bg-negative" : "bg-positive"}`}
          />
          <Text className="font-sans-medium text-[13.5px] text-ink">
            {isExpense ? "Expense" : "Income"}
          </Text>
        </View>
      </DetailRow>

      <DetailRow label="Vendor">
        <Text
          className={`font-sans text-[13.5px] ${
            transaction.vendor ? "text-ink" : "text-ink-faint"
          }`}
        >
          {transaction.vendor ?? "---"}
        </Text>
      </DetailRow>

      <DetailRow label="Purpose">
        {transaction.purpose ? (
          <View className="bg-surface-alt px-2 py-1 rounded">
            <Text className="font-sans text-[12px] text-ink-muted">{transaction.purpose}</Text>
          </View>
        ) : (
          <View className="bg-warning-subtle px-2 py-1 rounded">
            <Text className="font-sans text-[12px] text-warning">Unassigned</Text>
          </View>
        )}
      </DetailRow>

      <DetailRow label="Category">
        {transaction.category ? (
          <View className="bg-surface-alt px-2 py-1 rounded">
            <Text className="font-sans text-[12px] text-ink-muted">{transaction.category}</Text>
          </View>
        ) : (
          <Text className="font-sans text-[13.5px] text-ink-faint">---</Text>
        )}
      </DetailRow>

      <DetailRow label="Note">
        <Text
          className={`font-sans text-[13.5px] flex-1 text-right ${
            transaction.note ? "text-ink" : "text-ink-faint"
          }`}
        >
          {transaction.note ?? "---"}
        </Text>
      </DetailRow>

      <DetailRow label="Created">
        <Text className="font-sans text-[11.5px] text-ink-faint">
          {transaction.date}, {transaction.time}
        </Text>
      </DetailRow>

      <View className="gap-2.5 mt-5">
        <Button label="Edit Transaction" variant="outline" onPress={onEdit} />
        <Button label="Delete Transaction" variant="ghost" onPress={onDelete} />
      </View>
    </View>
  );
}

function EditMode({
  isExpense,
  amountText,
  setAmountText,
  vendor,
  setVendor,
  purpose,
  setPurpose,
  category,
  setCategory,
  note,
  setNote,
  amountChanged,
  originalAmount,
  newAmount,
  hasChanges,
  onCancel,
  onSave,
}: {
  isExpense: boolean;
  amountText: string;
  setAmountText: (v: string) => void;
  vendor: string;
  setVendor: (v: string) => void;
  purpose: string | null;
  setPurpose: (v: string | null) => void;
  category: string | null;
  setCategory: (v: string | null) => void;
  note: string;
  setNote: (v: string) => void;
  amountChanged: boolean;
  originalAmount: number;
  newAmount: number;
  hasChanges: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const delta = Math.abs(Math.abs(newAmount) - Math.abs(originalAmount));

  return (
    <View>
      <View className="items-center mt-1">
        <View className="flex-row items-baseline gap-2">
          <Text className="font-mono text-[15px] text-ink-muted">EUR</Text>
          <TextInput
            value={amountText}
            onChangeText={(t) => setAmountText(t.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            style={{ color: isExpense ? "#B5473A" : "#3F7A5C" }}
            className="font-mono text-[34px] min-w-[120px] text-center"
          />
        </View>
        <View className="h-px bg-border w-full mt-3" />
      </View>

      {amountChanged && (
        <View className="bg-warning-subtle rounded-card px-3.5 py-3 mt-4">
          <Text className="font-sans text-[12.5px] text-ink leading-4.5">
            Changing from EUR {Math.abs(originalAmount).toFixed(2)} to EUR{" "}
            {Math.abs(newAmount).toFixed(2)} will adjust your balance by EUR {delta.toFixed(2)}.
          </Text>
        </View>
      )}

      <Field label={isExpense ? "Vendor / Store" : "Source / Payer"}>
        <TextInput
          value={vendor}
          onChangeText={setVendor}
          placeholderTextColor="#A39D8E"
          className="font-sans text-[14px] text-ink bg-surface-alt border border-border rounded-input px-3"
          style={{ height: 48 }}
        />
      </Field>

      <Field label="Purpose">
        <View className="flex-row flex-wrap gap-2">
          {purposes.map((p) => (
            <Chip key={p} label={p} selected={purpose === p} onPress={() => setPurpose(p)} />
          ))}
          <Chip
            label="Unassigned"
            dashed
            tone="warning"
            selected={purpose === null}
            onPress={() => setPurpose(null)}
          />
        </View>
      </Field>

      <Field label="Category">
        <View className="flex-row flex-wrap gap-2">
          {categories.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>
      </Field>

      <Field label="Note (optional)">
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholderTextColor="#A39D8E"
          className="font-sans text-[14px] text-ink bg-surface-alt border border-border rounded-input px-3"
          style={{ height: 48 }}
        />
      </Field>

      <View className="gap-2.5 mt-5">
        <Button label="Save Changes" variant="primary" disabled={!hasChanges} onPress={onSave} />
        <Button label="Cancel" variant="muted" onPress={onCancel} />
      </View>
    </View>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-border">
      <Text className="font-sans text-[12.5px] text-ink-muted">{label}</Text>
      {children}
    </View>
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
