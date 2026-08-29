import React, { useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { Amount } from "@/components/ui/Amount";
import type { TransactionUI } from "@/db/repositories/transactionRepo";

/**
 * Swipe left → delete reveal (negative). Swipe right → edit reveal (brand,
 * standing in for the spec's "blue" panel — the app has no blue in its
 * palette, brand/ink is the equivalent primary-action color here).
 */
export const SwipeableTransactionRow = React.memo(function SwipeableTransactionRow({
  transaction,
  onPress,
  onEdit,
  onDelete,
}: {
  transaction: TransactionUI;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const isExpense = transaction.type === "expense";

  return (
    <Swipeable
      ref={swipeRef}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={(_progress, dragX) => (
        <RevealAction
          dragX={dragX}
          side="left"
          color="#22211F"
          icon="edit"
          onPress={() => {
            swipeRef.current?.close();
            onEdit?.();
          }}
        />
      )}
      renderRightActions={(_progress, dragX) => (
        <RevealAction
          dragX={dragX}
          side="right"
          color="#B5473A"
          icon="delete-outline"
          onPress={() => {
            swipeRef.current?.close();
            onDelete?.();
          }}
        />
      )}
    >
      <Pressable
        onPress={onPress}
        className="flex-row items-center bg-surface px-4 active:opacity-70"
        style={{ minHeight: 72 }}
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

        <View className="flex-1 py-2.5 border-b border-border">
          <Text
            numberOfLines={1}
            className={`font-sans-medium text-[15px] ${
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
              <Text className="font-sans text-[11px] text-ink-muted">
                {transaction.categoryName}
              </Text>
            )}
          </View>
        </View>

        <View className="items-end pb-2.5 border-b border-border" style={{ marginLeft: 8 }}>
          <Amount value={transaction.amount} size="row" />
          <Text className="font-sans text-[10px] text-ink-faint mt-0.5">
            {new Date(transaction.date + "T00:00:00").toLocaleDateString("en-IE", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
});

function RevealAction({
  dragX,
  side,
  color,
  icon,
  onPress,
}: {
  dragX: Animated.AnimatedInterpolation<number>;
  side: "left" | "right";
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}) {
  const scale = dragX.interpolate({
    inputRange: side === "left" ? [0, 80] : [-80, 0],
    outputRange: side === "left" ? [0.6, 1] : [1, 0.6],
    extrapolate: "clamp",
  });

  return (
    <Pressable
      onPress={onPress}
      style={{ width: 80, backgroundColor: color }}
      className="items-center justify-center"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialIcons name={icon} size={22} color="#FAF9F6" />
      </Animated.View>
    </Pressable>
  );
}
