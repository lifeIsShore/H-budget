import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";

type Item = { id: string; name: string; usageCount: number };

/**
 * Shared by Manage Purposes and Manage Categories.
 * Now accepts async onAdd/onEdit/onDelete handlers that persist to SQLite —
 * the parent (purposes.tsx / categories.tsx) passes in the real hook mutations.
 * Local state is kept for optimistic UI; the parent's data reload (via hooks)
 * is what makes the list durable.
 */
export function ManageTaxonomyScreen({
  title,
  items,
  singularLabel,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  items: Item[];
  singularLabel: string;
  loading?: boolean;
  onAdd: (name: string) => Promise<void>;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [addPending, setAddPending] = useState(false);

  function isDuplicate(name: string, excludeId?: string) {
    const t = name.trim().toLowerCase();
    return items.some((i) => i.id !== excludeId && i.name.toLowerCase() === t);
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditValue(item.name);
  }

  async function commitEdit() {
    if (!editingId) return;
    const trimmed = editValue.trim();
    if (trimmed && !isDuplicate(trimmed, editingId)) {
      setPendingId(editingId);
      try {
        await onEdit(editingId, trimmed);
      } finally {
        setPendingId(null);
      }
    }
    setEditingId(null);
  }

  async function handleDelete(item: Item) {
    if (items.length <= 1 || item.usageCount > 0) return;
    setPendingId(item.id);
    try {
      await onDelete(item.id);
    } finally {
      setPendingId(null);
    }
  }

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed || isDuplicate(trimmed)) return;
    setAddPending(true);
    try {
      await onAdd(trimmed);
      setNewName("");
    } finally {
      setAddPending(false);
    }
  }

  const addDuplicate = newName.trim().length > 0 && isDuplicate(newName);
  const addDisabled = !newName.trim() || addDuplicate || addPending;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center px-2 border-b border-border" style={{ height: 56 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{ width: 48, height: 48 }}
          className="items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={22} color="#22211F" />
        </Pressable>
        <Text className="font-sans-semibold text-[17px] text-ink ml-1">{title}</Text>
        {loading && <ActivityIndicator color="#22211F" style={{ marginLeft: "auto", marginRight: 16 }} size="small" />}
      </View>

      <View className="flex-1 px-4 pt-1">
        <FlashList
          data={items}
          estimatedItemSize={56}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <View>
              <View className="pt-4 flex-row items-center gap-2">
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder={`New ${singularLabel} name...`}
                  placeholderTextColor="#A39D8E"
                  className="flex-1 font-sans text-[14px] text-ink bg-surface-alt border border-border rounded-input px-3"
                  style={{ height: 48 }}
                />
                <Pressable
                  onPress={handleAdd}
                  disabled={addDisabled}
                  style={{ height: 48 }}
                  className={`px-4 rounded-button items-center justify-center border ${
                    addDisabled ? "border-border" : "border-brand"
                  }`}
                >
                  {addPending ? (
                    <ActivityIndicator size="small" color="#9C7A3C" />
                  ) : (
                    <Text className={`font-sans-medium text-[13px] ${addDisabled ? "text-ink-faint" : "text-brand"}`}>
                      Add
                    </Text>
                  )}
                </Pressable>
              </View>
              {addDuplicate && (
                <Text className="pt-1.5 font-sans text-[11.5px] text-negative">
                  This name already exists.
                </Text>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const disabledDelete = items.length <= 1 || item.usageCount > 0;
            const isPending = pendingId === item.id;
            return (
              <View
                className="flex-row items-center border-b border-border"
                style={{ minHeight: 56, opacity: isPending ? 0.5 : 1 }}
              >
                {editingId === item.id ? (
                  <TextInput
                    value={editValue}
                    onChangeText={setEditValue}
                    onSubmitEditing={commitEdit}
                    onBlur={commitEdit}
                    autoFocus
                    className="flex-1 font-sans text-[14px] text-ink py-2"
                  />
                ) : (
                  <Text className="flex-1 font-sans text-[14px] text-ink">{item.name}</Text>
                )}
                <Pressable
                  onPress={() => startEdit(item)}
                  hitSlop={8}
                  disabled={isPending}
                  style={{ width: 48, height: 48 }}
                  className="items-center justify-center"
                >
                  <MaterialIcons name="edit" size={18} color="#6B6659" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item)}
                  disabled={disabledDelete || isPending}
                  hitSlop={8}
                  style={{ width: 48, height: 48 }}
                  className="items-center justify-center"
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={18}
                    color={disabledDelete ? "#D8D5CB" : "#B5473A"}
                  />
                </Pressable>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
