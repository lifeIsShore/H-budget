import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

type Item = { id: string; name: string; usageCount: number };

/**
 * Shared by Manage Purposes and Manage Categories — spec calls them out as
 * "identical layout and behavior." Local state only; edits/adds/deletes
 * don't persist (Phase 7). usageCount comes from data/sampleData.ts so the
 * "can't delete — in use" rule is demonstrable now.
 */
export function ManageTaxonomyScreen({
  title,
  initialItems,
  singularLabel,
}: {
  title: string;
  initialItems: Item[];
  singularLabel: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");

  function isDuplicate(name: string, excludeId?: string) {
    const t = name.trim().toLowerCase();
    return items.some((i) => i.id !== excludeId && i.name.toLowerCase() === t);
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditValue(item.name);
  }

  function commitEdit() {
    if (!editingId) return;
    const trimmed = editValue.trim();
    if (trimmed && !isDuplicate(trimmed, editingId)) {
      setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, name: trimmed } : i)));
    }
    setEditingId(null);
  }

  function handleDelete(item: Item) {
    if (items.length <= 1 || item.usageCount > 0) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed || isDuplicate(trimmed)) return;
    setItems((prev) => [...prev, { id: `new-${Date.now()}`, name: trimmed, usageCount: 0 }]);
    setNewName("");
  }

  const addDuplicate = newName.trim().length > 0 && isDuplicate(newName);
  const addDisabled = !newName.trim() || addDuplicate;

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
      </View>

      <View className="px-4 pt-1">
        {items.map((item) => {
          const disabledDelete = items.length <= 1 || item.usageCount > 0;
          return (
            <View
              key={item.id}
              className="flex-row items-center border-b border-border"
              style={{ minHeight: 56 }}
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
                style={{ width: 48, height: 48 }}
                className="items-center justify-center"
              >
                <MaterialIcons name="edit" size={18} color="#6B6659" />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item)}
                disabled={disabledDelete}
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
        })}
      </View>

      <View className="px-4 pt-4 flex-row items-center gap-2">
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder={`New ${singularLabel} name...`}
          placeholderTextColor="#A39D8E"
          className="flex-1 font-sans text-[14px] text-ink bg-surface-alt border border-border rounded-input px-3"
          style={{ height: 44 }}
        />
        <Pressable
          onPress={handleAdd}
          disabled={addDisabled}
          style={{ height: 44 }}
          className={`px-4 rounded-button items-center justify-center border ${
            addDisabled ? "border-border" : "border-brand"
          }`}
        >
          <Text className={`font-sans-medium text-[13px] ${addDisabled ? "text-ink-faint" : "text-brand"}`}>
            Add
          </Text>
        </Pressable>
      </View>
      {addDuplicate && (
        <Text className="px-4 pt-1.5 font-sans text-[11.5px] text-negative">
          This name already exists.
        </Text>
      )}
    </SafeAreaView>
  );
}
