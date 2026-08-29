import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Amount } from "@/components/ui/Amount";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ToastProvider";
import { useTransaction } from "@/hooks/useTransactions";
import { usePurposes } from "@/hooks/usePurposes";
import { useCategories } from "@/hooks/useCategories";
import type { TransactionUI } from "@/db/repositories/transactionRepo";

/**
 * Transaction Detail / Edit / Delete — fully wired to SQLite.
 * - View Mode: shows all fields from real data.
 * - Edit Mode: saves via updateTransaction; disabled until something changes.
 * - Delete: calls deleteTransaction, shows Undo toast that actually re-inserts the row.
 */

export default function TransactionDetail() {
  const toast = useToast();
  const { id, edit, confirmDelete } = useLocalSearchParams<{
    id: string;
    edit?: string;
    confirmDelete?: string;
  }>();

  const { transaction: original, loading, edit: saveEdit, remove } = useTransaction(id);
  const { purposes } = usePurposes();
  const { categories } = useCategories();

  const [mode, setMode] = useState<"view" | "edit">(edit === "1" ? "edit" : "view");
  const [showDeleteDialog, setShowDeleteDialog] = useState(confirmDelete === "1");
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [amountText, setAmountText] = useState<string | null>(null);
  const [vendor, setVendor] = useState<string | null>(null);
  const [purposeId, setPurposeId] = useState<string | null | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | null | undefined>(undefined);
  const [note, setNote] = useState<string | null>(null);

  // Use original values as defaults; local state is only set when user edits
  const effectiveAmount = amountText ?? (original ? String(original.amountCents / 100) : "0");
  const effectiveVendor = vendor ?? (original?.vendor ?? "");
  const effectivePurposeId = purposeId === undefined ? original?.purposeId : purposeId;
  const effectiveCategoryId = categoryId === undefined ? original?.categoryId : categoryId;
  const effectiveNote = note ?? (original?.note ?? "");

  const isExpense = original?.type === "expense";
  const numericAmount = parseFloat(effectiveAmount) || 0;
  const amountCentsNew = Math.round(numericAmount * 100);

  const hasChanges = useMemo(() => {
    if (!original) return false;
    return (
      amountCentsNew !== original.amountCents ||
      effectiveVendor !== (original.vendor ?? "") ||
      effectivePurposeId !== original.purposeId ||
      effectiveCategoryId !== original.categoryId ||
      effectiveNote !== (original.note ?? "")
    );
  }, [original, amountCentsNew, effectiveVendor, effectivePurposeId, effectiveCategoryId, effectiveNote]);

  function close() {
    router.back();
  }

  async function handleSave() {
    if (!original || !hasChanges) return;
    setSaving(true);
    try {
      await saveEdit({
        amountCents: amountCentsNew,
        vendor: effectiveVendor || null,
        purposeId: effectivePurposeId ?? null,
        categoryId: effectiveCategoryId ?? null,
        note: effectiveNote || null,
      });
      toast.show("Changes saved");
      close();
    } catch (e) {
      toast.show("Save failed — " + (e instanceof Error ? e.message : "unknown"), {
        tone: "negative",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!original) return;
    setDeleting(true);
    try {
      const { snapshot, undo } = await remove();
      close();
      toast.show(
        `Deleted ${snapshot.vendor ?? "transaction"} — EUR ${(snapshot.amountCents / 100).toFixed(2)}`,
        {
          actionLabel: "Undo",
          tone: "negative",
          onAction: async () => {
            await undo();
          },
        }
      );
    } catch (e) {
      setDeleting(false);
      toast.show("Delete failed — " + (e instanceof Error ? e.message : "unknown"), {
        tone: "negative",
      });
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-[#1C1B1966]" onPress={close} />
        <SafeAreaView edges={["bottom"]} className="bg-surface rounded-t-sheet" style={{ minHeight: 120 }}>
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator color="#22211F" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!original) {
    return (
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-[#1C1B1966]" onPress={close} />
        <SafeAreaView edges={["bottom"]} className="bg-surface rounded-t-sheet">
          <EmptyState icon="receipt-long" title="Transaction not found" />
        </SafeAreaView>
      </View>
    );
  }

  const amountChanged = amountCentsNew !== original.amountCents;
  const delta = Math.abs(amountCentsNew / 100 - original.amountCents / 100);

  return (
    <View className="flex-1 justify-end">
      <Pressable className="absolute inset-0 bg-[#1C1B1966]" onPress={close} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ maxHeight: "80%" }}
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

          <ScrollView className="px-4 pb-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {mode === "view" ? (
              <ViewMode
                transaction={original}
                onEdit={() => setMode("edit")}
                onDelete={() => setShowDeleteDialog(true)}
              />
            ) : (
              <EditMode
                isExpense={isExpense}
                amountText={effectiveAmount}
                setAmountText={setAmountText}
                vendor={effectiveVendor}
                setVendor={setVendor}
                purposeId={effectivePurposeId ?? null}
                setPurposeId={setPurposeId}
                categoryId={effectiveCategoryId ?? null}
                setCategoryId={setCategoryId}
                note={effectiveNote}
                setNote={setNote}
                amountChanged={amountChanged}
                originalAmountCents={original.amountCents}
                newAmountCents={amountCentsNew}
                delta={delta}
                hasChanges={hasChanges}
                saving={saving}
                purposes={purposes}
                categories={categories}
                onCancel={() => setMode("view")}
                onSave={handleSave}
              />
            )}
          </ScrollView>
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
                EUR {(original.amountCents / 100).toFixed(2)}
              </Text>{" "}
              and restore it to your Total Balance
              {original.purposeName ? ` and ${original.purposeName} pool` : ""}.
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
                  {deleting ? (
                    <ActivityIndicator color="#B5473A" size="small" />
                  ) : (
                    <Text className="font-sans-medium text-[14px] text-surface">Delete</Text>
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── View Mode ────────────────────────────────────────────────────────────────

function ViewMode({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: TransactionUI;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isExpense = transaction.type === "expense";
  const createdDate = new Date(transaction.createdAt).toLocaleDateString("en-IE", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const createdTime = new Date(transaction.createdAt).toLocaleTimeString("en-IE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View>
      <View className="items-center mt-1 mb-2">
        <Amount value={transaction.amount} size="hero" />
        <Text className="font-sans text-[12.5px] text-ink-muted mt-1.5">
          {createdDate} at {createdTime}
        </Text>
      </View>

      <View className="h-px bg-border my-3" />

      <DetailRow label="Type">
        <View className="flex-row items-center gap-1.5">
          <View className={`w-2 h-2 rounded-full ${isExpense ? "bg-negative" : "bg-positive"}`} />
          <Text className="font-sans-medium text-[13.5px] text-ink">
            {isExpense ? "Expense" : transaction.type === "income" ? "Income" : "Adjustment"}
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
        {transaction.purposeName ? (
          <View className="bg-surface-alt px-2 py-1 rounded">
            <Text className="font-sans text-[12px] text-ink-muted">{transaction.purposeName}</Text>
          </View>
        ) : (
          <View className="bg-warning-subtle px-2 py-1 rounded">
            <Text className="font-sans text-[12px] text-warning">Unassigned</Text>
          </View>
        )}
      </DetailRow>

      <DetailRow label="Category">
        {transaction.categoryName ? (
          <View className="bg-surface-alt px-2 py-1 rounded">
            <Text className="font-sans text-[12px] text-ink-muted">{transaction.categoryName}</Text>
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
          {createdDate}, {createdTime}
        </Text>
      </DetailRow>

      <View className="gap-2.5 mt-5 mb-2">
        <Button label="Edit Transaction" variant="outline" onPress={onEdit} />
        <Button label="Delete Transaction" variant="ghost" onPress={onDelete} />
      </View>
    </View>
  );
}

// ─── Edit Mode ────────────────────────────────────────────────────────────────

function EditMode({
  isExpense,
  amountText,
  setAmountText,
  vendor,
  setVendor,
  purposeId,
  setPurposeId,
  categoryId,
  setCategoryId,
  note,
  setNote,
  amountChanged,
  originalAmountCents,
  newAmountCents,
  delta,
  hasChanges,
  saving,
  purposes,
  categories,
  onCancel,
  onSave,
}: {
  isExpense: boolean;
  amountText: string;
  setAmountText: (v: string) => void;
  vendor: string;
  setVendor: (v: string) => void;
  purposeId: string | null;
  setPurposeId: (v: string | null) => void;
  categoryId: string | null;
  setCategoryId: (v: string | null) => void;
  note: string;
  setNote: (v: string) => void;
  amountChanged: boolean;
  originalAmountCents: number;
  newAmountCents: number;
  delta: number;
  hasChanges: boolean;
  saving: boolean;
  purposes: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  onCancel: () => void;
  onSave: () => void;
}) {
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
          <Text className="font-sans text-[12.5px] text-ink leading-5">
            Changing from EUR {(originalAmountCents / 100).toFixed(2)} to EUR{" "}
            {(newAmountCents / 100).toFixed(2)} will adjust your balance by EUR {delta.toFixed(2)}.
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
            <Chip
              key={p.id}
              label={p.name}
              selected={purposeId === p.id}
              onPress={() => setPurposeId(p.id)}
            />
          ))}
          <Chip
            label="Unassigned"
            dashed
            tone="warning"
            selected={purposeId === null}
            onPress={() => setPurposeId(null)}
          />
        </View>
      </Field>

      <Field label="Category">
        <View className="flex-row flex-wrap gap-2">
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              selected={categoryId === c.id}
              onPress={() => setCategoryId(c.id)}
            />
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

      <View className="gap-2.5 mt-5 mb-2">
        <Button
          label="Save Changes"
          variant="primary"
          disabled={!hasChanges || saving}
          loading={saving}
          onPress={onSave}
        />
        <Button label="Cancel" variant="muted" onPress={onCancel} />
      </View>
    </View>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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
